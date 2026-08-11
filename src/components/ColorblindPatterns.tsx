import React from 'react';
import { PlayerColor } from '../types/ludo';

export const COLORBIND_SYMBOLS: Record<PlayerColor, string> = {
  red: '▲',
  green: '●',
  yellow: '◆',
  blue: '■',
};

export const COLORBIND_LABELS: Record<PlayerColor, { name: string; pattern: string; symbol: string }> = {
  red: { name: 'Red', pattern: 'Diagonal Stripes', symbol: '▲' },
  green: { name: 'Green', pattern: 'Polka Dots', symbol: '●' },
  yellow: { name: 'Yellow', pattern: 'Crosshatch Grid', symbol: '◆' },
  blue: { name: 'Blue', pattern: 'Horizontal Waves', symbol: '■' },
};

/**
 * SVG Pattern Definitions to be included once in the DOM or inside SVG boards
 */
export const ColorblindSvgDefs: React.FC = () => (
  <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
    <defs>
      {/* Red: Diagonal Stripes */}
      <pattern
        id="cb-pattern-red"
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect width="10" height="10" fill="transparent" />
        <line x1="0" y1="0" x2="0" y2="10" stroke="#ffffff" strokeWidth="3.5" opacity="0.6" />
      </pattern>

      {/* Green: Polka Dots */}
      <pattern
        id="cb-pattern-green"
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <rect width="10" height="10" fill="transparent" />
        <circle cx="5" cy="5" r="2.5" fill="#ffffff" opacity="0.75" />
      </pattern>

      {/* Yellow: Crosshatch Grid */}
      <pattern
        id="cb-pattern-yellow"
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <rect width="10" height="10" fill="transparent" />
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#000000" strokeWidth="2" opacity="0.6" />
      </pattern>

      {/* Blue: Waves / Horizontal Lines */}
      <pattern
        id="cb-pattern-blue"
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <rect width="10" height="10" fill="transparent" />
        <path d="M 0 5 Q 2.5 1, 5 5 T 10 5" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.7" />
      </pattern>
    </defs>
  </svg>
);

/**
 * Renders an inline SVG overlay rectangle filled with the colorblind pattern for a specific color.
 */
export const ColorblindPatternOverlay: React.FC<{
  color: PlayerColor;
  className?: string;
  opacity?: number;
}> = ({ color, className = 'absolute inset-0 pointer-events-none', opacity = 0.6 }) => {
  return (
    <svg className={className} width="100%" height="100%" opacity={opacity}>
      <rect width="100%" height="100%" fill={`url(#cb-pattern-${color})`} />
    </svg>
  );
};
