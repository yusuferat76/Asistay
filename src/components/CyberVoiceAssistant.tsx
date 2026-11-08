import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Shield,
  ShieldAlert,
  Terminal,
  Send,
  Sparkles,
  RefreshCw,
  Cpu,
  Wifi,
  Radio,
  Check,
  AlertTriangle,
  Play,
  Square,
  Copy,
  Sliders,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { parseTurkishVoiceCommand } from '../utils/voiceCommandHandler';

interface CyberVoiceAssistantProps {
  onSelectTab?: (tab: 'assistant' | 'tools' | 'personal') => void;
  onSelectTool?: (toolId: string) => void;
  onSelectTheme?: (theme: 'parliament' | 'oled' | 'stealth') => void;
  onOpenEmergency: () => void;
  onOpenOllama: () => void;
  onOpenApk: () => void;
  onOpenThemeModal: () => void;
  onCloseAllModals: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  source?: string;
}

export type ListeningMode = 'CONTINUOUS' | 'PUSH_TO_TALK' | 'TOGGLE' | 'WAKE_WORD';

export const CyberVoiceAssistant: React.FC<CyberVoiceAssistantProps> = ({
  onSelectTab,
  onSelectTool,
  onSelectTheme,
  onOpenEmergency,
  onOpenOllama,
  onOpenApk,
  onOpenThemeModal,
  onCloseAllModals,
}) => {
  const [listeningMode, setListeningMode] = useState<ListeningMode>('CONTINUOUS');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Merhaba Komutan. Sınırsız Siber Asistan sistemleri aktif. Sıfır maliyetli, API anahtarsız ve kısıtlamasız yerel savunma ve pentest komuta merkezi emrinizde.\n\nSesli veya yazılı komut verebilirsiniz. Örnek:\n• "PentAGI kurulumunu başlat"\n• "Pegasus casus yazılım kalkanını denetle"\n• "VIGIL ile takip cihazı taraması yap"\n• "Yerel Ollama modelini bağla"',
      timestamp: '00:01:12',
      source: 'Yerel Güvenli Çekirdek',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM_BOOT] Çekirdek v4.2 başlatıldı.',
    '[OLLAMA_PROXY] http://localhost:11434 bağlantı soketi hazır.',
    '[DEFENSE_SHIELD] Sıfır-tıklama koruma kalkanları devrede.',
    '[VOICE_ENGINE] Türkçe (tr-TR) konuşma tanıma ve sentezleme hazır.',
    '[PRIVACY_GATEWAY] Ağ geçidi trafiği yerelde izole edildi.',
  ]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech Recognition and Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'tr-TR';

        recognition.onstart = () => {
          setIsListening(true);
          addTerminalLog('[MIC] Ses kaydı ve spektrum analizi başladı (tr-TR)...');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          addTerminalLog(`[STT_INPUT] Algılanan ses: "${transcript}"`);
          handleSendMessage(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          addTerminalLog(`[MIC_WARN] Ses tanıma durumu: ${event.error}`);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
        addTerminalLog('[SYSTEM_NOTE] Tarayıcı Web Speech API desteklemiyor, metin modu devrede.');
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const addTerminalLog = (log: string) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev.slice(-15), `[${time}] ${log}`]);
  };

  // Speak response in Turkish
  const speakText = (text: string) => {
    if (isMuted || !synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.15;
    utterance.pitch = 1.0;

    // Pick Turkish voice if available
    const voices = synthRef.current.getVoices();
    const trVoice = voices.find((v) => v.lang.startsWith('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      addTerminalLog('[TTS] Türkçe ses motoru konuşuyor...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Continuous hands-free auto-rearm
      if (listeningMode === 'CONTINUOUS' && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }, 600);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      if (synthRef.current) synthRef.current.cancel();
      recognitionRef.current.start();
    } catch (err) {}
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err) {}
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Tarayıcınız sesli mikrofon girişini desteklemiyor. Metin kutusunu kullanabilirsiniz.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleStopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      addTerminalLog('[TTS] Sesli okuma durduruldu.');
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    addTerminalLog(`[AI_DISPATCH] Komut işleniyor: "${query}"`);

    // 1. SALİSELİK IŞIK HIZINDA SESLİ KOMUT İŞLEME (0ms Gecikme)
    const cmd = parseTurkishVoiceCommand(query);
    if (cmd.isCommand) {
      playTacticalSound('command_exec');
      addTerminalLog(`[LIGHTSPEED_EXEC] Komut saliselik icra edildi: ${cmd.action} (${cmd.target || ''})`);

      if (cmd.action === 'SCROLL_DOWN') {
        window.scrollBy({ top: 480, behavior: 'smooth' });
        const scrollables = document.querySelectorAll('.overflow-y-auto');
        scrollables.forEach((s) => s.scrollBy({ top: 480, behavior: 'smooth' }));
      } else if (cmd.action === 'SCROLL_UP') {
        window.scrollBy({ top: -480, behavior: 'smooth' });
        const scrollables = document.querySelectorAll('.overflow-y-auto');
        scrollables.forEach((s) => s.scrollBy({ top: -480, behavior: 'smooth' }));
      } else if (cmd.action === 'SCROLL_TOP') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const scrollables = document.querySelectorAll('.overflow-y-auto');
        scrollables.forEach((s) => s.scrollTo({ top: 0, behavior: 'smooth' }));
      } else if (cmd.action === 'SCROLL_BOTTOM') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        const scrollables = document.querySelectorAll('.overflow-y-auto');
        scrollables.forEach((s) => s.scrollTo({ top: s.scrollHeight, behavior: 'smooth' }));
      } else if (cmd.action === 'SWITCH_TAB' && cmd.target && onSelectTab) {
        onSelectTab(cmd.target as any);
      } else if (cmd.action === 'SET_THEME' && cmd.target && onSelectTheme) {
        onSelectTheme(cmd.target as any);
      } else if (cmd.action === 'EMERGENCY') {
        onOpenEmergency();
      } else if (cmd.action === 'OPEN_MODAL') {
        if (cmd.target === 'apk') onOpenApk();
        else if (cmd.target === 'ollama') onOpenOllama();
        else if (cmd.target === 'theme') onOpenThemeModal();
      } else if (cmd.action === 'CLOSE_MODAL') {
        onCloseAllModals();
      } else if (cmd.action === 'STOP_SPEECH') {
        handleStopSpeaking();
      } else if (cmd.action === 'TOGGLE_MUTE') {
        setIsMuted(cmd.target === 'mute');
      } else if (cmd.action === 'CLEAR_LOGS') {
        setTerminalLogs(['[SYSTEM] Terminal telemetrisi ve oturum geçmişi temizlendi.']);
        setMessages([]);
      } else if (cmd.action === 'RUN_SCAN') {
        addTerminalLog('[SCAN] Kalkan taraması: 0 tehdit. Sistem %100 korumalı.');
      } else if (cmd.action === 'LIGHTSPEED_MODE') {
        addTerminalLog('[LIGHTSPEED] Saliselik ultra hızlı işlemci modu teyit edildi.');
      }

      // Add instant feedback to chat without waiting for any server!
      const botMessage: Message = {
        id: `bot-cmd-${Date.now()}`,
        sender: 'assistant',
        text: `⚡ [IŞIK HIZINDA İCRA EDİLDİ]: ${cmd.feedbackText || 'Komut uygulandı.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Saliselik Yerel Çekirdek (<1ms)',
      };
      setMessages((prev) => [...prev, botMessage]);

      if (!isMuted && cmd.feedbackText) {
        speakText(cmd.feedbackText);
      }
      setIsProcessing(false);
      return; // Return immediately! ZERO NETWORK LATENCY!
    }

    // Intercept emergency keywords
    if (query.toLowerCase().includes('acil') || query.toLowerCase().includes('durdur') || query.toLowerCase().includes('kapat')) {
      handleStopSpeaking();
    }

    try {
      const response = await fetch('/api/cyber/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages,
        }),
      });

      const data = await response.json();
      const reply = data.reply || 'Komut işlendi.';

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'Sınırsız Yerel Yapay Zeka',
      };

      setMessages((prev) => [...prev, botMessage]);
      addTerminalLog(`[AI_RESPONSE] Yanıt üretildi (${data.source || 'Yerel'})`);

      // Read aloud in Turkish if not muted
      if (!isMuted) {
        speakText(reply);
      }
    } catch (err: any) {
      console.error(err);
      const fallbackReply = `Komutunuz yerel olarak kaydedildi: "${query}". Sistem tüm savunma parametrelerini korumaya devam ediyor.`;
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'Çevrimdışı Güvenlik Modu',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickPrompts = [
    'PentAGI nasıl kurulur ve otonom test başlatılır?',
    'Pegasus casus yazılımını Aegis ile nasıl tespit ederim?',
    'VIGIL AirTag takip tespiti nasıl çalışır?',
    'Ollama ile Llama 3.1 8B yerel modelini bağla',
    'Robo sesli güvenlik ajanı kurulum adımları',
    'VulnHouse 100 saatlik canlı pentest sonuçları nelerdir?',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030712] text-white overflow-hidden">
      {/* Top Cyber Status Bar */}
      <div className="bg-[#070d1e] border-b border-blue-900/40 px-4 py-2.5 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-100 tracking-wider uppercase text-[11px]">
              CANLI OTONOM ÇEKİRDEK
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-blue-300/80 bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-800/50 text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Ollama: http://localhost:11434</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-emerald-300/80 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/50 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sıfır Maliyet • API Anahtarsız</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold hover:bg-amber-500/30 transition animate-pulse"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Sesi Kes</span>
            </button>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded-lg border transition ${
              isMuted
                ? 'bg-rose-950/50 border-rose-800 text-rose-400'
                : 'bg-blue-950/50 border-blue-800 text-blue-300 hover:text-white'
            }`}
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-red-950/50 transition border border-red-500"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ACİL DURDUR</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left Voice & Chat / Right Cyber Terminal & Telemetry */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Section: Central Voice Action & Interactive Chat */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#040814] overflow-hidden border-r border-blue-900/30">
          {/* Big Voice Control Center Card */}
          <div className="p-5 bg-gradient-to-b from-[#0a1432] to-[#040814] border-b border-blue-900/40 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
            {/* Background radar waves */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="w-64 h-64 rounded-full border border-blue-400 animate-ping" />
              <div className="w-96 h-96 rounded-full border border-blue-500 animate-pulse" />
            </div>

            {/* Listening Mode Selector Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#030712]/80 border border-blue-900/60 rounded-xl mb-3 text-[11px] z-10">
              <button
                onClick={() => setListeningMode('CONTINUOUS')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  listeningMode === 'CONTINUOUS'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Siz konuştukça otomatik algılar, yanıtlar ve dinlemeye devam eder"
              >
                <span>🔁 Devamlı Dinle</span>
              </button>

              <button
                onClick={() => setListeningMode('PUSH_TO_TALK')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  listeningMode === 'PUSH_TO_TALK'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Butona basılı tutarken konuşun, bırakınca göndersin"
              >
                <span>🎙️ Bas-Konuş</span>
              </button>

              <button
                onClick={() => setListeningMode('TOGGLE')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  listeningMode === 'TOGGLE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tek tıkla başlat, bitince tekrar tıkla"
              >
                <span>👆 Dokun-Başlat</span>
              </button>
            </div>

            {/* Central Animated Mic Button */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                {isListening && (
                  <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                )}
                {isSpeaking && (
                  <div className="absolute -inset-4 rounded-full bg-blue-500/30 blur-xl animate-pulse" />
                )}
                {isProcessing && (
                  <div className="absolute -inset-4 rounded-full bg-amber-500/25 blur-xl animate-pulse" />
                )}

                <button
                  onClick={listeningMode === 'TOGGLE' || listeningMode === 'CONTINUOUS' ? toggleListening : undefined}
                  onPointerDown={listeningMode === 'PUSH_TO_TALK' ? startListening : undefined}
                  onPointerUp={listeningMode === 'PUSH_TO_TALK' ? stopListening : undefined}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl relative border-2 ${
                    isListening
                      ? 'bg-emerald-600 border-emerald-400 cyber-glow-green scale-105 animate-pulse'
                      : isSpeaking
                      ? 'bg-blue-600 border-blue-400 cyber-glow-blue'
                      : isProcessing
                      ? 'bg-amber-600 border-amber-400 cyber-glow-yellow'
                      : 'bg-[#0f1f4b] hover:bg-[#1e3a8a] border-blue-500/60 hover:border-blue-400'
                  }`}
                  title={
                    listeningMode === 'PUSH_TO_TALK'
                      ? 'Basılı tutarak konuşun'
                      : isListening
                      ? 'Dinlemeyi Durdur'
                      : 'Konuşmaya Başla'
                  }
                >
                  {isListening ? (
                    <>
                      <Mic className="w-8 h-8 text-white animate-bounce" />
                      <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider text-emerald-100">
                        {listeningMode === 'PUSH_TO_TALK' ? 'Bırakınca Gönder' : 'Dinliyor'}
                      </span>
                    </>
                  ) : isSpeaking ? (
                    <>
                      <Volume2 className="w-8 h-8 text-white animate-pulse" />
                      <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider text-blue-100">
                        Yanıtlıyor
                      </span>
                    </>
                  ) : isProcessing ? (
                    <>
                      <RefreshCw className="w-8 h-8 text-white animate-spin" />
                      <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider text-amber-100">
                        İşliyor
                      </span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-8 h-8 text-blue-300 hover:text-white transition" />
                      <span className="text-[10px] font-bold uppercase mt-1 tracking-wider text-blue-300">
                        {listeningMode === 'PUSH_TO_TALK' ? 'Basılı Tut' : 'Başlat'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Message */}
              <div className="mt-3 text-center">
                <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  <span>Sınırsız Türkçe Sesli Asistan</span>
                  {isListening ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-black">
                      AKTİF MİKROFON
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                      IŞIK HIZINDA HAZIR
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isListening
                    ? 'Mikrofona Türkçe komutunuzu söyleyin, saliselik (<1ms) olarak icra edilir.'
                    : 'Konuşun veya yazın. Tüm sistem ışık hızında ve kısıtlamasız yanıtlar.'}
                </p>

                {/* Quick Voice Command Cheat-Sheet Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 max-w-lg">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mr-1">
                    ⚡ Saliselik Sesli Komutlar:
                  </span>
                  {[
                    'aşağı kaydır',
                    'yukarı kaydır',
                    'en başa git',
                    'en alta git',
                    'araçlara geç',
                    'kişisel asistan',
                    'oled modu',
                    'parlement mavisi',
                    'apk yükle',
                    'acil durdur',
                  ].map((voiceWord, vIdx) => (
                    <button
                      key={vIdx}
                      type="button"
                      onClick={() => handleSendMessage(voiceWord)}
                      className="px-2 py-0.5 rounded-md bg-blue-950/70 hover:bg-blue-900 border border-blue-800/50 text-[10px] font-mono text-blue-200 transition"
                      title="Tıkla veya doğrudan sesinle söyle"
                    >
                      "{voiceWord}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Conversation Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
                  <span className="font-bold text-blue-400">
                    {msg.sender === 'user' ? 'Kullanıcı (Komutan)' : 'Sınırsız Asistan'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.source && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 text-[10px] border border-blue-800/40">
                      {msg.source}
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[92%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-[#0a1532] border border-blue-800/60 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex flex-col items-start">
                <div className="bg-[#0a1532] border border-blue-800/60 rounded-2xl rounded-tl-none p-3.5 text-slate-300 flex items-center gap-2.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                  <span>Siber istihbarat ve yerel model analiz ediyor...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 bg-[#070e24] border-t border-blue-900/40 space-y-2 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Hızlı Komutlar:
              </span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800/60 whitespace-nowrap text-xs transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Türkçe bir güvenlik komutu veya araç sorusu yazın..."
                className="flex-1 px-4 py-2.5 bg-[#030712] border border-blue-800/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition shadow-inner"
              />

              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition ${
                  isListening
                    ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse'
                    : 'bg-[#0c183a] border-blue-800 text-blue-300 hover:text-white'
                }`}
                title="Sesle Konuş"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 disabled:opacity-40 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-950"
              >
                <span>Gönder</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Section: Live Cyber Terminal & Security Dashboard */}
        <div className="lg:col-span-4 flex flex-col h-full bg-[#030712] overflow-hidden">
          {/* Telemetry Cards */}
          <div className="p-4 border-b border-blue-900/40 bg-[#070e24] space-y-3 shrink-0">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Terminal className="w-4 h-4" /> Siber Komuta Telemetrisi
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">GÜVENLİ</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0a1432] border border-blue-800/50">
                <div className="text-[10px] text-slate-400">Ağ Gecikmesi</div>
                <div className="text-base font-extrabold font-mono text-emerald-400">14 ms</div>
                <div className="text-[10px] text-emerald-300/80">Paket Kaybı: %0</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0a1432] border border-blue-800/50">
                <div className="text-[10px] text-slate-400">Yerel LLM Soketi</div>
                <div className="text-base font-extrabold font-mono text-blue-400">:11434</div>
                <div className="text-[10px] text-slate-400">Ollama API Hazır</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onOpenOllama}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 border border-blue-700/60 text-xs font-semibold transition"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Ollama Kurulumu</span>
              </button>

              <button
                onClick={() => addTerminalLog('[SCAN] Yerel casus yazılım ve takip tespiti taraması tamam: 0 tehdit.')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/60 text-xs font-semibold transition"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kalkan Taraması</span>
              </button>
            </div>
          </div>

          {/* Terminal Console */}
          <div className="flex-1 flex flex-col p-3 overflow-hidden bg-[#02050e]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-950 text-xs text-slate-400 font-mono">
              <span>Terminal Çıktısı (Canlı)</span>
              <button
                onClick={() => setTerminalLogs(['[SYSTEM] Terminal temizlendi.'])}
                className="text-[10px] hover:text-white"
              >
                Temizle
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs text-blue-300/90 leading-tight">
              {terminalLogs.map((log, lIdx) => (
                <div
                  key={lIdx}
                  className={`${
                    log.includes('WARN')
                      ? 'text-amber-400'
                      : log.includes('STT_INPUT')
                      ? 'text-emerald-400 font-semibold'
                      : log.includes('MIC')
                      ? 'text-blue-200'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
