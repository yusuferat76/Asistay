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
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playTacticalSound } from '../utils/audioEffects';

export interface BackgroundProcess {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'warning' | 'error';
  icon: React.ReactNode;
  details: string;
  telemetry: string[];
}

interface FloatingChatHeadProps {
  isListening: boolean;
  isProcessing?: boolean;
  onToggleListening: () => void;
  onOpenSplitWise: () => void;
  onOpenSettings: () => void;
  onOpenEmergency: () => void;
  systemStatus?: 'secure' | 'alert' | 'breach';
  activeProcesses: BackgroundProcess[];
}

export const FloatingChatHead: React.FC<FloatingChatHeadProps> = ({
  isListening,
  isProcessing = false,
  onToggleListening,
  onOpenSplitWise,
  onOpenSettings,
  onOpenEmergency,
  systemStatus = 'secure',
  activeProcesses,
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<BackgroundProcess | null>(null);

  const bubbleRef = useRef<HTMLDivElement>(null);

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
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 65, e.clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 65, e.clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleMainClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      playTacticalSound('click');
      onToggleListening();
    }
  };

  const handleActionClick = (action: () => void) => {
    playTacticalSound('click');
    action();
    setShowQuickActions(false);
  };

  const botState = isProcessing ? 'processing' : isListening ? 'listening' : 'idle';

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
      {/* Dynamic Process Icons (Lateral Rail) */}
      <div className="absolute top-0 right-full mr-4 flex flex-col gap-2 items-end">
        <AnimatePresence>
          {activeProcesses.map((proc) => (
            <motion.button
              key={proc.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              onClick={() => setSelectedProcess(proc)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border backdrop-blur-md transition-all ${
                proc.status === 'active' 
                  ? 'bg-blue-600/20 border-blue-400 text-blue-400' 
                  : proc.status === 'warning'
                  ? 'bg-amber-600/20 border-amber-400 text-amber-400'
                  : proc.status === 'error'
                  ? 'bg-red-600/20 border-red-400 text-red-400'
                  : 'bg-black/40 border-white/10 text-white/40'
              } hover:border-white hover:text-white`}
            >
              {proc.status === 'active' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-lg border border-white/20"
                />
              )}
              {proc.icon}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Actions (Speed Dial) */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col items-center gap-3 origin-bottom"
          >
            <button
              onClick={() => handleActionClick(onOpenSplitWise)}
              className="w-10 h-10 rounded-full bg-[#0a1b42] border border-blue-500/50 flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-600 transition shadow-xl"
              title="SplitWise Fatura Tara"
            >
              <Receipt className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleActionClick(onOpenSettings)}
              className="w-10 h-10 rounded-full bg-[#0a1b42] border border-blue-500/50 flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-600 transition shadow-xl"
              title="Ayarlar"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleActionClick(onOpenEmergency)}
              className="w-10 h-10 rounded-full bg-red-950 border border-red-500/50 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-600 transition shadow-xl"
              title="Acil Durdur"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Process Detail Overlay */}
      <AnimatePresence>
        {selectedProcess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            className="absolute bottom-0 right-full mr-14 w-64 glass-panel rounded-2xl p-4 border-blue-500/30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-blue-400">{selectedProcess.icon}</div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">{selectedProcess.name}</h3>
              </div>
              <button onClick={() => setSelectedProcess(null)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-300 leading-relaxed mb-3">{selectedProcess.details}</p>
            <div className="bg-black/60 rounded-xl p-2 font-mono text-[9px] text-blue-300/70 h-24 overflow-y-auto no-overflow-scrolling border border-white/5">
              {selectedProcess.telemetry.map((line, idx) => (
                <div key={idx} className="flex gap-1">
                  <span className="opacity-30">[{idx}]</span>
                  <span>{line}</span>
                </div>
              ))}
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1 h-2 bg-blue-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bubble */}
      <div className="relative group">
        <div
          onClick={handleMainClick}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowQuickActions(!showQuickActions);
          }}
          className={`w-16 h-16 rounded-full p-0.5 shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer border-2 backdrop-blur-md ${
            botState === 'listening' 
              ? 'bg-blue-600/40 border-white cyber-glow-blue' 
              : botState === 'processing'
              ? 'bg-blue-900/60 border-blue-400'
              : 'bg-black/60 border-blue-600/60 hover:border-white'
          }`}
        >
          <div className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden">
            {botState === 'listening' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-white"
              />
            )}
            
            <div className={`transition-all duration-300 ${botState === 'listening' ? 'text-white' : 'text-blue-500'}`}>
              <BotFace state={botState} />
            </div>
          </div>

          <div className="absolute -top-1 -right-1 flex gap-0.5">
            {systemStatus === 'alert' && (
              <div className="w-4 h-4 rounded-full bg-yellow-500 border border-black flex items-center justify-center">
                <AlertTriangle className="w-2.5 h-2.5 text-black" />
              </div>
            )}
            {systemStatus === 'breach' && (
              <div className="w-4 h-4 rounded-full bg-red-600 border border-black flex items-center justify-center animate-bounce">
                <ShieldAlert className="w-2.5 h-2.5 text-white" />
              </div>
            )}
            {systemStatus === 'secure' && (
              <div className="w-4 h-4 rounded-full bg-emerald-500 border border-black flex items-center justify-center">
                <Shield className="w-2.5 h-2.5 text-black" />
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickActions(!showQuickActions);
            }}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0a1b42] border border-blue-500/50 flex items-center justify-center text-blue-400 hover:text-white transition shadow-md z-10"
          >
            {showQuickActions ? <X className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
          </button>
        </div>

        {botState === 'listening' && (
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none">
            <motion.div animate={{ width: [32, 48, 32] }} transition={{ duration: 0.8, repeat: Infinity }} className="h-1 bg-blue-500 rounded-full" />
            <motion.div animate={{ width: [24, 40, 24] }} transition={{ duration: 1.2, repeat: Infinity }} className="h-1 bg-blue-400 rounded-full" />
            <motion.div animate={{ width: [40, 56, 40] }} transition={{ duration: 0.6, repeat: Infinity }} className="h-1 bg-blue-600 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};

const BotFace: React.FC<{ state: 'idle' | 'listening' | 'processing' }> = ({ state }) => {
  return (
    <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={state === 'listening' ? 'bot-glow-listening' : state === 'processing' ? 'bot-glow-processing' : 'bot-glow'}>
      <motion.path
        d="M8 8C10 6 14 6 16 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          d: state === 'listening' ? "M8 6C10 4 14 4 16 6" : state === 'processing' ? "M8 9C10 8 14 8 16 9" : "M8 8C10 6 14 6 16 8",
          y: state === 'listening' ? -2 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <motion.path
        d="M24 8C26 6 30 6 32 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          d: state === 'listening' ? "M24 6C26 4 30 4 32 6" : state === 'processing' ? "M24 9C26 8 30 8 32 9" : "M24 8C26 6 30 6 32 8",
          y: state === 'listening' ? -2 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <motion.ellipse
        cx="12"
        cy="18"
        rx="4"
        ry="4"
        fill="currentColor"
        animate={{
          ry: state === 'idle' ? [4, 4, 0.5, 4] : state === 'listening' ? 6 : 4,
          rx: state === 'listening' ? 6 : 4,
          opacity: state === 'processing' ? [1, 0.5, 1] : 1,
          scale: state === 'listening' ? 1.1 : 1,
        }}
        transition={{
          ry: state === 'idle' ? { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] } : { duration: 0.2 },
          opacity: { duration: 0.3, repeat: Infinity }
        }}
      />
      <motion.ellipse
        cx="28"
        cy="18"
        rx="4"
        ry="4"
        fill="currentColor"
        animate={{
          ry: state === 'idle' ? [4, 4, 0.5, 4] : state === 'listening' ? 6 : 4,
          rx: state === 'listening' ? 6 : 4,
          opacity: state === 'processing' ? [1, 0.5, 1] : 1,
          scale: state === 'listening' ? 1.1 : 1,
        }}
        transition={{
          ry: state === 'idle' ? { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] } : { duration: 0.2 },
          opacity: { duration: 0.3, repeat: Infinity }
        }}
      />
      {state === 'processing' && (
        <motion.rect
          x="8"
          y="12"
          width="24"
          height="12"
          stroke="currentColor"
          strokeWidth="0.5"
          rx="2"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      {state === 'processing' && (
        <motion.line
          x1="10"
          y1="12"
          x2="10"
          y2="24"
          stroke="currentColor"
          strokeWidth="1"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </svg>
  );
};
