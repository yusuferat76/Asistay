import React, { useState } from 'react';
import { SplitSummary } from '../types/bill';
import { generateShareableSummary } from '../utils/splitCalculator';
import confetti from 'canvas-confetti';
import { Copy, Check, Download, X, Share2, Sparkles } from 'lucide-react';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SplitSummary;
  restaurantName: string;
  currency: string;
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  restaurantName,
  currency,
}) => {
  const [copied, setCopied] = useState(false);

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

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([summaryText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${restaurantName.replace(/\s+/g, '_')}_split.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Share Bill Breakdown</h3>
              <p className="text-xs text-slate-400">Formatted for Venmo, WhatsApp, and group chats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Area Preview */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Summary Preview
          </label>
          <pre className="w-full h-64 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 overflow-y-auto whitespace-pre-wrap select-all">
            {summaryText}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700/60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition shadow-lg shadow-emerald-900/30"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy for Venmo / Chat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
