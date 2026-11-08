import React, { useState } from 'react';
import {
  CYBER_TOOLS_CATALOG,
  VULNHOUSE_100_HOURS_DATA,
  CyberTool,
} from '../data/cyberTools';
import {
  Shield,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Flame,
  Cpu,
  Smartphone,
  Eye,
  Bot,
  Zap,
  Code,
  Radio,
  FileText,
  Lock,
  Wifi,
  Link2,
  Volume2,
  BatteryCharging,
  Bluetooth,
  Database,
  Download,
  Fingerprint,
} from 'lucide-react';
import { EncryptedVaultModal } from './EncryptedVaultModal';
import { RogueAPDetectorModal } from './RogueAPDetectorModal';
import { PhishingAnalyzerModal } from './PhishingAnalyzerModal';
import { DeviceHardeningModal } from './DeviceHardeningModal';
import { BugDetectorModal } from './BugDetectorModal';
import { AntiTamperPanicModal } from './AntiTamperPanicModal';
import { JuiceJackingShieldModal } from './JuiceJackingShieldModal';
import { BleTrackerModal } from './BleTrackerModal';
import { BreachCheckerModal } from './BreachCheckerModal';
import { PWAInstallModal } from './PWAInstallModal';
import { BehavioralFingerprintModal } from './BehavioralFingerprintModal';
import { LiveVisualSecurityModal } from './LiveVisualSecurityModal';

interface CyberToolsHubProps {
  onAskAssistant: (question: string) => void;
  onSwitchToArchitecture?: () => void;
}

