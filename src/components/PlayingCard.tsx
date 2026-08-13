import React from 'react';
import { motion } from 'motion/react';

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface CardData {
  suit: Suit;
  rank: Rank;
  isFaceUp?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
}

export interface PlayingCardProps {
  card: CardData;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const SUIT_COLORS: Record<Suit, { text: string; bgLight: string; border: string }> = {
  hearts: { text: 'text-red-600', bgLight: 'bg-red-50/50', border: 'border-red-200' },
  diamonds: { text: 'text-red-600', bgLight: 'bg-red-50/50', border: 'border-red-200' },
  spades: { text: 'text-slate-900', bgLight: 'bg-slate-50/50', border: 'border-slate-300' },
  clubs: { text: 'text-slate-900', bgLight: 'bg-slate-50/50', border: 'border-slate-300' },
};

/**
 * Renders authentic Royal Court Graphics for K, Q, J face cards matching reference image
 */
const RoyalCourtIllustration: React.FC<{ rank: Rank; suit: Suit }> = ({ rank, suit }) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const symbol = SUIT_SYMBOLS[suit];

  if (rank === 'K') {
    return (
      <div className="w-full h-full border border-amber-500/40 rounded bg-amber-50/40 relative overflow-hidden flex flex-col items-center justify-between p-1">
        {/* Crown & Robes SVG Graphic */}
        <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-sm">
          <rect x="2" y="2" width="56" height="76" rx="4" fill="#fffbeb" stroke="#d97706" strokeWidth="1" />
          {/* Royal Mantle Robes */}
          <path d="M 6 78 L 16 35 L 30 25 L 44 35 L 54 78 Z" fill={isRed ? '#b91c1c' : '#1e3a8a'} stroke="#b45309" strokeWidth="1" />
          <path d="M 12 78 L 22 40 L 30 30 L 38 40 L 48 78 Z" fill="#f59e0b" opacity="0.8" />
          {/* King Crown */}
          <polygon points="18,22 24,10 30,18 36,10 42,22" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <circle cx="24" cy="9" r="2" fill="#ef4444" />
          <circle cx="36" cy="9" r="2" fill="#3b82f6" />
          <circle cx="30" cy="7" r="2.5" fill="#10b981" />
          {/* King Beard & Head */}
          <circle cx="30" cy="24" r="8" fill="#fde68a" stroke="#78350f" strokeWidth="0.8" />
          <path d="M 22 26 Q 30 36 38 26 Q 30 38 22 26" fill="#f59e0b" />
          {/* Scepter / Suit Badge */}
          <text x="30" y="58" textAnchor="middle" fontSize="20" fill={isRed ? '#dc2626' : '#0f172a'} fontWeight="bold">
            {symbol}
          </text>
        </svg>
      </div>
    );
  }

  if (rank === 'Q') {
    return (
      <div className="w-full h-full border border-purple-400/40 rounded bg-purple-50/40 relative overflow-hidden flex flex-col items-center justify-between p-1">
        <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-sm">
          <rect x="2" y="2" width="56" height="76" rx="4" fill="#faf5ff" stroke="#7e22ce" strokeWidth="1" />
          <path d="M 8 78 L 18 32 L 30 22 L 42 32 L 52 78 Z" fill={isRed ? '#c026d3' : '#1d4ed8'} stroke="#6b21a8" strokeWidth="1" />
          <path d="M 14 78 L 22 38 L 30 28 L 38 38 L 46 78 Z" fill="#e9d5ff" opacity="0.9" />
          {/* Queen Tiara */}
          <polygon points="20,20 25,12 30,16 35,12 40,20" fill="#a855f7" stroke="#581c87" strokeWidth="1" />
          <circle cx="30" cy="9" r="2.5" fill="#f43f5e" />
          {/* Queen Head */}
          <circle cx="30" cy="23" r="7.5" fill="#fde68a" stroke="#581c87" strokeWidth="0.8" />
          <text x="30" y="58" textAnchor="middle" fontSize="20" fill={isRed ? '#dc2626' : '#0f172a'} fontWeight="bold">
            {symbol}
          </text>
        </svg>
      </div>
    );
  }

  // Jack
  return (
    <div className="w-full h-full border border-blue-400/40 rounded bg-blue-50/40 relative overflow-hidden flex flex-col items-center justify-between p-1">
      <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-sm">
        <rect x="2" y="2" width="56" height="76" rx="4" fill="#f0f9ff" stroke="#0369a1" strokeWidth="1" />
        <path d="M 10 78 L 18 35 L 30 25 L 42 35 L 50 78 Z" fill={isRed ? '#ea580c' : '#047857'} stroke="#075985" strokeWidth="1" />
        {/* Jack Feather Cap */}
        <path d="M 20 22 Q 30 12 40 22 Z" fill="#0284c7" stroke="#0c4a6e" strokeWidth="1" />
        <path d="M 38 18 Q 48 8 50 16" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Jack Head */}
        <circle cx="30" cy="24" r="7.5" fill="#fde68a" stroke="#0c4a6e" strokeWidth="0.8" />
        <text x="30" y="58" textAnchor="middle" fontSize="20" fill={isRed ? '#dc2626' : '#0f172a'} fontWeight="bold">
          {symbol}
        </text>
      </svg>
    </div>
  );
};

/**
 * Renders authentic number pip patterns (2 to 10 & Ace) matching original playing card deck layouts
 */
