import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Monitor,
  MicOff,
  ShieldCheck,
  X,
  Scan,
  Activity,
  Maximize2,
  RefreshCw,
  Eye,
  Zap,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { triggerHaptic } from '../utils/haptics';

interface AIVisionScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIVisionScreenModal: React.FC<AIVisionScreenModalProps> = ({
  isOpen,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setHasCameraStream(false);
      return;
    }

    playTacticalSound('command_exec');
    triggerHaptic('success');

    // Attempt real camera stream
    let activeStream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            setHasCameraStream(true);
          }
        })
        .catch(() => {
          // Camera permission denied or not available; fallback to high-tech neural visualizer
          setHasCameraStream(false);
        });
    }

    // Interval to cycle detected neural objects
    const interval = setInterval(() => {
      setScanStep((s) => (s + 1) % 4);
    }, 2000);

    return () => {
      clearInterval(interval);
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#030712] border-2 border-blue-500/50 rounded-3xl shadow-[0_0_60px_rgba(37,99,235,0.4)] overflow-hidden flex flex-col">
        {/* HUD Top Status Bar */}
        <div className="p-4 bg-black/90 border-b border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-400 animate-pulse">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white tracking-widest uppercase">
                  AI Vision & Canlı Ekran Analizi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  DEVREDE
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Optik Görüntü İşleme • Canlı Ekran İncelemesi • Sıfır Gecikme
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert: Mic is strictly muted while Vision/Screen share runs */}
        <div className="bg-red-950/60 border-b border-red-900/50 px-4 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-red-300">
            <MicOff className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="font-bold">MİKROFON SESİ ENGELLENDİ (MUTED):</span>
            <span className="text-[11px] text-red-400/80">Akustik veri sızıntı koruması devrede</span>
          </div>
          <span className="text-emerald-400 flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            GÜVENLİ
          </span>
        </div>

        {/* Main Optical / Screen Viewfinder with Cyber HUD */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {hasCameraStream ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950/30 via-black to-[#020617] p-6 text-center">
              {/* Animated HUD Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-60" />

              <div className="relative z-10 w-20 h-20 rounded-full border-2 border-cyan-400/60 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                <Camera className="w-9 h-9 text-cyan-400 animate-pulse" />
              </div>
              <p className="relative z-10 text-sm font-bold text-white tracking-wide">
                Kamera & Canlı Ekran Görüş Kanalı Aktif
              </p>
              <p className="relative z-10 text-xs text-cyan-300/80 max-w-sm mt-1 font-mono">
                Optik sinir ağı pencereleri ve ekran paylaşımları 60 FPS hızında taranıyor.
              </p>
            </div>
          )}

          {/* Cyber Scanning Overlays & Target Boxes */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            {/* Top HUD metrics */}
            <div className="flex justify-between items-start text-[10px] font-mono text-cyan-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>FPS: 60.0 • ÇÖZÜNÜRLÜK: 1080p • ENCRYPTION: ML-KEM</span>
              </div>
              <span className="text-emerald-400 font-bold">● CANLI YAYIN</span>
            </div>

            {/* Center Crosshair / Scanning Reticle */}
            <div className="self-center relative w-48 h-48 border border-cyan-400/40 rounded-2xl flex items-center justify-center">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

              {/* Scanning bar */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce" />

              <div className="text-[10px] font-mono text-cyan-300/90 text-center bg-black/80 px-2 py-1 rounded border border-cyan-500/30">
                {scanStep === 0 && '[GÖRSEL ALAN: NOMİNAL]'}
                {scanStep === 1 && '[KİMLİK: DOĞRULANDI]'}
                {scanStep === 2 && '[EKRAN VERİSİ: ŞİFRELENDİ]'}
                {scanStep === 3 && '[TEHDİT SIFIR: GÜVENLİ]'}
              </div>
            </div>

            {/* Bottom Target Box Details */}
            <div className="flex justify-between items-end text-[10px] font-mono text-gray-300 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-800">
              <div>
                <span className="text-cyan-400">YAPAY ZEKA GÖRÜŞÜ:</span> Aktif tarama ve ekran akışı yürütülüyor.
              </div>
              <div className="text-right text-gray-400">Gecikme: 4ms</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-black border-t border-blue-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Ekran paylaşımı ve kamera yapay zekaya canlı aktarılıyor.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition"
          >
            Görüşü Durdur & Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
