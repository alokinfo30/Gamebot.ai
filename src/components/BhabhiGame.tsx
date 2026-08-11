import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, ShieldAlert, Bot } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface BhabhiGameProps {
  language: LanguageCode;
  isMuted: boolean;
  isColorblindMode: boolean;
}

interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2..14 (Ace = 14)
}

const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
const VAL_LABELS: Record<number, string> = {
  11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

const getCardLabel = (card: Card) => {
  const v = VAL_LABELS[card.value] || card.value.toString();
  return `${v}${card.suit}`;
};

export const BhabhiGame: React.FC<BhabhiGameProps> = ({
  language,
  isMuted,
  isColorblindMode,
}) => {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHands, setAiHands] = useState<Card[][]>([[], [], []]);
  const [currentTrick, setCurrentTrick] = useState<{ card: Card; playerIdx: number }[]>([]);
  const [turn, setTurn] = useState<number>(0);
  const [escapedPlayers, setEscapedPlayers] = useState<number[]>([]);
  const [commentary, setCommentary] = useState<string | null>(
    '🃏 Bhabhi match started! Follow suit or throw a Thulla to penalize opponents.'
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
    setCurrentTrick([]);
    setEscapedPlayers([]);
    setTurn(0);
    setCommentary('🃏 13 Cards dealt! Clear your hand to get out of the Bhabhi penalty.');
  }, []);

  useEffect(() => {
    startNewGame();
  }, []);

  const playCard = (card: Card, playerIdx: number) => {
    soundManager.playHomeEntry();

    const newTrick = [...currentTrick, { card, playerIdx }];
    setCurrentTrick(newTrick);

    if (playerIdx === 0) {
      setPlayerHand((prev) => prev.filter((c) => c.id !== card.id));
    } else {
      setAiHands((prev) =>
        prev.map((hand, idx) =>
          idx === playerIdx - 1 ? hand.filter((c) => c.id !== card.id) : hand
        )
      );
    }

    if (newTrick.length === 4 - escapedPlayers.length) {
      setTimeout(() => {
        resolveTrick(newTrick);
      }, 1000);
    } else {
      let nextP = (playerIdx + 1) % 4;
      while (escapedPlayers.includes(nextP)) {
        nextP = (nextP + 1) % 4;
      }
      nextTurn(nextP);
    }
  };

  const resolveTrick = (trick: { card: Card; playerIdx: number }[]) => {
    const leadSuit = trick[0].card.suit;
    const thullaPlay = trick.find((p) => p.card.suit !== leadSuit);

    if (thullaPlay) {
      // Find highest card of lead suit
      const leadCards = trick.filter((p) => p.card.suit === leadSuit);
      leadCards.sort((a, b) => b.card.value - a.card.value);
      const penalised = leadCards[0].playerIdx;

      soundManager.playCapture();
      setCommentary(`💥 THULLA THROWN! Player ${penalised === 0 ? 'You' : penalised} receives all trick cards!`);

      const trickCards = trick.map((t) => t.card);
      if (penalised === 0) {
        setPlayerHand((prev) => [...prev, ...trickCards]);
      } else {
        setAiHands((prev) =>
          prev.map((hand, idx) =>
            idx === penalised - 1 ? [...hand, ...trickCards] : hand
          )
        );
      }
      setCurrentTrick([]);
      setTurn(penalised);
    } else {
      // Normal trick win
      const sorted = [...trick].sort((a, b) => b.card.value - a.card.value);
      const winner = sorted[0].playerIdx;

      soundManager.playTickSound();
      setCommentary(`✨ Trick cleared by Player ${winner === 0 ? 'You' : winner}!`);
      setCurrentTrick([]);
      setTurn(winner);
    }

    // Check who escaped (empty hand)
    checkEscapes();
  };

  const checkEscapes = () => {
    if (playerHand.length === 0 && !escapedPlayers.includes(0)) {
      setEscapedPlayers((prev) => [...prev, 0]);
      soundManager.playVictory();
      setCommentary('🎉 YOU CLEARED ALL CARDS & ESCAPED! You are Safe!');
    }
  };

  const nextTurn = (nextIdx: number) => {
    setTurn(nextIdx);

    if (nextIdx > 0) {
      setTimeout(() => {
        const hand = aiHands[nextIdx - 1];
        if (hand.length > 0) {
          playCard(hand[0], nextIdx);
        }
      }, 800);
    }
  };

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <span className="text-2xl">🃏</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_bhabhi', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono font-bold">
                THULLA AI ARENA
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              South Asian Bhabhi • Follow Suit Rules • Avoid Thulla Penalty
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

      {/* Main Board Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Playing Area */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4 w-full">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-5 shadow-2xl space-y-6 flex flex-col items-center justify-between min-h-[540px] sm:min-h-[640px]">
            {/* Escaped Ladder */}
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-slate-900/80 px-4 py-1.5 rounded-xl border border-slate-700">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <span>Escaped Players: {escapedPlayers.length > 0 ? escapedPlayers.map((p) => (p === 0 ? 'You' : `AI ${p}`)).join(', ') : 'None yet'}</span>
            </div>

            {/* Current Trick */}
            <div className="w-full h-36 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-4">
              {currentTrick.map((play, idx) => (
                <div key={idx} className="text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    P{play.playerIdx}
                  </span>
                  <div className="w-12 h-18 bg-white text-slate-900 border-2 border-amber-400 rounded-xl font-black text-sm flex items-center justify-center shadow-lg">
                    {getCardLabel(play.card)}
                  </div>
                </div>
              ))}
            </div>

            {/* Player Hand */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 w-full space-y-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                YOUR HAND ({playerHand.length} CARDS)
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {playerHand.map((card) => {
                  const playable = turn === 0;
                  return (
                    <button
                      key={card.id}
                      onClick={() => playable && playCard(card, 0)}
                      disabled={!playable}
                      className={`w-11 h-16 rounded-xl border-2 font-black text-xs flex items-center justify-center transition shadow cursor-pointer ${
                        playable
                          ? 'bg-amber-300 text-slate-900 border-amber-500 hover:-translate-y-1'
                          : 'bg-slate-800 text-slate-500 border-slate-700 opacity-60'
                      }`}
                    >
                      {getCardLabel(card)}
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
              botName="Bhabhi AI Referee"
              botColor="amber"
              isMuted={isMuted}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
