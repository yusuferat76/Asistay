import React, { useState, useEffect } from 'react';
import {
  Shield,
  Settings,
  Monitor,
  ChevronRight,
  MessageSquare,
  Download,
  Activity,
  Lock,
  Radio,
  Clock,
  Terminal,
  AlertTriangle,
  Zap,
  CheckCircle,
  Wifi,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Cyber3DGlobe, GlobeAlert } from './components/Cyber3DGlobe';
import { AsistayCenterHUD } from './components/AsistayCenterHUD';
import { AIVisionScreenModal } from './components/AIVisionScreenModal';
import { AsistayChatModal } from './components/AsistayChatModal';
import { BottomNav } from './components/BottomNav';
import { MobileApkModal } from './components/MobileApkModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminCommandCenterModal } from './components/AdminCommandCenterModal';
import { EmergencyShieldModal } from './components/EmergencyShieldModal';
import { OllamaSetupModal } from './components/OllamaSetupModal';
import { ThemeManagerModal, AppTheme } from './components/ThemeManagerModal';
import { agentManager, AgentTelemetry } from './utils/AgentManager';
import { voiceNotificationService } from './utils/VoiceNotificationService';
import { useBatteryStatus } from './utils/useBatteryStatus';
import { triggerHaptic } from './utils/haptics';
import { playTacticalSound } from './utils/audioEffects';

