import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Terminal,
  Zap,
  Info,
  Package,
  GitBranch,
  RefreshCw,
  ExternalLink,
  Star,
  Copy,
  Check,
  Link2,
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { triggerHaptic } from '../utils/haptics';
import { playTacticalSound } from '../utils/audioEffects';

interface MobileApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GitHubRepoResult {
  repo: {
    fullName: string;
    description: string;
    stars: number;
    defaultBranch: string;
    updatedAt: string;
    htmlUrl: string;
    language: string;
  };
  commit?: {
    sha: string;
    fullSha: string;
    message: string;
    date: string;
  } | null;
  treeFileCount?: number;
  snapshotDownloadUrl?: string;
  apkAssets: Array<{
    tag: string;
    name: string;
    sizeMb: string;
    downloadUrl: string;
  }>;
}

interface AndroidBundleStatus {
  packageId: string;
  version: string;
  distBuildReady: boolean;
  aiModelConnected?: boolean;
  referenceSnapshotCached?: boolean;
  twaManifest: Record<string, any> | null;
  workflowYaml: string;
}

export const MobileApkModal: React.FC<MobileApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [githubInput, setGithubInput] = useState('yusuferat76/Asistay');
  const [isFetchingRepo, setIsFetchingRepo] = useState(false);
  const [repoResult, setRepoResult] = useState<GitHubRepoResult | null>(null);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [bundleStatus, setBundleStatus] = useState<AndroidBundleStatus | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customApkInput, setCustomApkInput] = useState<string>(() => {
    try {
      return window.localStorage.getItem('asistay_custom_apk_url') || '';
    } catch {
      return '';
    }
  });
  const [savedApkUrl, setSavedApkUrl] = useState<string>(() => {
    try {
      return window.localStorage.getItem('asistay_custom_apk_url') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/android/build-bundle')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setBundleStatus(data);
        }
      })
      .catch(() => {});

    fetch('/api/github/repo?url=yusuferat76%2FAsistay&ref=7670220')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setRepoResult(data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    triggerHaptic('click');
    if (!isInstallable) {
      if (isIOS) {
        setStatusMessage('iOS Safari: Alt menüdeki "Paylaş" > "Ana Ekrana Ekle" adımını kullanın.');
      } else {
        setStatusMessage(
          'Android Chrome: Sağ üstteki üç nokta menüsünden "Uygulamayı yükle" (WebAPK) seçeneğine dokunun.'
        );
      }
      return;
    }

    try {
      setIsInstalling(true);
      await install();
      playTacticalSound('command_exec');
      setStatusMessage('WebAPK kurulum istemi başlatıldı.');
    } catch {
      setStatusMessage('Tarayıcı menüsünden "Uygulamayı yükle" seçeneğini kullanabilirsiniz.');
    } finally {
      setIsInstalling(false);
    }
  };

  const triggerFileDownload = (filename: string, content: string, mime = 'application/json') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTwaPackage = () => {
    triggerHaptic('success');
    playTacticalSound('command_exec');

    const twaConfig = bundleStatus?.twaManifest || {
      packageId: 'com.asistay.security.app',
      host: window.location.host,
      name: 'Asistay',
      launcherName: 'Asistay',
      display: 'standalone',
      themeColor: '#000000',
      backgroundColor: '#000000',
      startUrl: '/',
      webManifestUrl: `${window.location.origin}/manifest.webmanifest`,
    };

    triggerFileDownload('twa-manifest.json', JSON.stringify(twaConfig, null, 2));
    if (bundleStatus?.workflowYaml) {
      triggerFileDownload('android-apk.yml', bundleStatus.workflowYaml, 'text/yaml');
    }
    setStatusMessage(
      'WebDev Android TWA manifesti (twa-manifest.json) ve GitHub Actions APK derleme dosyası (android-apk.yml) indirildi.'
    );
  };

  const handleSyncGithubSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubInput.trim()) return;

    setIsFetchingRepo(true);
    setRepoError(null);
    triggerHaptic('click');

    try {
      const resp = await fetch(
        `/api/github/repo?url=${encodeURIComponent(githubInput.trim())}`
      );
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setRepoError(data.error || 'GitHub deposu alınamadı.');
        setRepoResult(null);
      } else {
        setRepoResult(data);
        playTacticalSound('ai_response');
        setStatusMessage(
          `GitHub kaynağı bağlandı: ${data.repo.fullName} (${data.repo.defaultBranch})`
        );
      }
    } catch {
      setRepoError('GitHub sunucusuna bağlanırken hata oluştu.');
    } finally {
      setIsFetchingRepo(false);
    }
  };

  const copyLink = async (id: string, relativePath: string) => {
    const fullUrl = relativePath.startsWith('http')
      ? relativePath
      : `${window.location.origin}${relativePath}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      triggerHaptic('click');
      setCopiedId(id);
      setStatusMessage(`Bağlantı kopyalandı: ${fullUrl}`);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {
      setStatusMessage(`Doğrudan Link: ${fullUrl}`);
    }
  };

  const handleSaveCustomApkLink = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customApkInput.trim();
    try {
      if (cleaned) {
        window.localStorage.setItem('asistay_custom_apk_url', cleaned);
        setSavedApkUrl(cleaned);
        setStatusMessage('Özel APK indirme linki uygulamaya kalıcı olarak eklendi.');
        playTacticalSound('ai_response');
      } else {
        window.localStorage.removeItem('asistay_custom_apk_url');
        setSavedApkUrl('');
        setStatusMessage('Özel APK bağlantısı temizlendi.');
      }
    } catch {
      setSavedApkUrl(cleaned);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#050b14] border border-blue-500/40 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.3)] p-5 sm:p-6 text-white no-scrollbar">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                GitHub & WebDev Android APK Merkezi
              </h3>
              <p className="text-xs text-zinc-400">
                GitHub kaynak entegrasyonu ve kuruluma hazır Android paketi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* 1. GitHub Source Integration */}
          <div className="p-4 rounded-2xl bg-black/70 border border-blue-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                GITHUB KAYNAK ENTEGRASYONU
              </span>
              <span className="text-[10px] font-mono text-zinc-400">API v3 CANLI</span>
            </div>

            <form onSubmit={handleSyncGithubSource} className="flex gap-2">
              <input
                type="text"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                placeholder="kullanici/depo veya https://github.com/..."
                className="flex-1 bg-[#030712] border border-blue-800/60 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={isFetchingRepo || !githubInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRepo ? 'animate-spin' : ''}`} />
                <span>Bağla</span>
              </button>
            </form>

            {repoError && (
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-700/60 text-xs font-mono text-red-300">
                {repoError}
              </div>
            )}

            {repoResult && (
              <div className="p-3 rounded-xl bg-[#040a14] border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                    {repoResult.repo.fullName}
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {repoResult.repo.stars}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">{repoResult.repo.description}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300">
                  <span>
                    Dal: {repoResult.repo.defaultBranch}
                    {repoResult.commit?.sha ? ` • ${repoResult.commit.sha}` : ''}
                  </span>
                  <span>
                    {repoResult.treeFileCount
                      ? `${repoResult.treeFileCount} Dosya • ${repoResult.repo.language}`
                      : `Dil: ${repoResult.repo.language}`}
                  </span>
                </div>

                {repoResult.snapshotDownloadUrl && (
                  <a
                    href={repoResult.snapshotDownloadUrl}
                    download="Asistay-GitHub-main.zip"
                    className="mt-1 flex items-center justify-between p-2 rounded-lg bg-blue-950/60 border border-blue-600/50 hover:bg-blue-900/60 text-xs text-cyan-200 transition"
                  >
                    <span className="font-mono truncate">
                      Referans Arşivi: Asistay-GitHub-main.zip
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[11px] shrink-0 ml-2">
                      İndir
                      <Download className="w-3 h-3" />
                    </span>
                  </a>
                )}

                {repoResult.apkAssets.length > 0 && (
                  <div className="pt-2 border-t border-blue-900/40 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                      BULUNAN HAZIR APK SÜRÜMLERİ:
                    </span>
                    {repoResult.apkAssets.map((apk, idx) => (
                      <a
                        key={idx}
                        href={apk.downloadUrl}
                        download={apk.name}
                        className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-600/50 hover:bg-emerald-900/40 text-xs text-emerald-200 transition"
                      >
                        <span className="font-mono truncate">
                          {apk.name} ({apk.tag})
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[11px] shrink-0 ml-2">
                          {apk.sizeMb} MB
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. WebDev Android Build Status & Direct Install */}
          <div className="p-4 rounded-2xl bg-black/70 border border-blue-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                WEBDEV ANDROID BUILD & WEBAPK
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  bundleStatus?.distBuildReady
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700/60'
                    : 'bg-blue-950 text-blue-300 border-blue-700/60'
                }`}
              >
                {bundleStatus?.distBuildReady ? 'DIST PAKETİ HAZIR' : 'TWA YAPILANDIRILDI'}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Proje <span className="text-white font-bold">com.asistay.security.app</span> kimliği
              ile WebDev Android TWA & GitHub Actions APK derlemesi için yapılandırılmıştır.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleInstallPWA}
                disabled={isInstalling || isInstalled}
                className="py-3 px-4 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50"
              >
                {isInstalled ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Cihazda Yüklü</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Anında Cihaza Kur (WebAPK)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadTwaPackage}
                className="py-3 px-4 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 bg-blue-950/70 hover:bg-blue-900/70 text-cyan-300 border border-cyan-500/40"
              >
                <Package className="w-4 h-4" />
                <span>Android Build Dosyalarını İndir</span>
              </button>
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-blue-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-200 leading-relaxed">
                {statusMessage}
              </div>
            )}
          </div>

          {/* 3. Direct File Links & Custom APK Link Attachment */}
          <div className="p-4 rounded-2xl bg-black/60 border border-blue-900/40 space-y-3">
            <div className="font-bold text-xs text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-cyan-400" />
                <span>Doğrudan Dosya Linkleri &amp; Uygulamaya Ekleme</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">HAZIR LİNKLER</span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono">
              {[
                {
                  id: 'zip',
                  label: 'Asistay-GitHub-main.zip (9.4 MB Kaynak)',
                  href: '/api/github/snapshot?repo=yusuferat76%2FAsistay&ref=7670220',
                  filename: 'Asistay-GitHub-main.zip',
                },
                {
                  id: 'twa',
                  label: 'twa-manifest.json (Android Paket Ayarı)',
                  href: '/api/android/file/twa-manifest.json',
                  filename: 'twa-manifest.json',
                },
                {
                  id: 'yml',
                  label: 'android-apk.yml (.github/workflows)',
                  href: '/api/android/file/android-apk.yml',
                  filename: 'android-apk.yml',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#02050a] border border-blue-900/40"
                >
                  <a
                    href={item.href}
                    download={item.filename}
                    className="text-cyan-300 hover:text-white truncate flex-1 flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => copyLink(item.id, item.href)}
                    className="px-2 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 text-[10px] text-blue-200 flex items-center gap-1 shrink-0"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Linki Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Bind custom direct .apk URL onto the app */}
            <form onSubmit={handleSaveCustomApkLink} className="pt-2 border-t border-blue-900/30 space-y-2">
              <label className="block text-[10px] font-mono text-zinc-400">
                Uygulamanın Üstüne Özel .APK Linki Bağla (GitHub Release / Drive / Doğrudan URL):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customApkInput}
                  onChange={(e) => setCustomApkInput(e.target.value)}
                  placeholder="https://github.com/yusuferat76/Asistay/releases/latest/download/app-release.apk"
                  className="flex-1 bg-[#030712] border border-blue-800/60 rounded-xl px-3 py-2 text-[11px] font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition"
                >
                  Bağla
                </button>
              </div>
              {savedApkUrl && (
                <a
                  href={savedApkUrl}
                  download="Asistay-Release.apk"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/60 text-xs text-emerald-200 hover:bg-emerald-900/50 transition"
                >
                  <span className="font-bold truncate">Bağlı APK İndir: {savedApkUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
                </a>
              )}
            </form>

            <div className="p-2.5 rounded-xl bg-[#02050a] border border-blue-900/40 font-mono text-[10px] text-zinc-400 space-y-1 leading-relaxed">
              <div className="text-white font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>GitHub&apos;a Ekleyip Otomatik .APK Üretme:</span>
              </div>
              <div>1. Yukarıdaki <span className="text-cyan-300">Asistay-GitHub-main.zip</span> dosyasını indirip açın.</div>
              <div>2. GitHub deponuza (<span className="text-cyan-300">yusuferat76/Asistay</span>) push edin.</div>
              <div>3. <span className="text-emerald-400">.github/workflows/android-apk.yml</span> otomatik .APK üretir.</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 font-medium">
            <Info className="w-3.5 h-3.5" />
            <span>Bulut ortamında Android SDK bulunmadığından imzalı .APK derlemesi GitHub Actions veya yerel SDK üzerinden tamamlanır.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
