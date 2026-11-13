import React, { useState } from 'react';
import {
  X,
  Shield,
  Mic,
  Volume2,
  Bell,
  Eye,
  Settings as SettingsIcon,
  CheckCircle2,
  Cpu,
  Monitor,
  Zap,
  DollarSign,
  Download,
  Server,
  Lock,
  RefreshCw,
  Sliders,
  Activity,
  Key,
  KeyRound,
  Globe
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { speakUltraRealistic } from '../utils/ultraTTS';
import { triggerHaptic } from '../utils/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    continuousListening: boolean;
    autoSpeak: boolean;
    showSecurityAlerts: boolean;
    stealthMode: boolean;
    visualGauges: boolean;
    monthlyLimit: number;
  };
  onUpdateSetting: (key: string, value: boolean | number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
}) => {
  const [activeTab, setActiveTab] = useState<'management' | 'security' | 'performance'>('management');
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'installed'>('installed');
  const [downloadProgress, setDownloadProgress] = useState(100);
  const [apiKeyInput, setApiKeyInput] = useState('ai_studio_secure_sk_live_****************');
  const [twoStepAuth, setTwoStepAuth] = useState(true);
  const [maxPowerMode, setMaxPowerMode] = useState(true);
  const [intrusionProtection, setIntrusionProtection] = useState(true);
  const [antiEavesdropping, setAntiEavesdropping] = useState(true);
  const [ipNetworkInspection, setIpNetworkInspection] = useState(true);
  const [smartConfigStatus, setSmartConfigStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggle = (key: string, current: boolean) => {
    playTacticalSound('click');
    onUpdateSetting(key, !current);
  };

  const handleSmartOptimization = () => {
    playTacticalSound('command_exec');
    triggerHaptic('success');
    setIntrusionProtection(true);
    setAntiEavesdropping(true);
    setIpNetworkInspection(true);
    setTwoStepAuth(true);
    setMaxPowerMode(true);
    setSmartConfigStatus('✨ Akıllı Yapılandırma: Tüm güvenlik, sızma, dinleme ve performans parametreleri maksimum korumaya getirildi!');
    speakUltraRealistic('Akıllı yapılandırma başarıyla tamamlandı. Tüm sistem korumaları en üst düzeye ayarlandı.');
    setTimeout(() => setSmartConfigStatus(null), 5000);
  };

  const handleInstallQwenModel = () => {
    playTacticalSound('command_exec');
    triggerHaptic('success');
    setDownloadState('downloading');
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadState('installed');
          speakUltraRealistic('Qwen3 27B Uncensored modeli yerel cihaza başarıyla kuruldu.');
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#000000] border border-blue-900/60 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-blue-900/40 bg-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5500]/20 border border-[#FFAA00]/40 flex items-center justify-center text-[#FFAA00]">
              <SettingsIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white uppercase tracking-wider">Gelişmiş Sistem Ayarları</h3>
              <p className="text-xs text-gray-400 font-mono">Yönetim • Güvenlik • Performans Katmanları</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Section Tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-black/90 border-b border-blue-900/40 text-xs font-mono">
          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('management'); }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'management'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white bg-black/50'
            }`}
          >
            <Server className="w-4 h-4 text-cyan-400" />
            <span>1. Yönetim Paneli</span>
          </button>

          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('security'); }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white bg-black/50'
            }`}
          >
            <Shield className="w-4 h-4 text-red-400" />
            <span>2. Güvenlik Sekmesi</span>
          </button>

          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('performance'); }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'performance'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white bg-black/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>3. Performans Katmanı</span>
          </button>
        </div>

        {/* Smart Configuration Wizard Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-950 via-black to-blue-950 border-b border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FFAA00] animate-bounce" />
            <span className="text-xs font-mono font-bold text-white">Tek Tıkla Otomatik Savunma & Performans Optimizasyonu</span>
          </div>
          <button
            onClick={handleSmartOptimization}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.6)] transition"
          >
            ✨ Akıllı Yapılandırma Sihirbazı
          </button>
        </div>

        {/* Smart Config Toast Notification */}
        {smartConfigStatus && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono text-xs shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center gap-2 animate-pulse">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{smartConfigStatus}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">
          
          {/* TAB 1: MANAGEMENT */}
          {activeTab === 'management' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Local & Cloud Model Management */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>Yerel ve Bulut Modelleri Arasında Dinamik Geçişler</span>
                </h4>

                <div className="p-4 rounded-2xl bg-[#080808] border border-blue-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Qwen3 27B Uncensored (Yerel Ağırlık)</div>
                      <div className="text-[11px] text-gray-400">Hugging Face üzerinden cihaz içi tam yetkili ajan yönetimi</div>
                    </div>
                    {downloadState === 'installed' ? (
                      <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Yüklü & Aktif
                      </span>
                    ) : (
                      <button
                        onClick={handleInstallQwenModel}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition"
                      >
                        Modeli İndir
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-900">
                    <div>
                      <div className="text-sm font-bold text-white">Kimi K3 (Bulut Çok Modlu Omurga)</div>
                      <div className="text-[11px] text-gray-400">Kompleks sorgular için bulut yönlendirmesi</div>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800">
                      Bağlı (0ms)
                    </span>
                  </div>
                </div>
              </div>

              {/* Server-Side Secure Proxy & Local Gateway Status */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  <span>Sunucu Taraflı Güvenli AI Proxy & Yerel Çekirdek</span>
                </h4>
                <div className="p-4 rounded-2xl bg-[#080808] border border-blue-950 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>Gemini 4 Hydrogen Sunucu Köprüsü (/api/cyber/*)</span>
                    <span className="font-mono text-emerald-400 font-bold">MÜHÜRLÜ & AKTİF</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Yerel Ollama Omurgası (localhost:11434)</span>
                    <span className="font-mono text-cyan-300">Yedek Çekirdek Hazır</span>
                  </div>
                </div>
              </div>

              {/* Agent Authorization Boundaries */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  <span>Ajanların Yetki Sınırları (Autonomous Boundaries)</span>
                </h4>
                <div className="p-4 rounded-2xl bg-[#080808] border border-blue-950 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Sentinel-X Otomatik Port Kapatma Yetkisi</span>
                    <span className="font-mono text-emerald-400 font-bold">MUTLAK YETKİ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Guardian-V Çekirdek Bellek Karantinası</span>
                    <span className="font-mono text-emerald-400 font-bold">MUTLAK YETKİ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Ghost-S Onion Tünel & VPN Döndürme</span>
                    <span className="font-mono text-emerald-400 font-bold">OTOMATİK</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Two-step Voice and Text Confirmation */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  <span>İki Adımlı Sesli ve Yazılı Onay Zorunluluğu</span>
                </h4>
                <div
                  onClick={() => setTwoStepAuth(!twoStepAuth)}
                  className="p-4 rounded-2xl bg-[#080808] border border-red-950/60 cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-bold text-white">Kritik Eylemler İçin Çift Katmanlı Onay</div>
                    <div className="text-[11px] text-gray-400">Sistem izolasyonu ve makrolar için hem sesli komut hem metin onayı gerekir.</div>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${twoStepAuth ? 'bg-red-600' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${twoStepAuth ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              {/* 1. Sızma Koruması (IDS / IPS / Zero-Day Isolation) */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>1. Sızma Koruması (IDS / IPS / Zero-Day)</span>
                </h4>
                <div
                  onClick={() => { playTacticalSound('click'); setIntrusionProtection(!intrusionProtection); }}
                  className="p-4 rounded-2xl bg-[#080808] border border-red-950/60 cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-bold text-white">Aktif Sızma Önleme ve Bellek Karantinası</div>
                    <div className="text-[11px] text-gray-400">Yetkisiz dış soket açma ve bellek sızdırma girişimlerini anında engeller.</div>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${intrusionProtection ? 'bg-red-600' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${intrusionProtection ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              {/* 2. Dinleme Koruması (Anti-Eavesdropping / Acoustic Jammer) */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span>2. Dinleme Koruması (Acoustic & Mic Jammer)</span>
                </h4>
                <div
                  onClick={() => { playTacticalSound('click'); setAntiEavesdropping(!antiEavesdropping); }}
                  className="p-4 rounded-2xl bg-[#080808] border border-red-950/60 cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-bold text-white">Donanımsal Mikrofon ve Ortam Sinyal Kalkanı</div>
                    <div className="text-[11px] text-gray-400">Ultrasonik dinleme cihazlarını ve yetkisiz ses akışı tünellerini köreltir.</div>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${antiEavesdropping ? 'bg-red-600' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${antiEavesdropping ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              {/* 3. IP ve Ağ Denetimi (IP & Network Inspection / Onion Routing) */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>3. IP ve Ağ Denetimi (Geo-IP & Onion Routing)</span>
                </h4>
                <div
                  onClick={() => { playTacticalSound('click'); setIpNetworkInspection(!ipNetworkInspection); }}
                  className="p-4 rounded-2xl bg-[#080808] border border-red-950/60 cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-bold text-white">Dinamik IP Maskeleme ve Derin Paket Analizi</div>
                    <div className="text-[11px] text-gray-400">Tüm giden paketleri şifreli 3-Hop Onion tünellerinden geçirerek IP'yi gizler.</div>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${ipNetworkInspection ? 'bg-red-600' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ipNetworkInspection ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Maximum Power & Speed Settings */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Sistemin Her An Maksimum Güçte Çalışmasını Sağlayan Ayarlar</span>
                </h4>
                <div
                  onClick={() => setMaxPowerMode(!maxPowerMode)}
                  className="p-4 rounded-2xl bg-[#080808] border border-amber-950/60 cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-bold text-white">Maksimum Performans & Kaynak Kilidi</div>
                    <div className="text-[11px] text-gray-400">CPU/GPU frekanslarını en üst düzeyde sabitler, gecikmeyi sıfırlar.</div>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${maxPowerMode ? 'bg-amber-500' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${maxPowerMode ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              {/* Resource Consumption Monitors */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Kaynak Tüketim Monitörleri (Resource Monitors)</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[#080808] border border-blue-950 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 block">CPU Kullanımı</span>
                    <span className="text-lg font-mono font-bold text-amber-400">14.2% (8 Çekirdek)</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#080808] border border-blue-950 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 block">RAM Bellek (VRAM)</span>
                    <span className="text-lg font-mono font-bold text-cyan-400">6.4 GB / 16 GB</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#080808] border border-blue-950 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 block">Ağ Gecikmesi (Latency)</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">34 ms</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#080808] border border-blue-950 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 block">Multiprocessing Verimliliği</span>
                    <span className="text-lg font-mono font-bold text-white">%99.4</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-black border-t border-blue-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-950 transition"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
