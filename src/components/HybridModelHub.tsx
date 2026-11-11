import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Cloud,
  Smartphone,
  Zap,
  Activity,
  Shield,
  Radio,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Terminal,
  Lock,
  Wifi,
  Eye,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playTacticalSound } from '../utils/audioEffects';
import { speakUltraRealistic } from '../utils/ultraTTS';

export interface ModelProfile {
  id: string;
  name: string;
  provider: 'Cloud' | 'On-Device' | 'Hybrid';
  source: string;
  parameters: string;
  quantization: string;
  censorship: 'Sansürsüz & Kısıtlamasız' | 'Standart Güvenlik' | 'Bulut Enterprise';
  status: 'Ready' | 'Downloading' | 'Active' | 'Standby';
  latencyMs: number;
  tokensPerSec: number;
}

const INITIAL_MODELS: ModelProfile[] = [
  {
    id: 'm-1',
    name: 'Gemini 2.5 Flash (Cloud Omurga)',
    provider: 'Cloud',
    source: 'Google AI Cloud Gateway',
    parameters: '1.2T+ MoE',
    quantization: 'FP16 / Cloud Native',
    censorship: 'Bulut Enterprise',
    status: 'Active',
    latencyMs: 110,
    tokensPerSec: 150,
  },
  {
    id: 'm-2',
    name: 'Kimi K3 (Çok Modlu Gelişmiş Sistem)',
    provider: 'Cloud',
    source: 'Moonshot AI Multimodal API',
    parameters: 'Advanced MoE',
    quantization: 'Cloud Optimized',
    censorship: 'Bulut Enterprise',
    status: 'Ready',
    latencyMs: 95,
    tokensPerSec: 165,
  },
  {
    id: 'm-3',
    name: 'Qwen3 27B Uncensored (Yerel Yüksek Zeka)',
    provider: 'On-Device',
    source: 'Hugging Face (Qwen/Qwen3-27B-Uncensored-GGUF)',
    parameters: '27.0B',
    quantization: 'Q4_K_M (4-bit)',
    censorship: 'Sansürsüz & Kısıtlamasız',
    status: 'Ready',
    latencyMs: 58,
    tokensPerSec: 42,
  },
  {
    id: 'm-4',
    name: 'Dolphin 3.0 Mistral (Sansürsüz Edge Ağırlığı)',
    provider: 'On-Device',
    source: 'Hugging Face (cognitivecomputations/dolphin-2.9-dstest)',
    parameters: '7.0B',
    quantization: 'INT8 Quantized',
    censorship: 'Sansürsüz & Kısıtlamasız',
    status: 'Ready',
    latencyMs: 42,
    tokensPerSec: 88,
  },
  {
    id: 'm-5',
    name: 'Phi-3.5 Mini Instruct (Hafif Cihaz İçi)',
    provider: 'On-Device',
    source: 'Hugging Face (microsoft/Phi-3.5-mini-instruct)',
    parameters: '3.8B',
    quantization: 'INT4 (W4A16)',
    censorship: 'Sansürsüz & Kısıtlamasız',
    status: 'Standby',
    latencyMs: 35,
    tokensPerSec: 96,
  },
];

interface HybridModelHubProps {
  onAskAssistant: (prompt: string) => void;
}

