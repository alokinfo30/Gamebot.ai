import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  Play,
  X,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Filter,
  Users,
  Trophy,
  Zap,
  Globe
} from 'lucide-react';
import {
  LIVE_SPECTATABLE_MATCHES,
  SpectatableMatch,
  GamePlayMode
} from '../logic/multiplayerRoomManager';
import { soundManager } from '../logic/soundManager';

interface LiveSpectatorHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWatchMatch: (gameKey: string, match: SpectatableMatch) => void;
}

export const LiveSpectatorHubModal: React.FC<LiveSpectatorHubModalProps> = ({
  isOpen,
  onClose,
  onSelectWatchMatch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'board' | 'card' | 'sports'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const matches = LIVE_SPECTATABLE_MATCHES.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.gameTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.player1.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.player2.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredMatch = LIVE_SPECTATABLE_MATCHES[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                <Eye className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                    GAMEBOT.AI Live Watch Arena
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Spectate live matches in real time to learn official rules, turn tactics, and winning moves
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Featured Match Hero Card */}
            {featuredMatch && (
              <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/40 p-5 shadow-xl overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        ? Featured Match of the Moment
                      </span>
                      <span className="text-xs text-red-400 font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {featuredMatch.spectatorsCount} Watching
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white">{featuredMatch.gameTitle}</h3>

                    {/* Competitors */}
                    <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
                      <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span>{featuredMatch.player1.avatar}</span>
                        <span className="text-cyan-300">{featuredMatch.player1.name}</span>
                        <span className="text-[10px] text-cyan-400/80 font-mono">({featuredMatch.player1.elo})</span>
                      </div>
                      <span className="text-slate-500 font-mono">VS</span>
                      <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span>{featuredMatch.player2.avatar}</span>
                        <span className="text-amber-300">{featuredMatch.player2.name}</span>
                        <span className="text-[10px] text-amber-400/80 font-mono">({featuredMatch.player2.elo})</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span><strong>Rule Focus:</strong> {featuredMatch.ruleHighlight}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playVictory();
                      onSelectWatchMatch(featuredMatch.gameKey, featuredMatch);
                    }}
                    className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-indigo-600 to-blue-600 hover:from-red-500 hover:to-blue-500 font-black text-white text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Watch Match & Learn Rules</span>
                  </button>
                </div>
              </div>
            )}

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'All Live Games', icon: Globe },
                  { id: 'board', label: 'Board Games', icon: Trophy },
                  { id: 'card', label: 'Card Games', icon: Award },
                  { id: 'sports', label: 'Sports / 3D', icon: Zap },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        soundManager.playTickSound();
                        setSelectedCategory(tab.id as any);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                        selectedCategory === tab.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-bold text-slate-400">
                ?? {matches.length} Matches Live Now
              </span>
            </div>

            {/* Match Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 p-4 transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    {/* Top Status */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-white text-sm group-hover:text-indigo-400 transition">
                        {match.gameTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        ??? {match.spectatorsCount}
                      </span>
                    </div>

                    {/* Competitors Display */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{match.player1.avatar}</span>
                        <div>
                          <p className="text-slate-200">{match.player1.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{match.player1.elo} ELO</p>
                        </div>
                      </div>

                      <span className="text-slate-600 font-mono text-[10px]">VS</span>

                      <div className="flex items-center gap-1.5 text-right">
                        <div>
                          <p className="text-slate-200">{match.player2.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{match.player2.elo} ELO</p>
                        </div>
                        <span className="text-base">{match.player2.avatar}</span>
                      </div>
                    </div>

                    {/* Match Progress & Rule Snippet */}
                    <div className="space-y-1 text-xs">
                      <p className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1.5">
                        <Zap className="w-3 h-3" />
                        <span>{match.turnText}</span>
                      </p>
                      <p className="text-slate-400 text-[11px] line-clamp-2">
                        ?? <strong>Rule in Action:</strong> {match.ruleHighlight}
                      </p>
                    </div>
                  </div>

                  {/* Watch CTA */}
                  <button
                    onClick={() => {
                      soundManager.playVictory();
                      onSelectWatchMatch(match.gameKey, match);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-cyan-600 text-slate-200 group-hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Watch Match & Learn Rules</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
