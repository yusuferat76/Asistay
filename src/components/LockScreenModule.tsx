import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mic, Shield, Zap, Power, Volume2 } from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { speakUltraRealistic } from '../utils/ultraTTS';

interface LockScreenModuleProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAssistant: (text: string) => void;
}

export const LockScreenModule: React.FC<LockScreenModuleProps> = ({
  isOpen,
  onClose,
  onTriggerAssistant,
}) => {
  const [time, setTime] = useState(new Date());
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState('Sistemi uyandırmak için "Sınırsız Asistan" deyin');
  const [wakeLock, setWakeLock] = useState<any>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Screen Wake Lock to prevent screen sleep
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
      }
    } catch (err) {
      console.warn('Wake Lock failed:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release();
      setWakeLock(null);
    }
  };

  const startRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setStatusMessage('Tarayıcı ses tanımayı desteklemiyor.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'tr-TR';

    recog.onstart = () => {
      setIsListening(true);
      setStatusMessage('Dinleniyor: "Sınırsız Asistan"');
    };

    recog.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')
        .toLowerCase();

      if (transcript.includes('sınırsız asistan')) {
        playTacticalSound('emergency');
        setStatusMessage('Sistem Uyandı! Dinleniyor...');
        
        // Wait a bit to capture the command after the wake word
        setTimeout(() => {
          onTriggerAssistant(transcript.split('sınırsız asistan').pop()?.trim() || '');
          onClose();
        }, 1500);
      }
    };

    recog.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      if (event.error === 'no-speech') {
        // Restart if no speech detected
        try { recog.stop(); } catch(e) {}
      }
    };

    recog.onend = () => {
      if (isOpen) {
        // Automatically restart listening if still in lock mode
        try { recog.start(); } catch(e) {}
      }
    };

    setRecognition(recog);
    recog.start();
  }, [isOpen, onClose, onTriggerAssistant]);

  useEffect(() => {
    if (isOpen) {
      requestWakeLock();
      startRecognition();
      playTacticalSound('mic_on');
    } else {
      if (recognition) {
        recognition.stop();
      }
      releaseWakeLock();
    }

    return () => {
      if (recognition) recognition.stop();
      releaseWakeLock();
    };
  }, [isOpen]);

  const handleUnlock = () => {
    playTacticalSound('click');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-12 overflow-hidden"
      >
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(rgba(37,99,235,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.2)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Top Section: Status & Battery */}
        <div className="w-full flex justify-between items-start z-10">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Siber Güvenlik Katmanı</span>
              <span className="text-[9px] text-blue-300/50 uppercase">AES-256 Şifreli Oturum</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="text-xs font-mono">AKTİF</span>
              <Power className="w-4 h-4 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Center Section: Clock & Wake Word Indicator */}
        <div className="flex flex-col items-center gap-8 z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-8xl font-black text-white tracking-tighter tabular-nums">
              {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <p className="text-blue-400 font-medium tracking-[0.3em] uppercase mt-2">
              {time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </motion.div>

          <div className="relative flex flex-col items-center">
            {/* Listening Pulse */}
            <AnimatePresence>
              {isListening && (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
                  />
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                  />
                </>
              )}
            </AnimatePresence>

            <div className="relative w-32 h-32 rounded-full border-2 border-blue-900/50 flex items-center justify-center bg-black shadow-[0_0_50px_rgba(37,99,235,0.1)]">
              {isListening ? (
                <Mic className="w-12 h-12 text-blue-500 animate-pulse" />
              ) : (
                <Lock className="w-12 h-12 text-gray-700" />
              )}
            </div>

            <div className="mt-8 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-blue-400 font-mono text-[10px] uppercase tracking-widest">
                <Zap className="w-3 h-3 animate-bounce" />
                <span>Wake-on-Voice Aktif</span>
              </div>
              <p className="text-gray-400 text-xs font-medium max-w-[200px]">
                {statusMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Unlock Button */}
        <div className="w-full flex flex-col items-center gap-6 z-10">
          <button
            onClick={handleUnlock}
            className="group relative flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-500"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
              <Power className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Kilidi Aç</span>
              <span className="text-[9px] text-gray-500 uppercase">Manuel Erişim</span>
            </div>
            {/* Hover Shine Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000" />
            </div>
          </button>

          <div className="flex items-center gap-4 text-[10px] text-gray-600 font-mono">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>GÜVENLİ</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-800" />
            <div className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              <span>SESLİ YANIT</span>
            </div>
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-blue-500/20 rounded-tl-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-blue-500/20 rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-blue-500/20 rounded-bl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-blue-500/20 rounded-br-3xl pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
};
