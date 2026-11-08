import React from 'react';
import {
  X,
  Shield,
  Mic,
  Volume2,
  Bell,
  Eye,
  Settings as SettingsIcon,
  CheckCircle2,
  Cpu,
  Monitor,
  Zap,
  DollarSign,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    continuousListening: boolean;
    autoSpeak: boolean;
    showSecurityAlerts: boolean;
    stealthMode: boolean;
    visualGauges: boolean;
    monthlyLimit: number;
  };
  onUpdateSetting: (key: string, value: boolean | number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
}) => {
  if (!isOpen) return null;

  const handleToggle = (key: string, current: boolean) => {
    playTacticalSound('click');
    onUpdateSetting(key, !current);
  };

  const categories = [
    {
      title: 'Ses & İletişim',
      icon: Mic,
      items: [
        {
          id: 'continuousListening',
          label: 'Devamlı Dinleme (Gemini Live)',
          desc: 'Asistan arka planda sürekli dinlemede kalır.',
          enabled: settings.continuousListening,
        },
        {
          id: 'autoSpeak',
          label: 'Otomatik Sesli Yanıt',
          desc: 'Yanıtlar otomatik olarak Türkçe seslendirilir.',
          enabled: settings.autoSpeak,
        },
      ],
    },
    {
      title: 'Güvenlik & Kalkanlar',
      icon: Shield,
      items: [
        {
          id: 'showSecurityAlerts',
          label: 'Siber Tehdit Bildirimleri',
          desc: 'Arka planda sızma veya tehdit algılandığında uyar.',
          enabled: settings.showSecurityAlerts,
        },
        {
          id: 'stealthMode',
          label: 'Gizlilik (Stealth) Modu',
          desc: 'Uygulama trafiğini yerel tünellerden geçirir.',
          enabled: settings.stealthMode,
        },
      ],
    },
    {
      title: 'Görsel & Arayüz',
      icon: Monitor,
      items: [
        {
          id: 'visualGauges',
          label: 'Canlı Veri Göstergeleri',
          desc: 'İşlem hızını ve sistem durumunu görselleştir.',
          enabled: settings.visualGauges,
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#050505] border border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-blue-900/40 bg-gradient-to-r from-black to-[#0a163a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Sistem Ayarları</h3>
                <p className="text-xs text-blue-300/80">Kişisel Asistan & Güvenlik Yapılandırması</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-blue-950 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest px-1">
                <cat.icon className="w-3.5 h-3.5" />
                <span>{cat.title}</span>
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id, item.enabled)}
                    className="p-4 rounded-2xl bg-[#0a0a0a] border border-blue-950/50 hover:border-blue-800/60 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white group-hover:text-blue-200 transition">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>

                    <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 shrink-0 ${
                      item.enabled ? 'bg-blue-600' : 'bg-slate-800'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${
                        item.enabled ? 'left-6' : 'left-1'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Harcama Limiti Ayarları */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest px-1">
               <DollarSign className="w-3.5 h-3.5" />
               <span>Finansal Kısıtlamalar</span>
             </div>
             <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-emerald-950/50 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-bold text-white">Aylık Harcama Limiti (₺)</div>
                  <input
                    type="number"
                    value={settings.monthlyLimit || ''}
                    onChange={(e) => onUpdateSetting('monthlyLimit', parseFloat(e.target.value))}
                    className="w-24 px-3 py-1.5 bg-black border border-emerald-900 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  Bu limit aşıldığında sistem genelinde otomatik bildirim uyarısı gönderilir.
                </div>
             </div>
          </div>

          {/* Model Info Badge */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-emerald-500" />
            <div>
              <div className="text-xs font-bold text-emerald-400">Aktif Yerel Model</div>
              <div className="text-[10px] text-emerald-300/60 uppercase tracking-tighter">
                Qwen3-0.6B • Yerel • Ücretsiz
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black border-t border-blue-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-950 transition"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
