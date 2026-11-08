import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { Globe, Filter, AlertTriangle, Shield, Zap, X, Radio, RefreshCw, Eye, Flame, Activity, Layers } from 'lucide-react';
import { RadialMacroMenu } from './RadialMacroMenu';

export interface CyberThreatPoint {
  id: string;
  originName: string;
  originCoords: [number, number]; // [lng, lat]
  targetName: string;
  targetCoords: [number, number]; // [lng, lat]
  attackType: 'DDOS' | 'Zero-Day' | 'Ransomware' | 'SS7 Intercept' | 'RAT Infection' | 'Credential Theft';
  severity: 'Critical' | 'High' | 'Medium';
  method: string;
  affectedComponent: string;
  timestamp: string;
}

const SAMPLE_THREATS: CyberThreatPoint[] = [
  {
    id: 'th-1',
    originName: 'Frankfurt, DE',
    originCoords: [8.6821, 50.1109],
    targetName: 'Istanbul, TR',
    targetCoords: [28.9784, 41.0082],
    attackType: 'SS7 Intercept',
    severity: 'Critical',
    method: 'Diameter Omurga İstismarı & Anlık Baz İstasyonu Sorgusu',
    affectedComponent: 'GSM Şebekesi & SMS 2FA Geçidi',
    timestamp: 'Az önce',
  },
  {
    id: 'th-2',
    originName: 'Washington, US',
    originCoords: [-77.0369, 38.9072],
    targetName: 'Tokyo, JP',
    targetCoords: [139.6917, 35.6895],
    attackType: 'Zero-Day',
    severity: 'Critical',
    method: 'Linux Kernel 6.8 Heap Overflow Exploit',
    affectedComponent: 'AWS Cloud Edge Server',
    timestamp: '2 dk önce',
  },
  {
    id: 'th-3',
    originName: 'Moscow, RU',
    originCoords: [37.6173, 55.7558],
    targetName: 'London, UK',
    targetCoords: [-0.1276, 51.5074],
    attackType: 'Ransomware',
    severity: 'High',
    method: 'Double Extortion Exfiltration (LockBit v4)',
    affectedComponent: 'Finansal Veritabanı Kümesi',
    timestamp: '5 dk önce',
  },
  {
    id: 'th-4',
    originName: 'Beijing, CN',
    originCoords: [116.4074, 39.9042],
    targetName: 'Sao Paulo, BR',
    targetCoords: [-46.6333, -23.5505],
    attackType: 'DDOS',
    severity: 'Medium',
    method: 'SYN Flood 1.2 Tbps Botnet Saldırısı',
    affectedComponent: 'Telekomünikasyon DNS Sunucusu',
    timestamp: '8 dk önce',
  },
  {
    id: 'th-5',
    originName: 'Ankara, TR',
    originCoords: [32.8597, 39.9334],
    targetName: 'Berlin, DE',
    targetCoords: [13.405, 52.52],
    attackType: 'RAT Infection',
    severity: 'High',
    method: 'Hermes Agent Otonom C2 Tüneli',
    affectedComponent: 'Kurumsal E-posta İstemcisi',
    timestamp: '12 dk önce',
  },
];

export interface TacticalTrafficCluster {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat]
  baseIntensity: number; // 0.0 to 1.0 (gradient scale from parliament-blue to danger-red)
  baseRadius: number;
  throughput: string;
  packetRate: string;
  threatLevel: 'Low' | 'Elevated' | 'High' | 'Critical';
  phase: number;
}

