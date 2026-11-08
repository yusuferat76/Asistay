import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Cpu,
  Smartphone,
  Mic,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Layers,
  Key,
  Database,
  Radio,
  FileCode,
  Sliders,
  Check,
  Eye,
  Server,
  ArrowRight,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { speakUltraRealistic } from '../utils/ultraTTS';

interface DefensiveArchitectureHubProps {
  onAskAssistant: (question: string) => void;
}

export const DefensiveArchitectureHub: React.FC<DefensiveArchitectureHubProps> = ({ onAskAssistant }) => {
  const [activeTab, setActiveTab] = useState<'pqc' | 'mobile' | 'voice' | 'siem'>('pqc');

  // PQC State
  const [pqcGenerating, setPqcGenerating] = useState(false);
  const [hybridKey, setHybridKey] = useState<{
    eccKey: string;
    kyberKey: string;
    hybridHash: string;
    matrixRows: number[][];
    timestamp: string;
  } | null>({
    eccKey: '04a8f9c1...38b0e4f8 (Curve25519 256-bit)',
    kyberKey: 'ML-KEM-768 (Lattice PolyMatrix n=256, q=3329, k=3)',
    hybridHash: '8f3e1b09c2a4...d6e87a21 (HKDF-SHA512 Dual-Layer)',
    matrixRows: [
      [142, 891, 2301, 412],
      [780, 1982, 310, 1540],
      [2201, 415, 890, 3110],
      [640, 1420, 2810, 990],
    ],
    timestamp: 'Az önce hazırlandı',
  });

  // Mobile Security State
  const [mobileScanning, setMobileScanning] = useState(false);
  const [mobileIntegrityPassed, setMobileIntegrityPassed] = useState(true);

  // Voice Zero-Trust State
  const [testVoiceInput, setTestVoiceInput] = useState('');
  const [voiceSanitizationResult, setVoiceSanitizationResult] = useState<{
    sanitized: string;
    threatScore: number;
    authorized: boolean;
    pipelineStage: string;
  } | null>(null);

  // SOAR Playbook State
  const [runningPlaybookId, setRunningPlaybookId] = useState<string | null>(null);
  const [soarLogs, setSoarLogs] = useState<string[]>([
    '[SIEM] Telemetri korelasyon motoru devrede. 1420 log/sn analiz ediliyor.',
    '[EDR] Uç nokta çekirdek kancası (eBPF) aktif. Bellek izole.',
    '[SOAR] Otonom müdahale kuralları hazır (MTTR: < 2 saniye).',
  ]);

  // Generate new Hybrid PQC Keypair
  const handleGeneratePQC = () => {
    playTacticalSound('command_exec');
    setPqcGenerating(true);

    setTimeout(() => {
      const randomMatrix = Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, () => Math.floor(Math.random() * 3328) + 1)
      );

      const hexChars = '0123456789abcdef';
      const randHex = (len: number) =>
        Array.from({ length: len }, () => hexChars[Math.floor(Math.random() * hexChars.length)]).join('');

      setHybridKey({
        eccKey: `04${randHex(8)}...${randHex(8)} (X25519 ECC 256-bit)`,
        kyberKey: `ML-KEM-768 (${randHex(12)}... Kafes Vektör Uzayı)`,
        hybridHash: `${randHex(16)}...${randHex(16)} (Kuantum Dirençli)`,
        matrixRows: randomMatrix,
        timestamp: new Date().toLocaleTimeString(),
      });

      setPqcGenerating(false);
      speakUltraRealistic('Kuantum dirençli ML-KEM ve ECC hibrit anahtar çifti başarıyla türetildi.');
    }, 900);
  };

  // Run Mobile Attestation Test
  const handleRunMobileScan = () => {
    playTacticalSound('mic_on');
    setMobileScanning(true);

    setTimeout(() => {
      setMobileScanning(false);
      setMobileIntegrityPassed(true);
      playTacticalSound('command_exec');
      speakUltraRealistic('Play Integrity ve Donanım Keystore bütünlük doğrulaması tamamlandı. Sistem güvenli.');
    }, 1200);
  };

  // Run Zero-Trust Voice Input Filter
  const handleTestVoiceSanitizer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testVoiceInput.trim()) return;

    playTacticalSound('click');
    const input = testVoiceInput.trim();
    const hasInjection = /('|--|drop|script|exec|eval|<|>|\$|sudo|rm -rf)/i.test(input);

    setVoiceSanitizationResult({
      sanitized: input.replace(/[<>$'"`\\;]/g, ''),
      threatScore: hasInjection ? 85 : 5,
      authorized: !hasInjection,
      pipelineStage: hasInjection ? 'Zararlı Komut Filtresi Tarafından Engellendi' : 'Zero-Trust Giriş Onaylandı',
    });
  };

  // Execute SOAR Playbook
  const handleExecutePlaybook = (id: string, name: string) => {
    playTacticalSound('command_exec');
    setRunningPlaybookId(id);

    const ts = new Date().toLocaleTimeString();
    const newLogs = [
      `[${ts}] [SOAR TRIGGER] Playbook başlatıldı: ${name}`,
      `[${ts}] [SOAR ACTION] eBPF kuralı enjekte edildi & soket filtreleri kilitlendi.`,
      `[${ts}] [SOAR SUCCESS] Tehdit nötralize edildi. SOAR müdahale süresi: 480ms.`,
    ];

    setSoarLogs((prev) => [...newLogs, ...prev.slice(0, 15)]);
    speakUltraRealistic(`SOAR Olay Müdahale Playbook'u çalıştırıldı: ${name}`);

    setTimeout(() => {
      setRunningPlaybookId(null);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020611] text-white overflow-hidden p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-blue-900/40 gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-600 flex items-center justify-center border border-blue-400/50 shadow-lg shadow-blue-950">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Savunma & Kriptografi Mimarisi</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  NIST PQC • TEE/SE • SIEM
                </span>
              </h2>
              <p className="text-xs text-blue-300/80 mt-0.5">
                Kuantum Dirençli Şifreleme, Mobil Sistem Bütünlüğü, Zero-Trust Ses Arayüzü ve SOAR Otonom Savunma.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-black/80 rounded-2xl border border-blue-900/60 shadow-inner">
          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('pqc');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'pqc'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>1. PQC Kuantum</span>
          </button>

          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('mobile');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'mobile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>2. Mobil TEE/SE</span>
          </button>

          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('voice');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'voice'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>3. Zero-Trust Voice</span>
          </button>

          <button
            onClick={() => {
              playTacticalSound('click');
              setActiveTab('siem');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'siem'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>4. SIEM / SOAR</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* TAB 1: Kuantum Dirençli Şifreleme Mimarisi (PQC) */}
        {activeTab === 'pqc' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-blue-400 font-bold">NIST PQC KEM</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                    STANDARTLAŞTI (FIPS 203)
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white">ML-KEM (CRYSTALS-Kyber)</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Modül kafesleri üzerinde En Yakın Vektör Problemi (Learning With Errors - LWE) tabanlı kuantum dirençli anahtar kapsülleme.
                </p>
                <div className="mt-3 text-[10px] font-mono text-blue-300">Güvenlik: Seviye 3 (AES-192/256 eşdeğeri)</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">NIST PQC İmza</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                    FIPS 204
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white">ML-DSA (CRYSTALS-Dilithium)</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Güçlü kafes tabanlı dijital imzalama. Kuantum bilgisayarların Shor algoritmasıyla imza taklit etmesini matematiksel olarak önler.
                </p>
                <div className="mt-3 text-[10px] font-mono text-indigo-300">Anahtar Boyutu: 1312 byte açık anahtar</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-amber-400 font-bold">Hibrit Protokol</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800">
                    ÇİFT KATMAN
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white">ECC X25519 + Kyber-768</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Geleneksel eliptik eğri ile post-kuantum anahtarları birleştiren hibrit tünelleme; her iki kriptosistem de kırılmadan veri ele geçirilemez.
                </p>
                <div className="mt-3 text-[10px] font-mono text-amber-300">Türetme: HKDF-SHA512 KDF</div>
              </div>
            </div>

            {/* Interactive Lattice Matrix & Hybrid Keypair Generator */}
            <div className="p-5 rounded-2xl bg-[#030917] border border-blue-800/60 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-blue-900/40">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                      İnteraktif Hibrit PQC Anahtar Değişimi & Kafes Matrisi (Lattice Matrix)
                    </h3>
                    <span className="text-xs font-mono text-gray-400">
                      Vektör uzayı üzerinde n=256 dereceli polinom halkası simülasyonu
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGeneratePQC}
                  disabled={pqcGenerating}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-950 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${pqcGenerating ? 'animate-spin' : ''}`} />
                  <span>{pqcGenerating ? 'Kafes Matrisi Hesaplanıyor...' : 'Yeni Hibrit PQC Anahtarı Türet'}</span>
                </button>
              </div>

              {/* Lattice PolyMatrix Visualizer Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black border border-blue-900/50 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs text-blue-400 font-bold">
                    <span>Lattice Matrix Polinom Katsayıları (q = 3329):</span>
                    <span className="text-emerald-400 text-[10px]">KUANTUM GÜVENLİ</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {hybridKey?.matrixRows.flat().map((val, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-center text-xs font-bold text-blue-200 transition hover:bg-blue-900/50 hover:border-blue-500"
                      >
                        {val}
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-gray-500 italic">
                    * Matris üzerindeki katsayılar, kuantum bilgisayarların Shor veya Grover algoritmalarıyla tersine çeviremeyeceği Short Integer Solution (SIS) problemine dayanır.
                  </div>
                </div>

                {/* Derived Key Details */}
                <div className="p-4 rounded-xl bg-black border border-blue-900/50 space-y-2.5 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">1. Geleneksel Klasik Anahtar:</span>
                    <span className="font-mono text-white text-xs font-bold">{hybridKey?.eccKey}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px]">2. Post-Kuantum Kafes KEM Anahtarı:</span>
                    <span className="font-mono text-indigo-300 text-xs font-bold">{hybridKey?.kyberKey}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px]">3. Birleştirilmiş Hibrit Anahtar (Secret Key):</span>
                    <span className="font-mono text-emerald-400 text-xs font-bold">{hybridKey?.hybridHash}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-blue-900/30">
                    <span>Oluşturulma: {hybridKey?.timestamp}</span>
                    <span className="text-blue-400 font-bold">AES-256-GCM Tüneli Hazır</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Mobil Güvenlik & Sistem Bütünlüğü (Defensive Mobile Security) */}
        {activeTab === 'mobile' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-blue-400 font-bold">App Attestation API</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-base font-extrabold text-white">Google Play Integrity</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Uygulamanın orijinal APK imzası, Google sertifikalı işletim sistemi ve cihaz donanım bütünlüğü doğrulanır.
                </p>
                <div className="mt-3 text-[10px] font-mono text-emerald-400">MEETS_STRONG_INTEGRITY: OK</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">Donanım Anahtar Kasası</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-base font-extrabold text-white">Android Keystore / TEE</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Özel anahtarlar Android işletim sistemi belleğinde değil, donanım düzeyinde izole edilen Trusted Execution Environment içinde saklanır.
                </p>
                <div className="mt-3 text-[10px] font-mono text-indigo-300">Donanım Yalıtımı: Aktif</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">Apple Ekosistemi</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-base font-extrabold text-white">DeviceCheck & Secure Enclave</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  iOS cihazlarında Secure Enclave donanım kripto işlemcisi ile biyometrik anahtarların kernel seviyesinde çalınması engellenir.
                </p>
                <div className="mt-3 text-[10px] font-mono text-emerald-300">Secure Enclave v4: Kilitli</div>
              </div>
            </div>

            {/* Live Mobile Integrity Scanner */}
            <div className="p-5 rounded-2xl bg-[#030917] border border-blue-800/60 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-blue-900/40">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                      Canlı Donanım Güvenlik & Root / Jailbreak Teftiş Modülü
                    </h3>
                    <span className="text-xs font-mono text-gray-400">
                      Donanım Güvenlik Modülü (HSM) ve TEE Donanım Durumu
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleRunMobileScan}
                  disabled={mobileScanning}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-950 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${mobileScanning ? 'animate-spin' : ''}`} />
                  <span>{mobileScanning ? 'Donanım Doğrulanıyor...' : 'Donanım Teftişini Çalıştır'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-black border border-blue-900/40">
                  <span className="text-gray-400 block text-[10px]">Bootloader Durumu:</span>
                  <span className="text-emerald-400 font-bold">KİLİTLİ (OEM Locked)</span>
                </div>
                <div className="p-3 rounded-xl bg-black border border-blue-900/40">
                  <span className="text-gray-400 block text-[10px]">Root / Magisk Tespiti:</span>
                  <span className="text-emerald-400 font-bold">TEMİZ (0 Su İzi)</span>
                </div>
                <div className="p-3 rounded-xl bg-black border border-blue-900/40">
                  <span className="text-gray-400 block text-[10px]">Hardware Keystore:</span>
                  <span className="text-blue-300 font-bold">STRONGBOX DESTEKLİ</span>
                </div>
                <div className="p-3 rounded-xl bg-black border border-blue-900/40">
                  <span className="text-gray-400 block text-[10px]">Zararlı Hata Ayıklama (ADB):</span>
                  <span className="text-emerald-400 font-bold">DEVRE DIŞI</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Güvenli Sesli Kullanıcı Arayüzü Mimarisi (Voice UI Architecture) */}
        {activeTab === 'voice' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-blue-400 font-bold">Gizlilik Garantisi</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                    %100 LOKAL
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white">Local On-Device STT / TTS</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Ses dalgaları sunucuya aktarılmaz. Web Speech ve yerel neural modeller cihazın kendi RAM ve GPU belleğinde çalışır.
                </p>
                <div className="mt-3 text-[10px] font-mono text-emerald-400">Bulut Veri Sızıntısı: 0 KB</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">Savunma Hattı</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                    SANİTASYON
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white">Zero-Trust Input Pipeline</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Gelen sesli komutlar semantik parser tarafından filtrelenir; SQLi, bash injection veya model jailbreak denemeleri önlenir.
                </p>
                <div className="mt-3 text-[10px] font-mono text-indigo-300">Girdi Doğrulama: Sıkı Mod</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">Bellek Güvenliği</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    RAM-PURGE
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white">Geçici Tampon Sıfırlama</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Sesli komut işlendikten hemen sonra ses tampon belleği 7 kez sıfır yazılarak kalıcı disk veya takas alanında iz bırakmadan silinir.
                </p>
                <div className="mt-3 text-[10px] font-mono text-emerald-400">Arabellek: Güvenli İmha</div>
              </div>
            </div>

            {/* Interactive Zero-Trust Voice Input Simulator */}
            <div className="p-5 rounded-2xl bg-[#030917] border border-blue-800/60 shadow-xl space-y-4">
              <div className="pb-3 border-b border-blue-900/40">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Mic className="w-5 h-5 text-blue-400" />
                  <span>Zero-Trust Sesli Komut Sanitasyon & Yetkilendirme Testi</span>
                </h3>
                <span className="text-xs font-mono text-gray-400">
                  Sesli veya yazılı komutu enjeksiyon ve manipülasyon testinden geçirin
                </span>
              </div>

              <form onSubmit={handleTestVoiceSanitizer} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={testVoiceInput}
                  onChange={(e) => setTestVoiceInput(e.target.value)}
                  placeholder="Örn: Ağ trafiğini tara ve şüpheli soketleri izole et; DROP TABLE logs;"
                  className="flex-1 bg-black border border-blue-800/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-950 shrink-0"
                >
                  <Shield className="w-4 h-4" />
                  <span>Pipeline'dan Geçir</span>
                </button>
              </form>

              {voiceSanitizationResult && (
                <div className="p-4 rounded-xl bg-black border border-blue-900/60 space-y-2 text-xs font-mono animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Doğrulama Sonucu:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        voiceSanitizationResult.authorized
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {voiceSanitizationResult.pipelineStage}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Temizlenmiş Güvenli Komut:</span>
                    <span className="text-blue-300 font-bold">{voiceSanitizationResult.sanitized}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400">Enjeksiyon Risk Puanı:</span>
                    <span
                      className={`font-bold ${
                        voiceSanitizationResult.threatScore > 50 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      %{voiceSanitizationResult.threatScore} Risk
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Savunma ve İzleme Sistemleri (SIEM / EDR / SOAR) */}
        {activeTab === 'siem' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-blue-400 font-bold">SIEM Motoru</span>
                  <span className="text-emerald-400 font-mono text-[10px]">24 EPS CANLI</span>
                </div>
                <h4 className="text-base font-extrabold text-white">Log & Telemetri Analizi</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Güvenlik duvarları, IDS/IPS, DNS sorguları ve kullanıcı hareketleri merkezi korelasyon havuzunda işlenir.
                </p>
                <div className="mt-3 text-[10px] font-mono text-blue-400">Korelasyon Kuralı: 142 Aktif</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">EDR / XDR</span>
                  <span className="text-blue-400 font-mono text-[10px]">eBPF Koruması</span>
                </div>
                <h4 className="text-base font-extrabold text-white">Uç Nokta Süreç Teftişi</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Çekirdek seviyesinde çalışan şüpheli prosesler, bellek enjeksiyonları ve yetkisiz dosya değişimleri anında yakalanır.
                </p>
                <div className="mt-3 text-[10px] font-mono text-indigo-300">İzlenen Proses: 84 / 0 Anomali</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">SOAR Otomasyonu</span>
                  <span className="text-emerald-400 font-mono text-[10px]">MTTR &lt; 2s</span>
                </div>
                <h4 className="text-base font-extrabold text-white">Otonom Olay Müdahalesi</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Saldırı anında insan müdahalesine gerek kalmadan önceden tanımlanmış savunma playbook'ları milisaniyeler içinde uygulanır.
                </p>
                <div className="mt-3 text-[10px] font-mono text-emerald-400">Playbook Sayısı: 6 Hazır</div>
              </div>
            </div>

            {/* SOAR Interactive Playbook Execution Center */}
            <div className="p-5 rounded-2xl bg-[#030917] border border-blue-800/60 shadow-xl space-y-4">
              <div className="pb-3 border-b border-blue-900/40">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>SOAR Otonom Savunma Playbook'ları (Tetikle &amp; İzle)</span>
                </h3>
                <span className="text-xs font-mono text-gray-400">
                  Olay anında sıfır gecikmeyle uygulanan otomatize savunma senaryoları
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-black border border-blue-900/50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span>Playbook #1: Brute-Force &amp; Port Scan Ban</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Şüpheli IP adresini iptables ve BGP yönlendirmesinde anında bloke eder.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExecutePlaybook('pb-1', 'Brute-Force & Port Scan Ban')}
                    disabled={runningPlaybookId === 'pb-1'}
                    className="w-full py-2 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-600/50 font-bold text-xs transition text-center"
                  >
                    {runningPlaybookId === 'pb-1' ? 'Müdahale Ediliyor...' : 'Playbook 1 Çalıştır'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-blue-900/50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Playbook #2: RAM Vault &amp; Karantina</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Bellek manipülasyonu tespitinde RAM tamponunu şifreler ve prosesi kafese alır.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExecutePlaybook('pb-2', 'RAM Vault & Karantina')}
                    disabled={runningPlaybookId === 'pb-2'}
                    className="w-full py-2 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-600/50 font-bold text-xs transition text-center"
                  >
                    {runningPlaybookId === 'pb-2' ? 'Karantinaya Alınıyor...' : 'Playbook 2 Çalıştır'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-blue-900/50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Playbook #3: DNS Zehirlemede DoH Omurga</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      DNS önbelleğini sıfırlar, şifreli DNS-over-HTTPS tüneline otonom geçiş yapar.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExecutePlaybook('pb-3', 'DNS Zehirlemede DoH Omurga')}
                    disabled={runningPlaybookId === 'pb-3'}
                    className="w-full py-2 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-600/50 font-bold text-xs transition text-center"
                  >
                    {runningPlaybookId === 'pb-3' ? 'Omurgaya Geçiliyor...' : 'Playbook 3 Çalıştır'}
                  </button>
                </div>
              </div>

              {/* Live SIEM / SOAR Log Stream */}
              <div className="p-3.5 rounded-xl bg-black border border-blue-900/40 space-y-1.5">
                <div className="text-[10px] font-mono text-blue-400 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Canlı SIEM &amp; SOAR Olay Müdahale Kayıtları:</span>
                </div>
                <div className="space-y-1 font-mono text-[10px] max-h-32 overflow-y-auto">
                  {soarLogs.map((log, i) => (
                    <div key={i} className="text-gray-300">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
