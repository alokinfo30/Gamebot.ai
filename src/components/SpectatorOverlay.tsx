import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  BookOpen,
  Play,
  Share2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Flame,
  Award,
  Zap,
  Info,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { getGameRuleLesson, GameRuleLesson } from '../logic/multiplayerRoomManager';
import { soundManager } from '../logic/soundManager';

interface SpectatorOverlayProps {
  gameKey: string;
  gameTitle: string;
  onPlayGame: () => void;
  onExitSpectator: () => void;
  matchInfo?: {
    player1Name?: string;
    player2Name?: string;
    turnText?: string;
    ruleHighlight?: string;
  };
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
}

export const SpectatorOverlay: React.FC<SpectatorOverlayProps> = ({
  gameKey,
  gameTitle,
  onPlayGame,
  onExitSpectator,
  matchInfo,
}) => {
  const [showRuleBook, setShowRuleBook] = useState<boolean>(false);
  const [spectatorCount, setSpectatorCount] = useState<number>(() => Math.floor(25 + Math.random() * 45));
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [ruleLesson, setRuleLesson] = useState<GameRuleLesson>(() => getGameRuleLesson(gameKey));

  useEffect(() => {
    setRuleLesson(getGameRuleLesson(gameKey));
  }, [gameKey]);

  // Simulate realistic organic viewer fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setSpectatorCount((prev) => Math.max(12, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSendReaction = (emoji: string) => {
    soundManager.playTickSound();
    const newEmoji: FloatingEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.floor(20 + Math.random() * 60),
    };
    setFloatingEmojis((prev) => [...prev.slice(-15), newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== newEmoji.id));
    }, 2500);
  };

  return (
    <div className="w-full space-y-3 mb-3">
      {/* Floating Spectator Particle Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingEmojis.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, y: '90vh', scale: 0.8, x: `${item.x}vw` }}
            animate={{ opacity: 0, y: '20vh', scale: 1.5 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute text-3xl select-none filter drop-shadow-md"
          >
            {item.emoji}
          </motion.div>
        ))}
      </div>

      {/* Main Top Spectator Navigation & Learning Bar */}
      <div className="w-full bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-slate-100 relative overflow-hidden">
        {/* Glowing top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-indigo-500 to-cyan-500 animate-pulse" />

        {/* Left: Live Badge & Match Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-mono font-black animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>LIVE WATCH</span>
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>{gameTitle}</span>
              <span className="text-xs font-bold text-indigo-400 hidden sm:inline">? Spectator Learning Mode</span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>??? {spectatorCount} Watching Live</span>
              <span>?</span>
              <span className="text-emerald-400 font-semibold">{matchInfo?.turnText || 'Real-time Autonomous Match'}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Reaction Bar */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {['??', '??', '??', '??', '??', '??'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 hover:scale-125 transition flex items-center justify-center text-sm cursor-pointer"
                title={`Send ${emoji} cheer`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Learn Rules Toggle */}
          <button
            onClick={() => {
              soundManager.playTickSound();
              setShowRuleBook((prev) => !prev);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
              showRuleBook
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-indigo-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showRuleBook ? 'Hide Rules' : 'Learn Rules'}</span>
            {showRuleBook ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Play This Game CTA */}
          <button
            onClick={() => {
              soundManager.playVictory();
              onPlayGame();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Now</span>
          </button>

          {/* Exit Spectator Mode */}
          <button
            onClick={onExitSpectator}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Exit Spectator Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Tactical Rule Explainer Banner */}
      <div className="w-full bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-indigo-300 uppercase tracking-wider text-[11px] block">
              ?? Live Rule Explanation
            </span>
            <p className="text-slate-200 font-medium">
              {matchInfo?.ruleHighlight || ruleLesson.objective}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-amber-300 font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Pro Tip: {ruleLesson.proTips[0]}</span>
        </div>
      </div>

      {/* Expandable Rulebook Drawer for Deep Learning */}
      <AnimatePresence>
        {showRuleBook && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-200 overflow-hidden space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Complete Rulebook & Guide: {gameTitle}
                </h4>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Beginner to Pro
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Box 1: Primary Objective */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-black text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>1. Game Objective</span>
                </span>
                <p className="text-slate-300 leading-relaxed">{ruleLesson.objective}</p>
                <p className="text-emerald-400 font-bold mt-2">?? Win Condition: {ruleLesson.winningRule}</p>
              </div>

              {/* Box 2: Core Turn Rules */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-black text-indigo-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. Turn Flow & Mechanics</span>
                </span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {ruleLesson.turnRules.map((rule, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Box 3: Strategic Masterclass */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-black text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>3. Masterclass Tips</span>
                </span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {ruleLesson.proTips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
