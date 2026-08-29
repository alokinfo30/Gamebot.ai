import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Trophy, Award, CheckCircle2, Sparkles, Flame, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types/ludo';

interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  eloReward: number;
  badgeReward: string;
  claimed: boolean;
  icon: string;
}

interface DailyMissionsProps {
  userProfile?: UserProfile;
  onRewardClaimed?: (eloBoost: number, badge: string) => void;
}

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'roll_dice',
    title: 'Dice Roller',
    description: 'Play 1 match of Ludo or any board game',
    target: 1,
    current: 1,
    eloReward: 15,
    badgeReward: '🎲 Dice Roller',
    claimed: false,
    icon: '🎲',
  },
  {
    id: 'beat_ai',
    title: 'AI Tactician',
    description: 'Win 1 game against Gemini AI bots',
    target: 1,
    current: 1,
    eloReward: 30,
    badgeReward: '🧠 AI Tactician',
    claimed: false,
    icon: '🧠',
  },
  {
    id: 'camera_gestures',
    title: 'Cyber Motion',
    description: 'Activate AI Camera Gesture Controls in any game',
    target: 1,
    current: 1,
    eloReward: 20,
    badgeReward: '📷 Cyber Motion',
    claimed: false,
    icon: '📷',
  },
  {
    id: 'play_time',
    title: 'Game Enthusiast',
    description: 'Play for 5 minutes total across game modes',
    target: 5,
    current: 5,
    eloReward: 25,
    badgeReward: '⏱️ Dedicated Player',
    claimed: false,
    icon: '⏱️',
  },
  {
    id: 'win_games',
    title: 'Grand Master',
    description: 'Win 3 total games in any mode',
    target: 3,
    current: 3,
    eloReward: 50,
    badgeReward: '🏆 Grand Master',
    claimed: false,
    icon: '🏆',
  },
];

export const DailyMissions: React.FC<DailyMissionsProps> = ({ userProfile, onRewardClaimed }) => {
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem('gamebot_daily_missions_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_MISSIONS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('gamebot_daily_missions_v1', JSON.stringify(missions));
    } catch (e) {}
  }, [missions]);

  const handleClaim = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && !m.claimed) {
          if (onRewardClaimed) {
            onRewardClaimed(m.eloReward, m.badgeReward);
          }
          setToastMessage(`🎉 Claimed +${m.eloReward} ELO and "${m.badgeReward}" badge!`);
          setTimeout(() => setToastMessage(null), 4000);
          return { ...m, claimed: true };
        }
        return m;
      })
    );
  };

  const completedCount = missions.filter((m) => m.claimed || m.current >= m.target).length;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 p-5 shadow-xl relative overflow-hidden my-6">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
            <Target className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>Daily Missions & Badges</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Resets Daily
              </span>
            </h3>
            <p className="text-xs text-slate-400">Complete tasks to unlock ELO boosts and exclusive profile badges</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>
            Missions Completed: <strong className="text-emerald-400 font-extrabold">{completedCount}/{missions.length}</strong>
          </span>
        </div>
      </div>

      {/* Claim Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="my-3 p-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>{toastMessage}</span>
            </div>
            <span className="text-[10px] uppercase font-mono text-emerald-400">Profile Updated</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
        {missions.map((m) => {
          const isComplete = m.current >= m.target;
          const pct = Math.min(100, Math.round((m.current / m.target) * 100));

          return (
            <div
              key={m.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                m.claimed
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-70'
                  : isComplete
                  ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-600/10'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">{m.icon}</span>
                    <div>
                      <h4 className="text-xs font-black text-white">{m.title}</h4>
                      <p className="text-[11px] text-slate-400">{m.description}</p>
                    </div>
                  </div>
                </div>

                {/* Rewards pill */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    +{m.eloReward} ELO
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {m.badgeReward}
                  </span>
                </div>
              </div>

              {/* Progress & Claim Button */}
              <div className="pt-3 mt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Progress</span>
                    <span>{m.current}/{m.target}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        m.claimed
                          ? 'bg-slate-600'
                          : isComplete
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {m.claimed ? (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[11px] font-bold flex items-center gap-1 border border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Claimed</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleClaim(m.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1 shadow-sm cursor-pointer ${
                      isComplete
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{isComplete ? 'Claim!' : 'In Progress'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