export const CyberToolsHub: React.FC<CyberToolsHubProps> = ({ onAskAssistant, onSwitchToArchitecture }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'vulnhouse' | 'ollama'>('tools');

  // Interactive Live Tool Modal States
  const [showVault, setShowVault] = useState(false);
  const [showRogueAP, setShowRogueAP] = useState(false);
  const [showPhishing, setShowPhishing] = useState(false);
  const [showHardening, setShowHardening] = useState(false);
  const [showBugDetector, setShowBugDetector] = useState(false);
  const [showAntiTamper, setShowAntiTamper] = useState(false);
  const [showJuiceJacking, setShowJuiceJacking] = useState(false);
  const [showBleTracker, setShowBleTracker] = useState(false);
  const [showBreachChecker, setShowBreachChecker] = useState(false);
  const [showPwaInstaller, setShowPwaInstaller] = useState(false);
  const [showFingerprint, setShowFingerprint] = useState(false);
  const [showVisualSecurity, setShowVisualSecurity] = useState(false);

  const categories = [
    { id: 'all', label: 'Tüm Araçlar', icon: Shield },
    { id: 'pentest', label: 'Otonom Pentest', icon: Flame },
    { id: 'live_defense', label: 'Canlı Savunma', icon: Eye },
    { id: 'spyware', label: 'Casus Yazılım & Takip', icon: Radio },
    { id: 'mobile', label: 'Mobil & Telefon Ajanı', icon: Smartphone },
    { id: 'agent', label: 'Dijital Asistanlar', icon: Bot },
    { id: 'osint', label: 'Tehdit İstihbaratı', icon: Radio },
    { id: 'local_llm', label: 'Yerel LLM (Ollama)', icon: Cpu },
  ];

  const filteredTools = CYBER_TOOLS_CATALOG.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCommands = (toolId: string, commands: string[]) => {
    navigator.clipboard.writeText(commands.join('\n'));
    setCopiedId(toolId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030712] text-white overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-[#070e24] border-b border-blue-900/40 shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  Siber Güvenlik, Pentest & Casus Takip Kataloğu
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  BÖLÜM 2 — 9
                </span>
              </div>
              <p className="text-xs text-blue-300/80 mt-1">
                Sıfır maliyetli, tamamen yasal ve yetkili testler için doğrulanmış açık kaynak araçlar
              </p>
            </div>

            {/* Sub Navigation */}
            <div className="flex items-center gap-1.5 p-1 bg-[#040814] rounded-xl border border-blue-900/50">
              <button
                onClick={() => setActiveTab('tools')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'tools'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Araçlar Listesi ({CYBER_TOOLS_CATALOG.length})
              </button>
              <button
                onClick={() => setActiveTab('vulnhouse')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'vulnhouse'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>100 Saatlik Test</span>
              </button>
              <button
                onClick={() => setActiveTab('ollama')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'ollama'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ollama .env</span>
              </button>

              {onSwitchToArchitecture && (
                <button
                  onClick={onSwitchToArchitecture}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Savunma Mimarisi (PQC/SIEM)</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Category Filter Pills */}
          {activeTab === 'tools' && (
            <div className="mt-3.5 pt-3 border-t border-blue-900/30 flex flex-col sm:flex-row gap-2.5">
              {/* Search Input */}
              <div className="relative sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Araç veya zafiyet ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#030712] border border-blue-800/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                        active
                          ? 'bg-blue-600/90 text-white border-blue-400 shadow-sm'
                          : 'bg-[#0a1432] text-slate-300 hover:text-white border-blue-900/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {activeTab === 'tools' && (
            <>
              {/* Live Interactive Security & Assistant Tools Bar */}
              <div className="rounded-2xl border border-blue-800/60 bg-gradient-to-r from-[#070e24] via-[#040814] to-[#0a1432] p-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-400" /> Canlı Siber Güvenlik & Karşı Gözetleme Araçları (İstemci Tarafı)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
                  <button
                    onClick={() => setShowVault(true)}
                    className="flex items-center gap-2 rounded-xl border border-blue-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-blue-500 hover:bg-blue-950/40 transition group"
                  >
                    <Lock className="h-5 w-5 text-blue-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">AES-256 Kasa</div>
                      <div className="text-[10px] text-gray-400">Şifreli Not & Parola</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowRogueAP(true)}
                    className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-red-500 hover:bg-red-950/40 transition group"
                  >
                    <Wifi className="h-5 w-5 text-red-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">Rogue AP Tespiti</div>
                      <div className="text-[10px] text-gray-400">Evil Twin & MiTM</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowPhishing(true)}
                    className="flex items-center gap-2 rounded-xl border border-yellow-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-yellow-500 hover:bg-yellow-950/40 transition group"
                  >
                    <Link2 className="h-5 w-5 text-yellow-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">Phishing Analiz</div>
                      <div className="text-[10px] text-gray-400">SMS & URL Taraması</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowHardening(true)}
                    className="flex items-center gap-2 rounded-xl border border-emerald-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-emerald-500 hover:bg-emerald-950/40 transition group"
                  >
                    <Smartphone className="h-5 w-5 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">Cihaz Hardening</div>
                      <div className="text-[10px] text-gray-400">Güvenlik Skoru 0-100</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowBugDetector(true)}
                    className="flex items-center gap-2 rounded-xl border border-purple-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-purple-500 hover:bg-purple-950/40 transition group"
                  >
                    <Radio className="h-5 w-5 text-purple-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">Gizli Kamera/Bug</div>
                      <div className="text-[10px] text-gray-400">RF & Manyetik Arama</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowAntiTamper(true)}
                    className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-red-500 hover:bg-red-950/40 transition group"
                  >
                    <Volume2 className="h-5 w-5 text-red-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">Anti-Tamper Panic</div>
                      <div className="text-[10px] text-gray-400">Hareket Alarmı & Siren</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowJuiceJacking(true)}
                    className="flex items-center gap-2 rounded-xl border border-emerald-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-emerald-500 hover:bg-emerald-950/40 transition group"
                  >
                    <BatteryCharging className="h-5 w-5 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">USB Charge Shield</div>
                      <div className="text-[10px] text-gray-400">Juice Jacking Engeli</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowBleTracker(true)}
                    className="flex items-center gap-2 rounded-xl border border-cyan-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-cyan-500 hover:bg-cyan-950/40 transition group"
                  >
                    <Bluetooth className="h-5 w-5 text-cyan-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">BLE AirTag Radar</div>
                      <div className="text-[10px] text-gray-400">Takip Cihazı Tespiti</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowBreachChecker(true)}
                    className="flex items-center gap-2 rounded-xl border border-indigo-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-indigo-500 hover:bg-indigo-950/40 transition group"
                  >
                    <Database className="h-5 w-5 text-indigo-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">Dark Web Sızıntı</div>
                      <div className="text-[10px] text-gray-400">E-Posta İhlal Arama</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowPwaInstaller(true)}
                    className="flex items-center gap-2 rounded-xl border border-blue-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-blue-500 hover:bg-blue-950/40 transition group"
                  >
                    <Download className="h-5 w-5 text-blue-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">Android APK Kur</div>
                      <div className="text-[10px] text-gray-400">WebAPK Mobil Rehber</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowFingerprint(true)}
                    className="flex items-center gap-2 rounded-xl border border-emerald-900/60 bg-black/60 p-2.5 text-xs text-left text-white hover:border-emerald-500 hover:bg-emerald-950/40 transition group"
                  >
                    <Fingerprint className="h-5 w-5 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
                    <div>
                      <div className="font-bold text-xs">Cihaz Parmak İzi</div>
                      <div className="text-[10px] text-gray-400">IP Bağımsız Tespiti</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowVisualSecurity(true)}
                    className="flex items-center gap-2 rounded-xl border border-blue-600/40 bg-blue-600/10 p-2.5 text-xs text-left text-white hover:border-blue-400 hover:bg-blue-600/20 transition group parlement-glow"
                  >
                    <Eye className="h-5 w-5 text-blue-400 shrink-0 group-hover:scale-110 transition animate-pulse" />
                    <div>
                      <div className="font-bold text-xs">Canlı Görsel Analiz</div>
                      <div className="text-[10px] text-blue-300/60">Ekran & Kamera</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-4 rounded-2xl bg-[#070e24] border border-blue-800/50 hover:border-blue-500/60 transition shadow-lg flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top line: Section & Badge */}
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="text-blue-400/90 font-mono truncate max-w-[70%]">
                          {tool.categoryTitle}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            tool.statusBadge === 'verified'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : tool.statusBadge === 'commercial'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {tool.license}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                        {tool.name}
                      </h3>

                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {tool.description}
                      </p>

                      {/* Bullet features */}
                      <ul className="mt-3 space-y-1 text-[11px] text-slate-400">
                        {tool.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-1.5">
                            <span className="text-blue-400 shrink-0 font-bold">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Quick Commands Snippet if present */}
                      {tool.quickCommands && tool.quickCommands.length > 0 && (
                        <div className="mt-3 p-2.5 rounded-xl bg-[#02050e] border border-blue-950 font-mono text-[11px] text-blue-300 relative group/code">
                          <div className="flex items-center justify-between pb-1 mb-1 border-b border-blue-950 text-[10px] text-slate-400">
                            <span>Kurulum Komutları</span>
                            <button
                              onClick={() => handleCopyCommands(tool.id, tool.quickCommands!)}
                              className="flex items-center gap-1 text-blue-400 hover:text-white"
                            >
                              {copiedId === tool.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Kopyalandı</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Kopyala</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="overflow-x-auto whitespace-pre-wrap leading-tight text-slate-300">
                            {tool.quickCommands.join('\n')}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Bottom Card Actions */}
                    <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          onAskAssistant(
                            `${tool.name} aracını nasıl kurup çalıştırabilirim ve pratik kullanım senaryoları nelerdir?`
                          )
                        }
                        className="flex-1 py-1.5 px-3 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800 text-xs font-semibold transition text-center"
                      >
                        Asistana Sor
                      </button>

                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-[#0a1432] hover:bg-blue-900/60 text-slate-300 hover:text-white border border-blue-800/60 transition"
                        title="GitHub / Resmi Bağlantı"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Tab 2: VulnHouse 100 Hours Test Details */}
          {activeTab === 'vulnhouse' && (
            <div className="space-y-5">
              <div className="p-6 rounded-2xl bg-[#070e24] border border-blue-800/60 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {VULNHOUSE_100_HOURS_DATA.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {VULNHOUSE_100_HOURS_DATA.event} • {VULNHOUSE_100_HOURS_DATA.target}
                    </p>
                  </div>
                </div>

                {/* Metric grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#040814] border border-blue-900/50">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Çözülen Soru</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      {VULNHOUSE_100_HOURS_DATA.metrics.solvedQuestions}
                    </div>
                    <div className="text-[10px] text-emerald-300/80">
                      {VULNHOUSE_100_HOURS_DATA.metrics.successRate}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#040814] border border-blue-900/50">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Toplam Puan</div>
                    <div className="text-lg font-black text-blue-400 font-mono mt-0.5">
                      {VULNHOUSE_100_HOURS_DATA.metrics.totalScore}
                    </div>
                    <div className="text-[10px] text-blue-300/80">Otonom Ajan Başarısı</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#040814] border border-blue-900/50">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">En Hızlı Görev</div>
                    <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                      {VULNHOUSE_100_HOURS_DATA.metrics.fastestTask}
                    </div>
                    <div className="text-[10px] text-slate-400">Anında Exploit</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#040814] border border-blue-900/50">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Sıfır Müdahale</div>
                    <div className="text-lg font-black text-purple-400 font-mono mt-0.5">
                      {VULNHOUSE_100_HOURS_DATA.metrics.autonomousBreakthrough}
                    </div>
                    <div className="text-[10px] text-purple-300/80">Tam Bağımsız Çözüm</div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="pt-3 border-t border-blue-900/40 space-y-2">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Test Edilen Temel Yetenekler
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {VULNHOUSE_100_HOURS_DATA.capabilities.map((cap, cIdx) => (
                      <div key={cIdx} className="p-2.5 rounded-xl bg-[#040814] border border-blue-900/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300/90 leading-relaxed">
                  ⚠️ {VULNHOUSE_100_HOURS_DATA.warning}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Ollama Zero-Cost Setup & .env Template */}
          {activeTab === 'ollama' && (
            <div className="space-y-5">
              <div className="p-6 rounded-2xl bg-[#070e24] border border-blue-800/60 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Bölüm 8: Sıfır Maliyetli Ollama Yapılandırması
                    </h3>
                    <p className="text-xs text-slate-400">
                      Hiçbir API anahtarı veya kredi kartı gerektirmeden sınırsız yerel LLM entegrasyonu
                    </p>
                  </div>
                </div>

                {/* Commands */}
                <div className="p-4 rounded-xl bg-[#02050e] border border-blue-950 font-mono text-xs text-blue-300 space-y-2">
                  <div className="text-slate-400 font-bold text-[11px]">1. Ollama Kurulumu ve Model Çekme:</div>
                  <pre className="text-slate-200 select-all p-2 rounded bg-[#070e24]">
{`curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b-instruct-q8_0
sudo systemctl enable --now ollama`}
                  </pre>
                </div>

                {/* PentAGI .env */}
                <div className="p-4 rounded-xl bg-[#02050e] border border-blue-950 font-mono text-xs text-blue-300 space-y-2">
                  <div className="text-slate-400 font-bold text-[11px]">2. PentAGI İçin .env Dosyasına Eklenecek Satırlar:</div>
                  <pre className="text-slate-200 select-all p-2 rounded bg-[#070e24]">
{`OLLAMA_SERVER_URL=http://localhost:11434
OLLAMA_SERVER_MODEL=llama3.1:8b-instruct-q8_0
OLLAMA_SERVER_PULL_MODELS_ENABLED=true
OLLAMA_SERVER_LOAD_MODELS_ENABLED=true`}
                  </pre>
                </div>

                {/* Hermes Agent .env */}
                <div className="p-4 rounded-xl bg-[#02050e] border border-blue-950 font-mono text-xs text-blue-300 space-y-2">
                  <div className="text-slate-400 font-bold text-[11px]">3. Hermes Agent İçin .env Yapılandırması:</div>
                  <pre className="text-slate-200 select-all p-2 rounded bg-[#070e24]">
{`OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Modals */}
      <EncryptedVaultModal isOpen={showVault} onClose={() => setShowVault(false)} />
      <RogueAPDetectorModal isOpen={showRogueAP} onClose={() => setShowRogueAP(false)} />
      <PhishingAnalyzerModal isOpen={showPhishing} onClose={() => setShowPhishing(false)} />
      <DeviceHardeningModal isOpen={showHardening} onClose={() => setShowHardening(false)} />
      <BugDetectorModal isOpen={showBugDetector} onClose={() => setShowBugDetector(false)} />
      <AntiTamperPanicModal isOpen={showAntiTamper} onClose={() => setShowAntiTamper(false)} />
      <JuiceJackingShieldModal isOpen={showJuiceJacking} onClose={() => setShowJuiceJacking(false)} />
      <BleTrackerModal isOpen={showBleTracker} onClose={() => setShowBleTracker(false)} />
      <BreachCheckerModal isOpen={showBreachChecker} onClose={() => setShowBreachChecker(false)} />
      <PWAInstallModal isOpen={showPwaInstaller} onClose={() => setShowPwaInstaller(false)} />
      <BehavioralFingerprintModal isOpen={showFingerprint} onClose={() => setShowFingerprint(false)} />
      <LiveVisualSecurityModal isOpen={showVisualSecurity} onClose={() => setShowVisualSecurity(false)} onAskAssistant={onAskAssistant} />
    </div>
  );
};
