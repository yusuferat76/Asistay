import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Globe,
  Filter,
  AlertTriangle,
  Shield,
  Zap,
  X,
  Radio,
  RefreshCw,
  Flame,
  Activity,
  Layers,
  Cpu,
  Bot,
  Radar,
  ArrowRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { RadialMacroMenu } from './RadialMacroMenu';
import { AgentTelemetry, agentManager, DEFENSE_MACROS } from '../utils/AgentManager';

export interface GlobeAlert {
  id: string;
  title: string;
  message: string;
  severity: 'red' | 'yellow' | 'green';
}

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

export interface AgentRiskArea {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat]
  agentId: 'sentinel-x' | 'guardian-v' | 'ghost-s';
  agentName: string;
  category: string;
  threatVector: string;
  baseRiskScore: number; // 0 to 100
  radiusDeg: number; // Geodesic circle radius in degrees on the sphere
  severity: 'red' | 'yellow' | 'green';
  targetAsset: string;
  recommendedMacro: string;
  macroCodeName: string;
  details: string;
  detectedTime: string;
  livePacketCount: string;
  pulseSpeed: number;
}

export interface TacticalTrafficCluster {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat]
  baseIntensity: number; // 0.0 to 1.0
  baseRadius: number;
  throughput: string;
  packetRate: string;
  threatLevel: 'Low' | 'Elevated' | 'High' | 'Critical';
  phase: number;
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

