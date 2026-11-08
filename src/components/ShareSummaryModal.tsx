import React, { useState } from 'react';
import { SplitSummary, ReceiptItem } from '../types/bill';
import { generateShareableSummary } from '../utils/splitCalculator';
import { downloadReceiptCSV, downloadReceiptPDF, shareSplitNative } from '../utils/exportHelpers';
import confetti from 'canvas-confetti';
import { Copy, Check, Download, X, Share2, FileSpreadsheet, FileText, Smartphone } from 'lucide-react';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SplitSummary;
  restaurantName: string;
  currency: string;
  items?: ReceiptItem[];
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  restaurantName,
  currency,
  items = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [sharedNative, setSharedNative] = useState(false);

  if (!isOpen) return null;

  const summaryText = generateShareableSummary(summary, restaurantName, currency);

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportCSV = () => {
    downloadReceiptCSV(summary, restaurantName, currency, items);
  };

  const handleExportPDF = () => {
    downloadReceiptPDF(summary, restaurantName, currency, items);
  };

  const handleNativeShare = async () => {
    const success = await shareSplitNative(summary, restaurantName, currency, items);
    if (success) {
      setSharedNative(true);
      setTimeout(() => setSharedNative(false), 2500);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-black border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-700/50 flex items-center justify-center text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Hesap Paylaşımı ve Dışa Aktarma</h3>
              <p className="text-xs text-blue-300">PDF, CSV, WhatsApp ve Yerel Paylaşım Intent Entegrasyonu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid (PDF, CSV, Native Share) */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <button
            onClick={handleExportPDF}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-blue-900/60 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 hover:text-white transition group"
          >
            <FileText className="w-5 h-5 text-blue-400 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">PDF Raporu</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-emerald-900/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-white transition group"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">CSV (Excel) İndir</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-indigo-900/60 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 hover:text-white transition group"
          >
            <Smartphone className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">Sistem Paylaşımı</span>
          </button>
        </div>

        {/* Text Area Preview */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-300 mb-2">
            Özet Metin Önizlemesi
          </label>
          <pre className="w-full h-52 p-3.5 bg-gray-950 border border-blue-900/40 rounded-xl text-xs font-mono text-gray-200 overflow-y-auto whitespace-pre-wrap select-all">
            {summaryText}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-blue-900/40">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-lg shadow-blue-950"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Panoya Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Metni Kopyala (WhatsApp / Telegram)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
