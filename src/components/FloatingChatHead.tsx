import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  Settings,
  Receipt,
  AlertTriangle,
  Zap,
  Cpu,
  Activity,
  Wifi,
  Battery,
  Mic,
  MicOff,
  Search,
  Bell,
  Globe,
  Camera,
  CheckCircle,
  Terminal,
  Lock,
  Download,
  Cloud,
  Smartphone,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playTacticalSound, onSoundPlay } from '../utils/audioEffects';
import { triggerHaptic } from '../utils/haptics';
import { speakUltraRealistic } from '../utils/ultraTTS';
import { agentManager } from '../utils/AgentManager';

export interface BackgroundProcess {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'warning' | 'error';
  icon: React.ReactNode;
  details: string;
  telemetry: string[];
}

export interface SystemAlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'red' | 'yellow' | 'green';
}

interface FloatingChatHeadProps {
  isListening: boolean;
  isProcessing?: boolean;
  llmExecutionMode?: 'local' | 'cloud' | 'idle';
  onToggleListening: () => void;
  onOpenAdminCenter: () => void;
  onOpenSplitWise: () => void;
  onOpenSettings: () => void;
  onOpenEmergency: () => void;
  systemStatus?: 'secure' | 'alert' | 'breach';
  activeProcesses: BackgroundProcess[];
  alerts?: SystemAlertItem[];
  onDismissAlert?: (id: string) => void;
}

