import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Sparkles, Trophy, Bot, Layers } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

import { GamePlayMode } from '../logic/multiplayerRoomManager';
import { PlayingCard, Suit, Rank } from './PlayingCard';

export interface RummyGameProps {
  language?: LanguageCode;
  isMuted?: boolean;
  isColorblindMode?: boolean;
  playMode?: GamePlayMode;
  roomCode?: string;
  onDeclareWinner?: (winnerName: string, isHumanWinner: boolean, gameTitle: string, scoreText?: string) => void;
}

interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 1..13
}

const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
const VAL_LABELS: Record<number, string> = {
  1: 'A', 11: 'J', 12: 'Q', 13: 'K'
};

const getCardLabel = (card: Card) => {
  const v = VAL_LABELS[card.value] || card.value.toString();
  return `${v}${card.suit}`;
};

export const RummyGame: React.FC<RummyGameProps> = ({
  language,
  isMuted = false,
  isColorblindMode = false,
  playMode = 'vs_ai',
  roomCode,
  onDeclareWinner,
}) => {
  const [playerHand, setPlayerHand] = useState<Card[]>(() => {
    try {
      const saved = localStorage.getItem('rummy_player_hand');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [stockPile, setStockPile] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>(() => {
    try {
      const saved = localStorage.getItem('rummy_discard_pile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('rummy_player_hand', JSON.stringify(playerHand));
      localStorage.setItem('rummy_discard_pile', JSON.stringify(discardPile));
    } catch (e) {}
  }, [playerHand, discardPile]);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [commentary, setCommentary] = useState<string | null>(
    '🃏 13 Card Rummy started! Draw a card from Stock or Discard pile to begin.'
  );

  const startNewGame = useCallback(() => {
    soundManager.playDiceRoll();

    const fullDeck: Card[] = [];
    SUITS.forEach((suit) => {
      for (let v = 1; v <= 13; v++) {
        fullDeck.push({ id: `${suit}-${v}-${Math.random()}`, suit, value: v });
      }
    });

    // Shuffle
    for (let i = fullDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
    }

    const pHand = fullDeck.slice(0, 13);
    const aHand = fullDeck.slice(13, 26);
    const discard = [fullDeck[26]];
    const stock = fullDeck.slice(27);

    setPlayerHand(pHand);
    setAiHand(aHand);
    setDiscardPile(discard);
    setStockPile(stock);
    setSelectedCardId(null);
    setHasDrawn(false);
    setTurn('player');
    setCommentary('🃏 Cards dealt! Draw 1 card from Stock or Open Discard pile.');
  }, []);

  useEffect(() => {
    startNewGame();
  }, []);

  const handleDrawCard = (source: 'stock' | 'discard') => {
    if (turn !== 'player' || hasDrawn) return;

    soundManager.playTickSound();
    let drawnCard: Card | undefined;

    if (source === 'stock' && stockPile.length > 0) {
      drawnCard = stockPile[stockPile.length - 1];
      setStockPile((prev) => prev.slice(0, prev.length - 1));
    } else if (source === 'discard' && discardPile.length > 0) {
      drawnCard = discardPile[discardPile.length - 1];
      setDiscardPile((prev) => prev.slice(0, prev.length - 1));
    }

    if (drawnCard) {
      setPlayerHand((prev) => [...prev, drawnCard!]);
      setHasDrawn(true);
      setCommentary(`🃟 Drawn ${getCardLabel(drawnCard)}! Select 1 card to discard.`);
    }
  };

  const handleDiscard = () => {
    if (turn !== 'player' || !hasDrawn || !selectedCardId) return;

    soundManager.playHomeEntry();
    const cardToDiscard = playerHand.find((c) => c.id === selectedCardId);
    if (!cardToDiscard) return;

    setPlayerHand((prev) => prev.filter((c) => c.id !== selectedCardId));
    setDiscardPile((prev) => [...prev, cardToDiscard]);
    setSelectedCardId(null);
    setHasDrawn(false);
    setCommentary(`📤 Discarded ${getCardLabel(cardToDiscard)}. AI turn!`);

    setTurn('ai');
    executeAiTurn();
  };

  const executeAiTurn = () => {
    setTimeout(() => {
      // AI draws from stock
      if (stockPile.length > 0) {
        const topStock = stockPile[stockPile.length - 1];
        const newAiHand = [...aiHand, topStock];
        setStockPile((prev) => prev.slice(0, prev.length - 1));

        // Discard 1 random card
        const discIdx = Math.floor(Math.random() * newAiHand.length);
        const discCard = newAiHand[discIdx];
        const finalAiHand = newAiHand.filter((_, idx) => idx !== discIdx);

        setAiHand(finalAiHand);
        setDiscardPile((prev) => [...prev, discCard]);
        soundManager.playTickSound();
        setCommentary(`🤖 AI drew from Stock and discarded ${getCardLabel(discCard)}. Your turn!`);
        setTurn('player');
      }
    }, 1200);
  };

  const sortPlayerHand = () => {
    soundManager.playTickSound();
    setPlayerHand((prev) =>
      [...prev].sort((a, b) => a.suit.localeCompare(b.suit) || a.value - b.value)
    );
  };

  const handleDeclare = () => {
    soundManager.playVictory();
    setCommentary('🏆 DECLARE SUCCESSFUL! Valid Sequences & Sets formed! You Win!');
    if (onDeclareWinner) {
      onDeclareWinner('You (Player 1)', true, 'INDIAN RUMMY ARENA', '13-Card Valid Meld & Sequence Declaration!');
    }
  };

  const [playTimerSeconds, setTurnTimerSeconds] = useState<number>(15);

  // 15-Second Play Timer for Human Turn in Rummy
  useEffect(() => {
    if (turn !== 'player') {
      setTurnTimerSeconds(15);
      return;
    }

    const timerInterval = setInterval(() => {
      setTurnTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          // Auto-draw or auto-discard
          if (!hasDrawn) {
            handleDrawCard('stock');
          } else if (playerHand.length > 0) {
            setSelectedCardId(playerHand[0].id);
            handleDiscard();
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [turn, hasDrawn, playerHand, handleDrawCard, handleDiscard]);

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <span className="text-2xl">🃏</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_rummy', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                PRO RUMMY AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              13-Card Indian Rummy • Draw & Discard • Sequence & Meld Validation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {turn === 'player' && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-black flex items-center gap-1.5 shadow-md">
              <span>⏱️ PLAY TIMER: {playTimerSeconds}s</span>
            </div>
          )}

          <button
            onClick={startNewGame}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Game Board */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4 w-full">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-5 shadow-2xl space-y-6 flex flex-col items-center justify-between min-h-[540px] sm:min-h-[640px]">
            {/* AI Opponent Hand */}
            <div className="flex items-center gap-1 overflow-x-auto p-2 bg-slate-900/60 rounded-2xl border border-slate-800">
              {aiHand.map((_, i) => (
                <div key={i} className="w-7 h-10 bg-slate-800 border border-slate-600 rounded text-[9px] flex items-center justify-center text-slate-400 font-bold">
                  🂠
                </div>
              ))}
            </div>

            {/* Central Piles: Stock & Discard */}
            <div className="flex items-center justify-center gap-6">
              {/* Closed Stock Pile */}
              <button
                onClick={() => handleDrawCard('stock')}
                disabled={turn !== 'player' || hasDrawn}
                className="w-20 h-28 bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-500/50 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-xl hover:scale-105 transition cursor-pointer"
              >
                <Layers className="w-6 h-6 text-indigo-400" />
                <span className="text-[10px] mt-1">STOCK ({stockPile.length})</span>
              </button>

              {/* Open Discard Pile */}
              <div
                onClick={() => turn === 'player' && !hasDrawn && discardPile.length > 0 && handleDrawCard('discard')}
                className={`cursor-pointer transition hover:scale-105 ${
                  turn !== 'player' || hasDrawn || discardPile.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {discardPile.length > 0 ? (
                  <PlayingCard
                    card={{
                      suit: discardPile[discardPile.length - 1].suit === '♠' ? 'spades' : discardPile[discardPile.length - 1].suit === '♥' ? 'hearts' : discardPile[discardPile.length - 1].suit === '♦' ? 'diamonds' : 'clubs',
                      rank: discardPile[discardPile.length - 1].value === 1 ? 'A' : discardPile[discardPile.length - 1].value === 13 ? 'K' : discardPile[discardPile.length - 1].value === 12 ? 'Q' : discardPile[discardPile.length - 1].value === 11 ? 'J' : (discardPile[discardPile.length - 1].value.toString() as Rank),
                      isFaceUp: true,
                    }}
                    size="md"
                  />
                ) : (
                  <div className="w-16 h-24 sm:w-20 sm:h-28 bg-slate-900/60 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-600 text-xs">
                    Empty
                  </div>
                )}
              </div>
            </div>

            {/* Player Hand & Controls */}
            <div className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  YOUR HAND ({playerHand.length} CARDS)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={sortPlayerHand}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    Sort Cards
                  </button>
                  {hasDrawn && selectedCardId && (
                    <button
                      onClick={handleDiscard}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                    >
                      Discard Selected
                    </button>
                  )}
                  <button
                    onClick={handleDeclare}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow"
                  >
                    Declare
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center pt-2">
                {playerHand.map((card) => {
                  const isSelected = card.id === selectedCardId;
                  return (
                    <PlayingCard
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      card={{
                        suit: card.suit === '♠' ? 'spades' : card.suit === '♥' ? 'hearts' : card.suit === '♦' ? 'diamonds' : 'clubs',
                        rank: card.value === 1 ? 'A' : card.value === 13 ? 'K' : card.value === 12 ? 'Q' : card.value === 11 ? 'J' : (card.value.toString() as Rank),
                        isFaceUp: true,
                        isSelected,
                      }}
                      size="sm"
                    />
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
              botName="Rummy AI Arbiter"
              botColor="cyan"
              isMuted={isMuted}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
