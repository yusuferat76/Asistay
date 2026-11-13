import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  Lock,
  Radio,
  Cpu,
  X,
  Zap,
  Shield,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { RealisticHuman3DAvatar } from './RealisticHuman3DAvatar';
import { playTacticalSound } from '../utils/audioEffects';
import { triggerHaptic } from '../utils/haptics';

interface ProcessDetail {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'warning' | 'nominal';
  icon: React.ReactNode;
  summary: string;
  metrics: { [key: string]: string };
}

interface AsistayCenterHUDProps {
  isListening: boolean;
  onAvatarClick: () => void;
  onToggleVoiceCommand?: () => void;
  lastVoiceCommand?: string | null;
  lastTranscript?: string;
  status?: 'secure' | 'alert' | 'breach';
}

const IDLE_SCAN_WAYPOINTS: Array<{ x: number; y: number; scale: number }> = [
  { x: -0.58, y: -0.45, scale: 1.01 }, // Upper-left perimeter / Globe
  { x: 0.62, y: -0.38, scale: 1.015 }, // Upper-right telemetry
  { x: 0.08, y: 0.05, scale: 1.0 },    // Center lock
  { x: -0.64, y: 0.36, scale: 1.015 }, // Lower-left node
  { x: 0.56, y: 0.42, scale: 1.01 },   // Lower-right node
  { x: 0.0, y: -0.22, scale: 1.02 },   // Upward watchful glance
];

const PROCESS_GAZE_MAP: Record<string, { x: number; y: number }> = {
  'sentinel-x': { x: -0.75, y: -0.65 },
  'guardian-v': { x: -0.75, y: 0.65 },
  'ghost-s': { x: 0.75, y: -0.65 },
  'cipher-breaker': { x: 0.75, y: 0.65 },
};

