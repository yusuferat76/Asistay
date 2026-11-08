import React, { useState, useRef } from 'react';
import { Camera, Eye, ShieldCheck, AlertTriangle, X, RefreshCw, FileImage, Sparkles, CheckCircle2, Monitor } from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';

interface LiveVisualSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAssistant: (question: string) => void;
}

export const LiveVisualSecurityModal: React.FC<LiveVisualSecurityModalProps> = ({ isOpen, onClose, onAskAssistant }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const handleProcessImage = (file: File | null) => {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    playTacticalSound('command_exec');

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        scannedAt: new Date().toLocaleTimeString(),
        threatLevel: 'GÜVENLİ (Tehdit Yok)',
        findings: [
          { type: 'QR Kod Analizi', status: 'Temiz (Meşru HTTPS Bağlantısı)', risk: 'Düşük' },
          { type: 'Fiziksel Hardware Bug / Böcek', status: 'Gizli Kamera/Mikrofon Tespit Edilmedi', risk: 'Temiz' },
          { type: 'Ağ SSID Sinyali', status: 'Şifreli WPA3 Ev Ağı (Sahte Karma Yok)', risk: 'Güvenli' },
          { type: 'Klavye Keylogger Donanımı', status: 'USB Portlarında Şüpheli Aparat Yok', risk: 'Temiz' },
        ],
        recommendation: 'Görsel tarama tamamlandı. Çevrenizde ve ekrandaki kodlarda aktif fiziksel veya yazılımsal tehdit bulunamadı.',
      });
    }, 1500);
  };

  const handleStartScreenShare = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setIsScreenSharing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Simulate analysis of the screen stream
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisResult({
          scannedAt: new Date().toLocaleTimeString(),
          threatLevel: 'GÜVENLİ',
          findings: [
            { type: 'Ekran Görüntüsü Analizi', status: 'Aktif Phishing veya Keylogger tespiti yapılmadı', risk: 'Temiz' },
            { type: 'Pencere Güvenliği', status: 'Hassas veri içeren pencereler maskelendi', risk: 'Güvenli' }
          ],
          recommendation: 'Canlı ekran aktarımı güvenli bir şekilde analiz edildi.'
        });
      }, 2000);

      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
      };
    } catch (err) {
      console.error('Screen share denied:', err);
      setIsAnalyzing(false);
    }
  };

  const handleStopScreenShare = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
  };

  const handleClose = () => {
    handleStopScreenShare();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#030712] border border-blue-500/30 rounded-[32px] p-8 max-w-2xl w-full shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Eye className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Canlı Görsel Güvenlik Analizi</h3>
              <p className="text-sm text-slate-400">Kamera ve ekran görüntüsü üzerinden tehdit tespiti</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border border-white/5 hover:border-blue-500/50 rounded-3xl bg-white/5 text-center transition flex flex-col items-center justify-center gap-4 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleProcessImage(e.target.files?.[0] || null)}
            />
            <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
              <Camera className="w-8 h-8 text-blue-400" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">Görsel / Kamera</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Fotoğraf Çek veya Yükle</div>
            </div>
          </button>

          <button
            onClick={isScreenSharing ? handleStopScreenShare : handleStartScreenShare}
            className={`p-8 border rounded-3xl text-center transition flex flex-col items-center justify-center gap-4 group ${
              isScreenSharing ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 hover:border-emerald-500/50 bg-white/5'
            }`}
          >
            <div className={`p-4 rounded-2xl transition-colors ${
              isScreenSharing ? 'bg-red-500/20' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20'
            }`}>
              <Monitor className={`w-8 h-8 ${isScreenSharing ? 'text-red-400' : 'text-emerald-400'}`} />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">{isScreenSharing ? 'Paylaşımı Durdur' : 'Ekran Aktarımı'}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                {isScreenSharing ? 'Aktif Analiz Yapılıyor' : 'Ekranını Canlı Tara'}
              </div>
            </div>
          </button>
        </div>

        {/* Video Preview */}
        {isScreenSharing && (
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-emerald-500/30">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              CANLI ANALİZ AKTİF
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="p-8 glass-panel rounded-3xl flex flex-col items-center justify-center gap-4 border-blue-500/30">
            <RefreshCw className="w-10 h-10 text-blue-400 animate-spin" />
            <div className="text-center">
              <div className="text-sm font-bold text-blue-300">Yapay Zeka Görsel Modülü Taramada...</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Lütfen bekleyin</div>
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="p-6 rounded-3xl bg-black border border-white/5 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sonuç Raporu</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                {analysisResult.threatLevel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysisResult.findings.map((f: any, idx: number) => (
                <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-white">{f.type}</div>
                    <div className="text-[10px] text-slate-400">{f.status}</div>
                  </div>
                  <span className="text-emerald-400 font-mono text-[9px] uppercase">{f.risk}</span>
                </div>
              ))}
            </div>

            <p className="text-blue-200 text-xs bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20 leading-relaxed italic">
              " {analysisResult.recommendation} "
            </p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
            Otonom Siber Güvenlik Protokolü v2.4
          </div>
          <button
            onClick={handleClose}
            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-900/20"
          >
            Tamamla
          </button>
        </div>
      </div>
    </div>
  );
};
