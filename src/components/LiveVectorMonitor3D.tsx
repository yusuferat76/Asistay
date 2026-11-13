import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Activity,
  Cpu,
  Lock,
  Maximize2,
  Minimize2,
  Network,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Wifi,
  X,
} from 'lucide-react';
import { AgentTelemetry, agentManager } from '../utils/AgentManager';
import { playTacticalSound } from '../utils/audioEffects';
import { triggerHaptic } from '../utils/haptics';
import { encryptBufferAesGcm } from '../utils/quantumCryptoEngine';

export type VectorFilterMode = 'all' | 'processes' | 'traffic' | 'encrypted';

export interface LiveProcessNode {
  id: string;
  pid: number;
  name: string;
  codeName: string;
  role: string;
  category: 'kernel' | 'defense' | 'crypto' | 'network' | 'sensor' | 'external';
  status: 'nominal' | 'encrypted' | 'scanning' | 'alert' | 'isolated';
  cpuPercent: number;
  ramMb: number;
  threads: number;
  port: string;
  protocol: string;
  pps: number;
  throughputMbps: number;
  integrity: number;
  basePosition: [number, number, number];
  details: string;
  recentLogs: string[];
}

export interface LiveTrafficLink {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  protocol: string;
  cipher: string;
  direction: 'inbound' | 'outbound' | 'bidirectional';
  bandwidthMbps: number;
  pps: number;
  latencyMs: number;
  riskLevel: 'nominal' | 'encrypted' | 'warning' | 'blocked';
  endpoint: string;
}

interface LiveVectorMonitor3DProps {
  agentsTelemetry?: AgentTelemetry[];
  stealthMode?: boolean;
  isCameraActive?: boolean;
  isScreenShareActive?: boolean;
  isMicMuted?: boolean;
  onAskAssistant?: (prompt: string) => void;
  compact?: boolean;
}

const STATUS_HEX: Record<LiveProcessNode['status'], number> = {
  nominal: 0x38bdf8,
  encrypted: 0x10b981,
  scanning: 0x60a5fa,
  alert: 0xf43f5e,
  isolated: 0xf59e0b,
};

const LINK_HEX: Record<LiveTrafficLink['riskLevel'], number> = {
  nominal: 0x38bdf8,
  encrypted: 0x10b981,
  warning: 0xf59e0b,
  blocked: 0xef4444,
};

const INITIAL_PROCESSES: LiveProcessNode[] = [
  {
    id: 'proc-kernel',
    pid: 1001,
    name: 'Asistay Çekirdek',
    codeName: 'KERNEL_ORCHESTRATOR',
    role: 'Ana Otonom Sistem & Vektör Yönlendirici',
    category: 'kernel',
    status: 'nominal',
    cpuPercent: 14.2,
    ramMb: 412,
    threads: 24,
    port: 'LOCAL:0',
    protocol: 'IPC / eBPF-Ring',
    pps: 4820,
    throughputMbps: 186.4,
    integrity: 99.99,
    basePosition: [0, 0.25, 0],
    details: 'Tüm savunma ajanları, ses motoru ve bellek tamponları arasında sıfır-kopya telemetri yönlendirmesi sağlar.',
    recentLogs: [
      '[00:01] eBPF halka arabelleği senkronize edildi.',
      '[00:04] Bellek bütünlüğü SHA-256 doğrulandı.',
    ],
  },
  {
    id: 'proc-sentinel',
    pid: 1042,
    name: 'Sentinel-X DPI',
    codeName: 'SENTINEL_DPI_ENGINE',
    role: 'Derin Paket Analizi & Soket Muhafızı',
    category: 'defense',
    status: 'scanning',
    cpuPercent: 19.6,
    ramMb: 284,
    threads: 16,
    port: 'ETH0:443,8443',
    protocol: 'TCP / QUIC DPI',
    pps: 3150,
    throughputMbps: 124.8,
    integrity: 99.95,
    basePosition: [-3.2, 0.9, -1.5],
    details: 'Gelen/giden tüm TCP ve QUIC akışlarını imzasız C2 beacon kalıplarına karşı gerçek zamanlı tarar.',
    recentLogs: [
      '[DPI] 3150 paket/sn aktif olarak inceleniyor.',
      '[SHIELD] ARP spoofing vektörü sıfırlandı.',
    ],
  },
  {
    id: 'proc-guardian',
    pid: 1188,
    name: 'Guardian-V PQC',
    codeName: 'GUARDIAN_MLKEM_VAULT',
    role: 'Kuantum Dirençli Bellek & Anahtar Kasası',
    category: 'crypto',
    status: 'encrypted',
    cpuPercent: 11.4,
    ramMb: 196,
    threads: 12,
    port: 'TEE:HSM',
    protocol: 'ML-KEM-1024 / AES-GCM',
    pps: 1940,
    throughputMbps: 92.1,
    integrity: 100,
    basePosition: [3.1, 1.05, -1.4],
    details: 'Oturum anahtarlarını NIST ML-KEM-1024 ve AES-256-GCM ile şifreleyerek bellek dökümü girişimlerini bozar.',
    recentLogs: [
      '[VAULT] ML-KEM-1024 anahtar değişimi tamamlandı.',
      '[TEE] RAM kasa mühürlü.',
    ],
  },
  {
    id: 'proc-ghost',
    pid: 1310,
    name: 'Ghost-S Tüneli',
    codeName: 'GHOST_ONION_ROUTER',
    role: 'Çok Katmanlı VPN & Parmak İzi Maskeleme',
    category: 'network',
    status: 'encrypted',
    cpuPercent: 9.8,
    ramMb: 158,
    threads: 8,
    port: 'WG0:51820',
    protocol: 'WireGuard + Obfs4',
    pps: 2290,
    throughputMbps: 78.5,
    integrity: 99.92,
    basePosition: [3.2, -0.3, 2.2],
    details: 'Trafiği çok duraklı şifreli tünel üzerinden aktararak IP, WebRTC ve TLS parmak izlerini maskeler.',
    recentLogs: [
      '[HOP] Zürih düğümü gecikmesi 18 ms.',
      '[MASK] Sentetik TLS parmak izi aktif.',
    ],
  },
  {
    id: 'proc-cipher',
    pid: 2048,
    name: 'Şifre Kırıcı & Entropi',
    codeName: 'CIPHER_ENTROPY_CORE',
    role: 'Hash Analiz & Kuantum Dayanıklılık Motoru',
    category: 'crypto',
    status: 'nominal',
    cpuPercent: 16.5,
    ramMb: 340,
    threads: 18,
    port: 'IPC:9091',
    protocol: 'Argon2id / SHA-3',
    pps: 1410,
    throughputMbps: 54.0,
    integrity: 99.97,
    basePosition: [-3.0, -0.35, 2.3],
    details: 'Parola entropisini, anahtar uzayı karmaşıklığını ve kaba kuvvet dayanım süresini anlık hesaplar.',
    recentLogs: [
      '[ENTROPY] 256-bit kuantum dayanım testi hazır.',
      '[HASH] Rainbow tablo eşleşmesi yok.',
    ],
  },
  {
    id: 'proc-vision',
    pid: 2490,
    name: 'AI Optik & Ses Kanalı',
    codeName: 'VISION_AUDIO_PIPELINE',
    role: 'Kamera, Canlı Ekran & Ultra TTS Akışı',
    category: 'sensor',
    status: 'nominal',
    cpuPercent: 8.3,
    ramMb: 228,
    threads: 10,
    port: 'MEDIA:RTC',
    protocol: 'WebRTC SRTP / PCM',
    pps: 980,
    throughputMbps: 41.2,
    integrity: 99.98,
    basePosition: [0.0, 2.35, -2.1],
    details: 'Sesli komut algılama, kamera optik akışı ve düşük gecikmeli yapay zeka ses sentezini izler.',
    recentLogs: [
      '[AUDIO] Web Speech komut hattı beklemede.',
      '[PRIVACY] Medya akış izinleri doğrulandı.',
    ],
  },
  {
    id: 'proc-gateway',
    pid: 3012,
    name: 'WebDev API Ağ Geçidi',
    codeName: 'EXPRESS_TLS_BRIDGE',
    role: 'Dış API, GitHub & Android Paket Köprüsü',
    category: 'network',
    status: 'nominal',
    cpuPercent: 6.1,
    ramMb: 174,
    threads: 8,
    port: 'TCP:3000',
    protocol: 'HTTPS / TLS 1.3',
    pps: 1120,
    throughputMbps: 62.7,
    integrity: 99.94,
    basePosition: [0.0, -0.75, 3.45],
    details: 'Port 3000 üzerindeki Express API uçlarını, GitHub kaynak senkronizasyonunu ve TWA APK paketleyiciyi yönetir.',
    recentLogs: [
      '[API] /api/github/repo önbelleği güncel.',
      '[TLS] TLS 1.3 OCSP stapling aktif.',
    ],
  },
  {
    id: 'proc-rogue',
    pid: 4419,
    name: 'Dış Soket Probu',
    codeName: 'EXTERNAL_PROBE_VECTOR',
    role: 'İzlenen Dış ASN & Port Tarama Vektörü',
    category: 'external',
    status: 'alert',
    cpuPercent: 3.4,
    ramMb: 64,
    threads: 2,
    port: 'WAN:198.51.x:4444',
    protocol: 'RAW SYN / UDP Probe',
    pps: 410,
    throughputMbps: 14.9,
    integrity: 42.0,
    basePosition: [0.0, 1.85, 3.3],
    details: 'Dış ağdan gelen periyodik port yoklama girişimlerini temsil eden karantina adayı vektör noktası.',
    recentLogs: [
      '[WARN] 198.51.100.77 kaynaklı SYN yoklaması saptandı.',
      '[DROP] Sentinel-X hız sınırlaması devrede.',
    ],
  },
];

