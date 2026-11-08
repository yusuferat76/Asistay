import React, { useState, useEffect } from 'react';
import { Download, Smartphone, ShieldCheck, CheckCircle2, Moon, Zap, ExternalLink } from 'lucide-react';

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert('Android Chrome / Edge menüsünden "Ana Ekrana Ekle" veya "Uygulamayı Yükle" seçeneğine dokunarak yükleyebilirsiniz.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl border border-blue-900/60 bg-black p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-950 p-2.5 text-blue-400 border border-blue-700/50">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">Android APK & PWA Yükleme Rehberi</h2>
              <p className="text-xs text-blue-300">Uygulamayı Doğrudan Telefonunuza Yükleyin</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            Kapat
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {isInstalled ? (
            <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-4 flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Uygulama Zaten Yüklü!</p>
                <p className="text-xs text-emerald-200">Telefonunuzda standalone APK / WebAPK modunda tam performansla çalışıyor.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-blue-900/40 bg-gray-950 p-5 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                <Smartphone className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Tek Tıkla Android Kurulumu</h3>
                <p className="mt-1 text-xs text-gray-400">
                  Uygulama WebAPK standartlarına tam uygundur. Kurulduğunda telefonunuzun uygulama menüsünde yerel Android APK olarak çalışır.
                </p>
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Android Uygulamasını (APK/PWA) Şimdi İndir & Kur
              </button>
            </div>
          )}

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-300 uppercase">Manuel Kurulum Adımları (Chrome / Edge):</h4>
            <ol className="text-xs text-gray-400 space-y-1.5 list-decimal pl-4">
              <li>Tarayıcının sağ üst köşesindeki **üç nokta (⋮)** menüsüne dokunun.</li>
              <li>**"Ana Ekrana Ekle"** veya **"Uygulamayı Yükle"** butonunu seçin.</li>
              <li>Uygulama simgesi anında telefonunuzun ana ekranına yerleşecektir.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
