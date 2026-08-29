import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Shield, Zap, Target, Award, User, Bot, Wifi, CheckCircle2 } from 'lucide-react';
import { Player, UserProfile } from '../types/ludo';
import { getRankTier } from '../logic/elo';

interface PlayerProfileModalProps {
  player: Player;
  userProfile?: UserProfile;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  userProfile,
  onClose,
}) => {
  const isHuman = player.type === 'human';
  const elo = isHuman && userProfile ? userProfile.elo : player.elo || 1200;
  const tier = getRankTier(elo);

  const completedTokens = player.tokens.filter((t) => t.isHome).length;
  const baseTokens = player.tokens.filter((t) => t.isBase).length;
  const activeTokens = player.tokens.length - completedTokens - baseTokens;

  // Realistic stats mapping for Humans or AI Bots
  const matchesPlayed = isHuman && userProfile ? userProfile.matchesPlayed : (player.elo % 40) + 15;
  const wins = isHuman && userProfile ? userProfile.wins : Math.round(matchesPlayed * 0.62);
  const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 60;

  const colorThemeMap = {
    red: {
      bg: 'from-rose-950 via-slate-900 to-slate-950',
      border: 'border-rose-500/50',
      text: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      avatarBg: 'bg-rose-600',
    },
    green: {
      bg: 'from-emerald-950 via-slate-900 to-slate-950',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      avatarBg: 'bg-emerald-600',
    },
    yellow: {
      bg: 'from-amber-950 via-slate-900 to-slate-950',
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      avatarBg: 'bg-amber-500',
    },
    blue: {
      bg: 'from-blue-950 via-slate-900 to-slate-950',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      avatarBg: 'bg-blue-600',
    },
  };

  const theme = colorThemeMap[player.color];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        className={`relative w-full max-w-md rounded-3xl bg-gradient-to-b ${theme.bg} border ${theme.border} p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-5 overflow-hidden`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider flex items-center gap-1 ${theme.badgeBg}`}>
              {isHuman ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              <span>{isHuman ? 'Human Player' : `${player.botDifficulty || 'AI'} BOT`}</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Color: <strong className={theme.text}>{player.color.toUpperCase()}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player Core Info & Rank Avatar */}
        <div className="flex items-center gap-4">
          <div className={`relative w-16 h-16 rounded-2xl ${theme.avatarBg} border-2 border-white/40 flex items-center justify-center text-white font-black text-xl shadow-lg`}>
            {player.name.slice(0, 2).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 text-xl">{tier.badge}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-white truncate flex items-center gap-1.5">
              <span>{player.name}</span>
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </h3>
            <p className={`text-xs font-bold ${tier.color} flex items-center gap-1`}>
              <span>{tier.name}</span>
              <span className="text-slate-400 font-normal">({elo} ELO)</span>
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Status: <span className="text-emerald-400 font-semibold">Active in Board</span>
            </p>
          </div>
        </div>

        {/* Live In-Match Token Status */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-3 gap-2 text-center shadow-inner">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Yard</span>
            <span className="text-sm font-black text-amber-400 font-mono">{baseTokens} / 4</span>
          </div>
          <div className="border-x border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On Track</span>
            <span className="text-sm font-black text-blue-400 font-mono">{activeTokens} / 4</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Home Finished</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{completedTokens} / 4</span>
          </div>
        </div>

        {/* Career & Personality Statistics */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Win Rate</span>
              <span className="text-xs font-extrabold text-white font-mono">{winRate}% ({wins} Wins)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Matches</span>
              <span className="text-xs font-extrabold text-white font-mono">{matchesPlayed} Played</span>
            </div>
          </div>
        </div>

        {/* Player Badges & Honors */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Badges & Battle Tactics</span>
          </span>

          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-amber-300 flex items-center gap-1">
              <span>🎲</span> Dice Master
            </span>
            <span className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
              <span>🛡️</span> Star Safe Keeper
            </span>
            <span className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-blue-300 flex items-center gap-1">
              <span>⚡</span> Cut Striker
            </span>
          </div>
        </div>

        {/* Footer Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer"
        >
          Close Profile
        </button>
      </motion.div>
    </div>
  );
};
