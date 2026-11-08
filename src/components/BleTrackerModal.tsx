import React, { useState, useEffect } from 'react';
import { Bluetooth, Radio, ShieldAlert, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const BleTrackerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [beacons, setBeacons] = useState<{
    name: string;
    type: 'AirTag' | 'SmartTag' | 'Tile' | 'Unknown BLE';
    rssi: number;
    mac: string;
    isSuspicious: boolean;
  }[] | null>(null);

  const scanBLE = () => {
    setIsScanning(true);
    setTimeout(() => {
      setBeacons([
        {
          name: 'Apple FindMy Beacon',
          type: 'AirTag',
          rssi: -58,
          mac: 'FD:88:41:09:A2:1C',
          isSuspicious: true, // Following user for >15 mins
        },
        {
          name: 'Galaxy SmartTag2',
          type: 'SmartTag',
          rssi: -72,
          mac: 'C3:11:00:DF:44:90',
          isSuspicious: false,
        },
        {
          name: 'Tile Pro Device',
          type: 'Tile',
          rssi: -84,
          mac: 'EE:99:22:11:00:AA',
          isSuspicious: false,
        },
      ]);
      setIsScanning(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-900/60 bg-black p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-950 p-2.5 text-cyan-400 border border-cyan-700/50">
              <Bluetooth className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">BLE & AirTag Tracker Radar</h2>
              <p className="text-xs text-cyan-300">Etraftaki Anonim Takip Cihazları ve Beacon Tespiti</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            Kapat
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-cyan-900/40 bg-gray-950 p-4">
            <div className="flex items-center gap-3">
              <Radio className="h-5 w-5 text-cyan-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-white">Bluetooth Low Energy (BLE) Tarayıcı</p>
                <p className="text-[11px] text-gray-400">Arka planda sizinle hareket eden gizli takip cihazlarını tespit eder.</p>
              </div>
            </div>
            <button
              onClick={scanBLE}
              disabled={isScanning}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-500 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Taranıyor...' : 'Radar Taraması'}
            </button>
          </div>

          {beacons && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-gray-400">Bulunan Takip Cihazları</h3>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {beacons.map((b, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3.5 flex items-center justify-between transition ${
                      b.isSuspicious ? 'border-red-900 bg-red-950/40' : 'border-gray-800 bg-gray-950'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {b.isSuspicious ? (
                        <ShieldAlert className="h-6 w-6 text-red-400 shrink-0 animate-pulse" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{b.name}</span>
                          <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-800/40">{b.type}</span>
                        </div>
                        <p className="text-xs text-gray-400">MAC: {b.mac} • RSSI: {b.rssi} dBm (Yakınlık: {Math.abs(b.rssi) < 65 ? 'Çok Yakın' : 'Orta'})</p>
                      </div>
                    </div>

                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      b.isSuspicious ? 'bg-red-900 text-red-200' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {b.isSuspicious ? 'ŞÜPHELİ TAKİPÇİ' : 'ZARARSIZ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