export const AsistayCenterHUD: React.FC<AsistayCenterHUDProps> = ({
  isListening,
  onAvatarClick,
  onToggleVoiceCommand,
  lastVoiceCommand = null,
  lastTranscript = '',
  status = 'secure',
}) => {
  const [selectedProcess, setSelectedProcess] = useState<ProcessDetail | null>(null);
  const [processNotice, setProcessNotice] = useState<string | null>(null);
  const [isIdleScanning, setIsIdleScanning] = useState<boolean>(true);
  const avatarScanRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const idleTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const waypointIndexRef = useRef<number>(0);

  const applyGazeTransform = useCallback((nx: number, ny: number, scale = 1.015) => {
    const el = avatarScanRef.current;
    if (!el) return;
    const clampedX = Math.max(-1, Math.min(1, nx));
    const clampedY = Math.max(-1, Math.min(1, ny));

    el.style.setProperty('--scan-tx', `${(clampedX * 5.5).toFixed(2)}px`);
    el.style.setProperty('--scan-ty', `${(clampedY * 4.5).toFixed(2)}px`);
    el.style.setProperty('--scan-ry', `${(clampedX * 11.5).toFixed(2)}deg`);
    el.style.setProperty('--scan-rx', `${(-clampedY * 9.5).toFixed(2)}deg`);
    el.style.setProperty('--scan-scale', scale.toFixed(3));
  }, []);

  const computeVectorToHub = useCallback((clientX: number, clientY: number) => {
    const hub = hubRef.current;
    if (!hub) {
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      return {
        x: (clientX / vw) * 2 - 1,
        y: (clientY / vh) * 2 - 1,
      };
    }

    const rect = hub.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxSpanX = Math.max(window.innerWidth * 0.45, 180);
    const maxSpanY = Math.max(window.innerHeight * 0.4, 180);

    return {
      x: Math.max(-1, Math.min(1, (clientX - cx) / maxSpanX)),
      y: Math.max(-1, Math.min(1, (clientY - cy) / maxSpanY)),
    };
  }, []);

  // Track cursor movement & element focus across the screen
  useEffect(() => {
    const scheduleIdleReturn = () => {
      if (idleTimeoutRef.current !== null) {
        window.clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = window.setTimeout(() => {
        setIsIdleScanning(true);
      }, 2100);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (selectedProcess) return;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      const { clientX, clientY } = e;
      rafRef.current = requestAnimationFrame(() => {
        setIsIdleScanning(false);
        const vec = computeVectorToHub(clientX, clientY);
        applyGazeTransform(vec.x, vec.y, 1.022);
        scheduleIdleReturn();
      });
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || typeof target.getBoundingClientRect !== 'function') return;
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      setIsIdleScanning(false);
      const vec = computeVectorToHub(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
      applyGazeTransform(vec.x, vec.y, 1.028);
      scheduleIdleReturn();
    };

    const handleMouseLeave = () => {
      setIsIdleScanning(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('focusin', handleFocusIn, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('focusin', handleFocusIn);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      if (idleTimeoutRef.current !== null) window.clearTimeout(idleTimeoutRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [applyGazeTransform, computeVectorToHub, selectedProcess]);

  // Autonomous micro-idle screen scanning loop when user isn't actively moving/focusing
  useEffect(() => {
    if (selectedProcess) {
      const target = PROCESS_GAZE_MAP[selectedProcess.id] || { x: 0, y: -0.2 };
      setIsIdleScanning(false);
      applyGazeTransform(target.x, target.y, 1.03);
      return;
    }

    if (!isIdleScanning) return;

    const triggerNextScan = () => {
      const wp = IDLE_SCAN_WAYPOINTS[waypointIndexRef.current % IDLE_SCAN_WAYPOINTS.length];
      waypointIndexRef.current += 1;
      applyGazeTransform(wp.x, wp.y, wp.scale);
    };

    triggerNextScan();
    const intervalId = window.setInterval(
      triggerNextScan,
      status === 'breach' || status === 'alert' ? 1450 : 2200
    );

    return () => window.clearInterval(intervalId);
  }, [isIdleScanning, selectedProcess, status, applyGazeTransform]);

  const activeProcesses: ProcessDetail[] = [
    {
      id: 'sentinel-x',
      name: 'Sentinel-X DPI',
      code: 'NET_SOCKET_SCAN',
      status: 'active',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      summary: 'Ağ perimetresi üzerinde derin paket analizi ve port sızıntı kalkanı.',
      metrics: {
        'Taranan Paket': '8.4M pps',
        'Soket Durumu': 'Mühürlü (0 Sızıntı)',
        'Gecikme': '0.8 ms',
      },
    },
    {
      id: 'guardian-v',
      name: 'Guardian-V PQC',
      code: 'RAM_VAULT_MLKEM',
      status: 'active',
      icon: <Lock className="w-4 h-4 text-emerald-400" />,
      summary: 'Kuantum sonrası ML-KEM-1024 ve donanımsal RAM tampon şifrelemesi.',
      metrics: {
        'Algoritma': 'ML-KEM-1024',
        'Bütünlük': '%100.00',
        'Buffer Koruma': 'AES-256-GCM',
      },
    },
    {
      id: 'ghost-s',
      name: 'Ghost-S Onion',
      code: 'TOR_WIREGUARD_HOP',
      status: 'active',
      icon: <Radio className="w-4 h-4 text-amber-400" />,
      summary: '3-Hop WireGuard Avrupa anonim tüneli ve sentetik dijital parmak izi maskelemesi.',
      metrics: {
        'Çıkış Düğümü': 'Zürih / İsviçre',
        'IP Durumu': 'Maskelenmiş',
        'DNS Güvenliği': 'DoH Aktif',
      },
    },
    {
      id: 'cipher-breaker',
      name: 'Şifre Kırıcı AI',
      code: 'HEURISTIC_DECRYPTOR',
      status: 'nominal',
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      summary: 'Bilinmeyen şifreli veri bloklarını milisaniyeler içinde çözen sezgisel motor.',
      metrics: {
        'İşlem Gücü': '14.2 TFlops',
        'Entropi Analizi': 'Nominal',
        'Başarı Oranı': '%99.9',
      },
    },
  ];

  const handleProcessClick = (p: ProcessDetail) => {
    playTacticalSound('click');
    triggerHaptic('click');
    setSelectedProcess(selectedProcess?.id === p.id ? null : p);
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center my-2">
      {/* Circuit lines & Side Subtitles matching Screenshot */}
      <div className="w-full flex items-center justify-between pointer-events-none mb-1 px-1">
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-blue-300/80 tracking-wider">
          <span className="w-4 h-0.5 bg-blue-500/80" />
          <span>YAPAY ZEKA İLE DAHA GÜVENLİ BİR DİJİTAL DÜNYA</span>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-blue-300/80 tracking-wider">
          <span>SOR ÖĞREN KONTROL ET</span>
          <span className="w-4 h-0.5 bg-blue-500/80" />
        </div>
      </div>

      {/* Main Center HUD Area */}
      <div className="relative flex items-center justify-center w-full max-w-sm py-4">
        {/* Outer Tech Brackets / Geometric Wings (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          viewBox="0 0 360 180"
          fill="none"
        >
          <path
            d="M 20 90 L 80 90 L 110 50 L 140 50"
            stroke="#0284c7"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />
          <path
            d="M 20 90 L 80 90 L 110 130 L 140 130"
            stroke="#0284c7"
            strokeWidth="1.2"
          />
          <path
            d="M 340 90 L 280 90 L 250 50 L 220 50"
            stroke="#0284c7"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />
          <path
            d="M 340 90 L 280 90 L 250 130 L 220 130"
            stroke="#0284c7"
            strokeWidth="1.2"
          />
        </svg>

        {/* Orbiting / Surrounding Background Process Badges */}
        {/* 1. Top-Left: Sentinel-X */}
        <button
          onClick={() => handleProcessClick(activeProcesses[0])}
          className="absolute -top-1 left-4 sm:left-10 z-20 p-2 rounded-2xl bg-black/80 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition transform hover:scale-110 flex items-center gap-1.5 group"
          title="Sentinel-X DPI Ayrıntıları"
        >
          <div className="relative">
            {activeProcesses[0].icon}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <span className="text-[10px] font-mono text-cyan-300 font-bold hidden sm:inline">
            DPI
          </span>
        </button>

        {/* 2. Bottom-Left: Guardian-V */}
        <button
          onClick={() => handleProcessClick(activeProcesses[1])}
          className="absolute -bottom-1 left-4 sm:left-10 z-20 p-2 rounded-2xl bg-black/80 border border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition transform hover:scale-110 flex items-center gap-1.5 group"
          title="Guardian-V PQC Ayrıntıları"
        >
          <div className="relative">
            {activeProcesses[1].icon}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-emerald-300 font-bold hidden sm:inline">
            PQC
          </span>
        </button>

        {/* 3. Top-Right: Ghost-S */}
        <button
          onClick={() => handleProcessClick(activeProcesses[2])}
          className="absolute -top-1 right-4 sm:right-10 z-20 p-2 rounded-2xl bg-black/80 border border-amber-500/40 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition transform hover:scale-110 flex items-center gap-1.5 group"
          title="Ghost-S Onion Tüneli"
        >
          <div className="relative">
            {activeProcesses[2].icon}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-amber-300 font-bold hidden sm:inline">
            VPN
          </span>
        </button>

        {/* 4. Bottom-Right: Cipher Breaker */}
        <button
          onClick={() => handleProcessClick(activeProcesses[3])}
          className="absolute -bottom-1 right-4 sm:right-10 z-20 p-2 rounded-2xl bg-black/80 border border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition transform hover:scale-110 flex items-center gap-1.5 group"
          title="Şifre Kırıcı AI Ayrıntıları"
        >
          <div className="relative">
            {activeProcesses[3].icon}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono text-purple-300 font-bold hidden sm:inline">
            KIRICI
          </span>
        </button>

        {/* Central Circular PTT & 3D Realistic Avatar Button */}
        <div
          ref={hubRef}
          onClick={onAvatarClick}
          className="relative w-36 h-36 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 group"
          title="Yapay Zekayı Aktif Et (Kamera, Ekran Paylaşımı & Görüş)"
        >
          {/* Concentric Glowing Blue Rings matching Screenshot */}
          <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-spin-slow pointer-events-none" />
          <div className="absolute -inset-2 rounded-full border-2 border-blue-600/40 shadow-[0_0_35px_rgba(37,99,235,0.6)] pointer-events-none group-hover:scale-105 transition-transform" />
          <div className="absolute -inset-4 rounded-full border border-cyan-400/20 opacity-60 pointer-events-none" />

          {/* Deep Black Inner Hub */}
          <div className="relative w-32 h-32 rounded-full bg-black/95 border-2 border-cyan-400/80 shadow-[inset_0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center overflow-hidden">
            {/* Watchful Micro-Idle & Cursor/Focus Scanning Wrapper */}
            <div
              ref={avatarScanRef}
              className={`relative w-full h-full flex items-center justify-center avatar-micro-scan ${
                isIdleScanning ? 'avatar-micro-scan--idle' : ''
              }`}
            >
              {/* Subtle Optical Gaze Reticle Overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-3 rounded-full border border-dashed border-cyan-400/25 pointer-events-none avatar-reticle-parallax"
              />

              {/* Realistic 3D Human Avatar */}
              <RealisticHuman3DAvatar
                isListening={isListening}
                status={status}
                onClick={onAvatarClick}
              />
            </div>

            {/* Ambient Soundwave Bars Overlay at Bottom of Circle */}
            <div className="absolute bottom-2 flex items-end gap-1 opacity-80 pointer-events-none">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-cyan-300 rounded-full animate-bounce" />
              <span className="w-1 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Button Subtitles matching Screenshot — Tap to toggle Live Voice Command Listener */}
      <button
        type="button"
        onClick={onToggleVoiceCommand}
        className="flex flex-col items-center mt-1 group cursor-pointer focus:outline-none"
        title="Sesli Komut Dinleyiciyi Aç/Kapat (Open Security Radar, Run Cipher Breaker, Enable Stealth Mode)"
      >
        <span className="text-base font-black text-white tracking-wider group-hover:text-cyan-300 transition">
          Bas-konuş
        </span>
        <span
          className={`text-xs font-mono transition ${
            isListening ? 'text-cyan-400 animate-pulse' : 'text-gray-400'
          }`}
        >
          {isListening
            ? lastTranscript
              ? `Dinleniyor: "${lastTranscript}"`
              : 'Sesli komut dinleniyor...'
            : 'Dinlemeye hazır'}
        </span>
        {lastVoiceCommand && (
          <span className="mt-1 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-cyan-500/50 text-[10px] font-mono text-cyan-300">
            Komut çalıştırıldı: {lastVoiceCommand}
          </span>
        )}
      </button>

      {/* Floating Info Popover when any background process chip is tapped */}
      {selectedProcess && (
        <div className="absolute z-30 bottom-full mb-3 w-80 p-4 rounded-3xl bg-black/95 border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.5)] backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-cyan-950 border border-cyan-600/40">
                {selectedProcess.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {selectedProcess.name}
                </h4>
                <span className="text-[10px] font-mono text-cyan-400">
                  {selectedProcess.code}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedProcess(null)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-300 mt-2.5 leading-relaxed">
            {selectedProcess.summary}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-800/80">
            {Object.entries(selectedProcess.metrics).map(([k, v]) => (
              <div key={k} className="p-2 rounded-xl bg-gray-950/80 border border-gray-800">
                <span className="text-[9px] font-mono text-gray-400 block">{k}</span>
                <span className="text-xs font-mono font-bold text-cyan-300">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ARKA PLANDA AKTİF
            </span>
            <button
              onClick={() => {
                playTacticalSound('command_exec');
                triggerHaptic('success');
                const refreshedName = selectedProcess.name;
                setSelectedProcess(null);
                setProcessNotice(`${refreshedName} otonom izleme döngüsü yenilendi.`);
                window.setTimeout(() => setProcessNotice(null), 2600);
              }}
              className="text-[10px] font-mono font-bold text-cyan-400 hover:text-white px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 transition"
            >
              Yeniden Başlat
            </button>
          </div>
        </div>
      )}

      {processNotice && (
        <div className="mt-2 px-3 py-1 rounded-xl bg-blue-950/90 border border-cyan-500/50 text-[10px] font-mono text-cyan-200 shadow-lg animate-fadeIn">
          {processNotice}
        </div>
      )}
    </div>
  );
};
