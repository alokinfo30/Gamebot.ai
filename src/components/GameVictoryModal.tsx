import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Share2, Award, Sparkles, PartyPopper } from 'lucide-react';
import { soundManager } from '../logic/soundManager';

interface GameVictoryModalProps {
  isOpen: boolean;
  winnerName: string;
  isHumanWinner: boolean;
  gameTitle: string;
  scoreText?: string;
  eloBonus?: number;
  onPlayAgain: () => void;
  onBackToHub: () => void;
}

export const GameVictoryModal: React.FC<GameVictoryModalProps> = ({
  isOpen,
  winnerName,
  isHumanWinner,
  gameTitle,
  scoreText,
  eloBonus = 25,
  onPlayAgain,
  onBackToHub,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (isHumanWinner) {
        soundManager.playVictory();
        // Multi-stage confetti celebration blast
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'],
          });
          confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'],
          });

          if (Date.now() < animationEnd) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } else {
        soundManager.playCapture();
      }
    }
  }, [isOpen, isHumanWinner]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          className={`w-full max-w-md bg-slate-900 border ${
            isHumanWinner ? 'border-amber-400/60 shadow-amber-500/30' : 'border-rose-500/40 shadow-rose-950/50'
          } rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden text-center`}
        >
          {/* Glowing Top Ambient Ribbon */}
          <div
            className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${
              isHumanWinner
                ? 'from-amber-400 via-yellow-300 to-amber-500'
                : 'from-rose-500 via-amber-500 to-rose-600'
            }`}
          />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Large Victory Badge Icon */}
          <div className="relative inline-block mt-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border-2 shadow-xl ${
                isHumanWinner
                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 border-amber-200 text-slate-950 shadow-amber-500/50'
                  : 'bg-gradient-to-tr from-slate-800 to-slate-700 border-slate-600 text-amber-400'
              }`}
            >
              {isHumanWinner ? (
                <Trophy className="w-10 h-10 fill-current text-slate-950 drop-shadow-md" />
              ) : (
                <PartyPopper className="w-10 h-10 text-amber-400" />
              )}
            </motion.div>
            {isHumanWinner && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
              </span>
            )}
          </div>

          {/* Title & Winner Name */}
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block">
              {gameTitle} • MATCH COMPLETED
            </span>
            <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <span>{isHumanWinner ? '🏆 VICTORY CHAMPION!' : '🤖 MATCH ENDED'}</span>
            </h2>
            <p className="text-base font-extrabold text-slate-200 pt-1">
              Winner: <span className={isHumanWinner ? 'text-amber-300' : 'text-slate-300'}>{winnerName}</span>
            </p>
          </div>

          {/* Stats & ELO Reward Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-medium text-slate-300">
            {scoreText && (
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Match Score:</span>
                <span className="font-bold text-white font-mono">{scoreText}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ELO Rating Delta:</span>
              <span className={`font-mono font-black ${isHumanWinner ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isHumanWinner ? `+${eloBonus} ELO BOOST 🚀` : '-15 ELO'}
              </span>
            </div>
          </div>

          {/* Celebration Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onBackToHub}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Game Hub</span>
            </button>

            <button
              onClick={onPlayAgain}
              className="py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-950" />
              <span>Play Again</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
