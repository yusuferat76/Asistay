import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  VolumeX,
  Trash2,
  Lock,
} from 'lucide-react';

interface EmergencyShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmergencyTriggered: () => void;
}

export const EmergencyShieldModal: React.FC<EmergencyShieldModalProps> = ({
  isOpen,
  onClose,
  onEmergencyTriggered,
}) => {
  const [triggered, setTriggered] = useState(false);

  if (!isOpen) return null;

  const handleExecuteKillSwitch = () => {
    // Stop all speech synthesis immediately
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTriggered(true);
    onEmergencyTriggered();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a0508] border-2 border-red-600 rounded-3xl shadow-2xl p-6 text-white overflow-hidden cyber-glow-red">
        {/* Background warning pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-red-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/60 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base text-red-400 tracking-wider uppercase">
                ACİL DURDURMA / KILL-SWITCH
              </h3>
              <p className="text-[11px] text-red-300/80">Tam Güvenli İzolasyon Protokolü</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-red-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {triggered ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">SİSTEM İZOLE EDİLDİ</h4>
              <p className="text-xs text-slate-300">
                Mikrofon durduruldu, sesli yanıtlar kesildi ve yerel oturum kalkanları kilitlendi.
              </p>
            </div>
            <button
              onClick={() => {
                setTriggered(false);
                onClose();
              }}
              className="mt-4 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Kapat
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Bu buton aşağıdaki işlemleri anında ve geri dönüşsüz olarak gerçekleştirir:
            </p>

            <div className="space-y-2 text-xs text-slate-200">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-red-950/30 border border-red-900/50">
                <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
                <span>Tüm ses çıkışını (TTS) ve mikrofon dinlemesini anında keser.</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-red-950/30 border border-red-900/50">
                <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                <span>Geçici terminal telemetrisini ve komut kuyruğunu sıfırlar.</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-red-950/30 border border-red-900/50">
                <Lock className="w-4 h-4 text-red-400 shrink-0" />
                <span>Tüm otonom ajan isteklerini kilitler ve bekleme moduna alır.</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleExecuteKillSwitch}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-sm tracking-widest uppercase bg-gradient-to-r from-red-700 via-red-600 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white shadow-xl shadow-red-950 border border-red-400 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>ACİL DURDURMAYI BAŞLAT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
