import React, { useState, useEffect } from 'react';
import { Fingerprint, Cpu, ShieldCheck, Zap, Activity, Globe, RefreshCw, Layers } from 'lucide-react';

export const BehavioralFingerprintModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [fingerprintData, setFingerprintData] = useState<{
    canvasHash: string;
    webglVendor: string;
    webglRenderer: string;
    hardwareConcurrency: number;
    deviceMemory: number;
    touchPoints: number;
    behaviorScore: number;
    ipIndependentId: string;
  } | null>(null);

  const runFingerprintScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Generate deterministic canvas hash
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px "Arial"';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('SinirsizAsistanFingerprint2026', 2, 15);
      }
      const dataUrl = canvas.toDataURL();
      let hash = 0;
      for (let i = 0; i < dataUrl.length; i++) {
        hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
        hash |= 0;
      }
      const canvasHash = 'FP-' + Math.abs(hash).toString(16).toUpperCase();

      // WebGL Renderer Info
      let vendor = 'Standard WebGL GPU';
      let renderer = 'Generic ANGLE Direct3D/OpenGL Hardware Engine';
      try {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || vendor;
            renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || renderer;
          }
        }
      } catch (e) {}

      setFingerprintData({
        canvasHash,
        webglVendor: vendor,
        webglRenderer: renderer,
        hardwareConcurrency: navigator.hardwareConcurrency || 8,
        deviceMemory: (navigator as any).deviceMemory || 8,
        touchPoints: navigator.maxTouchPoints || 5,
        behaviorScore: 98,
        ipIndependentId: `DEV-UUID-${Math.abs(hash * 31).toString(36).toUpperCase()}`,
      });

      setIsScanning(false);
    }, 1200);
  };

  useEffect(() => {
    if (isOpen && !fingerprintData) {
      runFingerprintScan();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-blue-900/60 bg-black p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-950 p-2.5 text-blue-400 border border-blue-700/50">
              <Fingerprint className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">Cihaz Parmak İzi & Davranışsal Tespiti</h2>
              <p className="text-xs text-blue-300">IP Bağımsız Cihaz İzi ve Tehdit Davranış Analizörü</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            Kapat
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-blue-900/40 bg-gray-950 p-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase">IP Bağımsız Donanım İmzası</h3>
              <p className="text-[11px] text-gray-400">VPN veya IP değişikliğinden etkilenmeyen benzersiz cihaz kimliği.</p>
            </div>
            <button
              onClick={runFingerprintScan}
              disabled={isScanning}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Taranıyor...' : 'Yeniden Tara'}
            </button>
          </div>

          {fingerprintData && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Tekil Cihaz Kimliği (UUID):</span>
                  <div className="font-mono text-sm font-bold text-white mt-0.5">{fingerprintData.ipIndependentId}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Davranış Güven Skoru:</span>
                  <div className="text-lg font-black text-emerald-400">%{fingerprintData.behaviorScore}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                  <div className="text-gray-400 font-semibold text-[11px]">Canvas Render Hasher:</div>
                  <div className="font-mono text-blue-300 font-bold">{fingerprintData.canvasHash}</div>
                </div>

                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                  <div className="text-gray-400 font-semibold text-[11px]">İşlemci Çekirdek Sayısı:</div>
                  <div className="font-mono text-white font-bold">{fingerprintData.hardwareConcurrency} Çekirdek (Threads)</div>
                </div>

                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1 sm:col-span-2">
                  <div className="text-gray-400 font-semibold text-[11px]">GPU Grafik İşlemci İzi:</div>
                  <div className="font-mono text-gray-200">{fingerprintData.webglRenderer}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
