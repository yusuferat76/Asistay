import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Bot,
  Cpu,
  Mic,
  MessageSquare,
  ShieldCheck,
  Zap,
  Sliders,
  Send,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Terminal,
  Volume2,
  Lock,
  Layers,
  ArrowDownUp,
  RefreshCw,
  FileText,
  DollarSign,
  ShieldAlert,
  Flame,
  Globe,
  Shield,
  Share2,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { CyberSecurityStatusPanel } from './CyberSecurityStatusPanel';
import { downloadReceiptCSV, downloadReceiptPDF, shareSplitNative } from '../utils/exportHelpers';
import { SpendAnalysisDashboard } from './SpendAnalysisDashboard';

interface PersonalAssistantHubProps {
  onAskAssistant: (question: string) => void;
  onOpenOllamaModal: () => void;
  onOpenApkModal: () => void;
  scannedReceipts: any[];
}

export const PersonalAssistantHub: React.FC<PersonalAssistantHubProps> = ({
  onAskAssistant,
  onOpenOllamaModal,
  onOpenApkModal,
  scannedReceipts,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'receipts' | 'spend_analysis' | 'cyber_ai' | 'security_status' | 'automation' | 'local_model'>('overview');
  const [quickFeedback, setQuickFeedback] = useState<string | null>(null);

  const aiSuperSystems = [
    {
      name: 'XBOW AI (Global HackerOne #1)',
      badge: 'KAPITAL & KURUMSAL SÜPER AJAN',
      desc: 'Karşısına verilen hedef IP veya web sitesini tamamen otonom inceler. Bulduğu zafiyeti sömürerek ana sisteme sızar ve 48 adıma varan karmaşık saldırı zincirlerini (Exploit Chains) tamamlar.',
      features: ['Otonom Exploit Zinciri', 'HackerOne Liderlik Odaklı', 'Derin Sistem Sızması'],
    },
    {
      name: 'STRIX AI (Açık Kaynaklı Süper Ajan)',
      badge: 'GITHUB AÇIK KAYNAK',
      desc: 'Yerleşik hacker tarayıcısı, HTTP proxy, terminal arayüzü ve sandbox barındırır. Hedefe göre özel Yetenek Dosyaları (Skill Files) yükler.',
      features: ['Dahili Tarayıcı & Proxy', 'Dinamik Yetenek Dosyaları', 'Docker Konteyner İzolasyonu'],
    },
    {
      name: 'NeuroSploit (Multi-Agent Orkestrasyonu)',
      badge: 'RED TEAM / BLUE TEAM KÖPRÜSÜ',
      desc: 'Gemini ve Claude gibi modelleri Metasploit, Nmap ve Nuclei araçlarıyla birleştirir. Ağ tarayıp uzaktan kod çalıştırma (RCE) komutları üretir.',
      features: ['Metasploit & Nmap Entegrasyonu', 'Otonom RCE Üretimi', 'Rol Tabanlı Ajan Paylaşımı'],
    },
  ];

  const advancedCapabilities = [
    {
      title: 'Deterministik Kanıt Üretimi (PoC Generation)',
      desc: 'Yapay zeka açığı bulmakla kalmaz; açığı sömürür, root şifresini kırıp ekrana getirir ve çalıştığına dair canlı PoC kodu/videosu üretir.',
    },
    {
      title: 'Sıfırıncı Gün (Zero-Day) Keşfi',
      desc: 'Linux çekirdeklerinde veya açık kaynaklı sistemlerde daha önce hiç görülmemiş derin kod açıklarını kendi mantığıyla bulup çıkarır.',
    },
    {
      title: 'MFA ve Oturum Çalma (Session Hijacking)',
      desc: 'Ele geçirilen kullanıcı oturum çerezlerini (Cookies) işleyerek iki aşamalı SMS veya kod doğrulama duvarlarını bypass eder.',
    },
    {
      title: 'Yapay Zekaya Karşı Saldırı (Adversarial AI)',
      desc: 'Prompt Injection (Yapay zekayı zehirleme) saldırıları ve Garak araçlarıyla hedef savunma yapay zekalarını kandırır.',
    },
  ];

  const handleRunQuickAction = (promptText: string) => {
    playTacticalSound('command_exec');
    setQuickFeedback(`⚡ Işık hızında komut gönderildi: "${promptText}"`);
    setTimeout(() => {
      onAskAssistant(promptText);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#000000] text-white overflow-hidden">
      {/* Top Header - Sleek Obsidian & Subtle Cyan Accent */}
      <div className="p-4 bg-[#0a0a0a] border-b border-gray-800 shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Bot className="w-5 h-5" />
                </div>
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  Sınırsız Asistan & Otonom AI Merkezi
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  PRO • %100 YEREL
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Fatura geçmişi, otonom siber güvenlik ajanları ve telefon otomasyonu
              </p>
            </div>

            {/* Sub Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 bg-black rounded-xl border border-gray-800 text-xs overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveSubTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  activeSubTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                Genel Bakış
              </button>
              <button
                onClick={() => setActiveSubTab('receipts')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'receipts' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Faturalar ({scannedReceipts.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('spend_analysis')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'spend_analysis' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analitik</span>
              </button>
              <button
                onClick={() => setActiveSubTab('cyber_ai')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'cyber_ai' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Otonom AI</span>
              </button>
              <button
                onClick={() => setActiveSubTab('security_status')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'security_status' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Güvenlik Özeti</span>
              </button>
              <button
                onClick={() => setActiveSubTab('automation')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'automation' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Otomasyon</span>
              </button>
              <button
                onClick={() => setActiveSubTab('local_model')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'local_model' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Yerel LLM</span>
              </button>
            </div>
          </div>

          {quickFeedback && (
            <div className="mt-2 text-xs text-emerald-400 font-mono animate-pulse">
              {quickFeedback}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* OVERVIEW SUB-TAB */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-blue-300 text-xs font-semibold">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      <span>Süper Akıllı Otonom Platform</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Tüm Hack Süreçleri ve Fatura Paylaşımları Tek Merkezde
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      XBOW, STRIX AI ve NeuroSploit otonom pentest motorları ile SplitWise AI fatura tarayıcı altyapısını birleştiren profesyonel siber asistan paneli.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <button
                      onClick={() => setActiveSubTab('receipts')}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Taranan Faturaları Gör</span>
                    </button>
                    <button
                      onClick={() => setActiveSubTab('cyber_ai')}
                      className="px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-gray-800 border border-gray-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Otonom AI Sistemleri</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  onClick={() => setActiveSubTab('receipts')}
                  className="p-5 rounded-2xl bg-[#0a0a0a] border border-gray-800 hover:border-gray-700 transition cursor-pointer space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-white">Taranan Faturalar</h4>
                  <p className="text-xs text-gray-400">
                    {scannedReceipts.length} adet faturanın kronolojik dökümü, vergi, bahşiş ve kişi paylaşımları.
                  </p>
                  <div className="pt-2 border-t border-gray-800 text-[11px] font-mono text-blue-400 flex items-center justify-between">
                    <span>Arşiv Aktif</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveSubTab('cyber_ai')}
                  className="p-5 rounded-2xl bg-[#0a0a0a] border border-gray-800 hover:border-gray-700 transition cursor-pointer space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-white">Otonom AI Pentest</h4>
                  <p className="text-xs text-gray-400">
                    XBOW, STRIX AI, NeuroSploit ve Sıfırıncı Gün (Zero-Day) keşif yetenekleri.
                  </p>
                  <div className="pt-2 border-t border-gray-800 text-[11px] font-mono text-amber-400 flex items-center justify-between">
                    <span>Süper Ajanlar Devrede</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveSubTab('local_model')}
                  className="p-5 rounded-2xl bg-[#0a0a0a] border border-gray-800 hover:border-gray-700 transition cursor-pointer space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-white">Cihaz İçi Model</h4>
                  <p className="text-xs text-gray-400">
                    Qwen3-0.6B ve Ollama Llama 3.1 ile internetsiz, sıfır API ücretiyle gizli çalışma.
                  </p>
                  <div className="pt-2 border-t border-gray-800 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                    <span>%100 Çevrimdışı</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RECEIPTS SUB-TAB */}
          {activeSubTab === 'receipts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span>Kronolojik Fatura Arşivi & Paylaşım Özetleri</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Daha önce taranmış tüm faturaların detaylı dökümleri ve kişi bazlı borç hesaplamaları
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs font-mono">
                  {scannedReceipts.length} Fatura Kayıtlı
                </span>
              </div>

              {scannedReceipts.length === 0 ? (
                <div className="p-12 rounded-3xl bg-[#0a0a0a] border border-gray-800 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base">Henüz Taranmış Fatura Bulunmuyor</h4>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      Yüzen sohbet balonundaki "Fatura Tara" butonunu kullanarak yeni bir restoran faturası taratın.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {scannedReceipts.map((rcpt, idx) => (
                    <div key={rcpt.id || idx} className="p-5 rounded-2xl bg-[#0a0a0a] border border-gray-800 space-y-4 shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-white">{rcpt.restaurantName}</h4>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900">
                              {rcpt.date || 'Tarih belirtilmemiş'}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
                            Kayıt ID: {rcpt.id} • {rcpt.items?.length || 0} Kalem Ürün
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-400">Toplam Tutar:</div>
                          <div className="text-lg font-black text-emerald-400 font-mono">
                            {rcpt.currency || '₺'}{rcpt.total?.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <div className="font-bold text-gray-300 uppercase tracking-wider text-[10px]">Kalemler:</div>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {rcpt.items?.map((item: any, iIdx: number) => (
                              <div key={iIdx} className="p-2 rounded-xl bg-black border border-gray-800 flex items-center justify-between">
                                <span className="text-gray-200">{item.name} (x{item.quantity})</span>
                                <span className="font-mono text-blue-300">{rcpt.currency || '₺'}{item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="font-bold text-gray-300 uppercase tracking-wider text-[10px]">Özet & Paylaşım:</div>
                          <div className="p-3 rounded-xl bg-black border border-gray-800 space-y-1.5 font-mono text-xs">
                            <div className="flex justify-between text-gray-400">
                              <span>Ara Toplam:</span>
                              <span>{rcpt.currency || '₺'}{rcpt.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Vergi (%8.88):</span>
                              <span>{rcpt.currency || '₺'}{rcpt.tax?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Bahşiş (%18):</span>
                              <span>{rcpt.currency || '₺'}{rcpt.tip?.toFixed(2)}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-800 flex justify-between font-bold text-white">
                              <span>Genel Toplam:</span>
                              <span className="text-emerald-400">{rcpt.currency || '₺'}{rcpt.total?.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                const mockSummary = {
                                  participantsShares: (rcpt.defaultParticipants || ['Siz', 'Selin', 'Ahmet']).map((name: string) => ({
                                    participantName: name,
                                    items: [],
                                    subtotal: (rcpt.subtotal || 0) / 3,
                                    taxShare: (rcpt.tax || 0) / 3,
                                    tipShare: (rcpt.tip || 0) / 3,
                                    total: (rcpt.total || 0) / 3,
                                    percentOfAssigned: 33.3,
                                    percentOfBill: 33.3,
                                  })),
                                  assignedSubtotal: rcpt.subtotal || 0,
                                  unassignedSubtotal: 0,
                                  totalSubtotal: rcpt.subtotal || 0,
                                  assignedItemsCount: rcpt.items?.length || 0,
                                  totalItemsCount: rcpt.items?.length || 0,
                                  totalTax: rcpt.tax || 0,
                                  totalTip: rcpt.tip || 0,
                                  grandTotal: rcpt.total || 0,
                                  unassignedItems: [],
                                  unassignedTax: 0,
                                  unassignedTip: 0,
                                  unassignedTotal: 0,
                                };
                                downloadReceiptPDF(mockSummary as any, rcpt.restaurantName, rcpt.currency || '₺', rcpt.items || []);
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-400" />
                              <span>PDF Raporu</span>
                            </button>

                            <button
                              onClick={() => {
                                const mockSummary = {
                                  participantsShares: (rcpt.defaultParticipants || ['Siz', 'Selin', 'Ahmet']).map((name: string) => ({
                                    participantName: name,
                                    items: [],
                                    subtotal: (rcpt.subtotal || 0) / 3,
                                    taxShare: (rcpt.tax || 0) / 3,
                                    tipShare: (rcpt.tip || 0) / 3,
                                    total: (rcpt.total || 0) / 3,
                                    percentOfAssigned: 33.3,
                                    percentOfBill: 33.3,
                                  })),
                                  assignedSubtotal: rcpt.subtotal || 0,
                                  unassignedSubtotal: 0,
                                  totalSubtotal: rcpt.subtotal || 0,
                                  assignedItemsCount: rcpt.items?.length || 0,
                                  totalItemsCount: rcpt.items?.length || 0,
                                  totalTax: rcpt.tax || 0,
                                  totalTip: rcpt.tip || 0,
                                  grandTotal: rcpt.total || 0,
                                  unassignedItems: [],
                                  unassignedTax: 0,
                                  unassignedTip: 0,
                                  unassignedTotal: 0,
                                };
                                downloadReceiptCSV(mockSummary as any, rcpt.restaurantName, rcpt.currency || '₺', rcpt.items || []);
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Excel</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SPEND ANALYSIS */}
          {activeSubTab === 'spend_analysis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span>Harcama Alışkanlıkları ve Analitik</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Fatura verilerinden üretilen aylık harcama trendleri
                  </p>
                </div>
              </div>
              <SpendAnalysisDashboard receipts={scannedReceipts} />
            </div>
          )}

          {/* CYBER AI */}
          {activeSubTab === 'cyber_ai' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-gray-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Otonom AI Pentest Süper Sistemleri</h3>
                    <p className="text-xs text-gray-400">Tüm hack süreçlerini tek bir merkezden yöneten sistemler</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {aiSuperSystems.map((sys, sIdx) => (
                    <div key={sIdx} className="p-4 rounded-2xl bg-black border border-gray-800 space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition">
                      <div className="space-y-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-900">
                          {sys.badge}
                        </span>
                        <h4 className="font-bold text-white text-base">{sys.name}</h4>
                        <p className="text-xs text-gray-300 leading-relaxed">{sys.desc}</p>
                        <ul className="space-y-1 text-[11px] text-gray-400 pt-1">
                          {sys.features.map((f, fIdx) => (
                            <li key={fIdx} className="flex items-center gap-1.5">
                              <span className="text-amber-400">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleRunQuickAction(`${sys.name} sistemini açıkla`)}
                        className="w-full py-2 rounded-xl bg-[#121212] hover:bg-gray-800 text-amber-300 border border-gray-700 text-xs font-bold transition flex items-center justify-center gap-1.5 mt-2"
                      >
                        <span>Detayları Sor</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-gray-800 space-y-4 shadow-xl">
                <h4 className="font-bold text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span>Gelişmiş Yetenekler</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {advancedCapabilities.map((cap, cIdx) => (
                    <div key={cIdx} className="p-4 rounded-2xl bg-black border border-gray-800 space-y-1.5">
                      <div className="font-bold text-blue-400 text-xs">{cap.title}</div>
                      <p className="text-xs text-gray-300 leading-relaxed">{cap.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECURITY STATUS */}
          {activeSubTab === 'security_status' && (
            <div className="w-full">
              <CyberSecurityStatusPanel onAskAssistant={onAskAssistant} />
            </div>
          )}

          {/* AUTOMATION */}
          {activeSubTab === 'automation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Neuron Doğal Dil Telefon Ajanı',
                    badge: 'CİHAZ İÇİ MODEL',
                    desc: 'Android 8.0+ cihazlarda Erişilebilirlik servisi ile ekrana dokunmadan uygulamaları açar.',
                    cmd: 'WhatsApp\'tan Ahmet\'e yaz',
                  },
                  {
                    name: 'Android Use Agent (ADB / USB)',
                    badge: 'OTONOM EKRAN KONTROLÜ',
                    desc: 'Yapay zekanın telefon ekranını kullanarak dokunma ve kaydırma hareketlerini yürütmesini sağlar.',
                    cmd: 'python -m android_use --task "Instagram kontrol"',
                  },
                  {
                    name: 'OpenClaw (Clawdbot)',
                    badge: 'MESAJLAŞMA & GÖREV',
                    desc: 'WhatsApp, Telegram ve Signal mesajlaşma uygulamalarını yerel yapay zekaya bağlar.',
                    cmd: 'openclaw onboard --provider ollama',
                  },
                  {
                    name: 'Hermes Agent (Nous Research)',
                    badge: 'KALICI HAFIZA',
                    desc: 'Oturumlar arasında hafızasını kaybetmeyen, dosya düzenleyen akıllı ajan.',
                    cmd: 'hermes run --task "Özetle"',
                  },
                ].map((feat, fIdx) => (
                  <div key={fIdx} className="p-5 rounded-2xl bg-[#0a0a0a] border border-gray-800 space-y-3 flex flex-col justify-between shadow-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base text-white">{feat.name}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-950 text-blue-300 border border-blue-900">
                          {feat.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{feat.desc}</p>
                      <div className="p-2.5 rounded-xl bg-black border border-gray-800 font-mono text-[11px] text-emerald-400">
                        • {feat.cmd}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRunQuickAction(`${feat.name} kur?`)}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition mt-3"
                    >
                      <span>Asistana Sor</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOCAL MODEL */}
          {activeSubTab === 'local_model' && (
            <div className="space-y-5">
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-gray-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Cihaz İçi Çevrimdışı Model</h3>
                      <p className="text-xs text-gray-400">Qwen3-0.6B Q4_K_M • Sıfır Maliyet</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  Bu model doğrudan telefonunuzun işlemcisinde çalışır. İnternetsiz, API anahtarsız gizli çalışma sağlar.
                </p>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black border border-gray-800">
                    <div className="text-[10px] text-gray-400">Boyut</div>
                    <div className="text-sm font-bold text-white mt-0.5">397 MB</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black border border-gray-800">
                    <div className="text-[10px] text-gray-400">API</div>
                    <div className="text-sm font-bold text-white mt-0.5">Gereksiz</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black border border-gray-800">
                    <div className="text-[10px] text-gray-400">Gizlilik</div>
                    <div className="text-sm font-bold text-white mt-0.5">%100 Yerel</div>
                  </div>
                </div>

                <button
                  onClick={onOpenOllamaModal}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Ollama Yapılandırmasını Aç</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
