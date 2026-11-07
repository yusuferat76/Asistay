import React, { useState } from 'react';
import { PersonShare } from '../types/bill';
import { getParticipantColor } from '../utils/splitCalculator';
import { ChevronDown, ChevronUp, Copy, Check, ReceiptText } from 'lucide-react';

interface PersonBreakdownCardProps {
  share: PersonShare;
  index: number;
  currency: string;
}

export const PersonBreakdownCard: React.FC<PersonBreakdownCardProps> = ({
  share,
  index,
  currency,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const color = getParticipantColor(index);

  const handleCopyNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const itemsList = share.items
      .map((it) => (it.shareFraction < 1 ? `${it.itemName} (shared, ${currency}${it.shareAmount.toFixed(2)})` : `${it.itemName} (${currency}${it.shareAmount.toFixed(2)})`))
      .join(', ');

    const note = `Hey ${share.participantName}, your total is ${currency}${share.total.toFixed(2)} (Subtotal: ${currency}${share.subtotal.toFixed(2)} [${itemsList}] + Tax: ${currency}${share.taxShare.toFixed(2)} + Tip: ${currency}${share.tipShare.toFixed(2)}).`;

    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        share.total > 0
          ? 'bg-slate-900/90 border-slate-700/80 shadow-sm'
          : 'bg-slate-900/40 border-slate-800/60 opacity-60'
      }`}
    >
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 cursor-pointer hover:bg-slate-800/40 transition flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${color.badge}`}
          >
            {share.participantName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 truncate">
                {share.participantName}
              </span>
              {share.items.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                  {share.items.length} {share.items.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            {share.percentOfBill > 0 && (
              <div className="text-[11px] text-slate-400">
                {share.percentOfBill}% of total bill
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="font-mono font-extrabold text-base text-emerald-400">
              {currency}{share.total.toFixed(2)}
            </span>
            <div className="text-[10px] text-slate-400 font-mono">
              sub: {currency}{share.subtotal.toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleCopyNote}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Copy payment request note"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button className="text-slate-500 hover:text-slate-300 transition">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded breakdown */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/40 text-xs space-y-2">
          {share.items.length === 0 ? (
            <div className="text-slate-500 text-center py-2 italic text-[11px]">
              No items assigned yet. Tell chat "Assign [item] to {share.participantName}".
            </div>
          ) : (
            <div className="space-y-1.5 divide-y divide-slate-800/40">
              <div className="space-y-1 pt-1">
                {share.items.map((item, idx) => (
                  <div key={`${item.itemId}-${idx}`} className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <ReceiptText className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{item.itemName}</span>
                      {item.shareFraction < 1 && (
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1 rounded border border-indigo-500/20">
                          {Math.round(item.shareFraction * 100)}%
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-200 shrink-0">
                      {currency}{item.shareAmount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tax & Tip row */}
              <div className="pt-2 space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-mono text-slate-200">{currency}{share.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Proportional Tax:</span>
                  <span className="font-mono text-slate-300">+{currency}{share.taxShare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Proportional Tip:</span>
                  <span className="font-mono text-slate-300">+{currency}{share.tipShare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-slate-100 text-sm">
                  <span>Total Due:</span>
                  <span className="font-mono text-emerald-400">{currency}{share.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
