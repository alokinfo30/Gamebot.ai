import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, ShieldAlert, Eye, Bot, Flame } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface BluffGameProps {
  language: LanguageCode;
  isMuted: boolean;
  isColorblindMode: boolean;
}

interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2..14
}

const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
const VAL_LABELS: Record<number, string> = {
  11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

const getCardLabel = (card: Card) => {
  const v = VAL_LABELS[card.value] || card.value.toString();
  return `${v}${card.suit}`;
};

export const BluffGame: React.FC<BluffGameProps> = ({
  language,
  isMuted,
  isColorblindMode,
}) => {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHands, setAiHands] = useState<Card[][]>([[], [], []]);
  const [pile, setPile] = useState<Card[]>([]);
  const [lastClaim, setLastClaim] = useState<{ count: number; rank: number; playerIdx: number; actualCards: Card[] } | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [claimedRank, setClaimedRank] = useState<number>(7);
  const [turn, setTurn] = useState<number>(0);
  const [commentary, setCommentary] = useState<string | null>(
    '🃏 Bluff match started! Throw cards face-down and claim a rank.'
  );

  const startNewGame = useCallback(() => {
    soundManager.playDiceRoll();

    const fullDeck: Card[] = [];
    SUITS.forEach((suit) => {
      for (let v = 2; v <= 14; v++) {
        fullDeck.push({ id: `${suit}-${v}`, suit, value: v });
      }
    });

    for (let i = fullDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
    }

    setPlayerHand(fullDeck.slice(0, 13));
    setAiHands([fullDeck.slice(13, 26), fullDeck.slice(26, 39), fullDeck.slice(39, 52)]);
    setPile([]);
    setLastClaim(null);
    setSelectedCards([]);
    setTurn(0);
    setCommentary('🃏 Cards dealt! Make your opening claim or call Bluff on opponents.');
  }, []);

  useEffect(() => {
    startNewGame();
  }, []);

  const handlePlayClaim = () => {
    // Strict Turn Lock
    if (turn !== 0 || selectedCards.length === 0) return;

    soundManager.playHomeEntry();
    const thrownCards = playerHand.filter((c) => selectedCards.includes(c.id));
    const remainingHand = playerHand.filter((c) => !selectedCards.includes(c.id));

    setPlayerHand(remainingHand);
    setPile((prev) => [...prev, ...thrownCards]);
    setLastClaim({
      count: thrownCards.length,
      rank: claimedRank,
      playerIdx: 0,
      actualCards: thrownCards,
    });
    setSelectedCards([]);

    const rankLabel = VAL_LABELS[claimedRank] || claimedRank.toString();
    setCommentary(`🃏 You claimed: ${thrownCards.length}x ${rankLabel}(s)!`);

    nextTurn(1);
  };

  const handleCallBluff = (challengerIdx: number) => {
    if (!lastClaim) return;

    soundManager.playCapture();
    const { playerIdx, rank, actualCards } = lastClaim;
    const isLying = actualCards.some((c) => c.value !== rank);

    if (isLying) {
      soundManager.playVictory();
      setCommentary(`🔥 BLUFF CALLED! Player ${playerIdx === 0 ? 'You were' : playerIdx + ' was'} caught lying! Collects ${pile.length} cards!`);
      // Bluffer picks up pile
      if (playerIdx === 0) {
        setPlayerHand((prev) => [...prev, ...pile]);
      } else {
        setAiHands((prev) =>
          prev.map((h, i) => (i === playerIdx - 1 ? [...h, ...pile] : h))
        );
      }
    } else {
      soundManager.playCapture();
      setCommentary(`❌ TRUTH WAS TOLD! Challenger Player ${challengerIdx === 0 ? 'You' : challengerIdx} collects ${pile.length} cards!`);
      // Challenger picks up pile
      if (challengerIdx === 0) {
        setPlayerHand((prev) => [...prev, ...pile]);
      } else {
        setAiHands((prev) =>
          prev.map((h, i) => (i === challengerIdx - 1 ? [...h, ...pile] : h))
        );
      }
    }

    setPile([]);
    setLastClaim(null);
  };

  const nextTurn = (nextIdx: number) => {
    setTurn(nextIdx);

    if (nextIdx > 0) {
      setTimeout(() => {
        // AI logic: 20% chance to call bluff on previous player
        if (lastClaim && Math.random() < 0.25) {
          handleCallBluff(nextIdx);
        } else {
          // AI plays cards
          const hand = aiHands[nextIdx - 1];
          if (hand.length > 0) {
            const num = Math.min(2, hand.length);
            const thrown = hand.slice(0, num);
            const rem = hand.slice(num);

            setAiHands((prev) =>
              prev.map((h, i) => (i === nextIdx - 1 ? rem : h))
            );
            setPile((p) => [...p, ...thrown]);
            const randomRank = thrown[0].value;
            setLastClaim({ count: num, rank: randomRank, playerIdx: nextIdx, actualCards: thrown });

            const rStr = VAL_LABELS[randomRank] || randomRank.toString();
            setCommentary(`🤖 AI Player ${nextIdx} claimed: ${num}x ${rStr}(s)!`);
            nextTurn((nextIdx + 1) % 4);
          }
        }
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_bluff', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold">
                BLUFF DETECTOR AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              I Doubt It Card Game • Face-down Claims • Penalty Pile Collection
            </p>
          </div>
        </div>

        <button
          onClick={startNewGame}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Main Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Table & Controls */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4 w-full">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 flex flex-col items-center justify-between min-h-[540px] sm:min-h-[640px]">
            {/* Center Discard Pile & Call Bluff Button */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 w-full text-center space-y-3">
              <span className="text-xs font-bold text-amber-300 uppercase block">
                CENTER PILE ({pile.length} CARDS)
              </span>

              {lastClaim && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-slate-300">
                    Last Claim by <strong>Player {lastClaim.playerIdx === 0 ? 'You' : lastClaim.playerIdx}</strong>: {lastClaim.count}x {VAL_LABELS[lastClaim.rank] || lastClaim.rank}
                  </span>

                  {lastClaim.playerIdx !== 0 && (
                    <button
                      onClick={() => handleCallBluff(0)}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-xl flex items-center gap-2 cursor-pointer animate-pulse"
                    >
                      <Flame className="w-4 h-4" />
                      <span>CALL BLUFF!</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Player Hand */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 w-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  YOUR HAND ({playerHand.length} CARDS)
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={claimedRank}
                    onChange={(e) => setClaimedRank(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2 py-1"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((v) => (
                      <option key={v} value={v}>
                        Claim {VAL_LABELS[v] || v}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handlePlayClaim}
                    disabled={selectedCards.length === 0 || turn !== 0}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer disabled:opacity-50"
                  >
                    Throw ({selectedCards.length})
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center">
                {playerHand.map((c) => {
                  const isSel = selectedCards.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() =>
                        setSelectedCards((prev) =>
                          isSel ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                        )
                      }
                      className={`w-11 h-16 rounded-xl border-2 font-black text-xs flex items-center justify-center transition shadow cursor-pointer ${
                        isSel
                          ? 'bg-amber-300 text-slate-900 border-amber-500 -translate-y-2'
                          : 'bg-white text-slate-900 border-slate-300 hover:-translate-y-1'
                      }`}
                    >
                      {getCardLabel(c)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Commentary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <BotCommentaryOverlay
              commentary={commentary}
              botName="Bluff AI Detector"
              botColor="rose"
              isMuted={isMuted}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
