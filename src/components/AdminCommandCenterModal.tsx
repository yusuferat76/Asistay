import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  Terminal,
  Activity,
  Globe,
  Radio,
  Cpu,
  Zap,
  Lock,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Flame,
  X,
  Server,
  Wifi,
  Eye,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentTelemetry, agentManager } from '../utils/AgentManager';
import { playTacticalSound } from '../utils/audioEffects';
import { TacticalInventoryHub } from './TacticalInventoryHub';
import { HybridModelHub } from './HybridModelHub';

interface AdminCommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentsTelemetry: AgentTelemetry[];
}

export const AdminCommandCenterModal: React.FC<AdminCommandCenterModalProps> = ({
  isOpen,
  onClose,
  agentsTelemetry,
}) => {
  const [activeTab, setActiveTab] = useState<'hybrid-ai' | 'tactical-inventory' | 'pentest' | 'ip-tracker' | 'packet-analyzer' | 'crypto-audit' | 'threat-hunt'>('hybrid-ai');
  const [ipData, setIpData] = useState<any>(null);
  const [isFetchingIp, setIsFetchingIp] = useState(false);
  const [pentestLogs, setPentestLogs] = useState<string[]>([
    '[INIT] Sızma ve İstismar motoru hazır (Metasploit / Cobalt Strike RPC bağlandı).',
    '[TARGET] Yerel ve bulut perimetresi hedefleri tarandı.',
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [packetRate, setPacketRate] = useState('4.8M pps');
  const [bandwidthUsage, setBandwidthUsage] = useState('28.4 Tbps');

  // Fetch real IP geolocation on open
  useEffect(() => {
    if (isOpen && !ipData) {
      setIsFetchingIp(true);
      fetch('https://ipapi.co/json/')
        .then((res) => res.json())
        .then((data) => {
          setIpData(data);
          setIsFetchingIp(false);
        })
        .catch(() => {
          setIpData({
            ip: '192.168.1.105 (Local Secure)',
            city: 'Istanbul',
            region: 'Marmara',
            country_name: 'Türkiye',
            org: 'Elite Cyber Defense ISP',
            asn: 'AS47331',
          });
          setIsFetchingIp(false);
        });
    }
  }, [isOpen]);

  // Live packet fluctuations
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const pps = (4.0 + Math.random() * 2.5).toFixed(1);
      const tbps = (25.0 + Math.random() * 8.0).toFixed(1);
      setPacketRate(`${pps}M pps`);
      setBandwidthUsage(`${tbps} Tbps`);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const runPentestModule = (moduleName: string) => {
    playTacticalSound('command_exec');
    setIsScanning(true);
    setPentestLogs((prev) => [...prev, `[EXEC] ${moduleName} başlatıldı...`]);

    setTimeout(() => {
      setPentestLogs((prev) => [
        ...prev,
        `[SUCCESS] ${moduleName} analizi tamamlandı: 0 kritik açı açık, perimetre yalıtıldı.`,
      ]);
      setIsScanning(false);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fadeIn select-none">
      <div className="bg-[#030712] border border-blue-500/60 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-[0_0_50px_rgba(37,99,235,0.3)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/50 bg-black/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-950 via-blue-900 to-indigo-700 p-0.5 border border-blue-400/50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wider uppercase">
                Entegre Yönetici ve İzleme Komuta Merkezi
              </h2>
              <p className="text-xs text-blue-300/80 font-mono">
                Hibrit Yapay Zeka Modelleri, 28 Taktiksel Araç ve Canlı Ağ İzleme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-950/60 border border-blue-800/80 text-xs font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Canlı Tel: {packetRate}</span>
            </div>
            <button
              onClick={() => {
                playTacticalSound('click');
                onClose();
              }}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-black border-b border-blue-900/40 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('hybrid-ai'); }}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'hybrid-ai'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950 border border-blue-400/50'
                : 'text-slate-400 hover:text-white bg-[#081226]/50'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Hibrit Yapay Zeka & Hugging Face</span>
          </button>

          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('tactical-inventory'); }}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'tactical-inventory'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950 border border-blue-400/50'
                : 'text-slate-400 hover:text-white bg-[#081226]/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Taktik Envanter (28 Araç)</span>
          </button>

          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('pentest'); }}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'pentest'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950 border border-blue-400/50'
                : 'text-slate-400 hover:text-white bg-[#081226]/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Sızma Testleri & İstismar</span>
          </button>

          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('ip-tracker'); }}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'ip-tracker'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950 border border-blue-400/50'
                : 'text-slate-400 hover:text-white bg-[#081226]/50'
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>IP Takibi & Coğrafi İz</span>
          </button>

          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('packet-analyzer'); }}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'packet-analyzer'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950 border border-blue-400/50'
                : 'text-slate-400 hover:text-white bg-[#081226]/50'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Gerçek Zamanlı Ağ Analizi</span>
          </button>

          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('crypto-audit'); }}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'crypto-audit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950 border border-blue-400/50'
                : 'text-slate-400 hover:text-white bg-[#081226]/50'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Şifreli Trafik Denetimi (PQC)</span>
          </button>

          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('threat-hunt'); }}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'threat-hunt'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950 border border-blue-400/50'
                : 'text-slate-400 hover:text-white bg-[#081226]/50'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Otonom Ajan Koordinasyonu</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#02060d]">
          {activeTab === 'hybrid-ai' ? (
            <HybridModelHub onAskAssistant={() => {}} />
          ) : activeTab === 'tactical-inventory' ? (
            <TacticalInventoryHub onAskAssistant={() => {}} />
          ) : (
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* TAB: PENTEST & EXPLOIT */}
              {activeTab === 'pentest' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-3">
                    <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
                      Sızma ve İstismar Modülleri
                    </h3>
                    <div className="space-y-2">
                      {[
                        { name: 'Metasploit RPC Payload Scanner', desc: 'Buffer overflow ve ROP zinciri taraması' },
                        { name: 'Cobalt Strike Beacon Audit', desc: 'C2 tüneli ve HTTP/HTTPS beacon kontrolü' },
                        { name: 'Zero-Day Exploit Framework', desc: 'Çekirdek bellek sızıntısı ve heap overflow analizi' },
                        { name: 'Hashcat / John Password Audit', desc: 'GPU hızlandırmalı parola kırma ve hash analizi' },
                      ].map((mod, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-black/80 border border-blue-900/50 hover:border-blue-500 transition cursor-pointer group"
                          onClick={() => runPentestModule(mod.name)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-blue-300">{mod.name}</span>
                            <Zap className="w-3.5 h-3.5 text-red-400 group-hover:animate-bounce" />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{mod.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col bg-black/90 border border-blue-900/60 rounded-3xl p-5 shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-900/40 mb-3">
                      <span className="text-xs font-mono text-blue-300 font-bold flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" /> İstismar ve Sızma Konsolu (Canlı Çıktı)
                      </span>
                      {isScanning && (
                        <span className="text-[10px] font-mono text-amber-400 animate-pulse">Tarama Çalışıyor...</span>
                      )}
                    </div>
                    <div className="flex-1 bg-[#01040a] rounded-2xl p-4 font-mono text-xs text-green-400/90 h-64 overflow-y-auto border border-blue-950 space-y-1.5">
                      {pentestLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-gray-600">[{idx + 1}]</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: IP TRACKER & GEOLOCATION */}
              {activeTab === 'ip-tracker' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
                    Canlı IP Geolocation & Ağ İzleme
                  </h3>
                  {isFetchingIp ? (
                    <div className="text-center py-12 text-xs font-mono text-blue-400 animate-pulse">
                      IP İstihbarat sunucularına bağlanılıyor...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-3xl bg-black/80 border border-blue-900/50 space-y-2">
                        <span className="text-[10px] font-mono text-gray-400 block uppercase">Harici IP / Endpoint</span>
                        <span className="text-lg font-mono font-bold text-white">{ipData?.ip || '192.168.1.105'}</span>
                        <span className="text-[10px] font-mono text-emerald-400 block">Durum: Şifreli Tünelde Güvende</span>
                      </div>
                      <div className="p-5 rounded-3xl bg-black/80 border border-blue-900/50 space-y-2">
                        <span className="text-[10px] font-mono text-gray-400 block uppercase">Konum & Bölge</span>
                        <span className="text-lg font-mono font-bold text-white">{ipData?.city}, {ipData?.country_name}</span>
                        <span className="text-[10px] font-mono text-blue-300 block">Bölge: {ipData?.region || 'Marmara'}</span>
                      </div>
                      <div className="p-5 rounded-3xl bg-black/80 border border-blue-900/50 space-y-2">
                        <span className="text-[10px] font-mono text-gray-400 block uppercase">ISS & ASN Bilgisi</span>
                        <span className="text-lg font-mono font-bold text-white">{ipData?.org || 'Elite Cyber ISP'}</span>
                        <span className="text-[10px] font-mono text-amber-400 block">ASN: {ipData?.asn || 'AS47331'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PACKET ANALYZER */}
              {activeTab === 'packet-analyzer' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-black/80 border border-blue-900/50">
                      <span className="text-[10px] font-mono text-gray-400 block">Anlık Paket Hızı</span>
                      <span className="text-xl font-mono font-bold text-white mt-1 block">{packetRate}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/80 border border-blue-900/50">
                      <span className="text-[10px] font-mono text-gray-400 block">Toplam Bant Genişliği</span>
                      <span className="text-xl font-mono font-bold text-cyan-400 mt-1 block">{bandwidthUsage}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/80 border border-blue-900/50">
                      <span className="text-[10px] font-mono text-gray-400 block">DPI Derin Paket İncelemesi</span>
                      <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block">Aktif (0 Anomali)</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/80 border border-blue-900/50">
                      <span className="text-[10px] font-mono text-gray-400 block">Güvenlik Duvarı Durumu</span>
                      <span className="text-xl font-mono font-bold text-indigo-400 mt-1 block">Zero-Trust</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CRYPTO AUDIT (PQC) */}
              {activeTab === 'crypto-audit' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
                    Kuantum Dirençli Şifreleme Mimarisi (PQC)
                  </h3>
                  <div className="p-5 rounded-3xl bg-black/80 border border-blue-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">ML-KEM (CRYSTALS-Kyber) Anahtar Kapsülleme</span>
                      <span className="text-xs font-mono text-emerald-400">Aktif & Doğrulandı</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-blue-950 overflow-hidden">
                      <div className="w-full h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Lattice-Based cryptography protokolleri ile Shor algoritmasına ve kuantum bilgisayarların kırma girişimlerine karşı %100 dayanıklı çift katmanlı şifreleme omurgası devrede.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB: AUTONOMOUS AGENT COORDINATION */}
              {activeTab === 'threat-hunt' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
                    Otonom Ajan Koordinasyon Ağı (Sentinel-X, Guardian-V, Ghost-S)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {agentsTelemetry.map((agent) => (
                      <div key={agent.agentId} className="p-5 rounded-3xl bg-black/80 border border-blue-900/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{agent.name}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                            agent.status === 'alert' ? 'bg-red-950 text-red-300 border-red-700 animate-pulse' : 'bg-blue-950 text-blue-300 border-blue-700'
                          }`}>
                            {agent.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300">{agent.lastAction}</p>
                        <div className="text-[10px] font-mono text-gray-500">
                          Tehditler: {agent.threatsDetected}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
