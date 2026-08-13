import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { PlayerColor } from '../types/ludo';
import { soundManager } from '../logic/soundManager';

interface DiceProps {
  value: number | null;
  onRoll: () => void;
  disabled: boolean;
  currentColor: PlayerColor;
  hasRolled: boolean;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  onRoll,
  disabled,
  currentColor,
  hasRolled,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const handleRollClick = () => {
    if (disabled || isRolling || hasRolled) return;

    setIsRolling(true);
    soundManager.playDiceRoll();

    setTimeout(() => {
      setIsRolling(false);
      onRoll();
    }, 600);
  };

  // Touch Swipe to Roll Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffY) > 30) {
      handleRollClick();
    }
    touchStartY.current = null;
  };

  const colorThemes: Record<PlayerColor, { bg: string; text: string; glow: string; name: string }> = {
    red: { bg: 'from-red-600 to-red-800', text: 'text-red-400', glow: 'shadow-red-600/60 ring-red-500', name: 'RED' },
    green: { bg: 'from-emerald-600 to-emerald-800', text: 'text-emerald-400', glow: 'shadow-emerald-600/60 ring-emerald-500', name: 'GREEN' },
    yellow: { bg: 'from-amber-500 to-amber-700', text: 'text-amber-300', glow: 'shadow-amber-500/60 ring-amber-400', name: 'YELLOW' },
    blue: { bg: 'from-blue-600 to-blue-800', text: 'text-blue-400', glow: 'shadow-blue-600/60 ring-blue-500', name: 'BLUE' },
  };

  const theme = colorThemes[currentColor];

  // Render 3D Inset Dice Pips
  const renderDiceFace = (num: number | null) => {
    if (num === null) {
      return (
        <span className="text-xl text-slate-500 font-black tracking-widest uppercase drop-shadow-md">
          ROLL
        </span>
      );
    }

    const dotMap: Record<number, string[]> = {
      1: ['center'],
      2: ['top-right', 'bottom-left'],
      3: ['top-right', 'center', 'bottom-left'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };

    const dots = dotMap[num] || [];

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 p-1 gap-1 items-center justify-center">
        {Array.from({ length: 9 }).map((_, idx) => {
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          let posTag = '';
          if (row === 0 && col === 0) posTag = 'top-left';
          if (row === 0 && col === 2) posTag = 'top-right';
          if (row === 1 && col === 1) posTag = 'center';
          if (row === 1 && col === 0) posTag = 'middle-left';
          if (row === 1 && col === 2) posTag = 'middle-right';
          if (row === 2 && col === 0) posTag = 'bottom-left';
          if (row === 2 && col === 2) posTag = 'bottom-right';

          const isActive = dots.includes(posTag);

          return (
            <div key={idx} className="flex items-center justify-center">
              {isActive && (
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    num === 1 ? 'bg-red-600 w-3.5 h-3.5' : 'bg-slate-900'
                  } shadow-[inset_0_2px_3px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.8)] border border-slate-700`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 select-none">
      <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 shadow-md">
        <span>Turn:</span>
        <span className={`font-black ${theme.text}`}>{theme.name}</span>
      </div>

      <motion.button
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleRollClick}
        disabled={disabled || isRolling || hasRolled}
        whileHover={{ scale: disabled || hasRolled ? 1 : 1.08 }}
        whileTap={{ scale: disabled || hasRolled ? 1 : 0.90 }}
        animate={
          isRolling
            ? {
                rotateX: [0, 360, 720],
                rotateY: [0, 540, 1080],
                scale: [1, 1.25, 1],
              }
            : {}
        }
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          boxShadow:
            'inset 0 4px 6px rgba(255,255,255,0.9), inset 0 -5px 10px rgba(0,0,0,0.45), 0 10px 20px rgba(0,0,0,0.6)',
        }}
        className={`relative w-22 h-22 rounded-3xl bg-gradient-to-br from-slate-100 via-white to-slate-300 border-4 border-slate-200 flex items-center justify-center cursor-pointer transition-all ${
          !disabled && !hasRolled
            ? `ring-4 ring-offset-2 ring-offset-slate-950 ${theme.glow} animate-pulse`
            : 'opacity-70 cursor-not-allowed'
        }`}
      >
        {/* 3D Specular Highlight Dome */}
        <div className="absolute top-1 left-2 right-2 h-3 rounded-t-full bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

        {/* Dice Face Content */}
        {renderDiceFace(isRolling ? Math.floor(Math.random() * 6) + 1 : value)}

        {/* Swipe prompt hint */}
        {!hasRolled && !disabled && (
          <span className="absolute -bottom-5 text-[10px] text-slate-400 font-extrabold tracking-tight">
            Tap or Swipe ⬆
          </span>
        )}
      </motion.button>
    </div>
  );
};
