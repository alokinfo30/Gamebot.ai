import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Bot, Play, ShieldAlert, Award } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t, getSpeechLang } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

import { GamePlayMode } from '../logic/multiplayerRoomManager';

export interface SnakesAndLaddersProps {
  language?: LanguageCode;
  isMuted?: boolean;
  isColorblindMode?: boolean;
  playMode?: GamePlayMode;
  roomCode?: string;
  onDeclareWinner?: (winnerName: string, isHumanWinner: boolean, gameTitle: string, scoreText?: string) => void;
}

export interface SnakeOrLadder {
  from: number;
  to: number;
  type: 'snake' | 'ladder';
}

export interface SnakesPlayer {
  id: string;
  name: string;
  color: 'red' | 'green' | 'yellow' | 'blue';
  position: number; // 0 to 100. 0 means off-board before start, or start at 1
  isBot: boolean;
  score: number;
}

export const SNAKES_AND_LADDERS_DATA: SnakeOrLadder[] = [
  // Ladders
  { from: 4, to: 14, type: 'ladder' },
  { from: 9, to: 31, type: 'ladder' },
  { from: 20, to: 38, type: 'ladder' },
  { from: 28, to: 84, type: 'ladder' },
  { from: 40, to: 59, type: 'ladder' },
  { from: 51, to: 67, type: 'ladder' },
  { from: 63, to: 81, type: 'ladder' },
  { from: 71, to: 91, type: 'ladder' },
  // Snakes
  { from: 17, to: 7, type: 'snake' },
  { from: 54, to: 34, type: 'snake' },
  { from: 62, to: 19, type: 'snake' },
  { from: 64, to: 60, type: 'snake' },
  { from: 87, to: 24, type: 'snake' },
  { from: 93, to: 73, type: 'snake' },
  { from: 95, to: 75, type: 'snake' },
  { from: 99, to: 78, type: 'snake' },
];

