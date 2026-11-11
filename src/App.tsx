import React, { useState, useEffect } from 'react';
import { FloatingChatHead, BackgroundProcess } from './components/FloatingChatHead';
import { Cyber3DGlobe } from './components/Cyber3DGlobe';
import { AdminCommandCenterModal } from './components/AdminCommandCenterModal';
import { MobileApkModal } from './components/MobileApkModal';
import { EmergencyShieldModal } from './components/EmergencyShieldModal';
import { OllamaSetupModal } from './components/OllamaSetupModal';
import { ThemeManagerModal, AppTheme } from './components/ThemeManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { ReceiptUploadModal } from './components/ReceiptUploadModal';
import { agentManager, AgentTelemetry, AgentReport } from './utils/AgentManager';
import { voiceNotificationService } from './utils/VoiceNotificationService';
import { useBatteryStatus } from './utils/useBatteryStatus';
import { triggerHaptic } from './utils/haptics';
import { Shield, Terminal, Zap, Globe, Activity, Lock, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { level, isLowBattery, charging } = useBatteryStatus();
  const [agentsTelemetry, setAgentsTelemetry] = useState<AgentTelemetry[]>([]);
  const [alerts, setAlerts] = useState<Array<{ id: string, title: string, message: string, severity: 'red' | 'yellow' | 'green' }>>([
    { id: '1', title: 'Sistem Başlatıldı', message: 'Saf Siyah Minimalist 3D Küre ve Komuta Merkezi aktif.', severity: 'green' }
  ]);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isApkOpen, setIsApkOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isOllamaOpen, setIsOllamaOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSplitWiseOpen, setIsSplitWiseOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('oled');

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
      setAlerts(prev => [...prev, { 
        id: report.id, 
        title: `${report.agentName}: ${report.title}`, 
        message: report.message, 
        severity: report.type === 'critical' ? 'red' : report.type === 'warning' ? 'yellow' : 'green' 
      }]);
    });

    return () => {
      agentManager.stop();
      unsubTelemetry();
      unsubReports();
    };
  }, []);

  const handleSendFloatingMessage = (msg: string) => {
    setAlerts(prev => [...prev, {
      id: `msg-${Date.now()}`,
      title: 'Asistan Komutu',
      message: msg,
      severity: 'green',
    }]);
  };

  const backgroundProcesses: BackgroundProcess[] = [
    {
      id: 'proc-1',
      name: 'Sentinel-X DPI',
      status: 'active',
      icon: <Activity className="w-4 h-4 text-blue-400" />,
      details: 'Gerçek zamanlı derin paket incelemesi ve anomali tespiti.',
      telemetry: ['[OK] Soketler izleniyor', '[OK] SYN Flood koruması aktif'],
    },
    {
      id: 'proc-2',
      name: 'Guardian-V PQC',
      status: 'active',
      icon: <Lock className="w-4 h-4 text-emerald-400" />,
      details: 'Kuantum dirençli şifreleme ve bütünlük doğrulaması.',
      telemetry: ['[OK] ML-KEM anahtar değişimi', '[OK] Bellek arabelleği şifrelendi'],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden select-none">
      
      {/* Top Minimalist Header Bar */}
      <header className="h-14 bg-black/80 backdrop-blur-xl border-b border-blue-900/30 px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-950 to-blue-600 p-0.5 border border-blue-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Shield className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="font-black text-sm tracking-widest uppercase text-white">
            Elite Cyber Core <span className="text-blue-500">v4.2</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-600/60 text-blue-300 hover:text-white text-xs font-mono font-bold transition shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            title="Entegre Yönetici ve İzleme Komuta Merkezi"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Komuta Merkezi</span>
          </button>
        </div>
      </header>

      {/* Main Full-Screen Immersive Background: 3D Globe & Minimalist Interface */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-5xl my-auto z-10">
          <Cyber3DGlobe onAskAssistant={handleSendFloatingMessage} isLowBattery={isLowBattery} />
        </div>
      </main>

      {/* Single Floating Chat Bubble with Distinct Pupils */}
      <FloatingChatHead
        isListening={settings.continuousListening}
        isProcessing={false}
        llmExecutionMode="local"
        activeProcesses={backgroundProcesses}
        alerts={alerts}
        onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
        onToggleListening={() => setSettings(s => ({...s, continuousListening: !s.continuousListening}))}
        onOpenAdminCenter={() => setIsAdminOpen(true)}
        onOpenSplitWise={() => setIsSplitWiseOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        systemStatus={alerts.some(a => a.severity === 'red') ? 'breach' : isLowBattery ? 'alert' : 'secure'}
      />

      {/* Integrated Admin & Monitoring Command Center Modal */}
      <AdminCommandCenterModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        agentsTelemetry={agentsTelemetry}
      />

      {/* Secondary Modals */}
      <MobileApkModal isOpen={isApkOpen} onClose={() => setIsApkOpen(false)} />
      <EmergencyShieldModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} onEmergencyTriggered={() => {}} />
      <OllamaSetupModal isOpen={isOllamaOpen} onClose={() => setIsOllamaOpen(false)} />
      <ThemeManagerModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} currentTheme={currentTheme} onSelectTheme={setCurrentTheme} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdateSetting={(k, v) => setSettings(s => ({...s, [k]: v}))} />
      <ReceiptUploadModal isOpen={isSplitWiseOpen} onClose={() => setIsSplitWiseOpen(false)} onReceiptParsed={() => {}} />
    </div>
  );
}
