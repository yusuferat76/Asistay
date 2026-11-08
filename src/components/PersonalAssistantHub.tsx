import React, { useState } from 'react';
import {
  Smartphone,
  Bot,
  Cpu,
  Mic,
  MessageSquare,
  ShieldCheck,
  Zap,
  Sliders,
  Send,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Terminal,
  Volume2,
  Lock,
  Layers,
  ArrowDownUp,
  RefreshCw,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';

interface PersonalAssistantHubProps {
  onAskAssistant: (question: string) => void;
  onOpenOllamaModal: () => void;
  onOpenApkModal: () => void;
}

export const PersonalAssistantHub: React.FC<PersonalAssistantHubProps> = ({
  onAskAssistant,
  onOpenOllamaModal,
  onOpenApkModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'automation' | 'local_model' | 'messaging'>('overview');
  const [modelStatus, setModelStatus] = useState<'ready' | 'downloading' | 'idle'>('ready');
  const [testCommand, setTestCommand] = useState('');
  const [quickFeedback, setQuickFeedback] = useState<string | null>(null);

  const phoneAutomationFeatures = [
    {
      id: 'neuron',
      name: 'Neuron Doğal Dil Telefon Ajanı',
      badge: 'CİHAZ İÇİ MODEL',
      description: 'Android 8.0+ cihazlarda Erişilebilirlik servisi ile ekrana dokunmadan uygulamaları açar, mesaj yazar ve ayarları yönetir.',
      status: 'Hazır',
      actionPrompt: 'Neuron telefon kontrol servisini nasıl etkinleştiririm?',
      commands: ['"WhatsApp\'tan Ahmet\'e 10 dakikaya geliyorum yaz"', '"Ayarlardan Bluetooth\'u kapat"', '"Kamerayı aç ve fotoğraf çek"'],
    },
    {
      id: 'android-use',
      name: 'Android Use Agent (ADB / USB)',
      badge: 'OTONOM EKRAN KONTROLÜ',
      description: 'Yapay zekanın telefon ekranını "gözleri ve elleri" gibi kullanarak dokunma, yazma ve kaydırma hareketlerini otonom yürütmesini sağlar.',
      status: 'Bağlı',
      actionPrompt: 'Android Use ile USB üzerinden otonom telefon kontrolü nasıl yapılır?',
      commands: ['python -m android_use --task "Instagram\'da son mesajı kontrol et"'],
    },
    {
      id: 'openclaw',
      name: 'OpenClaw (Clawdbot)',
      badge: 'MESAJLAŞMA & GÖREV',
      description: 'WhatsApp, Telegram, Discord ve Signal mesajlaşma uygulamalarını yerel yapay zekaya bağlayarak kişisel asistanlık görevlerini yürütür.',
      status: 'Aktif',
      actionPrompt: 'OpenClaw Telegram ve WhatsApp botu nasıl yapılandırılır?',
      commands: ['openclaw onboard --provider ollama --url http://localhost:11434'],
    },
    {
      id: 'hermes',
      name: 'Hermes Agent (Nous Research)',
      badge: '70+ BECERİ & KALICI HAFIZA',
      description: 'Oturumlar arasında hafızasını kaybetmeyen, dosya düzenleyen, takvim yöneten ve kendi becerilerini geliştirebilen akıllı ajan.',
      status: 'Entegre',
      actionPrompt: 'Hermes Agent kalıcı hafıza ve kişisel görev becerileri nelerdir?',
      commands: ['hermes run --task "Haftalık takvimimi özetle ve yapılacaklar listesi çıkar"'],
    },
  ];

  const handleRunQuickAction = (promptText: string) => {
    playTacticalSound('command_exec');
    setQuickFeedback(`⚡ Işık hızında komut gönderildi: "${promptText}"`);
    setTimeout(() => {
      onAskAssistant(promptText);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030712] text-white overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-[#070e24] border-b border-blue-900/40 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                Kişisel Asistan & Mobil Otomasyon Merkezi
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                SIFIR MALİYET • CİHAZ İÇİ
              </span>
            </div>
            <p className="text-xs text-blue-300/80 mt-0.5">
              Telefon kontrolleri, mesajlaşma ajanları, eller-serbest sesli kaydırma ve yerel yapay zeka
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#040814] rounded-xl border border-blue-900/50 text-xs">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeSubTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveSubTab('automation')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'automation' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Telefon Ajanları</span>
            </button>
            <button
              onClick={() => setActiveSubTab('local_model')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'local_model' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yerel Model (Qwen/Ollama)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('messaging')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'messaging' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Mesajlaşma & Görev</span>
            </button>
          </div>
        </div>

        {quickFeedback && (
          <div className="mt-2 text-xs text-emerald-400 font-mono animate-pulse">
            {quickFeedback}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* OVERVIEW SUB-TAB */}
        {activeSubTab === 'overview' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Hero Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0a1738] via-[#040814] to-[#02050e] border border-blue-500/40 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tamamen Türkçe • Doğal Dil İşleme</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Telefonunuzu ve Günlük İşlerinizi Yöneten Kişisel Asistan
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Elinizi bile sürmeden sesinizle yönlendirin. Aşağı/yukarı kaydırma, uygulama açma, mesaj yanıtlama ve akıllı görev planlama yetenekleri tek ekranda.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    onClick={() => onAskAssistant('Kişisel asistan yeteneklerini ve telefon kontrollerini listele')}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-950 transition"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Sesle Soru Sor</span>
                  </button>
                  <button
                    onClick={onOpenOllamaModal}
                    className="px-4 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-blue-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span>Yerel Modeli Bağla</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Core Capability Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="p-5 rounded-2xl bg-[#070e24] border border-blue-900/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Mic className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-white">Işık Hızında Sesli Kontrol</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "Aşağı kaydır", "Yukarı kaydır", "En başa git", "Sona git" komutlarıyla ekranı dokunmadan salisesinde (&lt;1ms) kaydırın.
                </p>
                <div className="pt-2 border-t border-blue-900/40 text-[11px] font-mono text-emerald-400">
                  Gecikme: 0 ms (Yerel İcra)
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-5 rounded-2xl bg-[#070e24] border border-blue-900/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-white">Doğal Dil Telefon Kontrolü</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Neuron ve Android Use entegrasyonuyla WhatsApp mesajları gönderme, kamera açma ve sistem ayarlarını sesle yönetme.
                </p>
                <div className="pt-2 border-t border-blue-900/40 text-[11px] font-mono text-blue-400">
                  Erişilebilirlik & ADB Desteği
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-5 rounded-2xl bg-[#070e24] border border-blue-900/50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-white">Cihaz İçi Yerel Yapay Zeka</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Qwen3-0.6B (397 MB) veya Ollama Llama 3.1 ile internet olmadan, sıfır API ücreti ve sıfır kota ile güvenli çalışma.
                </p>
                <div className="pt-2 border-t border-blue-900/40 text-[11px] font-mono text-indigo-400">
                  %100 Gizlilik • Buluta Yüklenmez
                </div>
              </div>
            </div>

            {/* Quick Action Interactive Buttons */}
            <div className="p-4 rounded-2xl bg-[#040814] border border-blue-900/50 space-y-3">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Hızlı Sesli Asistan Eylemleri (Tıkla veya Sesinle Söyle):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Neuron ile WhatsApp mesajı nasıl gönderilir?',
                  'Ollama ile internetsiz yerel model nasıl çalışır?',
                  'OpenClaw Telegram botu entegrasyonunu açıkla',
                  'Hermes Agent kalıcı hafıza nasıl yapılandırılır?',
                  'VIGIL ile çevremdeki takip cihazlarını tara',
                  'Saf siyah OLED karanlık moduna geç',
                ].map((act, aIdx) => (
                  <button
                    key={aIdx}
                    onClick={() => handleRunQuickAction(act)}
                    className="px-3 py-1.5 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-800/60 text-xs text-blue-200 hover:text-white transition flex items-center gap-1.5"
                  >
                    <span>{act}</span>
                    <ChevronRight className="w-3 h-3 text-blue-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AUTOMATION SUB-TAB */}
        {activeSubTab === 'automation' && (
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="text-xs text-slate-400">
              Telefonunuzu sesle veya uzaktan yöneten doğrulanmış açık kaynak otomasyon ajanları:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phoneAutomationFeatures.map((feat) => (
                <div
                  key={feat.id}
                  className="p-5 rounded-2xl bg-[#070e24] border border-blue-900/50 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-white">{feat.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-950 text-blue-300 border border-blue-800">
                        {feat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{feat.description}</p>
                    <div className="space-y-1 bg-[#02050e] p-2.5 rounded-xl border border-blue-950 font-mono text-[11px] text-emerald-400">
                      {feat.commands.map((cmd, cIdx) => (
                        <div key={cIdx}>• {cmd}</div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunQuickAction(feat.actionPrompt)}
                    className="w-full py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Nasıl Kullanılır Söyle</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOCAL MODEL SUB-TAB */}
        {activeSubTab === 'local_model' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="p-6 rounded-3xl bg-[#070e24] border border-blue-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Cihaz İçi Çevrimdışı Model</h3>
                    <p className="text-xs text-slate-400">Qwen3-0.6B Q4_K_M (Yaklaşık 397 MB) • Sıfır Maliyet</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  CİHAZDA ÇALIŞIR
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Bu model doğrudan telefonunuzun veya bilgisayarınızın işlemcisinde çalışır. Sohbet etmek, sorular sormak veya komut vermek için harici API anahtarına, IP adresine veya sunucu bağlantısına ihtiyaç duymaz.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#02050e] border border-blue-950">
                  <div className="text-[10px] text-slate-400">Model Boyutu</div>
                  <div className="text-sm font-bold text-white mt-0.5">397 MB</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Hızlı İndirme</div>
                </div>
                <div className="p-3 rounded-xl bg-[#02050e] border border-blue-950">
                  <div className="text-[10px] text-slate-400">API Anahtarı</div>
                  <div className="text-sm font-bold text-white mt-0.5">Gereksiz (Yok)</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Sıfır Ücret</div>
                </div>
                <div className="p-3 rounded-xl bg-[#02050e] border border-blue-950">
                  <div className="text-[10px] text-slate-400">Gizlilik</div>
                  <div className="text-sm font-bold text-white mt-0.5">%100 Yerel</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Veri Telefonda Kalır</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onOpenOllamaModal}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Ollama Llama 3.1 8B Yapılandırmasını Aç</span>
                </button>
                <button
                  onClick={() => handleRunQuickAction('Cihaz içi Qwen modelini ve Ollama yerel kurulum adımlarını açıkla')}
                  className="px-4 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Kurulum Rehberini Asistana Sor</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGING SUB-TAB */}
        {activeSubTab === 'messaging' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="p-6 rounded-3xl bg-[#070e24] border border-blue-900/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Çok Platformlu Mesajlaşma Asistanı</h4>
                  <p className="text-xs text-blue-300">WhatsApp, Telegram, Discord, Signal ve Takvim Entegrasyonu</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                OpenClaw ve Hermes Agent köprüsü ile gelen bildirimleri özetleyebilir, sesli dikteyle cevap yazabilir ve takvim etkinliklerinizi hatırlatabilirsiniz.
              </p>

              <div className="space-y-2">
                {[
                  { name: 'WhatsApp Bot Entegrasyonu', desc: 'Gelen mesajları özetler, önceden tanımlanmış şablonlarla cevap verir.' },
                  { name: 'Telegram Asistan Kanalı', desc: 'Kişisel botunuz olarak komut alır, web araması yapar ve not kaydeder.' },
                  { name: 'Discord & Slack Webhook', desc: 'Güvenlik alarmlarını ve günlük hatırlatmaları kanallara aktarır.' },
                ].map((item, iIdx) => (
                  <div key={iIdx} className="p-3 rounded-xl bg-[#02050e] border border-blue-950 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => handleRunQuickAction(`${item.name} nasıl kurulur ve bağlanır?`)}
                      className="px-3 py-1 rounded-lg bg-blue-900/50 hover:bg-blue-800 text-blue-300 text-xs font-semibold shrink-0"
                    >
                      Öğren
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
