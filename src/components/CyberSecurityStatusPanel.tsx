import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  Flame,
  Radio,
  Smartphone,
  MessageSquare,
  Globe,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Lock,
  Terminal,
  Wifi,
  Server,
  Key,
  Eye,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { playTacticalSound } from '../utils/audioEffects';
import { LiveVisualSecurityModal } from './LiveVisualSecurityModal';

interface CyberSecurityStatusPanelProps {
  onAskAssistant: (question: string) => void;
}

export const CyberSecurityStatusPanel: React.FC<CyberSecurityStatusPanelProps> = ({ onAskAssistant }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScanTime, setLastScanTime] = useState('Az önce');
  const [threatScore, setThreatScore] = useState(78); // Out of 100
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);

  // Attack Velocity Widget Data (Real-time simulated spikes)
  const [attackVelocityData, setAttackVelocityData] = useState([
    { time: '18:00:00', velocity: 42, reqSec: 140, packetLoss: 0.1 },
    { time: '18:00:10', velocity: 65, reqSec: 290, packetLoss: 0.2 },
    { time: '18:00:20', velocity: 120, reqSec: 580, packetLoss: 0.8 },
    { time: '18:00:30', velocity: 95, reqSec: 420, packetLoss: 0.4 },
    { time: '18:00:40', velocity: 180, reqSec: 890, packetLoss: 1.2 },
    { time: '18:00:50', velocity: 110, reqSec: 510, packetLoss: 0.5 },
  ]);

  // Port Penetration Rate (Port Sızma Oranı) Data
  const portPenetrationData = [
    { port: 'Port 80 (HTTP)', rate: 12, label: 'Düşük Risk' },
    { port: 'Port 443 (HTTPS)', rate: 5, label: 'Güvenli (TLS 1.3)' },
    { port: 'Port 3389 (RDP)', rate: 78, label: 'Kritik Risk' },
    { port: 'Port 22 (SSH)', rate: 45, label: 'Orta Seviye' },
    { port: 'Port 8080 (Proxy)', rate: 28, label: 'İzleniyor' },
  ];

  // Threat Distribution (Tehdit Dağılımı) Data
  const threatDistributionData = [
    { name: 'Brute Force & Dictionary', value: 38, color: '#ef4444' },
    { name: 'SS7 / IMSI Intercept', value: 24, color: '#f59e0b' },
    { name: 'Session Hijacking / Cookies', value: 18, color: '#3b82f6' },
    { name: 'Zero-Day Exploits', value: 12, color: '#8b5cf6' },
    { name: 'DDoS SYN Flood', value: 8, color: '#10b981' },
  ];

  // Live Attack Velocity simulation interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      setAttackVelocityData((prev) => {
        const nextVel = Math.floor(Math.random() * 120) + 30;
        const nextReq = nextVel * 4 + Math.floor(Math.random() * 50);
        const updated = [...prev.slice(1), { time: now, velocity: nextVel, reqSec: nextReq, packetLoss: Number((Math.random() * 1.5).toFixed(1)) }];
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRunDeepScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    playTacticalSound('command_exec');

    const steps = [
      { p: 25, label: '[1/4] Açık Portlar ve RDP/SSH Sızma Oranı Taranıyor...' },
      { p: 50, label: '[2/4] Leak DB ve Şifre Sızıntı Arşivleri Kontrol Ediliyor...' },
      { p: 75, label: '[3/4] Zero-Day ve Akıllı Ajan Kalkanı Doğrulanıyor...' },
      { p: 100, label: '[4/4] Otonom Siber Güvenlik İndeksi Güncellendi!' },
    ];

    steps.forEach((st, idx) => {
      setTimeout(() => {
        setScanProgress(st.p);
        setScanStep(st.label);
        if (idx === steps.length - 1) {
          setTimeout(() => {
            setIsScanning(false);
            setLastScanTime('Şimdi');
            setThreatScore(Math.floor(Math.random() * 20) + 72);
          }, 600);
        }
      }, (idx + 1) * 700);
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Deep Scan Trigger Banner */}
      <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-lg font-black text-white">Siber Güvenlik Durum Özeti &amp; Deep Scan Paneli</h3>
          </div>
          <p className="text-xs text-gray-400">
            Recharts Tehdit Dağılımı, Port Sızma Oranı, Attack Velocity Widget ve Canlı Görsel Güvenlik Analiz Modülü.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsVisualModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 font-bold text-xs flex items-center gap-2 transition"
          >
            <Eye className="w-4 h-4 text-blue-400" /> Canlı Görsel Güvenlik Analizi
          </button>

          <button
            onClick={handleRunDeepScan}
            disabled={isScanning}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Deep Scan Çalışıyor (%{scanProgress})
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" /> Manuel Deep Scan Başlat ({lastScanTime})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animated Deep Scan Progress Indicator */}
      {isScanning && (
        <div className="p-4 rounded-2xl bg-black border border-blue-900/60 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-mono text-blue-400">
            <span>{scanStep}</span>
            <span>%{scanProgress}</span>
          </div>
          <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Real-Time Attack Velocity Widget */}
      <div className="p-5 rounded-3xl bg-[#0a0a0a] border border-gray-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            <h4 className="font-bold text-base text-white">Attack Velocity Widget (Saldırı Hızı &amp; Anomali Akışı)</h4>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-900">
            Canlı Tehdit Akışı
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attackVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="55%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#000000', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="velocity" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVelocity)" name="Saldırı Hızı (Velocity)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recharts Grid: Tehdit Dağılımı & Port Sızma Oranı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tehdit Dağılımı (Threat Distribution Pie) */}
        <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-gray-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Tehdit Dağılımı Analizi (%)</span>
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-900">
              Kritik Sınıf
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={threatDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={4}>
                    {threatDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2 space-y-2 text-xs pl-2">
              {threatDistributionData.map((td, tIdx) => (
                <div key={tIdx} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: td.color }} />
                    <span className="text-gray-300 truncate text-[11px]">{td.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white text-[11px]">{td.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Port Sızma Oranı (Port Penetration Rate Bar Chart) */}
        <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-gray-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              <span>Port Sızma Oranı &amp; Açık Servis Riskleri</span>
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900">
              Derin Port Analizi
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portPenetrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="port" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="rate" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Sızma Hassasiyeti (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Visual Security Modal */}
      <LiveVisualSecurityModal
        isOpen={isVisualModalOpen}
        onClose={() => setIsVisualModalOpen(false)}
        onAskAssistant={onAskAssistant}
      />
    </div>
  );
};
