import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone, X, Info } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all animate-pulse"
      >
        <Download className="w-4 h-4" />
        Uygulamayı Yükle
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-400 hover:bg-blue-500/20 transition-all"
        >
          <Smartphone className="w-4 h-4" />
          iOS'a Yükle
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-[32px] glass-panel p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Smartphone className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">iOS Kurulumu</h3>
                </div>
                <button onClick={() => setShowIOSGuide(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-6 text-slate-300">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 font-bold text-blue-400">1</div>
                  <p className="text-sm pt-1">Safari alt araç çubuğundaki <span className="text-white font-bold inline-flex items-center mx-1 underline decoration-blue-500">Paylaş</span> butonuna dokunun.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 font-bold text-blue-400">2</div>
                  <p className="text-sm pt-1">Listeyi aşağı kaydırın ve <span className="text-white font-bold inline-flex items-center mx-1 underline decoration-blue-500">Ana Ekrana Ekle</span> seçeneğini seçin.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-8 w-full rounded-2xl bg-white/10 py-4 text-sm font-bold text-white hover:bg-white/20 transition-all"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/5 text-[10px] text-slate-400">
      <Info className="w-3 h-3" />
      Yüklemek için Chrome veya Safari kullanın
    </div>
  );
};
