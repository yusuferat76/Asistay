import React, { useState, useEffect } from 'react';
import { Activity, Shield, Wifi, Cpu, Zap, Lock, Terminal, Globe, AlertTriangle } from 'lucide-react';

interface TacticalHUDProps {
  onSelectTab: (tab: any) => void;
  onOpenEmergency: () => void;
  onOpenOllama: () => void;
  onOpenApk: () => void;
}

export const TacticalHUD: React.FC<TacticalHUDProps> = ({ 
  onSelectTab, 
  onOpenEmergency, 
  onOpenOllama,
  onOpenApk
}) => {
  const [telemetry, setTelemetry] = useState<string[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<number>(0);
  const [load, setLoad] = useState<number>(12);

  useEffect(() => {
    const logs = [
      "SYSTEM_BOOT: OK",
      "SECURE_KERNEL: ENFORCED",
      "SIGNAL_ANALYSIS: SCANNING",
      "IP_GEOLOCATION: IDLE",
      "ROUE_AP_DETECTION: PASSIVE",
      "ENCRYPTION_LAYER: AES-256-GCM",
      "LOCAL_LLM_STATUS: READY"
    ];
    setTelemetry(logs);

    const interval = setInterval(() => {
      setLoad(prev => Math.min(100, Math.max(5, prev + (Math.random() * 4 - 2))));
      if (Math.random() > 0.8) {
        setTelemetry(prev => [...prev.slice(-10), `NEW_EVENT: ${new Date().toLocaleTimeString()} - Monitoring...`]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-7xl h-full flex flex-col p-4 md:p-6 bg-grid overflow-hidden">
      {/* Top HUD Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 shrink-0">
        <StatCard 
          icon={<Cpu className="w-4 h-4 text-blue-400" />} 
          label="Sistem Yükü" 
          value={`${load.toFixed(1)}%`} 
          color="blue"
        />
        <StatCard 
          icon={<Shield className="w-4 h-4 text-emerald-400" />} 
          label="Güvenlik Katmanı" 
          value="AKTİF" 
          color="emerald"
        />
        <StatCard 
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />} 
          label="Aktif Tehditler" 
          value={activeAlerts.toString()} 
          color="amber"
        />
        <StatCard 
          icon={<Wifi className="w-4 h-4 text-purple-400" />} 
          label="Sinyal Gücü" 
          value="-42 dBm" 
          color="purple"
        />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 overflow-hidden">
        {/* Main Central Visualizer Area */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <div className="flex-1 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
            <div className="absolute inset-0 scan-line" />
            
            {/* Holographic Circle UI */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full animate-spin-slow" />
              <div className="absolute inset-4 border-2 border-dashed border-blue-400/30 rounded-full animate-spin-reverse" />
              <div className="absolute inset-10 border border-blue-500/10 rounded-full" />
              
              <div className="z-10 flex flex-col items-center text-center p-4">
                <Globe className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 animate-pulse mb-3" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-glow-blue">SINIRSIZ ASİSTAN</h2>
                <p className="text-[10px] text-blue-400/60 mt-1 uppercase tracking-tighter">Otonom Siber Güvenlik Protokolü</p>
              </div>
            </div>

            {/* Quick Action Overlay */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 sm:gap-4 px-4">
              <ActionButton 
                icon={<Terminal className="w-3.5 h-3.5" />} 
                label="Konsol" 
                onClick={() => onSelectTab('tools')} 
              />
              <ActionButton 
                icon={<Zap className="w-3.5 h-3.5" />} 
                label="APK Derle" 
                onClick={onOpenApk} 
              />
              <ActionButton 
                icon={<Lock className="w-3.5 h-3.5" />} 
                label="Acil Durum" 
                variant="danger"
                onClick={onOpenEmergency} 
              />
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="h-24 sm:h-32 glass-panel rounded-3xl p-4 overflow-hidden flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Sistem Telemetrisi</span>
            </div>
            <div className="flex-1 font-mono text-[9px] sm:text-[10px] text-blue-300/50 leading-tight space-y-1 overflow-y-auto no-overflow-scrolling">
              {telemetry.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                  <span className="truncate">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 glass-panel rounded-3xl p-5 min-h-0 flex flex-col">
            <h3 className="text-[11px] font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2 shrink-0">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Aktif Modüller
            </h3>
            <div className="flex-1 space-y-2 overflow-y-auto no-overflow-scrolling pr-1">
              <ModuleToggle label="Yüz Tanıma" active={true} />
              <ModuleToggle label="Plaka Analizi" active={false} />
              <ModuleToggle label="Rogue AP Savunma" active={true} />
              <ModuleToggle label="Veri Sızıntı Takibi" active={true} />
              <ModuleToggle label="Otonom Yanıt" active={true} />
              <ModuleToggle label="Sinyal Analizi" active={true} />
              <ModuleToggle label="IP Jeolokasyon" active={true} />
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 bg-blue-900/10 shrink-0">
            <h3 className="text-[11px] font-bold text-white mb-2 uppercase tracking-widest">Yapay Zeka Durumu</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center animate-pulse shrink-0">
                <Cpu className="w-5 h-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-blue-400 truncate uppercase">YEREL OLLAMA</div>
                <div className="text-[9px] text-blue-300/60 font-mono tracking-tighter">Gecikme: 0.8ms</div>
              </div>
            </div>
            <button 
              onClick={onOpenOllama}
              className="w-full mt-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-xl text-[10px] font-bold text-blue-400 transition-all uppercase tracking-widest"
            >
              YAPILANDIR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
  <div className={`glass-panel rounded-2xl p-3 flex flex-col gap-0.5 border-t-2 ${
    color === 'blue' ? 'border-t-blue-500' : 
    color === 'emerald' ? 'border-t-emerald-500' : 
    color === 'amber' ? 'border-t-amber-500' : 'border-t-purple-500'
  }`}>
    <div className="flex items-center gap-1.5 min-w-0">
      <div className="shrink-0">{icon}</div>
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{label}</span>
    </div>
    <div className="text-sm sm:text-base font-bold tabular-nums text-white truncate">{value}</div>
  </div>
);

const ActionButton = ({ icon, label, onClick, variant = 'default' }: { icon: any, label: string, onClick: () => void, variant?: 'default' | 'danger' }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-[9px] sm:text-[10px] transition-all uppercase tracking-widest whitespace-nowrap ${
      variant === 'danger' 
        ? 'bg-red-600 text-white hover:bg-red-500 parlement-glow border border-red-400/30' 
        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ModuleToggle = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tight truncate mr-2">{label}</span>
    <div className={`w-7 h-3.5 rounded-full relative transition-colors shrink-0 ${active ? 'bg-blue-600' : 'bg-slate-700'}`}>
      <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
    </div>
  </div>
);
