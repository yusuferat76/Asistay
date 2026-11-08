import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface BoundingBox {
  id: string;
  text: string;
  x: number; // Percent
  y: number; // Percent
  width: number; // Percent
  height: number; // Percent
  type: 'item' | 'price' | 'total' | 'store';
}

interface OCRVisualizerProps {
  imageUrl: string;
  boxes: BoundingBox[];
  onBoxClick?: (box: BoundingBox) => void;
  activeBoxId?: string | null;
}

export const OCRVisualizer: React.FC<OCRVisualizerProps> = ({
  imageUrl,
  boxes,
  onBoxClick,
  activeBoxId,
}) => {
  const [scale, setScale] = useState(1);
  const [isLoaded, setIsListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));
  const handleResetZoom = () => setScale(1);

  return (
    <div className="relative w-full h-full bg-[#020202] rounded-2xl border border-blue-900/40 overflow-hidden flex flex-col">
      {/* Visual Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-black/60 border border-blue-500/30 text-blue-400 hover:text-white backdrop-blur-md transition"
          title="Yakınlaştır"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-black/60 border border-blue-500/30 text-blue-400 hover:text-white backdrop-blur-md transition"
          title="Uzaklaştır"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 rounded-lg bg-black/60 border border-blue-500/30 text-blue-400 hover:text-white backdrop-blur-md transition"
          title="Sıfırla"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-auto cursor-crosshair scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent"
      >
        <div 
          className="relative min-w-full min-h-full transition-transform duration-200 origin-top-left flex items-center justify-center p-8"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="relative inline-block">
            {/* The Receipt Image */}
            <img 
              src={imageUrl} 
              alt="Receipt OCR Scan" 
              className="max-w-none block rounded shadow-2xl border border-white/10"
              onLoad={() => setIsListening(true)}
            />

            {/* The SVG Overlay for Bounding Boxes */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {boxes.map((box) => {
                const isActive = activeBoxId === box.id;
                const color = box.type === 'total' ? '#ef4444' : box.type === 'price' ? '#10b981' : '#3b82f6';
                
                return (
                  <g 
                    key={box.id}
                    className="pointer-events-auto cursor-pointer group"
                    onClick={() => onBoxClick?.(box)}
                  >
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      fill="transparent"
                      stroke={isActive ? '#ffffff' : color}
                      strokeWidth={isActive ? 0.8 : 0.4}
                      className="transition-all duration-200"
                      rx="0.2"
                    />
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      fill={color}
                      fillOpacity={isActive ? 0.3 : 0.05}
                      className="group-hover:fill-opacity-20 transition-all"
                    />
                    
                    {/* Tooltip on hover */}
                    <foreignObject
                      x={box.x}
                      y={box.y - 4 > 0 ? box.y - 4 : box.y + box.height}
                      width="40"
                      height="5"
                      className="overflow-visible pointer-events-none"
                    >
                      <div className={`whitespace-nowrap px-1.5 py-0.5 rounded text-[2px] font-bold text-white bg-black/80 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 w-fit`}>
                        <Activity className="w-[1.5px] h-[1.5px]" />
                        {box.text}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="p-3 bg-black border-t border-blue-900/40 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-blue-500" />
            <span>Kalemler</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-emerald-500" />
            <span>Fiyatlar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-red-500" />
            <span>Toplam</span>
          </div>
        </div>
        <div className="font-mono uppercase tracking-tighter">
          {boxes.length} veri bloğu algılandı
        </div>
      </div>
    </div>
  );
};

const Activity = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