export const INITIAL_AGENT_RISK_AREAS: AgentRiskArea[] = [
  {
    id: 'ara-1',
    name: 'Frankfurt DE-CIX Omurgası',
    coords: [8.6821, 50.1109],
    agentId: 'sentinel-x',
    agentName: 'Sentinel-X',
    category: 'Perimeter Ağ İhlali',
    threatVector: 'SS7 & Diameter Omurga Sinyal Müdahalesi',
    baseRiskScore: 96,
    radiusDeg: 9,
    severity: 'red',
    targetAsset: 'GSM Şebekesi & SMS 2FA Geçitleri',
    recommendedMacro: 'Kill Network Process',
    macroCodeName: 'SIGKILL_ROGUE_SOCKET',
    details: 'Sentinel-X otonom paketi, DE-CIX omurgasında yetkisiz dış soket ve baz istasyonu sorgulamaları yakaladı.',
    detectedTime: '1 dk önce',
    livePacketCount: '8.4M pps (Anormal)',
    pulseSpeed: 1.8,
  },
  {
    id: 'ara-2',
    name: 'Washington D.C. Bulut Kasası',
    coords: [-77.0369, 38.9072],
    agentId: 'guardian-v',
    agentName: 'Guardian-V',
    category: 'Kernel & Sistem Bütünlüğü',
    threatVector: 'Linux Kernel 6.8 Heap Overflow & Rootkit',
    baseRiskScore: 94,
    radiusDeg: 10,
    severity: 'red',
    targetAsset: 'Federal Savunma & Şifreli Veri Kasası',
    recommendedMacro: 'Encrypt Current Buffer',
    macroCodeName: 'RAM_VAULT_AES256',
    details: 'Guardian-V derin bellek tarayıcısı, çekirdek seviyesinde yetkisiz bir tampon aşımı denemesi teyit etti.',
    detectedTime: '3 dk önce',
    livePacketCount: '34.8 Gbps Dump',
    pulseSpeed: 2.1,
  },
  {
    id: 'ara-3',
    name: 'Istanbul DoH & Omurga Geçidi',
    coords: [28.9784, 41.0082],
    agentId: 'sentinel-x',
    agentName: 'Sentinel-X',
    category: 'Ağ Maskeleme & DoH Sızıntısı',
    threatVector: 'Şüpheli IP Port Taraması & Rogue DNS',
    baseRiskScore: 89,
    radiusDeg: 8.5,
    severity: 'red',
    targetAsset: 'Ulusal Telekomünikasyon DNS Omurgası',
    recommendedMacro: 'Isolate Subnet',
    macroCodeName: 'ZERO_TRUST_SEGMENT',
    details: 'Ağ perimetresi üzerinde yetkisiz dış porta doğru yoğun SYN taraması saptandı ve bloklandı.',
    detectedTime: '4 dk önce',
    livePacketCount: '5.2M pps',
    pulseSpeed: 1.6,
  },
  {
    id: 'ara-4',
    name: 'Beijing CIX Telekom Düğümü',
    coords: [116.4074, 39.9042],
    agentId: 'ghost-s',
    agentName: 'Ghost-S',
    category: 'DDoS & Botnet Komuta',
    threatVector: '1.2 Tbps Otonom Botnet SYN Flood',
    baseRiskScore: 92,
    radiusDeg: 11,
    severity: 'red',
    targetAsset: 'Asya Omurga Yönlendiricileri & C2',
    recommendedMacro: 'Rotate VPN / Tor Hop',
    macroCodeName: 'ONION_CIRCUIT_HOP',
    details: 'Ghost-S istihbarat motoru, botnet komuta merkezine bağlanan 420.000 aktif zombi cihaz saptadı.',
    detectedTime: '6 dk önce',
    livePacketCount: '1.2 Tbps Flood',
    pulseSpeed: 2.0,
  },
  {
    id: 'ara-5',
    name: 'Moscow MSK-IX Darknet Havuzu',
    coords: [37.6173, 55.7558],
    agentId: 'ghost-s',
    agentName: 'Ghost-S',
    category: 'Darknet Veri Sızıntısı',
    threatVector: 'Double Extortion Fidye Yazılımı Veri Sızdırma',
    baseRiskScore: 85,
    radiusDeg: 9.5,
    severity: 'yellow',
    targetAsset: 'Kurumsal Finansal Veritabanları',
    recommendedMacro: 'Scrub Fingerprint',
    macroCodeName: 'SYNTHETIC_MASKING',
    details: 'Dark web forumlarında son 24 saatte sızdırılan kimlik ve token veritabanı eşleşti.',
    detectedTime: '8 dk önce',
    livePacketCount: '12.4 Gbps Exfiltration',
    pulseSpeed: 1.4,
  },
  {
    id: 'ara-6',
    name: 'London Finansal Veri Merkezi',
    coords: [-0.1276, 51.5074],
    agentId: 'guardian-v',
    agentName: 'Guardian-V',
    category: 'Bellek Enjeksiyonu',
    threatVector: 'Ransomware DLL Yan Yükleme & C2 Sinyali',
    baseRiskScore: 81,
    radiusDeg: 8,
    severity: 'yellow',
    targetAsset: 'Bankacılık Küme Sunucusu (SWIFT Düğümü)',
    recommendedMacro: 'Quarantine Payloads',
    macroCodeName: 'HEURISTIC_JAIL',
    details: 'İmzasız DLL kitaplığı belleğe yüklenmeye çalışırken Guardian-V tarafından askıya alındı.',
    detectedTime: '11 dk önce',
    livePacketCount: '1.8M pps',
    pulseSpeed: 1.3,
  },
  {
    id: 'ara-7',
    name: 'Tokyo AP-East Edge Relay',
    coords: [139.6917, 35.6895],
    agentId: 'sentinel-x',
    agentName: 'Sentinel-X',
    category: 'DNS Tünelleme',
    threatVector: 'Anormal DNS TXT Kayıt Sorgusu & Beaconing',
    baseRiskScore: 74,
    radiusDeg: 7.5,
    severity: 'yellow',
    targetAsset: 'AWS Cloud Edge Gateway',
    recommendedMacro: 'Kill Network Process',
    macroCodeName: 'SIGKILL_ROGUE_SOCKET',
    details: 'Şüpheli DNS TXT kayıtları üzerinden gizli veri tüneli saptandı.',
    detectedTime: '14 dk önce',
    livePacketCount: '920K pps',
    pulseSpeed: 1.2,
  },
  {
    id: 'ara-8',
    name: 'Sao Paulo IX.br Cloud Hub',
    coords: [-46.6333, -23.5505],
    agentId: 'guardian-v',
    agentName: 'Guardian-V',
    category: 'Yetkisiz Dosya Erişimi',
    threatVector: 'Yetkisiz /etc/shadow ve Rootkit Değişikliği',
    baseRiskScore: 68,
    radiusDeg: 7,
    severity: 'yellow',
    targetAsset: 'Güney Amerika Veri Merkezi',
    recommendedMacro: 'Quarantine Payloads',
    macroCodeName: 'HEURISTIC_JAIL',
    details: 'Guardian-V bütünlük tarayıcısı, çekirdek modülü erişim girişimini engelledi.',
    detectedTime: '18 dk önce',
    livePacketCount: '650K pps',
    pulseSpeed: 1.1,
  },
  {
    id: 'ara-9',
    name: 'Singapore SGIX Denizaltı İniş Noktası',
    coords: [103.8198, 1.3521],
    agentId: 'ghost-s',
    agentName: 'Ghost-S',
    category: 'Taktiksel Ağ Geçidi',
    threatVector: 'Şifreli Çok Katmanlı Proxy Trafiği',
    baseRiskScore: 58,
    radiusDeg: 6.5,
    severity: 'green',
    targetAsset: 'Asya Transit Değişim Noktası',
    recommendedMacro: 'Rotate VPN / Tor Hop',
    macroCodeName: 'ONION_CIRCUIT_HOP',
    details: 'Spektrum izlemesi nominal, trafiğin %99.2si kuantum güvenli kanallarda akıyor.',
    detectedTime: '22 dk önce',
    livePacketCount: '11.8 Tbps (Güvenli)',
    pulseSpeed: 0.9,
  },
  {
    id: 'ara-10',
    name: 'Zurich Tor Exit & Güvenli Omurga',
    coords: [8.5417, 47.3769],
    agentId: 'ghost-s',
    agentName: 'Ghost-S',
    category: 'Anonim Tünel',
    threatVector: '3-Hop WireGuard & Onion Çıkış Düğümü',
    baseRiskScore: 52,
    radiusDeg: 6,
    severity: 'green',
    targetAsset: 'Avrupa Anonim İstihbarat Çıkışı',
    recommendedMacro: 'Scrub Fingerprint',
    macroCodeName: 'SYNTHETIC_MASKING',
    details: 'İzole tünel devrede, sentetik gürültü maskelemesi %100 gizlilik sağlıyor.',
    detectedTime: '25 dk önce',
    livePacketCount: '3.4 Gbps (İzole)',
    pulseSpeed: 0.8,
  },
];

