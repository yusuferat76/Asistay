import React, { useState } from 'react';
import {
  Receipt,
  Upload,
  Share2,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenShare: () => void;
  onReset: () => void;
  onLoadSample: (sampleKey: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUpload,
  onOpenShare,
  onReset,
  onLoadSample,
}) => {
  const [isSampleOpen, setIsSampleOpen] = useState(false);

  return (
    <header className="h-16 bg-slate-950/95 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-20">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-0.5 shadow-lg shadow-emerald-950/40">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Receipt className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base tracking-tight text-white">
              SplitWise <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Split-Screen
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            AI Receipt Parser & Smart Conversational Tab Splitter
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Sample Receipts Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSampleOpen(!isSampleOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition"
          >
            <span>Load Sample</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSampleOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsSampleOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-30 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 space-y-1">
                <button
                  onClick={() => {
                    onLoadSample('sample-cantina');
                    setIsSampleOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <span className="text-base">🌮</span>
                  <div>
                    <div className="font-bold">El Toro Cantina</div>
                    <div className="text-[10px] text-slate-400">Nachos, Tacos, Margaritas ($124.46)</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onLoadSample('sample-pizzeria');
                    setIsSampleOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <span className="text-base">🍕</span>
                  <div>
                    <div className="font-bold">Bella Napoli Pizzeria</div>
                    <div className="text-[10px] text-slate-400">Pizza, Pasta, Beers ($133.35)</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onLoadSample('sample-sushi');
                    setIsSampleOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <span className="text-base">🍣</span>
                  <div>
                    <div className="font-bold">Sakura Omakase</div>
                    <div className="text-[10px] text-slate-400">Sushi rolls, Karaage ($87.08)</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Upload Receipt */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition shadow-sm"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Upload Receipt</span>
        </button>

        {/* Share Summary */}
        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition shadow-md shadow-emerald-950/30"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition"
          title="Reset tab and clear assignments"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
