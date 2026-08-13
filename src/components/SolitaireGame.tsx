import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Lightbulb, Sparkles, Layers } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

import { GamePlayMode } from '../logic/multiplayerRoomManager';
import { PlayingCard, Suit, Rank } from './PlayingCard';

export interface SolitaireGameProps {
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
  isFaceUp: boolean;
}

const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
const VAL_LABELS: Record<number, string> = {
  1: 'A', 11: 'J', 12: 'Q', 13: 'K'
};

const getCardLabel = (card: Card) => {
  const v = VAL_LABELS[card.value] || card.value.toString();
  return `${v}${card.suit}`;
};

const isRed = (suit: Card['suit']) => suit === '♥' || suit === '♦';

export const SolitaireGame: React.FC<SolitaireGameProps> = ({
  language,
  isMuted = false,
  isColorblindMode = false,
  playMode = 'vs_ai',
  roomCode,
  onDeclareWinner,
}) => {
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundations, setFoundations] = useState<Card[][]>([[], [], [], []]);
  const [tableau, setTableau] = useState<Card[][]>([[], [], [], [], [], [], []]);
  const [selectedCard, setSelectedCard] = useState<{ card: Card; source: string; colIdx?: number } | null>(null);
  const [commentary, setCommentary] = useState<string | null>(
    '🃏 Klondike Solitaire started! Move cards to build 4 Foundations from Ace to King.'
  );

  const startNewGame = useCallback(() => {
    soundManager.playDiceRoll();

    const fullDeck: Card[] = [];
    SUITS.forEach((suit) => {
      for (let v = 1; v <= 13; v++) {
        fullDeck.push({ id: `${suit}-${v}`, suit, value: v, isFaceUp: false });
      }
    });

    for (let i = fullDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
    }

    let deckIdx = 0;
    const newTableau: Card[][] = [];

    for (let c = 0; c < 7; c++) {
      const col: Card[] = [];
      for (let r = 0; r <= c; r++) {
        const card = fullDeck[deckIdx++];
        if (r === c) card.isFaceUp = true;
        col.push(card);
      }
      newTableau.push(col);
    }

    setTableau(newTableau);
    setFoundations([[], [], [], []]);
    setWaste([]);
    setStock(fullDeck.slice(deckIdx));
    setSelectedCard(null);
    setCommentary('🃏 Table dealt! Tap Stock pile to draw cards or tap a card to move.');
  }, []);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    const totalFoundations = foundations.reduce((acc, f) => acc + f.length, 0);
    if (totalFoundations === 52) {
      soundManager.playVictory();
      setCommentary('🏆 SOLITAIRE VICTORY! All 52 cards built into foundations!');
      if (onDeclareWinner) {
        onDeclareWinner('You (Player 1)', true, 'SOLITAIRE ARENA', 'Completed All 4 Suit Foundations!');
      }
    }
  }, [foundations, onDeclareWinner]);

  const handleStockClick = () => {
    soundManager.playTickSound();
    if (stock.length > 0) {
      const drawn = { ...stock[stock.length - 1], isFaceUp: true };
      setStock((s) => s.slice(0, s.length - 1));
      setWaste((w) => [...w, drawn]);
      setCommentary(`🃟 Drawn ${getCardLabel(drawn)} to Waste pile.`);
    } else if (waste.length > 0) {
      // Recycle waste back to stock
      const recycled = waste.map((c) => ({ ...c, isFaceUp: false })).reverse();
      setStock(recycled);
      setWaste([]);
      setCommentary('🔄 Waste pile recycled back into Stock.');
    }
  };

  const offerAiHint = () => {
    soundManager.playTickSound();
    // Search for Ace moves to Foundation
    if (waste.length > 0 && waste[waste.length - 1].value === 1) {
      setCommentary(`💡 AI HINT: You can move Ace ${waste[waste.length - 1].suit} from Waste to Foundation!`);
      return;
    }

    setCommentary('💡 AI HINT: Look for King cards to place into empty Tableau columns.');
  };

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <span className="text-2xl">🃏</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_solitaire', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-bold">
                SOLITAIRE ASSISTANT AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Klondike Rules • 4 Suit Foundations • AI Smart Move Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={offerAiHint}
            className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>AI Hint</span>
          </button>

          <button
            onClick={startNewGame}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Main Solitaire Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Board Piles */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4 w-full">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-5 shadow-2xl space-y-6 min-h-[540px] sm:min-h-[640px]">
            {/* Top Row: Stock, Waste, Foundations */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3">
                {/* Stock Pile */}
                <div
                  onClick={handleStockClick}
                  className="cursor-pointer transition hover:scale-105"
                >
                  <PlayingCard
                    card={{
                      suit: 'spades',
                      rank: 'A',
                      isFaceUp: false,
                    }}
                    size="sm"
                  />
                </div>

                {/* Waste Pile */}
                <div>
                  {waste.length > 0 ? (
                    <PlayingCard
                      card={{
                        suit: waste[waste.length - 1].suit === '♠' ? 'spades' : waste[waste.length - 1].suit === '♥' ? 'hearts' : waste[waste.length - 1].suit === '♦' ? 'diamonds' : 'clubs',
                        rank: waste[waste.length - 1].value === 1 ? 'A' : waste[waste.length - 1].value === 13 ? 'K' : waste[waste.length - 1].value === 12 ? 'Q' : waste[waste.length - 1].value === 11 ? 'J' : (waste[waste.length - 1].value.toString() as Rank),
                        isFaceUp: true,
                      }}
                      size="sm"
                    />
                  ) : (
                    <div className="w-11 h-16 bg-emerald-900/60 border border-dashed border-emerald-400/40 rounded-xl flex items-center justify-center text-xs text-emerald-300">
                      Empty
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Foundations */}
              <div className="flex gap-2">
                {SUITS.map((s, i) => (
                  <div
                    key={s}
                    className="w-11 h-16 bg-emerald-900/60 border border-dashed border-emerald-400/40 rounded-xl flex flex-col items-center justify-center font-bold text-xs text-emerald-300"
                  >
                    <span>{s}</span>
                    <span className="text-[9px]">{foundations[i].length}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7 Tableau Columns */}
            <div className="grid grid-cols-7 gap-1.5 min-h-[220px]">
              {tableau.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col items-center space-y-1 bg-slate-900/40 rounded-xl p-1 min-h-[160px]">
                  {col.map((card, rIdx) => (
                    <PlayingCard
                      key={card.id}
                      card={{
                        suit: card.suit === '♠' ? 'spades' : card.suit === '♥' ? 'hearts' : card.suit === '♦' ? 'diamonds' : 'clubs',
                        rank: card.value === 1 ? 'A' : card.value === 13 ? 'K' : card.value === 12 ? 'Q' : card.value === 11 ? 'J' : (card.value.toString() as Rank),
                        isFaceUp: card.isFaceUp,
                      }}
                      size="sm"
                    />
                  ))}
                  {col.length === 0 && (
                    <span className="text-[10px] text-slate-600 font-bold mt-2">K</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Commentary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <BotCommentaryOverlay
              commentary={commentary}
              botName="Solitaire AI Assistant"
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
