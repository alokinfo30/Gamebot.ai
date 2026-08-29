import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Sparkles, X, ChevronRight, Target, CheckCircle2, Bot, ShieldCheck, Zap } from 'lucide-react';
import { GameKey } from './GameDemoGuideModal';
import { LanguageCode } from '../logic/i18n';

export interface CoachRecommendation {
  action: string;
  reasoning: string;
  confidence?: string;
}

interface CoachTooltipProps {
  gameKey: GameKey;
  turnNumber: number;
  isHumanTurn: boolean;
  recommendation?: CoachRecommendation | null;
  language?: LanguageCode;
  onDismiss?: () => void;
  onHighlightMove?: () => void;
}

const DEFAULT_RECOMMENDATIONS: Record<GameKey, (turn: number) => CoachRecommendation> = {
  ludo: (turn) => ({
    action: turn === 1 ? 'Roll Dice & Aim for 6' : turn === 2 ? 'Deploy or Advance Token' : 'Secure Safe Star Square',
    reasoning: turn === 1
      ? 'Rolling a 6 unlocks a token from your Base Yard and grants an extra roll turn!'
      : 'Keep your active token moving towards the safe Star square (⭐) to avoid capture.',
    confidence: '96% Strategy Match',
  }),

  chess: (turn) => ({
    action: turn === 1 ? 'Play 1. e4 or 1. d4' : turn === 2 ? 'Develop Knights (Nf3 / Nc3)' : 'Castle King (O-O)',
    reasoning: turn === 1
      ? 'Opening with e4 or d4 controls the 4 central squares and unlocks your Bishop and Queen.'
      : turn === 2
      ? 'Knights before Bishops! Move Knights toward the center to exert tactical influence.'
      : 'Castle early to safeguard your King in the corner and connect your Rooks.',
    confidence: '98% Grandmaster Pick',
  }),

  teen_patti: (turn) => ({
    action: turn === 1 ? 'Start with Blind Bet (1x)' : turn === 2 ? 'See Cards & Evaluate' : 'Call or Request Sideshow',
    reasoning: turn === 1
      ? 'Playing Blind on turn 1 keeps chip costs low while putting pressure on opponents.'
      : 'Check your 3-card hand ranking (Trail > Pure Sequence > Sequence > Color > Pair).',
    confidence: '92% Probability Engine',
  }),

  rummy: (turn) => ({
    action: turn === 1 ? 'Draw from Closed Deck & Form Pure Sequence' : turn === 2 ? 'Discard High Unmatched Cards' : 'Utilize Wild Jokers in Impure Sequence',
    reasoning: turn === 1
      ? 'Your absolute highest priority in Rummy is forming a Pure Sequence (no Jokers).'
      : 'Discard high court cards (A, K, Q, J = 10 pts) that do not fit into potential sequences.',
    confidence: '95% Meld Optimization',
  }),

  satte: (turn) => ({
    action: turn === 1 ? 'Play 7 of Hearts to Open Grid' : turn === 2 ? 'Play Adjacent 6s or 8s' : 'Hold High/Low Ends to Block',
    reasoning: turn === 1
      ? 'The 7 of Hearts is the mandatory starting anchor for Satte Pe Satta.'
      : 'Expand active suit tracks upwards to Kings or downwards to Aces.',
    confidence: '94% Grid Alignment',
  }),

  coat_piece: (turn) => ({
    action: turn === 1 ? 'Lead Highest Card of Selected Suit' : turn === 2 ? 'Support Partner Trick Lead' : 'Save High Trumps for Late Tricks',
    reasoning: turn === 1
      ? 'Establish suit dominance early with your partner to build towards 7 tricks.'
      : 'If your partner is winning the trick pile, play a low card to save high cards.',
    confidence: '91% Partner Heuristic',
  }),

  bhabhi: (turn) => ({
    action: turn === 1 ? 'Follow Led Suit with Medium Rank' : turn === 2 ? 'Shed Dangerous Court Cards' : 'Execute Thulla Cut if Void',
    reasoning: turn === 1
      ? 'Follow suit reliably to prevent swallowing the trick pile early.'
      : 'If void in suit, play a Thulla to force the highest suit card owner to swallow all cards!',
    confidence: '93% Elimination Defense',
  }),

  poker: (turn) => ({
    action: turn === 1 ? 'Evaluate Hole Cards & Call/Raise' : turn === 2 ? 'Check Flop Community Texture' : 'Assess Pot Odds on Turn',
    reasoning: turn === 1
      ? 'High pairs (A-A, K-K) or suited connectors (J-10) warrant aggressive pre-flop raises.'
      : 'Connect your 2 hole cards with the 3 flop cards to judge straight/flush draws.',
    confidence: '97% GTO Poker Engine',
  }),

  blackjack: (turn) => ({
    action: turn === 1 ? 'Check Starting Hand Total' : turn === 2 ? 'Double Down on 11 or Hit on Soft 16' : 'Stand on Hard 17+',
    reasoning: turn === 1
      ? 'Always Double Down when holding 11 against any Dealer upcard!'
      : 'Dealer must hit until 17; stand when holding 17+ to avoid busting.',
    confidence: '99% Basic Strategy Matrix',
  }),

  solitaire: (turn) => ({
    action: turn === 1 ? 'Expose Hidden Tableau Cards First' : turn === 2 ? 'Move Aces to Foundation Piles' : 'Draw 1/3 Cards from Stock',
    reasoning: turn === 1
      ? 'Always prioritize revealing face-down Tableau cards over drawing from Stock.'
      : 'Build Foundations up by suit from Ace to King.',
    confidence: '95% Puzzle Solver',
  }),

  donkey: (turn) => ({
    action: turn === 1 ? 'Follow Suit with Low Card' : turn === 2 ? 'Shed Unwanted High Cards' : 'Avoid Winning Dangerous Trick Piles',
    reasoning: 'Keep card counts low and avoid taking high trick penalty points.',
    confidence: '90% Avoidance Heuristic',
  }),

  bluff: (turn) => ({
    action: turn === 1 ? 'Shed Single Cards Truthfully' : turn === 2 ? 'Play Safe 2-Card Claim' : 'Challenge Suspicious Bluffs',
    reasoning: 'Play truthful low-card claims early while the center pile is clean.',
    confidence: '91% Deception Matrix',
  }),

  snakes: (turn) => ({
    action: turn === 1 ? 'Roll Dice & Target Ladder Shortcuts' : turn === 2 ? 'Avoid Snake Heads on Grid' : 'Aim for Exact 100 Square',
    reasoning: 'Ladders provide vertical boosts to bypass rows of dangerous snakes.',
    confidence: '88% Board Path Solver',
  }),

  carrom: (turn) => ({
    action: turn === 1 ? 'Aim Baseline Striker at Clustered Men' : turn === 2 ? 'Pocket Assigned Color or Queen' : 'Cover Queen with Follow-Up Shot',
    reasoning: 'Aim along baseline to break central cluster towards corner pockets.',
    confidence: '94% Vector Ballistics',
  }),

  snooker: (turn) => ({
    action: turn === 1 ? 'Aim Cue Ball to Strike Red Ball' : turn === 2 ? 'Pot Color Ball (Black = 7 pts)' : 'Position Cue Ball for Next Red',
    reasoning: 'Alternate Red -> Color -> Red. High-value colors like Black maximize break points.',
    confidence: '96% Geometry Solver',
  }),

  tt: (turn) => ({
    action: turn === 1 ? 'Execute Diagonal Cross-Court Serve' : turn === 2 ? 'Time Swing for Topspin Return' : 'Corner Push Away from AI Paddle',
    reasoning: 'Time paddle contact right after court bounce to impart topspin speed.',
    confidence: '93% Physics Trajectory',
  }),
};

