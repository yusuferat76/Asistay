import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Terminal,
  Zap,
  Info,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface MobileApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileApkModal: React.FC<MobileApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (!isInstallable) {
      if (isIOS) {
        alert('iOS cihazlarda Safari "Paylaş" menüsünden "Ana Ekrana Ekle" seçeneğini kullanın.');
      } else {
        alert(
          'Android cihazınızda Chrome kullanıyorsanız, sağ üstteki üç noktaya dokunup "Uygulamayı yükle" seçeneğini seçebilirsiniz.'
        );
      }
      return;
    }

    try {
      setIsInstalling(true);
      await install();
    } catch (err) {
      console.error(err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#030712] border border-blue-500/30 rounded-[32px] shadow-2xl p-8 text-white overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Mobil Kurulum</h3>
              <p className="text-sm text-slate-400">Telefonunuza APK olarak yükleyin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status card */}
        <div className="mt-8 space-y-6">
          <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                WEBAPK / PWA TEKNOLOJİSİ
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AKTİF
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Bu uygulama <span className="text-white font-bold">Progressive Web App (PWA)</span> standartlarındadır. Yüklendiğinde internet tarayıcısı olmadan, tıpkı bir <span className="text-blue-400 font-bold">Android APK</span> gibi tam ekran ve yüksek performansla çalışır.
            </p>

            <button
              onClick={handleInstallPWA}
              disabled={isInstalling || isInstalled}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>SİSTEMDE YÜKLÜ</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                  <span>ŞİMDİ TELEFONA YÜKLE</span>
                </>
              )}
            </button>
          </div>

          {/* Android Manual Install Steps */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-3">
            <div className="font-bold text-sm text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>Tek Tıkla APK Oluşturucu (Açık Kaynak & Ücretsiz):</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">ÜCRETSİZ</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-normal">
              Bu PWA kod tabanını doğrudan bağımsız imzalı bir Android <strong className="text-white">.apk</strong> paketine dönüştürmek için terminalinizde çalıştırabileceğiniz resmi Google / Microsoft araçları:
            </p>

            <div className="p-2.5 rounded-xl bg-black border border-blue-900/40 font-mono text-[11px] text-blue-300 space-y-1">
              <div className="text-gray-400 text-[10px]"># Google Bubblewrap CLI ile APK üretimi:</div>
              <div className="text-emerald-400 select-all">npx @bubblewrap/cli init --manifest=manifest.webmanifest</div>
              <div className="text-emerald-400 select-all">npx @bubblewrap/cli build</div>
            </div>

            <div className="text-[10px] font-mono text-slate-400">
              Alternatif olarak <span className="text-blue-300 font-bold">PWABuilder.com</span> adresine uygulama linkini girerek tek tıkla imzalı APK ve AAB (Google Play) paketini ücretsiz indirebilirsiniz.
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <Info className="w-3.5 h-3.5" />
            <span>Sıfır kota kullanımı & Tamamen yerel çevrimdışı çalışma desteği</span>
          </div>
        </div>
      </div>
    </div>
  );
};
