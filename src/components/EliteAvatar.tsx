import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface EliteAvatarProps {
  isSpeaking?: boolean;
  intensity?: number; // 0 to 1
  mood?: 'neutral' | 'alert' | 'secure';
}

export const EliteAvatar: React.FC<EliteAvatarProps> = ({ 
  isSpeaking = false, 
  intensity = 0.5,
  mood = 'secure'
}) => {
  const statusColor = useMemo(() => {
    switch (mood) {
      case 'alert': return '#ef4444';
      case 'secure': return '#3b82f6';
      default: return '#94a3b8';
    }
  }, [mood]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background Aura */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.1, 1] : [1, 1.02, 1],
          opacity: isSpeaking ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${statusColor}44 0%, transparent 70%)` }}
      />

      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head Outline / Glass Surface */}
        <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="rgba(0,0,0,0.4)" />
        
        {/* Left Eye */}
        <g transform="translate(35, 45)">
          <circle cx="0" cy="0" r="6" stroke={statusColor} strokeWidth="0.5" />
          <motion.circle
            cx="0"
            cy="0"
            r="2"
            fill={statusColor}
            animate={{
              x: isSpeaking ? [-1, 1, -1] : [-0.5, 0.5, -0.5],
              y: isSpeaking ? [-1, 1, -1] : [-0.5, 0.5, -0.5],
              scale: isSpeaking ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Eyelid Blink */}
          <motion.rect
            x="-8"
            y="-10"
            width="16"
            height="0"
            fill="black"
            animate={{ height: [0, 0, 16, 0, 0] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] }}
          />
        </g>

        {/* Right Eye */}
        <g transform="translate(65, 45)">
          <circle cx="0" cy="0" r="6" stroke={statusColor} strokeWidth="0.5" />
          <motion.circle
            cx="0"
            cy="0"
            r="2"
            fill={statusColor}
            animate={{
              x: isSpeaking ? [1, -1, 1] : [0.5, -0.5, 0.5],
              y: isSpeaking ? [-1, 1, -1] : [-0.5, 0.5, -0.5],
              scale: isSpeaking ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Eyelid Blink */}
          <motion.rect
            x="-8"
            y="-10"
            width="16"
            height="0"
            fill="black"
            animate={{ height: [0, 0, 16, 0, 0] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] }}
          />
        </g>

        {/* Mouth / Sound Wave */}
        <g transform="translate(50, 70)">
          {isSpeaking ? (
            <motion.path
              d="M-15 0 Q0 10 15 0"
              stroke={statusColor}
              strokeWidth="2"
              strokeLinecap="round"
              animate={{
                d: [
                  "M-15 0 Q0 2 15 0",
                  "M-10 0 Q0 15 10 0",
                  "M-15 0 Q0 2 15 0"
                ]
              }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
          ) : (
            <motion.path
              d="M-10 0 Q0 0 10 0"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeLinecap="round"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </g>

        {/* HUD Overlay Elements */}
        <circle cx="50" cy="50" r="48" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.2" />
        <motion.path
          d="M20 10 A 40 40 0 0 1 80 10"
          stroke={statusColor}
          strokeWidth="0.5"
          strokeDasharray="2 2"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '50px 50px' }}
        />
      </svg>
    </div>
  );
};
