import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Terminal,
  Zap,
  Cpu,
  Camera,
  MicOff,
  Mic,
} from 'lucide-react';
import { Cyber3DGlobe, GlobeAlert } from './components/Cyber3DGlobe';
import { LiveVectorMonitor3D } from './components/LiveVectorMonitor3D';
import { AsistayCenterHUD } from './components/AsistayCenterHUD';
import { AIVisionScreenModal } from './components/AIVisionScreenModal';
import { AsistayChatModal } from './components/AsistayChatModal';
import { FloatingChatHead, BackgroundProcess } from './components/FloatingChatHead';
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
import { stopUltraSpeech, setGlobalMute } from './utils/ultraTTS';
import { VoiceCommandResult } from './utils/voiceCommandHandler';
import { useVoiceCommandListener } from './utils/useVoiceCommandListener';
import {
  loadSecurityHistory,
  saveSecurityHistory,
  loadSystemSettings,
  saveSystemSettings,
  loadMicMuted,
  saveMicMuted,
  loadSavedTheme,
  saveTheme,
} from './utils/asistayStorage';
import { analyzePasswordCrypto, computeShannonEntropy } from './utils/quantumCryptoEngine';
import { inspectDeviceCapabilities, DeviceCapabilitiesReport } from './utils/permissionEngine';

const DEFAULT_ALERTS: GlobeAlert[] = [
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
];

