import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Bot, Play, ShieldAlert, Award } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t, getSpeechLang } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';
import { Dice } from './Dice';
import { ClassicLudo3DPawn } from './ClassicLudo3DPawn';
import { GamePlayMode } from '../logic/multiplayerRoomManager';
import { PlayerColor } from '../types/ludo';

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
  color: PlayerColor;
  position: number;
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

const PLAYER_COLORS_MAP: Record<PlayerColor, { bg: string; border: string; text: string; hex: string }> = {
  red: { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-rose-400', hex: '#f43f5e' },
  green: { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-400', hex: '#10b981' },
  yellow: { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-400', hex: '#f59e0b' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-400', hex: '#3b82f6' },
};

/**
 * Calculates board cell center position in percentage (0% to 100%) for tile 1..100
 */
function getSquareCenterPercent(num: number): { x: number; y: number } {
  const rowFromBottom = Math.floor((num - 1) / 10); // 0 (bottom) to 9 (top)
  const colFromLeft = rowFromBottom % 2 === 0 ? (num - 1) % 10 : 9 - ((num - 1) % 10);
  const rowIdxTop = 9 - rowFromBottom; // 0 (top) to 9 (bottom)

  const x = (colFromLeft + 0.5) * 10;
  const y = (rowIdxTop + 0.5) * 10;
  return { x, y };
}

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

  useEffect(() => {
    try {
      localStorage.setItem('snakes_game_players', JSON.stringify(players));
      localStorage.setItem('snakes_game_turn', String(currentTurnIdx));
    } catch (e) {}
  }, [players, currentTurnIdx]);

  const currentPlayer = players[currentTurnIdx];

  const handleResetGame = () => {
    soundManager.playDiceRoll();
    const reset: SnakesPlayer[] = [
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
    if (activeP && activeP.isBot && !isRolling) return;

    setIsRolling(true);
    soundManager.playDiceRoll();

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
      setCommentary(`${player.name} rolled a ${roll} but needs exactly ${100 - startPos} to win!`);
      setTimeout(() => {
        isMovingRef.current = false;
        nextTurn();
      }, 1000);
      return;
    }

    let currentStep = startPos;
    const stepInterval = setInterval(() => {
      currentStep += 1;
      soundManager.playMoveStep();
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === currentTurnIdx ? { ...p, position: currentStep } : p))
      );

      if (currentStep === targetPos) {
        clearInterval(stepInterval);

        const feature = SNAKES_AND_LADDERS_DATA.find((item) => item.from === targetPos);

        setTimeout(() => {
          if (feature) {
            if (feature.type === 'ladder') {
              soundManager.playHomeEntry();
              setCommentary(`🎉 LADDER CLIMB! ${player.name} climbed from Square ${feature.from} 🪜 UP TO Square ${feature.to}!`);
              setPlayers((prev) =>
                prev.map((p, idx) => (idx === currentTurnIdx ? { ...p, position: feature.to } : p))
              );
              targetPos = feature.to;
            } else if (feature.type === 'snake') {
              soundManager.playCapture();
              setCommentary(`🐍 SNAKE BITE! ${player.name} slithered down from Square ${feature.from} ⬇ TO Square ${feature.to}!`);
              setPlayers((prev) =>
                prev.map((p, idx) => (idx === currentTurnIdx ? { ...p, position: feature.to } : p))
              );
              targetPos = feature.to;
            }
          } else {
            setCommentary(`${player.name} moved ${roll} steps to square ${targetPos}.`);
          }

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
      setCommentary(`🎲 Your turn, ${nextPlayer.name}! Tap 3D Dice to roll.`);
    }
  };

  const getCellNumber = (rowIdx: number, colIdx: number) => {
    const rowFromBottom = 9 - rowIdx;
    if (rowFromBottom % 2 === 0) {
      return rowFromBottom * 10 + colIdx + 1;
    } else {
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
                100 TILE ARENA
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              3D Interactive Dice • Animated Snakes & Ladders Overlay • Voice Commentary
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
        {/* Left Side: 10x10 Board Grid with SVG Snake & Ladder Overlay */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center w-full">
          <div className="relative w-full aspect-square bg-slate-950 p-2 sm:p-4 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden">
            
            {/* SVG Connecting Overlay for Snakes and Ladders */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ladderGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>
                <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Render Connecting Lines for Snakes & Ladders */}
              {SNAKES_AND_LADDERS_DATA.map((item, idx) => {
                const start = getSquareCenterPercent(item.from);
                const end = getSquareCenterPercent(item.to);

                if (item.type === 'ladder') {
                  return (
                    <g key={`ladder_${idx}`}>
                      {/* Ladder Main Rails */}
                      <line
                        x1={start.x - 1.2}
                        y1={start.y}
                        x2={end.x - 1.2}
                        y2={end.y}
                        stroke="url(#ladderGrad)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />
                      <line
                        x1={start.x + 1.2}
                        y1={start.y}
                        x2={end.x + 1.2}
                        y2={end.y}
                        stroke="url(#ladderGrad)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />
                      {/* Ladder Rungs */}
                      {Array.from({ length: 5 }).map((_, rStep) => {
                        const tStep = (rStep + 1) / 6;
                        const rx1 = (start.x - 1.2) * (1 - tStep) + (end.x - 1.2) * tStep;
                        const ry1 = start.y * (1 - tStep) + end.y * tStep;
                        const rx2 = (start.x + 1.2) * (1 - tStep) + (end.x + 1.2) * tStep;
                        const ry2 = start.y * (1 - tStep) + end.y * tStep;
                        return (
                          <line
                            key={`rung_${rStep}`}
                            x1={rx1}
                            y1={ry1}
                            x2={rx2}
                            y2={ry2}
                            stroke="#fef08a"
                            strokeWidth="0.8"
                          />
                        );
                      })}
                    </g>
                  );
                } else {
                  // Snake Wavy Path
                  const midX = (start.x + end.x) / 2 + (idx % 2 === 0 ? 8 : -8);
                  const midY = (start.y + end.y) / 2;
                  const pathData = `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;

                  return (
                    <g key={`snake_${idx}`}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke="url(#snakeGrad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />
                      {/* Snake Head Dot */}
                      <circle cx={start.x} cy={start.y} r="2" fill="#ef4444" stroke="#ffffff" strokeWidth="0.5" />
                    </g>
                  );
                }
              })}
            </svg>

            {/* Grid Cells */}
            <div className="grid grid-cols-10 grid-rows-10 w-full h-full gap-0.5 sm:gap-1 bg-slate-900/60 rounded-xl p-1 relative z-10">
              {Array.from({ length: 10 }).map((_, rIdx) =>
                Array.from({ length: 10 }).map((_, cIdx) => {
                  const num = getCellNumber(rIdx, cIdx);
                  const ladderFeature = SNAKES_AND_LADDERS_DATA.find(
                    (item) => item.from === num && item.type === 'ladder'
                  );
                  const snakeFeature = SNAKES_AND_LADDERS_DATA.find(
                    (item) => item.from === num && item.type === 'snake'
                  );

                  const isEvenCell = num % 2 === 0;
                  const bgClass =
                    num === 100
                      ? 'bg-gradient-to-br from-amber-500/40 to-yellow-600/40 border-amber-400/80'
                      : isEvenCell
                      ? 'bg-slate-900/90 border-slate-800/80'
                      : 'bg-slate-800/80 border-slate-700/60';

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

                      {/* Explicit Destination Badge for Ladders & Snakes */}
                      {ladderFeature && (
                        <span
                          className="text-[8px] sm:text-[10px] text-emerald-300 font-black bg-emerald-950/80 border border-emerald-500/60 px-1 rounded animate-bounce z-20"
                          title={`Ladder Climbs Up to Square ${ladderFeature.to}`}
                        >
                          🪜 ➔ {ladderFeature.to}
                        </span>
                      )}
                      {snakeFeature && (
                        <span
                          className="text-[8px] sm:text-[10px] text-rose-300 font-black bg-rose-950/80 border border-rose-500/60 px-1 rounded animate-pulse z-20"
                          title={`Snake Slithers Down to Square ${snakeFeature.to}`}
                        >
                          🐍 ➔ {snakeFeature.to}
                        </span>
                      )}

                      {/* Player 3D Pawns Stacked */}
                      <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-full z-30">
                        {occupantPlayers.map((p) => (
                          <motion.div
                            key={p.id}
                            layout
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="w-5 h-5 sm:w-6 sm:h-6"
                            title={p.name}
                          >
                            <ClassicLudo3DPawn color={p.color} tokenId={0} isMovable={false} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Player Status & Interactive 3D Dice Controller */}
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

            {/* Interactive Real 3D Dice Component */}
            {!winner && (
              <div className="pt-2 flex flex-col items-center justify-center bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <Dice
                  value={diceValue}
                  onRoll={handleRollDice}
                  disabled={currentPlayer?.isBot || isRolling || isMovingRef.current}
                  currentColor={currentPlayer?.color || 'red'}
                  hasRolled={isRolling}
                />
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