export const HybridModelHub: React.FC<HybridModelHubProps> = ({ onAskAssistant }) => {
  const [models, setModels] = useState<ModelProfile[]>(INITIAL_MODELS);
  const [routingMode, setRoutingMode] = useState<'hybrid' | 'cloud-only' | 'device-only'>('hybrid');
  const [activeModelId, setActiveModelId] = useState<string>('m-3');
  const [liveStreamAnalysis, setLiveStreamAnalysis] = useState<boolean>(true);
  const [multiprocessingThreads, setMultiprocessingThreads] = useState<number>(8);
  const [audioLatency, setAudioLatency] = useState<number>(34); // ms
  const [routingLogs, setRoutingLogs] = useState<string[]>([
    '[INIT] Hibrit yönlendirme ve çoklu işlem motoru devrede.',
    '[ROUTER] Qwen3 27B ve Dolphin 3.0 yerel sansürsüz ağırlıkları hazır.',
    '[ROUTER] Kimi K3 ve Gemini 2.5 bulut çok modlu servisleri bağlı.',
  ]);

  const handleSelectModel = (model: ModelProfile) => {
    playTacticalSound('command_exec');
    setActiveModelId(model.id);
    setRoutingLogs((prev) => [
      `[MODEL_SWITCH] Aktif model değiştirildi: ${model.name} (${model.provider} - ${model.censorship})`,
      ...prev.slice(0, 15),
    ]);
    speakUltraRealistic(`Aktif yapay zeka modeli ${model.name} olarak ayarlandı.`);
  };

  const handleDownloadWeights = (modelId: string) => {
    playTacticalSound('command_exec');
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, status: 'Downloading' } : m))
    );

    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) => (m.id === modelId ? { ...m, status: 'Ready' } : m))
      );
      playTacticalSound('ai_response');
      speakUltraRealistic('Model ağırlıkları Hugging Face deposundan başarıyla indirildi ve yerel belleğe yüklendi.');
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020611] text-white overflow-y-auto p-4 sm:p-6 select-none space-y-6">
      
      {/* Header & Routing Mode Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-blue-900/40 gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-900 via-indigo-700 to-cyan-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-blue-950">
              <Cpu className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Hibrit Yapay Zeka & Model Dağıtım Merkezi</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  QWEN3 27B • DOLPHIN 3.0 • KIMI K3
                </span>
              </h2>
              <p className="text-xs text-blue-300/80 mt-0.5">
                Sansürsüz yerel ağırlıklar (Hugging Face) ve çok modlu bulut sistemleri (Kimi K3 / Gemini) arasında akıllı dinamik yönlendirme.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Routing Mode Selector */}
        <div className="flex items-center gap-2 bg-black p-1.5 rounded-2xl border border-blue-900/60 font-mono text-xs">
          <button
            onClick={() => { playTacticalSound('click'); setRoutingMode('hybrid'); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              routingMode === 'hybrid'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Hibrit Akıllı Yönlendirme</span>
          </button>
          <button
            onClick={() => { playTacticalSound('click'); setRoutingMode('device-only'); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              routingMode === 'device-only'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sadece Cihaz İçi (Offline)</span>
          </button>
          <button
            onClick={() => { playTacticalSound('click'); setRoutingMode('cloud-only'); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              routingMode === 'cloud-only'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Sadece Bulut Omurga</span>
          </button>
        </div>
      </div>

      {/* Multiprocessing & Live Stream Analysis Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <div className="p-4 rounded-2xl bg-black/80 border border-blue-950 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-gray-400 block uppercase">Canlı Ekran Akışı Analizi</span>
            <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">
              {liveStreamAnalysis ? 'Aktif (60 FPS Stream)' : 'Beklemede'}
            </span>
          </div>
          <button
            onClick={() => setLiveStreamAnalysis(!liveStreamAnalysis)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition ${
              liveStreamAnalysis ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-gray-900 text-gray-400 border-gray-700'
            }`}
          >
            {liveStreamAnalysis ? 'Durdur' : 'Başlat'}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-black/80 border border-blue-950">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">Çoklu İşlem (Multiprocessing)</span>
          <span className="text-sm font-mono font-bold text-cyan-400 mt-0.5 block">{multiprocessingThreads} Eşzamanlı Çekirdek</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/80 border border-blue-950">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">Düşük Gecikmeli Ses</span>
          <span className="text-sm font-mono font-bold text-amber-300 mt-0.5 block">{audioLatency} ms</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/80 border border-blue-950">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">Dinamik Dağıtım</span>
          <span className="text-sm font-mono font-bold text-white mt-0.5 block">
            {routingMode === 'hybrid' ? 'Akıllı Yönlendirme (Qwen/Kimi)' : routingMode === 'device-only' ? 'Yerel Sansürsüz' : 'Bulut Çok Modlu'}
          </span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Bulut Çok Modlu Sistemler & Sansürsüz Yerel Modeller (Hugging Face / Kimi K3 / Qwen3)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => {
            const isActive = activeModelId === model.id;

            return (
              <div
                key={model.id}
                className={`p-5 rounded-3xl border transition flex flex-col justify-between gap-4 ${
                  isActive
                    ? 'bg-blue-950/40 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                    : 'bg-black/70 border-blue-900/40 hover:border-blue-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-400 animate-ping' : 'bg-gray-500'}`} />
                        <h4 className="font-extrabold text-white text-sm">{model.name}</h4>
                      </div>
                      <span className="text-[11px] font-mono text-blue-300 mt-0.5 block">{model.source}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                        model.provider === 'Cloud'
                          ? 'bg-blue-950 text-blue-300 border-blue-700'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      }`}
                    >
                      {model.provider}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono text-gray-300">
                    <div className="p-2 rounded-xl bg-black border border-blue-900/40">
                      <span className="text-gray-500 block text-[9px]">Parametre</span>
                      <strong className="text-white">{model.parameters}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-black border border-blue-900/40">
                      <span className="text-gray-500 block text-[9px]">Kuantizasyon</span>
                      <strong className="text-cyan-300">{model.quantization}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-black border border-blue-900/40">
                      <span className="text-gray-500 block text-[9px]">Hız / Gecikme</span>
                      <strong className="text-emerald-400">{model.tokensPerSec} tps / {model.latencyMs}ms</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                    <span className="text-amber-400 font-bold">{model.censorship}</span>
                    <span className="text-gray-400">Durum: <strong className="text-white">{model.status}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-blue-900/40">
                  {model.status === 'Downloading' ? (
                    <button disabled className="flex-1 py-2 rounded-xl bg-blue-900/40 text-blue-300 font-bold text-xs flex items-center justify-center gap-2 cursor-wait">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Hugging Face'den İndiriliyor...</span>
                    </button>
                  ) : model.status === 'Ready' || model.status === 'Standby' ? (
                    <button
                      onClick={() => handleDownloadWeights(model.id)}
                      className="py-2 px-3 rounded-xl bg-black hover:bg-gray-900 text-gray-300 border border-gray-800 font-bold text-xs transition"
                      title="Ağırlıkları İndir / Senkronize Et"
                    >
                      HF İndir
                    </button>
                  ) : null}

                  <button
                    onClick={() => handleSelectModel(model)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition shadow-lg ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-emerald-950'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950'
                    }`}
                  >
                    {isActive ? 'Aktif Model (Kullanımda)' : 'Bu Modeli Seç'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Routing Log Terminal */}
      <div className="bg-black/90 border border-blue-900/60 rounded-3xl p-5 shadow-2xl flex flex-col shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-blue-900/40 mb-3">
          <span className="text-xs font-mono text-blue-300 font-bold flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" /> Canlı Ekran Analizi & Dinamik Yönlendirme Konsolu
          </span>
          <span className="text-[10px] font-mono text-emerald-400">Çoklu İşlem Aktif</span>
        </div>
        <div className="bg-[#01040a] rounded-2xl p-4 font-mono text-xs text-green-400/90 h-36 overflow-y-auto border border-blue-950 space-y-1.5">
          {routingLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-gray-600">[{idx + 1}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