export const TACTICAL_TRAFFIC_CLUSTERS: TacticalTrafficCluster[] = [
  {
    id: 'cl-1',
    name: 'Frankfurt DE-CIX',
    coords: [8.6821, 50.1109],
    baseIntensity: 0.95,
    baseRadius: 38,
    throughput: '34.8 Tbps',
    packetRate: '8.4M pps',
    threatLevel: 'Critical',
    phase: 0.1,
  },
  {
    id: 'cl-2',
    name: 'Istanbul Marmara IXP',
    coords: [28.9784, 41.0082],
    baseIntensity: 0.88,
    baseRadius: 34,
    throughput: '18.2 Tbps',
    packetRate: '5.1M pps',
    threatLevel: 'Critical',
    phase: 1.2,
  },
  {
    id: 'cl-3',
    name: 'Ashburn / Washington DC',
    coords: [-77.0369, 38.9072],
    baseIntensity: 0.98,
    baseRadius: 42,
    throughput: '52.1 Tbps',
    packetRate: '12.8M pps',
    threatLevel: 'Critical',
    phase: 2.3,
  },
  {
    id: 'cl-4',
    name: 'Tokyo JPIX',
    coords: [139.6917, 35.6895],
    baseIntensity: 0.82,
    baseRadius: 32,
    throughput: '24.5 Tbps',
    packetRate: '6.3M pps',
    threatLevel: 'High',
    phase: 3.4,
  },
  {
    id: 'cl-5',
    name: 'London LINX',
    coords: [-0.1276, 51.5074],
    baseIntensity: 0.74,
    baseRadius: 30,
    throughput: '21.0 Tbps',
    packetRate: '4.9M pps',
    threatLevel: 'High',
    phase: 4.1,
  },
  {
    id: 'cl-6',
    name: 'Moscow MSK-IX',
    coords: [37.6173, 55.7558],
    baseIntensity: 0.79,
    baseRadius: 30,
    throughput: '16.4 Tbps',
    packetRate: '4.2M pps',
    threatLevel: 'High',
    phase: 0.8,
  },
  {
    id: 'cl-7',
    name: 'Beijing CIX Hub',
    coords: [116.4074, 39.9042],
    baseIntensity: 0.84,
    baseRadius: 32,
    throughput: '28.9 Tbps',
    packetRate: '7.0M pps',
    threatLevel: 'Critical',
    phase: 1.9,
  },
  {
    id: 'cl-8',
    name: 'Sao Paulo IX.br',
    coords: [-46.6333, -23.5505],
    baseIntensity: 0.45,
    baseRadius: 26,
    throughput: '9.2 Tbps',
    packetRate: '2.1M pps',
    threatLevel: 'Elevated',
    phase: 2.7,
  },
  {
    id: 'cl-9',
    name: 'Singapore SGIX',
    coords: [103.8198, 1.3521],
    baseIntensity: 0.52,
    baseRadius: 27,
    throughput: '11.8 Tbps',
    packetRate: '2.8M pps',
    threatLevel: 'Elevated',
    phase: 3.1,
  },
  {
    id: 'cl-10',
    name: 'Sydney NSW-IX',
    coords: [151.2093, -33.8688],
    baseIntensity: 0.35,
    baseRadius: 24,
    throughput: '6.4 Tbps',
    packetRate: '1.4M pps',
    threatLevel: 'Low',
    phase: 4.5,
  },
];

interface Cyber3DGlobeProps {
  onAskAssistant: (question: string) => void;
  isLowBattery?: boolean;
}

