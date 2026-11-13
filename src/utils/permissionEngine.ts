/**
 * Honest Hardware Permission & Device Telemetry Inspector
 * Never spoofs unsupported APIs (e.g. MediaProjection on mobile WebView).
 */

export type PermissionStateValue = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface DeviceCapabilitiesReport {
  cameraPermission: PermissionStateValue;
  microphonePermission: PermissionStateValue;
  cameraSupported: boolean;
  screenShareSupported: boolean;
  speechRecognitionSupported: boolean;
  webCryptoSupported: boolean;
  networkType: string;
  downlinkMbps: number | null;
  rttMs: number | null;
  storageUsedMb: number | null;
  storageQuotaMb: number | null;
  cpuCores: number;
}

async function queryPermission(name: 'camera' | 'microphone'): Promise<PermissionStateValue> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'prompt';
  }
  try {
    const status = await navigator.permissions.query({ name: name as PermissionName });
    return status.state;
  } catch {
    return 'prompt';
  }
}

export async function inspectDeviceCapabilities(): Promise<DeviceCapabilitiesReport> {
  const cameraSupported = Boolean(
    typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia
  );
  const screenShareSupported = Boolean(
    typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === 'function'
  );
  const speechRecognitionSupported = Boolean(
    typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  );
  const webCryptoSupported = Boolean(
    typeof window !== 'undefined' && window.crypto && window.crypto.subtle
  );

  const [cameraPermission, microphonePermission] = await Promise.all([
    cameraSupported ? queryPermission('camera') : Promise.resolve<PermissionStateValue>('unsupported'),
    cameraSupported ? queryPermission('microphone') : Promise.resolve<PermissionStateValue>('unsupported'),
  ]);

  const conn = typeof navigator !== 'undefined' ? (navigator as any).connection : undefined;
  const networkType = conn?.effectiveType ? String(conn.effectiveType).toUpperCase() : '4G/WIFI';
  const downlinkMbps = typeof conn?.downlink === 'number' ? conn.downlink : null;
  const rttMs = typeof conn?.rtt === 'number' ? conn.rtt : null;

  let storageUsedMb: number | null = null;
  let storageQuotaMb: number | null = null;
  if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate();
      if (typeof est.usage === 'number') {
        storageUsedMb = Number((est.usage / (1024 * 1024)).toFixed(2));
      }
      if (typeof est.quota === 'number') {
        storageQuotaMb = Math.round(est.quota / (1024 * 1024));
      }
    } catch {
      // Ignore storage estimate failure
    }
  }

  return {
    cameraPermission,
    microphonePermission,
    cameraSupported,
    screenShareSupported,
    speechRecognitionSupported,
    webCryptoSupported,
    networkType,
    downlinkMbps,
    rttMs,
    storageUsedMb,
    storageQuotaMb,
    cpuCores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
  };
}
