import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Trophy,
  Brain,
  Shield,
  AlertTriangle,
  Target,
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { GameState, GameAnalysis, UserProfile, PlayerColor } from '../types/ludo';
import { getStoredMatchHistory, MatchHistoryEntry } from '../logic/elo';

interface AIAnalysisModalProps {
  gameState: GameState;
  userProfile: UserProfile;
  onClose: () => void;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  gameState,
  userProfile,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>(() =>
    getStoredMatchHistory(userProfile.elo)
  );

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState, userProfile }),
      });
      if (!res.ok) throw new Error('Analysis request failed');
      const data: GameAnalysis = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError('Unable to generate AI analysis right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalysis();
    setMatchHistory(getStoredMatchHistory(userProfile.elo));
  }, [userProfile.elo]);

  const redRating = analysis?.playerRatings?.['red'] || {
    aggressiveness: 75,
    tacticalEfficiency: 80,
    riskManagement: 70,
    blunderCount: 1,
    mvpToken: 1,
    tips: ['Keep an active reserve token on safe star cells.', 'Always prioritize capturing opponents entering home stretch.'],
  };

  // ELO stats computation over 20 matches
  const eloValues = matchHistory.map((m) => m.elo);
  const peakElo = eloValues.length > 0 ? Math.max(...eloValues) : userProfile.elo;
  const lowestElo = eloValues.length > 0 ? Math.min(...eloValues) : userProfile.elo;
  const initialElo = eloValues.length > 0 ? eloValues[0] : userProfile.elo;
  const netEloChange = userProfile.elo - initialElo;
  const winCount = matchHistory.filter((m) => m.result === 'win').length;
  const winRate = matchHistory.length > 0 ? Math.round((winCount / matchHistory.length) * 100) : 65;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Personalized Gemini AI Analysis</span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400">
                Post-Game Performance, Tactical Review & ELO Trend
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ELO Progress Line Chart (Recharts) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  ELO Rating Trajectory (Last 20 Matches)
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Real-time rating progression across recent ranked matches
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px]">Net Drift:</span>
                <span
                  className={`font-mono font-black flex items-center gap-0.5 ${
                    netEloChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {netEloChange >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {netEloChange >= 0 ? `+${netEloChange}` : netEloChange}
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                Win Rate: {winRate}%
              </div>
            </div>
          </div>

          {/* Recharts LineChart Component */}
          <div className="w-full h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={matchHistory}
                margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  domain={['dataMin - 30', 'dataMax + 30']}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as MatchHistoryEntry;
                      return (
                        <div className="p-3 rounded-xl bg-slate-900/95 border border-amber-500/40 text-slate-100 shadow-2xl backdrop-blur-md text-xs space-y-1">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
                            <span className="font-extrabold text-amber-300">
                              Match #{data.matchIndex}
                            </span>
                            <span className="text-[10px] text-slate-400">{data.formattedDate}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-0.5">
                            <span className="text-slate-400">Rating:</span>
                            <span className="font-mono font-black text-white text-sm">
                              {data.elo} ELO
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Match Delta:</span>
                            <span
                              className={`font-mono font-bold ${
                                data.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {data.delta >= 0 ? `+${data.delta}` : data.delta}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Result:</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                                data.result === 'win'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {data.result}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate pt-0.5">
                            vs {data.opponent} ({data.gameTitle})
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={userProfile.elo}
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  label={{
                    value: `Current: ${userProfile.elo}`,
                    fill: '#38bdf8',
                    fontSize: 9,
                    position: 'insideTopRight',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="elo"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 1.5 }}
                  activeDot={{
                    r: 6,
                    fill: '#fbbf24',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                    className: 'animate-pulse',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Bar below chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Peak Rating:</span>
              <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                <span>{peakElo}</span>
                <Award className="w-3 h-3 text-yellow-400" />
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Lowest:</span>
              <span className="font-mono font-bold text-slate-300">{lowestElo}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Matches Tracked:</span>
              <span className="font-mono font-bold text-blue-400">{matchHistory.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Wins Recorded:</span>
              <span className="font-mono font-bold text-emerald-400">
                {winCount} / {matchHistory.length}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-300">
              Gemini AI is analyzing your board moves & tactical blunders...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchAnalysis}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {analysis && !isLoading && (
          <div className="flex flex-col gap-6">
            {/* Champion Title Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-blue-500/20 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Assigned Archetype
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span>{analysis.championTitle || 'Master Strategist'}</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Current ELO</span>
                <p className="text-lg sm:text-xl font-extrabold text-amber-300">
                  {userProfile.elo} RATING
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-300">Match Overview: </span>
              {analysis.summary}
            </div>

            {/* Tactical Metrics Bar Graphs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-red-400" /> Aggressiveness
                  </span>
                  <span className="text-red-400">{redRating.aggressiveness}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${redRating.aggressiveness}%` }}
                    className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-cyan-400" /> Efficiency
                  </span>
                  <span className="text-cyan-400">{redRating.tacticalEfficiency}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${redRating.tacticalEfficiency}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" /> Risk Safety
                  </span>
                  <span className="text-emerald-400">{redRating.riskManagement}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${redRating.riskManagement}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Personalized Strategy Tips */}
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Personalized ELO Boosting Tips</span>
              </h4>
              <div className="flex flex-col gap-2">
                {redRating.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Turns Review */}
            {analysis.keyTurns && analysis.keyTurns.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-slate-200">Key Turn Timeline</h4>
                <div className="flex flex-col gap-2">
                  {analysis.keyTurns.map((kt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-extrabold text-[10px]">
                          Turn {kt.turnNumber}
                        </span>
                        <span className="text-slate-300">{kt.description}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          kt.impact === 'game_changer'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : kt.impact === 'blunder'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {kt.impact.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

