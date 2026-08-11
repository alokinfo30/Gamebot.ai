import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Sparkles, X, ChevronRight, Target, ShieldCheck, Zap, Award } from 'lucide-react';
import { GameKey } from './GameHubHomePage';
import { LanguageCode } from '../logic/i18n';

export interface CoachRecommendation {
  action: string;
  reasoning: string;
  confidence?: string;
  proTip?: string;
}

interface CoachTooltipProps {
  gameKey: GameKey;
  turnNumber: number;
  usesRemaining: number;
  isHumanTurn: boolean;
  recommendation?: CoachRecommendation | null;
  language?: LanguageCode;
  onDismiss?: () => void;
  onHighlightMove?: () => void;
}

const DEFAULT_RECOMMENDATIONS: Record<GameKey, (turn: number) => CoachRecommendation> = {
  ludo: (turn) => ({
    action: turn === 1 ? 'Roll Dice & Aim for 6 to Deploy' : turn === 2 ? 'Advance to Safe Star Square (⭐)' : 'Execute Capture & Build Defense',
    reasoning: turn === 1
      ? 'Deploying base tokens immediately on a 6 unlocks movement and grants an extra roll!'
      : turn === 2
      ? 'Position tokens on safe Star squares (⭐) to block opponent captures and secure progress.'
      : 'Maintain 1–6 step distance behind opponent tokens to execute captures and gain bonus turns!',
    confidence: '98% Master Pro Heuristic',
    proTip: 'PRO TIP: Keep 2 active tokens spaced 5-8 steps apart on the circuit to create double capture zones.',
  }),

  chess: (turn) => ({
    action: turn === 1 ? 'Control Center with 1. e4 or 1. d4' : turn === 2 ? 'Develop Knights (Nf3 / Nc3)' : 'Castle Kingside (O-O) Early',
    reasoning: turn === 1
      ? 'Controlling central squares (e4, e5, d4, d5) unlocks your Bishops and Queen for maximum mobility.'
      : turn === 2
      ? 'Develop Knights before Bishops! Knights control central leap points effectively.'
      : 'Castle early to safeguard your King in the corner and connect your Rooks for midgame attacks.',
    confidence: '99% Grandmaster Engine',
    proTip: 'PRO TIP: Never move the same piece twice in the opening unless executing a tactical capture.',
  }),

  teen_patti: (turn) => ({
    action: turn === 1 ? 'Start with Blind Bet (1x)' : turn === 2 ? 'See Cards & Check Hand Rank' : 'Call or Request Sideshow',
    reasoning: turn === 1
      ? 'Playing Blind on turn 1 conserves 50% chip costs while putting pot pressure on opponents.'
      : turn === 2
      ? 'Evaluate hand strength (Trail > Pure Sequence > Sequence > Color > Pair > High Card).'
      : 'Request a Sideshow when holding a high Pair or Sequence against adjacent players to eliminate weak hands.',
    confidence: '95% Poker Odds Matrix',
    proTip: 'PRO TIP: If playing Seen against Blind players, raise 2x only when holding a Pure Sequence or higher.',
  }),

  rummy: (turn) => ({
    action: turn === 1 ? 'Draw Deck Card & Form Pure Sequence' : turn === 2 ? 'Discard High Unlinked Court Cards' : 'Utilize Wild Jokers in Impure Sets',
    reasoning: turn === 1
      ? 'Your mandatory #1 priority in Indian Rummy is forming a 3+ card Pure Sequence (no Jokers).'
      : turn === 2
      ? 'Discard high-point court cards (A, K, Q, J = 10 pts) early to minimize penalty points if opponent declares.'
      : 'Use Wild Jokers to complete secondary Impure Sequences and Sets after securing your Pure Sequence.',
    confidence: '97% Meld Solver',
    proTip: 'PRO TIP: Watch discard pile picks of opponents to avoid discarding cards of the same suit/rank.',
  }),

  satte: (turn) => ({
    action: turn === 1 ? 'Play 7 of Hearts Anchor' : turn === 2 ? 'Extend 6s or 8s Suit Tracks' : 'Hold End Cards (K/A) to Block',
    reasoning: turn === 1
      ? 'The 7 of Hearts is the mandatory starting anchor for Satte Pe Satta.'
      : turn === 2
      ? 'Expand suit ladders upwards to Kings or downwards to Aces.'
      : 'Hold high (King/Queen) or low (Ace/2) cards in hand to block opponents from shedding their cards!',
    confidence: '96% Grid Control',
    proTip: 'PRO TIP: If holding a 7 of another suit, hold it as long as possible to force opponents to pass turns.',
  }),

  coat_piece: (turn) => ({
    action: turn === 1 ? 'Lead High Cards of Strongest Suit' : turn === 2 ? 'Trump Opponent Lead if Void' : 'Save High Trumps for Final 7th Trick',
    reasoning: turn === 1
      ? 'Lead your longest suit to establish trick control with your partner.'
      : turn === 2
      ? 'If void in led suit, play a Trump (Rang) card to capture the trick pile for your team.'
      : 'Reserve high trumps to capture the crucial 7th deciding trick for the Coat bonus!',
    confidence: '94% Partnership Heuristic',
    proTip: 'PRO TIP: Always play low when your partner is already winning the current trick pile.',
  }),

  bhabhi: (turn) => ({
    action: turn === 1 ? 'Follow Led Suit with Medium Rank' : turn === 2 ? 'Shed Dangerous Court Cards' : 'Execute Thulla Cut if Void',
    reasoning: turn === 1
      ? 'Follow suit with medium cards to avoid taking the trick pile.'
      : turn === 2
      ? 'Shed high cards early when safe so you do not get stuck at the end.'
      : 'Thulla Cut: When void in suit, play another suit card to force the highest led suit player to swallow all cards!',
    confidence: '95% Elimination Defense',
    proTip: 'PRO TIP: Keep track of suits where you are void; they are your weapons to throw Thulla cuts.',
  }),

  poker: (turn) => ({
    action: turn === 1 ? 'Raise Pre-Flop with Premium Pairs' : turn === 2 ? 'Evaluate Flop Texture & Odds' : 'Bet Value or Fold on River',
    reasoning: turn === 1
      ? 'Raise 3x pre-flop with high pairs (A-A, K-K, Q-Q) or A-K suited to isolate opponents.'
      : turn === 2
      ? 'Check if Flop connects with your hole cards for sets, straight draws, or flush draws.'
      : 'Calculate pot odds before calling river bets; fold if draw missed.',
    confidence: '98% GTO Poker Engine',
    proTip: 'PRO TIP: Bet 60-70% of the pot on the flop when you hit top pair to price out draw chasers.',
  }),

  blackjack: (turn) => ({
    action: turn === 1 ? 'Double Down on 11 vs Dealer' : turn === 2 ? 'Split Aces and 8s Always' : 'Stand on Hard 17+',
    reasoning: turn === 1
      ? 'Always Double Down when holding 11 against any Dealer upcard!'
      : turn === 2
      ? 'Always split Aces and 8s; never split 10s or 5s.'
      : 'Dealer must hit until 17; stand on Hard 17+ to prevent busting.',
    confidence: '100% Basic Strategy Matrix',
    proTip: 'PRO TIP: Hit on Soft 17 (Ace + 6) because you cannot bust and have a free chance to reach 20 or 21.',
  }),

  solitaire: (turn) => ({
    action: turn === 1 ? 'Expose Hidden Tableau Cards First' : turn === 2 ? 'Move Aces to Foundation Piles' : 'Move Kings to Empty Columns',
    reasoning: turn === 1
      ? 'Always prioritize revealing face-down Tableau cards over drawing new Stock cards.'
      : turn === 2
      ? 'Build Foundations up by suit starting from Ace to King.'
      : 'Only move Kings into empty Tableau columns to unlock sub-stacks.',
    confidence: '96% Solver Algorithm',
    proTip: 'PRO TIP: Empty a Tableau column only when you have a King ready to fill it immediately.',
  }),

  donkey: (turn) => ({
    action: turn === 1 ? 'Pass High Cards to Left Player' : turn === 2 ? 'Assemble 4-of-a-Kind Set' : 'Grab Center Token Instantly',
    reasoning: turn === 1
      ? 'Pass unmatched high cards quickly to assemble a 4-of-a-kind set.'
      : turn === 2
      ? 'Focus on collecting 4 matching suit/rank cards.'
      : 'Grab the center token immediately as soon as any player completes 4-of-a-kind!',
    confidence: '92% Reflex Matrix',
    proTip: 'PRO TIP: Keep your eyes on the center token while passing cards to react in under 300ms.',
  }),

  bluff: (turn) => ({
    action: turn === 1 ? 'Shed Single Cards Truthfully' : turn === 2 ? 'Bluff 2-Card Claim on Clean Pile' : 'Challenge Suspicious 3-Card Claims',
    reasoning: turn === 1
      ? 'Play truthful single-card claims early while the pile is small.'
      : turn === 2
      ? 'Bluff with 2 cards when the center pile is clean so risk penalty is low.'
      : 'Call out "Bluff!" when opponents make improbable 3-card or 4-card rank claims!',
    confidence: '93% Deception Solver',
    proTip: 'PRO TIP: Count how many cards of that rank you hold in hand before challenging an opponent\'s claim.',
  }),

  snakes: (turn) => ({
    action: turn === 1 ? 'Roll Dice & Target Ladder Bases' : turn === 2 ? 'Calculate 1-6 Step Snake Risk' : 'Reserve High Rolls for Exact 100',
    reasoning: turn === 1
      ? 'Ladders provide massive vertical boosts bypassing rows of dangerous snakes.'
      : turn === 2
      ? 'Check if your landing tile is 1-6 steps behind a snake head.'
      : 'Land exactly on square 100 to claim victory!',
    confidence: '90% Path Solver',
    proTip: 'PRO TIP: Landing on square 98 or 99 is high risk due to the snake on 99; stay safe around square 95.',
  }),

  carrom: (turn) => ({
    action: turn === 1 ? '45° Baseline Break Strike' : turn === 2 ? 'Pocket Assigned Color or Queen' : 'Cover Queen with Follow-Up Shot',
    reasoning: turn === 1
      ? 'Position striker on baseline and strike central cluster at 45° to scatter coins toward pockets.'
      : turn === 2
      ? 'Pocket your assigned color coins (White or Black) in corner pockets.'
      : 'When pocketing the Red Queen (3 pts), you MUST pocket a follow-up coin on the next shot to cover it!',
    confidence: '95% Vector Dynamics',
    proTip: 'PRO TIP: Use bank shots off side cushions to hit coins blocked by opponent pieces.',
  }),

  snooker: (turn) => ({
    action: turn === 1 ? 'Pot Red Ball then Target Black (7 pts)' : turn === 2 ? 'Position Cue Ball for Next Red' : 'Play Safety Snooker Behind Baulk',
    reasoning: turn === 1
      ? 'Alternate Red -> Color -> Red. Target Black (7 pts) or Pink (6 pts) to maximize break points.'
      : turn === 2
      ? 'Control cue ball speed so it stops with an easy angle for the next Red ball.'
      : 'When no clear pot exists, play a safety shot behind baulk line to leave opponent snookered.',
    confidence: '97% Geometry Solver',
    proTip: 'PRO TIP: Apply bottom spin (screw-back) to stop the cue ball in place after pocketing a Red.',
  }),

  tt: (turn) => ({
    action: turn === 1 ? 'Deep Cross-Court Diagonal Serve' : turn === 2 ? 'Time Topspin Drive Right After Bounce' : 'Corner Smash Away from AI Paddle',
    reasoning: turn === 1
      ? 'Serve deep to opponent\'s backhand corner to force a weak return.'
      : turn === 2
      ? 'Time paddle contact immediately after table bounce to impart topspin speed.'
      : 'Smash angled shots away from AI paddle position to score points.',
    confidence: '94% Rally Trajectory',
    proTip: 'PRO TIP: Alternating shots between left and right corners forces the AI paddle out of position.',
  }),
};

