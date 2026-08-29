import React from 'react';
import { PlayerColor } from '../types/ludo';

interface ClassicLudo3DPawnProps {
  color: PlayerColor;
  tokenId: number;
  isMovable?: boolean;
  isSelected?: boolean;
  isColorblindMode?: boolean;
}

export const ClassicLudo3DPawn: React.FC<ClassicLudo3DPawnProps> = ({
  color,
  tokenId,
  isMovable = false,
  isSelected = false,
  isColorblindMode = false,
}) => {
  const colorGradients: Record<
    PlayerColor,
    { headTop: string; headBot: string; bodyTop: string; bodyBot: string; halo: string; border: string }
  > = {
    red: {
      headTop: '#ff4d6d',
      headBot: '#a01a30',
      bodyTop: '#e63946',
      bodyBot: '#800f2f',
      halo: 'rgba(239, 68, 68, 0.75)',
      border: '#ff758f',
    },
    green: {
      headTop: '#38b000',
      headBot: '#104911',
      bodyTop: '#2b9348',
      bodyBot: '#004b23',
      halo: 'rgba(34, 197, 94, 0.75)',
      border: '#70e000',
    },
    yellow: {
      headTop: '#ffea00',
      headBot: '#a76d03',
      bodyTop: '#ffd000',
      bodyBot: '#704800',
      halo: 'rgba(234, 179, 8, 0.85)',
      border: '#fff066',
    },
    blue: {
      headTop: '#4ea8de',
      headBot: '#124570',
      bodyTop: '#0077b6',
      bodyBot: '#03045e',
      halo: 'rgba(59, 130, 246, 0.75)',
      border: '#90e0ef',
    },
  };

  const theme = colorGradients[color];
  const gradIdHead = `pawn_head_${color}_${tokenId}`;
  const gradIdBody = `pawn_body_${color}_${tokenId}`;

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* Active Movable Glowing Ripple Halo (Matching user reference image) */}
      {(isMovable || isSelected) && (
        <div
          className="absolute inset-0 rounded-full animate-ping pointer-events-none z-0 opacity-80"
          style={{
            background: `radial-gradient(circle, ${theme.halo} 0%, transparent 70%)`,
            boxShadow: `0 0 16px ${theme.halo}`,
          }}
        />
      )}

      {/* 3D Standing Pawn SVG Figurine */}
      <svg
        viewBox="0 0 100 110"
        className={`w-full h-full drop-shadow-[0_8px_10px_rgba(0,0,0,0.65)] transition-transform duration-200 z-10 ${
          isMovable ? 'animate-bounce scale-110' : ''
        } ${isSelected ? 'scale-125 z-20' : ''}`}
        style={{ transformOrigin: 'center bottom' }}
      >
        <defs>
          {/* Head Sphere Radial Gradient */}
          <radialGradient id={gradIdHead} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="25%" stopColor={theme.headTop} />
            <stop offset="100%" stopColor={theme.headBot} />
          </radialGradient>

          {/* Body Conical Gradient */}
          <linearGradient id={gradIdBody} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor={theme.bodyTop} />
            <stop offset="50%" stopColor={theme.bodyTop} />
            <stop offset="100%" stopColor={theme.bodyBot} />
          </linearGradient>

          {/* Specular Highlight Filter */}
          <filter id={`shadow_${color}_${tokenId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* 3D Base Floor Drop Shadow */}
        <ellipse cx="50" cy="94" rx="34" ry="9" fill="rgba(0,0,0,0.55)" filter="blur(2px)" />

        {/* Pawn Base Foot Flare */}
        <ellipse cx="50" cy="88" rx="32" ry="9" fill={`url(#${gradIdBody})`} stroke={theme.border} strokeWidth="1.5" />

        {/* Pawn Body Conical Waist */}
        <path
          d="M 32 46 Q 28 75 18 86 Q 50 94 82 86 Q 72 75 68 46 Z"
          fill={`url(#${gradIdBody})`}
          stroke={theme.border}
          strokeWidth="1.2"
        />

        {/* Body Specular Side Highlight */}
        <path d="M 36 48 C 32 65, 26 78, 22 84" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Pawn Neck Collar Ring */}
        <ellipse cx="50" cy="44" rx="20" ry="5.5" fill="#ffffff" opacity="0.9" />
        <ellipse cx="50" cy="44" rx="18" ry="4.5" fill={`url(#${gradIdHead})`} />

        {/* Pawn Spherical Head */}
        <circle cx="50" cy="24" r="18" fill={`url(#${gradIdHead})`} stroke={theme.border} strokeWidth="1.2" />

        {/* Head Specular White Gloss Spot */}
        <circle cx="43" cy="18" r="5" fill="#ffffff" opacity="0.75" />

        {/* Token Number Badge on Pawn Body */}
        <circle cx="50" cy="68" r="10" fill="rgba(15, 23, 42, 0.85)" stroke="#ffffff" strokeWidth="1.2" />
        <text
          x="50"
          y="72"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="11"
          fontWeight="900"
          fontFamily="sans-serif"
          className="drop-shadow"
        >
          {tokenId + 1}
        </text>
      </svg>
    </div>
  );
};
