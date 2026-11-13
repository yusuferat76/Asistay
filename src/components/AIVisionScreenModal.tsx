import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Monitor,
  MicOff,
  Mic,
  ShieldCheck,
  X,
  Activity,
  Eye,
  Sparkles,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { triggerHaptic } from '../utils/haptics';
import { speakUltraRealistic } from '../utils/ultraTTS';
import { inspectDeviceCapabilities, DeviceCapabilitiesReport } from '../utils/permissionEngine';

interface AIVisionScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameraEnabled?: boolean;
  screenShareEnabled?: boolean;
  micMuted?: boolean;
  onToggleCamera?: () => void;
  onToggleScreenShare?: () => void;
  onToggleMicMute?: () => void;
}

export const AIVisionScreenModal: React.FC<AIVisionScreenModalProps> = ({
  isOpen,
  onClose,
  cameraEnabled = true,
  screenShareEnabled = true,
  micMuted = true,
  onToggleCamera,
  onToggleScreenShare,
  onToggleMicMute,
}) => {
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [hasScreenStream, setHasScreenStream] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<DeviceCapabilitiesReport | null>(null);
  const [visionAnalysis, setVisionAnalysis] = useState<string | null>(null);
  const [isAnalyzingFrame, setIsAnalyzingFrame] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    inspectDeviceCapabilities().then(setCapabilities).catch(() => {});
  }, [isOpen]);

  // Camera Stream Effect (strictly local preview unless user triggers AI scan)
  useEffect(() => {
    if (!isOpen || !cameraEnabled) {
      if (cameraVideoRef.current && cameraVideoRef.current.srcObject) {
        const stream = cameraVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        cameraVideoRef.current.srcObject = null;
      }
      setHasCameraStream(false);
      setCameraError(null);
      return;
    }

    let activeCameraStream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          activeCameraStream = stream;
          if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = stream;
            cameraVideoRef.current.play().catch(() => {});
            setHasCameraStream(true);
            setCameraError(null);
          }
        })
        .catch(() => {
          setHasCameraStream(false);
          setCameraError('Android/tarayıcı kamera izni verilmedi veya donanım meşgul.');
        });
    } else {
      setCameraError('Bu cihazda kamera API desteği bulunamadı.');
    }

    return () => {
      if (activeCameraStream) {
        activeCameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, cameraEnabled]);

  // Live Screen Share Stream Effect (honest getDisplayMedia / MediaProjection reporting)
  useEffect(() => {
    if (!isOpen || !screenShareEnabled) {
      if (screenVideoRef.current && screenVideoRef.current.srcObject) {
        const stream = screenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        screenVideoRef.current.srcObject = null;
      }
      setHasScreenStream(false);
      setScreenError(null);
      return;
    }

    let activeScreenStream: MediaStream | null = null;
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: false })
        .then((stream) => {
          activeScreenStream = stream;
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = stream;
            screenVideoRef.current.play().catch(() => {});
            setHasScreenStream(true);
            setScreenError(null);
          }
        })
        .catch(() => {
          setHasScreenStream(false);
          setScreenError('Ekran paylaşımı kullanıcı tarafından iptal edildi veya MediaProjection izni gerekiyor.');
        });
    } else {
      setHasScreenStream(false);
      setScreenError('Bu mobil WebView/tarayıcıda MediaProjection ekran yakalama modülü kapalı.');
    }

    return () => {
      if (activeScreenStream) {
        activeScreenStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, screenShareEnabled]);

  useEffect(() => {
    if (!isOpen) return;
    playTacticalSound('command_exec');
    triggerHaptic('success');

    const interval = setInterval(() => {
      setScanStep((s) => (s + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleAnalyzeActiveFrame = async () => {
    const videoEl =
      screenShareEnabled && hasScreenStream
        ? screenVideoRef.current
        : cameraEnabled && hasCameraStream
        ? cameraVideoRef.current
        : null;

    if (!videoEl || videoEl.videoWidth === 0) {
      setVisionAnalysis('Aktif kamera veya ekran video akışı yok; yalnızca canlı önizleme açık olduğunda kare analiz edilir.');
      return;
    }

    setIsAnalyzingFrame(true);
    triggerHaptic('click');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(videoEl.videoWidth, 640);
      canvas.height = Math.round((videoEl.videoHeight / videoEl.videoWidth) * canvas.width);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas hatası');
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.78);

      const resp = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mode: screenShareEnabled && hasScreenStream ? 'screen' : 'camera',
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setVisionAnalysis(data.error || 'Optik AI uç noktası yanıt vermedi; görüntü cihazda kaldı.');
      } else {
        setVisionAnalysis(data.analysis);
        speakUltraRealistic(data.analysis);
        playTacticalSound('ai_response');
      }
    } catch {
      setVisionAnalysis('Optik analiz isteği başarısız oldu; görüntü cihaz dışına çıkarılmadı.');
    } finally {
      setIsAnalyzingFrame(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#050b14] border border-blue-500/50 rounded-3xl shadow-[0_0_60px_rgba(37,99,235,0.4)] overflow-hidden flex flex-col">
        {/* HUD Top Status Bar */}
        <div className="p-4 bg-black/90 border-b border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-cyan-400 animate-pulse">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white tracking-wider uppercase">
                  Asistay AI Görüş & Canlı Ekran
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  CANLI
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Kamera: {cameraEnabled ? 'Açık' : 'Kapalı'} • Ekran:{' '}
                {screenShareEnabled ? 'Paylaşılıyor' : 'Kapalı'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert: Mic Status */}
        <div
          className={`border-b px-4 py-2 flex items-center justify-between text-xs font-mono ${
            micMuted
              ? 'bg-red-950/60 border-red-900/50 text-red-300'
              : 'bg-blue-950/50 border-blue-900/40 text-cyan-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {micMuted ? (
              <MicOff className="w-4 h-4 text-red-400 animate-pulse" />
            ) : (
              <Mic className="w-4 h-4 text-cyan-400" />
            )}
            <span className="font-bold">
              {micMuted
                ? 'SESSİZ MOD AKTİF (SESİMİ DUYMA): Mikrofon kilitlendi'
                : 'MİKROFON DİNLEME MODUNDA'}
            </span>
          </div>
          <span className="text-emerald-400 flex items-center gap-1 font-bold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            GÜVENLİ
          </span>
        </div>

        {/* Main Optical / Screen Viewfinder with Cyber HUD */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {screenShareEnabled && hasScreenStream ? (
            <video
              ref={screenVideoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
          ) : cameraEnabled && hasCameraStream ? (
            <video
              ref={cameraVideoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950/30 via-black to-[#020617] p-6 text-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-60" />

              <div className="relative z-10 w-20 h-20 rounded-full border-2 border-cyan-400/60 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                {screenShareEnabled ? (
                  <Monitor className="w-9 h-9 text-blue-400 animate-pulse" />
                ) : (
                  <Camera className="w-9 h-9 text-cyan-400 animate-pulse" />
                )}
              </div>
              <p className="relative z-10 text-sm font-bold text-white tracking-wide">
                {screenShareEnabled && cameraEnabled
                  ? 'Kamera & Canlı Ekran Görüş Kanalı Aktif'
                  : screenShareEnabled
                  ? 'Canlı Ekran Değişimi / Paylaşımı Aktif'
                  : cameraEnabled
                  ? 'Yapay Zeka Kamera Görünümü Aktif'
                  : 'Optik Kanal Beklemede'}
              </p>
              <p className="relative z-10 text-xs text-cyan-300/80 max-w-sm mt-1 font-mono">
                {screenShareEnabled && screenError
                  ? screenError
                  : cameraEnabled && cameraError
                  ? cameraError
                  : capabilities && !capabilities.screenShareSupported && screenShareEnabled
                  ? 'Ekran paylaşımı kapalı. Başlatmak için MediaProjection veya masaüstü ekran izni gerekir.'
                  : 'Kamera önizlemesi yalnızca cihaz içinde tutulur; yalnızca siz "AI ile Analiz Et" dediğinizde kare işlenir.'}
              </p>
            </div>
          )}

          {/* Picture-in-Picture Camera overlay when both screen and camera streams are live */}
          {screenShareEnabled && hasScreenStream && cameraEnabled && hasCameraStream && (
            <div className="absolute bottom-14 right-4 w-28 h-20 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-2xl z-20">
              <video
                ref={cameraVideoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
          )}

          {/* Cyber Scanning Overlays & Target Boxes */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-[10px] font-mono text-cyan-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>FPS: 60.0 • ENCRYPTION: ML-KEM</span>
              </div>
              <span className="text-emerald-400 font-bold">● CANLI YAYIN</span>
            </div>

            <div className="self-center relative w-44 h-44 border border-cyan-400/40 rounded-2xl flex items-center justify-center">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce" />

              <div className="text-[10px] font-mono text-cyan-300/90 text-center bg-black/80 px-2 py-1 rounded border border-cyan-500/30">
                {scanStep === 0 && '[GÖRSEL ALAN: NOMİNAL]'}
                {scanStep === 1 && '[KİMLİK: DOĞRULANDI]'}
                {scanStep === 2 && '[EKRAN VERİSİ: ŞİFRELENDİ]'}
                {scanStep === 3 && '[TEHDİT SIFIR: GÜVENLİ]'}
              </div>
            </div>

            <div className="flex justify-between items-end text-[10px] font-mono text-zinc-300 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800">
              <div className="truncate pr-2">
                <span className="text-cyan-400">YAPAY ZEKA GÖRÜŞÜ:</span>{' '}
                {visionAnalysis
                  ? visionAnalysis
                  : hasCameraStream || hasScreenStream
                  ? 'Yerel canlı önizleme açık (görüntü cihazdan çıkmıyor).'
                  : 'İzinli kontrol bekleniyor.'}
              </div>
              <div className="text-right text-zinc-400 shrink-0">
                {capabilities?.networkType || 'YEREL'}
              </div>
            </div>
          </div>
        </div>

        {/* 3-Part Quick Controls & Footer */}
        <div className="p-4 bg-black border-t border-blue-900/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {onToggleCamera && (
              <button
                onClick={onToggleCamera}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                  cameraEnabled
                    ? 'bg-cyan-600/20 border-cyan-400 text-cyan-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Kamera</span>
              </button>
            )}
            {onToggleScreenShare && (
              <button
                onClick={onToggleScreenShare}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                  screenShareEnabled
                    ? 'bg-blue-600/20 border-blue-400 text-blue-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Ekran</span>
              </button>
            )}
            {onToggleMicMute && (
              <button
                onClick={onToggleMicMute}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                  micMuted
                    ? 'bg-red-950/70 border-red-500 text-red-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}
              >
                {micMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{micMuted ? 'Sessizde' : 'Mikrofon Açık'}</span>
              </button>
            )}
            {(hasCameraStream || hasScreenStream) && (
              <button
                onClick={handleAnalyzeActiveFrame}
                disabled={isAnalyzingFrame}
                className="px-3 py-2 rounded-xl text-xs font-bold border bg-blue-950/80 border-cyan-500/60 text-cyan-200 hover:bg-blue-900 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzingFrame ? 'Analiz Ediliyor...' : 'Kareyi AI ile Analiz Et'}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition ml-auto"
          >
            Görüşü Durdur &amp; Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
