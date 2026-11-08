import React from 'react';
import {
  Moon,
  Sun,
  X,
  CheckCircle2,
  Eye,
  Sparkles,
  Zap,
  Shield,
  Monitor,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';

export type AppTheme = 'parliament' | 'oled' | 'stealth';

interface ThemeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeManagerModal: React.FC<ThemeManagerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const themes: Array<{
    id: AppTheme;
    name: string;
    subtitle: string;
    badge: string;
    bgHex: string;
    accentHex: string;
    description: string;
    contrast: string;
  }> = [
    {
      id: 'parliament',
      name: 'Parlement Mavisi & Derin Gece',
      subtitle: 'Standart Komuta Teması',
      badge: 'VARSAYILAN',
      bgHex: '#040814',
      accentHex: '#2563eb',
      description: 'Siyah zemin, parlement mavisi derin neon vurgular ve saf beyaz metin kontrastı.',
      contrast: '16.4:1 (WCAG AAA)',
    },
    {
      id: 'oled',
      name: 'Saf OLED Simsiyah',
      subtitle: 'Maksimum Pil Tasarrufu',
      badge: 'OLED / AMOLED',
      bgHex: '#000000',
      accentHex: '#38bdf8',
      description: 'Pikselleri tamamen kapatan saf #000000 siyah, elektrik mavisi ince kenarlıklar.',
      contrast: '21:1 (Maksimum)',
    },
    {
      id: 'stealth',
      name: 'Taktik Gizlilik (Stealth Green)',
      subtitle: 'Gece Operasyon & Terminal',
      badge: 'TAKTIK MATRİX',
      bgHex: '#020a06',
      accentHex: '#10b981',
      description: 'Askeri siber savunma kalkanı yeşili, göz yormayan düşük radyasyon gece modu.',
      contrast: '15.2:1 (WCAG AAA)',
    },
  ];

  const handleApplyTheme = (themeId: AppTheme) => {
    playTacticalSound('command_exec');
    onSelectTheme(themeId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#070e24] border border-blue-500/60 rounded-3xl shadow-2xl p-6 text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Karanlık Mod & Tema Test Paneli</h3>
              <p className="text-xs text-blue-300/80">Yüksek Kontrastlı Gece ve OLED Kalkanları</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-blue-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Cards */}
        <div className="mt-5 space-y-3">
          {themes.map((t) => {
            const isSelected = currentTheme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => handleApplyTheme(t.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-[#0b1638] border-blue-400 shadow-lg shadow-blue-950/60 scale-[1.01]'
                    : 'bg-[#040814] border-blue-950 hover:border-blue-800/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Theme swatch */}
                  <div
                    style={{ backgroundColor: t.bgHex, borderColor: t.accentHex }}
                    className="w-12 h-12 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-md"
                  >
                    <div
                      style={{ backgroundColor: t.accentHex }}
                      className="w-4 h-4 rounded-full shadow-sm"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white truncate">{t.name}</h4>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-blue-950 text-blue-300 border border-blue-800">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{t.description}</p>
                    <div className="text-[10px] text-emerald-400 font-mono mt-1">
                      Kontrast Skoru: {t.contrast}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Voice Command Hint */}
        <div className="mt-5 p-3 rounded-xl bg-[#030712] border border-blue-900/60 text-xs text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>Sesli Komutla Değiştir:</strong> Asistana doğrudan <span className="text-blue-300 font-semibold">"OLED moduna geç"</span> veya <span className="text-blue-300 font-semibold">"Parlement mavisine dön"</span> diyebilirsiniz.
          </span>
        </div>
      </div>
    </div>
  );
};
