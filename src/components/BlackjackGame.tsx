import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Coins, Plus, Hand, Shield } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface BlackjackGameProps {
  language: LanguageCode;
  isMuted: boolean;
  isColorblindMode: boolean;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2..14 (14 = Ace)
}

const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
const VAL_LABELS: Record<number, string> = {
  11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

const getCardLabel = (card: Card) => {
  const v = VAL_LABELS[card.value] || card.value.toString();
  return `${v}${card.suit}`;
};

const calculateScore = (cards: Card[]): number => {
  let total = 0;
  let aces = 0;

  cards.forEach((c) => {
    if (c.value >= 10 && c.value <= 13) {
      total += 10;
    } else if (c.value === 14) {
      aces += 1;
      total += 11;
    } else {
      total += c.value;
    }
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
};

export const BlackjackGame: React.FC<BlackjackGameProps> = ({
  language,
  isMuted,
  isColorblindMode,
}) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerChips, setPlayerChips] = useState<number>(500);
  const [bet, setBet] = useState<number>(50);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [commentary, setCommentary] = useState<string | null>(
    '🃏 Blackjack 21 match started! Place your bet and click Deal.'
  );

  const startNewHand = useCallback(() => {
    soundManager.playDiceRoll();

    const fullDeck: Card[] = [];
    SUITS.forEach((suit) => {
      for (let v = 2; v <= 14; v++) {
        fullDeck.push({ suit, value: v });
      }
    });

    for (let i = fullDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
    }

    const pHand = [fullDeck[0], fullDeck[1]];
    const dHand = [fullDeck[2], fullDeck[3]];

    setPlayerCards(pHand);
    setDealerCards(dHand);
    setDeck(fullDeck.slice(4));
    setGameOver(false);

    const pScore = calculateScore(pHand);
    if (pScore === 21) {
      soundManager.playVictory();
      setGameOver(true);
      setPlayerChips((c) => c + bet * 2.5);
      setCommentary('🎉 BLACKJACK! 21 on deal! You Win 2.5x payout!');
    } else {
      setCommentary(`🃏 Hand dealt! Your Score: ${pScore}. Hit or Stand?`);
    }
  }, [bet]);

  useEffect(() => {
    startNewHand();
  }, []);

  const handleHit = () => {
    if (gameOver || deck.length === 0) return;

    soundManager.playTickSound();
    const drawn = deck[0];
    const newPlayerCards = [...playerCards, drawn];

    setPlayerCards(newPlayerCards);
    setDeck((d) => d.slice(1));

    const score = calculateScore(newPlayerCards);
    if (score > 21) {
      soundManager.playCapture();
      setGameOver(true);
      setPlayerChips((c) => c - bet);
      setCommentary(`💥 BUSTED! Your score exceeded 21 (${score}). Dealer Wins!`);
    } else {
      setCommentary(`🃏 Hit! New card ${getCardLabel(drawn)}. Total: ${score}.`);
    }
  };

  const handleStand = () => {
    if (gameOver) return;

    soundManager.playHomeEntry();
    let currentDealer = [...dealerCards];
    let dScore = calculateScore(currentDealer);
    let currentDeck = [...deck];

    // Dealer hits until >= 17
    while (dScore < 17 && currentDeck.length > 0) {
      const nextCard = currentDeck[0];
      currentDealer.push(nextCard);
      currentDeck = currentDeck.slice(1);
      dScore = calculateScore(currentDealer);
    }

    setDealerCards(currentDealer);
    setDeck(currentDeck);
    setGameOver(true);

    const pScore = calculateScore(playerCards);

    if (dScore > 21 || pScore > dScore) {
      soundManager.playVictory();
      setPlayerChips((c) => c + bet);
      setCommentary(`🏆 YOU WIN! Your ${pScore} beat Dealer's ${dScore > 21 ? 'BUST (' + dScore + ')' : dScore}!`);
    } else if (pScore === dScore) {
      soundManager.playTickSound();
      setCommentary(`🤝 PUSH! Tie match at ${pScore}. Bet returned.`);
    } else {
      soundManager.playCapture();
      setPlayerChips((c) => c - bet);
      setCommentary(`🤖 DEALER WINS! Dealer's ${dScore} beat your ${pScore}.`);
    }
  };

  const playerScore = calculateScore(playerCards);
  const dealerScore = calculateScore(dealerCards);

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="text-2xl">♠️</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_blackjack', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                CASINO DEALER AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Beat the Dealer to 21 • Soft 17 Dealer Rule • Real Payout Mechanics
            </p>
          </div>
        </div>

        <button
          onClick={startNewHand}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Main Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Table */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4 w-full">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 flex flex-col items-center justify-between min-h-[540px] sm:min-h-[640px]">
            {/* Chips Counter */}
            <div className="px-5 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">BALANCE:</span>
              <span className="text-lg font-black text-amber-300 font-mono">{playerChips} CHIPS</span>
            </div>

            {/* Dealer Hand */}
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase block">
                DEALER HAND ({gameOver ? dealerScore : '?'})
              </span>
              <div className="flex justify-center gap-2">
                {dealerCards.map((c, i) => (
                  <div
                    key={i}
                    className="w-14 h-20 bg-white text-slate-900 border-2 border-amber-400 rounded-xl font-black text-base flex items-center justify-center shadow-lg"
                  >
                    {!gameOver && i === 1 ? '🂠' : getCardLabel(c)}
                  </div>
                ))}
              </div>
            </div>

            {/* Player Hand & Controls */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 w-full max-w-sm text-center space-y-3">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                YOUR HAND (SCORE: {playerScore})
              </span>

              <div className="flex justify-center gap-2">
                {playerCards.map((c, i) => (
                  <div key={i} className="w-14 h-20 bg-white text-slate-900 border-2 border-amber-400 rounded-xl font-black text-base flex items-center justify-center shadow-xl">
                    {getCardLabel(c)}
                  </div>
                ))}
              </div>

              {!gameOver && (
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleHit}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>HIT</span>
                  </button>

                  <button
                    onClick={handleStand}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Hand className="w-4 h-4" />
                    <span>STAND</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Commentary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <BotCommentaryOverlay
              commentary={commentary}
              botName="Blackjack AI Dealer"
              botColor="emerald"
              isMuted={isMuted}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
