import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Bot, Sparkles, SkipForward } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface SattePeSattaGameProps {
  language: LanguageCode;
  isMuted: boolean;
  isColorblindMode: boolean;
}

interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 1..13
}

const SUITS: Card['suit'][] = ['♥', '♠', '♦', '♣'];
const VAL_LABELS: Record<number, string> = {
  1: 'A', 11: 'J', 12: 'Q', 13: 'K'
};

const getCardLabel = (card: Card) => {
  const v = VAL_LABELS[card.value] || card.value.toString();
  return `${v}${card.suit}`;
};

export const SattePeSattaGame: React.FC<SattePeSattaGameProps> = ({
  language,
  isMuted,
  isColorblindMode,
}) => {
  const [tableLayout, setTableLayout] = useState<Record<Card['suit'], { min: number; max: number }>>({
    '♥': { min: 8, max: 6 }, // 7 start
    '♠': { min: 8, max: 6 },
    '♦': { min: 8, max: 6 },
    '♣': { min: 8, max: 6 },
  });

  const [playedCards, setPlayedCards] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHands, setAiHands] = useState<Card[][]>([[], [], []]);
  const [turn, setTurn] = useState<number>(0); // 0 = Player, 1..3 = AI
  const [commentary, setCommentary] = useState<string | null>(
    '♥️ Satte Pe Satta match started! 7 of Hearts starts the sequence.'
  );

  const startNewGame = useCallback(() => {
    soundManager.playDiceRoll();

    const fullDeck: Card[] = [];
    SUITS.forEach((suit) => {
      for (let v = 1; v <= 13; v++) {
        fullDeck.push({ id: `${suit}-${v}`, suit, value: v });
      }
    });

    for (let i = fullDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
    }

    const p0 = fullDeck.slice(0, 13);
    const p1 = fullDeck.slice(13, 26);
    const p2 = fullDeck.slice(26, 39);
    const p3 = fullDeck.slice(39, 52);

    setPlayerHand(p0);
    setAiHands([p1, p2, p3]);
    setPlayedCards([]);
    setTableLayout({
      '♥': { min: 8, max: 6 },
      '♠': { min: 8, max: 6 },
      '♦': { min: 8, max: 6 },
      '♣': { min: 8, max: 6 },
    });

    // Check who holds 7 of Hearts to start
    let starter = 0;
    if (p1.some((c) => c.suit === '♥' && c.value === 7)) starter = 1;
    if (p2.some((c) => c.suit === '♥' && c.value === 7)) starter = 2;
    if (p3.some((c) => c.suit === '♥' && c.value === 7)) starter = 3;

    setTurn(starter);
    setCommentary(`♥️ Cards dealt! ${starter === 0 ? 'You hold 7♥! Play it to start.' : `AI Player ${starter} holds 7♥ to start.`}`);
  }, []);

  useEffect(() => {
    startNewGame();
  }, []);

  const isValidPlay = (card: Card) => {
    if (playedCards.length === 0) {
      return card.suit === '♥' && card.value === 7;
    }

    if (card.value === 7) return true; // 7 of any suit can be placed if sequence active

    const suitMinMax = tableLayout[card.suit];
    if (card.value === suitMinMax.min - 1 || card.value === suitMinMax.max + 1) {
      return true;
    }

    return false;
  };

  const playCard = (card: Card, playerIdx: number) => {
    // Strict Turn Lock
    if (playerIdx === 0 && turn !== 0) return;

    soundManager.playHomeEntry();

    setPlayedCards((prev) => [...prev, card]);

    // Update layout limits
    setTableLayout((prev) => {
      const current = prev[card.suit];
      let newMin = current.min;
      let newMax = current.max;

      if (card.value === 7) {
        newMin = 6;
        newMax = 8;
      } else if (card.value < 7) {
        newMin = card.value - 1;
      } else {
        newMax = card.value + 1;
      }

      return { ...prev, [card.suit]: { min: newMin, max: newMax } };
    });

    if (playerIdx === 0) {
      setPlayerHand((prev) => prev.filter((c) => c.id !== card.id));
      setCommentary(`🃏 You played ${getCardLabel(card)}!`);
    } else {
      setAiHands((prev) =>
        prev.map((hand, idx) =>
          idx === playerIdx - 1 ? hand.filter((c) => c.id !== card.id) : hand
        )
      );
      setCommentary(`🤖 AI Player ${playerIdx} played ${getCardLabel(card)}!`);
    }

    nextTurn((playerIdx + 1) % 4);
  };

  const handlePass = (playerIdx: number) => {
    // Strict Turn Lock
    if (playerIdx === 0 && turn !== 0) return;

    // Real-Life Satte Pe Satta Rule: Player cannot Pass if they have a playable card in hand!
    if (playerIdx === 0) {
      const hasPlayableCard = playerHand.some((c) => isValidPlay(c));
      if (hasPlayableCard) {
        soundManager.playCapture();
        setCommentary('⚠️ Real Rules Lock: You cannot Pass when you have a valid playable card in hand!');
        return;
      }
    }

    soundManager.playTickSound();
    setCommentary(playerIdx === 0 ? '⚠️ You passed.' : `🤖 AI Player ${playerIdx} passed.`);
    nextTurn((playerIdx + 1) % 4);
  };

  const nextTurn = (nextIdx: number) => {
    setTurn(nextIdx);

    // Check Win
    if (playerHand.length === 0) {
      soundManager.playVictory();
      setCommentary('🏆 CONGRATULATIONS! You cleared all cards first in Satte Pe Satta!');
      return;
    }

    if (nextIdx > 0) {
      // AI Turn Execution
      setTimeout(() => {
        const aiHand = aiHands[nextIdx - 1];
        const validCard = aiHand.find((c) => isValidPlay(c));

        if (validCard) {
          playCard(validCard, nextIdx);
        } else {
          handlePass(nextIdx);
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
            <span className="text-2xl">♥️</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_satte', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold">
                CLASSIC CARD AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              7 of Hearts Sequence • 4 Suit Ladders • Pass & Play AI Strategy
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

      {/* Main Table Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Suit Sequences Layout */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4 w-full">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-5 shadow-2xl space-y-4 min-h-[540px] sm:min-h-[640px]">
            <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider text-center">
              SUIT SEQUENCE LADDERS ON TABLE
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SUITS.map((s) => (
                <div key={s} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center space-y-2">
                  <span className="text-2xl block">{s}</span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    <p>Lower: {tableLayout[s].min === 8 ? 'None' : tableLayout[s].min + 1}</p>
                    <p>Upper: {tableLayout[s].max === 6 ? 'None' : tableLayout[s].max - 1}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Player Cards */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 w-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  YOUR HAND ({playerHand.length} CARDS)
                </span>
                {turn === 0 && (
                  <button
                    onClick={() => handlePass(0)}
                    className="px-3 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-bold"
                  >
                    Pass Turn
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                {playerHand.map((card) => {
                  const playable = turn === 0 && isValidPlay(card);
                  return (
                    <button
                      key={card.id}
                      onClick={() => playable && playCard(card, 0)}
                      disabled={!playable}
                      className={`w-11 h-16 rounded-xl border-2 font-black text-xs flex flex-col items-center justify-center transition shadow cursor-pointer ${
                        playable
                          ? 'bg-amber-300 text-slate-900 border-amber-500 ring-2 ring-emerald-400 scale-105'
                          : 'bg-slate-800 text-slate-500 border-slate-700 opacity-60'
                      }`}
                    >
                      <span>{getCardLabel(card)}</span>
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
              botName="Satte Pe Satta AI"
              botColor="purple"
              isMuted={isMuted}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