const INITIAL_LINKS: LiveTrafficLink[] = [
  {
    id: 'link-kernel-sentinel',
    sourceId: 'proc-kernel',
    targetId: 'proc-sentinel',
    label: 'eBPF Paket Akışı',
    protocol: 'Zero-Copy Ring',
    cipher: 'ChaCha20-Poly1305',
    direction: 'bidirectional',
    bandwidthMbps: 124.8,
    pps: 3150,
    latencyMs: 0.4,
    riskLevel: 'nominal',
    endpoint: 'kernel0 -> sentinel-dpi',
  },
  {
    id: 'link-kernel-guardian',
    sourceId: 'proc-kernel',
    targetId: 'proc-guardian',
    label: 'PQC Anahtar Kasası',
    protocol: 'ML-KEM-1024',
    cipher: 'FIPS-203 + AES-256-GCM',
    direction: 'bidirectional',
    bandwidthMbps: 92.1,
    pps: 1940,
    latencyMs: 0.7,
    riskLevel: 'encrypted',
    endpoint: 'kernel0 -> tee-hsm',
  },
  {
    id: 'link-kernel-ghost',
    sourceId: 'proc-kernel',
    targetId: 'proc-ghost',
    label: 'Anonim Onion Tüneli',
    protocol: 'WireGuard',
    cipher: 'Curve25519 + XChaCha20',
    direction: 'outbound',
    bandwidthMbps: 78.5,
    pps: 2290,
    latencyMs: 14.2,
    riskLevel: 'encrypted',
    endpoint: 'wg0 -> zurich-node-03',
  },
  {
    id: 'link-kernel-cipher',
    sourceId: 'proc-kernel',
    targetId: 'proc-cipher',
    label: 'Entropi & Hash Kanalı',
    protocol: 'gRPC / IPC',
    cipher: 'TLS 1.3 + ML-DSA',
    direction: 'bidirectional',
    bandwidthMbps: 54.0,
    pps: 1410,
    latencyMs: 0.9,
    riskLevel: 'nominal',
    endpoint: 'kernel0 -> cipher-core',
  },
  {
    id: 'link-kernel-vision',
    sourceId: 'proc-kernel',
    targetId: 'proc-vision',
    label: 'Optik & Ses Akışı',
    protocol: 'WebRTC SRTP',
    cipher: 'DTLS-SRTP AES-128',
    direction: 'bidirectional',
    bandwidthMbps: 41.2,
    pps: 980,
    latencyMs: 1.8,
    riskLevel: 'nominal',
    endpoint: 'rtc0 -> vision-audio',
  },
  {
    id: 'link-sentinel-gateway',
    sourceId: 'proc-sentinel',
    targetId: 'proc-gateway',
    label: 'Filtreli API Trafiği',
    protocol: 'HTTPS / HTTP2',
    cipher: 'TLS 1.3 X25519Kyber768',
    direction: 'bidirectional',
    bandwidthMbps: 62.7,
    pps: 1120,
    latencyMs: 3.1,
    riskLevel: 'encrypted',
    endpoint: 'dpi0 -> tcp:3000',
  },
  {
    id: 'link-guardian-ghost',
    sourceId: 'proc-guardian',
    targetId: 'proc-ghost',
    label: 'Anahtar Rotasyonu',
    protocol: 'Rekey Sync',
    cipher: 'ML-KEM-1024',
    direction: 'outbound',
    bandwidthMbps: 18.4,
    pps: 520,
    latencyMs: 2.3,
    riskLevel: 'encrypted',
    endpoint: 'vault -> wg0-rekey',
  },
  {
    id: 'link-rogue-sentinel',
    sourceId: 'proc-rogue',
    targetId: 'proc-sentinel',
    label: 'Şüpheli Dış Prob',
    protocol: 'RAW SYN / UDP',
    cipher: 'Şifresiz (İnceleniyor)',
    direction: 'inbound',
    bandwidthMbps: 14.9,
    pps: 410,
    latencyMs: 42.5,
    riskLevel: 'warning',
    endpoint: '198.51.100.77:4444 -> eth0',
  },
  {
    id: 'link-rogue-gateway',
    sourceId: 'proc-rogue',
    targetId: 'proc-gateway',
    label: 'Giriş Denemesi (Kalkanlı)',
    protocol: 'TCP Probe',
    cipher: 'Engellenmiş Soket',
    direction: 'inbound',
    bandwidthMbps: 4.2,
    pps: 145,
    latencyMs: 58.0,
    riskLevel: 'blocked',
    endpoint: '198.51.100.77 -> tcp:3000',
  },
];