const PLAYER_COLORS_MAP = {
  red: { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-rose-400', hex: '#f43f5e' },
  green: { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-400', hex: '#10b981' },
  yellow: { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-400', hex: '#f59e0b' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-400', hex: '#3b82f6' },
};

export const SnakesAndLadders: React.FC<SnakesAndLaddersProps> = ({
  language,
  isMuted = false,
  isColorblindMode = false,
  playMode = 'vs_ai',
  roomCode,
  onDeclareWinner,
}) => {
  const [players, setPlayers] = useState<SnakesPlayer[]>(() => {
    const isPass = playMode === 'pass_and_play';
    return [
      { id: 'p1', name: 'Player 1 (Red)', color: 'red', position: 1, isBot: false, score: 0 },
      { id: 'p2', name: isPass ? 'Player 2 (Green)' : 'AI Champion Bot', color: 'green', position: 1, isBot: !isPass, score: 0 },
      { id: 'p3', name: isPass ? 'Player 3 (Yellow)' : 'AI Master Bot', color: 'yellow', position: 1, isBot: !isPass, score: 0 },
      { id: 'p4', name: isPass ? 'Player 4 (Blue)' : 'AI Pro Bot', color: 'blue', position: 1, isBot: !isPass, score: 0 },
    ];
  });

  const [currentTurnIdx, setCurrentTurnIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('snakes_game_turn');
      if (saved) return Number(saved);
    } catch (e) {}
    return 0;
  });

  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [winner, setWinner] = useState<SnakesPlayer | null>(null);
  const [commentary, setCommentary] = useState<string | null>(
    t('your_turn', language) + ' 🎲 ' + t('roll_dice', language)
  );

  const isMovingRef = useRef<boolean>(false);

  // Save state on change
  useEffect(() => {
    try {
      localStorage.setItem('snakes_game_players', JSON.stringify(players));
      localStorage.setItem('snakes_game_turn', String(currentTurnIdx));
    } catch (e) {}
  }, [players, currentTurnIdx]);

  const currentPlayer = players[currentTurnIdx];

  const handleResetGame = () => {
    soundManager.playDiceRoll();
    const reset = [
      { id: 'p1', name: 'You (Player 1)', color: 'red', position: 1, isBot: false, score: 0 },
      { id: 'p2', name: 'AI Champion Bot', color: 'green', position: 1, isBot: true, score: 0 },
      { id: 'p3', name: 'AI Master Bot', color: 'yellow', position: 1, isBot: true, score: 0 },
      { id: 'p4', name: 'AI Pro Bot', color: 'blue', position: 1, isBot: true, score: 0 },
    ];
    setPlayers(reset);
    setCurrentTurnIdx(0);
    setDiceValue(null);
    setWinner(null);
    setCommentary(t('your_turn', language) + ' 🎲 ' + t('roll_dice', language));
  };

  const handleRollDice = useCallback(async () => {
    if (isRolling || isMovingRef.current || winner) return;
    const activeP = players[currentTurnIdx];
    // Strict Turn Lock: Human cannot roll dice when it is an AI player's turn
    if (activeP && activeP.isBot && !isRolling) return;

    setIsRolling(true);
    soundManager.playDiceRoll();

    // Roll animation
    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        executeMove(finalRoll);
      }
    }, 70);
  }, [isRolling, winner, players, currentTurnIdx, language]);

  const executeMove = (roll: number) => {
    isMovingRef.current = true;
    const player = players[currentTurnIdx];
    let startPos = player.position;
    let targetPos = startPos + roll;

    if (targetPos > 100) {
      // Must land exactly on 100
      setCommentary(`${player.name} rolled a ${roll} but needs exactly ${100 - startPos} to win!`);
      setTimeout(() => {
        isMovingRef.current = false;
        nextTurn();
      }, 1000);
      return;
    }

    // Step-by-step movement animation
    let currentStep = startPos;
    const stepInterval = setInterval(() => {
      currentStep += 1;
      soundManager.playMoveStep();
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === currentTurnIdx ? { ...p, position: currentStep } : p))
      );

      if (currentStep === targetPos) {
        clearInterval(stepInterval);

        // Check for snake or ladder
        const feature = SNAKES_AND_LADDERS_DATA.find((item) => item.from === targetPos);

        setTimeout(() => {
          if (feature) {
            if (feature.type === 'ladder') {
              soundManager.playHomeEntry();
              setCommentary(`🎉 LADDER! ${player.name} climbed from ${feature.from} up to ${feature.to}!`);
              setPlayers((prev) =>
                prev.map((p, idx) => (idx === currentTurnIdx ? { ...p, position: feature.to } : p))
              );
              targetPos = feature.to;
            } else if (feature.type === 'snake') {
              soundManager.playCapture();
              setCommentary(`🐍 SNAKE BITE! ${player.name} slithered down from ${feature.from} to ${feature.to}!`);
              setPlayers((prev) =>
                prev.map((p, idx) => (idx === currentTurnIdx ? { ...p, position: feature.to } : p))
              );
              targetPos = feature.to;
            }
          } else {
            setCommentary(`${player.name} moved ${roll} steps to square ${targetPos}.`);
          }

          // Check Win Condition
          if (targetPos === 100) {
            soundManager.playVictory();
            setWinner(player);
            setCommentary(`🏆 ${player.name} HAS WON THE SNAKES & LADDERS CHAMPIONSHIP! 🎉`);
            isMovingRef.current = false;
            if (onDeclareWinner) {
              onDeclareWinner(player.name, !player.isBot, 'SNAKES & LADDERS', `${player.name} reached Square 100!`);
            }
            return;
          }

          // If rolled a 6, bonus turn!
          if (roll === 6) {
            setCommentary(`🎲 ROLLED A 6! ${player.name} gets another turn!`);
            isMovingRef.current = false;
            if (player.isBot) {
              setTimeout(() => handleRollDice(), 1200);
            }
          } else {
            isMovingRef.current = false;
            nextTurn();
          }
        }, 400);
      }
    }, 150);
  };

  const nextTurn = () => {
    const nextIdx = (currentTurnIdx + 1) % players.length;
    setCurrentTurnIdx(nextIdx);
    const nextPlayer = players[nextIdx];

    if (nextPlayer.isBot) {
      setCommentary(`🤖 ${nextPlayer.name} is thinking & rolling...`);
      setTimeout(() => {
        handleRollDice();
      }, 1200);
    } else {
      setCommentary(`🎲 Your turn, ${nextPlayer.name}! Click Roll Dice.`);
    }
  };

  // Helper to get grid cell coordinates (1 to 100)
  // Grid layout: Row 10 (91-100 top), Row 1 (1-10 bottom)
  const getCellNumber = (rowIdx: number, colIdx: number) => {
    // rowIdx: 0 is top (row 10), 9 is bottom (row 1)
    const rowFromBottom = 9 - rowIdx; // 0 for bottom row, 9 for top row
    if (rowFromBottom % 2 === 0) {
      // Left to Right: 1..10, 21..30, etc.
      return rowFromBottom * 10 + colIdx + 1;
    } else {
      // Right to Left: 20..11, 40..31, etc.
      return rowFromBottom * 10 + (9 - colIdx) + 1;
    }
  };

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="text-2xl">🐍</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_snakes', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                100 TILE BOARD
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Multi-Dice System • Animated Ladders & Snakes • Voice Commentary
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetGame}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Game</span>
          </button>
        </div>
      </div>

      {/* Main Game Arena Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: 10x10 Board Grid */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center w-full">
          <div className="relative w-full max-w-[940px] aspect-square bg-slate-950 p-2 sm:p-4 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden">
            {/* Grid Cells */}
            <div className="grid grid-cols-10 grid-rows-10 w-full h-full gap-0.5 sm:gap-1 bg-slate-900/60 rounded-xl p-1 relative">
              {Array.from({ length: 10 }).map((_, rIdx) =>
                Array.from({ length: 10 }).map((_, cIdx) => {
                  const num = getCellNumber(rIdx, cIdx);
                  const isLadderStart = SNAKES_AND_LADDERS_DATA.some(
                    (item) => item.from === num && item.type === 'ladder'
                  );
                  const isSnakeStart = SNAKES_AND_LADDERS_DATA.some(
                    (item) => item.from === num && item.type === 'snake'
                  );

                  // Color gradient logic for squares
                  const isEvenRow = Math.floor((num - 1) / 10) % 2 === 0;
                  const isEvenCell = num % 2 === 0;
                  const bgClass =
                    num === 100
                      ? 'bg-gradient-to-br from-amber-500/40 to-yellow-600/40 border-amber-400/80'
                      : isEvenCell
                      ? 'bg-slate-900/90 border-slate-800/80'
                      : 'bg-slate-800/80 border-slate-700/60';

                  // Players on this square
                  const occupantPlayers = players.filter((p) => p.position === num);

                  return (
                    <div
                      key={`square-${num}`}
                      className={`relative flex flex-col items-center justify-between p-0.5 sm:p-1 rounded border text-[9px] sm:text-[11px] font-mono font-extrabold ${bgClass} transition-all`}
                    >
                      <span
                        className={`${
                          num === 100
                            ? 'text-amber-300 font-black scale-110'
                            : occupantPlayers.length > 0
                            ? 'text-blue-300 font-black'
                            : 'text-slate-400'
                        }`}
                      >
                        {num === 100 ? '100 🏆' : num}
                      </span>

                      {/* Feature badge icon */}
                      {isLadderStart && (
                        <span className="text-[10px] sm:text-xs text-emerald-400 animate-bounce" title="Ladder Bottom">
                          🪜
                        </span>
                      )}
                      {isSnakeStart && (
                        <span className="text-[10px] sm:text-xs text-rose-400 animate-pulse" title="Snake Head">
                          🐍
                        </span>
                      )}

                      {/* Player Tokens Stacked */}
                      <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-full">
                        {occupantPlayers.map((p) => (
                          <motion.div
                            key={p.id}
                            layout
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-md ${
                              PLAYER_COLORS_MAP[p.color].bg
                            } flex items-center justify-center text-[8px] font-bold text-white shadow-lg`}
                            title={p.name}
                          >
                            {p.id === 'p1' ? 'Y' : 'B'}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Overlay Snake & Ladder Legend Markers */}
              <div className="absolute inset-0 pointer-events-none p-2 flex items-center justify-center opacity-15">
                <span className="text-9xl">🐍</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Player Status & Roll Controller */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Player Turn Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('active_players', language)}
              </span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {currentPlayer?.name}
              </span>
            </div>

            {/* Players List */}
            <div className="space-y-2">
              {players.map((player, idx) => {
                const isTurn = idx === currentTurnIdx;
                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isTurn
                        ? 'bg-slate-800/90 border-blue-500/60 shadow-lg ring-1 ring-blue-500/40'
                        : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-full ${PLAYER_COLORS_MAP[player.color].bg}`} />
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{player.name}</span>
                          {player.id === 'p1' && (
                            <span className="text-[9px] font-mono text-blue-400">(You)</span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {player.isBot ? 'AI BOT' : 'HUMAN'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        Square {player.position}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Roll Dice Action Button */}
            {!winner && (
              <div className="pt-2">
                <button
                  onClick={handleRollDice}
                  disabled={currentPlayer?.isBot || isRolling}
                  className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    currentPlayer?.isBot || isRolling
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 active:scale-95 shadow-emerald-600/30'
                  }`}
                >
                  <span className="text-xl">🎲</span>
                  <span>
                    {isRolling
                      ? t('roll', language) + '...'
                      : currentPlayer?.isBot
                      ? t('ai_thinking', language)
                      : t('roll_dice', language)}
                  </span>
                  {diceValue !== null && (
                    <span className="ml-auto text-base font-mono font-black px-2 py-0.5 rounded bg-black/40 border border-white/20">
                      {diceValue}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Winner Card */}
            {winner && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/50 text-center space-y-2"
              >
                <Trophy className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                <h3 className="text-sm font-black text-amber-200">
                  {winner.name} {t('winner', language)}
                </h3>
                <button
                  onClick={handleResetGame}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition shadow-md cursor-pointer"
                >
                  {t('play_again', language)}
                </button>
              </motion.div>
            )}
          </div>

          {/* AI Voice Commentary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <BotCommentaryOverlay
              commentary={commentary}
              botName="AI Referee & Voice Commentary"
              botColor="green"
              isMuted={isMuted}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