const PipPatternGrid: React.FC<{ rank: Rank; suit: Suit }> = ({ rank, suit }) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const symbol = SUIT_SYMBOLS[suit];
  const colorClass = isRed ? 'text-red-600' : 'text-slate-900';

  if (rank === 'A') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <span className={`text-4xl sm:text-5xl font-black ${colorClass} drop-shadow-md select-none transform hover:scale-110 transition`}>
          {symbol}
        </span>
      </div>
    );
  }

  const num = parseInt(rank, 10);
  if (isNaN(num)) return null;

  // Grid layout for 2 to 10
  return (
    <div className="w-full h-full p-1.5 flex flex-col justify-between items-center relative overflow-hidden">
      <div className="w-full flex justify-between px-1">
        <span className={`text-xs ${colorClass}`}>{symbol}</span>
        <span className={`text-xs ${colorClass}`}>{symbol}</span>
      </div>

      {num >= 4 && (
        <div className="w-full flex justify-between px-1">
          <span className={`text-xs ${colorClass}`}>{symbol}</span>
          <span className={`text-xs ${colorClass}`}>{symbol}</span>
        </div>
      )}

      {(num === 3 || num === 5 || num === 7 || num === 9) && (
        <div className="w-full flex justify-center">
          <span className={`text-xs ${colorClass}`}>{symbol}</span>
        </div>
      )}

      {num >= 6 && (
        <div className="w-full flex justify-between px-1">
          <span className={`text-xs ${colorClass}`}>{symbol}</span>
          <span className={`text-xs ${colorClass}`}>{symbol}</span>
        </div>
      )}

      {num >= 8 && (
        <div className="w-full flex justify-between px-1">
          <span className={`text-xs ${colorClass}`}>{symbol}</span>
          <span className={`text-xs ${colorClass}`}>{symbol}</span>
        </div>
      )}

      <div className="w-full flex justify-between px-1 transform rotate-180">
        <span className={`text-xs ${colorClass}`}>{symbol}</span>
        <span className={`text-xs ${colorClass}`}>{symbol}</span>
      </div>
    </div>
  );
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  size = 'md',
  onClick,
  className = '',
}) => {
  const { suit, rank, isFaceUp = true, isSelected = false, isDisabled = false } = card;

  const sizeClasses: Record<string, { card: string; indexRank: string; indexSymbol: string }> = {
    sm: { card: 'w-11 h-16 rounded-md', indexRank: 'text-xs font-black', indexSymbol: 'text-[10px]' },
    md: { card: 'w-16 h-24 sm:w-20 sm:h-28 rounded-xl', indexRank: 'text-sm sm:text-base font-black', indexSymbol: 'text-xs sm:text-sm' },
    lg: { card: 'w-20 h-30 sm:w-24 sm:h-36 rounded-xl', indexRank: 'text-base sm:text-lg font-black', indexSymbol: 'text-sm sm:text-base' },
    xl: { card: 'w-28 h-40 sm:w-32 sm:h-48 rounded-2xl', indexRank: 'text-xl sm:text-2xl font-black', indexSymbol: 'text-lg sm:text-xl' },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const theme = SUIT_COLORS[suit];
  const isFaceCard = rank === 'J' || rank === 'Q' || rank === 'K';

  // Card Back Render (Classic Bicycle Red Crosshatch Pattern)
  if (!isFaceUp) {
    return (
      <div
        className={`relative ${currentSize.card} bg-gradient-to-br from-red-700 via-red-800 to-red-950 border-2 border-white shadow-lg flex items-center justify-center p-1 overflow-hidden ${className}`}
        style={{
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.4)',
        }}
      >
        <div className="w-full h-full border border-red-300/40 rounded bg-red-900 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px]" />
          <div className="w-8 h-8 rounded-full border-2 border-amber-300/80 bg-red-950/80 flex items-center justify-center shadow-inner z-10">
            <span className="text-amber-300 text-xs font-black">♠</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: onClick && !isDisabled ? -6 : 0, scale: onClick && !isDisabled ? 1.05 : 1 }}
      whileTap={{ scale: onClick && !isDisabled ? 0.95 : 1 }}
      onClick={onClick}
      className={`relative ${currentSize.card} bg-white border-2 ${
        isSelected ? 'border-amber-400 ring-4 ring-amber-400/60 z-30' : theme.border
      } shadow-md flex flex-col justify-between p-1 select-none transition-all ${
        onClick && !isDisabled ? 'cursor-pointer hover:shadow-xl' : ''
      } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      style={{
        boxShadow: isSelected
          ? '0 10px 25px rgba(245, 158, 11, 0.5), 0 2px 5px rgba(0,0,0,0.2)'
          : 'inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.25)',
      }}
    >
      {/* Top-Left Corner Index (Rank + Suit Symbol) */}
      <div className="flex flex-col items-center leading-none z-10">
        <span className={`${currentSize.indexRank} ${theme.text} tracking-tight font-black`}>
          {rank}
        </span>
        <span className={`${currentSize.indexSymbol} ${theme.text} -mt-0.5`}>
          {SUIT_SYMBOLS[suit]}
        </span>
      </div>

      {/* Center Body (Royal Court Graphic or Pip Grid Pattern) */}
      <div className="absolute inset-2 sm:inset-3 flex items-center justify-center overflow-hidden">
        {isFaceCard ? (
          <RoyalCourtIllustration rank={rank} suit={suit} />
        ) : (
          <PipPatternGrid rank={rank} suit={suit} />
        )}
      </div>

      {/* Bottom-Right Rotated Corner Index (Matching Reference Image) */}
      <div className="flex flex-col items-center leading-none z-10 transform rotate-180 self-end">
        <span className={`${currentSize.indexRank} ${theme.text} tracking-tight font-black`}>
          {rank}
        </span>
        <span className={`${currentSize.indexSymbol} ${theme.text} -mt-0.5`}>
          {SUIT_SYMBOLS[suit]}
        </span>
      </div>
    </motion.div>
  );
};