function detectSoftwareGl(): boolean {
  try {
    const testCanvas = document.createElement('canvas');
    const gl =
      (testCanvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (testCanvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return true;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (!dbg) return false;
    const rendererStr = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '');
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
  } catch {
    return false;
  }
}

function makeAfterDrawScheduler(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean,
  onTick: () => void
) {
  let cancelled = false;
  let rafId = 0;

  if (!isSoftwareGl) {
    const loop = () => {
      if (cancelled) return;
      onTick();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }

  const gl = renderer.getContext() as WebGL2RenderingContext;
  const hasSync = typeof gl?.fenceSync === 'function' && typeof gl?.clientWaitSync === 'function';

  const scheduleNext = () => {
    if (cancelled) return;
    if (!hasSync) {
      rafId = requestAnimationFrame(() => {
        if (cancelled) return;
        onTick();
        scheduleNext();
      });
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) {
      rafId = requestAnimationFrame(() => {
        if (cancelled) return;
        onTick();
        scheduleNext();
      });
      return;
    }
    const checkFence = () => {
      if (cancelled) {
        gl.deleteSync(sync);
        return;
      }
      const res = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0);
      if (res === gl.TIMEOUT_EXPIRED) {
        rafId = requestAnimationFrame(checkFence);
        return;
      }
      gl.deleteSync(sync);
      onTick();
      scheduleNext();
    };
    rafId = requestAnimationFrame(checkFence);
  };

  rafId = requestAnimationFrame(() => {
    if (cancelled) return;
    onTick();
    scheduleNext();
  });

  return () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
  };
}

