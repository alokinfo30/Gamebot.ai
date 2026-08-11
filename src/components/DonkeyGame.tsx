import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, ShieldAlert, Bot, Hand } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface DonkeyGameProps {
  language?: LanguageCode;
  isMuted?: boolean;
  isColorblindMode?: boolean;
  onDeclareWinner?: (winnerName: string, isHumanWinner: boolean, gameTitle: string, scoreText?: string) => void;
}

interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2..14
}

const VAL_LABELS: Record<number, string> = {
  11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

const getCardLabel = (card: Card) => {
  const v = VAL_LABELS[card.value] || card.value.toString();
  return `${v}${card.suit}`;
};

export const DonkeyGame: React.FC<DonkeyGameProps> = ({
  language,
  isMuted = false,
  isColorblindMode = false,
  onDeclareWinner,
}) => {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHands, setAiHands] = useState<Card[][]>([[], [], []]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isTableTouched, setIsTableTouched] = useState<boolean>(false);
  const [touchedPlayers, setTouchedPlayers] = useState<number[]>([]);
  const [commentary, setCommentary] = useState<string | null>(
    '🫏 Donkey card match started! Match 4-of-a-kind and touch the table fast!'
  );

  const startNewGame = useCallback(() => {
    soundManager.playDiceRoll();

    const selectedValues = [11, 12, 13, 14]; // J, Q, K, A
    const suits: Card['suit'][] = ['♠', '♥', '♦', '♣'];
    const deck: Card[] = [];

    selectedValues.forEach((val) => {
      suits.forEach((suit) => {
        deck.push({ id: `${suit}-${val}`, suit, value: val });
      });
    });

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setPlayerHand(deck.slice(0, 4));
    setAiHands([deck.slice(4, 8), deck.slice(8, 12), deck.slice(12, 16)]);
    setSelectedCardId(null);
    setIsTableTouched(false);
    setTouchedPlayers([]);
    setCommentary('🫏 4 Cards dealt! Select 1 card to pass to your left neighbor.');
  }, []);

  useEffect(() => {
    startNewGame();
  }, []);

  const handlePassCard = () => {
    if (!selectedCardId) return;

    soundManager.playTickSound();
    const pCard = playerHand.find((c) => c.id === selectedCardId)!;
    const newPHand = playerHand.filter((c) => c.id !== selectedCardId);

    // AI 1 passes to AI 2, AI 2 to AI 3, AI 3 to Player
    const ai1Card = aiHands[0][0];
    const ai2Card = aiHands[1][0];
    const ai3Card = aiHands[2][0];

    const updatedPHand = [...newPHand, ai3Card];
    const updatedAi1 = [...aiHands[0].slice(1), pCard];
    const updatedAi2 = [...aiHands[1].slice(1), ai1Card];
    const updatedAi3 = [...aiHands[2].slice(1), ai2Card];

    setPlayerHand(updatedPHand);
    setAiHands([updatedAi1, updatedAi2, updatedAi3]);
    setSelectedCardId(null);

    // Check if player formed 4 of a kind
    const counts: Record<number, number> = {};
    updatedPHand.forEach((c) => {
      counts[c.value] = (counts[c.value] || 0) + 1;
    });

    if (Object.values(counts).includes(4)) {
      soundManager.playVictory();
      setCommentary('🎉 YOU FORMED 4-OF-A-KIND! Quickly touch the table!');
    } else {
      setCommentary('🔄 Cards passed! Select next card to pass.');
    }
  };

  const handleTouchTable = (playerIdx: number) => {
    if (touchedPlayers.includes(playerIdx)) return;

    soundManager.playHomeEntry();
    const newTouched = [...touchedPlayers, playerIdx];
    setTouchedPlayers(newTouched);
    setIsTableTouched(true);

    if (newTouched.length === 4) {
      const loser = newTouched[3];
      const winnerIdx = newTouched[0];
      const isHumanWin = winnerIdx === 0;
      const winnerName = isHumanWin ? 'You (Player 1)' : `AI Player ${winnerIdx}`;
      soundManager.playVictory();
      setCommentary(`💥 MATCH OVER! ${winnerName} Wins! Player ${loser === 0 ? 'You are' : loser} is the DONKEY! 🫏`);
      if (onDeclareWinner) {
        onDeclareWinner(winnerName, isHumanWin, 'REFLEX DONKEY', `Winner: ${winnerName} | Donkey Penalty: Player ${loser}`);
      }
    } else {
      setCommentary(`🖐️ Player ${playerIdx === 0 ? 'You' : playerIdx} touched the table!`);
    }
  };

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span className="text-2xl">🫏</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_donkey', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                REFLEX CARD AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              4-of-a-Kind Card Passing • Rapid Reflex Table Touch • Avoid Donkey Title
            </p>
          </div>
        </div>

        <button
          onClick={startNewGame}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>

      {/* Main Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Table & Touch Area */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4 w-full">
          <div className="w-full bg-emerald-950 border-4 border-amber-900/60 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 flex flex-col items-center justify-between min-h-[540px] sm:min-h-[640px]">
            {/* Center Touch Table */}
            <button
              onClick={() => handleTouchTable(0)}
              className={`w-full max-w-xs h-32 rounded-3xl border-4 font-black text-lg shadow-2xl flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                isTableTouched
                  ? 'bg-rose-600 border-rose-400 text-white animate-bounce'
                  : 'bg-amber-600 border-amber-400 text-white hover:bg-amber-500'
              }`}
            >
              <Hand className="w-8 h-8" />
              <span>TOUCH TABLE NOW!</span>
            </button>

            {/* Player Hand & Controls */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 w-full max-w-sm text-center space-y-3">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                YOUR 4 CARDS
              </span>

              <div className="flex justify-center gap-2">
                {playerHand.map((c) => {
                  const isSel = c.id === selectedCardId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCardId(c.id)}
                      className={`w-14 h-20 rounded-xl border-2 font-black text-sm flex items-center justify-center shadow-xl cursor-pointer ${
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

              {selectedCardId && (
                <button
                  onClick={handlePassCard}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg"
                >
                  Pass Selected Card
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Commentary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <BotCommentaryOverlay
              commentary={commentary}
              botName="Donkey AI Referee"
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
