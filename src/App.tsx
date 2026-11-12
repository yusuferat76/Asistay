import React, { useState, useEffect } from 'react';
import { FloatingChatHead, BackgroundProcess } from './components/FloatingChatHead';
import { DigitalAgentAvatar } from './components/DigitalAgentAvatar';
import { BottomNav } from './components/BottomNav';
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
import { Shield, Terminal, Zap, Globe, Activity, Lock, Cpu, Settings } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState('asistan');

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden select-none">
      
      {/* Top Minimalist Header Bar */}
      <header className="h-14 bg-black border-b border-blue-900/30 px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-500" />
          <span className="font-black text-sm tracking-widest uppercase text-white">Asistay</span>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-black p-4 space-y-4">
        {activeTab === 'asistan' && (
          <>
            {/* Header section (Figma) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-500" />
                <div>
                  <h1 className="text-xl font-bold">Asistay</h1>
                  <p className="text-xs text-blue-400">● Güvenlik merkezi</p>
                </div>
              </div>
              <Settings className="w-6 h-6 text-gray-400" />
            </div>

            {/* Live Monitoring Nexus (Globe) */}
            <div className="relative h-64 rounded-3xl border border-blue-900/40 overflow-hidden bg-black shadow-[0_0_40px_rgba(0,0,0,0.8)]">
               <Cyber3DGlobe onAskAssistant={handleSendFloatingMessage} isLowBattery={isLowBattery} />
               
               {/* Edge Service Icons */}
               <div className="absolute top-4 left-4 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/50 border border-blue-700/50 flex items-center justify-center"><Activity className="w-5 h-5 text-cyan-400" /></div>
                  <div className="w-10 h-10 rounded-xl bg-blue-950/50 border border-blue-700/50 flex items-center justify-center"><Lock className="w-5 h-5 text-emerald-400" /></div>
               </div>
            </div>

            {/* Ajan ve PTT Bölümü */}
            <div className="flex items-center justify-between px-2">
               <DigitalAgentAvatar />
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
            </div>

             {/* Daily Summary Card */}
             <div className="bg-black border border-blue-900/30 rounded-2xl p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Shield className="w-6 h-6 text-blue-500" />
                 <div>
                    <p className="text-sm font-bold">Bugünkü güvenlik özeti</p>
                    <p className="text-xs text-gray-500">İzinli kontrollerini buradan yönetebilirsin.</p>
                 </div>
               </div>
               <span className="text-xs text-gray-400">10:24</span>
             </div>

             {/* Quick Actions */}
             <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setIsSplitWiseOpen(true)} className="bg-black border border-blue-900/30 p-3 rounded-2xl text-center">
                    <div className="flex justify-center mb-1"><Shield className="w-5 h-5"/></div>
                    <p className="text-xs font-bold">Sohbet</p>
                </button>
                <button onClick={() => setIsAdminOpen(true)} className="bg-black border border-blue-900/30 p-3 rounded-2xl text-center">
                    <div className="flex justify-center mb-1"><Shield className="w-5 h-5"/></div>
                    <p className="text-xs font-bold">Güvenlik</p>
                </button>
                <button onClick={() => setIsSettingsOpen(true)} className="bg-black border border-blue-900/30 p-3 rounded-2xl text-center">
                    <div className="flex justify-center mb-1"><Settings className="w-5 h-5"/></div>
                    <p className="text-xs font-bold">Ayarlar</p>
                </button>
             </div>
          </>
        )}
        {/* Placeholder for other tabs */}
        {activeTab !== 'asistan' && (
           <div className="p-8 text-center text-gray-500">Bu bölüm yapım aşamasında: {activeTab}</div>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <AdminCommandCenterModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} agentsTelemetry={agentsTelemetry} />
      <MobileApkModal isOpen={isApkOpen} onClose={() => setIsApkOpen(false)} />
      <EmergencyShieldModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} onEmergencyTriggered={() => {}} />
      <OllamaSetupModal isOpen={isOllamaOpen} onClose={() => setIsOllamaOpen(false)} />
      <ThemeManagerModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} currentTheme={currentTheme} onSelectTheme={setCurrentTheme} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdateSetting={(k, v) => setSettings(s => ({...s, [k]: v}))} />
      <ReceiptUploadModal isOpen={isSplitWiseOpen} onClose={() => setIsSplitWiseOpen(false)} onReceiptParsed={() => {}} />
    </div>
  );
}
