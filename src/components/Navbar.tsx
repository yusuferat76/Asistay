import React from 'react';
import {
  Shield,
  Mic,
  Smartphone,
  ShieldAlert,
  Cpu,
  Sparkles,
  Moon,
  Bot,
  Trash2,
  Lock,
  Sliders,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'assistant' | 'tools' | 'personal' | 'phone-tracker' | 'architecture' | 'tactical-inventory';
  onSelectTab: (tab: 'assistant' | 'tools' | 'personal' | 'phone-tracker' | 'architecture' | 'tactical-inventory') => void;
  onOpenApkModal: () => void;
  onOpenEmergency: () => void;
  onOpenOllama: () => void;
  onOpenThemeModal?: () => void;
  onOpenSanitizer?: () => void;
  onOpenLock?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenApkModal,
  onOpenEmergency,
  onOpenOllama,
  onOpenThemeModal,
  onOpenSanitizer,
  onOpenLock,
}) => {
  return (
    <header className="h-16 bg-black border-b border-blue-900/40 px-3 sm:px-5 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-black via-[#1e3a8a] to-[#2563eb] p-0.5 shadow-lg shadow-blue-950 flex items-center justify-center border border-blue-400/40">
          <Shield className="w-5 h-5 text-white animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-sm sm:text-base tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>Sınırsız</span>
              <span className="text-blue-400 font-extrabold">Asistan</span>
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Siber Güvenlik • Kişisel Asistan
            </span>
          </div>
          <p className="text-[11px] text-blue-300/80 hidden sm:block">
            Otonom Siber Güvenlik, Yerel LLM, Sesli Komuta & Kişisel Asistan Platformu
          </p>
        </div>
      </div>

      {/* Center Tabs Navigation */}
      <div className="flex items-center p-1 bg-[#02050e] rounded-2xl border border-blue-900/60 shadow-inner">
        <button
          onClick={() => onSelectTab('assistant')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            currentTab === 'assistant'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sesli Komuta</span>
        </button>

        <button
          onClick={() => onSelectTab('tools')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            currentTab === 'tools'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Siber Güvenlik (Bölüm 2-9)</span>
          <span className="sm:hidden">Siber</span>
        </button>

        <button
          onClick={() => onSelectTab('personal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            currentTab === 'personal'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kişisel Asistan</span>
          <span className="sm:hidden">Asistan</span>
        </button>

        <button
          onClick={() => onSelectTab('phone-tracker')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            currentTab === 'phone-tracker'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Phone Tracker</span>
          <span className="sm:hidden">Tracker</span>
        </button>

        <button
          onClick={() => onSelectTab('architecture')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            currentTab === 'architecture'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Savunma Mimarisi (PQC/SIEM)</span>
          <span className="sm:hidden">Mimari</span>
        </button>

        <button
          onClick={() => onSelectTab('tactical-inventory')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            currentTab === 'tactical-inventory'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Taktik Envanter (28)</span>
          <span className="sm:hidden">Envanter</span>
        </button>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2">
        {/* Wake-on-Voice Lock Button */}
        {onOpenLock && (
          <button
            onClick={onOpenLock}
            className="p-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 hover:text-white transition group"
            title='Wake-on-Voice "Sınırsız Asistan" Kilit Modu'
          >
            <Lock className="w-4 h-4 group-hover:scale-110 transition" />
          </button>
        )}

        {/* Theme Tester */}
        {onOpenThemeModal && (
          <button
            onClick={onOpenThemeModal}
            className="p-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 hover:text-white transition"
            title="Karanlık Mod & Tema Testi (Parlement, OLED, Taktik)"
          >
            <Moon className="w-4 h-4" />
          </button>
        )}

        {/* Digital Footprint & Data Sanitizer Button */}
        {onOpenSanitizer && (
          <button
            onClick={onOpenSanitizer}
            className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-400 hover:text-white transition"
            title="Dijital Ayak İzi & Veri Temizleme Protokolü"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Mobile APK / PWA download button */}
        <button
          onClick={onOpenApkModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-950/60 border border-blue-400/40 transition"
          title="Android APK / PWA Uygulaması İndir"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">APK / Mobil Yükle</span>
        </button>

        {/* Emergency Kill Switch */}
        <button
          onClick={onOpenEmergency}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shadow-red-950 border border-red-500 transition active:scale-95"
          title="Tüm Sistemleri Anında Durdur ve İzole Et"
        >
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden md:inline">ACİL</span>
        </button>
      </div>
    </header>
  );
};
