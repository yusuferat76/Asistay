import React, { useState } from 'react';
import {
  Zap,
  Shield,
  Lock,
  RefreshCw,
  Power,
  X,
  Crosshair,
  WifiOff,
  Database,
  EyeOff,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { agentManager, DEFENSE_MACROS, DefenseMacro } from '../utils/AgentManager';
import { playTacticalSound } from '../utils/audioEffects';
import { speakUltraRealistic } from '../utils/ultraTTS';

interface RadialMacroMenuProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onMacroExecuted?: (macro: DefenseMacro) => void;
}

export const RadialMacroMenu: React.FC<RadialMacroMenuProps> = ({
  isOpen: controlledIsOpen,
  onToggle,
  onMacroExecuted,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const [selectedAgentFilter, setSelectedAgentFilter] = useState<'all' | 'sentinel-x' | 'guardian-v' | 'ghost-s'>('all');
  const [hoveredMacro, setHoveredMacro] = useState<DefenseMacro | null>(null);
  const [lastExecutedMacro, setLastExecutedMacro] = useState<DefenseMacro | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const filteredMacros = selectedAgentFilter === 'all'
    ? DEFENSE_MACROS
    : DEFENSE_MACROS.filter((m) => m.agentId === selectedAgentFilter);

  const handleToggle = () => {
    playTacticalSound(isOpen ? 'click' : 'mic_on');
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
    if (!isOpen) {
      setHoveredMacro(null);
    }
  };

  const handleExecute = (macro: DefenseMacro) => {
    playTacticalSound('command_exec');
    setExecutingId(macro.id);
    setLastExecutedMacro(macro);

    // Run in AgentManager
    agentManager.executeMacro(macro.id);

    // Speak audio announcement
    speakUltraRealistic(macro.audioSpeech);

    if (onMacroExecuted) {
      onMacroExecuted(macro);
    }

    // Reset visual executing trigger after a short delay
    setTimeout(() => {
      setExecutingId(null);
    }, 1800);
  };

  const getMacroIcon = (iconType: DefenseMacro['iconType'], className = 'w-4 h-4') => {
    switch (iconType) {
      case 'kill':
        return <Power className={className} />;
      case 'subnet':
        return <WifiOff className={className} />;
      case 'buffer':
        return <Database className={className} />;
      case 'quarantine':
        return <Lock className={className} />;
      case 'vpn':
        return <RefreshCw className={className} />;
      case 'fingerprint':
        return <EyeOff className={className} />;
      default:
        return <Shield className={className} />;
    }
  };

  // Radial geometry configuration
  const radius = 115; // Distance from center in pixels
  const count = filteredMacros.length;

  return (
    <>
      {/* Floating Trigger Button (Always visible on bottom-left of globe area) */}
      <div className="absolute bottom-3 left-3 z-30 pointer-events-auto">
        <button
          onClick={handleToggle}
          title="Otonom Ajan Hızlı Savunma Makro Menüsü (Radial HUD)"
          className={`group relative flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all duration-300 shadow-2xl backdrop-blur-md ${
            isOpen
              ? 'bg-blue-900/90 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)]'
              : 'bg-black/85 border-blue-800/60 text-blue-300 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(30,58,138,0.7)]'
          }`}
        >
          {/* Animated pulsing glow circle */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
          </span>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider uppercase">
            <Crosshair className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-white' : ''}`} />
            <span>Hızlı Makro HUD</span>
          </div>

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            {filteredMacros.length} Makro
          </span>
        </button>
      </div>

      {/* Floating HUD Radial Menu Modal / Overlay */}
      {isOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn pointer-events-auto p-4">
          {/* Close Backdrop Button */}
          <button
            onClick={handleToggle}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/80 border border-blue-900/60 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Radial Hub Container */}
          <div className="relative flex items-center justify-center w-[340px] h-[340px]">
            {/* Background Circular HUD rings */}
            <div className="absolute inset-0 rounded-full border border-blue-900/30 border-dashed animate-spin-slow pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-blue-800/40 pointer-events-none" />
            <div className="absolute inset-16 rounded-full border border-blue-500/20 pointer-events-none" />

            {/* Crosshair guidelines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-blue-900/30 pointer-events-none" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-blue-900/30 pointer-events-none" />

            {/* Central Info Core Hub */}
            <div className="relative z-20 w-32 h-32 rounded-full bg-[#030814] border-2 border-blue-500/80 p-2 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(30,58,138,0.8)] backdrop-blur-xl">
              {hoveredMacro ? (
                <div className="animate-fadeIn space-y-1">
                  <div className="text-[9px] font-mono text-blue-400 uppercase tracking-widest">
                    {hoveredMacro.agentName}
                  </div>
                  <div className="text-[11px] font-black text-white leading-tight">
                    {hoveredMacro.name}
                  </div>
                  <div className="text-[8px] font-mono text-gray-400 line-clamp-2 px-1">
                    {hoveredMacro.codeName}
                  </div>
                </div>
              ) : lastExecutedMacro ? (
                <div className="animate-fadeIn space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto animate-bounce" />
                  <div className="text-[9px] font-mono text-emerald-300 font-bold">
                    MAKRO UYGULANDI
                  </div>
                  <div className="text-[10px] font-extrabold text-white truncate max-w-[100px] mx-auto">
                    {lastExecutedMacro.name}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-600 flex items-center justify-center mx-auto text-blue-400 shadow-[0_0_10px_#2563eb]">
                    <Zap className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="text-[10px] font-black text-white uppercase tracking-wider">
                    SAVUNMA MAKROSU
                  </div>
                  <div className="text-[8px] font-mono text-blue-300">
                    Ajan Seç / Tetikle
                  </div>
                </div>
              )}
            </div>

            {/* Radial Macro Buttons around the circle */}
            {filteredMacros.map((macro, idx) => {
              // Calculate polar angle: starting from top (-PI/2) evenly spaced
              const angle = (idx * (2 * Math.PI)) / count - Math.PI / 2;
              const x = Math.round(radius * Math.cos(angle));
              const y = Math.round(radius * Math.sin(angle));
              const isExecuting = executingId === macro.id;

              return (
                <div
                  key={macro.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className="absolute z-30 transition-all duration-300"
                >
                  <button
                    onClick={() => handleExecute(macro)}
                    onMouseEnter={() => setHoveredMacro(macro)}
                    onMouseLeave={() => setHoveredMacro(null)}
                    title={`${macro.name} (${macro.agentName})`}
                    className={`relative group w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xl ${
                      isExecuting
                        ? 'bg-red-600 border-white scale-125 shadow-[0_0_25px_#ef4444] text-white animate-ping'
                        : hoveredMacro?.id === macro.id
                        ? 'bg-blue-600 border-blue-300 scale-110 shadow-[0_0_20px_#3b82f6] text-white'
                        : 'bg-[#050b14]/90 border-blue-700/80 text-blue-300 hover:border-blue-400 hover:text-white'
                    }`}
                  >
                    {getMacroIcon(macro.iconType, 'w-5 h-5')}

                    {/* Agent Identification Dot */}
                    <span
                      className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[7px] font-bold font-mono text-white ${
                        macro.agentId === 'sentinel-x'
                          ? 'bg-blue-600'
                          : macro.agentId === 'guardian-v'
                          ? 'bg-emerald-600'
                          : 'bg-purple-600'
                      }`}
                    >
                      {macro.agentName.charAt(0)}
                    </span>
                  </button>

                  {/* Outward pointing badge tooltip */}
                  <div
                    className={`absolute pointer-events-none transition-all duration-200 whitespace-nowrap z-40 ${
                      hoveredMacro?.id === macro.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    } ${
                      x >= 0 ? 'left-14 top-1' : 'right-14 top-1'
                    }`}
                  >
                    <div className="bg-black/90 border border-blue-500/80 px-2.5 py-1.5 rounded-xl shadow-2xl backdrop-blur-md">
                      <div className="text-[10px] font-bold text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        <span>{macro.name}</span>
                      </div>
                      <div className="text-[8px] font-mono text-blue-300 mt-0.5">
                        {macro.agentName} • {macro.technicalDetails}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Filter Controls by Autonomous Agent */}
          <div className="absolute bottom-4 inset-x-4 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-lg mx-auto">
            <div className="flex items-center gap-1 bg-black/90 border border-blue-900/60 p-1 rounded-xl text-[10px] font-mono">
              <button
                onClick={() => setSelectedAgentFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedAgentFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Tümü ({DEFENSE_MACROS.length})
              </button>
              <button
                onClick={() => setSelectedAgentFilter('sentinel-x')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedAgentFilter === 'sentinel-x'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sentinel-X
              </button>
              <button
                onClick={() => setSelectedAgentFilter('guardian-v')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedAgentFilter === 'guardian-v'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Guardian-V
              </button>
              <button
                onClick={() => setSelectedAgentFilter('ghost-s')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedAgentFilter === 'ghost-s'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Ghost-S
              </button>
            </div>

            <div className="text-[10px] font-mono text-gray-400">
              ⚡ Tıklayarak yüksek öncelikli makroyu anında tetikleyin.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
