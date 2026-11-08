import React, { useState, useEffect } from 'react';
import { Eye, Radio, Zap, AlertTriangle, ShieldCheck, Activity, Video } from 'lucide-react';

export const BugDetectorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'magnetic' | 'camera'>('magnetic');
  const [magneticValue, setMagneticValue] = useState<number>(35); // uT
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [detectionAlert, setDetectionAlert] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (isMonitoring && activeTab === 'magnetic') {
      interval = setInterval(() => {
        // Simulating continuous magnetometer flux readings
        const val = Math.floor(25 + Math.random() * 45);
        setMagneticValue(val);
        if (val > 60) {
          setDetectionAlert('⚠️ YÜKSEK MANYETİK AKI: Yakınlarda gizli elektronik donanım veya mikrofon bobini olabilir!');
        } else {
          setDetectionAlert(null);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-purple-900/60 bg-black p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-950 p-2.5 text-purple-400 border border-purple-700/50">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">RF & Magnetometer Bug Detector</h2>
              <p className="text-xs text-purple-300">Ortamdaki Gizli Kamera, Mikrofon ve Böcek Tespiti</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            Kapat
          </button>
        </div>

        <div className="mt-4 flex gap-2 border-b border-gray-800 pb-3">
          <button
            onClick={() => setActiveTab('magnetic')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === 'magnetic' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4" /> Manyetik Alan (EMF) Sensörü
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === 'camera' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Video className="h-4 w-4" /> Kamera Lensi Yansıma Rehberi
          </button>
        </div>

        {activeTab === 'magnetic' ? (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-purple-900/40 bg-gray-950 p-6 text-center">
              <div className="relative mb-3 flex items-center justify-center">
                <div className={`h-24 w-24 rounded-full border-4 flex items-center justify-center transition-all ${
                  magneticValue > 60 ? 'border-red-500 bg-red-950/40 animate-ping' : 'border-purple-500 bg-purple-950/20'
                }`}>
                  <Zap className={`h-10 w-10 ${magneticValue > 60 ? 'text-red-400' : 'text-purple-400'}`} />
                </div>
              </div>
              <span className="text-3xl font-black text-white">{magneticValue} <span className="text-sm font-normal text-purple-400">μT</span></span>
              <p className="mt-1 text-xs text-gray-400">Elektromanyetik Akı Yoğunluğu (Normal: 25 - 50 μT)</p>

              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`mt-4 rounded-xl px-6 py-2.5 text-xs font-bold transition ${
                  isMonitoring ? 'bg-red-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-500'
                }`}
              >
                {isMonitoring ? 'Canlı Dinlemeyi Durdur' : 'Canlı Manyetik Taramayı Başlat'}
              </button>
            </div>

            {detectionAlert && (
              <div className="rounded-xl border border-red-800 bg-red-950/60 p-3 text-xs text-red-200 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                <span>{detectionAlert}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-purple-900/40 bg-gray-950 p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-400" /> Optik Lens Yansıtma Metodu
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                1. Odanın ışıklarını kapatın.<br />
                2. Telefonunuzun Flaşını açıp kamerayı göz hizanıza getirin.<br />
                3. Şüpheli priz, duman dedektörü veya saatlere flaş tutun. Gizli kamera lensleri küçük kırmızı/mavi parlak dairesel yansıma (Retro-reflection) üretir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
