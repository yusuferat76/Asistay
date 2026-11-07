import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ReceiptImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  restaurantName: string;
}

export const ReceiptImageModal: React.FC<ReceiptImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  restaurantName,
}) => {
  const [scale, setScale] = useState(1);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>Original Receipt:</span>
            <span className="text-indigo-400">{restaurantName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(3, s + 0.25))}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale(1)}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable image container */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/90">
          <img
            src={imageUrl}
            alt="Receipt preview"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            className="max-w-full max-h-[75vh] object-contain rounded-lg transition-transform duration-150 shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};
