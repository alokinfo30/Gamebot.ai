import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Shield, Crown } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface CoatPieceGameProps {
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

export const CoatPieceGame: React.FC<CoatPieceGameProps> = ({
  language,
  isMuted,
  isColorblindMode,
}) => {
  const [trumpSuit, setTrumpSuit] = useState<Card['suit'] | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHands, setAiHands] = useState<Card[][]>([[], [], []]);
  const [currentTrick, setCurrentTrick] = useState<{ card: Card; playerIdx: number }[]>([]);
  const [tricksTeam1, setTricksTeam1] = useState<number>(0); // You (0) + AI Partner (2)
  const [tricksTeam2, setTricksTeam2] = useState<number>(0); // AI Opp1 (1) + AI Opp2 (3)
  const [turn, setTurn] = useState<number>(0);
  const [commentary, setCommentary] = useState<string | null>(
    '🃟 Coat Piece trick-taking match started! Choose the Trump Suit for your team.'
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
    setTricksTeam1(0);
    setTricksTeam2(0);
    setTrumpSuit(null);
    setTurn(0);
    setCommentary('🃟 13 Cards dealt to each player! Pick the Trump Suit to begin.');
  }, []);

  useEffect(() => {
    startNewGame();
  }, []);

  const selectTrump = (suit: Card['suit']) => {
    soundManager.playTickSound();
    setTrumpSuit(suit);
    setCommentary(`👑 Trump Suit chosen: ${suit}! First trick begins.`);
  };

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

    if (newTrick.length === 4) {
      // Resolve trick winner
      setTimeout(() => {
        resolveTrick(newTrick);
      }, 1000);
    } else {
      nextTurn((playerIdx + 1) % 4);
    }
  };

  const resolveTrick = (trick: { card: Card; playerIdx: number }[]) => {
    const leadSuit = trick[0].card.suit;

    let winningPlay = trick[0];
    trick.forEach((play) => {
      const { card } = play;
      const winCard = winningPlay.card;

      if (card.suit === trumpSuit && winCard.suit !== trumpSuit) {
        winningPlay = play;
      } else if (card.suit === winCard.suit && card.value > winCard.value) {
        winningPlay = play;
      }
    });

    const isTeam1 = winningPlay.playerIdx === 0 || winningPlay.playerIdx === 2;
    if (isTeam1) {
      setTricksTeam1((t) => t + 1);
    } else {
      setTricksTeam2((t) => t + 1);
    }

    soundManager.playCapture();
    setCommentary(`🏆 Player ${winningPlay.playerIdx === 0 ? 'You' : winningPlay.playerIdx} won the trick with ${getCardLabel(winningPlay.card)}!`);
    setCurrentTrick([]);
    setTurn(winningPlay.playerIdx);
  };

  const nextTurn = (nextIdx: number) => {
    setTurn(nextIdx);

    if (nextIdx > 0 && trumpSuit) {
      setTimeout(() => {
        const hand = aiHands[nextIdx - 1];
        if (hand.length > 0) {
          playCard(hand[0], nextIdx);
        }
      }, 800);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <span className="text-2xl">👑</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_coat_piece', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
                PARTNERSHIP AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Court Piece Trick-Taking • Trump Suit Calling • Coat Bonus Tracker
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
        {/* Left Side: Trick Arena */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-5 shadow-2xl space-y-6 flex flex-col items-center">
            {/* Trump Selection Modal / Header */}
            {!trumpSuit ? (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-center space-y-3">
                <span className="text-xs font-bold text-amber-300 uppercase block">SELECT TRUMP SUIT</span>
                <div className="flex justify-center gap-3">
                  {SUITS.map((s) => (
                    <button
                      key={s}
                      onClick={() => selectTrump(s)}
                      className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-amber-500 text-white font-black text-2xl flex items-center justify-center transition cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6 text-xs font-bold text-slate-300">
                <span>TRUMP: <strong className="text-amber-300 text-base">{trumpSuit}</strong></span>
                <span>TEAM YOU: <strong className="text-emerald-400 text-base">{tricksTeam1} Tricks</strong></span>
                <span>TEAM AI: <strong className="text-rose-400 text-base">{tricksTeam2} Tricks</strong></span>
              </div>
            )}

            {/* Trick Cards Played on Table */}
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
              {currentTrick.length === 0 && (
                <span className="text-xs text-slate-500 font-medium italic">
                  Waiting for lead player to throw a card...
                </span>
              )}
            </div>

            {/* Player Hand */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 w-full space-y-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                YOUR HAND ({playerHand.length} CARDS)
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {playerHand.map((card) => {
                  const playable = turn === 0 && trumpSuit !== null;
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
              botName="Coat Piece AI Partner"
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
