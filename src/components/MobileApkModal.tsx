import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';

interface MobileApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileApkModal: React.FC<MobileApkModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if running standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert(
        'Android cihazınızda Chrome veya Edge kullanıyorsanız, sağ üstteki üç noktaya dokunup "Ana ekrana ekle" veya "Uygulamayı yükle" seçeneğini seçebilirsiniz.'
      );
      return;
    }

    try {
      setIsInstalling(true);
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDownloadManifest = () => {
    const manifest = {
      name: 'Sınırsız Siber Asistan',
      short_name: 'SiberAsistan',
      start_url: '/',
      display: 'standalone',
      background_color: '#030712',
      theme_color: '#030712',
      description: 'Sıfır maliyetli, yerel Türkçe sesli siber güvenlik ve akıllı asistan.',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#070e24] border border-blue-500/60 rounded-2xl shadow-2xl p-6 text-white overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Android APK & Mobil Kurulum</h3>
              <p className="text-xs text-blue-300/80">Telefonunuzda Yerel & Tam Ekran Çalıştırın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-blue-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status card */}
        <div className="mt-5 space-y-4">
          <div className="p-4 rounded-xl bg-[#0a1534] border border-blue-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                PWA / TWA Mobil APK Uyumluluğu
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                TAM DESTEK
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bu uygulama Progressive Web App (PWA) ve Trusted Web Activity (TWA) mimarisinde hazırlanmıştır. Android telefonunuza kurduğunuzda bağımsız bir APK gibi uygulama çekmecenizde görünür ve tam ekran çalışır.
            </p>

            <button
              onClick={handleInstallPWA}
              disabled={isInstalling || isInstalled}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white shadow-blue-950/60 border border-blue-400/50 disabled:opacity-50"
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>CİHAZDA YÜKLÜ MODDA</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>TELEFONA DOĞRUDAN YÜKLE (APK / PWA)</span>
                </>
              )}
            </button>
          </div>

          {/* Android Manual Install Steps */}
          <div className="p-3.5 rounded-xl bg-[#040814] border border-blue-900/50 text-xs space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Android Cihazda 2 Adımda Kurulum:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
              <li>Chrome tarayıcınızda sağ üst köşedeki <strong className="text-white">üç noktaya (⋮)</strong> dokunun.</li>
              <li><strong className="text-blue-300">"Ana Ekrana Ekle"</strong> veya <strong className="text-blue-300">"Uygulamayı Yükle"</strong> butonuna basın.</li>
              <li>Uygulama telefonunuza tıpkı bir APK gibi kurulacak ve masaüstünüze simge eklenecektir.</li>
            </ol>
          </div>

          {/* Sideload & TWA Builder info */}
          <div className="pt-2 flex items-center justify-between gap-3 text-xs">
            <button
              onClick={handleDownloadManifest}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900 text-blue-200 border border-blue-800 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Manifest.json İndir</span>
            </button>

            <span className="text-[11px] text-slate-400">
              Sıfır kota • Çevrimdışı önbellek hazır
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
