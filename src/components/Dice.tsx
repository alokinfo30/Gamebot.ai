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

    // Swipe up or down detected (>30px displacement)
    if (Math.abs(diffY) > 30) {
      handleRollClick();
    }
    touchStartY.current = null;
  };

  const colorThemes: Record<PlayerColor, { bg: string; text: string; glow: string; name: string }> = {
    red: { bg: 'from-red-600 to-red-800', text: 'text-red-400', glow: 'shadow-red-600/50', name: 'RED' },
    green: { bg: 'from-emerald-600 to-emerald-800', text: 'text-emerald-400', glow: 'shadow-emerald-600/50', name: 'GREEN' },
    yellow: { bg: 'from-amber-500 to-amber-700', text: 'text-amber-300', glow: 'shadow-amber-500/50', name: 'YELLOW' },
    blue: { bg: 'from-blue-600 to-blue-800', text: 'text-blue-400', glow: 'shadow-blue-600/50', name: 'BLUE' },
  };

  const theme = colorThemes[currentColor];

  // Render 3D Dice Dots
  const renderDiceFace = (num: number | null) => {
    if (num === null) {
      return <span className="text-2xl text-slate-400 font-bold">ROLL</span>;
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
      <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 p-1.5 gap-1 items-center justify-center">
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
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-inner border border-slate-700" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 select-none">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <span>Turn:</span>
        <span className={`font-black ${theme.text}`}>{theme.name}</span>
      </div>

      <motion.button
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleRollClick}
        disabled={disabled || isRolling || hasRolled}
        whileHover={{ scale: disabled || hasRolled ? 1 : 1.05 }}
        whileTap={{ scale: disabled || hasRolled ? 1 : 0.92 }}
        animate={
          isRolling
            ? {
                rotateX: [0, 360, 720],
                rotateY: [0, 360, 720],
                scale: [1, 1.2, 1],
              }
            : {}
        }
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-300 border-4 border-slate-300 shadow-xl flex items-center justify-center cursor-pointer transition-all ${
          !disabled && !hasRolled
            ? `ring-4 ring-offset-2 ring-offset-slate-950 ${theme.glow} animate-pulse`
            : 'opacity-80 cursor-not-allowed'
        }`}
      >
        {/* Dice Face Content */}
        {renderDiceFace(isRolling ? Math.floor(Math.random() * 6) + 1 : value)}

        {/* Swipe prompt hint */}
        {!hasRolled && !disabled && (
          <span className="absolute -bottom-5 text-[10px] text-slate-400 font-medium tracking-tight">
            Tap or Swipe ⬆
          </span>
        )}
      </motion.button>
    </div>
  );
};
