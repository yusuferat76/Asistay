import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { agentManager, AgentTelemetry } from '../utils/AgentManager';
import { Terminal, Activity, Shield, Eye, Globe, Zap, AlertCircle, Volume2, Network, X } from 'lucide-react';
import { speakUltraRealistic } from '../utils/ultraTTS';
import { ThreatForceGraph } from './ThreatForceGraph';

export const CyberMatrixDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentTelemetry[]>([]);
  const [matrixLines, setMatrixLines] = useState<string[]>([]);
  const [activeSummary, setActiveSummary] = useState<{ name: string, text: string } | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'agents' | 'topology'>('agents');
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);

  useEffect(() => {
    const unsub = agentManager.onTelemetry((telemetry) => {
      setAgents(telemetry);
    });

    const interval = setInterval(() => {
      const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+-=';
      let line = '';
      for (let i = 0; i < 20; i++) {
        line += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setMatrixLines(prev => [...prev.slice(-15), line]);
    }, 200);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleAgentClick = (agent: AgentTelemetry) => {
    let summary = '';
    if (agent.agentId === 'sentinel-x') {
      summary = `Sentinel-X raporu: Ağ trafiği stabilize edildi. ${agent.threatsDetected} adet şüpheli paket engellendi. Küresel izleme aktif.`;
    } else if (agent.agentId === 'guardian-v') {
      summary = `Guardian-V raporu: Sistem çekirdek bütünlüğü doğrulandı. ${agent.threatsDetected} adet yetkisiz erişim girişimi püskürtüldü.`;
    } else {
      summary = `Ghost-S raporu: OSINT veri sızıntısı taraması tamamlandı. ${agent.threatsDetected} ihlal vektörü analiz edildi. Kimlik koruması devrede.`;
    }

    setActiveSummary({ name: agent.name, text: summary });
    speakUltraRealistic(summary);

    setTimeout(() => setActiveSummary(null), 6000);
  };

  return (
    <div className="fixed right-6 top-24 bottom-24 w-80 z-20 pointer-events-none flex flex-col gap-4">
      {/* Voice Summary Notification */}
      <AnimatePresence>
        {activeSummary && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -top-16 left-0 right-0 blue-glass border-blue-500/40 p-3 rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.2)] pointer-events-auto"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{activeSummary.name} Özetleniyor</div>
              <div className="text-[9px] text-white/70 truncate uppercase font-mono italic">Sesli Teknik Analiz Aktif...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Matrix Rain Effect (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] overflow-hidden font-mono text-[8px] leading-none select-none text-emerald-500 whitespace-pre">
        {matrixLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* Header bar with Tab Switcher */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
            {dashboardTab === 'agents' ? 'Ajan Paneli' : 'D3 Tehdit Ağı'}
          </h3>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-black/80 rounded-lg border border-blue-900/50 text-[9px] font-mono pointer-events-auto">
          <button
            onClick={() => setDashboardTab('agents')}
            className={`px-2 py-0.5 rounded font-bold transition ${
              dashboardTab === 'agents'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ajanlar
          </button>
          <button
            onClick={() => setDashboardTab('topology')}
            className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
              dashboardTab === 'topology'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-2.5 h-2.5 text-red-400 animate-pulse" />
            <span>Tehdit Ağı</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col gap-3 pointer-events-auto overflow-y-auto no-scrollbar">
        {dashboardTab === 'agents' ? (
          <>
            <div className="flex flex-col gap-3">
              {agents.map((agent) => (
                <AgentMatrixCard key={agent.agentId} agent={agent} onClick={() => handleAgentClick(agent)} />
              ))}
            </div>

            {/* Quick Teaser to D3 Force Graph */}
            <button
              onClick={() => setDashboardTab('topology')}
              className="p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/40 flex items-center justify-between text-xs font-mono text-blue-300 transition group"
            >
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400 group-hover:rotate-45 transition-transform" />
                <span>Tehdit Ağ Grafiğini Gör (D3)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">6 DÜĞÜM ➔</span>
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <ThreatForceGraph onToggleExpand={() => setIsGraphExpanded(true)} />
          </div>
        )}
      </div>

      {/* Bottom Network Summary */}
      <div className="blue-glass rounded-xl p-3 border-white/5 pointer-events-auto shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">Ağ Trafiği İzleme</span>
          <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <NetworkBar label="Incoming" value={72} color="bg-blue-500" />
          <NetworkBar label="Outgoing" value={24} color="bg-indigo-500" />
          <div className="pt-2 flex justify-between text-[8px] font-mono text-white/30 uppercase">
            <span>Uptime: 04:12:44</span>
            <span className="text-emerald-400/60">Packets: 1.2M</span>
          </div>
        </div>
      </div>

      {/* Full-Screen Expanded War-Room Topology Modal */}
      {isGraphExpanded && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn pointer-events-auto">
          <div className="relative w-full max-w-3xl bg-[#030814] border border-blue-500/60 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-blue-400 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                    Siber Tehdit &amp; Savunma Kuvvet Odaklı Ağ Grafiği (D3 Force Topology)
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">
                    Saldırı düğümleri ile Sentinel-X, Guardian-V ve Ghost-S savunma hatları arasındaki canlı bağlantılar
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsGraphExpanded(false)}
                className="p-1.5 rounded-full bg-black border border-blue-800 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ThreatForceGraph isExpanded={true} onToggleExpand={() => setIsGraphExpanded(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

const StreamingTrafficGraph: React.FC<{ active: boolean, color: string }> = ({ active, color }) => {
  const [points, setPoints] = useState<number[]>(new Array(20).fill(20));

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const variance = active ? 15 : 5;
        const newVal = Math.max(5, Math.min(35, last + (Math.random() * variance - variance / 2)));
        return [...next, newVal];
      });
    }, 150);
    return () => clearInterval(interval);
  }, [active]);

  const d = points.map((p, i) => `${i * 10},${40 - p}`).join(' L ');

  return (
    <div className="absolute inset-x-0 bottom-0 h-10 opacity-30 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 190 40" preserveAspectRatio="none">
        <motion.path
          d={`M 0,${40 - points[0]} L ${d}`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          initial={false}
          animate={active ? { strokeOpacity: [0.3, 0.8, 0.3] } : { strokeOpacity: 0.3 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <path
          d={`M 0,${40 - points[0]} L ${d} V 40 H 0 Z`}
          fill={`url(#grad-${color.replace('#', '')})`}
          className="opacity-20"
        />
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const AgentMatrixCard: React.FC<{ agent: AgentTelemetry, onClick: () => void }> = ({ agent, onClick }) => {
  const isAlert = agent.status === 'alert';
  const isScanning = agent.status === 'scanning';
  const isActive = isAlert || isScanning;

  return (
    <motion.div 
      layout
      onClick={onClick}
      className={`relative overflow-hidden blue-glass rounded-xl border-white/5 p-4 transition-all duration-300 cursor-pointer group active:scale-[0.98] ${
        isAlert ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)] bg-red-950/10' : 'hover:border-blue-500/30'
      }`}
    >
      {/* Streaming Graph Overlay */}
      <StreamingTrafficGraph 
        active={isActive} 
        color={isAlert ? '#ef4444' : '#3b82f6'} 
      />

      {/* Dynamic scan line overlay */}
      {isScanning && (
        <motion.div 
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-0.5 bg-blue-400/20 blur-sm z-0"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${isAlert ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
              {agent.agentId === 'sentinel-x' && <Globe className="w-3.5 h-3.5" />}
              {agent.agentId === 'guardian-v' && <Shield className="w-3.5 h-3.5" />}
              {agent.agentId === 'ghost-s' && <Eye className="w-3.5 h-3.5" />}
            </div>
            <div>
              <div className="text-[10px] font-black text-white uppercase tracking-wider">{agent.name}</div>
              <div className={`text-[8px] font-mono font-bold uppercase ${
                isAlert ? 'text-red-400' : isScanning ? 'text-blue-400' : 'text-white/40'
              }`}>
                {agent.status}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono font-bold text-white/20">THREATS</div>
            <div className={`text-xs font-mono font-black ${agent.threatsDetected > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {agent.threatsDetected.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="bg-black/40 rounded-lg p-2 font-mono text-[9px] mb-2 border border-white/5 group-hover:border-blue-500/20 transition-colors">
          <div className="text-blue-300/60 truncate mb-1 italic">» {agent.lastAction}</div>
          <div className="space-y-0.5 h-12 overflow-hidden opacity-30">
            {agent.logs.slice(-2).map((log, i) => (
              <div key={i} className="truncate text-[8px]">{log}</div>
            ))}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '30%' }}
              animate={{ width: isScanning ? '100%' : '100%' }}
              transition={isScanning ? { duration: 3, repeat: Infinity, ease: 'linear' } : {}}
              className={`h-full ${isAlert ? 'bg-red-500' : 'bg-blue-500'}`}
            />
          </div>
          <Zap className={`w-2.5 h-3 ${isAlert ? 'text-red-500' : isScanning ? 'text-blue-400' : 'text-white/10'}`} />
        </div>
      </div>
    </motion.div>
  );
};

const NetworkBar: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);
