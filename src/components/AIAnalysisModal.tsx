import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Brain, Shield, AlertTriangle, Target, X, RefreshCw } from 'lucide-react';
import { GameState, GameAnalysis, UserProfile, PlayerColor } from '../types/ludo';

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
  }, []);

  const redRating = analysis?.playerRatings?.['red'] || {
    aggressiveness: 75,
    tacticalEfficiency: 80,
    riskManagement: 70,
    blunderCount: 1,
    mvpToken: 1,
    tips: ['Keep an active reserve token on safe star cells.', 'Always prioritize capturing opponents entering home stretch.'],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Personalized Gemini AI Analysis</span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400">
                Post-Game Performance & Tactical Review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
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
              className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
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
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span>{analysis.championTitle || 'Master Strategist'}</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Current ELO</span>
                <p className="text-xl font-extrabold text-amber-300">{userProfile.elo} RATING</p>
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
                <div className="w-full h-full h-2 rounded-full bg-slate-800 overflow-hidden">
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