export const CoachTooltip: React.FC<CoachTooltipProps> = ({
  gameKey,
  turnNumber,
  isHumanTurn,
  recommendation,
  language = 'en',
  onDismiss,
  onHighlightMove,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Auto show coach tips on turns 1, 2, and 3
  useEffect(() => {
    if (turnNumber <= 3) {
      setIsVisible(true);
    }
  }, [turnNumber, gameKey]);

  if (!isVisible || turnNumber > 3) return null;

  const rec = recommendation || (DEFAULT_RECOMMENDATIONS[gameKey] ? DEFAULT_RECOMMENDATIONS[gameKey](turnNumber) : DEFAULT_RECOMMENDATIONS.ludo(turnNumber));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl mx-auto my-2 z-40 relative px-3"
      >
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl shadow-indigo-950/50 backdrop-blur-md flex flex-col gap-2.5 relative overflow-hidden">
          {/* Subtle Top Ambient Light Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm flex items-center justify-center">
                <Lightbulb className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  AI Coach Guidance
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Turn {turnNumber} of 3
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {rec.confidence && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {rec.confidence}
                </span>
              )}

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition"
              >
                {isMinimized ? 'Expand' : 'Collapse'}
              </button>

              <button
                onClick={() => {
                  setIsVisible(false);
                  if (onDismiss) onDismiss();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Dismiss AI Coach"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expandable Body */}
          {!isMinimized && (
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-2.5">
                <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>Recommended Move:</span>
                    <span className="text-white underline decoration-amber-400/50 decoration-2">{rec.action}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {rec.reasoning}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 italic">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Coach automatically turns off after Turn 3</span>
                </div>

                <div className="flex items-center gap-2">
                  {onHighlightMove && (
                    <button
                      onClick={onHighlightMove}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>Highlight Move</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsVisible(false);
                      if (onDismiss) onDismiss();
                    }}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-[11px] shadow-sm transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Got it!</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
