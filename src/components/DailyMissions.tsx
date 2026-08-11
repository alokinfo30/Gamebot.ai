import React, { useState, useEffect } from 'react';
import { Trophy, Award, CheckCircle, Sparkles, Clock, Flame, Zap, Gift } from 'lucide-react';
import { UserProfile } from '../types/ludo';
import { saveUserProfile } from '../logic/elo';
import confetti from 'canvas-confetti';

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  eloReward: number;
  badgeReward: string;
  badgeIcon: string;
  isClaimed: boolean;
}

interface DailyMissionsProps {
  userProfile: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
}

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'win_3_games',
    title: 'Victory Streak',
    description: 'Win 3 matches across any game mode',
    target: 3,
    current: 1,
    eloReward: 150,
    badgeReward: 'Master Strategist',
    badgeIcon: '🏆',
    isClaimed: false,
  },
  {
    id: 'play_5_minutes',
    title: 'Game Time',
    description: 'Play for 5 minutes in any arena',
    target: 5,
    current: 5,
    eloReward: 50,
    badgeReward: 'Speed Runner',
    badgeIcon: '⚡',
    isClaimed: false,
  },
  {
    id: 'roll_10_sixes',
    title: 'Lucky Striker',
    description: 'Roll 10 Sixes in Ludo or Snakes',
    target: 10,
    current: 6,
    eloReward: 75,
    badgeReward: 'Lucky Sixer',
    badgeIcon: '🎲',
    isClaimed: false,
  },
  {
    id: 'capture_3_tokens',
    title: 'Token Hunter',
    description: 'Capture 3 opponent tokens in Ludo',
    target: 3,
    current: 2,
    eloReward: 100,
    badgeReward: 'Aggressive Hunter',
    badgeIcon: '💥',
    isClaimed: false,
  },
  {
    id: 'explore_3_games',
    title: 'Arena Explorer',
    description: 'Try 3 different games in the hub',
    target: 3,
    current: 3,
    eloReward: 100,
    badgeReward: 'Versatile Gamer',
    badgeIcon: '🕹️',
    isClaimed: false,
  },
];

const STORAGE_KEY = 'gamebot_daily_missions_v1';

export const DailyMissions: React.FC<DailyMissionsProps> = ({
  userProfile,
  onProfileUpdated,
}) => {
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load daily missions state:', e);
    }
    return DEFAULT_MISSIONS;
  });

  // Sync user wins/matches with mission targets
  useEffect(() => {
    setMissions((prev) => {
      let updated = false;
      const next = prev.map((m) => {
        if (m.id === 'win_3_games') {
          const newCurrent = Math.min(m.target, Math.max(m.current, userProfile.wins));
          if (newCurrent !== m.current) {
            updated = true;
            return { ...m, current: newCurrent };
          }
        }
        return m;
      });
      if (updated) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {}
        return next;
      }
      return prev;
    });
  }, [userProfile.wins]);

  const handleClaimReward = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.isClaimed || mission.current < mission.target) return;

    // Trigger celebration effects
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });

    // Update profile with ELO boost
    const updatedProfile: UserProfile = {
      ...userProfile,
      elo: userProfile.elo + mission.eloReward,
    };
    saveUserProfile(updatedProfile);
    if (onProfileUpdated) {
      onProfileUpdated(updatedProfile);
    }

    // Mark mission as claimed
    const updatedMissions = missions.map((m) =>
      m.id === missionId ? { ...m, isClaimed: true } : m
    );
    setMissions(updatedMissions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMissions));
    } catch (e) {}
  };

  const completedCount = missions.filter((m) => m.current >= m.target).length;

  return (
    <div className="w-full rounded-3xl bg-slate-900/90 border border-amber-500/30 p-6 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-md">
      {/* Glow Effect */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 text-xl font-black shadow-lg shadow-amber-500/20">
            🎯
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>Daily Quests & ELO Boosts</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40 uppercase">
                {completedCount}/{missions.length} Ready
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Complete daily challenges to earn exclusive profile badges and instant ELO rating boosts!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Resets in: 14h 22m</span>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {missions.map((mission) => {
          const isComplete = mission.current >= mission.target;
          const progressPercent = Math.min(100, Math.round((mission.current / mission.target) * 100));

          return (
            <div
              key={mission.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                mission.isClaimed
                  ? 'bg-slate-950/60 border-slate-800/60 opacity-75'
                  : isComplete
                  ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Mission Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <span>{mission.badgeIcon}</span>
                    <span>{mission.badgeReward}</span>
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    +{mission.eloReward} ELO
                  </span>
                </div>

                <h3 className="text-sm font-black text-white">{mission.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  {mission.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white font-bold">
                    {mission.current} / {mission.target}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isComplete
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800/80">
                {mission.isClaimed ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reward Claimed</span>
                  </button>
                ) : isComplete ? (
                  <button
                    onClick={() => handleClaimReward(mission.id)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer border border-amber-300/40"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Claim +{mission.eloReward} ELO & Badge</span>
                  </button>
                ) : (
                  <div className="w-full py-1.5 text-center text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    In Progress ({progressPercent}%)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
