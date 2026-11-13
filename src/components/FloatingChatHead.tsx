import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Lock,
  Radio,
  Terminal,
  Camera,
  Monitor,
  MicOff,
  Mic,
  Check,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playTacticalSound, onSoundPlay } from '../utils/audioEffects';
import { triggerHaptic } from '../utils/haptics';
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

export type BubbleEmotion = 'happy' | 'curious' | 'alert' | 'thinking' | 'muted' | 'speaking';

interface FloatingChatHeadProps {
  isListening: boolean;
  isProcessing?: boolean;
  llmExecutionMode?: 'local' | 'cloud' | 'idle';
  isCameraActive: boolean;
  isScreenShareActive: boolean;
  isMicMuted: boolean;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleMicMute: () => void;
  onToggleListening: () => void;
  onOpenAdminCenter: () => void;
  onOpenChat: () => void;
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
  isCameraActive,
  isScreenShareActive,
  isMicMuted,
  onToggleCamera,
  onToggleScreenShare,
  onToggleMicMute,
  onOpenAdminCenter,
  systemStatus = 'secure',
  activeProcesses,
}) => {
  const [position, setPosition] = useState(() => ({
    x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 96) : 280,
    y: typeof window !== 'undefined' ? Math.max(80, window.innerHeight - 210) : 420,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [isThreePartOpen, setIsThreePartOpen] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [auditStatus, setAuditStatus] = useState<string | null>(null);
  const [ripples, setRipples] = useState<
    Array<{ id: string; type: 'critical' | 'warning' | 'sound'; color: string; maxScale: number }>
  >([]);
  const [manualEmotion, setManualEmotion] = useState<BubbleEmotion | null>(null);
  const [blink, setBlink] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; originX: number; originY: number }>({
    x: 0,
    y: 0,
    originX: 0,
    originY: 0,
  });
  const didMoveRef = useRef(false);
  const longPressTimerRef = useRef<number | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Derive live emotion automatically from system state unless overridden briefly
  const activeEmotion: BubbleEmotion = manualEmotion
    ? manualEmotion
    : systemStatus === 'breach' || systemStatus === 'alert'
    ? 'alert'
    : isMicMuted
    ? 'muted'
    : isProcessing
    ? 'thinking'
    : isCameraActive || isScreenShareActive || isListening
    ? 'curious'
    : 'happy';

  // Natural blinking loop for Messenger chat head face
  useEffect(() => {
    const interval = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 150);
    }, 3400);
    return () => window.clearInterval(interval);
  }, []);

  const addRipple = (type: 'critical' | 'warning' | 'sound', customColor?: string) => {
    const id = `ripple-${Date.now()}-${Math.random()}`;
    const color =
      customColor || (type === 'critical' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#38bdf8');
    const maxScale = type === 'critical' ? 2.6 : type === 'warning' ? 2.1 : 1.75;

    setRipples((prev) => [...prev.slice(-4), { id, type, color, maxScale }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1100);
  };

  useEffect(() => {
    const unsubSound = onSoundPlay((soundType) => {
      if (soundType === 'emergency') {
        addRipple('critical', '#ef4444');
      } else if (soundType === 'ai_response') {
        setManualEmotion('speaking');
        window.setTimeout(() => setManualEmotion(null), 1800);
        addRipple('sound', '#38bdf8');
      } else {
        addRipple('sound', '#38bdf8');
      }
    });

    const unsubReport = agentManager.onReport((report) => {
      if (report.type === 'critical') {
        addRipple('critical', '#ef4444');
      } else if (report.type === 'warning') {
        addRipple('warning', '#f59e0b');
      }
    });

    return () => {
      unsubSound();
      unsubReport();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setPosition((pos) => ({
        x: Math.max(16, Math.min(pos.x, window.innerWidth - 88)),
        y: Math.max(70, Math.min(pos.y, window.innerHeight - 150)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only initiate drag/long-press on the main bubble button itself
    const target = e.target as HTMLElement;
    if (target.closest('[data-bubble-interactive="false"]')) return;

    didMoveRef.current = false;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      originX: position.x,
      originY: position.y,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    longPressTimerRef.current = window.setTimeout(() => {
      if (!didMoveRef.current) {
        setIsDragging(false);
        setIsThreePartOpen(false);
        setSelectedProcessId(null);
        setShowRadialMenu(true);
        triggerHaptic('critical');
        playTacticalSound('emergency');
      }
    }, 520);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.hypot(dx, dy) > 6) {
      didMoveRef.current = true;
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      const newX = Math.max(14, Math.min(window.innerWidth - 86, dragStartRef.current.originX + dx));
      const newY = Math.max(64, Math.min(window.innerHeight - 140, dragStartRef.current.originY + dy));
      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleBubbleTap = () => {
    if (didMoveRef.current || showRadialMenu) return;
    triggerHaptic('click');
    playTacticalSound('click');
    setIsThreePartOpen((prev) => !prev);
  };

  const handleProcessIconTap = (e: React.MouseEvent, procId: string) => {
    e.stopPropagation();
    triggerHaptic('click');
    playTacticalSound('click');
    setSelectedProcessId((prev) => (prev === procId ? null : procId));
  };

  const executeDefenseMacro = (macroName: string, message: string) => {
    playTacticalSound('command_exec');
    triggerHaptic('success');
    setAuditStatus(`${macroName}: ${message}`);
    window.setTimeout(() => setAuditStatus(null), 3200);
    setShowRadialMenu(false);
  };

  const selectedProcess = activeProcesses.find((p) => p.id === selectedProcessId) || null;
  const isOnRightSide =
    typeof window !== 'undefined' ? position.x > window.innerWidth * 0.5 : true;

  // Position mini background process icons cleanly in an arc on the inward side of the bubble
  const getProcessOffset = (idx: number, total: number) => {
    const startAngle = isOnRightSide ? 115 : -65;
    const endAngle = isOnRightSide ? 245 : 65;
    const angleDeg =
      total <= 1
        ? (startAngle + endAngle) / 2
        : startAngle + (idx / (total - 1)) * (endAngle - startAngle);
    const rad = (angleDeg * Math.PI) / 180;
    const radius = 50;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  };

  const emotionMeta: Record<BubbleEmotion, { label: string; colorClass: string }> = {
    happy: { label: 'Mutlu', colorClass: 'text-cyan-300 border-cyan-500/60' },
    curious: { label: 'İzliyor', colorClass: 'text-blue-300 border-blue-400/70' },
    alert: { label: 'Dikkat', colorClass: 'text-amber-300 border-amber-500/70' },
    thinking: { label: 'Analiz', colorClass: 'text-sky-300 border-sky-400/70' },
    muted: { label: 'Sessiz', colorClass: 'text-red-300 border-red-500/70' },
    speaking: { label: 'Konuşuyor', colorClass: 'text-emerald-300 border-emerald-400/70' },
  };

  return (
    <div
      ref={bubbleRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className="fixed top-0 left-0 z-[90] select-none"
    >
      {/* Long-Press Radial Defense Macro Menu (Network Kill, VPN Rotation) */}
      <AnimatePresence>
        {showRadialMenu && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <div
              data-bubble-interactive="false"
              className="fixed inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
              onClick={() => setShowRadialMenu(false)}
            />
            <div
              data-bubble-interactive="false"
              className="relative w-52 h-52 pointer-events-auto flex items-center justify-center"
            >
              <motion.button
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: 1, y: -70 }}
                exit={{ scale: 0, y: 0 }}
                onClick={() =>
                  executeDefenseMacro(
                    'Network Kill',
                    'Yetkisiz soketler sonlandırıldı, port mühürlendi.'
                  )
                }
                className="absolute w-12 h-12 rounded-full bg-black border-2 border-red-500 text-red-400 hover:bg-red-950 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)] transition"
                title="Network Kill"
              >
                <ShieldAlert className="w-5 h-5" />
              </motion.button>

              <motion.button
                initial={{ scale: 0, x: 0 }}
                animate={{ scale: 1, x: -70 }}
                exit={{ scale: 0, x: 0 }}
                onClick={() =>
                  executeDefenseMacro(
                    'VPN Rotation',
                    'Ağ tüneli döndürüldü, yeni anonim düğüme geçildi.'
                  )
                }
                className="absolute w-12 h-12 rounded-full bg-black border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-950 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] transition"
                title="VPN Rotation"
              >
                <Radio className="w-5 h-5" />
              </motion.button>

              <motion.button
                initial={{ scale: 0, x: 0 }}
                animate={{ scale: 1, x: 70 }}
                exit={{ scale: 0, x: 0 }}
                onClick={() =>
                  executeDefenseMacro(
                    'Encrypt Buffer',
                    'RAM bellek arabelleği ML-KEM-1024 ile kilitlendi.'
                  )
                }
                className="absolute w-12 h-12 rounded-full bg-black border-2 border-blue-400 text-blue-300 hover:bg-blue-950 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] transition"
                title="Belleği Şifrele"
              >
                <Lock className="w-5 h-5" />
              </motion.button>

              <motion.button
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: 1, y: 70 }}
                exit={{ scale: 0, y: 0 }}
                onClick={() => {
                  setShowRadialMenu(false);
                  onOpenAdminCenter();
                }}
                className="absolute w-12 h-12 rounded-full bg-black border-2 border-emerald-400 text-emerald-300 hover:bg-emerald-950 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.6)] transition"
                title="Komuta Merkezi"
              >
                <Terminal className="w-5 h-5" />
              </motion.button>

              <button
                onClick={() => setShowRadialMenu(false)}
                className="w-10 h-10 rounded-full bg-black border border-white/30 text-white flex items-center justify-center z-10 hover:bg-zinc-900 transition"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 3-Part Toggle Action Bar when Messenger Bubble is Tapped */}
      <AnimatePresence>
        {isThreePartOpen && (
          <motion.div
            data-bubble-interactive="false"
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className={`absolute bottom-full mb-3 ${
              isOnRightSide ? 'right-0' : 'left-0'
            } w-[256px] bg-[#050b14]/95 border border-blue-500/60 rounded-2xl p-1.5 shadow-[0_0_30px_rgba(37,99,235,0.45)] backdrop-blur-xl z-50`}
          >
            <div className="flex items-center justify-between px-2 pb-1 mb-1 border-b border-blue-900/50">
              <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-wider uppercase flex items-center gap-1">
                <Eye className="w-3 h-3" />
                3&apos;lü Canlı Kontrol
              </span>
              <span className="text-[9px] font-mono text-zinc-400">
                Kapatmak için baloncuğa dokun
              </span>
            </div>

            {/* 3-Part Segmented Marked Controls */}
            <div className="grid grid-cols-3 gap-1">
              {/* Part 1: AI Camera Vision */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('click');
                  playTacticalSound('command_exec');
                  onToggleCamera();
                }}
                className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition text-center ${
                  isCameraActive
                    ? 'bg-blue-600/30 border-cyan-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                    : 'bg-black/70 border-blue-900/40 text-zinc-400 hover:text-white hover:border-blue-700'
                }`}
              >
                {isCameraActive && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
                <Camera className={`w-4 h-4 ${isCameraActive ? 'text-cyan-300' : ''}`} />
                <span className="text-[10px] font-bold leading-tight">Kamera Görüşü</span>
              </button>

              {/* Part 2: Live Screen Share / Swap */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('click');
                  playTacticalSound('command_exec');
                  onToggleScreenShare();
                }}
                className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition text-center ${
                  isScreenShareActive
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                    : 'bg-black/70 border-blue-900/40 text-zinc-400 hover:text-white hover:border-blue-700'
                }`}
              >
                {isScreenShareActive && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-400 text-black flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
                <Monitor className={`w-4 h-4 ${isScreenShareActive ? 'text-blue-300' : ''}`} />
                <span className="text-[10px] font-bold leading-tight">Canlı Ekran</span>
              </button>

              {/* Part 3: Silent / Don't Hear Me (Mic Mute) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('click');
                  playTacticalSound(isMicMuted ? 'mic_on' : 'mic_off');
                  onToggleMicMute();
                }}
                className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition text-center ${
                  isMicMuted
                    ? 'bg-red-950/70 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.45)]'
                    : 'bg-black/70 border-blue-900/40 text-zinc-400 hover:text-white hover:border-blue-700'
                }`}
              >
                {isMicMuted && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
                {isMicMuted ? (
                  <MicOff className="w-4 h-4 text-red-400" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                <span className="text-[10px] font-bold leading-tight">Sessiz Mod</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Short Info Note Popover when any Small Background Process Icon is Tapped */}
      <AnimatePresence>
        {selectedProcess && (
          <motion.div
            data-bubble-interactive="false"
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 6 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProcessId(null);
            }}
            className={`absolute ${isThreePartOpen ? 'bottom-full mb-28' : 'bottom-full mb-3'} ${
              isOnRightSide ? 'right-12' : 'left-12'
            } w-60 p-3 rounded-2xl bg-[#050b14]/95 border border-cyan-500/60 shadow-[0_0_24px_rgba(6,182,212,0.4)] backdrop-blur-xl cursor-pointer z-50`}
          >
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-blue-900/50">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="shrink-0">{selectedProcess.icon}</span>
                <span className="text-[11px] font-bold text-white truncate">
                  {selectedProcess.name}
                </span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 shrink-0">● AKTİF</span>
            </div>
            <p className="text-[11px] text-zinc-300 mt-1.5 leading-snug">
              {selectedProcess.details}
            </p>
            {selectedProcess.telemetry[0] && (
              <p className="text-[10px] font-mono text-cyan-300 mt-1.5">
                {selectedProcess.telemetry[0]}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Defense Macro Toast Status */}
      <AnimatePresence>
        {auditStatus && (
          <motion.div
            data-bubble-interactive="false"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`absolute bottom-full mb-3 ${
              isOnRightSide ? 'right-0' : 'left-0'
            } px-3 py-1.5 rounded-xl bg-black/95 border border-cyan-500/60 text-cyan-300 font-mono text-[10px] shadow-[0_0_20px_rgba(6,182,212,0.4)] whitespace-nowrap z-50`}
          >
            {auditStatus}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Surrounding Mini Background Process Icons (Click to open/close short info note) */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {activeProcesses.slice(0, 4).map((proc, idx, arr) => {
          const offset = getProcessOffset(idx, arr.length);
          const isSelected = selectedProcessId === proc.id;
          return (
            <button
              key={proc.id}
              type="button"
              data-bubble-interactive="false"
              onClick={(e) => handleProcessIconTap(e, proc.id)}
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
              }}
              className={`absolute z-30 w-7 h-7 rounded-full flex items-center justify-center border transition-all shadow-lg ${
                isSelected
                  ? 'bg-blue-900 border-cyan-300 scale-115 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                  : 'bg-[#050b14]/95 border-blue-700/60 hover:border-cyan-400 hover:scale-110'
              }`}
              title={`${proc.name} - Bilgilendirme notu`}
            >
              <span className="scale-75 flex items-center justify-center">{proc.icon}</span>
              <span
                className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                  proc.status === 'active'
                    ? 'bg-emerald-400 animate-pulse'
                    : proc.status === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
              />
            </button>
          );
        })}

        {/* Expanding Ripples */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.div
                key={ripple.id}
                initial={{ scale: 0.95, opacity: 0.9 }}
                animate={{ scale: ripple.maxScale, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: ripple.color,
                  boxShadow: `0 0 24px ${ripple.color}`,
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Main Messenger-Style Floating Chat Bubble */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleBubbleTap}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowRadialMenu(true);
          }}
          className={`relative z-20 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 border-2 ${
            systemStatus === 'breach'
              ? 'bg-[#050b14] border-red-500 shadow-[0_0_28px_rgba(239,68,68,0.8)] animate-pulse'
              : isThreePartOpen
              ? 'bg-[#050b14] border-cyan-300 shadow-[0_0_30px_rgba(56,189,248,0.85)] scale-105'
              : isMicMuted
              ? 'bg-[#050b14] border-red-400/80 shadow-[0_0_22px_rgba(239,68,68,0.5)]'
              : 'bg-[#050b14] border-cyan-400 shadow-[0_0_25px_rgba(37,99,235,0.75)]'
          }`}
          title="Asistay Sohbet Baloncuğu (Dokun: 3'lü Kontrol • Basılı Tut: Savunma Makrosu)"
        >
          {/* Live Emotion Badge Pill on Bubble Top */}
          <span
            className={`absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-black/95 border text-[8px] font-mono font-bold whitespace-nowrap shadow-md ${emotionMeta[activeEmotion].colorClass}`}
          >
            {emotionMeta[activeEmotion].label}
          </span>

          {/* Expressive Live Emotional Face */}
          <ExpressiveBubbleFace
            emotion={activeEmotion}
            blink={blink}
            mode={llmExecutionMode}
          />
        </div>
      </div>
    </div>
  );
};

interface ExpressiveBubbleFaceProps {
  emotion: BubbleEmotion;
  blink: boolean;
  mode: 'local' | 'cloud' | 'idle';
}

const ExpressiveBubbleFace: React.FC<ExpressiveBubbleFaceProps> = ({ emotion, blink, mode }) => {
  const accent =
    emotion === 'alert'
      ? '#f59e0b'
      : emotion === 'muted'
      ? '#ef4444'
      : mode === 'local'
      ? '#38bdf8'
      : '#60a5fa';

  // Brow angles & offsets per emotion
  const leftBrowPath =
    emotion === 'alert'
      ? 'M11 10 L18 13'
      : emotion === 'curious'
      ? 'M11 10 Q14.5 7.5 18 10'
      : emotion === 'thinking'
      ? 'M11 11 L18 9.5'
      : 'M11 11 Q14.5 9.5 18 11';

  const rightBrowPath =
    emotion === 'alert'
      ? 'M29 10 L22 13'
      : emotion === 'curious'
      ? 'M22 10 Q25.5 7.5 29 10'
      : emotion === 'thinking'
      ? 'M22 11 Q25.5 10.5 29 11'
      : 'M22 11 Q25.5 9.5 29 11';

  // Mouth shape per emotion
  const mouthPath =
    emotion === 'happy'
      ? 'M14 25 Q20 30 26 25'
      : emotion === 'speaking'
      ? 'M15 24 Q20 31 25 24 Q20 22 15 24 Z'
      : emotion === 'curious'
      ? 'M17 26 Q20 27.5 23 26'
      : emotion === 'alert'
      ? 'M15 27 Q20 23.5 25 27'
      : emotion === 'thinking'
      ? 'M16 26 Q20 25 24 26.5'
      : 'M15 26 H25'; // muted

  const eyeRadiusY = blink ? 0.6 : emotion === 'curious' ? 3.8 : 3.2;
  const pupilOffsetX = emotion === 'thinking' ? 1.4 : emotion === 'curious' ? 0.8 : 0;
  const pupilOffsetY = emotion === 'thinking' ? -0.9 : 0;

  return (
    <svg width="44" height="40" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Subtle Face Contour */}
      <circle
        cx="20"
        cy="18"
        r="16"
        fill="#030914"
        stroke={accent}
        strokeOpacity="0.35"
        strokeWidth="1"
      />

      {/* Expressive Eyebrows */}
      <motion.path
        d={leftBrowPath}
        animate={{ d: leftBrowPath }}
        transition={{ duration: 0.2 }}
        stroke={accent}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <motion.path
        d={rightBrowPath}
        animate={{ d: rightBrowPath }}
        transition={{ duration: 0.2 }}
        stroke={accent}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Left & Right Eyes (Sclera + Iris/Pupil) */}
      <motion.ellipse
        cx="14.5"
        cy="17.5"
        rx="3.4"
        ry={eyeRadiusY}
        animate={{ ry: eyeRadiusY }}
        transition={{ duration: 0.1 }}
        fill="#0b172a"
        stroke={accent}
        strokeWidth="1.2"
      />
      <motion.ellipse
        cx="25.5"
        cy="17.5"
        rx="3.4"
        ry={eyeRadiusY}
        animate={{ ry: eyeRadiusY }}
        transition={{ duration: 0.1 }}
        fill="#0b172a"
        stroke={accent}
        strokeWidth="1.2"
      />

      {!blink && (
        <>
          <motion.circle
            cx={14.5 + pupilOffsetX}
            cy={17.5 + pupilOffsetY}
            r="1.7"
            fill={accent}
            animate={{ cx: 14.5 + pupilOffsetX, cy: 17.5 + pupilOffsetY }}
          />
          <motion.circle
            cx={25.5 + pupilOffsetX}
            cy={17.5 + pupilOffsetY}
            r="1.7"
            fill={accent}
            animate={{ cx: 25.5 + pupilOffsetX, cy: 17.5 + pupilOffsetY }}
          />
          <circle cx={15 + pupilOffsetX} cy={16.8 + pupilOffsetY} r="0.6" fill="#ffffff" />
          <circle cx={26 + pupilOffsetX} cy={16.8 + pupilOffsetY} r="0.6" fill="#ffffff" />
        </>
      )}

      {/* Expressive Mouth / Sealed Lip when Muted */}
      <motion.path
        d={mouthPath}
        animate={{ d: mouthPath }}
        transition={{ duration: 0.2 }}
        fill={emotion === 'speaking' ? accent : 'none'}
        fillOpacity={emotion === 'speaking' ? 0.35 : 0}
        stroke={accent}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {emotion === 'muted' && (
        <>
          <line x1="17" y1="24" x2="19" y2="28" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="21" y1="24" x2="23" y2="28" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};
