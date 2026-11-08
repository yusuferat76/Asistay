import React, { useState } from 'react';
import { ShieldAlert, Search, Database, AlertCircle, CheckCircle } from 'lucide-react';

export const BreachCheckerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    breaches: { name: string; date: string; leakedData: string[]; severity: string }[];
  } | null>(null);

  const handleCheck = () => {
    if (!query) return;
    setIsSearching(true);
    setTimeout(() => {
      // Offline / Local database check simulation
      if (query.includes('test') || query.includes('admin') || query.includes('123') || query.includes('gmail')) {
        setResult({
          found: true,
          breaches: [
            { name: 'Collection #1 Mega Breach', date: '2023-11-14', leakedData: ['E-posta', 'MD5 Şifre', 'Kullanıcı Adı'], severity: 'YÜKSEK' },
            { name: 'Global E-Commerce Database Leak', date: '2024-03-20', leakedData: ['E-posta', 'Telefon Numarası', 'IP Adresi'], severity: 'ORTA' },
          ],
        });
      } else {
        setResult({
          found: false,
          breaches: [],
        });
      }
      setIsSearching(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl border border-indigo-900/60 bg-black p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-950 p-2.5 text-indigo-400 border border-indigo-700/50">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">Dark Web & Breach Checker</h2>
              <p className="text-xs text-indigo-300">E-posta ve Veri İhlali Sızıntı Kontrolörü</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            Kapat
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="E-posta Adresinizi veya Kullanıcı Adınızı Girin..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full rounded-xl border border-indigo-900/60 bg-gray-950 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleCheck}
              disabled={isSearching}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shrink-0"
            >
              <Search className="h-4 w-4" /> {isSearching ? 'Aranıyor...' : 'Sızıntı Ara'}
            </button>
          </div>

          {result && (
            <div className="space-y-3">
              {result.found ? (
                <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="font-bold text-sm">DIKKAT: Verileriniz {result.breaches.length} Farklı İhlalde Bulundu!</span>
                  </div>

                  <div className="space-y-2">
                    {result.breaches.map((b, i) => (
                      <div key={i} className="rounded-lg bg-black p-3 text-xs border border-red-900/40">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{b.name}</span>
                          <span className="text-[10px] text-gray-400">{b.date}</span>
                        </div>
                        <p className="text-[11px] text-red-300 mt-1">Sızan Veriler: {b.leakedData.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-4 flex items-center gap-3 text-emerald-400">
                  <CheckCircle className="h-6 w-6 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">GÜVENLİ: Herhangi Bir Sızıntı Bulunamadı</p>
                    <p className="text-xs text-emerald-200">Girdiğiniz adres bilinen Dark Web sızıntı listelerinde yer almıyor.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
