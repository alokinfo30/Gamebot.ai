import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Coins, Eye, EyeOff, Shield } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface PokerGameProps {
  language: LanguageCode;
  isMuted: boolean;
  isColorblindMode: boolean;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2..14
}

interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  isFolded: boolean;
  isAi: boolean;
}

type Stage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
const VAL_LABELS: Record<number, string> = {
  11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

const getCardLabel = (card: Card) => {
  const v = VAL_LABELS[card.value] || card.value.toString();
  return `${v}${card.suit}`;
};

export const PokerGame: React.FC<PokerGameProps> = ({
  language,
  isMuted,
  isColorblindMode,
}) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [pot, setPot] = useState<number>(0);
  const [currentBet, setCurrentBet] = useState<number>(20);
  const [stage, setStage] = useState<Stage>('preflop');
  const [commentary, setCommentary] = useState<string | null>(
    '🎰 Texas Hold\'em Poker match started! Pre-flop betting round open.'
  );

  const [players, setPlayers] = useState<Player[]>([
    { id: 'player', name: 'You', chips: 1000, holeCards: [], currentBet: 0, isFolded: false, isAi: false },
    { id: 'ai1', name: 'Vikram AI', chips: 1000, holeCards: [], currentBet: 0, isFolded: false, isAi: true },
    { id: 'ai2', name: 'Rohan AI', chips: 1000, holeCards: [], currentBet: 0, isFolded: false, isAi: true },
  ]);

  const [activeIdx, setActiveIdx] = useState<number>(0);

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

    let deckIdx = 0;
    const updatedPlayers = players.map((p) => {
      const cards = [fullDeck[deckIdx++], fullDeck[deckIdx++]];
      return {
        ...p,
        holeCards: cards,
        currentBet: 10,
        chips: p.chips - 10,
        isFolded: false,
      };
    });

    setDeck(fullDeck.slice(deckIdx));
    setCommunityCards([]);
    setPot(30); // 10 * 3
    setCurrentBet(10);
    setStage('preflop');
    setPlayers(updatedPlayers);
    setActiveIdx(0);
    setCommentary('🎰 2 Hole Cards dealt to each player! Small & Big blinds placed.');
  }, [players]);

  useEffect(() => {
    startNewHand();
  }, []);

  const advanceStage = () => {
    if (stage === 'preflop') {
      // Deal Flop (3 cards)
      setCommunityCards(deck.slice(0, 3));
      setDeck((d) => d.slice(3));
      setStage('flop');
      setCommentary('🃏 THE FLOP! 3 Community cards revealed.');
    } else if (stage === 'flop') {
      // Deal Turn (1 card)
      setCommunityCards((prev) => [...prev, deck[0]]);
      setDeck((d) => d.slice(1));
      setStage('turn');
      setCommentary('🃏 THE TURN! 4th Community card revealed.');
    } else if (stage === 'turn') {
      // Deal River (1 card)
      setCommunityCards((prev) => [...prev, deck[0]]);
      setDeck((d) => d.slice(1));
      setStage('river');
      setCommentary('🃏 THE RIVER! Final 5th Community card on table.');
    } else if (stage === 'river') {
      setStage('showdown');
      resolveShowdown();
    }
  };

  const handleCall = () => {
    soundManager.playHomeEntry();
    const p = players[0];
    const diff = currentBet - p.currentBet;

    setPlayers((prev) =>
      prev.map((pl) => (pl.id === 'player' ? { ...pl, chips: pl.chips - diff, currentBet } : pl))
    );
    setPot((prev) => prev + diff);
    setCommentary(`💰 You called ${diff} chips.`);
    nextTurn();
  };

  const handleRaise = () => {
    soundManager.playVictory();
    const raiseAmount = currentBet + 20;

    setPlayers((prev) =>
      prev.map((pl) =>
        pl.id === 'player' ? { ...pl, chips: pl.chips - raiseAmount, currentBet: raiseAmount } : pl
      )
    );
    setCurrentBet(raiseAmount);
    setPot((prev) => prev + raiseAmount);
    setCommentary(`🚀 You raised bet to ${raiseAmount} chips!`);
    nextTurn();
  };

  const handleFold = () => {
    soundManager.playCapture();
    setPlayers((prev) =>
      prev.map((pl) => (pl.id === 'player' ? { ...pl, isFolded: true } : pl))
    );
    setCommentary('⚠️ You folded this hand.');
    nextTurn();
  };

  const nextTurn = () => {
    const active = players.filter((p) => !p.isFolded);
    if (active.length <= 1) {
      resolveShowdown();
      return;
    }

    const nextIdx = (activeIdx + 1) % players.length;
    setActiveIdx(nextIdx);

    if (nextIdx === 0) {
      advanceStage();
    } else if (players[nextIdx].isAi && !players[nextIdx].isFolded) {
      setTimeout(() => {
        setPot((p) => p + 10);
        soundManager.playTickSound();
        setCommentary(`🤖 ${players[nextIdx].name} matched the bet.`);
        nextTurn();
      }, 1000);
    }
  };

  const resolveShowdown = () => {
    soundManager.playVictory();
    const active = players.filter((p) => !p.isFolded);
    const winner = active[0] || players[0];

    setPlayers((prev) =>
      prev.map((p) => (p.id === winner.id ? { ...p, chips: p.chips + pot } : p))
    );
    setCommentary(`🏆 SHOWDOWN OVER! ${winner.name} wins the Pot of ${pot} chips!`);
  };

  const player = players[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <span className="text-2xl">🎰</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_poker', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold">
                TEXAS HOLD'EM AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Community Cards • Pot Betting Rounds • Hand Rank Evaluator
            </p>
          </div>
        </div>

        <button
          onClick={startNewHand}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Hand</span>
        </button>
      </div>

      {/* Main Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Table */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col items-center justify-between">
            {/* AI Opponents */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {players.slice(1).map((ai) => (
                <div key={ai.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-center space-y-1">
                  <span className="text-xs font-bold text-white block">{ai.name}</span>
                  <div className="flex justify-center gap-1">
                    {ai.holeCards.map((c, i) => (
                      <div key={i} className="w-8 h-12 bg-slate-800 border border-slate-600 rounded flex items-center justify-center text-xs font-bold text-slate-400">
                        {stage === 'showdown' ? getCardLabel(c) : '🂠'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Community Cards & Pot */}
            <div className="space-y-2 text-center">
              <div className="px-6 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl inline-flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-slate-300">POT:</span>
                <span className="text-lg font-black text-amber-300 font-mono">{pot} CHIPS</span>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                {communityCards.map((c, i) => (
                  <div key={i} className="w-12 h-18 bg-white text-slate-900 border-2 border-amber-400 rounded-xl font-black text-sm flex items-center justify-center shadow-lg">
                    {getCardLabel(c)}
                  </div>
                ))}
                {Array(5 - communityCards.length).fill(0).map((_, i) => (
                  <div key={i} className="w-12 h-18 bg-slate-900/60 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-600 text-xs">
                    ?
                  </div>
                ))}
              </div>
            </div>

            {/* Human Hand & Controls */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 w-full max-w-sm text-center space-y-3">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                YOUR HOLE CARDS
              </span>

              <div className="flex justify-center gap-2">
                {player.holeCards.map((c, i) => (
                  <div key={i} className="w-14 h-20 bg-white text-slate-900 border-2 border-amber-400 rounded-xl font-black text-base flex items-center justify-center shadow-xl">
                    {getCardLabel(c)}
                  </div>
                ))}
              </div>

              {stage !== 'showdown' && !player.isFolded && (
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button
                    onClick={handleCall}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Call
                  </button>
                  <button
                    onClick={handleRaise}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    Raise
                  </button>
                  <button
                    onClick={handleFold}
                    className="px-3 py-2 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold text-xs"
                  >
                    Fold
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
              botName="Poker AI Dealer"
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
