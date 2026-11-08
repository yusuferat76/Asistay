import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Code, Image as ImageIcon, FileText, Play, Check, X } from 'lucide-react';

interface DevConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  onIntegrate: (code: string) => void;
}

export const DevConsole: React.FC<DevConsoleProps> = ({ isOpen, onClose, onIntegrate }) => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<{ type: 'cmd' | 'resp' | 'sys', text: string }[]>([
    { type: 'sys', text: 'Geliştirme Konsolu v2.4.0 Başlatıldı.' },
    { type: 'sys', text: 'Sistem komutlarını veya entegrasyon kodlarını bekliyor...' }
  ]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    
    setLogs(prev => [...prev, { type: 'cmd', text: input }]);
    
    // Simulate AI integration processing
    setTimeout(() => {
      if (input.toLowerCase().includes('preview')) {
        setIsPreviewMode(true);
        setLogs(prev => [...prev, { type: 'resp', text: 'Canlı önizleme modu aktif. Değişiklikleri onaylayın.' }]);
      } else {
        setLogs(prev => [...prev, { type: 'resp', text: 'İşlem tamamlandı. Modül kuyruğa alındı.' }]);
      }
    }, 600);
    
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[80vh] glass-panel rounded-[32px] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 font-mono text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4" /> GELİŞTİRME KONSOLU
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Terminal View */}
          <div className="flex-1 flex flex-col p-6 font-mono text-sm overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className={`flex gap-3 ${
                  log.type === 'cmd' ? 'text-blue-400' : 
                  log.type === 'resp' ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  <span className="opacity-40 shrink-0">{log.type === 'cmd' ? '>' : log.type === 'resp' ? '::' : '#'}</span>
                  <span className="break-all">{log.text}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex gap-4 items-center bg-black/40 p-1 rounded-2xl border border-white/10">
              <div className="flex gap-1 ml-2">
                <button title="Kod Gönder" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400">
                  <Code className="w-4 h-4" />
                </button>
                <button title="Görsel Gönder" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-emerald-400">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button title="Dosya Gönder" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-amber-400">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Komut veya kod parçasını buraya girin..."
                className="flex-1 bg-transparent border-none outline-none text-white py-3 px-2 text-sm"
              />
              <button 
                onClick={handleSend}
                className="mr-1 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Preview Pane */}
          {isPreviewMode && (
            <div className="w-full max-w-xs md:max-w-md border-l border-white/10 bg-white/5 p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" /> CANLI ÖNİZLEME
                </h4>
                <button onClick={() => setIsPreviewMode(false)} className="text-[10px] text-slate-500 hover:text-white uppercase font-bold underline">
                  Kapat
                </button>
              </div>
              
              <div className="flex-1 glass-panel rounded-2xl border-emerald-500/30 p-4 flex flex-col gap-4 overflow-y-auto">
                <div className="w-full aspect-video bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-emerald-400">KOMUT ANALİZİ AKTİF</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="h-4 w-1/2 bg-white/10 rounded" />
                  <div className="h-20 w-full bg-white/5 rounded" />
                </div>
              </div>

              <button 
                onClick={() => {
                  onIntegrate(logs[logs.length-1].text);
                  setIsPreviewMode(false);
                  setLogs(prev => [...prev, { type: 'sys', text: 'Değişiklikler sisteme entegre edildi.' }]);
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
              >
                <Check className="w-5 h-5" /> SİSTEME ENTEGRE ET
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