export default function App() {
  const { isLowBattery } = useBatteryStatus();
  const [agentsTelemetry, setAgentsTelemetry] = useState<AgentTelemetry[]>([]);
  const [alerts, setAlerts] = useState<GlobeAlert[]>(() =>
    loadSecurityHistory(DEFAULT_ALERTS as any) as GlobeAlert[]
  );

  const [activeTab, setActiveTab] = useState<string>('asistan');
  const [isVisionOpen, setIsVisionOpen] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isScreenShareActive, setIsScreenShareActive] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(() => loadMicMuted(false));

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isApkOpen, setIsApkOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isOllamaOpen, setIsOllamaOpen] = useState<boolean>(false);
  const [isThemeOpen, setIsThemeOpen] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() =>
    loadSavedTheme<AppTheme>('oled')
  );

  // Interactive Cipher Breaker tool state for security tab (backed by real Web Crypto API)
  const [cipherInput, setCipherInput] = useState('Asistay#2026!');
  const [cipherEntropy, setCipherEntropy] = useState(() =>
    Math.min(100, Math.round((computeShannonEntropy('Asistay#2026!') / 96) * 100))
  );
  const [isCracking, setIsCracking] = useState(false);
  const [crackTimeEst, setCrackTimeEst] = useState('3.8 Trilyon Yıl (Kuantum Korumalı)');
  const [deviceCaps, setDeviceCaps] = useState<DeviceCapabilitiesReport | null>(null);
  const [serverAiConnected, setServerAiConnected] = useState<boolean>(false);

  const [settings, setSettings] = useState(() => loadSystemSettings());

  useEffect(() => {
    saveSecurityHistory(alerts as any);
  }, [alerts]);

  useEffect(() => {
    saveSystemSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveMicMuted(isMicMuted);
  }, [isMicMuted]);

  useEffect(() => {
    saveTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    agentManager.start();
    voiceNotificationService.start();

    inspectDeviceCapabilities().then(setDeviceCaps).catch(() => {});
    fetch('/api/cyber/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.aiModelConnected === 'boolean') {
          setServerAiConnected(data.aiModelConnected);
        }
      })
      .catch(() => {});

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
        ...prev.slice(0, 40),
      ]);
    });

    return () => {
      agentManager.stop();
      unsubTelemetry();
      unsubReports();
    };
  }, []);

  useEffect(() => {
    setGlobalMute(isMicMuted || !settings.autoSpeak);
  }, [isMicMuted, settings.autoSpeak]);

  const handleSendAssistantMessage = (msg: string) => {
    setAlerts((prev) => [
      {
        id: `msg-${Date.now()}`,
        title: 'Komuta Girişi',
        message: msg,
        severity: 'green',
      },
      ...prev.slice(0, 40),
    ]);
  };

  const handleToggleCamera = () => {
    setIsCameraActive((prev) => {
      const next = !prev;
      if (next) {
        setIsVisionOpen(true);
        handleSendAssistantMessage('Yapay zeka kamera görünümü aktif edildi.');
      }
      return next;
    });
  };

  const handleToggleScreenShare = () => {
    setIsScreenShareActive((prev) => {
      const next = !prev;
      if (next) {
        setIsVisionOpen(true);
        handleSendAssistantMessage('Canlı ekran paylaşımı / değişimi başlatıldı.');
      }
      return next;
    });
  };

  const handleToggleMicMute = () => {
    setIsMicMuted((prev) => {
      const next = !prev;
      if (next) {
        setSettings((s) => ({ ...s, continuousListening: false }));
        handleSendAssistantMessage('Sessiz mod (sesimi duymama) aktif: Mikrofon kapatıldı.');
      } else {
        handleSendAssistantMessage('Sessiz mod kapatıldı: Mikrofon izni hazır.');
      }
      return next;
    });
  };

  const handleOpenVisionAll = () => {
    setIsCameraActive(true);
    setIsScreenShareActive(true);
    setIsMicMuted(true);
    setSettings((s) => ({ ...s, continuousListening: false }));
    setIsVisionOpen(true);
  };

  const mainScrollRef = useRef<HTMLDivElement>(null);

  const handleSimulateCrack = useCallback(async () => {
    setIsCracking(true);
    playTacticalSound('command_exec');
    triggerHaptic('click');
    try {
      const result = await analyzePasswordCrypto(cipherInput);
      setCipherEntropy(result.strengthPercent);
      setCrackTimeEst(
        `${result.crackTimeEstimate} • SHA-256:${result.sha256Preview} (${result.pbkdf2DurationMs}ms)`
      );
      setAlerts((prev) => [
        {
          id: `crypto-${Date.now()}`,
          title: `Kripto Denetim (${result.quantumRating})`,
          message: `${result.shannonEntropyBits} bit Shannon entropi, PBKDF2 50k iterasyon ${result.pbkdf2DurationMs}ms içinde doğrulandı.`,
          severity: result.strengthPercent >= 65 ? 'green' : 'yellow',
        },
        ...prev.slice(0, 40),
      ]);
      triggerHaptic('success');
    } finally {
      setIsCracking(false);
    }
  }, [cipherInput]);

  const handleVoiceCommand = useCallback(
    (result: VoiceCommandResult, transcript: string) => {
      handleSendAssistantMessage(`Sesli Komut ("${transcript}"): ${result.feedbackText || result.action}`);

      switch (result.action) {
        case 'OPEN_SECURITY_RADAR':
          setActiveTab('guvenlik');
          break;
        case 'RUN_CIPHER_BREAKER':
          setActiveTab('guvenlik');
          handleSimulateCrack();
          break;
        case 'ENABLE_STEALTH_MODE':
          setSettings((s) => ({ ...s, stealthMode: true }));
          break;
        case 'DISABLE_STEALTH_MODE':
          setSettings((s) => ({ ...s, stealthMode: false }));
          break;
        case 'OPEN_CHAT':
          setIsChatOpen(true);
          break;
        case 'OPEN_VISION':
          setIsCameraActive(true);
          setIsVisionOpen(true);
          break;
        case 'TOGGLE_SCREEN_SHARE':
          setIsScreenShareActive(true);
          setIsVisionOpen(true);
          break;
        case 'OPEN_ADMIN_CENTER':
          setIsAdminOpen(true);
          break;
        case 'EMERGENCY':
          setIsEmergencyOpen(true);
          break;
        case 'STOP_SPEECH':
          stopUltraSpeech();
          break;
        case 'TOGGLE_MUTE': {
          const mute = result.target === 'mute';
          setGlobalMute(mute);
          setIsMicMuted(mute);
          if (mute) {
            setSettings((s) => ({ ...s, continuousListening: false }));
          }
          break;
        }
        case 'SET_THEME':
          if (result.target === 'oled' || result.target === 'parliament' || result.target === 'stealth') {
            setCurrentTheme(result.target);
            if (result.target === 'stealth') {
              setSettings((s) => ({ ...s, stealthMode: true }));
            }
          }
          break;
        case 'SWITCH_TAB':
          if (result.target === 'tools' || result.target === 'guvenlik') setActiveTab('guvenlik');
          else if (result.target === 'gecmis') setActiveTab('gecmis');
          else if (result.target === 'ayarlar' || result.target === 'personal') setActiveTab('ayarlar');
          else setActiveTab('asistan');
          break;
        case 'OPEN_MODAL':
          if (result.target === 'apk') setIsApkOpen(true);
          else if (result.target === 'ollama') setIsOllamaOpen(true);
          else if (result.target === 'theme') setIsThemeOpen(true);
          break;
        case 'CLOSE_MODAL':
          setIsVisionOpen(false);
          setIsChatOpen(false);
          setIsApkOpen(false);
          setIsAdminOpen(false);
          setIsEmergencyOpen(false);
          setIsOllamaOpen(false);
          setIsThemeOpen(false);
          setIsSettingsOpen(false);
          break;
        case 'CLEAR_LOGS':
          setAlerts((prev) => prev.slice(0, 1));
          break;
        case 'SCROLL_DOWN':
          mainScrollRef.current?.scrollBy({ top: 320, behavior: 'smooth' });
          break;
        case 'SCROLL_UP':
          mainScrollRef.current?.scrollBy({ top: -320, behavior: 'smooth' });
          break;
        case 'SCROLL_TOP':
          mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'SCROLL_BOTTOM':
          if (mainScrollRef.current) {
            mainScrollRef.current.scrollTo({
              top: mainScrollRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }
          break;
        case 'RUN_SCAN':
        case 'LIGHTSPEED_MODE':
        default:
          break;
      }
    },
    [handleSimulateCrack]
  );

  const {
    isListeningActive,
    lastTranscript,
    lastMatchedCommand,
    triggerVoicePhrase,
  } = useVoiceCommandListener({
    enabled: settings.continuousListening,
    isMicMuted,
    autoSpeak: settings.autoSpeak,
    onCommand: handleVoiceCommand,
  });

  const handleToggleVoiceListening = () => {
    triggerHaptic('click');
    if (isMicMuted) {
      setIsMicMuted(false);
      setSettings((s) => ({ ...s, continuousListening: true }));
    } else {
      setSettings((s) => ({ ...s, continuousListening: !s.continuousListening }));
    }
  };

  const systemStatus = alerts.some((a) => a.severity === 'red')
    ? 'breach'
    : isLowBattery || settings.stealthMode
    ? 'alert'
    : 'secure';

  const backgroundProcesses: BackgroundProcess[] = [
    {
      id: 'proc-dpi',
      name: 'Sentinel-X DPI',
      status: 'active',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      details: 'Ağ soketlerini, RTT gecikmesini ve derin paket trafiğini gerçek zamanlı denetler.',
      telemetry: [
        deviceCaps?.rttMs != null
          ? `${deviceCaps.networkType} • RTT ${deviceCaps.rttMs}ms`
          : `${deviceCaps?.networkType || 'AĞ'} • Aktif`,
      ],
    },
    {
      id: 'proc-pqc',
      name: 'Guardian-V PQC',
      status: deviceCaps?.webCryptoSupported === false ? 'warning' : 'active',
      icon: <Lock className="w-4 h-4 text-emerald-400" />,
      details: 'Donanım Web Crypto API (AES-256-GCM & SHA-256) ile cihaz belleğini ve yerel geçmişi korur.',
      telemetry: [
        deviceCaps?.storageUsedMb != null
          ? `Kasa: ${deviceCaps.storageUsedMb} MB • WebCrypto`
          : 'WebCrypto AES-256-GCM',
      ],
    },
    {
      id: 'proc-vpn',
      name: 'AI & Gizlilik Durumu',
      status: serverAiConnected ? 'active' : 'warning',
      icon: <Radio className="w-4 h-4 text-amber-400" />,
      details: serverAiConnected
        ? 'Gemini 4 Hydrogen sunucu AI uç noktası ve yerel izleme devrede.'
        : 'Harici AI anahtarı yoksa dürüst yerel motor çalışır; veriler cihaz dışına çıkmaz.',
      telemetry: [serverAiConnected ? 'Gemini 4 Bağlı' : 'Yerel Motor Aktif'],
    },
    {
      id: 'proc-vision',
      name: isMicMuted ? 'Sessiz Kalkan' : isCameraActive || isScreenShareActive ? 'Optik Ön İzleme' : 'Donanım İzinleri',
      status: isMicMuted ? 'warning' : 'active',
      icon: isMicMuted ? (
        <MicOff className="w-4 h-4 text-red-400" />
      ) : isCameraActive || isScreenShareActive ? (
        <Camera className="w-4 h-4 text-blue-400" />
      ) : (
        <Zap className="w-4 h-4 text-purple-400" />
      ),
      details: isMicMuted
        ? 'Sesimi duymama modu devrede; mikrofon oturumu ve dinleme kapalı.'
        : isCameraActive || isScreenShareActive
        ? 'Kamera önizlemesi yalnızca cihaz içinde; ekran paylaşımı MediaProjection/izin durumunu dürüstçe raporlar.'
        : `Kamera izni: ${deviceCaps?.cameraPermission || 'beklemede'} • Ekran API: ${
            deviceCaps?.screenShareSupported ? 'hazır' : 'MediaProjection gerekli'
          }`,
      telemetry: [
        isMicMuted
          ? 'Mikrofon Kapalı'
          : `${deviceCaps?.cpuCores || 4} Çekirdek • ${deviceCaps?.speechRecognitionSupported ? 'Ses Hazır' : 'Manuel Komut'}`,
      ],
    },
  ];

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
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  settings.stealthMode ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
              />
              {settings.stealthMode ? 'Gizli Mod (Stealth) Aktif' : 'Güvenlik merkezi'}
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
            <span>APK İndir</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('click');
              setActiveTab('ayarlar');
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
      <main ref={mainScrollRef} className="flex-1 overflow-y-auto px-4 pb-20 space-y-3 bg-[#000000] no-scrollbar">
        {/* ========================================================= */}
        {/* TAB 1: ASİSTAN (Matches uploaded screenshot 1:1) */}
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
              <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-tight z-20 shrink-0 pl-1 select-none pointer-events-none">
                <span className="text-cyan-400 font-bold block mb-1">—</span>
                <span className="block">GÜVENLİ</span>
                <span className="block">TEKNOLOJİ</span>
                <span className="block">DAHA GÜÇLÜ</span>
                <span className="block">İNSANLAR</span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <Cyber3DGlobe
                  minimalHomeView={true}
                  onAskAssistant={handleSendAssistantMessage}
                  isLowBattery={isLowBattery}
                  alerts={alerts}
                  agentsTelemetry={agentsTelemetry}
                />
              </div>

              <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-tight z-20 shrink-0 pr-1 text-right select-none pointer-events-none">
                <span className="text-cyan-400 font-bold block mb-1">—</span>
                <span className="block">TEKNOLOJİ</span>
                <span className="block">GÜVEN İÇİN</span>
              </div>
            </div>

            {/* Screen Sharing Status Card */}
            <div className="bg-[#050b14]/90 border border-blue-900/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition ${
                    isScreenShareActive
                      ? 'bg-blue-950/80 border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                      : 'bg-zinc-900/90 border-zinc-700/60 text-zinc-300'
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Ekran paylaşımı: {isScreenShareActive ? 'Aktif' : 'Kapalı'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {isScreenShareActive ? 'Canlı ekran akışı korunuyor' : 'Kullanıcı izni gerekir'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('success');
                  if (isScreenShareActive) {
                    setIsScreenShareActive(false);
                  } else {
                    handleOpenVisionAll();
                  }
                }}
                className={`px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-1.5 transition ${
                  isScreenShareActive
                    ? 'bg-emerald-600/80 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                }`}
              >
                <span>{isScreenShareActive ? 'Paylaşımı yönet' : 'İzin vererek başlat'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Central Expressive 3D Human Avatar & Surrounding Active Background Badges */}
            <AsistayCenterHUD
              isListening={isListeningActive || (!isMicMuted && settings.continuousListening)}
              onAvatarClick={() => {
                triggerHaptic('click');
                handleOpenVisionAll();
              }}
              onToggleVoiceCommand={handleToggleVoiceListening}
              lastVoiceCommand={lastMatchedCommand}
              lastTranscript={lastTranscript}
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

              <button
                onClick={() => {
                  triggerHaptic('click');
                  setActiveTab('ayarlar');
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
        {/* TAB 2: GÜVENLİK (Styled seamlessly like the Asistay home screen) */}
        {/* ========================================================= */}
        {activeTab === 'guvenlik' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-white tracking-wide">
                Güvenlik merkezi
              </span>
              <div className="flex-1 mx-3 h-[1px] bg-gradient-to-r from-blue-900/60 via-blue-800/30 to-transparent" />
              <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                CANLI 3D SAVUNMA
              </span>
            </div>

            <div className="bg-[#050b14]/90 border border-blue-900/40 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Siber Tehdit Radarı</h2>
                  <p className="text-xs text-zinc-400">Otonom D3 jeodezik takip devrede</p>
                </div>
              </div>
              <button
                onClick={() => setIsEmergencyOpen(true)}
                className="px-3.5 py-2 rounded-full bg-red-600/25 border border-red-500/60 text-xs font-semibold text-red-300 hover:bg-red-600 hover:text-white transition flex items-center gap-1.5"
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

            {/* Real-Time 3D Vector Process & Network Traffic Live Monitoring Layer */}
            <LiveVectorMonitor3D
              agentsTelemetry={agentsTelemetry}
              stealthMode={settings.stealthMode}
              isCameraActive={isCameraActive}
              isScreenShareActive={isScreenShareActive}
              isMicMuted={isMicMuted}
              onAskAssistant={handleSendAssistantMessage}
            />

            {/* Live Interactive Cipher Breaker & Entropy Card */}
            <div className="bg-[#050b14]/90 border border-blue-900/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    Canlı Şifre Kırıcı & Entropi Kalkanı
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-800/60">
                  ML-KEM-1024
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={cipherInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCipherInput(val);
                    setCipherEntropy(
                      Math.min(100, Math.max(8, Math.round((computeShannonEntropy(val) / 96) * 100)))
                    );
                  }}
                  placeholder="Test edilecek şifre veya hash..."
                  className="flex-1 bg-black/80 border border-blue-900/50 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleSimulateCrack}
                  disabled={isCracking}
                  className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs disabled:opacity-50 transition"
                >
                  {isCracking ? 'Test ediliyor...' : 'Analiz Et'}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/70 border border-blue-900/30 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Entropi Gücü:</span>
                  <span className="text-cyan-300 font-bold">
                    %{Math.round(cipherEntropy)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                    style={{ width: `${cipherEntropy}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                  <span>Kırılma Tahmini:</span>
                  <span className="text-emerald-400 font-semibold">{crackTimeEst}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: GEÇMİŞ (Styled seamlessly like the Asistay home screen) */}
        {/* ========================================================= */}
        {activeTab === 'gecmis' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-white tracking-wide">
                Güvenlik geçmişi
              </span>
              <div className="flex-1 mx-3 h-[1px] bg-gradient-to-r from-blue-900/60 via-blue-800/30 to-transparent" />
              <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                {alerts.length} KAYIT
              </span>
            </div>

            <div className="space-y-2.5">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="bg-[#050b14]/90 border border-blue-900/40 rounded-2xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                        al.severity === 'red'
                          ? 'bg-red-950/70 border-red-700/70 text-red-400'
                          : al.severity === 'yellow'
                          ? 'bg-amber-950/70 border-amber-700/70 text-amber-400'
                          : 'bg-blue-950/70 border-blue-800/60 text-blue-400'
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-white">{al.title}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{al.message}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: AYARLAR (Styled seamlessly like the Asistay home screen) */}
        {/* ========================================================= */}
        {activeTab === 'ayarlar' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-white tracking-wide">
                Sistem ayarları
              </span>
              <div className="flex-1 mx-3 h-[1px] bg-gradient-to-r from-blue-900/60 via-blue-800/30 to-transparent" />
              <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                KİŞİSELLEŞTİR
              </span>
            </div>

            {/* Direct APK Download Banner */}
            <div className="bg-[#050b14]/90 border border-blue-900/40 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-cyan-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Android APK & WebAPK</h3>
                  <p className="text-xs text-zinc-400">Hemen telefona kur veya paket indir</p>
                </div>
              </div>
              <button
                onClick={() => setIsApkOpen(true)}
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition"
              >
                <span>APK İndir</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Control Cards */}
            <div className="bg-[#050b14]/90 border border-blue-900/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between py-1">
                <div>
                  <h4 className="text-sm font-bold text-white">Sessiz Mod (Sesimi Duyma)</h4>
                  <p className="text-xs text-zinc-400">
                    Mikrofon dinlemesini tamamen susturur
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isMicMuted}
                  onChange={handleToggleMicMute}
                  className="w-5 h-5 rounded accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-blue-900/30 pt-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Sürekli Ses Dinleme</h4>
                  <p className="text-xs text-zinc-400">
                    Mikrofon arka planda anahtar kelimeleri yakalar
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={!isMicMuted && settings.continuousListening}
                  onChange={(e) => {
                    if (e.target.checked) setIsMicMuted(false);
                    setSettings((s) => ({
                      ...s,
                      continuousListening: e.target.checked,
                    }));
                  }}
                  className="w-5 h-5 rounded accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-blue-900/30 pt-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Gizli Mod (Stealth Mode)</h4>
                  <p className="text-xs text-zinc-400">
                    Ağ telemetrisini gizler ve düşük iz profilini devreye alır
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.stealthMode}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, stealthMode: e.target.checked }))
                  }
                  className="w-5 h-5 rounded accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-blue-900/30 pt-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Otomatik Sesli Yanıt (TTS)</h4>
                  <p className="text-xs text-zinc-400">
                    Asistay yanıtları doğal sesle seslendirilir
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSpeak}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, autoSpeak: e.target.checked }))
                  }
                  className="w-5 h-5 rounded accent-blue-600"
                />
              </div>

              {/* Quick Voice Command Keywords */}
              <div className="border-t border-blue-900/30 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" />
                    Sesli Komut Tetikleyicileri
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {isListeningActive ? 'MİKROFON DİNLİYOR' : 'HAZIR'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Open Security Radar',
                    'Run Cipher Breaker',
                    'Enable Stealth Mode',
                  ].map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => triggerVoicePhrase(cmd)}
                      className="px-2.5 py-1 rounded-xl bg-blue-950/70 border border-blue-800/60 hover:border-cyan-400 text-[10px] font-mono text-cyan-200 transition"
                    >
                      &ldquo;{cmd}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub-modals entry points */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="bg-[#050b14]/90 border border-blue-900/40 hover:border-cyan-500/60 p-3.5 rounded-2xl text-left transition flex items-center justify-between"
              >
                <div>
                  <Terminal className="w-4 h-4 text-cyan-400 mb-1.5" />
                  <p className="text-xs font-bold text-white">Komuta Konsolu</p>
                  <p className="text-[10px] text-zinc-500">Ajan telemetrisi</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </button>

              <button
                onClick={() => setIsOllamaOpen(true)}
                className="bg-[#050b14]/90 border border-blue-900/40 hover:border-blue-500/60 p-3.5 rounded-2xl text-left transition flex items-center justify-between"
              >
                <div>
                  <Cpu className="w-4 h-4 text-blue-400 mb-1.5" />
                  <p className="text-xs font-bold text-white">Ollama / Yerel AI</p>
                  <p className="text-[10px] text-zinc-500">Çevrimdışı motor</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MESSENGER-STYLE FLOATING CHAT HEAD WITH EMOTIONS & 3-PART CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <FloatingChatHead
        isListening={!isMicMuted && settings.continuousListening}
        isProcessing={isCracking}
        llmExecutionMode="local"
        isCameraActive={isCameraActive}
        isScreenShareActive={isScreenShareActive}
        isMicMuted={isMicMuted}
        onToggleCamera={handleToggleCamera}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleMicMute={handleToggleMicMute}
        onToggleListening={() =>
          setSettings((s) => ({ ...s, continuousListening: !s.continuousListening }))
        }
        onOpenAdminCenter={() => setIsAdminOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSettings={() => setActiveTab('ayarlar')}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        systemStatus={systemStatus}
        activeProcesses={backgroundProcesses}
        alerts={alerts}
        onDismissAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
      />

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM NAVIGATION: 4 TABS WITH TOP BLUE ACTIVE BAR */}
      {/* ------------------------------------------------------------- */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}
      <AIVisionScreenModal
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
        cameraEnabled={isCameraActive}
        screenShareEnabled={isScreenShareActive}
        micMuted={isMicMuted}
        onToggleCamera={handleToggleCamera}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleMicMute={handleToggleMicMute}
      />

      <AsistayChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onAskAI={handleSendAssistantMessage}
      />

      <MobileApkModal isOpen={isApkOpen} onClose={() => setIsApkOpen(false)} />

      <AdminCommandCenterModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        agentsTelemetry={agentsTelemetry}
      />

      <EmergencyShieldModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onEmergencyTriggered={() => {}}
      />

      <OllamaSetupModal
        isOpen={isOllamaOpen}
        onClose={() => setIsOllamaOpen(false)}
      />

      <ThemeManagerModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSetting={(k, v) => setSettings((s) => ({ ...s, [k]: v }))}
      />
    </div>
  );
}