export const Cyber3DGlobe: React.FC<Cyber3DGlobeProps> = ({ onAskAssistant, isLowBattery = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<CyberThreatPoint | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<TacticalTrafficCluster | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [isRadialOpen, setIsRadialOpen] = useState<boolean>(false);
  const [activeListTab, setActiveListTab] = useState<'threats' | 'clusters'>('threats');
  const [filterAttackType, setFilterAttackType] = useState<string>('ALL');
  const [filterRegion, setFilterRegion] = useState<string>('GLOBAL');
  const [isRotating, setIsRotating] = useState(true);
  const rotationRef = useRef<[number, number]>([0, -20]);

  const filteredThreats = SAMPLE_THREATS.filter((t) => {
    const matchType = filterAttackType === 'ALL' || t.attackType === filterAttackType;
    const matchRegion =
      filterRegion === 'GLOBAL' ||
      t.originName.toLowerCase().includes(filterRegion.toLowerCase()) ||
      t.targetName.toLowerCase().includes(filterRegion.toLowerCase());
    return matchType && matchRegion;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const projection = d3.geoOrthographic().scale(width / 2.3).translate([width / 2, height / 2]).clipAngle(90);
    const path = d3.geoPath().projection(projection).context(ctx);
    const graticule = d3.geoGraticule10();

    let animationFrameId: number;
    let waveProgress = 0;
    let lastRenderTime = 0;
    const fpsLimit = isLowBattery ? 12 : 60;
    const frameInterval = 1000 / fpsLimit;

    // Custom Canvas Globe Renderer with atmosphere, graticule, points and arcs
    const render = (time: number) => {
      const delta = time - lastRenderTime;

      if (delta < frameInterval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      lastRenderTime = time - (delta % frameInterval);

      // Disable rotation and slow down wave in low battery mode
      if (isRotating && !isLowBattery) {
        rotationRef.current[0] += 0.3;
      }
      
      projection.rotate([rotationRef.current[0], rotationRef.current[1]]);
      
      if (!isLowBattery) {
        waveProgress = (waveProgress + 0.03) % 1;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Outer Glow Atmosphere (Disable in low battery)
      if (!isLowBattery) {
        const grad = ctx.createRadialGradient(width / 2, height / 2, projection.scale() * 0.95, width / 2, height / 2, projection.scale() * 1.15);
        grad.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, projection.scale() * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Globe Sphere Ocean Base
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, projection.scale(), 0, Math.PI * 2);
      ctx.fillStyle = '#030814';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.stroke();

      // 3. Graticule Lines
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 3.5. Tactical Heatmap Overlay: Active Network Traffic Clusters (Parliament-Blue to Danger-Red Gradient Scale)
      if (showHeatmap) {
        ctx.save();
        ctx.globalCompositeOperation = isLowBattery ? 'source-over' : 'lighter';

        TACTICAL_TRAFFIC_CLUSTERS.forEach((cluster) => {
          if (!isPointVisible(cluster.coords, projection)) return;

          const pt = projection(cluster.coords);
          if (!pt) return;

          // Organic oscillation for live tactical cluster pulsation
          const timeSec = time * 0.0025;
          const pulse = Math.sin(timeSec + cluster.phase);
          const intensity = Math.min(1, Math.max(0.2, cluster.baseIntensity + pulse * 0.08));
          const radius = isLowBattery
            ? cluster.baseRadius * 0.75
            : cluster.baseRadius * (1 + pulse * 0.15);

          // Radial Gradient: Parliament-Blue (#1e3a8a) -> Cyan/Amber (#3b82f6/#f59e0b) -> Danger-Red (#ef4444)
          const grad = ctx.createRadialGradient(pt[0], pt[1], 0, pt[0], pt[1], radius);

          if (intensity >= 0.78) {
            // Danger-Red High Intensity Cluster
            grad.addColorStop(0, `rgba(239, 68, 68, ${0.85 * intensity})`); // Peak Danger-Red
            grad.addColorStop(0.3, `rgba(245, 158, 11, ${0.65 * intensity})`); // Amber midpoint
            grad.addColorStop(0.65, `rgba(30, 58, 138, ${0.48 * intensity})`); // Parliament-Blue edge
            grad.addColorStop(1, 'rgba(30, 58, 138, 0)'); // Fade
          } else if (intensity >= 0.52) {
            // Medium / Elevated Traffic
            grad.addColorStop(0, `rgba(245, 158, 11, ${0.8 * intensity})`); // Amber core
            grad.addColorStop(0.38, `rgba(59, 130, 246, ${0.6 * intensity})`); // Vibrant blue
            grad.addColorStop(0.72, `rgba(30, 58, 138, ${0.4 * intensity})`); // Parliament-Blue
            grad.addColorStop(1, 'rgba(30, 58, 138, 0)');
          } else {
            // Low Traffic Baseline (Parliament-Blue dominant)
            grad.addColorStop(0, `rgba(59, 130, 246, ${0.75 * intensity})`); // Cyan/Blue Core
            grad.addColorStop(0.5, `rgba(30, 58, 138, ${0.55 * intensity})`); // Parliament-Blue
            grad.addColorStop(1, 'rgba(30, 58, 138, 0)');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], radius, 0, Math.PI * 2);
          ctx.fill();

          // Concentric tactical contour / shockwave ring
          if (!isLowBattery) {
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], radius * 0.55, 0, Math.PI * 2);
            ctx.strokeStyle = intensity >= 0.78
              ? `rgba(239, 68, 68, ${0.35 * (1 - waveProgress)})`
              : `rgba(30, 58, 138, ${0.45 * (1 - waveProgress)})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Core hotspot dot
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], 2.5, 0, Math.PI * 2);
            ctx.fillStyle = intensity >= 0.78 ? '#fee2e2' : '#bfdbfe';
            ctx.fill();
          }
        });

        ctx.restore();
      }

      // 4. Render Threats & Glow Arcs
      filteredThreats.forEach((threat) => {
        const originVisible = isPointVisible(threat.originCoords, projection);
        const targetVisible = isPointVisible(threat.targetCoords, projection);

        const o = projection(threat.originCoords);
        const t = projection(threat.targetCoords);

        // Draw Glow Arcs if coordinates visible
        if (o && t) {
          const midX = (o[0] + t[0]) / 2;
          const midY = (o[1] + t[1]) / 2 - 45;

          // Outer Glow Layer 1 (Disable or reduce in low battery)
          if (!isLowBattery) {
            ctx.beginPath();
            ctx.moveTo(o[0], o[1]);
            ctx.quadraticCurveTo(midX, midY, t[0], t[1]);
            ctx.strokeStyle = threat.severity === 'Critical' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)';
            ctx.lineWidth = 6;
            ctx.stroke();
          }

          // Core Arc Layer 2
          ctx.beginPath();
          ctx.moveTo(o[0], o[1]);
          ctx.quadraticCurveTo(midX, midY, t[0], t[1]);
          ctx.strokeStyle = threat.severity === 'Critical' ? 'rgba(248, 113, 113, 0.9)' : 'rgba(251, 191, 36, 0.9)';
          ctx.lineWidth = 1.8;
          if (!isLowBattery) ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated Glowing Head Particle (Freeze in low battery)
          const prog = isLowBattery ? 0.5 : waveProgress;
          const px = (1 - prog) * (1 - prog) * o[0] + 2 * (1 - prog) * prog * midX + prog * prog * t[0];
          const py = (1 - prog) * (1 - prog) * o[1] + 2 * (1 - prog) * prog * midY + prog * prog * t[1];

          // Particle Glow Halo (Disable in low battery)
          if (!isLowBattery) {
            const pGrad = ctx.createRadialGradient(px, py, 0, px, py, 8);
            pGrad.addColorStop(0, threat.severity === 'Critical' ? '#ef4444' : '#f59e0b');
            pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fill();
          }

          // Particle Core
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        // Draw Origin Point & Pulsing Shockwave
        if (o && originVisible) {
          // Pulse Wave (Disable in low battery)
          if (!isLowBattery) {
            const pulseR = 4 + waveProgress * 14;
            ctx.beginPath();
            ctx.arc(o[0], o[1], pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(239, 68, 68, ${1 - waveProgress})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Core Dot
          ctx.beginPath();
          ctx.arc(o[0], o[1], 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw Target Point
        if (t && targetVisible) {
          ctx.beginPath();
          ctx.arc(t[0], t[1], 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#3b82f6';
          ctx.fill();
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRotating, filterAttackType, filterRegion, isLowBattery, showHeatmap]);

  // Helper check if lat/long is on visible front hemisphere
  function isPointVisible(coords: [number, number], proj: d3.GeoProjection): boolean {
    const r = proj.rotate();
    const p: [number, number] = [coords[0] + r[0], coords[1] + r[1]];
    return p[0] > -90 && p[0] < 90;
  }

  // Handle Canvas Drag Rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    let lastX = e.clientX;
    let lastY = e.clientY;

    const handleMouseMove = (me: MouseEvent) => {
      const dx = me.clientX - lastX;
      const dy = me.clientY - lastY;
      rotationRef.current[0] += dx * 0.4;
      rotationRef.current[1] -= dy * 0.4;
      lastX = me.clientX;
      lastY = me.clientY;
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="bg-[#050b14] border border-blue-900/60 rounded-3xl p-5 mb-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-blue-900/40 gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400 animate-pulse" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              3D Küresel Siber Tehdit & Sinyal Kesişim Haritası
            </h3>
          </div>
          <p className="text-xs text-blue-300/80 mt-0.5">
            D3.js tabanlı canlı 3D dünya küresi; gerçek zamanlı siber saldırı dalgaları, sinyal kesişimleri ve exploit kaynakları.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRadialOpen(!isRadialOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              isRadialOpen
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)]'
                : 'bg-black text-blue-300 border-blue-800/80 hover:border-blue-500'
            }`}
            title="Otonom Ajan Hızlı Savunma Makroları (Radial Menu)"
          >
            <Zap className={`w-3.5 h-3.5 ${isRadialOpen ? 'text-yellow-300 animate-bounce' : 'text-blue-400'}`} />
            <span>Hızlı Makro Radial HUD</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              showHeatmap
                ? 'bg-blue-950/80 text-blue-200 border-blue-500 shadow-[0_0_12px_rgba(30,58,138,0.5)]'
                : 'bg-black text-slate-400 border-gray-800 hover:border-gray-700'
            }`}
            title="Taktiksel Ağ Trafiği Isı Haritası (Heatmap) Katmanını Aç/Kapat"
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} />
            <span>{showHeatmap ? 'Isı Haritası: Aktif' : 'Isı Haritası: Kapalı'}</span>
          </button>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              isRotating
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                : 'bg-black text-slate-400 border-gray-800'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? 'Dönüşü Durdur' : 'Otomatik Dönüş'}</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 rounded-2xl bg-black border border-blue-900/40 text-xs">
        <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] uppercase mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtrele:</span>
        </div>

        {/* Attack Type Filter */}
        <select
          value={filterAttackType}
          onChange={(e) => setFilterAttackType(e.target.value)}
          className="bg-[#081226] border border-blue-800/80 rounded-xl px-2.5 py-1 text-white font-mono focus:outline-none"
        >
          <option value="ALL">Tüm Saldırı Türleri</option>
          <option value="SS7 Intercept">SS7 Intercept</option>
          <option value="Zero-Day">Zero-Day</option>
          <option value="Ransomware">Ransomware</option>
          <option value="DDOS">DDOS</option>
          <option value="RAT Infection">RAT Infection</option>
        </select>

        {/* Region Filter */}
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="bg-[#081226] border border-blue-800/80 rounded-xl px-2.5 py-1 text-white font-mono focus:outline-none"
        >
          <option value="GLOBAL">Tüm Küre (Global)</option>
          <option value="Istanbul">Türkiye / Istanbul</option>
          <option value="Frankfurt">Almanya / Frankfurt</option>
          <option value="Washington">ABD / Washington</option>
          <option value="Beijing">Çin / Pekin</option>
        </select>

        <span className="ml-auto text-[11px] font-mono text-emerald-400">
          {filteredThreats.length} Canlı Sinyal / Tehdit İzleniyor
        </span>
      </div>

      {/* Globe & Threat Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Interactive Canvas 3D Globe Container */}
        <div className="lg:col-span-2 relative flex items-center justify-center bg-black/80 rounded-2xl border border-blue-900/40 p-4 min-h-[340px]">
          {/* Tactical Heatmap Scale Legend */}
          {showHeatmap && (
            <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md border border-blue-900/60 rounded-xl px-3 py-2 flex flex-col gap-1 text-[10px] font-mono z-10 pointer-events-auto shadow-lg max-w-[230px]">
              <div className="flex items-center justify-between text-gray-300">
                <span className="font-bold flex items-center gap-1.5 text-blue-300">
                  <Flame className="w-3.5 h-3.5 text-red-400" /> Taktiksel Isı Skalası
                </span>
                <span className="text-emerald-400 text-[9px] font-bold animate-pulse">CANLI</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-gradient-to-r from-[#1e3a8a] via-[#f59e0b] to-[#ef4444] border border-blue-800/50" />
              <div className="flex justify-between text-[8px] text-gray-400">
                <span className="text-blue-400">Parlament (Düşük)</span>
                <span className="text-amber-300">Orta</span>
                <span className="text-red-400 font-bold">Tehlike (Kritik)</span>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={480}
            height={340}
            onMouseDown={handleMouseDown}
            className="cursor-grab active:cursor-grabbing max-w-full"
          />

          {/* Floating 'Quick Action' Radial Menu */}
          <RadialMacroMenu
            isOpen={isRadialOpen}
            onToggle={() => setIsRadialOpen(!isRadialOpen)}
          />

          <div className="absolute top-3 left-3 text-[10px] font-mono text-gray-500 pointer-events-none hidden sm:block">
            🖱️ Fare ile sürükleyerek küreyi 360° döndürebilirsiniz.
          </div>

          {showHeatmap && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[9px] font-mono bg-black/80 border border-blue-900/40 px-2 py-1 rounded-lg text-blue-300 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span>10 Taktiksel Trafik Kümesi Aktif (34.8 Tbps Tepe)</span>
            </div>
          )}
        </div>

        {/* Interactive Threat & Cluster List Panel */}
        <div className="space-y-3">
          {/* Panel Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-black/70 border border-blue-900/40 rounded-xl text-xs font-mono">
            <button
              onClick={() => setActiveListTab('threats')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                activeListTab === 'threats'
                  ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-red-400" />
              <span>Tehditler ({filteredThreats.length})</span>
            </button>
            <button
              onClick={() => setActiveListTab('clusters')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                activeListTab === 'clusters'
                  ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Isı Kümeleri ({TACTICAL_TRAFFIC_CLUSTERS.length})</span>
            </button>
          </div>

          {/* Tab 1: Threats */}
          {activeListTab === 'threats' && (
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {filteredThreats.map((threat) => (
                <div
                  key={threat.id}
                  onClick={() => setSelectedThreat(threat)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    selectedThreat?.id === threat.id
                      ? 'bg-blue-900/40 border-blue-400 shadow-md'
                      : 'bg-black/60 border-blue-900/40 hover:border-blue-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span>{threat.attackType}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {threat.originName} ➔ {threat.targetName}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-900">
                    {threat.severity}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Tactical Traffic Clusters */}
          {activeListTab === 'clusters' && (
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {TACTICAL_TRAFFIC_CLUSTERS.map((cluster) => {
                const isCrit = cluster.baseIntensity >= 0.78;
                const isElev = cluster.baseIntensity >= 0.52;
                return (
                  <div
                    key={cluster.id}
                    onClick={() => {
                      setSelectedCluster(cluster);
                      // Smoothly rotate globe towards cluster coordinates
                      rotationRef.current[0] = -cluster.coords[0];
                      rotationRef.current[1] = -cluster.coords[1];
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      selectedCluster?.id === cluster.id
                        ? 'bg-blue-900/40 border-blue-400 shadow-md'
                        : 'bg-black/60 border-blue-900/40 hover:border-blue-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCrit
                              ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                              : isElev
                              ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                              : 'bg-blue-500 shadow-[0_0_6px_#3b82f6]'
                          } animate-pulse`}
                        />
                        <span>{cluster.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
                        <span>Debi: <strong className="text-gray-200">{cluster.throughput}</strong></span>
                        <span>•</span>
                        <span>{cluster.packetRate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border block ${
                          isCrit
                            ? 'bg-red-950/80 text-red-300 border-red-800'
                            : isElev
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-blue-950/80 text-blue-300 border-blue-800'
                        }`}
                      >
                        {isCrit ? 'Kritik Yoğun' : isElev ? 'Orta Trafik' : 'Parlament Düşük'}
                      </span>
                      <span className="text-[9px] font-mono text-gray-500 mt-0.5 block">
                        Isı: %{Math.round(cluster.baseIntensity * 100)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Threat Popup Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#050b14] border border-blue-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-blue-900/40">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
                <div>
                  <h4 className="font-extrabold text-base text-white">{selectedThreat.attackType} Detay Raporu</h4>
                  <span className="text-xs font-mono text-gray-400">{selectedThreat.timestamp}</span>
                </div>
              </div>
              <button onClick={() => setSelectedThreat(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black border border-blue-900/40 space-y-2">
                <div>
                  <span className="text-gray-400 block text-[10px]">Saldırı Kaynağı (Origin):</span>
                  <span className="font-mono text-white text-sm font-bold">{selectedThreat.originName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Hedef Konum (Target):</span>
                  <span className="font-mono text-blue-300 text-sm font-bold">{selectedThreat.targetName}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-blue-900/40 space-y-2">
                <div>
                  <span className="text-gray-400 block text-[10px]">Kullanılan Saldırı Yöntemi:</span>
                  <span className="text-amber-300 font-medium">{selectedThreat.method}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Etkilenen Sistem Bileşeni:</span>
                  <span className="text-emerald-300 font-medium">{selectedThreat.affectedComponent}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  const q = `${selectedThreat.attackType} saldırısı (${selectedThreat.method}) için siber savunma ve izolasyon adımları nelerdir?`;
                  setSelectedThreat(null);
                  onAskAssistant(q);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition text-center shadow-lg"
              >
                Savunma Adımlarını Asistana Sor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Tactical Heatmap Cluster Modal */}
      {selectedCluster && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#050b14] border border-blue-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-blue-900/40">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-400 animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-base text-white">{selectedCluster.name}</h4>
                  <span className="text-xs font-mono text-blue-400">Taktiksel Ağ Trafiği Isı Kümesi</span>
                </div>
              </div>
              <button onClick={() => setSelectedCluster(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Thermal Gradient Bar for this cluster */}
              <div className="p-3 rounded-xl bg-black border border-blue-900/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[10px]">Taktiksel Isı Düzeyi:</span>
                  <span className="font-mono text-amber-300 font-bold">%{Math.round(selectedCluster.baseIntensity * 100)} Yoğunluk</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-gradient-to-r from-[#1e3a8a] via-[#f59e0b] to-[#ef4444] border border-blue-800/50" />
                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>Parlament Mavisi (0%)</span>
                  <span>Tehlike Kırmızısı (100%)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-black border border-blue-900/40">
                  <span className="text-gray-400 block text-[10px]">Anlık Trafik Debisi:</span>
                  <span className="font-mono text-white text-base font-bold">{selectedCluster.throughput}</span>
                </div>
                <div className="p-3 rounded-xl bg-black border border-blue-900/40">
                  <span className="text-gray-400 block text-[10px]">Paket İşleme Hızı:</span>
                  <span className="font-mono text-emerald-400 text-base font-bold">{selectedCluster.packetRate}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black border border-blue-900/40 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-[10px]">Tehdit Seviyesi:</span>
                  <span className="font-mono text-red-400 font-bold">{selectedCluster.threatLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-[10px]">Coğrafi Konum:</span>
                  <span className="font-mono text-gray-300 text-[11px]">{selectedCluster.coords[1]}° N, {selectedCluster.coords[0]}° E</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  rotationRef.current[0] = -selectedCluster.coords[0];
                  rotationRef.current[1] = -selectedCluster.coords[1];
                  setSelectedCluster(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-500/50 font-bold text-xs transition text-center"
              >
                Küreye Odakla
              </button>
              <button
                onClick={() => {
                  const q = `${selectedCluster.name} trafik kümesindeki ${selectedCluster.throughput} yoğunluk ve ${selectedCluster.threatLevel} tehdit düzeyi için ağ yük dengeleme ve güvenlik filtreleme önerileri nelerdir?`;
                  setSelectedCluster(null);
                  onAskAssistant(q);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition text-center shadow-lg"
              >
                Taktiksel Tavsiye Al
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