export const CoachTooltip: React.FC<CoachTooltipProps> = ({
  gameKey,
  turnNumber,
  usesRemaining,
  isHumanTurn,
  recommendation,
  language = 'en',
  onDismiss,
  onHighlightMove,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    if (usesRemaining > 0) {
      setIsVisible(true);
    }
  }, [turnNumber, gameKey, usesRemaining]);

  if (!isVisible || usesRemaining <= 0) return null;

  const rec = recommendation || (DEFAULT_RECOMMENDATIONS[gameKey] ? DEFAULT_RECOMMENDATIONS[gameKey](turnNumber) : DEFAULT_RECOMMENDATIONS.ludo(turnNumber));
  const currentUseIndex = Math.min(3, 4 - usesRemaining);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl mx-auto my-2 z-40 relative px-3"
      >
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl shadow-indigo-950/50 backdrop-blur-md flex flex-col gap-2.5 relative overflow-hidden">
          {/* Top Ambient Gradient Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm flex items-center justify-center">
                <Lightbulb className="w-4 h-4 animate-bounce text-amber-300" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  AI Pro Coach
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                  <span>Suggestion {currentUseIndex} of 3</span>
                  <span className="text-amber-300 font-bold">({usesRemaining}/3 Left)</span>
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
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 flex items-start gap-2.5">
                <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 flex-wrap">
                    <span>Pro Recommended Move:</span>
                    <span className="text-white underline decoration-amber-400/50 decoration-2">{rec.action}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {rec.reasoning}
                  </p>

                  {rec.proTip && (
                    <div className="mt-1.5 p-2 rounded-lg bg-slate-950/80 border border-amber-500/30 text-[10px] text-amber-200 font-medium flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{rec.proTip}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Max 3 AI suggestions per game match</span>
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
                    <span>Use Suggestion ({usesRemaining}/3 Left)</span>
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
