import React, { useState, useRef } from 'react';
import { Upload, FileImage, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptParsed: (receiptData: any) => void;
  onLoadSample: (sampleKey: string) => void;
}

export const ReceiptUploadModal: React.FC<ReceiptUploadModalProps> = ({
  isOpen,
  onClose,
  onReceiptParsed,
  onLoadSample,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('Reading receipt image...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          setLoadingStep('Gemini 3.8 Flash analyzing receipt items & prices...');

          const response = await fetch('/api/receipt/parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type,
            }),
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to parse receipt.');
          }

          setLoadingStep('Receipt parsed successfully!');
          setTimeout(() => {
            onReceiptParsed({
              ...result.receipt,
              imageUrl: base64Data,
            });
            setIsLoading(false);
            onClose();
          }, 400);
        } catch (err: any) {
          console.error(err);
          setErrorMessage(err.message || 'Error communicating with Gemini.');
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('Failed to read file.');
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Upload Receipt</h3>
              <p className="text-xs text-slate-400">Gemini will extract items, quantities, taxes, and prices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="mt-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {isLoading ? (
              <div className="py-4 space-y-3">
                <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-indigo-300 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>{loadingStep}</span>
                  </div>
                  <p className="text-xs text-slate-400">This usually takes 2-4 seconds</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-300">
                  <FileImage className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Drag and drop your receipt image here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    or <span className="text-indigo-400 font-semibold underline">browse files</span> (PNG, JPG, WEBP)
                  </p>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl">
              {errorMessage}
            </div>
          )}
        </div>

        {/* One-click Sample Receipts */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Or Try A Sample Receipt
            </span>
            <span className="text-[11px] text-slate-500">Instant test</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => {
                onLoadSample('sample-cantina');
                onClose();
              }}
              disabled={isLoading}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-left transition group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🌮</span>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition">
                    El Toro Mexican Cantina
                  </div>
                  <div className="text-[11px] text-slate-400">
                    6 items (Nachos, Tacos, Fajitas, Margaritas) • $124.46
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
            </button>

            <button
              onClick={() => {
                onLoadSample('sample-pizzeria');
                onClose();
              }}
              disabled={isLoading}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-left transition group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🍕</span>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition">
                    Bella Napoli Pizzeria & Bar
                  </div>
                  <div className="text-[11px] text-slate-400">
                    6 items (Pizza, Truffle Pasta, Calamari, Beers) • $133.35
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
            </button>

            <button
              onClick={() => {
                onLoadSample('sample-sushi');
                onClose();
              }}
              disabled={isLoading}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-left transition group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🍣</span>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition">
                    Sakura Omakase & Izakaya
                  </div>
                  <div className="text-[11px] text-slate-400">
                    6 items (Crunch Roll, Dragon Roll, Karaage, Tea) • $87.08
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