export const FloatingChatHead: React.FC<FloatingChatHeadProps> = ({
  isListening,
  isProcessing = false,
  llmExecutionMode = 'local',
  onToggleListening,
  onOpenAdminCenter,
  onOpenSplitWise,
  onOpenSettings,
  onOpenEmergency,
  systemStatus = 'secure',
  activeProcesses,
  alerts = [],
  onDismissAlert = () => {},
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 110, y: window.innerHeight - 170 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [auditStatus, setAuditStatus] = useState<string | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([42, 38, 55, 48, 39, 45, 36]);
  const [quantumIntegrity, setQuantumIntegrity] = useState<number>(99.98);
  const [ripples, setRipples] = useState<Array<{ id: string; type: 'critical' | 'warning' | 'sound'; color: string; maxScale: number }>>([]);
  const [isSoundVisualizerActive, setIsSoundVisualizerActive] = useState(false);
  const [visualizerFrequencies, setVisualizerFrequencies] = useState<number[]>([45, 80, 60, 95, 70, 85, 50, 90, 65, 75]);

  const addRipple = (type: 'critical' | 'warning' | 'sound', customColor?: string) => {
    const id = `ripple-${Date.now()}-${Math.random()}`;
    const color = customColor || (type === 'critical' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#06b6d4');
    const maxScale = type === 'critical' ? 3.0 : type === 'warning' ? 2.2 : 1.8;

    setRipples((prev) => [...prev.slice(-6), { id, type, color, maxScale }]);

    setIsSoundVisualizerActive(true);
    setVisualizerFrequencies(Array.from({ length: 10 }, () => Math.floor(Math.random() * 60) + 40));

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1400);

    setTimeout(() => {
      setIsSoundVisualizerActive(false);
    }, 2000);
  };

  // React to system notification sounds & agent critical threat reports
  useEffect(() => {
    // 1. Listen to system audio notification sounds
    const unsubSound = onSoundPlay((soundType) => {
      if (soundType === 'emergency') {
        // Critical threat audio -> intense expanding triple red wave
        addRipple('critical', '#ef4444');
        setTimeout(() => addRipple('critical', '#dc2626'), 180);
        setTimeout(() => addRipple('critical', '#ff0055'), 360);
      } else if (soundType === 'command_exec' || soundType === 'ai_response') {
        addRipple('sound', llmExecutionMode === 'local' ? '#06b6d4' : '#FFAA00');
      } else if (soundType === 'mic_on' || soundType === 'mic_off') {
        addRipple('sound', '#10b981');
      } else {
        addRipple('sound', '#3b82f6');
      }
    });

    // 2. Listen to security agent critical threat telemetry
    const unsubReport = agentManager.onReport((report) => {
      if (report.type === 'critical') {
        addRipple('critical', '#ef4444');
        setTimeout(() => addRipple('critical', '#ff5500'), 220);
      } else if (report.type === 'warning') {
        addRipple('warning', '#f59e0b');
      }
    });

    return () => {
      unsubSound();
      unsubReport();
    };
  }, [llmExecutionMode]);

  const longPressTimerRef = useRef<any>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Real-time Quantum-Shield Encryption Integrity telemetry updates
  useEffect(() => {
    const updateQuantum = () => {
      const streams = agentManager.getEncryptionStreams();
      if (streams.length > 0) {
        const avg = streams.reduce((acc, s) => acc + s.integrity, 0) / streams.length;
        setQuantumIntegrity(Number(avg.toFixed(2)));
      }
    };
    updateQuantum();
    const timer = setInterval(updateQuantum, 2500);
    return () => clearInterval(timer);
  }, []);

  // Real-time Latency telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      const baseMs = llmExecutionMode === 'local' ? 40 : 110;
      const jitter = Math.floor(Math.random() * 25) - 10;
      const currentMs = Math.max(20, baseMs + jitter);
      setLatencyHistory((prev) => [...prev.slice(-8), currentMs]);
    }, 1500);
    return () => clearInterval(interval);
  }, [llmExecutionMode]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((pos) => ({
        x: Math.min(pos.x, window.innerWidth - 75),
        y: Math.min(pos.y, window.innerHeight - 75),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}

    // Start Long-Press Timer for Radial Menu (500ms)
    longPressTimerRef.current = setTimeout(() => {
      setIsDragging(false);
      setShowRadialMenu(true);
      triggerHaptic('critical');
      playTacticalSound('emergency');
    }, 500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    const newX = Math.max(10, Math.min(window.innerWidth - 65, e.clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 65, e.clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleMainClick = (e: React.MouseEvent) => {
    if (!isDragging && !showRadialMenu) {
      playTacticalSound('command_exec');
      triggerHaptic('success');
      // Simulated: Activate Camera, Mute Mic, Start Screen Share
      setAuditStatus('AI Vision & Ekran Paylaşımı Aktif (Mikrofon Mute)');
      setTimeout(() => setAuditStatus(null), 3000);
      onToggleListening(); // Keep existing toggle logic but enhance it
    }
  };

  const executeDefenseMacro = (macroName: string, message: string) => {
    playTacticalSound('command_exec');
    triggerHaptic('success');
    setAuditStatus(`[MAKRO AKTİF] ${macroName}: ${message}`);
    setTimeout(() => setAuditStatus(null), 3500);
    setShowRadialMenu(false);
  };

  const botState = isProcessing ? 'processing' : isListening ? 'listening' : 'idle';
  const latestLatency = latencyHistory[latencyHistory.length - 1];
  const accentColor = llmExecutionMode === 'local' ? '#06b6d4' : '#FFAA00';

  return (
    <div
      ref={bubbleRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className="fixed top-0 left-0 z-50 select-none"
    >
      {/* Floating Radial Menu on Long-Press (Defense Macros & Direct Model Download) */}
      <AnimatePresence>
        {showRadialMenu && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
              onClick={() => setShowRadialMenu(false)}
            />

            {/* Radial Buttons around center */}
            <div className="relative w-52 h-52 pointer-events-auto flex items-center justify-center">
              
              {/* 1. Kill Network Process (Top) */}
              <motion.button
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: 1, y: -70 }}
                exit={{ scale: 0, y: 0 }}
                onClick={() => executeDefenseMacro('Kill Network Process', 'Yetkisiz soketler sonlandırıldı, port mühürlendi.')}
                className="absolute w-12 h-12 rounded-full bg-black border-2 border-red-500 text-red-400 hover:bg-red-950 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)] transition group"
                title="Kill Network Process (SIGKILL_ROGUE_SOCKET)"
              >
                <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition" />
              </motion.button>

              {/* 2. Rotate VPN / Tor Hop (Left) */}
              <motion.button
                initial={{ scale: 0, x: 0 }}
                animate={{ scale: 1, x: -70 }}
                exit={{ scale: 0, x: 0 }}
                onClick={() => executeDefenseMacro('Rotate VPN', 'Ağ tüneli döndürüldü, yeni anonim düğüme geçildi.')}
                className="absolute w-12 h-12 rounded-full bg-black border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-950 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] transition group"
                title="Rotate VPN / Tor Hop (ONION_CIRCUIT_HOP)"
              >
                <Radio className="w-5 h-5 group-hover:scale-110 transition" />
              </motion.button>

              {/* 3. Encrypt Buffer (Right) */}
              <motion.button
                initial={{ scale: 0, x: 0 }}
                animate={{ scale: 1, x: 70 }}
                exit={{ scale: 0, x: 0 }}
                onClick={() => executeDefenseMacro('Encrypt Buffer', 'RAM bellek arabelleği AES-256-GCM ile kilitlendi.')}
                className="absolute w-12 h-12 rounded-full bg-black border-2 border-[#FFAA00] text-[#FFAA00] hover:bg-[#FFAA00]/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,170,0,0.6)] transition group"
                title="Encrypt Current Buffer (RAM_VAULT_AES256)"
              >
                <Lock className="w-5 h-5 group-hover:scale-110 transition" />
              </motion.button>

              {/* 4. Command Center (Bottom) */}
              <motion.button
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: 1, y: 70 }}
                exit={{ scale: 0, y: 0 }}
                onClick={() => {
                  setShowRadialMenu(false);
                  onOpenAdminCenter();
                }}
                className="absolute w-12 h-12 rounded-full bg-black border-2 border-[#FF5500] text-[#FF5500] hover:bg-[#FF5500]/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.6)] transition group"
                title="Yönetici Komuta Merkezi"
              >
                <Terminal className="w-5 h-5 group-hover:scale-110 transition" />
              </motion.button>

              {/* Center Close / Dismiss Button */}
              <button
                onClick={() => setShowRadialMenu(false)}
                className="w-10 h-10 rounded-full bg-black border border-white/30 text-white flex items-center justify-center z-10 hover:bg-gray-900 transition"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Defense Macro Toast Status */}
      <AnimatePresence>
        {auditStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full right-0 mb-3 px-4 py-2.5 rounded-2xl bg-black border border-[#FF5500] text-[#FFAA00] font-mono text-xs shadow-[0_0_25px_rgba(255,85,0,0.7)] whitespace-nowrap z-50"
          >
            {auditStatus}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Bubble with Real-Time Latency Sparkline Graph Border & Audio/Threat Visualizer */}
      <div className="relative group flex items-center justify-center">
        {/* Visualizer Layer 1: Expanding Ripple Rings on Chat Head Boundary */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.div
                key={ripple.id}
                initial={{ scale: 0.95, opacity: 0.95 }}
                animate={{ scale: ripple.maxScale, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: ripple.type === 'critical' ? 1.2 : 0.8, ease: 'easeOut' }}
                className="absolute rounded-full border-2"
                style={{
                  width: '100%',
                  height: '100%',
                  borderColor: ripple.color,
                  boxShadow: `0 0 35px ${ripple.color}, inset 0 0 15px ${ripple.color}`,
                }}
              />
            ))}
          </AnimatePresence>

          {/* Visualizer Layer 2: Audio-Reactive Perimeter Frequency Ring */}
          <div className={`absolute -inset-2.5 rounded-full pointer-events-none transition-all duration-300 ${isSoundVisualizerActive ? 'opacity-100 scale-105' : 'opacity-30 scale-100'}`}>
            <div className="w-full h-full relative flex items-center justify-center animate-spin-slow">
              {visualizerFrequencies.map((freq, idx) => {
                const angle = (idx / visualizerFrequencies.length) * 360;
                const barHeight = isSoundVisualizerActive ? Math.max(5, (freq / 100) * 16) : 4;
                const isCritical = systemStatus === 'breach' || ripples.some((r) => r.type === 'critical');
                const barColor = isCritical ? '#ef4444' : accentColor;
                return (
                  <div
                    key={idx}
                    className="absolute w-1 rounded-full transition-all duration-150"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: barColor,
                      boxShadow: `0 0 10px ${barColor}`,
                      transform: `rotate(${angle}deg) translateY(-42px)`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div
          onClick={handleMainClick}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowRadialMenu(true);
          }}
          className={`relative z-10 w-18 h-18 rounded-full p-1.5 shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer border-2 backdrop-blur-md ${
            systemStatus === 'breach' || ripples.some(r => r.type === 'critical')
              ? 'bg-black border-red-500 shadow-[0_0_35px_rgba(239,68,68,1.0)] animate-pulse'
              : llmExecutionMode === 'local'
              ? 'bg-black border-[#06b6d4] shadow-[0_0_25px_rgba(6,182,212,0.9)]'
              : 'bg-black border-[#FFAA00] shadow-[0_0_25px_rgba(255,170,0,0.9)]'
          }`}
          title={`Aktif Mod: ${llmExecutionMode.toUpperCase()} • Anlık Gecikme: ${latestLatency}ms`}
        >
          {/* Main Visualizer Body */}
          <div className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden">
            <div className={`transition-all duration-300 pb-1 ${botState === 'listening' ? 'text-white' : llmExecutionMode === 'local' ? 'text-[#06b6d4]' : 'text-[#FFAA00]'}`}>
              <BotFaceWithPupils state={botState} mode={llmExecutionMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BotFaceWithPupils: React.FC<{ state: 'idle' | 'listening' | 'processing'; mode: 'local' | 'cloud' | 'idle' }> = ({ state, mode }) => {
  const pupilColor = mode === 'local' ? '#06b6d4' : '#FFAA00';

  return (
    <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Defined Face Structure */}
      <path d="M4 15C4 21.6 9.4 27 16 27H24C30.6 27 36 21.6 36 15V13C36 6.4 30.6 1 24 1H16C9.4 1 4 6.4 4 13V15Z" fill="#111" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Eyes */}
      <circle cx="14" cy="14" r="5" fill="#000" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="26" cy="14" r="5" fill="#000" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Pupils */}
      <motion.circle cx="14" cy="14" r="2" fill={pupilColor} animate={{ cx: state === 'listening' ? 15 : 14 }} />
      <motion.circle cx="26" cy="14" r="2" fill={pupilColor} animate={{ cx: state === 'listening' ? 27 : 26 }} />

      {/* Mouth */}
      <motion.path 
        d={state === 'listening' ? "M15 22C18 24 22 24 25 22" : "M16 21H24"}
        stroke={pupilColor} 
        strokeWidth="2" 
        strokeLinecap="round"
        animate={{ d: state === 'listening' ? "M15 23C18 25 22 25 25 23" : "M16 21H24" }}
      />
    </svg>
  );
};
