import React, { useState } from 'react';
import { motion, useDragControls } from 'motion/react';
import { X, Minimize2, Maximize2, GripHorizontal } from 'lucide-react';

interface DraggableWindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  defaultPosition?: { x: number; y: number };
  initialMinimized?: boolean;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({ 
  title, 
  children, 
  onClose, 
  defaultPosition = { x: 50, y: 100 },
  initialMinimized = false
}) => {
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const dragControls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, x: defaultPosition.x, y: defaultPosition.y }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed z-[100] min-w-[280px] max-w-md blue-glass rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
    >
      {/* Title Bar */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10 cursor-default select-none"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-white/30 cursor-grab active:cursor-grabbing" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded transition text-white/50 hover:text-white"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 hover:bg-red-500/20 rounded transition text-white/50 hover:text-red-400"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <motion.div 
        animate={{ height: isMinimized ? 0 : 'auto', opacity: isMinimized ? 0 : 1 }}
        className="p-4 overflow-hidden"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