export const LiveVectorMonitor3D: React.FC<LiveVectorMonitor3DProps> = ({
  agentsTelemetry = [],
  stealthMode = false,
  isCameraActive = false,
  isScreenShareActive = false,
  isMicMuted = false,
  onAskAssistant,
  compact = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [processes, setProcesses] = useState<LiveProcessNode[]>(INITIAL_PROCESSES);
  const [links, setLinks] = useState<LiveTrafficLink[]>(INITIAL_LINKS);
  const [filterMode, setFilterMode] = useState<VectorFilterMode>('all');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>('proc-kernel');
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<{
    id: string;
    title: string;
    subtitle: string;
    x: number;
    y: number;
  } | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [isolatedIds, setIsolatedIds] = useState<Record<string, boolean>>({});
  const [rekeyBoostUntil, setRekeyBoostUntil] = useState<number>(0);
  const [resetViewTrigger, setResetViewTrigger] = useState<number>(0);

  // Sync live telemetry and external states into process/link state cleanly
  useEffect(() => {
    const interval = setInterval(() => {
      const sentinelAgent = agentsTelemetry.find((a) => a.agentId === 'sentinel-x');
      const guardianAgent = agentsTelemetry.find((a) => a.agentId === 'guardian-v');
      const ghostAgent = agentsTelemetry.find((a) => a.agentId === 'ghost-s');
      const now = Date.now();
      const boosted = now < rekeyBoostUntil;

      setProcesses((prev) =>
        prev.map((proc) => {
          const isIso = !!isolatedIds[proc.id];
          if (isIso) {
            return {
              ...proc,
              status: 'isolated',
              pps: Math.max(0, Math.round(proc.pps * 0.15)),
              throughputMbps: Number((proc.throughputMbps * 0.12).toFixed(1)),
              cpuPercent: Number(Math.max(0.4, proc.cpuPercent * 0.3).toFixed(1)),
            };
          }

          const jitter = (base: number, span: number) =>
            Number(Math.max(0.5, base + (Math.random() - 0.5) * span).toFixed(1));

          if (proc.id === 'proc-sentinel' && sentinelAgent) {
            return {
              ...proc,
              status: sentinelAgent.status === 'alert' ? 'alert' : sentinelAgent.status === 'defending' ? 'encrypted' : 'scanning',
              cpuPercent: jitter(sentinelAgent.status === 'alert' ? 29.4 : 18.8, 3.2),
              pps: Math.round(3000 + Math.random() * 650),
              throughputMbps: jitter(128, 18),
              recentLogs: sentinelAgent.logs.slice(-3).length > 0 ? sentinelAgent.logs.slice(-3) : proc.recentLogs,
            };
          }
          if (proc.id === 'proc-guardian' && guardianAgent) {
            return {
              ...proc,
              status: guardianAgent.status === 'alert' ? 'alert' : 'encrypted',
              cpuPercent: jitter(boosted ? 24.5 : 11.4, 2.4),
              pps: Math.round((boosted ? 3400 : 1900) + Math.random() * 380),
              throughputMbps: jitter(boosted ? 155 : 92, 12),
              recentLogs: guardianAgent.logs.slice(-3).length > 0 ? guardianAgent.logs.slice(-3) : proc.recentLogs,
            };
          }
          if (proc.id === 'proc-ghost') {
            return {
              ...proc,
              status: stealthMode || ghostAgent?.status !== 'alert' ? 'encrypted' : 'alert',
              cpuPercent: jitter(stealthMode ? 14.5 : 9.4, 1.8),
              pps: Math.round((stealthMode ? 3100 : 2200) + Math.random() * 340),
              throughputMbps: jitter(stealthMode ? 112 : 78, 10),
              recentLogs: ghostAgent?.logs.slice(-3).length ? ghostAgent.logs.slice(-3) : proc.recentLogs,
            };
          }
          if (proc.id === 'proc-vision') {
            const mediaHot = isCameraActive || isScreenShareActive;
            return {
              ...proc,
              status: isMicMuted ? 'isolated' : mediaHot ? 'scanning' : 'nominal',
              cpuPercent: jitter(mediaHot ? 21.8 : 7.9, 2.1),
              pps: Math.round((mediaHot ? 2650 : 880) + Math.random() * 240),
              throughputMbps: jitter(mediaHot ? 96.4 : 34.2, 8),
            };
          }
          if (proc.id === 'proc-rogue') {
            return {
              ...proc,
              status: stealthMode ? 'isolated' : 'alert',
              pps: Math.round((stealthMode ? 85 : 390) + Math.random() * 140),
              throughputMbps: jitter(stealthMode ? 2.4 : 14.5, 4),
            };
          }
          return {
            ...proc,
            cpuPercent: jitter(proc.cpuPercent, 1.8),
            pps: Math.max(120, Math.round(proc.pps + (Math.random() - 0.5) * 180)),
            throughputMbps: jitter(proc.throughputMbps, 6.5),
          };
        })
      );

      setLinks((prev) =>
        prev.map((lnk) => {
          const isIso = !!isolatedIds[lnk.sourceId] || !!isolatedIds[lnk.targetId] || !!isolatedIds[lnk.id];
          if (isIso) {
            return {
              ...lnk,
              riskLevel: 'blocked',
              pps: Math.max(12, Math.round(lnk.pps * 0.08)),
              bandwidthMbps: Number(Math.max(0.4, lnk.bandwidthMbps * 0.06).toFixed(1)),
            };
          }
          return {
            ...lnk,
            pps: Math.max(60, Math.round(lnk.pps + (Math.random() - 0.5) * 160)),
            bandwidthMbps: Number(Math.max(1.2, lnk.bandwidthMbps + (Math.random() - 0.5) * 7.5).toFixed(1)),
            latencyMs: Number(Math.max(0.2, lnk.latencyMs + (Math.random() - 0.5) * 0.6).toFixed(1)),
          };
        })
      );
    }, 1250);

    return () => clearInterval(interval);
  }, [agentsTelemetry, isolatedIds, isCameraActive, isMicMuted, isScreenShareActive, rekeyBoostUntil, stealthMode]);

  // Keep refs of latest reactive scene states for WebGL loop without recreating WebGL context
  const stateRef = useRef({
    processes,
    links,
    filterMode,
    autoRotate,
    selectedProcessId,
    selectedLinkId,
    rekeyBoostUntil,
    isolatedIds,
  });
  stateRef.current = {
    processes,
    links,
    filterMode,
    autoRotate,
    selectedProcessId,
    selectedLinkId,
    rekeyBoostUntil,
    isolatedIds,
  };

  const cameraResetRef = useRef<(() => void) | null>(null);
  const focusTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.35, 0));

  useEffect(() => {
    if (resetViewTrigger > 0 && cameraResetRef.current) {
      cameraResetRef.current();
    }
  }, [resetViewTrigger]);

  // Focus camera gently on clicked node / link midpoint
  useEffect(() => {
    if (selectedProcessId) {
      const p = processes.find((item) => item.id === selectedProcessId);
      if (p) {
        focusTargetRef.current.set(p.basePosition[0] * 0.45, p.basePosition[1] * 0.45 + 0.2, p.basePosition[2] * 0.45);
      }
    } else if (selectedLinkId) {
      const l = links.find((item) => item.id === selectedLinkId);
      if (l) {
        const s = processes.find((p) => p.id === l.sourceId);
        const t = processes.find((p) => p.id === l.targetId);
        if (s && t) {
          focusTargetRef.current.set(
            ((s.basePosition[0] + t.basePosition[0]) * 0.5) * 0.45,
            ((s.basePosition[1] + t.basePosition[1]) * 0.5) * 0.45 + 0.35,
            ((s.basePosition[2] + t.basePosition[2]) * 0.5) * 0.45
          );
        }
      }
    }
  }, [selectedProcessId, selectedLinkId, processes, links]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 260);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x01040b);
    scene.fog = new THREE.FogExp2(0x01040b, 0.042);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    const initialCamPos = new THREE.Vector3(0.4, 4.9, 8.8);
    camera.position.copy(initialCamPos);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Architectural studio PBR reflection environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x93c5fd, 0.45);
    scene.add(ambientLight);
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.45);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x6366f1, 0.9);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 4.2;
    controls.maxDistance = 16.5;
    controls.maxPolarAngle = Math.PI * 0.485;
    controls.minPolarAngle = 0.25;
    controls.target.set(0, 0.35, 0);

    cameraResetRef.current = () => {
      camera.position.copy(initialCamPos);
      focusTargetRef.current.set(0, 0.35, 0);
      controls.target.set(0, 0.35, 0);
      controls.update();
    };

    // Disposables tracker
    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Tactical Ground Polar Grid + Concentric Radar Vector Rings
    const floorGroup = new THREE.Group();
    floorGroup.position.y = -1.65;
    scene.add(floorGroup);

    const gridHelper = new THREE.PolarGridHelper(6.4, 12, 5, 64, 0x1e3a8a, 0x0f2554);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.48;
    floorGroup.add(gridHelper);
    track(gridHelper.geometry);
    if (Array.isArray(gridHelper.material)) {
      gridHelper.material.forEach((m) => track(m));
    } else {
      track(gridHelper.material);
    }

    // Outer vector floor perimeter ring
    const floorRingGeo = track(new THREE.RingGeometry(5.65, 5.72, 96));
    const floorRingMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      })
    );
    const floorRing = new THREE.Mesh(floorRingGeo, floorRingMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.01;
    floorGroup.add(floorRing);

    // Sweeping radar vector spoke
    const sweepGeo = track(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(5.65, 0.02, 0),
      ])
    );
    const sweepMat = track(
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
    );
    const sweepLine = new THREE.Line(sweepGeo, sweepMat);
    floorGroup.add(sweepLine);

    // Shared geometries for process node multi-part assemblies
    const kernelOctGeo = track(new THREE.OctahedronGeometry(0.56, 0));
    const kernelCageGeo = track(new THREE.IcosahedronGeometry(0.88, 1));
    const kernelCageEdges = track(new THREE.EdgesGeometry(kernelCageGeo, 1));
    const kernelRingGeo1 = track(new THREE.TorusGeometry(1.18, 0.018, 10, 64));
    const kernelRingGeo2 = track(new THREE.TorusGeometry(1.42, 0.015, 10, 64));

    const nodeOuterGeo = track(new THREE.IcosahedronGeometry(0.46, 0));
    const nodeEdgesGeo = track(new THREE.EdgesGeometry(nodeOuterGeo, 1));
    const nodeCoreGeo = track(new THREE.OctahedronGeometry(0.24, 0));
    const nodeRingGeo = track(new THREE.TorusGeometry(0.62, 0.014, 8, 40));
    const nodeProxyGeo = track(new THREE.SphereGeometry(0.76, 12, 12));
    const nodeProxyMat = track(new THREE.MeshBasicMaterial({ visible: false }));

    // Build clickable multi-part 3D Process Node Groups
    const raycastTargets: THREE.Object3D[] = [];

    interface ProcessMeshEntry {
      id: string;
      group: THREE.Group;
      coreMesh: THREE.Mesh;
      wireLines: THREE.LineSegments;
      ringMesh: THREE.Mesh;
      extraRingMesh?: THREE.Mesh;
      pylonLine: THREE.Line;
      coreMat: THREE.MeshStandardMaterial;
      wireMat: THREE.LineBasicMaterial;
      ringMat: THREE.MeshBasicMaterial;
      pylonMat: THREE.LineBasicMaterial;
      basePos: THREE.Vector3;
    }

    const processEntries = new Map<string, ProcessMeshEntry>();

    INITIAL_PROCESSES.forEach((proc) => {
      const group = new THREE.Group();
      const basePos = new THREE.Vector3(...proc.basePosition);
      group.position.copy(basePos);
      scene.add(group);

      const isKernel = proc.id === 'proc-kernel';
      const initialHex = STATUS_HEX[proc.status];

      const coreMat = track(
        new THREE.MeshStandardMaterial({
          color: initialHex,
          emissive: initialHex,
          emissiveIntensity: isKernel ? 0.85 : 0.55,
          roughness: 0.22,
          metalness: 0.78,
        })
      );
      const wireMat = track(
        new THREE.LineBasicMaterial({
          color: initialHex,
          transparent: true,
          opacity: 0.9,
        })
      );
      const ringMat = track(
        new THREE.MeshBasicMaterial({
          color: initialHex,
          transparent: true,
          opacity: 0.55,
        })
      );

      const coreMesh = new THREE.Mesh(isKernel ? kernelOctGeo : nodeCoreGeo, coreMat);
      group.add(coreMesh);

      const wireLines = new THREE.LineSegments(
        isKernel ? kernelCageEdges : nodeEdgesGeo,
        wireMat
      );
      group.add(wireLines);

      const ringMesh = new THREE.Mesh(isKernel ? kernelRingGeo1 : nodeRingGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.4;
      group.add(ringMesh);

      let extraRingMesh: THREE.Mesh | undefined;
      if (isKernel) {
        extraRingMesh = new THREE.Mesh(kernelRingGeo2, ringMat);
        extraRingMesh.rotation.y = Math.PI / 3;
        extraRingMesh.rotation.x = -Math.PI / 4;
        group.add(extraRingMesh);
      }

      // Vertical vector anchor pylon down to tactical floor grid
      const pylonPts = [
        new THREE.Vector3(basePos.x, basePos.y - (isKernel ? 0.9 : 0.48), basePos.z),
        new THREE.Vector3(basePos.x, -1.64, basePos.z),
      ];
      const pylonGeo = track(new THREE.BufferGeometry().setFromPoints(pylonPts));
      const pylonMat = track(
        new THREE.LineBasicMaterial({
          color: initialHex,
          transparent: true,
          opacity: 0.35,
        })
      );
      const pylonLine = new THREE.Line(pylonGeo, pylonMat);
      scene.add(pylonLine);

      // Floor anchor disc
      const discGeo = track(new THREE.RingGeometry(0.12, 0.24, 24));
      const discMesh = new THREE.Mesh(discGeo, ringMat);
      discMesh.rotation.x = -Math.PI / 2;
      discMesh.position.set(basePos.x, -1.63, basePos.z);
      scene.add(discMesh);

      // Raycast collision proxy sphere (invisible, clean)
      const proxyMesh = new THREE.Mesh(nodeProxyGeo, nodeProxyMat);
      if (isKernel) proxyMesh.scale.setScalar(1.45);
      proxyMesh.userData = { kind: 'process', id: proc.id };
      group.add(proxyMesh);
      raycastTargets.push(proxyMesh);

      processEntries.set(proc.id, {
        id: proc.id,
        group,
        coreMesh,
        wireLines,
        ringMesh,
        extraRingMesh,
        pylonLine,
        coreMat,
        wireMat,
        ringMat,
        pylonMat,
        basePos,
      });
    });

    // Build clickable 3D Vector Network Traffic Links (CatmullRomCurve3 + Line + Invisible Tube Proxy)
    interface LinkMeshEntry {
      id: string;
      sourceId: string;
      targetId: string;
      curve: THREE.CatmullRomCurve3;
      line: THREE.Line;
      lineMat: THREE.LineBasicMaterial;
      proxyTube: THREE.Mesh;
      speedOffset: number;
    }

    const linkEntries: LinkMeshEntry[] = [];
    const linkProxyMat = track(new THREE.MeshBasicMaterial({ visible: false }));
    const nodePosMap = new Map(INITIAL_PROCESSES.map((p) => [p.id, new THREE.Vector3(...p.basePosition)]));

    INITIAL_LINKS.forEach((lnk, idx) => {
      const src = nodePosMap.get(lnk.sourceId);
      const dst = nodePosMap.get(lnk.targetId);
      if (!src || !dst) return;

      const mid = new THREE.Vector3().addVectors(src, dst).multiplyScalar(0.5);
      const dist = src.distanceTo(dst);
      mid.y += Math.min(1.45, dist * 0.28) + (idx % 2 === 0 ? 0.22 : -0.1);

      const curve = new THREE.CatmullRomCurve3([src.clone(), mid, dst.clone()]);
      const curvePts = curve.getPoints(36);
      const lineGeo = track(new THREE.BufferGeometry().setFromPoints(curvePts));
      const lineMat = track(
        new THREE.LineBasicMaterial({
          color: LINK_HEX[lnk.riskLevel],
          transparent: true,
          opacity: 0.72,
        })
      );
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      // Raycast hit proxy tube along curve
      const tubeGeo = track(new THREE.TubeGeometry(curve, 20, 0.16, 6, false));
      const proxyTube = new THREE.Mesh(tubeGeo, linkProxyMat);
      proxyTube.userData = { kind: 'link', id: lnk.id };
      scene.add(proxyTube);
      raycastTargets.push(proxyTube);

      linkEntries.push({
        id: lnk.id,
        sourceId: lnk.sourceId,
        targetId: lnk.targetId,
        curve,
        line,
        lineMat,
        proxyTube,
        speedOffset: (idx * 0.17) % 1,
      });
    });

    // InstancedMesh for high-performance real-time packet particles moving along traffic curves
    const packetsPerLink = 5;
    const totalPackets = linkEntries.length * packetsPerLink;
    const packetGeo = track(new THREE.OctahedronGeometry(0.085, 0));
    const packetMat = track(
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
      })
    );
    const packetInstanced = new THREE.InstancedMesh(packetGeo, packetMat, totalPackets);
    packetInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(packetInstanced);

    // Pre-allocated math temporaries outside animation loop
    const _pointer = new THREE.Vector2();
    const _raycaster = new THREE.Raycaster();
    const _tmpVec = new THREE.Vector3();
    const _tmpTangent = new THREE.Vector3();
    const _tmpQuat = new THREE.Quaternion();
    const _tmpScale = new THREE.Vector3();
    const _tmpMat = new THREE.Matrix4();
    const _tmpColor = new THREE.Color();
    const _upAxis = new THREE.Vector3(0, 1, 0);
    const _projVec = new THREE.Vector3();

    let hoveredTarget: { kind: 'process' | 'link'; id: string } | null = null;
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverRaycast = 0;

    const updatePointerCoords = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      return rect;
    };

    const pickTarget = (clientX: number, clientY: number) => {
      const rect = updatePointerCoords(clientX, clientY);
      _raycaster.setFromCamera(_pointer, camera);
      const hits = _raycaster.intersectObjects(raycastTargets, false);
      if (hits.length > 0) {
        const ud = hits[0].object.userData as { kind?: 'process' | 'link'; id?: string };
        if (ud.kind && ud.id) {
          return { kind: ud.kind, id: ud.id, point: hits[0].point, rect };
        }
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverRaycast < 45) return;
      lastHoverRaycast = now;

      const hit = pickTarget(e.clientX, e.clientY);
      if (hit) {
        hoveredTarget = { kind: hit.kind, id: hit.id };
        renderer.domElement.style.cursor = 'pointer';

        _projVec.copy(hit.point).project(camera);
        const sx = ((_projVec.x + 1) / 2) * hit.rect.width;
        const sy = ((-_projVec.y + 1) / 2) * hit.rect.height;

        if (hit.kind === 'process') {
          const p = stateRef.current.processes.find((item) => item.id === hit.id);
          if (p) {
            setHoveredLabel({
              id: p.id,
              title: `${p.name} (PID ${p.pid})`,
              subtitle: `CPU %${p.cpuPercent} • ${p.pps} pps`,
              x: sx,
              y: sy,
            });
          }
        } else {
          const l = stateRef.current.links.find((item) => item.id === hit.id);
          if (l) {
            setHoveredLabel({
              id: l.id,
              title: l.label,
              subtitle: `${l.protocol} • ${l.bandwidthMbps} Mbps`,
              x: sx,
              y: sy,
            });
          }
        }
      } else {
        hoveredTarget = null;
        renderer.domElement.style.cursor = 'grab';
        setHoveredLabel(null);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 8) return; // Ignore orbit drag gestures

      const hit = pickTarget(e.clientX, e.clientY);
      if (hit) {
        triggerHaptic('click');
        playTacticalSound('click');
        if (hit.kind === 'process') {
          setSelectedProcessId(hit.id);
          setSelectedLinkId(null);
        } else {
          setSelectedLinkId(hit.id);
          setSelectedProcessId(null);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerup', onPointerUp);

    // ResizeObserver for crisp responsive viewport
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 280);
      const h = Math.max(container.clientHeight, 240);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation loop via skill-mandated afterDraw pacing
    const clock = new THREE.Clock();
    const stopLoop = makeAfterDrawScheduler(renderer, isSoftwareGl, () => {
      const dt = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;
      const nowMs = Date.now();
      const boostActive = nowMs < st.rekeyBoostUntil;

      // Smooth camera target focus
      controls.target.lerp(focusTargetRef.current, Math.min(1, dt * 4.5));
      controls.autoRotate = st.autoRotate;
      controls.autoRotateSpeed = boostActive ? 2.4 : 0.75;
      controls.update();

      // Rotate radar sweep vector
      sweepLine.rotation.y = -elapsed * 0.85;

      // Update process 3D nodes
      st.processes.forEach((proc, idx) => {
        const entry = processEntries.get(proc.id);
        if (!entry) return;

        const isSelected = st.selectedProcessId === proc.id;
        const isHovered = hoveredTarget?.kind === 'process' && hoveredTarget.id === proc.id;
        const showNode =
          st.filterMode === 'all' ||
          st.filterMode === 'processes' ||
          (st.filterMode === 'encrypted' &&
            (proc.status === 'encrypted' || proc.status === 'alert' || proc.id === 'proc-kernel')) ||
          st.filterMode === 'traffic';

        entry.group.visible = showNode;
        entry.pylonLine.visible = showNode;

        const bob = Math.sin(elapsed * 1.4 + idx * 0.9) * 0.08;
        entry.group.position.y = entry.basePos.y + bob;

        const targetScale = isSelected ? 1.32 : isHovered ? 1.18 : 1.0;
        entry.group.scale.lerp(_tmpScale.setScalar(targetScale), Math.min(1, dt * 8));

        entry.coreMesh.rotation.y += dt * (proc.id === 'proc-kernel' ? 0.9 : 1.3);
        entry.coreMesh.rotation.x += dt * 0.35;
        entry.wireLines.rotation.y -= dt * 0.55;
        entry.ringMesh.rotation.z += dt * (proc.status === 'isolated' ? 0.2 : 1.15);
        if (entry.extraRingMesh) {
          entry.extraRingMesh.rotation.z -= dt * 0.95;
        }

        const hex = STATUS_HEX[proc.status];
        entry.coreMat.color.setHex(hex);
        entry.coreMat.emissive.setHex(hex);
        entry.coreMat.emissiveIntensity = isSelected ? 1.25 : isHovered ? 0.95 : boostActive ? 1.1 : 0.55;
        entry.wireMat.color.setHex(hex);
        entry.wireMat.opacity = isSelected || isHovered ? 1.0 : 0.78;
        entry.ringMat.color.setHex(hex);
        entry.ringMat.opacity = isSelected ? 0.95 : 0.48;
        entry.pylonMat.color.setHex(hex);
      });

      // Update traffic vector curves & instanced moving packet particles
      let instanceIdx = 0;
      linkEntries.forEach((lEntry, lIdx) => {
        const liveLink = st.links.find((item) => item.id === lEntry.id);
        const risk = liveLink?.riskLevel ?? 'nominal';
        const isSelected = st.selectedLinkId === lEntry.id;
        const isHovered = hoveredTarget?.kind === 'link' && hoveredTarget.id === lEntry.id;
        const connectedToSelectedProc =
          st.selectedProcessId &&
          (lEntry.sourceId === st.selectedProcessId || lEntry.targetId === st.selectedProcessId);

        const showLink =
          st.filterMode === 'all' ||
          st.filterMode === 'traffic' ||
          (st.filterMode === 'encrypted' && (risk === 'encrypted' || risk === 'warning' || risk === 'blocked')) ||
          (st.filterMode === 'processes' && Boolean(connectedToSelectedProc));

        lEntry.line.visible = showLink;
        lEntry.lineMat.color.setHex(LINK_HEX[risk]);
        lEntry.lineMat.opacity = isSelected || isHovered || connectedToSelectedProc ? 1.0 : showLink ? 0.52 : 0;

        const speed =
          risk === 'blocked'
            ? 0.08
            : boostActive
            ? 0.95
            : Math.min(0.85, 0.22 + ((liveLink?.pps || 500) / 5000) * 0.55);

        for (let p = 0; p < packetsPerLink; p++) {
          if (!showLink || st.filterMode === 'processes') {
            _tmpScale.setScalar(0.0001);
            _tmpMat.compose(_tmpVec.set(0, -10, 0), _tmpQuat.identity(), _tmpScale);
            packetInstanced.setMatrixAt(instanceIdx, _tmpMat);
            instanceIdx++;
            continue;
          }

          let t = (elapsed * speed + lEntry.speedOffset + p / packetsPerLink) % 1;
          if (liveLink?.direction === 'inbound') {
            t = 1 - t;
          }
          lEntry.curve.getPointAt(t, _tmpVec);
          lEntry.curve.getTangentAt(t, _tmpTangent).normalize();
          _tmpQuat.setFromUnitVectors(_upAxis, _tmpTangent);

          const pScale = isSelected || isHovered || connectedToSelectedProc ? 1.45 : risk === 'blocked' ? 0.75 : 1.0;
          _tmpScale.set(pScale * 0.85, pScale * 1.35, pScale * 0.85);
          _tmpMat.compose(_tmpVec, _tmpQuat, _tmpScale);
          packetInstanced.setMatrixAt(instanceIdx, _tmpMat);

          _tmpColor.setHex(LINK_HEX[risk]);
          if (isSelected || isHovered) {
            _tmpColor.offsetHSL(0, 0, 0.18);
          }
          packetInstanced.setColorAt(instanceIdx, _tmpColor);
          instanceIdx++;
        }
      });

      packetInstanced.instanceMatrix.needsUpdate = true;
      if (packetInstanced.instanceColor) {
        packetInstanced.instanceColor.needsUpdate = true;
      }

      renderer.render(scene, camera);
    });

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      envRT.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  const selectedProcess = useMemo(
    () => processes.find((p) => p.id === selectedProcessId) || null,
    [processes, selectedProcessId]
  );
  const selectedLink = useMemo(
    () => links.find((l) => l.id === selectedLinkId) || null,
    [links, selectedLinkId]
  );

  const totalPps = useMemo(() => links.reduce((sum, l) => sum + l.pps, 0), [links]);
  const totalMbps = useMemo(
    () => Number(links.reduce((sum, l) => sum + l.bandwidthMbps, 0).toFixed(1)),
    [links]
  );
  const alertCount = useMemo(
    () =>
      processes.filter((p) => p.status === 'alert').length +
      links.filter((l) => l.riskLevel === 'warning' || l.riskLevel === 'blocked').length,
    [processes, links]
  );

  const handleToggleIsolate = (targetId: string, label: string) => {
    triggerHaptic('click');
    playTacticalSound('command_exec');
    setIsolatedIds((prev) => {
      const nextVal = !prev[targetId];
      setActionBanner(
        nextVal
          ? `${label} izole edildi — vektör trafiği karantinaya alındı.`
          : `${label} izolasyonu kaldırıldı — normal akışa dönüldü.`
      );
      return { ...prev, [targetId]: nextVal };
    });
  };

  const handlePqcRekey = async (targetLabel: string) => {
    triggerHaptic('click');
    playTacticalSound('ai_response');
    setRekeyBoostUntil(Date.now() + 4500);
    agentManager.executeMacro('macro-encrypt-buffer');
    const vault = await encryptBufferAesGcm(`${targetLabel}::${Date.now()}`);
    setActionBanner(
      `${targetLabel} AES-256-GCM ile mühürlendi (IV:${vault.ivHex.slice(0, 12)} • Cipher:${vault.ciphertextHex.slice(0, 14)}...)`
    );
  };

  return (
    <div
      className={`bg-[#050b14]/95 border border-blue-900/50 rounded-2xl overflow-hidden shadow-[0_0_28px_rgba(37,99,235,0.18)] flex flex-col ${
        isExpanded ? 'fixed inset-3 z-[150] rounded-3xl border-cyan-500/60' : ''
      }`}
    >
      {/* Header Bar (Solid Surface, Zero Backdrop-Blur over Canvas) */}
      <div className="px-4 py-3 bg-[#020611] border-b border-blue-900/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                3D Vektör Canlı İzleme Katmanı
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                WebGL2 TELEMETRİ
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Çalışan süreçlere veya ağ vektörlerine dokunarak canlı paket ve soket verilerini denetleyin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-[#050e1f] border border-blue-900/50 text-cyan-300">
            {totalPps.toLocaleString()} pps
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#050e1f] border border-blue-900/50 text-emerald-300">
            {totalMbps} Mbps
          </div>
          {alertCount > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-red-950 border border-red-700/60 text-red-300">
              {alertCount} Uyarı
            </div>
          )}
          <button
            onClick={() => {
              triggerHaptic('click');
              setIsExpanded((v) => !v);
            }}
            title={isExpanded ? 'Küçült' : 'Tam Ekran 3D Görünüm'}
            className="p-1.5 rounded-lg bg-[#091226] hover:bg-blue-900/50 border border-blue-800/50 text-zinc-300 hover:text-white transition"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Interactive 3D Viewport Container */}
      <div
        className={`relative w-full bg-[#01040b] select-none ${
          isExpanded ? 'flex-1 min-h-[340px]' : compact ? 'h-[280px] sm:h-[320px]' : 'h-[320px] sm:h-[370px]'
        }`}
      >
        {/* Dedicated Empty Mount Point for WebGL Canvas */}
        <div ref={mountRef} className="w-full h-full" />

        {/* Hover Readout Chip (no backdrop-filter over WebGL) */}
        {hoveredLabel && (
          <div
            className="pointer-events-none absolute z-10 px-2.5 py-1.5 rounded-lg bg-[#020814] border border-cyan-500/70 shadow-lg max-w-[220px]"
            style={{
              left: Math.min(Math.max(hoveredLabel.x + 12, 10), 260),
              top: Math.max(hoveredLabel.y - 44, 10),
            }}
          >
            <div className="text-[11px] font-bold text-white truncate">{hoveredLabel.title}</div>
            <div className="text-[10px] font-mono text-cyan-300 truncate">{hoveredLabel.subtitle}</div>
          </div>
        )}

        {/* Bottom Dock Controls (Unobstructed Center Viewport, No Blur, No Pulsing Dots) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#030816]/95 border border-blue-900/60 pointer-events-auto overflow-x-auto max-w-full">
            {(
              [
                { id: 'all', label: 'Tümü' },
                { id: 'processes', label: 'Süreçler' },
                { id: 'traffic', label: 'Ağ Akışı' },
                { id: 'encrypted', label: 'Şifreli & Risk' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  triggerHaptic('click');
                  setFilterMode(f.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition whitespace-nowrap ${
                  filterMode === f.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-blue-950/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setAutoRotate((v) => !v)}
              className="px-2.5 py-1.5 rounded-xl bg-[#030816]/95 border border-blue-900/60 text-[10px] font-mono text-zinc-300 hover:text-white hover:border-cyan-500/60 flex items-center gap-1 transition"
            >
              {autoRotate ? <Pause className="w-3 h-3 text-cyan-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span>{autoRotate ? 'Duraklat' : 'Döndür'}</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('click');
                setSelectedProcessId('proc-kernel');
                setSelectedLinkId(null);
                setResetViewTrigger((n) => n + 1);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#030816]/95 border border-blue-900/60 text-[10px] font-mono text-zinc-300 hover:text-white hover:border-cyan-500/60 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3 text-blue-400" />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Clickable Node & Link Strip */}
      <div className="px-3 py-2 bg-[#020611] border-t border-b border-blue-900/35 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {processes.map((proc) => {
          const isSel = selectedProcessId === proc.id;
          const dotColor =
            proc.status === 'alert'
              ? 'bg-rose-500'
              : proc.status === 'isolated'
              ? 'bg-amber-400'
              : proc.status === 'encrypted'
              ? 'bg-emerald-400'
              : 'bg-cyan-400';
          return (
            <button
              key={proc.id}
              onClick={() => {
                triggerHaptic('click');
                playTacticalSound('click');
                setSelectedProcessId(proc.id);
                setSelectedLinkId(null);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap border transition ${
                isSel
                  ? 'bg-blue-600/25 border-cyan-400 text-white font-bold'
                  : 'bg-[#050b18] border-blue-900/40 text-zinc-400 hover:text-white hover:border-blue-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <span>{proc.name}</span>
              <span className="text-[9px] text-zinc-500">%{proc.cpuPercent}</span>
            </button>
          );
        })}
      </div>

      {/* Detailed Interactive Inspector Drawer for Selected 3D Process or Network Link */}
      {(selectedProcess || selectedLink) && (
        <div className="p-3.5 sm:p-4 bg-[#030815] space-y-3 shrink-0">
          {actionBanner && (
            <div className="px-3 py-2 rounded-xl bg-blue-950/70 border border-cyan-500/40 text-[11px] font-mono text-cyan-200 flex items-center justify-between gap-2">
              <span>{actionBanner}</span>
              <button onClick={() => setActionBanner(null)} className="text-zinc-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {selectedProcess && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                      selectedProcess.status === 'alert'
                        ? 'bg-red-950 border-red-600/60 text-red-400'
                        : selectedProcess.status === 'isolated'
                        ? 'bg-amber-950 border-amber-600/60 text-amber-400'
                        : selectedProcess.status === 'encrypted'
                        ? 'bg-emerald-950 border-emerald-600/60 text-emerald-400'
                        : 'bg-blue-950 border-cyan-500/50 text-cyan-300'
                    }`}
                  >
                    {selectedProcess.status === 'alert' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : selectedProcess.status === 'encrypted' ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Cpu className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{selectedProcess.name}</h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black border border-blue-900/60 text-cyan-300">
                        PID {selectedProcess.pid}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">
                        {selectedProcess.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{selectedProcess.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleIsolate(selectedProcess.id, selectedProcess.name)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition border ${
                      isolatedIds[selectedProcess.id]
                        ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                        : 'bg-amber-600/20 border-amber-500/60 text-amber-300 hover:bg-amber-600 hover:text-white'
                    }`}
                  >
                    {isolatedIds[selectedProcess.id] ? 'İzolasyonu Kaldır' : 'Süreci İzole Et'}
                  </button>
                  <button
                    onClick={() => handlePqcRekey(selectedProcess.name)}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>PQC Mühürle</span>
                  </button>
                  {onAskAssistant && (
                    <button
                      onClick={() =>
                        onAskAssistant(
                          `3D Canlı İzleme denetimi: ${selectedProcess.name} (PID ${selectedProcess.pid}, ${selectedProcess.protocol}, ${selectedProcess.pps} pps) güvenlik durumunu analiz et.`
                        )
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-[#071124] hover:bg-blue-900/60 border border-blue-800/60 text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Asistana Sor</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-black/80 border border-blue-900/40">
                  <span className="text-zinc-500 block text-[9px]">CPU / BELLEK</span>
                  <span className="text-white font-bold">
                    %{selectedProcess.cpuPercent} / {selectedProcess.ramMb} MB
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/80 border border-blue-900/40">
                  <span className="text-zinc-500 block text-[9px]">SOKET & PORT</span>
                  <span className="text-cyan-300 font-bold truncate block">{selectedProcess.port}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/80 border border-blue-900/40">
                  <span className="text-zinc-500 block text-[9px]">AĞ HIZI</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedProcess.throughputMbps} Mbps ({selectedProcess.pps} pps)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/80 border border-blue-900/40">
                  <span className="text-zinc-500 block text-[9px]">PROTOKOL / BÜTÜNLÜK</span>
                  <span className="text-blue-300 font-bold truncate block">
                    {selectedProcess.protocol} • %{selectedProcess.integrity}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/70 border border-blue-900/35 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                <p className="text-zinc-300 leading-relaxed flex-1">{selectedProcess.details}</p>
                <div className="sm:w-64 font-mono text-[10px] text-cyan-300/90 space-y-0.5 bg-[#020611] p-2 rounded-lg border border-blue-900/30">
                  {selectedProcess.recentLogs.map((logLine, i) => (
                    <div key={i} className="truncate">
                      {logLine}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedLink && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{selectedLink.label}</h4>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-black border border-blue-900/60 text-cyan-300">
                        {selectedLink.riskLevel}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-400">{selectedLink.endpoint}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleIsolate(selectedLink.id, selectedLink.label)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition border ${
                      isolatedIds[selectedLink.id]
                        ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300'
                        : 'bg-red-600/20 border-red-500/60 text-red-300 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    {isolatedIds[selectedLink.id] ? 'Bağlantıyı Aç' : 'Trafiği Kes'}
                  </button>
                  <button
                    onClick={() => handlePqcRekey(selectedLink.label)}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Tüneli Şifrele</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-black/80 border border-blue-900/40">
                  <span className="text-zinc-500 block text-[9px]">PROTOKOL</span>
                  <span className="text-white font-bold">{selectedLink.protocol}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/80 border border-blue-900/40">
                  <span className="text-zinc-500 block text-[9px]">ŞİFRELEME</span>
                  <span className="text-emerald-400 font-bold truncate block">{selectedLink.cipher}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/80 border border-blue-900/40">
                  <span className="text-zinc-500 block text-[9px]">BANT GENİŞLİĞİ</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedLink.bandwidthMbps} Mbps ({selectedLink.pps} pps)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/80 border border-blue-900/40">
                  <span className="text-zinc-500 block text-[9px]">GECİKME / YÖN</span>
                  <span className="text-blue-300 font-bold">
                    {selectedLink.latencyMs} ms ({selectedLink.direction})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links Selector Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-blue-900/30">
            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 shrink-0 mr-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              AĞ VEKTÖRLERİ:
            </span>
            {links.map((l) => {
              const isSel = selectedLinkId === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    triggerHaptic('click');
                    playTacticalSound('click');
                    setSelectedLinkId(l.id);
                    setSelectedProcessId(null);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap border transition ${
                    isSel
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-black/60 border-blue-900/40 text-zinc-400 hover:text-white'
                  }`}
                >
                  {l.label} ({l.pps})
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
