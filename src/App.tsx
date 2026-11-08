import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CyberToolsHub } from './components/CyberToolsHub';
import { PersonalAssistantHub } from './components/PersonalAssistantHub';
import { PhoneTrackerHub } from './components/PhoneTrackerHub';
import { FloatingChatHead, BackgroundProcess } from './components/FloatingChatHead';
import { MobileApkModal } from './components/MobileApkModal';
import { EmergencyShieldModal } from './components/EmergencyShieldModal';
import { OllamaSetupModal } from './components/OllamaSetupModal';
import { ThemeManagerModal, AppTheme } from './components/ThemeManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { ReceiptUploadModal } from './components/ReceiptUploadModal';
import { parseTurkishVoiceCommand } from './utils/voiceCommandHandler';
import { useBatteryStatus } from './utils/useBatteryStatus';
import { agentManager, AgentTelemetry, AgentReport } from './utils/AgentManager';
import { voiceNotificationService } from './utils/VoiceNotificationService';

import { DigitalFootprintSanitizerModal } from './components/DigitalFootprintSanitizerModal';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { TacticalHUD } from './components/TacticalHUD';
import { DevConsole } from './components/DevConsole';
import { CommandPalette } from './components/CommandPalette';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LockScreenModule } from './components/LockScreenModule';
import { EliteAvatar } from './components/EliteAvatar';
import { DraggableWindow } from './components/DraggableWindow';
import { Cyber3DGlobe } from './components/Cyber3DGlobe';
import { CyberMatrixDashboard } from './components/CyberMatrixDashboard';
import { DefensiveArchitectureHub } from './components/DefensiveArchitectureHub';
import { TacticalInventoryHub } from './components/TacticalInventoryHub';
import { speakUltraRealistic } from './utils/ultraTTS';
import { 
  Cpu, 
  Shield, 
  Mic, 
  Battery, 
  Terminal, 
  Eye, 
  Layout, 
  Rocket, 
  MessageSquare,
  Activity,
  AlertCircle,
  Zap,
  Globe,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { level, isLowBattery, charging } = useBatteryStatus();
  const [activeTab, setActiveTab] = useState<'assistant' | 'tools' | 'personal' | 'phone-tracker' | 'architecture' | 'tactical-inventory'>('assistant');
  const [interfaceTab, setInterfaceTab] = useState<'chat' | 'preview' | 'deploy'>('preview');

  // Agent State
  const [agentsTelemetry, setAgentsTelemetry] = useState<AgentTelemetry[]>([]);
  const [aiLogs, setAiLogs] = useState<string[]>(['Ollama Engine Idle.', 'Waiting for prompt...']);
  const [voiceLogs, setVoiceLogs] = useState<string[]>(['Mic Standby.', 'Noise cancellation active.']);
  const [alerts, setAlerts] = useState<Array<{ id: string, title: string, message: string, severity: 'red' | 'yellow' | 'green' }>>([
    { id: '1', title: 'Sistem Başlatıldı', message: 'Elite İstihbarat Arayüzü ve Otonom Ajanlar aktif edildi.', severity: 'green' }
  ]);

  useEffect(() => {
    // Start Autonomous Systems
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsCommandPaletteOpen(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') { e.preventDefault(); setIsLockOpen(true); }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      agentManager.stop();
      unsubTelemetry();
      unsubReports();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Settings State
  const [settings, setSettings] = useState({
    continuousListening: false,
    autoSpeak: true,
    showSecurityAlerts: true,
    stealthMode: false,
    visualGauges: true,
    monthlyLimit: 5000,
  });

  // Modals
  const [isApkOpen, setIsApkOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isOllamaOpen, setIsOllamaOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSplitWiseOpen, setIsSplitWiseOpen] = useState(false);
  const [isSanitizerOpen, setIsSanitizerOpen] = useState(false);
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLockOpen, setIsLockOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('parliament');

  const closeAllModals = () => {
    setIsApkOpen(false); setIsEmergencyOpen(false); setIsOllamaOpen(false);
    setIsThemeOpen(false); setIsSettingsOpen(false); setIsSplitWiseOpen(false);
    setIsSanitizerOpen(false); setIsDevConsoleOpen(false); setIsCommandPaletteOpen(false);
  };

  const [globalMessages, setGlobalMessages] = useState<Array<{ id: string; sender: 'user' | 'assistant' | 'system'; text: string }>>([
    {
      id: 'g-1',
      sender: 'assistant',
      text: 'Elite İstihbarat Arayüzü aktif. Otonom ajanlar Sentinel-X, Guardian-V ve Ghost-S devrede.',
    },
  ]);
  const [isFloatingProcessing, setIsFloatingProcessing] = useState(false);

  const handleSendFloatingMessage = async (text: string) => {
    setIsFloatingProcessing(true);
    setAiLogs(prev => [...prev.slice(-10), `[INPUT]: ${text.substring(0, 20)}...`, '[PROCESS]: Analyzing semantic intent...']);
    const userMsg = { id: `flt-usr-${Date.now()}`, sender: 'user' as const, text };
    setGlobalMessages((prev) => [...prev, userMsg]);

    const cmd = parseTurkishVoiceCommand(text);
    if (cmd.isCommand) {
      let feedback = cmd.feedbackText || 'Komut uygulandı.';
      if (cmd.action === 'SWITCH_TAB' && cmd.target) setActiveTab(cmd.target as any);
      else if (cmd.action === 'EMERGENCY') setIsEmergencyOpen(true);
      else if (cmd.action === 'CLOSE_MODAL') closeAllModals();

      setGlobalMessages((prev) => [
        ...prev,
        { id: `flt-bot-${Date.now()}`, sender: 'assistant' as const, text: `⚡ [IŞIK HIZINDA İCRA]: ${feedback}` },
      ]);
      setAiLogs(prev => [...prev.slice(-10), '[FINISH]: Command executed.']);
      setIsFloatingProcessing(false);
      return;
    }

    try {
      setAiLogs(prev => [...prev.slice(-10), '[FETCH]: Requesting local inference...']);
      const response = await fetch('/api/cyber/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      setGlobalMessages((prev) => [...prev, {
        id: `flt-bot-${Date.now()}`,
        sender: 'assistant' as const,
        text: data.reply || 'Komut işlendi.',
      }]);
      setAiLogs(prev => [...prev.slice(-10), '[FINISH]: Response generated.']);
    } catch (e) {
      setGlobalMessages((prev) => [...prev, {
        id: `flt-err-${Date.now()}`,
        sender: 'assistant' as const,
        text: `Komut yerel korumaya alındı: "${text}".`,
      }]);
      setAiLogs(prev => [...prev.slice(-10), '[ERROR]: Local fallback active.']);
    } finally {
      setIsFloatingProcessing(false);
    }
  };

  const backgroundProcesses: BackgroundProcess[] = useMemo(() => {
    const procList: BackgroundProcess[] = [
      {
        id: 'ai-engine',
        name: 'Ollama / AI Engine',
        status: isFloatingProcessing ? 'active' : 'idle',
        icon: <Cpu className="w-4 h-4" />,
        details: 'Yerel yapay zeka motoru (Qwen3/Llama-3.1). Semantik analiz ve komut icrasını yönetir.',
        telemetry: aiLogs,
      },
      ...agentsTelemetry.map(agent => ({
        id: agent.agentId,
        name: agent.name,
        status: (agent.status === 'idle' ? 'idle' : agent.status === 'scanning' ? 'active' : agent.status === 'alert' ? 'warning' : 'active') as any,
        icon: agent.agentId === 'sentinel-x' ? <Globe className="w-4 h-4" /> : agent.agentId === 'guardian-v' ? <Shield className="w-4 h-4" /> : <Eye className="w-4 h-4" />,
        details: agent.lastAction,
        telemetry: agent.logs,
      })),
      {
        id: 'neural-mic',
        name: 'Neural Voice Mic',
        status: settings.continuousListening ? 'active' : 'idle',
        icon: <Mic className="w-4 h-4" />,
        details: 'Sinirsel gürültü engelleme özellikli ses aktivite algılama sistemi.',
        telemetry: voiceLogs,
      },
      {
        id: 'power-cell',
        name: 'Power Optimizer',
        status: charging ? 'active' : isLowBattery ? 'warning' : 'idle',
        icon: <Battery className="w-4 h-4" />,
        details: `Pil seviyesi: %${Math.round(level * 100)}.`,
        telemetry: [`Seviye: %${level * 100}`, `Şarj: ${charging}`],
      },
    ];
    return procList;
  }, [isFloatingProcessing, agentsTelemetry, aiLogs, settings, voiceLogs, level, charging, isLowBattery]);

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden select-none">
      <div className="h-0.5 w-full bg-black overflow-hidden flex shrink-0 opacity-40">
        <div className="h-full bg-blue-600 animate-pulse" style={{ width: '30%' }} />
        <div className="h-full bg-amber-600 animate-pulse delay-75" style={{ width: '45%' }} />
        <div className="h-full bg-blue-400 animate-pulse delay-150" style={{ width: '25%' }} />
      </div>

      <Navbar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenApkModal={() => setIsApkOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenOllama={() => setIsOllamaOpen(true)}
        onOpenThemeModal={() => setIsThemeOpen(true)}
        onOpenSanitizer={() => setIsSanitizerOpen(true)}
        onOpenLock={() => setIsLockOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Active Modules */}
        <aside className="w-72 bg-black border-r border-white/5 flex flex-col p-4 gap-4 overflow-y-auto no-scrollbar hidden lg:flex">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Otonom Ajanlar & Modüller</h3>
          </div>
          {backgroundProcesses.map(proc => (
            <div key={proc.id} className="blue-glass rounded-xl p-3 border-white/5 group hover:border-blue-500/30 transition-all cursor-default">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={proc.status === 'active' ? 'text-blue-400' : proc.status === 'warning' ? 'text-amber-400' : 'text-white/20'}>{proc.icon}</div>
                  <span className="text-[10px] font-bold text-white/80 uppercase">{proc.name}</span>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  proc.status === 'active' ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 
                  proc.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-white/10'
                }`} />
              </div>
              <div className="text-[9px] text-blue-300/60 mb-1 truncate italic">{proc.details}</div>
              <div className="font-mono text-[8px] text-white/30 leading-tight space-y-0.5">
                {proc.telemetry.slice(-3).map((log, i) => (
                  <div key={i} className="truncate">» {log}</div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-auto p-3 brown-glass rounded-xl border-white/5">
            <h4 className="text-[9px] font-bold uppercase text-amber-500 mb-2">Güvenlik Durumu</h4>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                />
              </div>
              <span className="text-[10px] font-bold text-emerald-400">100%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[8px] text-white/40 uppercase">
              <div>Aktif Ajanlar: 3</div>
              <div className="text-right">İzleme: Aktif</div>
            </div>
          </div>
        </aside>

        <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
          {/* Notifications */}
          <AnimatePresence>
            {alerts.slice(-3).map((alert, idx) => (
              <DraggableWindow 
                key={alert.id} 
                title={`Sistem Bildirimi: ${alert.severity === 'red' ? 'Kritik Tehdit' : 'Bilgi'}`}
                onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                defaultPosition={{ x: 20 + (idx * 30), y: 100 + (idx * 40) }}
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${alert.severity === 'red' ? 'bg-red-500/20' : alert.severity === 'yellow' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                    <AlertCircle className={`w-5 h-5 ${alert.severity === 'red' ? 'text-red-400' : alert.severity === 'yellow' ? 'text-amber-400' : 'text-blue-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                    <p className="text-[10px] text-white/60 mt-1 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              </DraggableWindow>
            ))}
          </AnimatePresence>

          <div className="ui-center-container z-10 p-6 flex-1 flex flex-col">
            <div className="flex-1 min-h-0">
               {activeTab === 'assistant' && (
                  <div className="w-full h-full flex flex-col gap-6">
                     <div className="flex-1 flex items-center justify-center">
                        <div className="w-full max-w-4xl">
                           <Cyber3DGlobe onAskAssistant={handleSendFloatingMessage} isLowBattery={isLowBattery} />
                        </div>
                     </div>
                  </div>
               )}
               {activeTab === 'tools' && (
                 <CyberToolsHub
                   onAskAssistant={handleSendFloatingMessage}
                   onSwitchToArchitecture={() => setActiveTab('architecture')}
                 />
               )}
               {activeTab === 'personal' && <PersonalAssistantHub onAskAssistant={handleSendFloatingMessage} onOpenOllamaModal={() => setIsOllamaOpen(true)} onOpenApkModal={() => setIsApkOpen(true)} scannedReceipts={[]} />}
               {activeTab === 'phone-tracker' && <PhoneTrackerHub onAskAssistant={handleSendFloatingMessage} />}
               {activeTab === 'architecture' && <DefensiveArchitectureHub onAskAssistant={handleSendFloatingMessage} />}
               {activeTab === 'tactical-inventory' && <TacticalInventoryHub onAskAssistant={handleSendFloatingMessage} />}
            </div>

            {/* Bottom Avatar & Update Area */}
            <div className="mt-auto pt-6 flex flex-col lg:flex-row gap-6 items-end">
              <div className="w-32 h-32 blue-glass rounded-full p-1 parlement-glow shrink-0">
                <EliteAvatar isSpeaking={isFloatingProcessing} mood={alerts.some(a => a.severity === 'red') ? 'alert' : 'secure'} />
              </div>

              <div className="flex-1 w-full lg:max-w-2xl blue-glass rounded-2xl border-white/5 overflow-hidden flex flex-col h-48 shadow-2xl">
                <div className="flex bg-white/5 border-b border-white/5 p-1 gap-1">
                  <button onClick={() => setInterfaceTab('chat')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center justify-center gap-2 ${interfaceTab === 'chat' ? 'bg-blue-600 text-white' : 'text-white/40 hover:bg-white/5'}`}><MessageSquare className="w-3 h-3" /> Sohbet</button>
                  <button onClick={() => setInterfaceTab('preview')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center justify-center gap-2 ${interfaceTab === 'preview' ? 'bg-blue-600 text-white' : 'text-white/40 hover:bg-white/5'}`}><Layout className="w-3 h-3" /> Önizleme</button>
                  <button onClick={() => setInterfaceTab('deploy')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center justify-center gap-2 ${interfaceTab === 'deploy' ? 'bg-blue-600 text-white' : 'text-white/40 hover:bg-white/5'}`}><Rocket className="w-3 h-3" /> Dağıtım</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] text-blue-300/80 bg-black/40">
                  {interfaceTab === 'chat' && (
                    <div className="space-y-2">
                      {globalMessages.map(m => (
                        <div key={m.id} className={m.sender === 'user' ? 'text-white/60' : 'text-blue-400'}>
                          <span className="opacity-30">[{m.sender.toUpperCase()}]</span> {m.text}
                        </div>
                      ))}
                    </div>
                  )}
                  {interfaceTab === 'preview' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-400"><Activity className="w-3 h-3" /> Otonom Operasyon Merkezi</div>
                      <div className="p-2 rounded bg-white/5 border border-white/10 text-[9px] text-white/40">
                        {`// Sistem Özeti:
{
  "active_agents": ["Sentinel-X", "Guardian-V", "Ghost-S"],
  "total_threats_blocked": ${agentsTelemetry.reduce((acc, curr) => acc + curr.threatsDetected, 0)},
  "last_integrity_check": "passed",
  "ai_mode": "autonomous_defense"
}`}
                      </div>
                    </div>
                  )}
                  {interfaceTab === 'deploy' && (
                    <div className="flex items-center justify-center h-full">
                      <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest shadow-lg shadow-blue-600/30 transition active:scale-95">Yükle (Commit)</button>
                    </div>
                  )}
                </div>
                {interfaceTab === 'chat' && (
                  <div className="p-2 border-t border-white/5 bg-white/5">
                    <input type="text" placeholder="Komut girin..." className="w-full bg-transparent border-none text-[10px] focus:ring-0 text-white" onKeyDown={(e) => { if (e.key === 'Enter') { handleSendFloatingMessage(e.currentTarget.value); e.currentTarget.value = ''; } }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <FloatingChatHead
        isListening={settings.continuousListening}
        isProcessing={isFloatingProcessing}
        activeProcesses={backgroundProcesses}
        onToggleListening={() => setSettings(s => ({...s, continuousListening: !s.continuousListening}))}
        onOpenSplitWise={() => setIsSplitWiseOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        systemStatus={alerts.some(a => a.severity === 'red') ? 'breach' : isLowBattery ? 'alert' : 'secure'}
      />

      <CyberMatrixDashboard />

      <LockScreenModule isOpen={isLockOpen} onClose={() => setIsLockOpen(false)} onTriggerAssistant={handleSendFloatingMessage} />

      {/* Modals */}
      <MobileApkModal isOpen={isApkOpen} onClose={() => setIsApkOpen(false)} />
      <EmergencyShieldModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} onEmergencyTriggered={() => {}} />
      <OllamaSetupModal isOpen={isOllamaOpen} onClose={() => setIsOllamaOpen(false)} />
      <ThemeManagerModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} currentTheme={currentTheme} onSelectTheme={setCurrentTheme} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdateSetting={(k, v) => setSettings(s => ({...s, [k]: v}))} />
      <ReceiptUploadModal isOpen={isSplitWiseOpen} onClose={() => setIsSplitWiseOpen(false)} onReceiptParsed={() => {}} />
      <DigitalFootprintSanitizerModal isOpen={isSanitizerOpen} onClose={() => setIsSanitizerOpen(false)} onSanitizeComplete={() => {}} />
      <DevConsole isOpen={isDevConsoleOpen} onClose={() => setIsDevConsoleOpen(false)} onIntegrate={() => {}} />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onSelectAction={() => {}} />
      <OfflineIndicator />
    </div>
  );
}