export const TACTICAL_TRAFFIC_CLUSTERS: TacticalTrafficCluster[] = [
  {
    id: 'cl-1',
    name: 'Frankfurt DE-CIX',
    coords: [8.6821, 50.1109],
    baseIntensity: 0.95,
    baseRadius: 36,
    throughput: '34.8 Tbps',
    packetRate: '8.4M pps',
    threatLevel: 'Critical',
    phase: 0,
  },
  {
    id: 'cl-2',
    name: 'Istanbul NIX Hub',
    coords: [28.9784, 41.0082],
    baseIntensity: 0.88,
    baseRadius: 34,
    throughput: '18.2 Tbps',
    packetRate: '4.6M pps',
    threatLevel: 'Critical',
    phase: 1.2,
  },
  {
    id: 'cl-3',
    name: 'London LINX',
    coords: [-0.1276, 51.5074],
    baseIntensity: 0.72,
    baseRadius: 28,
    throughput: '22.5 Tbps',
    packetRate: '5.1M pps',
    threatLevel: 'High',
    phase: 2.1,
  },
  {
    id: 'cl-4',
    name: 'Washington Equinix Ashburn',
    coords: [-77.0369, 38.9072],
    baseIntensity: 0.91,
    baseRadius: 35,
    throughput: '41.2 Tbps',
    packetRate: '9.8M pps',
    threatLevel: 'Critical',
    phase: 3.4,
  },
  {
    id: 'cl-5',
    name: 'Tokyo JPIX',
    coords: [139.6917, 35.6895],
    baseIntensity: 0.65,
    baseRadius: 26,
    throughput: '19.8 Tbps',
    packetRate: '3.9M pps',
    threatLevel: 'Elevated',
    phase: 4.2,
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
  alerts?: GlobeAlert[];
  agentsTelemetry?: AgentTelemetry[];
}

export const Cyber3DGlobe: React.FC<Cyber3DGlobeProps> = ({
  onAskAssistant,
  isLowBattery = false,
  alerts = [],
  agentsTelemetry = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<CyberThreatPoint | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<TacticalTrafficCluster | null>(null);
  const [selectedRiskArea, setSelectedRiskArea] = useState<AgentRiskArea | null>(null);

  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [isRadialOpen, setIsRadialOpen] = useState<boolean>(false);
  const [activeListTab, setActiveListTab] = useState<'agent-risks' | 'threats' | 'clusters'>('agent-risks');
  const [filterAgent, setFilterAgent] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterAttackType, setFilterAttackType] = useState<string>('ALL');
  const [filterRegion, setFilterRegion] = useState<string>('GLOBAL');
  const [isRotating, setIsRotating] = useState(true);
  const rotationRef = useRef<[number, number]>([0, -20]);

  // Dynamic alerts severity analysis
  const alertStats = useMemo(() => {
    const critical = alerts.filter((a) => a.severity === 'red').length;
    const warning = alerts.filter((a) => a.severity === 'yellow').length;
    const green = alerts.filter((a) => a.severity === 'green').length;

    let overallSeverity: 'red' | 'yellow' | 'green' = 'green';
    let severityScore = 0.2; // 0 to 1

    if (critical > 0) {
      overallSeverity = 'red';
      severityScore = Math.min(1.0, 0.75 + critical * 0.05);
    } else if (warning > 0) {
      overallSeverity = 'yellow';
      severityScore = Math.min(0.7, 0.45 + warning * 0.05);
    } else {
      overallSeverity = 'green';
      severityScore = 0.2;
    }

    return {
      critical,
      warning,
      green,
      overallSeverity,
      severityScore,
    };
  }, [alerts]);

  // Keep risk areas state so they can dynamically adjust with incoming alerts
  const [riskAreas, setRiskAreas] = useState<AgentRiskArea[]>(INITIAL_AGENT_RISK_AREAS);

  // Sync risk areas severity when alerts arrive from autonomous agents
  useEffect(() => {
    if (!alerts || alerts.length === 0) return;
    const latestAlert = alerts[alerts.length - 1];

    setRiskAreas((prev) =>
      prev.map((area) => {
        // If alert matches the agent, temporarily surge its risk score
        const isTargetAgent =
          (latestAlert.title.toLowerCase().includes('sentinel') && area.agentId === 'sentinel-x') ||
          (latestAlert.title.toLowerCase().includes('guardian') && area.agentId === 'guardian-v') ||
          (latestAlert.title.toLowerCase().includes('ghost') && area.agentId === 'ghost-s');

        if (isTargetAgent) {
          return {
            ...area,
            severity: latestAlert.severity,
            baseRiskScore:
              latestAlert.severity === 'red'
                ? Math.min(99, area.baseRiskScore + 5)
                : latestAlert.severity === 'yellow'
                ? Math.max(70, area.baseRiskScore)
                : area.baseRiskScore,
            detectedTime: 'Şimdi (Canlı Ajan Raporu)',
          };
        }
        return area;
      })
    );
  }, [alerts]);

  // Filtered lists
  const filteredRiskAreas = useMemo(() => {
    return riskAreas.filter((a) => {
      const matchAgent = filterAgent === 'ALL' || a.agentId === filterAgent;
      const matchSev = filterSeverity === 'ALL' || a.severity === filterSeverity;
      return matchAgent && matchSev;
    });
  }, [riskAreas, filterAgent, filterSeverity]);

  const filteredThreats = useMemo(() => {
    return SAMPLE_THREATS.filter((t) => {
      const matchType = filterAttackType === 'ALL' || t.attackType === filterAttackType;
      const matchRegion =
        filterRegion === 'GLOBAL' ||
        t.originName.toLowerCase().includes(filterRegion.toLowerCase()) ||
        t.targetName.toLowerCase().includes(filterRegion.toLowerCase());
      return matchType && matchRegion;
    });
  }, [filterAttackType, filterRegion]);

  // D3 Canvas Globe & Heat-Map Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const projection = d3
      .geoOrthographic()
      .scale(width / 2.3)
      .translate([width / 2, height / 2])
      .clipAngle(90);

    const path = d3.geoPath().projection(projection).context(ctx);
    const graticule = d3.geoGraticule10();

    let animationFrameId: number;
    let waveProgress = 0;
    let lastRenderTime = 0;
    const fpsLimit = isLowBattery ? 12 : 60;
    const frameInterval = 1000 / fpsLimit;

    // Helper: true great-circle distance check on front hemisphere
    const isVisibleOnFrontHemisphere = (coords: [number, number]): boolean => {
      const rot = projection.rotate();
      // True distance in radians to projection center
      const dist = d3.geoDistance(coords, [-rot[0], -rot[1]]);
      return dist < Math.PI / 2;
    };

    const render = (time: number) => {
      const delta = time - lastRenderTime;

      if (delta < frameInterval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      lastRenderTime = time - (delta % frameInterval);

      // Rotate globe
      if (isRotating && !isLowBattery) {
        rotationRef.current[0] += 0.3;
      }

      projection.rotate([rotationRef.current[0], rotationRef.current[1]]);

      if (!isLowBattery) {
        waveProgress = (waveProgress + 0.025) % 1;
      }

      ctx.clearRect(0, 0, width, height);

      const sevLevel = alertStats.overallSeverity;
      const sevScore = alertStats.severityScore;

      // -------------------------------------------------------------
      // 1. Dynamic D3 Color Scale Generator for the Heat-Map
      // -------------------------------------------------------------
      // Shifts colors dynamically based on alert severity:
      // Red: Blazing Crimson (#ef4444) -> Molten Orange (#f97316) -> Deep Ember (#991b1b)
      // Yellow: Bright Amber (#f59e0b) -> Gold (#fbbf24) -> Electric Blue (#3b82f6)
      // Green: Deep Parliament Blue (#1e3a8a) -> Cyber Cyan (#06b6d4) -> Emerald (#10b981)
      const d3HeatScale = d3
        .scaleLinear<string>()
        .domain([0, 0.35, 0.75, 1.0])
        .range(
          sevLevel === 'red'
            ? [
                'rgba(239, 68, 68, 0.95)', // Peak danger crimson
                'rgba(249, 115, 22, 0.85)', // Molten orange
                'rgba(185, 28, 28, 0.55)', // Deep ember
                'rgba(127, 29, 29, 0.0)',  // Fade out
              ]
            : sevLevel === 'yellow'
            ? [
                'rgba(245, 158, 11, 0.92)', // Warning amber
                'rgba(251, 191, 36, 0.78)', // Radiant gold
                'rgba(59, 130, 246, 0.48)', // Electric blue boundary
                'rgba(30, 58, 138, 0.0)',  // Fade out
              ]
            : [
                'rgba(59, 130, 246, 0.88)', // Parliament blue
                'rgba(6, 182, 212, 0.72)', // Cyber cyan
                'rgba(16, 185, 129, 0.42)', // Emerald security
                'rgba(30, 58, 138, 0.0)',  // Fade out
              ]
        )
        .interpolate(d3.interpolateRgb);

      // -------------------------------------------------------------
      // 2. Dynamic Outer Atmosphere Glow (Reflects Alert Severity)
      // -------------------------------------------------------------
      if (!isLowBattery) {
        const atmoGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          projection.scale() * 0.96,
          width / 2,
          height / 2,
          projection.scale() * 1.18
        );

        if (sevLevel === 'red') {
          atmoGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
          atmoGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.15)');
          atmoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else if (sevLevel === 'yellow') {
          atmoGrad.addColorStop(0, 'rgba(245, 158, 11, 0.30)');
          atmoGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.12)');
          atmoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          atmoGrad.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
          atmoGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.08)');
          atmoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        ctx.fillStyle = atmoGrad;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, projection.scale() * 1.18, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 3. Globe Sphere Base & Graticule
      // -------------------------------------------------------------
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, projection.scale(), 0, Math.PI * 2);
      ctx.fillStyle = '#030814';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle =
        sevLevel === 'red'
          ? 'rgba(239, 68, 68, 0.4)'
          : sevLevel === 'yellow'
          ? 'rgba(245, 158, 11, 0.4)'
          : 'rgba(59, 130, 246, 0.4)';
      ctx.stroke();

      // Graticule Lines
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle =
        sevLevel === 'red'
          ? 'rgba(153, 27, 27, 0.25)'
          : 'rgba(30, 58, 138, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // -------------------------------------------------------------
      // 4. D3 Visual Heat-Map Overlay: Agent Identified High-Risk Areas
      // -------------------------------------------------------------
      if (showHeatmap) {
        ctx.save();
        ctx.globalCompositeOperation = isLowBattery ? 'source-over' : 'lighter';

        // 4A. Plot D3 Geodesic Spherical Disks (d3.geoCircle on the 3D globe)
        filteredRiskAreas.forEach((area) => {
          const timeSec = time * 0.0025;
          const pulse = Math.sin(timeSec * area.pulseSpeed);
          // Scale geodesic radius based on risk score and oscillation
          const dynamicRadiusDeg = Math.max(3.5, area.radiusDeg + pulse * 1.8);

          // Generate true spherical great-circle geometry using D3
          const circleFeature = d3
            .geoCircle()
            .center(area.coords)
            .radius(dynamicRadiusDeg)();

          ctx.beginPath();
          path(circleFeature);

          // Color calculation: Blend area's severity and overall alert level
          const effectiveSeverity =
            area.severity === 'red' || sevLevel === 'red'
              ? 'red'
              : area.severity === 'yellow' || sevLevel === 'yellow'
              ? 'yellow'
              : 'green';

          const normalizedRisk = Math.min(1.0, (area.baseRiskScore / 100) * (0.8 + sevScore * 0.2));
          // Use D3 heat color scale
          ctx.fillStyle = d3HeatScale(1.0 - normalizedRisk * 0.7);
          ctx.globalAlpha = isLowBattery ? 0.35 : 0.65;
          ctx.fill();

          // Outer contour stroke
          ctx.lineWidth = effectiveSeverity === 'red' ? 1.4 : 1.0;
          ctx.strokeStyle =
            effectiveSeverity === 'red'
              ? 'rgba(239, 68, 68, 0.85)'
              : effectiveSeverity === 'yellow'
              ? 'rgba(245, 158, 11, 0.8)'
              : 'rgba(59, 130, 246, 0.7)';
          ctx.stroke();
        });

        // 4B. High-Risk Areas Radial Heat Gradients & Agent Callout Beacons
        filteredRiskAreas.forEach((area) => {
          if (!isVisibleOnFrontHemisphere(area.coords)) return;
          const pt = projection(area.coords);
          if (!pt) return;

          const timeSec = time * 0.0025;
          const pulse = Math.sin(timeSec * area.pulseSpeed);
          const effectiveSeverity =
            area.severity === 'red' || sevLevel === 'red'
              ? 'red'
              : area.severity === 'yellow' || sevLevel === 'yellow'
              ? 'yellow'
              : 'green';

          const radius = isLowBattery
            ? area.radiusDeg * 3.5
            : area.radiusDeg * 4.2 * (1 + pulse * 0.18);

          // High-fidelity radial gradient
          const grad = ctx.createRadialGradient(pt[0], pt[1], 0, pt[0], pt[1], radius);

          if (effectiveSeverity === 'red') {
            grad.addColorStop(0, `rgba(239, 68, 68, ${0.95 * (0.8 + pulse * 0.2)})`); // Blazing Red Core
            grad.addColorStop(0.3, 'rgba(249, 115, 22, 0.75)'); // Molten Orange
            grad.addColorStop(0.65, 'rgba(185, 28, 28, 0.45)'); // Dark Red
            grad.addColorStop(1, 'rgba(127, 29, 29, 0)');
          } else if (effectiveSeverity === 'yellow') {
            grad.addColorStop(0, `rgba(245, 158, 11, ${0.9 * (0.8 + pulse * 0.2)})`); // Amber Core
            grad.addColorStop(0.35, 'rgba(251, 191, 36, 0.68)'); // Gold
            grad.addColorStop(0.7, 'rgba(59, 130, 246, 0.38)'); // Blue edge
            grad.addColorStop(1, 'rgba(30, 58, 138, 0)');
          } else {
            grad.addColorStop(0, `rgba(59, 130, 246, ${0.85 * (0.8 + pulse * 0.2)})`); // Cyan/Blue Core
            grad.addColorStop(0.4, 'rgba(6, 182, 212, 0.6)'); // Cyan
            grad.addColorStop(0.75, 'rgba(16, 185, 129, 0.35)'); // Emerald edge
            grad.addColorStop(1, 'rgba(30, 58, 138, 0)');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], radius, 0, Math.PI * 2);
          ctx.fill();

          // Concentric shockwave ring
          if (!isLowBattery) {
            const shockRadius = radius * 0.5 + waveProgress * (radius * 0.5);
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], shockRadius, 0, Math.PI * 2);
            ctx.strokeStyle =
              effectiveSeverity === 'red'
                ? `rgba(239, 68, 68, ${0.5 * (1 - waveProgress)})`
                : effectiveSeverity === 'yellow'
                ? `rgba(245, 158, 11, ${0.45 * (1 - waveProgress)})`
                : `rgba(59, 130, 246, ${0.4 * (1 - waveProgress)})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Core beacon dot
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], 3.2, 0, Math.PI * 2);
            ctx.fillStyle =
              effectiveSeverity === 'red'
                ? '#fee2e2'
                : effectiveSeverity === 'yellow'
                ? '#fef3c7'
                : '#e0f2fe';
            ctx.fill();
          }
        });

        // 4C. Tactical Traffic Clusters (Also shifting dynamically with D3 scale)
        TACTICAL_TRAFFIC_CLUSTERS.forEach((cluster) => {
          if (!isVisibleOnFrontHemisphere(cluster.coords)) return;
          const pt = projection(cluster.coords);
          if (!pt) return;

          const timeSec = time * 0.0025;
          const pulse = Math.sin(timeSec + cluster.phase);
          const intensity = Math.min(1, Math.max(0.2, cluster.baseIntensity + pulse * 0.08));
          const radius = isLowBattery
            ? cluster.baseRadius * 0.7
            : cluster.baseRadius * (1 + pulse * 0.12);

          const grad = ctx.createRadialGradient(pt[0], pt[1], 0, pt[0], pt[1], radius);
          const clusterColor = d3HeatScale(1.0 - intensity);

          grad.addColorStop(0, clusterColor);
          grad.addColorStop(0.5, d3HeatScale(Math.min(1.0, 1.2 - intensity)));
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], radius, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      // -------------------------------------------------------------
      // 5. Render Cyber Threats & Glow Arcs
      // -------------------------------------------------------------
      filteredThreats.forEach((threat) => {
        const originVisible = isVisibleOnFrontHemisphere(threat.originCoords);
        const targetVisible = isVisibleOnFrontHemisphere(threat.targetCoords);

        const o = projection(threat.originCoords);
        const t = projection(threat.targetCoords);

        if (o && t) {
          const midX = (o[0] + t[0]) / 2;
          const midY = (o[1] + t[1]) / 2 - 45;

          // Outer Glow
          if (!isLowBattery) {
            ctx.beginPath();
            ctx.moveTo(o[0], o[1]);
            ctx.quadraticCurveTo(midX, midY, t[0], t[1]);
            ctx.strokeStyle =
              threat.severity === 'Critical'
                ? 'rgba(239, 68, 68, 0.28)'
                : 'rgba(245, 158, 11, 0.25)';
            ctx.lineWidth = 6;
            ctx.stroke();
          }

          // Core Arc
          ctx.beginPath();
          ctx.moveTo(o[0], o[1]);
          ctx.quadraticCurveTo(midX, midY, t[0], t[1]);
          ctx.strokeStyle =
            threat.severity === 'Critical'
              ? 'rgba(248, 113, 113, 0.95)'
              : 'rgba(251, 191, 36, 0.9)';
          ctx.lineWidth = 1.8;
          if (!isLowBattery) ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Glowing Particle
          const prog = isLowBattery ? 0.5 : waveProgress;
          const px = (1 - prog) * (1 - prog) * o[0] + 2 * (1 - prog) * prog * midX + prog * prog * t[0];
          const py = (1 - prog) * (1 - prog) * o[1] + 2 * (1 - prog) * prog * midY + prog * prog * t[1];

          if (!isLowBattery) {
            const pGrad = ctx.createRadialGradient(px, py, 0, px, py, 8);
            pGrad.addColorStop(0, threat.severity === 'Critical' ? '#ef4444' : '#f59e0b');
            pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        // Origin shockwave & core dot
        if (o && originVisible) {
          if (!isLowBattery) {
            const pulseR = 4 + waveProgress * 14;
            ctx.beginPath();
            ctx.arc(o[0], o[1], pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(239, 68, 68, ${1 - waveProgress})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(o[0], o[1], 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Target dot
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
  }, [
    isRotating,
    filterAttackType,
    filterRegion,
    isLowBattery,
    showHeatmap,
    filteredRiskAreas,
    alertStats,
  ]);

  // Handle Drag to Rotate & Tap to Select Risk Area
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    let lastX = e.clientX;
    let lastY = e.clientY;
    let moved = false;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const handleMouseMove = (me: MouseEvent) => {
      const dx = me.clientX - lastX;
      const dy = me.clientY - lastY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        moved = true;
      }
      rotationRef.current[0] += dx * 0.4;
      rotationRef.current[1] -= dy * 0.4;
      lastX = me.clientX;
      lastY = me.clientY;
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // If user merely tapped/clicked without substantial dragging, test hit on high-risk area
      if (!moved) {
        const width = canvas.width;
        const height = canvas.height;
        const projection = d3
          .geoOrthographic()
          .scale(width / 2.3)
          .translate([width / 2, height / 2])
          .rotate([rotationRef.current[0], rotationRef.current[1]])
          .clipAngle(90);

        for (const area of filteredRiskAreas) {
          const rot = projection.rotate();
          const distRad = d3.geoDistance(area.coords, [-rot[0], -rot[1]]);
          if (distRad < Math.PI / 2) {
            const pt = projection(area.coords);
            if (pt) {
              const distPx = Math.hypot(pt[0] - clickX, pt[1] - clickY);
              if (distPx < 22) {
                setSelectedRiskArea(area);
                return;
              }
            }
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Focus smoothly on coordinates
  const focusOnCoordinates = (coords: [number, number]) => {
    rotationRef.current[0] = -coords[0];
    rotationRef.current[1] = -coords[1];
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
            D3.js tabanlı canlı jeodezik ısı haritası; otonom ajanların belirlediği yüksek riskli bölgeleri ve alarm ciddiyetini dinamik renklerle görselleştirir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Real-time Dynamic Heatmap Severity Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border shadow-md transition ${
              alertStats.overallSeverity === 'red'
                ? 'bg-red-950/80 border-red-700 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                : alertStats.overallSeverity === 'yellow'
                ? 'bg-amber-950/80 border-amber-700 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-blue-950/80 border-blue-700 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.25)]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                alertStats.overallSeverity === 'red'
                  ? 'bg-red-500 animate-ping'
                  : alertStats.overallSeverity === 'yellow'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span>
              {alertStats.overallSeverity === 'red'
                ? `KRİTİK ISI MODU (${alertStats.critical} Alarm)`
                : alertStats.overallSeverity === 'yellow'
                ? `UYARI ISI MODU (${alertStats.warning} Şüpheli)`
                : 'NOMİNAL SAVUNMA MODU'}
            </span>
          </div>

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
                ? alertStats.overallSeverity === 'red'
                  ? 'bg-red-950/90 text-red-200 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : alertStats.overallSeverity === 'yellow'
                  ? 'bg-amber-950/90 text-amber-200 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-blue-950/80 text-blue-200 border-blue-500 shadow-[0_0_12px_rgba(30,58,138,0.5)]'
                : 'bg-black text-slate-400 border-gray-800 hover:border-gray-700'
            }`}
            title="D3 Taktiksel Isı Haritası (Heat-Map) Katmanını Aç/Kapat"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                showHeatmap
                  ? alertStats.overallSeverity === 'red'
                    ? 'text-red-400 animate-bounce'
                    : 'text-amber-400 animate-pulse'
                  : 'text-gray-500'
              }`}
            />
            <span>{showHeatmap ? 'D3 Isı Haritası: Aktif' : 'D3 Isı Haritası: Kapalı'}</span>
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
        <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] uppercase mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtrele:</span>
        </div>

        {/* Tab-aware filters */}
        {activeListTab === 'agent-risks' ? (
          <>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-[#081226] border border-blue-800/80 rounded-xl px-2.5 py-1 text-white font-mono focus:outline-none"
            >
              <option value="ALL">Tüm Otonom Ajanlar</option>
              <option value="sentinel-x">Sentinel-X (Ağ Perimetresi)</option>
              <option value="guardian-v">Guardian-V (Sistem Bütünlüğü)</option>
              <option value="ghost-s">Ghost-S (Darknet & OSINT)</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#081226] border border-blue-800/80 rounded-xl px-2.5 py-1 text-white font-mono focus:outline-none"
            >
              <option value="ALL">Tüm Risk Seviyeleri</option>
              <option value="red">Kritik Risk (Kırmızı)</option>
              <option value="yellow">Yüksek / Uyarı (Sarı)</option>
              <option value="green">Nominal / Güvenli (Mavi-Yeşil)</option>
            </select>
          </>
        ) : (
          <>
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
          </>
        )}

        <div className="ml-auto flex items-center gap-3 text-[11px] font-mono">
          <span className="text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {alertStats.critical} Kritik
          </span>
          <span className="text-amber-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {alertStats.warning} Uyarı
          </span>
          <span className="text-emerald-400">
            {filteredRiskAreas.length} Ajan Bölgesi
          </span>
        </div>
      </div>

      {/* Globe & Threat Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Interactive Canvas 3D Globe Container */}
        <div className="lg:col-span-2 relative flex items-center justify-center bg-black/80 rounded-2xl border border-blue-900/40 p-4 min-h-[360px]">
          {/* Dynamic D3 Heatmap Legend */}
          {showHeatmap && (
            <div className="absolute top-3 right-3 bg-black/90 backdrop-blur-md border border-blue-900/70 rounded-xl px-3 py-2 flex flex-col gap-1.5 text-[10px] font-mono z-10 pointer-events-auto shadow-2xl max-w-[245px]">
              <div className="flex items-center justify-between text-gray-300">
                <span className="font-bold flex items-center gap-1.5 text-blue-300">
                  <Flame
                    className={`w-3.5 h-3.5 ${
                      alertStats.overallSeverity === 'red'
                        ? 'text-red-400 animate-pulse'
                        : alertStats.overallSeverity === 'yellow'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                    }`}
                  />
                  <span>D3 Dinamik Isı Skalası</span>
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                    alertStats.overallSeverity === 'red'
                      ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                      : alertStats.overallSeverity === 'yellow'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-blue-950 text-blue-300 border-blue-700'
                  }`}
                >
                  {alertStats.overallSeverity.toUpperCase()}
                </span>
              </div>

              {/* Dynamic gradient bar reflecting current D3 color mapping */}
              <div
                className={`w-full h-2.5 rounded-full overflow-hidden border ${
                  alertStats.overallSeverity === 'red'
                    ? 'border-red-600/70 bg-gradient-to-r from-[#991b1b] via-[#ea580c] to-[#ef4444]'
                    : alertStats.overallSeverity === 'yellow'
                    ? 'border-amber-600/70 bg-gradient-to-r from-[#1e3a8a] via-[#f59e0b] to-[#fbbf24]'
                    : 'border-blue-600/70 bg-gradient-to-r from-[#1e3a8a] via-[#06b6d4] to-[#10b981]'
                }`}
              />

              <div className="flex justify-between text-[8px] text-gray-400">
                <span>Düşük Risk</span>
                <span>Orta Yoğunluk</span>
                <span className="font-bold text-red-400">Tehlike (Kritik)</span>
              </div>

              <div className="pt-0.5 border-t border-gray-800 text-[8px] text-gray-400 flex justify-between">
                <span>D3 Jeodezik Diskler: Aktif</span>
                <span className="text-cyan-300">{filteredRiskAreas.length} Merkez</span>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={480}
            height={360}
            onMouseDown={handleMouseDown}
            className="cursor-grab active:cursor-grabbing max-w-full"
          />

          {/* Floating 'Quick Action' Radial Menu */}
          <RadialMacroMenu
            isOpen={isRadialOpen}
            onToggle={() => setIsRadialOpen(!isRadialOpen)}
          />

          <div className="absolute top-3 left-3 text-[10px] font-mono text-gray-400 pointer-events-none hidden sm:block bg-black/60 px-2 py-1 rounded-lg border border-gray-800">
            🖱️ Çevirmek için sürükleyin • Detay için kırmızı/sarı disklere tıklayın
          </div>

          {showHeatmap && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[9px] font-mono bg-black/85 border border-blue-900/60 px-2.5 py-1 rounded-lg text-blue-300 z-10">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  alertStats.overallSeverity === 'red'
                    ? 'bg-red-500 animate-ping'
                    : alertStats.overallSeverity === 'yellow'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-emerald-400'
                }`}
              />
              <span>
                {filteredRiskAreas.length} Otonom Ajan Bölgesi • D3 Jeodezik Projeksiyon
              </span>
            </div>
          )}
        </div>

        {/* Interactive Side Tabs Panel */}
        <div className="space-y-3">
          {/* Panel Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-black/70 border border-blue-900/40 rounded-xl text-xs font-mono">
            <button
              onClick={() => setActiveListTab('agent-risks')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 text-[11px] ${
                activeListTab === 'agent-risks'
                  ? 'bg-blue-600/40 text-blue-200 border border-blue-500/60 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Ajan Risk ({filteredRiskAreas.length})</span>
            </button>
            <button
              onClick={() => setActiveListTab('threats')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 text-[11px] ${
                activeListTab === 'threats'
                  ? 'bg-blue-600/40 text-blue-200 border border-blue-500/60 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Tehditler ({filteredThreats.length})</span>
            </button>
            <button
              onClick={() => setActiveListTab('clusters')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 text-[11px] ${
                activeListTab === 'clusters'
                  ? 'bg-blue-600/40 text-blue-200 border border-blue-500/60 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kümeler ({TACTICAL_TRAFFIC_CLUSTERS.length})</span>
            </button>
          </div>

          {/* Tab 1: Agent Risk Areas (Heat-Map Centric) */}
          {activeListTab === 'agent-risks' && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredRiskAreas.map((area) => {
                const isCrit = area.severity === 'red';
                const isWarn = area.severity === 'yellow';

                return (
                  <div
                    key={area.id}
                    onClick={() => {
                      setSelectedRiskArea(area);
                      focusOnCoordinates(area.coords);
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      selectedRiskArea?.id === area.id
                        ? 'bg-blue-900/50 border-blue-400 shadow-md ring-1 ring-blue-400'
                        : 'bg-black/60 border-blue-900/40 hover:border-blue-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCrit
                              ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse'
                              : isWarn
                              ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                              : 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                          }`}
                        />
                        <span className="truncate max-w-[170px]">{area.name}</span>
                      </div>

                      <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5">
                        <span className="text-blue-300 font-semibold">[{area.agentName}]</span>
                        <span>•</span>
                        <span className="text-gray-300 truncate max-w-[130px]">{area.category}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border block font-bold ${
                          isCrit
                            ? 'bg-red-950/90 text-red-300 border-red-700 shadow-sm'
                            : isWarn
                            ? 'bg-amber-950/90 text-amber-300 border-amber-700'
                            : 'bg-blue-950/90 text-blue-300 border-blue-700'
                        }`}
                      >
                        %{area.baseRiskScore} RİSK
                      </span>
                      <span className="text-[9px] font-mono text-gray-500 mt-0.5 block">
                        D3 Dairesi: {area.radiusDeg}°
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Threats */}
          {activeListTab === 'threats' && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredThreats.map((threat) => (
                <div
                  key={threat.id}
                  onClick={() => {
                    setSelectedThreat(threat);
                    focusOnCoordinates(threat.originCoords);
                  }}
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

          {/* Tab 3: Tactical Traffic Clusters */}
          {activeListTab === 'clusters' && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {TACTICAL_TRAFFIC_CLUSTERS.map((cluster) => {
                const isCrit = cluster.baseIntensity >= 0.78;
                const isElev = cluster.baseIntensity >= 0.52;
                return (
                  <div
                    key={cluster.id}
                    onClick={() => {
                      setSelectedCluster(cluster);
                      focusOnCoordinates(cluster.coords);
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

      {/* Modal: Agent Identified High-Risk Area Inspection */}
      {selectedRiskArea && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#050b14] border border-blue-500/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-blue-900/50">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    selectedRiskArea.severity === 'red'
                      ? 'bg-red-950 border-red-700 text-red-400'
                      : selectedRiskArea.severity === 'yellow'
                      ? 'bg-amber-950 border-amber-700 text-amber-400'
                      : 'bg-blue-950 border-blue-700 text-blue-400'
                  }`}
                >
                  <Radar className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    {selectedRiskArea.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-0.5">
                    <span className="text-cyan-400 font-bold">[{selectedRiskArea.agentName}]</span>
                    <span>•</span>
                    <span>{selectedRiskArea.category}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRiskArea(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Risk Level & D3 Geodesic Radius */}
              <div className="p-3 rounded-2xl bg-black border border-blue-900/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px]">D3 Isı Haritası Risk Skoru:</span>
                  <span
                    className={`font-mono text-sm font-extrabold px-2 py-0.5 rounded border ${
                      selectedRiskArea.severity === 'red'
                        ? 'bg-red-950 text-red-300 border-red-700'
                        : selectedRiskArea.severity === 'yellow'
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-blue-950 text-blue-300 border-blue-700'
                    }`}
                  >
                    %{selectedRiskArea.baseRiskScore} / 100 RİSK DÜZEYİ
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-gradient-to-r from-[#1e3a8a] via-[#f59e0b] to-[#ef4444] border border-blue-800/50" />
                <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                  <span>D3 Jeodezik Yarıçap: {selectedRiskArea.radiusDeg}°</span>
                  <span>Trafik: {selectedRiskArea.livePacketCount}</span>
                </div>
              </div>

              {/* Threat Details */}
              <div className="p-3 rounded-2xl bg-black border border-blue-900/40 space-y-2">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Tehdit Vektörü:</span>
                  <span className="text-amber-300 font-semibold">{selectedRiskArea.threatVector}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Hedef Kritik Varlık:</span>
                  <span className="text-emerald-300 font-mono font-medium">{selectedRiskArea.targetAsset}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Ajan Analiz Notu:</span>
                  <p className="text-gray-300 text-[11px] leading-relaxed">{selectedRiskArea.details}</p>
                </div>
              </div>

              {/* Recommended Macro Action */}
              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-800/60 flex items-center justify-between">
                <div>
                  <span className="text-blue-400 block text-[10px] font-bold uppercase">Önerilen Savunma Makrosu:</span>
                  <span className="text-white font-mono font-bold text-xs">{selectedRiskArea.recommendedMacro}</span>
                  <span className="text-[10px] font-mono text-cyan-300 block">{selectedRiskArea.macroCodeName}</span>
                </div>
                <button
                  onClick={() => {
                    // Trigger macro via agentManager or alert system
                    const targetMacro = DEFENSE_MACROS.find((m) => m.codeName === selectedRiskArea.macroCodeName);
                    if (targetMacro) {
                      // Trigger audio/speech or log
                      onAskAssistant(`Savunma Makrosunu Uygula: ${targetMacro.name} (${targetMacro.codeName})`);
                    }
                    setSelectedRiskArea(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition"
                >
                  Makroyu Ateşle
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-2.5">
              <button
                onClick={() => {
                  focusOnCoordinates(selectedRiskArea.coords);
                  setSelectedRiskArea(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-700/60 font-bold text-xs transition text-center"
              >
                Küreye Odakla
              </button>
              <button
                onClick={() => {
                  const q = `${selectedRiskArea.name} üzerindeki ${selectedRiskArea.threatVector} tehdidi için ${selectedRiskArea.agentName} tarafından önerilen "${selectedRiskArea.recommendedMacro}" protokolünün ayrıntıları ve izolasyon planı nedir?`;
                  setSelectedRiskArea(null);
                  onAskAssistant(q);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition text-center shadow-lg"
              >
                Asistana Analiz Sor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Threat Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
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
              <div className="p-3 rounded-xl bg-black border border-blue-900/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[10px]">Taktiksel Isı Düzeyi:</span>
                  <span className="font-mono text-amber-300 font-bold">%{Math.round(selectedCluster.baseIntensity * 100)} Yoğunluk</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-gradient-to-r from-[#1e3a8a] via-[#f59e0b] to-[#ef4444] border border-blue-800/50" />
                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>Düşük Risk (0%)</span>
                  <span>Kritik Tehdit (100%)</span>
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
                  focusOnCoordinates(selectedCluster.coords);
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
