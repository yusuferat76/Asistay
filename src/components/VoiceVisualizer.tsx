import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Mic, RefreshCw, Lock } from 'lucide-react';

export const VoiceVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [micStatus, setMicStatus] = useState<'idle' | 'active' | 'denied'>('idle');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (micStatus !== 'active') return;

    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let dataArray: Uint8Array;
    let animationId: number;
    let stream: MediaStream;

    const setupAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 64;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        draw();
      } catch (err) {
        console.warn('Mic access denied:', err);
        setMicStatus('denied');
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !analyser) return;

      analyser.getByteFrequencyData(dataArray as any);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const scale = 0.5 + (average / 128);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 20 * scale;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e3a8a';
      ctx.fill();
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#2563eb';
      
      animationId = requestAnimationFrame(draw);
    };

    setupAudio();

    return () => {
      cancelAnimationFrame(animationId);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (audioContext) audioContext.close();
    };
  }, [micStatus, retryCount]);

  const handleStart = () => {
    setMicStatus('active');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setMicStatus('active');
  };

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
      <canvas 
        ref={canvasRef} 
        width={100} 
        height={100} 
        className={`${micStatus === 'active' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      />
      
      {micStatus === 'denied' && (
        <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-right duration-300 pointer-events-auto">
          <div className="w-[100px] h-[100px] flex items-center justify-center bg-red-950/80 border border-red-500 rounded-full text-red-400 shadow-2xl shadow-red-900/40">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
          <div className="glass-panel p-4 rounded-2xl border-red-500/30 max-w-[200px] text-center space-y-3">
            <p className="text-[10px] font-bold text-red-300 uppercase tracking-widest">Erişim Engellendi</p>
            <p className="text-[9px] text-slate-400 leading-tight">
              Mikrofon erişimi tarayıcı tarafından reddedildi. Lütfen adres çubuğundaki <Lock className="inline w-2 h-2" /> simgesine tıklayıp izni "İzin Ver" olarak değiştirin.
            </p>
            <button 
              onClick={handleRetry}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-bold text-white transition-all active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {micStatus === 'idle' && (
        <button 
          onClick={handleStart}
          className="w-[100px] h-[100px] flex flex-col items-center justify-center bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/20 hover:border-blue-500/40 rounded-full text-blue-400 transition-all pointer-events-auto group"
        >
          <Mic className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-bold mt-1 uppercase tracking-tighter opacity-60">Sistemi Başlat</span>
        </button>
      )}
    </div>
  );
};
