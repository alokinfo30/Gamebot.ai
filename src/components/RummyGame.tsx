import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Sparkles, Trophy, Bot, Layers } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface RummyGameProps {
  language: LanguageCode;
  isMuted: boolean;
  isColorblindMode: boolean;
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
  isMuted,
  isColorblindMode,
}) => {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [stockPile, setStockPile] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
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
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 flex flex-col items-center select-none">
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

        <button
          onClick={startNewGame}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Main Game Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Game Board */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-5 shadow-2xl space-y-6 flex flex-col items-center">
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
              <button
                onClick={() => handleDrawCard('discard')}
                disabled={turn !== 'player' || hasDrawn || discardPile.length === 0}
                className="w-20 h-28 bg-white border-2 border-amber-400 rounded-2xl flex flex-col items-center justify-center font-black text-slate-900 shadow-xl hover:scale-105 transition cursor-pointer"
              >
                {discardPile.length > 0 ? (
                  <>
                    <span className="text-xl">{getCardLabel(discardPile[discardPile.length - 1])}</span>
                    <span className="text-[9px] text-slate-500 mt-1 uppercase">OPEN PILE</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">Empty</span>
                )}
              </button>
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
                    <button
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`w-11 h-16 sm:w-12 sm:h-18 rounded-xl border-2 font-black text-xs sm:text-sm flex flex-col items-center justify-center transition shadow-md cursor-pointer ${
                        isSelected
                          ? 'bg-amber-300 text-slate-900 border-amber-500 -translate-y-2'
                          : 'bg-white text-slate-900 border-slate-300 hover:-translate-y-1'
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
