import React, { useState, useEffect } from 'react';
import { BatteryCharging, ShieldCheck, Zap, AlertTriangle, Cpu } from 'lucide-react';

export const JuiceJackingShieldModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [chargingInfo, setChargingInfo] = useState<{ charging: boolean; level: number } | null>(null);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setChargingInfo({ charging: battery.charging, level: Math.round(battery.level * 100) });
      }).catch(() => {});
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border border-emerald-900/60 bg-black p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-950 p-2.5 text-emerald-400 border border-emerald-700/50">
              <BatteryCharging className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">USB Juice Jacking Shield</h2>
              <p className="text-xs text-emerald-300">USB Şarj Bağlantısı Sızma ve Veri Koruması</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            Kapat
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-emerald-900/40 bg-gray-950 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-white">Şarj ve Veri Hattı Durumu</p>
                <p className="text-[11px] text-gray-400">
                  {chargingInfo ? (chargingInfo.charging ? `Şarj Oluyor (%${chargingInfo.level})` : `Pilde (%${chargingInfo.level})`) : 'Pil Durumu Aktif'}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-950 px-3 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-800">
              VERİ KANALI KİLİTLİ (GÜVENLİ)
            </span>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase">Juice Jacking Nedir & Nasıl Korunulur?</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Havaalanı, kafe ve toplu taşıma araçlarındaki kamusal USB şarj istasyonları şarj kablosu üzerinden veri aktarımı yaparak zararlı yazılım yükleyebilir.
            </p>
            <div className="rounded-lg bg-black p-3 text-xs text-emerald-300 border border-emerald-900/40 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Sınırsız Asistan kalkanı varsayılan olarak USB veri aktarımı modlarını (MTP/PTP) engelleyen koruma protokolleri sunar.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