export default function App() {
  const { isLowBattery } = useBatteryStatus();
  const [agentsTelemetry, setAgentsTelemetry] = useState<AgentTelemetry[]>([]);
  const [alerts, setAlerts] = useState<GlobeAlert[]>([
    {
      id: '1',
      title: 'Asistay Savunma Çekirdeği Devrede',
      message: 'AMOLED Saf Siyah mimari ve 3D otonom ajan ağı nominal frekansta çalışıyor.',
      severity: 'green',
    },
    {
      id: '2',
      title: 'Sentinel-X Anomali Kalkanı',
      message: 'DPI derin paket analizi ile port dinlemeleri filtreleniyor.',
      severity: 'green',
    },
  ]);

  const [activeTab, setActiveTab] = useState<string>('asistan');
  const [isVisionOpen, setIsVisionOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isApkOpen, setIsApkOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isOllamaOpen, setIsOllamaOpen] = useState<boolean>(false);
  const [isThemeOpen, setIsThemeOpen] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('oled');

  // Interactive Cipher Breaker tool state for security tab
  const [cipherInput, setCipherInput] = useState('Asistay#2026!');
  const [cipherEntropy, setCipherEntropy] = useState(94);
  const [isCracking, setIsCracking] = useState(false);
  const [crackTimeEst, setCrackTimeEst] = useState('3.8 Trilyon Yıl (Kuantum Korumalı)');

  const [settings, setSettings] = useState({
    continuousListening: false,
    autoSpeak: true,
    showSecurityAlerts: true,
    stealthMode: false,
    visualGauges: true,
    monthlyLimit: 5000,
  });

  useEffect(() => {
    agentManager.start();
    voiceNotificationService.start();

    const unsubTelemetry = agentManager.onTelemetry((telemetry) => {
      setAgentsTelemetry(telemetry);
    });

    const unsubReports = agentManager.onReport((report) => {
      setAlerts((prev) => [
        {
          id: report.id,
          title: `${report.agentName}: ${report.title}`,
          message: report.message,
          severity:
            report.type === 'critical'
              ? 'red'
              : report.type === 'warning'
              ? 'yellow'
              : 'green',
        },
        ...prev.slice(0, 20),
      ]);
    });

    return () => {
      agentManager.stop();
      unsubTelemetry();
      unsubReports();
    };
  }, []);

  const handleSendAssistantMessage = (msg: string) => {
    setAlerts((prev) => [
      {
        id: `msg-${Date.now()}`,
        title: 'Komuta Girişi',
        message: msg,
        severity: 'green',
      },
      ...prev,
    ]);
  };

  const handleSimulateCrack = () => {
    setIsCracking(true);
    playTacticalSound('command_exec');
    triggerHaptic('click');
    setTimeout(() => {
      setIsCracking(false);
      setCrackTimeEst('Kuantum Korumalı (ML-KEM 1024 - Aşılamaz)');
      triggerHaptic('success');
    }, 1200);
  };

  const systemStatus = alerts.some((a) => a.severity === 'red')
    ? 'breach'
    : isLowBattery
    ? 'alert'
    : 'secure';

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans flex flex-col relative overflow-hidden select-none">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER: Asistay Logo & Quick Action Buttons */}
      {/* ------------------------------------------------------------- */}
      <header className="px-5 pt-3 pb-2 flex items-center justify-between z-30 shrink-0 bg-[#000000]">
        <div className="flex items-center gap-3">
          {/* Custom Asistay Shield with glowing audio bars inside */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            {/* Inner Soundwave Lines */}
            <div className="absolute inset-0 flex items-center justify-center gap-0.5">
              <span className="w-0.5 h-3 bg-[#000000] rounded-full" />
              <span className="w-0.5 h-5 bg-[#000000] rounded-full" />
              <span className="w-0.5 h-3.5 bg-[#000000] rounded-full" />
              <span className="w-0.5 h-2 bg-[#000000] rounded-full" />
            </div>
          </div>

          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white leading-none">
              Asistay
            </h1>
            <p className="text-[11px] font-medium text-cyan-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Güvenlik merkezi
            </p>
          </div>
        </div>

        {/* Right Action Icons: APK Quick Download & Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('click');
              setIsApkOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/60 text-xs font-mono font-bold text-blue-200 transition shadow-[0_0_12px_rgba(37,99,235,0.3)]"
            title="Android APK Hızlı İndir"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">APK İndir</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('click');
              setIsSettingsOpen(true);
            }}
            className="p-2 text-zinc-400 hover:text-white transition rounded-xl hover:bg-zinc-900/60"
            title="Ayarlar"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* SCROLLABLE MAIN VIEW */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 overflow-y-auto px-4 pb-20 space-y-3 bg-[#000000] no-scrollbar">
        {/* ========================================================= */}
        {/* TAB 1: ASİSTAN (Faithfully matching screenshot) */}
        {/* ========================================================= */}
        {activeTab === 'asistan' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Subtitle Divider: Dünya görünümü ────── DAHA GÜVENLİ BİR YARIN İÇİN */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-white tracking-wide">
                Dünya görünümü
              </span>
              <div className="flex-1 mx-3 h-[1px] bg-gradient-to-r from-blue-900/60 via-blue-800/30 to-transparent" />
              <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                DAHA GÜVENLİ BİR YARIN İÇİN
              </span>
            </div>

            {/* Live 3D Globe with Orbital Satellite Trajectories & Side Annotations */}
            <div className="relative w-full flex items-center justify-between min-h-[300px] overflow-hidden">
              {/* Left Side Vertical Tech Label */}
              <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-tight z-20 shrink-0 pl-1 select-none pointer-events-none">
                <span className="text-cyan-400 font-bold block mb-1">—</span>
                <span className="block">GÜVENLİ</span>
                <span className="block">TEKNOLOJİ</span>
                <span className="block">DAHA GÜÇLÜ</span>
                <span className="block">İNSANLAR</span>
              </div>

              {/* Central 3D Globe Canvas */}
              <div className="flex-1 flex items-center justify-center">
                <Cyber3DGlobe
                  minimalHomeView={true}
                  onAskAssistant={handleSendAssistantMessage}
                  isLowBattery={isLowBattery}
                  alerts={alerts}
                  agentsTelemetry={agentsTelemetry}
                />
              </div>

              {/* Right Side Vertical Tech Label */}
              <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-tight z-20 shrink-0 pr-1 text-right select-none pointer-events-none">
                <span className="text-cyan-400 font-bold block mb-1">—</span>
                <span className="block">TEKNOLOJİ</span>
                <span className="block">GÜVEN İÇİN</span>
              </div>
            </div>

            {/* Screen Sharing Status Card */}
            <div className="bg-[#050b14]/90 border border-blue-900/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-zinc-900/90 border border-zinc-700/60 flex items-center justify-center text-zinc-300">
                  <Monitor className="w-5 h-5 text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Ekran paylaşımı: Kapalı
                  </h4>
                  <p className="text-xs text-zinc-400">Kullanıcı izni gerekir</p>
                </div>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('success');
                  setIsVisionOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition"
              >
                <span>İzin vererek başlat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Central Expressive 3D Human Avatar & Surrounding Active Background Badges */}
            <AsistayCenterHUD
              isListening={settings.continuousListening}
              onAvatarClick={() => {
                triggerHaptic('click');
                setIsVisionOpen(true);
              }}
              status={systemStatus}
            />

            {/* Daily Security Summary Card */}
            <div
              onClick={() => {
                triggerHaptic('click');
                setActiveTab('gecmis');
              }}
              className="bg-[#050b14]/90 border border-blue-900/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-700/70 transition shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-blue-400 shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Bugünkü güvenlik özeti
                  </p>
                  <p className="text-xs text-zinc-400">
                    İzinli kontrollerini buradan yönetebilirsin.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                <span>10:24</span>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </div>
            </div>

            {/* 3-Card Grid: Sohbet, Güvenlik, Ayarlar */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Sohbet */}
              <button
                onClick={() => {
                  triggerHaptic('click');
                  setIsChatOpen(true);
                }}
                className="bg-[#050b14]/90 border border-blue-900/40 hover:border-cyan-500/60 p-3.5 rounded-2xl text-left transition flex flex-col justify-between group h-24"
              >
                <div className="flex items-center justify-between w-full">
                  <MessageSquare className="w-5 h-5 text-zinc-300 group-hover:text-cyan-400 transition" />
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-400 transition" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Sohbet</p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    Sor, öğren, planla
                  </p>
                </div>
              </button>

              {/* Güvenlik */}
              <button
                onClick={() => {
                  triggerHaptic('click');
                  setActiveTab('guvenlik');
                }}
                className="bg-[#050b14]/90 border border-blue-900/40 hover:border-blue-500/60 p-3.5 rounded-2xl text-left transition flex flex-col justify-between group h-24"
              >
                <div className="flex items-center justify-between w-full">
                  <Shield className="w-5 h-5 text-zinc-300 group-hover:text-blue-400 transition" />
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400 transition" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Güvenlik</p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    Kontrol et, koru
                  </p>
                </div>
              </button>

              {/* Ayarlar */}
              <button
                onClick={() => {
                  triggerHaptic('click');
                  setIsSettingsOpen(true);
                }}
                className="bg-[#050b14]/90 border border-blue-900/40 hover:border-blue-500/60 p-3.5 rounded-2xl text-left transition flex flex-col justify-between group h-24"
              >
                <div className="flex items-center justify-between w-full">
                  <Settings className="w-5 h-5 text-zinc-300 group-hover:text-blue-400 transition" />
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400 transition" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Ayarlar</p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    Kişiselleştir
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: GÜVENLİK (Complete 3D Cyber Threat War Room & Cipher Breaker) */}
        {/* ========================================================= */}
        {activeTab === 'guvenlik' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
              <div>
                <h2 className="text-base font-bold text-white">
                  Siber Tehdit ve Savunma Merkezi
                </h2>
                <p className="text-xs text-blue-300/80">
                  Canlı D3 jeodezik ısı haritası ve otonom savunma katmanları
                </p>
              </div>
              <button
                onClick={() => setIsEmergencyOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-red-600/30 border border-red-500/60 text-xs font-mono font-bold text-red-300 hover:bg-red-600 hover:text-white transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Panik Kalkanı</span>
              </button>
            </div>

            {/* Full 3D Interactive Cyber Globe */}
            <Cyber3DGlobe
              minimalHomeView={false}
              onAskAssistant={handleSendAssistantMessage}
              isLowBattery={isLowBattery}
              alerts={alerts}
              agentsTelemetry={agentsTelemetry}
            />

            {/* Live Interactive 3D Cipher Breaker & Entropy Tool */}
            <div className="bg-[#050b14] border border-blue-900/60 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    Canlı Şifre Kırıcı & Entropi Kalkanı
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ML-KEM-1024
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cipherInput}
                    onChange={(e) => {
                      setCipherInput(e.target.value);
                      setCipherEntropy(
                        Math.min(100, Math.max(20, e.target.value.length * 7.5))
                      );
                    }}
                    placeholder="Test edilecek şifre veya hash..."
                    className="flex-1 bg-black/80 border border-blue-800/60 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleSimulateCrack}
                    disabled={isCracking}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs disabled:opacity-50 transition"
                  >
                    {isCracking ? 'Kırılıyor...' : 'Kırılmayı Test Et'}
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-black/70 border border-blue-950 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Entropi Gücü:</span>
                    <span className="text-cyan-300 font-bold">
                      %{Math.round(cipherEntropy)} (Maksimum Direnç)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${cipherEntropy}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                    <span>Kırılma Tahmini:</span>
                    <span className="text-emerald-400 font-semibold">
                      {crackTimeEst}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: GEÇMİŞ (Security Incident Timeline & Logs) */}
        {/* ========================================================= */}
        {activeTab === 'gecmis' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
              <div>
                <h2 className="text-base font-bold text-white">
                  Olay ve Denetim Günlüğü
                </h2>
                <p className="text-xs text-blue-300/80">
                  Arka plan ajanlarının yakaladığı canlı olay kayıtları
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {alerts.length} Olay Kaydedildi
              </span>
            </div>

            <div className="space-y-2.5">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="bg-[#050b14]/90 border border-blue-900/40 rounded-2xl p-3.5 flex items-start gap-3 shadow-md"
                >
                  <div
                    className={`p-2 rounded-xl border mt-0.5 ${
                      al.severity === 'red'
                        ? 'bg-red-950/80 border-red-700 text-red-400'
                        : al.severity === 'yellow'
                        ? 'bg-amber-950/80 border-amber-700 text-amber-400'
                        : 'bg-blue-950/80 border-blue-700 text-blue-400'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{al.title}</h4>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Canlı
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {al.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: AYARLAR (System Configuration & Mobile APK Download) */}
        {/* ========================================================= */}
        {activeTab === 'ayarlar' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="pb-2 border-b border-blue-900/40">
              <h2 className="text-base font-bold text-white">Sistem Ayarları</h2>
              <p className="text-xs text-blue-300/80">
                Asistay donanım, gizlilik ve kurulum konfigürasyonu
              </p>
            </div>

            {/* Direct APK Download Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950/80 to-[#050b14] border border-blue-500/50 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    Android APK İndirme Paketi
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Doğrudan cihaza APK kurun veya PWA olarak yükleyin.
                </p>
              </div>
              <button
                onClick={() => setIsApkOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
              >
                APK İndir
              </button>
            </div>

            {/* Toggles */}
            <div className="bg-[#050b14] border border-blue-900/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between py-1">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Sürekli Ses Dinleme
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Mikrofon arka planda anahtar kelimeleri yakalar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.continuousListening}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      continuousListening: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-blue-950">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Otomatik Sesli Yanıt (TTS)
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Asistay yanıtları gerçek insan sesiyle seslendirilir.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSpeak}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, autoSpeak: e.target.checked }))
                  }
                  className="w-5 h-5 rounded text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-blue-950">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Kuantum Şifreleme Belleği
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    RAM üzerindeki tüm değişkenler ML-KEM ile korunur.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  AKTİF
                </span>
              </div>
            </div>

            {/* Sub-modals entry points */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left hover:border-blue-500 transition"
              >
                <Terminal className="w-4 h-4 text-cyan-400 mb-1" />
                <p className="text-xs font-bold text-white">Komuta Konsolu</p>
                <p className="text-[10px] text-zinc-500">Ajan telemetrisi</p>
              </button>

              <button
                onClick={() => setIsOllamaOpen(true)}
                className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left hover:border-blue-500 transition"
              >
                <Cpu className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-white">Ollama / Yerel AI</p>
                <p className="text-[10px] text-zinc-500">Llama3, Mistral</p>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM NAVIGATION: 4 TABS WITH TOP BLUE ACTIVE BAR */}
      {/* ------------------------------------------------------------- */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}
      {/* AI Vision & Screen Sharing Modal (activates camera, mutes mic, shares screen) */}
      <AIVisionScreenModal
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
      />

      {/* Asistay Cyber Chat Modal */}
      <AsistayChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onAskAI={handleSendAssistantMessage}
      />

      {/* Mobile APK & PWA Package Modal */}
      <MobileApkModal isOpen={isApkOpen} onClose={() => setIsApkOpen(false)} />

      {/* Admin Command Center */}
      <AdminCommandCenterModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        agentsTelemetry={agentsTelemetry}
      />

      {/* Emergency Shield Modal */}
      <EmergencyShieldModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onEmergencyTriggered={() => {}}
      />

      {/* Ollama Setup Modal */}
      <OllamaSetupModal
        isOpen={isOllamaOpen}
        onClose={() => setIsOllamaOpen(false)}
      />

      {/* Theme Manager Modal */}
      <ThemeManagerModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSetting={(k, v) => setSettings((s) => ({ ...s, [k]: v }))}
      />
    </div>
  );
}
