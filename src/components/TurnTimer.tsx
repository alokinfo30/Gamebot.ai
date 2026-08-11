import React from 'react';
import { Timer, Zap, AlertTriangle } from 'lucide-react';
import { PlayerColor } from '../types/ludo';

interface TurnTimerProps {
  secondsLeft: number;
  maxSeconds?: number;
  turnColor: PlayerColor;
  hasRolled: boolean;
  playerName?: string;
  isHuman: boolean;
}

export const TurnTimer: React.FC<TurnTimerProps> = ({
  secondsLeft,
  maxSeconds = 15,
  turnColor,
  hasRolled,
  playerName,
  isHuman,
}) => {
  const percentage = Math.max(0, Math.min(100, (secondsLeft / maxSeconds) * 100));
  const isUrgent = secondsLeft <= 4;
  const isCritical = secondsLeft <= 2;

  const colorBorderMap: Record<PlayerColor, string> = {
    red: 'border-rose-500/50 bg-rose-950/30',
    green: 'border-emerald-500/50 bg-emerald-950/30',
    yellow: 'border-amber-500/50 bg-amber-950/30',
    blue: 'border-blue-500/50 bg-blue-950/30',
  };

  const progressBgClass = isCritical
    ? 'bg-rose-500 animate-pulse'
    : isUrgent
    ? 'bg-amber-400'
    : 'bg-emerald-400';

  return (
    <div
      className={`w-full p-2.5 rounded-xl border transition-all ${colorBorderMap[turnColor]} ${
        isCritical ? 'ring-2 ring-rose-500/60 shadow-lg shadow-rose-500/20' : 'shadow-md'
      }`}
    >
      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
        <div className="flex items-center gap-1.5 text-slate-200">
          <Timer
            className={`w-4 h-4 ${
              isCritical
                ? 'text-rose-400 animate-bounce'
                : isUrgent
                ? 'text-amber-400 animate-pulse'
                : 'text-emerald-400'
            }`}
          />
          <span className="uppercase tracking-wider text-[11px] font-mono">
            {hasRolled ? 'Move Timer' : 'Roll Timer'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isUrgent && (
            <span className="text-[10px] text-rose-400 font-extrabold uppercase animate-pulse flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" />
              Hurry!
            </span>
          )}
          <span
            className={`font-mono text-sm font-extrabold px-2 py-0.5 rounded ${
              isCritical
                ? 'bg-rose-500 text-white animate-pulse'
                : isUrgent
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-emerald-400 border border-slate-700'
            }`}
          >
            {secondsLeft}s
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${progressBgClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>{playerName || turnColor.toUpperCase()} Turn</span>
        <span>{isHuman ? 'Human Player' : 'AI Agent'}</span>
      </div>
    </div>
  );
};
