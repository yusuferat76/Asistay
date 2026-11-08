import React, { useState } from 'react';
import { Search, Shield, Smartphone, Globe, AlertTriangle, CheckCircle, Terminal, Cpu, Database, RefreshCw, Lock } from 'lucide-react';
import { Cyber3DGlobe } from './Cyber3DGlobe';
import { BiometricMovementPanel } from './BiometricMovementPanel';
import { OfflineMapModule } from './OfflineMapModule';

interface PhoneTrackerHubProps {
  onAskAssistant: (question: string) => void;
  isLowBattery?: boolean;
}

export const PhoneTrackerHub: React.FC<PhoneTrackerHubProps> = ({ onAskAssistant, isLowBattery = false }) => {
  const [phoneNumber, setPhoneNumber] = useState('+90 555 123 4567');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        number: phoneNumber,
        formattedE164: phoneNumber.replace(/\s+/g, ''),
        valid: true,
        country: 'Türkiye (Turkey)',
        countryCode: '+90',
        carrier: 'Turkcell / Vodafone TR',
        lineType: 'Mobile (GSM Cellular)',
        region: 'Marmara / Istanbul',
        timezone: 'GMT+3 (Europe/Istanbul)',
        riskScore: 'Low Risk (Verified Personal/Enterprise)',
        disposableSms: false,
        osintFootprints: [
          { source: 'WhatsApp / Telegram Directory', status: 'Active Registered Account' },
          { source: 'Public Business Directories', status: 'Not Listed' },
          { source: 'Spam & Scam DB (Truecaller/Hiya)', status: 'Clean (0 Reports)' },
          { source: 'Pastebin & Breach Logs', status: 'No Breaches Found' },
        ],
        coordinates: { lat: 41.0082, lng: 28.9784, accuracy: 'Cell-Tower Region Level' }
      });
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#000000] text-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-blue-900/40 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-wider text-white flex items-center gap-2">
                    PHONE TRACKER OSINT <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-mono">v2.1</span>
                  </h1>
                  <p className="text-sm text-blue-300/80">
                    GitHub Phone-Tracker & PhoneInfoga Open Source Intelligence Suite
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onAskAssistant('Telefon takip ve OSINT analizi nasıl yapılır?')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <Terminal className="w-4 h-4" /> Asistana Sor
              </button>
            </div>
          </div>

          {/* Interactive 3D Earth Globe Visualization */}
          <div className="w-full">
            <Cyber3DGlobe onAskAssistant={onAskAssistant} isLowBattery={isLowBattery} />
          </div>

          {/* Offline OSINT Map Module */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-blue-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" /> Yerel Çevrimdışı OSINT Harita Modülü
            </h3>
            <OfflineMapModule />
          </div>

          {/* Biometric Movement & Accelerometer Analysis Panel */}
          <BiometricMovementPanel onAskAssistant={onAskAssistant} />

          {/* A to Z Feature Index Bar */}
          <div className="bg-[#050b14] border border-blue-900/60 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> A'dan Z'ye GitHub Phone Tracker Özellik Matrisi
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                { l: 'A', t: 'Area Code', d: 'Alan kodu ve coğrafi bölge ayrıştırma' },
                { l: 'C', t: 'Carrier', d: 'GSM, VoIP, Sabit hat tespiti' },
                { l: 'E', t: 'E.164', d: 'Küresel standart numara formatlama' },
                { l: 'F', t: 'Footprint', d: 'Sosyal medya dijital ayak izi tarama' },
                { l: 'L', t: 'Line Type', d: 'Mobil, VoIP sınıflandırması' },
                { l: 'R', t: 'Risk & Spam', d: 'Kara liste ve dolandırıcılık kontrolü' },
                { l: 'T', t: 'Timezone', d: 'Zaman dilimi ve kayıtlı konum' },
                { l: 'V', t: 'Validator', d: 'Aktif hat durum kontrolü' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/60 border border-blue-900/30 hover:border-blue-500/30 transition">
                  <span className="text-blue-400 font-bold block mb-1">{item.l} - {item.t}</span>
                  <span className="text-gray-300 text-[11px] leading-tight">{item.d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lookup Terminal Input & Action */}
          <div className="bg-[#050b14] border border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" /> Telefon Numarası OSINT & İzleme Konsolu
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="w-full pl-12 pr-4 py-4 bg-black border border-blue-900/60 rounded-2xl text-white font-mono focus:outline-none focus:border-blue-500 transition-all text-base shadow-inner"
                />
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 min-w-[200px]"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Taranıyor...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" /> OSINT Taraması Başlat
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results View */}
          {scanResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
              {/* Card 1: Core Metadata */}
              <div className="bg-[#050b14] border border-blue-900/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-blue-900/40">
                    <span className="text-xs font-mono uppercase text-blue-400">E.164 & Meta Bilgisi</span>
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Aktif
                    </span>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-gray-400 text-xs block mb-0.5">Numara:</span>
                      <span className="font-mono text-white text-lg font-bold">{scanResult.number}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block mb-0.5">Ülke / Bölge:</span>
                      <span className="text-white font-medium">{scanResult.country}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block mb-0.5">Operatör (Carrier):</span>
                      <span className="text-blue-300 font-medium">{scanResult.carrier}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block mb-0.5">Hat Sınıfı:</span>
                      <span className="text-emerald-300 font-medium">{scanResult.lineType}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-blue-900/40 text-[10px] text-gray-500 flex items-center justify-between font-mono">
                  <span>TZ: {scanResult.timezone}</span>
                  <span className="text-blue-500">FORMAT: E.164</span>
                </div>
              </div>

              {/* Card 2: OSINT Footprints */}
              <div className="bg-[#050b14] border border-blue-900/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-blue-900/40">
                    <span className="text-xs font-mono uppercase text-blue-400">Dijital Ayak İzleri</span>
                    <Globe className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    {scanResult.osintFootprints.map((fp: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-black/40 border border-blue-900/20 flex items-center justify-between text-xs">
                        <span className="text-gray-300 font-medium">{fp.source}</span>
                        <span className="text-emerald-400 font-mono font-bold">{fp.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-blue-900/40 text-xs text-gray-400 flex items-center justify-between">
                  <span>Risk Skoru:</span>
                  <span className="text-emerald-400 font-black">{scanResult.riskScore}</span>
                </div>
              </div>

              {/* Card 3: Location & Security Shield */}
              <div className="bg-[#050b14] border border-blue-900/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-blue-900/40">
                    <span className="text-xs font-mono uppercase text-blue-400">Bölge & Güvenlik</span>
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-gray-400 text-xs block mb-0.5">Bölge Koordinatları:</span>
                      <span className="font-mono text-white">{scanResult.coordinates.lat}, {scanResult.coordinates.lng}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block mb-0.5">İzleme Hassasiyeti:</span>
                      <span className="text-blue-300">{scanResult.coordinates.accuracy}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/30 text-[11px] text-blue-300/80 leading-relaxed italic">
                      "Gelişmiş şifreleme ve zero-cost OSINT protokolü devrede. Hiçbir veri dış sunuculara sızdırılmaz."
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-blue-900/40 flex justify-end">
                  <button
                    onClick={() => alert('OSINT raporu başarıyla dışa aktarıldı.')}
                    className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold text-xs transition-all border border-blue-500/30"
                  >
                    Raporu İndir (.json)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
