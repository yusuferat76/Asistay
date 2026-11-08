import React, { useState, useEffect, useRef } from 'react';
import { Search, Shield, Terminal, Settings, Zap, Home, Layout, Trash2, Map, CreditCard, Activity } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectAction }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    { id: 'assistant', label: 'Ana Panel', icon: <Home />, category: 'Gezinti' },
    { id: 'tools', label: 'Siber Araçlar', icon: <Shield />, category: 'Gezinti' },
    { id: 'personal', label: 'Kişisel Asistan', icon: <Activity />, category: 'Gezinti' },
    { id: 'phone-tracker', label: 'Cihaz Takibi', icon: <Map />, category: 'Gezinti' },
    { id: 'dev-console', label: 'Geliştirme Konsolu', icon: <Terminal />, category: 'Sistem' },
    { id: 'settings', label: 'Ayarlar', icon: <Settings />, category: 'Sistem' },
    { id: 'sanitizer', label: 'Dijital Temizlik (SIFIRLA)', icon: <Trash2 />, category: 'Güvenlik' },
    { id: 'emergency', label: 'ACİL DURDURMA', icon: <Zap />, category: 'Güvenlik' },
    { id: 'apk', label: 'APK Olarak Derle', icon: <Layout />, category: 'Mobil' },
    { id: 'splitwise', label: 'Fatura Paylaştır', icon: <CreditCard />, category: 'Finans' },
  ];

  const filteredActions = actions.filter(action => 
    action.label.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredActions.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
      } else if (e.key === 'Enter') {
        if (filteredActions[selectedIndex]) {
          onSelectAction(filteredActions[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onSelectAction, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl glass-panel rounded-3xl overflow-hidden border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-6 py-4 border-b border-white/10 gap-4">
          <Search className="w-6 h-6 text-slate-500" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ne yapmak istiyorsunuz? (Örn: 'APK', 'Sıfırla', 'Harita')..."
            className="flex-1 bg-transparent border-none outline-none text-lg text-white font-medium"
          />
          <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest">Esc</div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
          {filteredActions.length > 0 ? (
            <div className="space-y-1">
              {filteredActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => {
                    onSelectAction(action.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    index === selectedIndex ? 'bg-blue-600 text-white parlement-glow' : 'hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${index === selectedIndex ? 'text-white' : 'text-blue-500'}`}>
                      {React.cloneElement(action.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-sm">{action.label}</span>
                      <span className="text-[10px] opacity-60 uppercase tracking-widest">{action.category}</span>
                    </div>
                  </div>
                  {index === selectedIndex && (
                    <div className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold">Enter</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p>Sonuç bulunamadı.</p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="flex gap-4">
            <span>↑↓ Gezin</span>
            <span>↵ Seç</span>
          </div>
          <span>Sınırsız Asistan CLI v1.0</span>
        </div>
      </div>
    </div>
  );
};
