import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Shield,
  AlertTriangle,
  Zap,
  Activity,
  X,
  Volume2,
  RefreshCw,
  Info,
  CheckCircle2,
  Lock,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { speakUltraRealistic } from '../utils/ultraTTS';

export interface ThreatNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'agent' | 'malicious';
  agentId?: 'sentinel-x' | 'guardian-v' | 'ghost-s';
  severity?: 'Critical' | 'High' | 'Medium';
  ip?: string;
  mitigationProtocol: string;
  mitigationDetails: string;
  status: 'mitigating' | 'defending' | 'neutralized';
  color: string;
  radius: number;
}

export interface ThreatLink extends d3.SimulationLinkDatum<ThreatNode> {
  source: string | ThreatNode;
  target: string | ThreatNode;
  trafficRate: string;
  active: boolean;
}

const INITIAL_NODES: ThreatNode[] = [
  // 3 Central Defense Agents
  {
    id: 'agent-sentinel',
    name: 'Sentinel-X (Ağ Savunması)',
    type: 'agent',
    agentId: 'sentinel-x',
    mitigationProtocol: 'Otonom Derin Paket İncelemesi (DPI) & DoH Şifreleme',
    mitigationDetails: 'Ağ seviyesinde gelen tüm soketler filtrelenir; anormal SYN akışları ve port taramaları anında düşürülür.',
    status: 'defending',
    color: '#3b82f6', // Parliament blue
    radius: 17,
  },
  {
    id: 'agent-guardian',
    name: 'Guardian-V (Uç Nokta/Çekirdek)',
    type: 'agent',
    agentId: 'guardian-v',
    mitigationProtocol: 'Kernel eBPF Sandbox & RAM Vault Şifreleme',
    mitigationDetails: 'Çekirdek seviyesindeki yetkisiz syscall çağrıları ve bellek enjeksiyonları izole kafese mühürlenir.',
    status: 'defending',
    color: '#10b981', // Emerald green
    radius: 17,
  },
  {
    id: 'agent-ghost',
    name: 'Ghost-S (OSINT & VPN)',
    type: 'agent',
    agentId: 'ghost-s',
    mitigationProtocol: 'Sentetik Parmak İzi Maskeleme & Çok Katmanlı Tor Hop',
    mitigationDetails: 'Tarayıcı, WebRTC ve TLS parmak izi sentetik gürültüyle sıfırlanır, IP dinamik Zürih tüneline taşınır.',
    status: 'defending',
    color: '#a855f7', // Purple/Indigo
    radius: 17,
  },

  // 6 Inbound Malicious Threat Nodes
  {
    id: 'mal-1',
    name: '194.26.29.112',
    type: 'malicious',
    severity: 'Critical',
    ip: '194.26.29.112:443',
    mitigationProtocol: 'BGP Anycast Blackholing & SYN Cookies Rate-Limit',
    mitigationDetails: 'Saniyede 450.000 SYN paketi damlatma havuzuna yönlendirildi, uplink doygunluğu ve botnet taşması önlendi.',
    status: 'mitigating',
    color: '#ef4444', // Danger Red
    radius: 13,
  },
  {
    id: 'mal-2',
    name: 'Trojan.AsyncRAT C2',
    type: 'malicious',
    severity: 'Critical',
    ip: '185.220.101.5:8848',
    mitigationProtocol: 'Kernel Process Tree Quarantine & RAM Unhooking',
    mitigationDetails: 'PID:5810 bellek kancası kırıldı, yetkisiz socket açma syscall çağrıları EPERM ile mühürlendi.',
    status: 'mitigating',
    color: '#ef4444',
    radius: 13,
  },
  {
    id: 'mal-3',
    name: 'DarkWeb Scraper',
    type: 'malicious',
    severity: 'High',
    ip: '45.154.255.89:80',
    mitigationProtocol: 'Synthetic Fingerprint Scrambling & Tor Relay Hop',
    mitigationDetails: 'Kullanıcı donanım ve TLS parmak izi sentetik gürültüyle bozuldu, IP Zürih rölesine aktarıldı.',
    status: 'mitigating',
    color: '#f59e0b', // Amber
    radius: 12,
  },
  {
    id: 'mal-4',
    name: 'SQLi / WAF Bypass',
    type: 'malicious',
    severity: 'High',
    ip: '103.145.12.34:443',
    mitigationProtocol: 'Deep Packet Inspection (DPI) & Token Sanitization',
    mitigationDetails: 'HTTP GET/POST yüklerindeki tahrif edilmiş tırnak ve UNION operatörleri anında filtrelendi.',
    status: 'mitigating',
    color: '#f59e0b',
    radius: 12,
  },
  {
    id: 'mal-5',
    name: 'Rogue AP (Evil-Twin)',
    type: 'malicious',
    severity: 'Medium',
    ip: 'WLAN-0 (BSSID 00:14:22:01)',
    mitigationProtocol: '802.11w Protected Management Frames (PMF)',
    mitigationDetails: 'Sahte baz istasyonu ve rogue erişim noktası deauth saldırısı 802.11w kriptografik el sıkışmasıyla engellendi.',
    status: 'mitigating',
    color: '#38bdf8', // Light blue
    radius: 11,
  },
  {
    id: 'mal-6',
    name: 'PrivEsc CVE-2024-1086',
    type: 'malicious',
    severity: 'Critical',
    ip: 'Lokal Syscall Injection',
    mitigationProtocol: 'Seccomp-BPF System Call Filtering & Memory Lockdown',
    mitigationDetails: 'Linux kernel netfilter zafiyetini istismar etmeye çalışan bellek dizini salt-okunur kafese kilitlendi.',
    status: 'mitigating',
    color: '#ef4444',
    radius: 13,
  },
];

