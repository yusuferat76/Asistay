import React, { useState, useEffect } from 'react';
import { Activity, Radio, ShieldAlert, Cpu, Smartphone, RefreshCw, Zap } from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';

interface BiometricMovementPanelProps {
  onAskAssistant: (question: string) => void;
}

export const BiometricMovementPanel: React.FC<BiometricMovementPanelProps> = ({ onAskAssistant }) => {
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [gyroData, setGyroData] = useState({ x: 0.12, y: -0.45, z: 9.81 });
  const [stepCount, setStepCount] = useState(3420);
  const [speedKmh, setSpeedKmh] = useState(4.2); // Walking tempo
  const [vibrationDb, setVibrationDb] = useState(34); // Acoustic vibration in dB

  useEffect(() => {
    if (!isLiveTracking) return;
    const interval = setInterval(() => {
      setGyroData({
        x: Number((Math.random() * 0.4 - 0.2).toFixed(2)),
        y: Number((Math.random() * 0.4 - 0.2).toFixed(2)),
        z: Number((9.81 + Math.random() * 0.2 - 0.1).toFixed(2)),
      });
      setVibrationDb(Math.floor(Math.random() * 12 + 30));
      if (Math.random() > 0.6) {
        setStepCount((prev) => prev + 1);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isLiveTracking]);

  return (
    <div className="bg-[#050b14] border border-blue-900/60 rounded-3xl p-5 mb-6 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-blue-900/40 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Biyometrik Hareket &amp; İvmeölçer Analizi (Acoustic &amp; Motion Intelligence)
            </h3>
          </div>
          <p className="text-xs text-blue-300/80 mt-0.5">
            Jiroskop, ivmeölçer ve akustik masa titreşim verileri üzerinden siber izleme tespiti ve fiziksel hareket metodolojisi.
          </p>
        </div>

        <button
          onClick={() => {
            setIsLiveTracking(!isLiveTracking);
            playTacticalSound('click');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
            isLiveTracking ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50' : 'bg-black text-slate-400 border-gray-800'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isLiveTracking ? 'animate-pulse' : ''}`} />
          <span>{isLiveTracking ? 'Canlı Takip Aktif' : 'Takip Durduruldu'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        {/* Sensor 1: Gyro / Accel */}
        <div className="p-3.5 rounded-2xl bg-black border border-blue-900/40 space-y-2">
          <div className="flex justify-between items-center text-blue-400 font-mono text-[10px] uppercase font-bold">
            <span>İvmeölçer (Accel X/Y/Z)</span>
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-white text-sm font-bold">
            X: {gyroData.x} | Y: {gyroData.y} | Z: {gyroData.z} m/s²
          </div>
          <div className="text-[10px] text-gray-400">Görünmez Titreşim Algılayıcı OK</div>
        </div>

        {/* Sensor 2: Step Count */}
        <div className="p-3.5 rounded-2xl bg-black border border-blue-900/40 space-y-2">
          <div className="flex justify-between items-center text-emerald-400 font-mono text-[10px] uppercase font-bold">
            <span>Günlük Adım &amp; Rota</span>
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-emerald-400 text-base font-black">{stepCount} Adım</div>
          <div className="text-[10px] text-gray-400">Yürüyüş Temposu: Normal</div>
        </div>

        {/* Sensor 3: Movement Speed */}
        <div className="p-3.5 rounded-2xl bg-black border border-blue-900/40 space-y-2">
          <div className="flex justify-between items-center text-amber-400 font-mono text-[10px] uppercase font-bold">
            <span>Hareket Hızı</span>
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="font-mono text-amber-300 text-base font-black">{speedKmh} km/saat</div>
          <div className="text-[10px] text-gray-400">Fiziksel Konum Rota Tahmini</div>
        </div>

        {/* Sensor 4: Acoustic Vibration */}
        <div className="p-3.5 rounded-2xl bg-black border border-blue-900/40 space-y-2">
          <div className="flex justify-between items-center text-red-400 font-mono text-[10px] uppercase font-bold">
            <span>Masa Titreşim (Akustik)</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="font-mono text-red-300 text-base font-black">{vibrationDb} dB (Güvenli)</div>
          <div className="text-[10px] text-gray-400">İvmeölçer Dinleme Kalkanı Koruyor</div>
        </div>
      </div>
    </div>
  );
};
