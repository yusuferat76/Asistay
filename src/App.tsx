import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CyberVoiceAssistant } from './components/CyberVoiceAssistant';
import { CyberToolsHub } from './components/CyberToolsHub';
import { PersonalAssistantHub } from './components/PersonalAssistantHub';
import { FloatingChatHead } from './components/FloatingChatHead';
import { MobileApkModal } from './components/MobileApkModal';
import { EmergencyShieldModal } from './components/EmergencyShieldModal';
import { OllamaSetupModal } from './components/OllamaSetupModal';
import { ThemeManagerModal, AppTheme } from './components/ThemeManagerModal';
import { parseTurkishVoiceCommand } from './utils/voiceCommandHandler';

export default function App() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'tools' | 'personal'>('assistant');

  // Modals
  const [isApkOpen, setIsApkOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isOllamaOpen, setIsOllamaOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('parliament');

  const closeAllModals = () => {
    setIsApkOpen(false);
    setIsEmergencyOpen(false);
    setIsOllamaOpen(false);
    setIsThemeOpen(false);
  };

  // Global Chat messages (shared with floating chat head)
  const [globalMessages, setGlobalMessages] = useState<Array<{ id: string; sender: 'user' | 'assistant' | 'system'; text: string }>>([
    {
      id: 'g-1',
      sender: 'assistant',
      text: 'Sınırsız Siber & Kişisel Asistan hazır. Otonom güvenlik savunma araçları (PentAGI, Robo, DarkMoon), casus yazılım tespiti (Aegis, VIGIL), telefon otomasyonu (Neuron, Android Use) ve yerel Ollama motoru devrede.',
    },
  ]);
  const [isFloatingProcessing, setIsFloatingProcessing] = useState(false);

  // Global message dispatcher for floating chat head with instant light-speed execution
  const handleSendFloatingMessage = async (text: string) => {
    setIsFloatingProcessing(true);
    const userMsg = { id: `flt-usr-${Date.now()}`, sender: 'user' as const, text };
    setGlobalMessages((prev) => [...prev, userMsg]);

    const cmd = parseTurkishVoiceCommand(text);
    if (cmd.isCommand) {
      if (cmd.action === 'SCROLL_DOWN') {
        window.scrollBy({ top: 480, behavior: 'smooth' });
        document.querySelectorAll('.overflow-y-auto').forEach((s) => s.scrollBy({ top: 480, behavior: 'smooth' }));
      } else if (cmd.action === 'SCROLL_UP') {
        window.scrollBy({ top: -480, behavior: 'smooth' });
        document.querySelectorAll('.overflow-y-auto').forEach((s) => s.scrollBy({ top: -480, behavior: 'smooth' }));
      } else if (cmd.action === 'SCROLL_TOP') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelectorAll('.overflow-y-auto').forEach((s) => s.scrollTo({ top: 0, behavior: 'smooth' }));
      } else if (cmd.action === 'SCROLL_BOTTOM') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        document.querySelectorAll('.overflow-y-auto').forEach((s) => s.scrollTo({ top: s.scrollHeight, behavior: 'smooth' }));
      } else if (cmd.action === 'SWITCH_TAB' && cmd.target) {
        setActiveTab(cmd.target as any);
      } else if (cmd.action === 'SET_THEME' && cmd.target) {
        setCurrentTheme(cmd.target as any);
      } else if (cmd.action === 'EMERGENCY') {
        setIsEmergencyOpen(true);
      } else if (cmd.action === 'OPEN_MODAL') {
        if (cmd.target === 'apk') setIsApkOpen(true);
        else if (cmd.target === 'ollama') setIsOllamaOpen(true);
        else if (cmd.target === 'theme') setIsThemeOpen(true);
      } else if (cmd.action === 'CLOSE_MODAL') {
        closeAllModals();
      }

      setGlobalMessages((prev) => [
        ...prev,
        {
          id: `flt-bot-${Date.now()}`,
          sender: 'assistant' as const,
          text: `⚡ [IŞIK HIZINDA İCRA]: ${cmd.feedbackText || 'Komut uygulandı.'}`,
        },
      ]);
      setIsFloatingProcessing(false);
      return;
    }

    try {
      const response = await fetch('/api/cyber/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      const botMsg = {
        id: `flt-bot-${Date.now()}`,
        sender: 'assistant' as const,
        text: data.reply || 'Komut işlendi.',
      };
      setGlobalMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setGlobalMessages((prev) => [
        ...prev,
        {
          id: `flt-err-${Date.now()}`,
          sender: 'assistant' as const,
          text: `Komut yerel korumaya alındı: "${text}".`,
        },
      ]);
    } finally {
      setIsFloatingProcessing(false);
    }
  };

  // Switch to assistant tab with a query
  const handleAskAssistant = (question: string) => {
    setActiveTab('assistant');
    handleSendFloatingMessage(question);
  };

  // Emergency kill-switch trigger
  const handleEmergencyTriggered = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setGlobalMessages([
      {
        id: `kill-${Date.now()}`,
        sender: 'system',
        text: '🔴 ACİL DURDURMA PROTOKOLÜ ÇALIŞTIRILDI. Tüm sesli ve veri akışları izole edildi.',
      },
    ]);
  };

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden select-none transition-colors duration-300 ${
        currentTheme === 'oled'
          ? 'bg-black text-white'
          : currentTheme === 'stealth'
          ? 'bg-[#020a06] text-emerald-100'
          : 'bg-[#030712] text-white'
      }`}
    >
      {/* Top Cyber Navbar */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenApkModal={() => setIsApkOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenOllama={() => setIsOllamaOpen(true)}
        onOpenThemeModal={() => setIsThemeOpen(true)}
      />

      {/* Main Views Container */}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {/* Tab 1: Sınırsız Canlı Sesli Asistan (Default) */}
        {activeTab === 'assistant' && (
          <CyberVoiceAssistant
            onSelectTab={setActiveTab}
            onSelectTool={(id) => setActiveTab('tools')}
            onSelectTheme={setCurrentTheme}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenOllama={() => setIsOllamaOpen(true)}
            onOpenApk={() => setIsApkOpen(true)}
            onOpenThemeModal={() => setIsThemeOpen(true)}
            onCloseAllModals={closeAllModals}
          />
        )}

        {/* Tab 2: Siber Güvenlik Araçları Kataloğu (Bölüm 2-9) */}
        {activeTab === 'tools' && (
          <CyberToolsHub onAskAssistant={handleAskAssistant} />
        )}

        {/* Tab 3: Kişisel Asistan & Mobil Otomasyon Merkezi */}
        {activeTab === 'personal' && (
          <PersonalAssistantHub
            onAskAssistant={handleAskAssistant}
            onOpenOllamaModal={() => setIsOllamaOpen(true)}
            onOpenApkModal={() => setIsApkOpen(true)}
          />
        )}

        {/* Draggable Messenger-Style Floating Chat Head (Floats across all screens) */}
        <FloatingChatHead
          onSendMessage={handleSendFloatingMessage}
          isProcessing={isFloatingProcessing}
          messages={globalMessages}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
        />
      </main>

      {/* Global Modals */}
      <MobileApkModal isOpen={isApkOpen} onClose={() => setIsApkOpen(false)} />

      <EmergencyShieldModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onEmergencyTriggered={handleEmergencyTriggered}
      />

      <OllamaSetupModal isOpen={isOllamaOpen} onClose={() => setIsOllamaOpen(false)} />

      <ThemeManagerModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />
    </div>
  );
}
