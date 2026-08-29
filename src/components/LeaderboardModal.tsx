import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, X, Medal, Flame, Target, Shield, UserCheck, Gamepad2, Star, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/ludo';
import { getRankTier } from '../logic/elo';

interface GameRankInfo {
  id: string;
  name: string;
  icon: string;
  userRank: string;
  elo: number;
  winRate: number;
  matchesPlayed: number;
  wins: number;
  topPercent: string;
}

interface LeaderboardModalProps {
  userProfile: UserProfile;
  currentGame?: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  userProfile,
  currentGame = 'ludo',
  onClose,
}) => {
  const [selectedGame, setSelectedGame] = useState<string>(currentGame || 'ludo');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Player's Game Ranks across gamebot.ai games
  const playerGameRanks: GameRankInfo[] = [
    {
      id: 'ludo',
      name: 'Ludo AI',
      icon: '🎲',
      userRank: '#4,102',
      elo: userProfile.elo || 1200,
      winRate: userProfile.matchesPlayed > 0 ? Math.round((userProfile.wins / userProfile.matchesPlayed) * 100) : 58,
      matchesPlayed: userProfile.matchesPlayed || 14,
      wins: userProfile.wins || 8,
      topPercent: 'Top 0.8%',
    },
    {
      id: 'chess',
      name: 'Grandmaster Chess',
      icon: '♟️',
      userRank: '#1,250',
      elo: (userProfile.elo || 1200) + 150,
      winRate: 68,
      matchesPlayed: 22,
      wins: 15,
      topPercent: 'Top 0.3%',
    },
    {
      id: 'teen_patti',
      name: 'Teen Patti 3-Card',
      icon: '🃏',
      userRank: '#890',
      elo: (userProfile.elo || 1200) + 220,
      winRate: 66,
      matchesPlayed: 18,
      wins: 12,
      topPercent: 'Top 0.2%',
    },
    {
      id: 'rummy',
      name: 'Indian Rummy',
      icon: '🎴',
      userRank: '#3,050',
      elo: (userProfile.elo || 1200) + 10,
      winRate: 55,
      matchesPlayed: 9,
      wins: 5,
      topPercent: 'Top 0.6%',
    },
    {
      id: 'carrom',
      name: '3D Carrom Board',
      icon: '🎯',
      userRank: '#2,100',
      elo: (userProfile.elo || 1200) + 80,
      winRate: 58,
      matchesPlayed: 12,
      wins: 7,
      topPercent: 'Top 0.4%',
    },
    {
      id: 'snooker',
      name: '8-Ball Snooker',
      icon: '🎱',
      userRank: '#1,840',
      elo: (userProfile.elo || 1200) + 110,
      winRate: 60,
      matchesPlayed: 10,
      wins: 6,
      topPercent: 'Top 0.4%',
    },
    {
      id: 'poker',
      name: 'Texas Poker',
      icon: '♠️',
      userRank: '#1,120',
      elo: (userProfile.elo || 1200) + 190,
      winRate: 69,
      matchesPlayed: 16,
      wins: 11,
      topPercent: 'Top 0.2%',
    },
    {
      id: 'satte',
      name: 'Satte Pe Satta',
      icon: '♥️',
      userRank: '#2,900',
      elo: (userProfile.elo || 1200) - 10,
      winRate: 57,
      matchesPlayed: 7,
      wins: 4,
      topPercent: 'Top 0.5%',
    },
    {
      id: 'snakes',
      name: 'Snakes & Ladders',
      icon: '🐍',
      userRank: '#5,200',
      elo: (userProfile.elo || 1200) - 20,
      winRate: 50,
      matchesPlayed: 8,
      wins: 4,
      topPercent: 'Top 1.1%',
    },
    {
      id: 'tt',
      name: '3D Table Tennis',
      icon: '🏓',
      userRank: '#2,400',
      elo: (userProfile.elo || 1200) + 50,
      winRate: 55,
      matchesPlayed: 11,
      wins: 6,
      topPercent: 'Top 0.5%',
    },
    {
      id: 'bluff',
      name: 'Bluff Challenge',
      icon: '🃏',
      userRank: '#3,100',
      elo: (userProfile.elo || 1200) + 5,
      winRate: 50,
      matchesPlayed: 6,
      wins: 3,
      topPercent: 'Top 0.6%',
    },
    {
      id: 'blackjack',
      name: 'Blackjack 21',
      icon: '🪙',
      userRank: '#1,950',
      elo: (userProfile.elo || 1200) + 100,
      winRate: 61,
      matchesPlayed: 13,
      wins: 8,
      topPercent: 'Top 0.4%',
    },
  ];

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/elo/leaderboard?game=${selectedGame}`);
        const data = await res.json();
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } catch (e) {
        console.error('Leaderboard error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, [selectedGame]);

  const activeGameInfo = playerGameRanks.find((g) => g.id === selectedGame) || playerGameRanks[0];
  const activeTier = getRankTier(activeGameInfo.elo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col gap-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>World Leaderboards & Game Ranks</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                  gamebot.ai
                </span>
              </h2>
              <p className="text-xs text-slate-400">Your competitive standings and top global players by game</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Player's Game Ranks */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>My Game Ranks ({playerGameRanks.length} Played Games)</span>
            </h3>
            <span className="text-[10px] text-slate-500">Click game card to view top players</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {playerGameRanks.map((game) => {
              const tier = getRankTier(game.elo);
              const isSelected = selectedGame === game.id;
              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`p-3 rounded-2xl text-left border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500/60 ring-1 ring-amber-500/30 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{game.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{game.name}</span>
                        {isSelected && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Matches: {game.matchesPlayed} | Wins: {game.wins} ({game.winRate}%)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-blue-400 block">{game.userRank}</span>
                    <span className="text-[10px] font-bold text-amber-300 font-mono">{game.elo} ELO</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Selected Game Active Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeGameInfo.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-white text-base">{userProfile.name}</h4>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 ${activeTier.color}`}>
                  {activeGameInfo.name} Rank
                </span>
              </div>
              <p className="text-xs text-slate-400">
                World Position: <span className="text-blue-400 font-mono font-bold">{activeGameInfo.userRank}</span> ({activeGameInfo.topPercent})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Game ELO</span>
              <p className="text-lg font-black text-amber-400">{activeGameInfo.elo}</p>
            </div>
            <div className="h-7 w-[1px] bg-slate-800" />
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Win Rate</span>
              <p className="text-lg font-black text-emerald-400">{activeGameInfo.winRate}%</p>
            </div>
          </div>
        </div>

        {/* Section 3: Game Selector Filter Bar & Top Competitive Players */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Top Competitive Players for {activeGameInfo.name}</span>
            </h4>

            {/* Quick Game Switcher */}
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              {playerGameRanks.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.icon} {g.name} Top Players
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 animate-pulse">Loading {activeGameInfo.name} standings...</div>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((player) => {
                const tier = getRankTier(player.elo);
                const isTop1 = player.rank === 1;
                const isTop2 = player.rank === 2;
                const isTop3 = player.rank === 3;

                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                      isTop1
                        ? 'bg-amber-950/30 border-amber-500/40'
                        : isTop2
                        ? 'bg-slate-800/80 border-slate-600/50'
                        : isTop3
                        ? 'bg-amber-900/20 border-amber-700/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 font-black text-center flex items-center justify-center">
                        {isTop1 ? (
                          <span className="text-amber-400 text-base">🥇</span>
                        ) : isTop2 ? (
                          <span className="text-slate-300 text-base">🥈</span>
                        ) : isTop3 ? (
                          <span className="text-amber-600 text-base">🥉</span>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">#{player.rank}</span>
                        )}
                      </div>

                      <span className="text-xl">{tier.badge}</span>

                      <div>
                        <p className="font-extrabold text-white flex items-center gap-1.5">
                          <span>{player.name}</span>
                          {isTop1 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                              CHAMPION
                            </span>
                          )}
                        </p>
                        <span className={`text-[10px] font-bold ${tier.color}`}>{tier.name}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-amber-300 text-sm font-mono">{player.elo} ELO</span>
                      <p className="text-[10px] text-slate-400 font-mono">{player.wins} Wins | {player.matchesPlayed} Matches</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