const INITIAL_LINKS: ThreatLink[] = [
  // Malicious to Agents
  { source: 'mal-1', target: 'agent-sentinel', trafficRate: '1.2 Gbps', active: true },
  { source: 'mal-4', target: 'agent-sentinel', trafficRate: '340 Mbps', active: true },
  { source: 'mal-2', target: 'agent-guardian', trafficRate: 'Process Hook', active: true },
  { source: 'mal-6', target: 'agent-guardian', trafficRate: 'Syscall Trap', active: true },
  { source: 'mal-3', target: 'agent-ghost', trafficRate: 'OSINT Sniff', active: true },
  { source: 'mal-5', target: 'agent-ghost', trafficRate: 'RF Anomaly', active: true },

  // Inter-Agent Defense Mesh Links
  { source: 'agent-sentinel', target: 'agent-guardian', trafficRate: 'Mesh Sync', active: false },
  { source: 'agent-guardian', target: 'agent-ghost', trafficRate: 'Mesh Sync', active: false },
];

interface ThreatForceGraphProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const ThreatForceGraph: React.FC<ThreatForceGraphProps> = ({ isExpanded = false, onToggleExpand }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<ThreatNode | null>(null);
  const [simulationNodes, setSimulationNodes] = useState<ThreatNode[]>(INITIAL_NODES);
  const [filterType, setFilterType] = useState<'ALL' | 'CRITICAL' | 'AGENTS'>('ALL');

  useEffect(() => {
    if (!svgRef.current) return;

    const width = isExpanded ? 700 : 290;
    const height = isExpanded ? 460 : 220;

    // Clone data to avoid D3 mutation issues across re-renders
    const nodes: ThreatNode[] = INITIAL_NODES.map((d) => ({ ...d }));
    const links: ThreatLink[] = INITIAL_LINKS.map((d) => ({ ...d }));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Definition filters & glow effects
    const defs = svg.append('defs');

    // Parliament Blue Glow Filter
    const filter = defs.append('filter').attr('id', 'glow-filter').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Force Simulation Setup
    const simulation = d3
      .forceSimulation<ThreatNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<ThreatNode, ThreatLink>(links)
          .id((d) => d.id)
          .distance(isExpanded ? 110 : 55)
      )
      .force('charge', d3.forceManyBody().strength(isExpanded ? -260 : -130))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + (isExpanded ? 12 : 6)));

    // Container for zooming/panning
    const g = svg.append('g');

    // Draw Links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        const targetNode = nodes.find((n) => n.id === (typeof d.target === 'object' ? d.target.id : d.target));
        return targetNode?.color || '#3b82f6';
      })
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => (d.active ? 1.8 : 1))
      .attr('stroke-dasharray', (d) => (d.active ? '4,3' : '2,2'));

    // Draw Nodes Group
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, ThreatNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        handleNodeClick(d);
      });

    // Outer Glow Ring for Nodes
    node
      .append('circle')
      .attr('r', (d) => d.radius + (isExpanded ? 5 : 3))
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.5)
      .attr('filter', 'url(#glow-filter)');

    // Core Solid Circle
    node
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => (d.type === 'agent' ? '#030814' : '#1f0909'))
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2);

    // Inner Symbol or Pulse Core
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'agent' ? 4 : 3))
      .attr('fill', (d) => (d.type === 'agent' ? '#ffffff' : d.color));

    // Node Labels
    node
      .append('text')
      .text((d) => (isExpanded ? d.name : d.name.length > 11 ? `${d.name.slice(0, 9)}..` : d.name))
      .attr('font-size', isExpanded ? '10px' : '8px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('fill', (d) => (d.type === 'agent' ? '#93c5fd' : '#fca5a5'))
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + (isExpanded ? 13 : 10))
      .attr('pointer-events', 'none');

    // Simulation Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [isExpanded, filterType]);

  const handleNodeClick = (node: ThreatNode) => {
    playTacticalSound('click');
    setSelectedNode(node);

    // Speak mitigation protocol summary
    const announcement = `${node.name}: ${node.mitigationProtocol} uygulanıyor.`;
    speakUltraRealistic(announcement);
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#030814]/90 border border-blue-900/60 p-3 shadow-xl backdrop-blur-md overflow-hidden select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-blue-900/40 mb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300">
            D3 Tehdit &amp; Savunma Ağ Grafiği
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 rounded-lg bg-blue-950/60 text-blue-300 hover:text-white transition"
              title={isExpanded ? 'Küçült' : 'Tam Ekrana Genişlet'}
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          )}
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-900">
            6 Saldırı Düğümü
          </span>
        </div>
      </div>

      {/* Interactive D3 SVG Canvas */}
      <div className="relative flex items-center justify-center bg-black/60 rounded-xl border border-blue-950 overflow-hidden">
        <svg
          ref={svgRef}
          width={isExpanded ? 700 : 290}
          height={isExpanded ? 460 : 220}
          className="max-w-full"
        />

        {/* Floating Instruction overlay */}
        <div className="absolute bottom-2 left-2 text-[8px] font-mono text-gray-500 pointer-events-none">
          💡 Düğümlere dokunarak aktif koruma protokolünü inceleyin.
        </div>
      </div>

      {/* Selected Node Mitigation Protocol Card */}
      {selectedNode && (
        <div className="mt-2.5 p-3 rounded-xl bg-black/95 border border-blue-500/70 shadow-2xl animate-fadeIn space-y-2 text-xs font-mono">
          <div className="flex items-start justify-between pb-1.5 border-b border-blue-900/40">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: selectedNode.color }}
              />
              <div>
                <h4 className="font-bold text-white text-[11px] flex items-center gap-1.5">
                  <span>{selectedNode.name}</span>
                  {selectedNode.type === 'malicious' ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                      ZARARLI HEDEF
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      SAVUNMA MERKEZİ
                    </span>
                  )}
                </h4>
                {selectedNode.ip && (
                  <span className="text-[9px] text-gray-400 block">{selectedNode.ip}</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div>
              <span className="text-gray-400 block text-[9px]">Uygulanan Koruma / Savunma Protokolü:</span>
              <span className="text-amber-300 font-bold block">{selectedNode.mitigationProtocol}</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[9px]">Teknik İzolasyon Detayları:</span>
              <span className="text-blue-200 leading-relaxed block">{selectedNode.mitigationDetails}</span>
            </div>

            <div className="pt-1 flex items-center justify-between text-[9px] text-gray-400 border-t border-blue-900/30">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Protokol Aktif Devrede
              </span>
              <button
                onClick={() => speakUltraRealistic(`${selectedNode.name}. ${selectedNode.mitigationProtocol}`)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-300 transition"
              >
                <Volume2 className="w-3 h-3" /> Seslendir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
