import React, { useState, useRef } from 'react';
import { Upload, FileImage, Sparkles, X, CheckCircle2, ArrowRight, MousePointer2, LayoutGrid, Eye } from 'lucide-react';
import { OCRVisualizer } from './OCRVisualizer';
import { PersonSharingMatrix } from './PersonSharingMatrix';
import { playTacticalSound } from '../utils/audioEffects';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptParsed: (receiptData: any) => void;
}

export const ReceiptUploadModal: React.FC<ReceiptUploadModalProps> = ({
  isOpen,
  onClose,
  onReceiptParsed,
}) => {
  const [viewMode, setViewMode] = useState<'upload' | 'visualize' | 'matrix'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [participants, setParticipants] = useState<string[]>(['Siz', 'Ahmet', 'Selin']);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Lütfen geçerli bir görsel yükleyin (PNG, JPG, WEBP).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('Fatura görüntüsü okunuyor...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          setScannedImage(base64Data);
          setLoadingStep('Gemini 3.8 Flash verileri analiz ediyor...');

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
            throw new Error(result.error || 'Fatura ayrıştırılamadı.');
          }

          setParsedData(result.receipt);
          setLoadingStep('Fatura başarıyla tarandı!');
          
          setTimeout(() => {
            playTacticalSound('command_exec');
            setViewMode('visualize');
            setIsLoading(false);
          }, 800);
        } catch (err: any) {
          console.error(err);
          setErrorMessage(err.message || 'Gemini ile iletişim hatası.');
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('Dosya okuma hatası.');
      setIsLoading(false);
    }
  };

  const handleToggleAssignment = (itemId: string, personName: string) => {
    if (!parsedData) return;
    const updatedItems = parsedData.items.map((it: any) => {
      if (it.id === itemId) {
        const cur = it.assignedTo || [];
        const next = cur.includes(personName) 
          ? cur.filter((p: string) => p !== personName) 
          : [...cur, personName];
        return { ...it, assignedTo: next };
      }
      return it;
    });
    setParsedData({ ...parsedData, items: updatedItems });
    playTacticalSound('click');
  };

  const handleComplete = () => {
    const finalReceipt = {
      ...parsedData,
      imageUrl: scannedImage,
      id: `rcpt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem('splitwise_scanned_receipts') || '[]');
      localStorage.setItem('splitwise_scanned_receipts', JSON.stringify([finalReceipt, ...existing]));
    } catch (e) {
      console.error(e);
    }
    onReceiptParsed(finalReceipt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full transition-all duration-500 bg-[#050505] border border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
        viewMode === 'upload' ? 'max-w-lg h-auto' : 'max-w-6xl h-[85vh]'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-blue-900/40 bg-gradient-to-r from-black to-[#0a163a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">SplitWise AI Fatura Tarayıcı</h3>
              <p className="text-xs text-blue-300/80">
                {viewMode === 'upload' ? 'Yapay zeka ile kalemleri, vergileri ve fiyatları çıkar' : 'OCR Sonuçları ve Paylaşım Matrisi'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode !== 'upload' && (
              <div className="flex bg-black border border-blue-900/40 rounded-xl p-1 mr-4">
                <button
                  onClick={() => setViewMode('visualize')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'visualize' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Görselleştir
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Matris
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-blue-950 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {viewMode === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-6 min-h-[300px] ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-blue-900/40 hover:border-blue-500 bg-black/40 hover:bg-blue-950/20'
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])} accept="image/*" className="hidden" />

              {isLoading ? (
                <div className="space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-2 border-4 border-blue-300 border-b-transparent rounded-full animate-spin-reverse" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-black text-blue-400 animate-pulse">{loadingStep}</div>
                    <p className="text-xs text-slate-500">Işık hızında OCR taraması yapılıyor...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-3xl bg-blue-900/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-xl group-hover:scale-110 transition-transform">
                    <FileImage className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-white">Fatura Görselini Buraya Sürükleyin</p>
                    <p className="text-sm text-slate-400">veya <span className="text-blue-500 font-bold underline">dosya seçin</span> (PNG, JPG, WEBP)</p>
                  </div>
                </>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-950/20 border border-red-500/40 text-red-400 text-xs rounded-xl font-bold">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {viewMode === 'visualize' && scannedImage && parsedData && (
            <div className="flex-1 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <OCRVisualizer 
                imageUrl={scannedImage} 
                boxes={parsedData.boundingBoxes || []} 
              />
            </div>
          )}

          {viewMode === 'matrix' && scannedImage && parsedData && (
            <div className="flex-1 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <PersonSharingMatrix 
                items={parsedData.items}
                participants={participants}
                onToggleAssignment={handleToggleAssignment}
                onAddParticipant={(n) => setParticipants([...participants, n])}
                onRemoveParticipant={(n) => setParticipants(participants.filter(p => p !== n))}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {viewMode !== 'upload' && (
          <div className="p-6 bg-black border-t border-blue-900/40 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500 font-mono">
                DURUM: <span className="text-emerald-400">ANALİZ TAMAMLANDI</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('upload')}
                className="px-6 py-2.5 rounded-xl border border-blue-900/60 text-blue-400 font-bold text-sm hover:bg-blue-900/10 transition"
              >
                Yeniden Yükle
              </button>
              <button
                onClick={handleComplete}
                className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-950 transition flex items-center gap-2"
              >
                <span>Paylaşımı Onayla</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
