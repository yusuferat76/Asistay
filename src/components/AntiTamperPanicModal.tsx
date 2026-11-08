import React, { useState, useEffect } from 'react';
import { ShieldAlert, BellOff, Volume2, Lock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const AntiTamperPanicModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isArmed, setIsArmed] = useState(false);
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    let handler: any;
    if (isArmed) {
      handler = (e: DeviceMotionEvent) => {
        const acc = e.accelerationIncludingGravity;
        if (acc) {
          const totalMotion = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
          if (totalMotion > 25) { // Threshold for sudden movement/tamper
            triggerPanic();
          }
        }
      };
      window.addEventListener('devicemotion', handler);
    }
    return () => {
      if (handler) window.removeEventListener('devicemotion', handler);
    };
  }, [isArmed]);

  const triggerPanic = () => {
    setAlarmTriggered(true);
    setIsArmed(false);

    // Play high-frequency alert sound via Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioCtx(ctx);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      setTimeout(() => {
        osc.stop();
      }, 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const silenceAlarm = () => {
    setAlarmTriggered(false);
    if (audioCtx) {
      audioCtx.close();
      setAudioCtx(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className={`w-full max-w-xl rounded-2xl border p-6 shadow-2xl transition-all text-white ${
        alarmTriggered ? 'border-red-600 bg-red-950/80 animate-pulse' : 'border-red-900/60 bg-black'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-950 p-2.5 text-red-400 border border-red-700/50">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">Anti-Tamper Panic System</h2>
              <p className="text-xs text-red-300">Cihaz Hareket & İzinsiz Müdahale Alarmı</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            Kapat
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center text-center space-y-6">
          {alarmTriggered ? (
            <div className="space-y-4">
              <div className="rounded-full bg-red-600 p-6 text-white animate-bounce inline-block">
                <Volume2 className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-black text-white">🚨 İZİNSİZ MÜDAHALE ALARMI TETİKLENDİ!</h3>
              <p className="text-xs text-red-200">Cihaz yerinden oynatıldı veya müdahale edildi. Güvenlik kilitleri devreye alındı.</p>
              <button
                onClick={silenceAlarm}
                className="rounded-xl bg-white px-6 py-3 text-xs font-black text-black hover:bg-gray-200 transition"
              >
                Siren Alarmını Sustur
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`rounded-full p-6 transition ${isArmed ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' : 'bg-gray-900 text-gray-400'}`}>
                <Lock className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold">{isArmed ? 'ALARM KURULDU (ARMED)' : 'Sistem Devre Dışı'}</h3>
                <p className="mt-1 text-xs text-gray-400 max-w-sm">
                  Cihazı masa veya düz bir zemine koyup "Alarmı Kur" butonuna basın. Telefon en ufak harekette siren çalar.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsArmed(!isArmed)}
                  className={`rounded-xl px-6 py-2.5 text-xs font-bold transition ${
                    isArmed ? 'bg-red-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                >
                  {isArmed ? 'Sistemi Devreden Çıkar' : 'Alarmı Kur (Arm Motion Detection)'}
                </button>
                <button
                  onClick={triggerPanic}
                  className="rounded-xl bg-red-950 border border-red-800 px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-900 transition"
                >
                  Test Sireni
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
