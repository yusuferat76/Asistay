import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  X,
  Activity,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { triggerHaptic } from '../utils/haptics';
import { speakUltraRealistic } from '../utils/ultraTTS';
import {
  loadChatMessages,
  saveChatMessages,
  loadChatDraft,
  saveChatDraft,
  PersistedChatMessage,
} from '../utils/asistayStorage';

interface AsistayChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAI?: (prompt: string) => void;
}

const DEFAULT_WELCOME_MESSAGES: PersistedChatMessage[] = [
  {
    id: 'welcome',
    sender: 'assistant',
    text: 'Merhaba! Ben Asistay Siber Güvenlik Asistanınız. Sohbet geçmişiniz cihazda saklanır; sistemleriniz, ağ bağlantılarınız ve dijital güvenliğiniz hakkında her şeyi sorabilirsiniz.',
    timestamp: 'Şimdi',
    source: 'system',
  },
];

export const AsistayChatModal: React.FC<AsistayChatModalProps> = ({
  isOpen,
  onClose,
  onAskAI,
}) => {
  const [messages, setMessages] = useState<PersistedChatMessage[]>(() =>
    loadChatMessages(DEFAULT_WELCOME_MESSAGES)
  );
  const [inputText, setInputText] = useState<string>(() => loadChatDraft());
  const [isTyping, setIsTyping] = useState(false);
  const [engineBadge, setEngineBadge] = useState<string>('ÇEVRİMİÇİ');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveChatMessages(messages);
  }, [messages]);

  useEffect(() => {
    saveChatDraft(inputText);
  }, [inputText]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend ?? inputText;
    const text = rawText.trim();
    if (!text || isTyping) return;

    playTacticalSound('command_exec');
    triggerHaptic('click');

    const userMsg: PersistedChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!textToSend) {
      setInputText('');
      saveChatDraft('');
    }
    setIsTyping(true);
    if (onAskAI) onAskAI(text);

    try {
      const resp = await fetch('/api/cyber/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: nextHistory.slice(-8),
        }),
      });

      const data = await resp.json().catch(() => null);
      const reply =
        data?.reply ||
        'Yerel motor bağlantısı kurulamadı; mesajınız cihaz belleğinde güvenle saklandı.';
      const source = String(data?.source || 'local-heuristic-engine');

      if (source === 'gemini-4-hydrogen') {
        setEngineBadge('GEMINI 4');
      } else if (source === 'ollama-local') {
        setEngineBadge('OLLAMA YEREL');
      } else {
        setEngineBadge('YEREL MOTOR');
      }

      const botMsg: PersistedChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source,
      };

      setMessages((prev) => [...prev, botMsg]);
      speakUltraRealistic(reply);
      playTacticalSound('ai_response');
    } catch {
      setEngineBadge('ÇEVRİMDIŞI');
      const offlineMsg: PersistedChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'Sunucu model uç noktasına ulaşılamadı. Mesajınız cihaz içi yerel geçmişte korundu; internet veya sunucu bağlantısı sağlandığında yeniden deneyebilirsiniz.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'offline-honest',
      };
      setMessages((prev) => [...prev, offlineMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'Ağ güvenliğimi kontrol et',
    'Şifre kırıcı koruması',
    'Ekran paylaşımı başlat',
    'APK indirme bağlantısı ver',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#050b14] border border-blue-500/50 rounded-3xl w-full max-w-lg h-[620px] max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(37,99,235,0.25)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-blue-900/50 bg-black/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-md">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Asistay Siber Asistan</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 text-cyan-300 border border-cyan-700/60">
                  {engineBadge}
                </span>
              </div>
              <p className="text-xs text-blue-300/80">Sor, öğren, planla &amp; yerel geçmiş</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-black/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-md font-medium'
                    : 'bg-[#0a1628] border border-blue-900/60 text-gray-200 rounded-tl-sm shadow-lg'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 mb-1 font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      ASİSTAY ZEKA MOTORU{m.source ? ` • ${m.source.toUpperCase()}` : ''}
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-line">{m.text}</p>
                <span className="block text-[10px] text-gray-400/80 mt-1 text-right font-mono">
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-2">
              <Activity className="w-4 h-4 animate-spin" />
              <span>Asistay yanıt hazırlıyor...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-blue-900/30 bg-black/50 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] font-mono whitespace-nowrap px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-200 hover:bg-blue-900/60 hover:border-blue-400 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-black/80 border-t border-blue-900/50 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Asistay'a güvenlik sorusu sorun..."
            className="flex-1 bg-[#091322] border border-blue-800/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-500 hover:to-cyan-500 shadow-md transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
