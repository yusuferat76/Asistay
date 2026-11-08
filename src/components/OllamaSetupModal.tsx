import React, { useState } from 'react';
import {
  Cpu,
  X,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface OllamaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OllamaSetupModal: React.FC<OllamaSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'success' | 'offline'>('idle');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleTestPing = async () => {
    setPingStatus('checking');
    try {
      const res = await fetch('http://localhost:11434/api/tags', { mode: 'no-cors' });
      setPingStatus('success');
    } catch (e) {
      setPingStatus('offline');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#070e24] border border-blue-500/60 rounded-3xl shadow-2xl p-6 text-white overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Sıfır Maliyetli Ollama Yapılandırması</h3>
              <p className="text-xs text-blue-300/80">API Anahtarsız, Sınırsız & Kotasız Yerel LLM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-blue-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 leading-relaxed">
            ✨ <strong>Tamamen Ücretsiz:</strong> Bilgisayarınızda yerel çalışan Ollama motoru sayesinde ne OpenAI ne Anthropic ne de başka bir sağlayıcıya API ücreti ödemezsiniz. Verileriniz asla bilgisayarınızdan dışarı çıkmaz.
          </div>

          {/* Step 1: Install */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-bold text-white">
              <span>1. Ollama Kurulumu & Model İndirme (Bash):</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    'curl -fsSL https://ollama.com/install.sh | sh && ollama pull llama3.1:8b-instruct-q8_0 && sudo systemctl enable --now ollama',
                    'step1'
                  )
                }
                className="flex items-center gap-1 text-blue-400 hover:text-white text-[11px]"
              >
                {copiedSection === 'step1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'step1' ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#030712] border border-blue-950 font-mono text-slate-300 select-all overflow-x-auto">
{`curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b-instruct-q8_0
sudo systemctl enable --now ollama`}
            </pre>
          </div>

          {/* Step 2: PentAGI config */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-bold text-white">
              <span>2. PentAGI .env Entegrasyonu:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    'OLLAMA_SERVER_URL=http://localhost:11434\nOLLAMA_SERVER_MODEL=llama3.1:8b-instruct-q8_0\nOLLAMA_SERVER_PULL_MODELS_ENABLED=true\nOLLAMA_SERVER_LOAD_MODELS_ENABLED=true',
                    'step2'
                  )
                }
                className="flex items-center gap-1 text-blue-400 hover:text-white text-[11px]"
              >
                {copiedSection === 'step2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'step2' ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#030712] border border-blue-950 font-mono text-slate-300 select-all overflow-x-auto">
{`OLLAMA_SERVER_URL=http://localhost:11434
OLLAMA_SERVER_MODEL=llama3.1:8b-instruct-q8_0
OLLAMA_SERVER_PULL_MODELS_ENABLED=true
OLLAMA_SERVER_LOAD_MODELS_ENABLED=true`}
            </pre>
          </div>

          {/* Step 3: Hermes config */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-bold text-white">
              <span>3. Hermes Agent .env Entegrasyonu:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    'OPENAI_BASE_URL=http://localhost:11434/v1\nOPENAI_API_KEY=ollama',
                    'step3'
                  )
                }
                className="flex items-center gap-1 text-blue-400 hover:text-white text-[11px]"
              >
                {copiedSection === 'step3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'step3' ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#030712] border border-blue-950 font-mono text-slate-300 select-all overflow-x-auto">
{`OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama`}
            </pre>
          </div>

          {/* Connection Test */}
          <div className="p-3.5 rounded-2xl bg-[#040814] border border-blue-900/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Yerel Soket Testi</div>
              <div className="text-[11px] text-slate-400">http://localhost:11434</div>
            </div>

            <button
              onClick={handleTestPing}
              disabled={pingStatus === 'checking'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              {pingStatus === 'checking' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              <span>Bağlantıyı Test Et</span>
            </button>
          </div>

          {pingStatus === 'success' && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ollama soketi yanıt verdi! Sistem yerel modelle çalışmaya hazır.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
