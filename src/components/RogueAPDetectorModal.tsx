import React, { useState } from 'react';
import { Wifi, ShieldAlert, Radio, AlertTriangle, RefreshCw, CheckCircle2, Server } from 'lucide-react';

export const RogueAPDetectorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{
    ssid: string;
    bssid: string;
    signal: number;
    security: string;
    isRogue: boolean;
    reason?: string;
  }[] | null>(null);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setScanResults([
        {
          ssid: 'Ev_Agi_5G',
          bssid: '84:A9:38:D4:11:F0',
          signal: -42,
          security: 'WPA3 Enterprise (Secure)',
          isRogue: false,
        },
        {
          ssid: 'Ev_Agi_5G',
          bssid: '00:11:22:33:44:55',
          signal: -68,
          security: 'WPA2 Open (Evil Twin)',
          isRogue: true,
          reason: 'Duplicate SSID with mismatched MAC address and downgraded encryption (Evil Twin Attack detected)',
        },
        {
          ssid: 'Free_Public_WiFi',
          bssid: 'AA:BB:CC:DD:EE:FF',
          signal: -55,
          security: 'Open (No Authentication)',
          isRogue: true,
          reason: 'Unencrypted AP exhibiting Man-in-the-Middle ARP Poisoning signature',
        },
        {
          ssid: 'Office_Corporate',
          bssid: 'D4:6E:0E:12:88:AA',
          signal: -78,
          security: 'WPA2-PSK',
          isRogue: false,
        },
      ]);
      setIsScanning(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-red-900/60 bg-black p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-950 p-2.5 text-red-400 border border-red-700/50">
              <Wifi className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">Rogue AP & Evil Twin Detector</h2>
              <p className="text-xs text-red-300">Yerel Wi-Fi Sahte Erişim Noktası ve MiTM Saldırı Tespiti</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            Kapat
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-blue-900/40 bg-gray-950 p-4">
            <div className="flex items-center gap-3">
              <Radio className="h-5 w-5 text-blue-400 animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-white">Kablosuz Ağ Taraması Motoru</p>
                <p className="text-[11px] text-gray-400">Çevredeki SSIDs, BSSID uyuşmazlıkları ve ARP tablosu kontrol edilir.</p>
              </div>
            </div>
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Taranıyor...' : 'Wi-Fi Taraması Başlat'}
            </button>
          </div>

          {scanResults && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Tarama Sonuçları ({scanResults.length} AP Bulundu)</h3>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {scanResults.map((res, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-3.5 transition ${
                      res.isRogue
                        ? 'border-red-900/80 bg-red-950/30 text-red-200'
                        : 'border-emerald-900/50 bg-gray-950 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {res.isRogue ? (
                          <ShieldAlert className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{res.ssid}</span>
                            <span className="font-mono text-[10px] text-gray-400">[{res.bssid}]</span>
                          </div>
                          <span className="text-xs text-gray-400">{res.security} • {res.signal} dBm</span>
                        </div>
                      </div>

                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        res.isRogue ? 'bg-red-900 text-red-300' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      }`}>
                        {res.isRogue ? 'ŞÜPHELİ / TUZAK AP' : 'GÜVENLİ'}
                      </span>
                    </div>

                    {res.isRogue && res.reason && (
                      <div className="mt-2.5 rounded-lg bg-red-950/60 p-2 text-xs text-red-300 border border-red-800/40 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{res.reason}</span>
                      </div>
                    )}
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
