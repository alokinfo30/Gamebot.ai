import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Eye, EyeOff, Coins, ShieldAlert } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface TeenPattiGameProps {
  language: LanguageCode;
  isMuted: boolean;
  isColorblindMode: boolean;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2..14 (Ace = 14)
}

interface Player {
  id: string;
  name: string;
  chips: number;
  cards: Card[];
  isSeen: boolean;
  isFolded: boolean;
  isAi: boolean;
}

const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
const VALUE_NAMES: Record<number, string> = {
  11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

const getCardLabel = (card: Card) => {
  const valStr = VALUE_NAMES[card.value] || card.value.toString();
  return `${valStr}${card.suit}`;
};

export const TeenPattiGame: React.FC<TeenPattiGameProps> = ({
  language,
  isMuted,
  isColorblindMode,
}) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [pot, setPot] = useState<number>(0);
  const [currentStake, setCurrentStake] = useState<number>(20);
  const [commentary, setCommentary] = useState<string | null>(
    '🃏 Teen Patti match initialized! Cards dealt. Place your Blind or Chaal bet!'
  );

  const [players, setPlayers] = useState<Player[]>([
    { id: 'player', name: 'You', chips: 1000, cards: [], isSeen: false, isFolded: false, isAi: false },
    { id: 'ai1', name: 'Vikram AI', chips: 1000, cards: [], isSeen: false, isFolded: false, isAi: true },
    { id: 'ai2', name: 'Rohan AI', chips: 1000, cards: [], isSeen: false, isFolded: false, isAi: true },
    { id: 'ai3', name: 'Ananya AI', chips: 1000, cards: [], isSeen: false, isFolded: false, isAi: true },
  ]);

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Initialize and Shuffle Deck
  const dealNewHand = useCallback(() => {
    soundManager.playDiceRoll();

    const newDeck: Card[] = [];
    SUITS.forEach((suit) => {
      for (let v = 2; v <= 14; v++) {
        newDeck.push({ suit, value: v });
      }
    });

    // Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    let deckIdx = 0;
    const updatedPlayers = players.map((p) => {
      const dealt = [newDeck[deckIdx++], newDeck[deckIdx++], newDeck[deckIdx++]];
      return {
        ...p,
        cards: dealt,
        isSeen: false,
        isFolded: false,
        chips: p.chips - 10, // Ante 10
      };
    });

    setDeck(newDeck.slice(deckIdx));
    setPot(40); // 10 ante * 4 players
    setCurrentStake(20);
    setPlayers(updatedPlayers);
    setActiveIdx(0);
    setGameOver(false);
    setCommentary('🃏 Cards dealt! Boot amount collected into Pot.');
  }, [players]);

  useEffect(() => {
    dealNewHand();
  }, []);

  const handleSeeCards = () => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === 'player' ? { ...p, isSeen: true } : p))
    );
    soundManager.playTickSound();
    setCommentary('👀 You looked at your cards!');
  };

  const handleFold = () => {
    soundManager.playCapture();
    setPlayers((prev) =>
      prev.map((p) => (p.id === 'player' ? { ...p, isFolded: true } : p))
    );
    setCommentary('⚠️ You packed (folded)! Turn passes.');
    nextTurn();
  };

  const handleChaal = (isBlind: boolean = false) => {
    soundManager.playHomeEntry();
    const cost = isBlind ? currentStake : currentStake * 2;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === 'player'
          ? { ...p, chips: Math.max(0, p.chips - cost) }
          : p
      )
    );
    setPot((p) => p + cost);
    setCommentary(`💰 You placed a ${isBlind ? 'Blind' : 'Chaal'} bet of ${cost} chips!`);
    nextTurn();
  };

  const evaluateHandRank = (cards: Card[]): number => {
    if (cards.length < 3) return 0;
    const vals = cards.map((c) => c.value).sort((a, b) => a - b);
    const isSameSuit = cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit;
    const isSequence = (vals[0] + 1 === vals[1] && vals[1] + 1 === vals[2]) || (vals[0] === 2 && vals[1] === 3 && vals[2] === 14);

    if (vals[0] === vals[1] && vals[1] === vals[2]) return 600 + vals[0]; // Trio / Trail
    if (isSameSuit && isSequence) return 500 + vals[2]; // Pure Sequence
    if (isSequence) return 400 + vals[2]; // Sequence
    if (isSameSuit) return 300 + vals[2]; // Color
    if (vals[0] === vals[1] || vals[1] === vals[2] || vals[0] === vals[2]) {
      const pairVal = vals[1];
      return 200 + pairVal; // Pair
    }
    return vals[2]; // High Card
  };

  const handleShowdown = () => {
    soundManager.playVictory();
    setGameOver(true);

    const activePlayers = players.filter((p) => !p.isFolded);
    let winner = activePlayers[0];
    let maxRank = -1;

    activePlayers.forEach((p) => {
      const rank = evaluateHandRank(p.cards);
      if (rank > maxRank) {
        maxRank = rank;
        winner = p;
      }
    });

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === winner.id ? { ...p, chips: p.chips + pot } : p
      )
    );

    setCommentary(`🏆 SHOWDOWN! ${winner.name} wins the Pot of ${pot} chips!`);
  };

  const nextTurn = () => {
    const active = players.filter((p) => !p.isFolded);
    if (active.length <= 1) {
      handleShowdown();
      return;
    }

    const nextIndex = (activeIdx + 1) % players.length;
    setActiveIdx(nextIndex);

    // AI logic if next player is AI
    const nextPlayer = players[nextIndex];
    if (nextPlayer && nextPlayer.isAi && !nextPlayer.isFolded) {
      setTimeout(() => {
        const bet = currentStake * (nextPlayer.isSeen ? 2 : 1);
        setPot((p) => p + bet);
        setPlayers((prev) =>
          prev.map((p, idx) =>
            idx === nextIndex ? { ...p, chips: Math.max(0, p.chips - bet) } : p
          )
        );
        soundManager.playTickSound();
        setCommentary(`🤖 ${nextPlayer.name} placed a bet of ${bet} chips!`);
      }, 1000);
    }
  };

  const player = players[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span className="text-2xl">🃏</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_teen_patti', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                PRO CARD AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              3-Card Indian Teen Patti • Trail, Pure Sequence, Color • Pot Betting
            </p>
          </div>
        </div>

        <button
          onClick={dealNewHand}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Next Deal</span>
        </button>
      </div>

      {/* Main Table Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Table & Cards */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col items-center justify-between min-h-[360px]">
            {/* AI Players Row */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {players.slice(1).map((ai) => (
                <div
                  key={ai.id}
                  className={`p-3 rounded-2xl bg-slate-900/80 border ${
                    ai.isFolded ? 'border-red-500/30 opacity-50' : 'border-slate-700'
                  } text-center space-y-1.5`}
                >
                  <span className="text-xs font-black text-white block">{ai.name}</span>
                  <div className="flex justify-center gap-1">
                    {ai.cards.map((c, i) => (
                      <div
                        key={i}
                        className="w-8 h-12 bg-slate-800 border border-slate-600 rounded-md flex items-center justify-center text-xs font-bold text-slate-400 shadow"
                      >
                        {gameOver ? getCardLabel(c) : '🂠'}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono font-bold block">
                    {ai.chips} pts
                  </span>
                </div>
              ))}
            </div>

            {/* Central Pot */}
            <div className="px-6 py-2.5 rounded-2xl bg-slate-900/90 border-2 border-amber-500/40 shadow-xl flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">TOTAL POT:</span>
              <span className="text-lg font-black text-amber-300 font-mono">{pot} CHIPS</span>
            </div>

            {/* Human Player Hand */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 w-full max-w-sm text-center space-y-3">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                YOUR 3 CARDS
              </span>

              <div className="flex justify-center gap-2">
                {player.cards.map((c, i) => (
                  <div
                    key={i}
                    className={`w-14 h-20 rounded-xl border-2 flex flex-col items-center justify-center font-bold text-sm shadow-xl ${
                      player.isSeen
                        ? 'bg-white text-slate-900 border-amber-400'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {player.isSeen ? getCardLabel(c) : '🂠'}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {!gameOver && !player.isFolded && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {!player.isSeen && (
                    <button
                      onClick={handleSeeCards}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>See Cards</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleChaal(false)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    Chaal ({currentStake * 2})
                  </button>

                  <button
                    onClick={handleShowdown}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg cursor-pointer"
                  >
                    Showdown
                  </button>

                  <button
                    onClick={handleFold}
                    className="px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold text-xs"
                  >
                    Pack (Fold)
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
              botName="Teen Patti AI Dealer"
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
