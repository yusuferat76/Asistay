import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Mic,
  Send,
  Minimize2,
  Sparkles,
  Volume2,
  Bot,
  User,
  ShieldAlert,
} from 'lucide-react';

interface FloatingChatHeadProps {
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  messages: Array<{ id: string; sender: 'user' | 'assistant' | 'system'; text: string }>;
  onOpenEmergency: () => void;
}

export const FloatingChatHead: React.FC<FloatingChatHeadProps> = ({
  onSendMessage,
  isProcessing,
  messages,
  onOpenEmergency,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Track unread messages when collapsed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'assistant') {
        setUnreadCount((c) => c + 1);
      }
    } else if (isOpen) {
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setPosition((pos) => ({
        x: Math.min(pos.x, window.innerWidth - 75),
        y: Math.min(pos.y, window.innerHeight - 75),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse & Touch Dragging Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from the bubble avatar or top header
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const newX = Math.max(10, Math.min(window.innerWidth - 65, e.clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 65, e.clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleBubbleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <>
      {/* Draggable Bubble Icon */}
      <div
        ref={bubbleRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          touchAction: 'none',
        }}
        className="fixed top-0 left-0 z-50 cursor-grab active:cursor-grabbing select-none"
      >
        <div
          onClick={handleBubbleClick}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#0a1b42] via-[#1e3a8a] to-[#2563eb] p-0.5 shadow-2xl shadow-blue-950 border border-blue-400/60 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center group"
          title="Kaydırılabilir Siber Asistan Baloncuğu"
        >
          {/* Outer glowing pulsing ring */}
          <div className="absolute -inset-1 rounded-full bg-blue-500/30 blur-sm group-hover:bg-blue-500/50 transition" />

          {/* Inner circle */}
          <div className="relative w-full h-full rounded-full bg-[#030712] flex items-center justify-center text-blue-400 group-hover:text-white transition">
            <Bot className="w-7 h-7" />
          </div>

          {/* Active status pulse */}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#030712] shadow-sm">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          </span>

          {/* Unread badge */}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white font-extrabold text-[10px] border-2 border-[#030712] shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Expanded Messenger-Style Window */}
      {isOpen && (
        <div
          style={{
            right: Math.max(15, window.innerWidth - position.x - 70),
            bottom: Math.max(15, window.innerHeight - position.y),
          }}
          className="fixed z-50 w-[92vw] sm:w-96 h-[460px] max-h-[80vh] bg-[#070e24] border border-blue-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="p-3 bg-gradient-to-r from-[#0a163a] via-[#10245a] to-[#0a163a] border-b border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Siber Baloncuk Asistanı</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-blue-300">Messenger Modu • Her Ekranda Canlı</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onOpenEmergency}
                className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40"
                title="Acil Durdur"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-blue-950"
                title="Küçült"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-blue-950"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#030712]/90 text-xs">
            {messages.slice(-8).map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-[#10245a] text-blue-300'
                  }`}
                >
                  {msg.sender === 'user' ? 'Siz' : 'AI'}
                </div>

                <div
                  className={`max-w-[80%] rounded-xl p-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-[#0a1738] border border-blue-900/60 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] p-2 bg-[#0a1738] rounded-xl w-fit">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Yanıt yazılıyor...</span>
              </div>
            )}
            <div ref={chatScrollRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-[#070e24] border-t border-blue-900/40 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Hızlı komut yaz..."
              className="flex-1 px-3 py-1.5 bg-[#030712] border border-blue-800/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
