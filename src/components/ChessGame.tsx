import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Bot, Sparkles, Shield, Swords } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

import { GamePlayMode, broadcastGameState, subscribeRoomEvents } from '../logic/multiplayerRoomManager';

export interface ChessGameProps {
  language?: LanguageCode;
  isMuted?: boolean;
  isColorblindMode?: boolean;
  playMode?: GamePlayMode;
  roomCode?: string;
  onDeclareWinner?: (winnerName: string, isHumanWinner: boolean, gameTitle: string, scoreText?: string) => void;
}

type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

type BoardState = (ChessPiece | null)[][];

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
  b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' },
};

const INITIAL_BOARD: BoardState = [
  [
    { type: 'r', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'q', color: 'b' },
    { type: 'k', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'r', color: 'b' },
  ],
  Array(8).fill({ type: 'p', color: 'b' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'p', color: 'w' }),
  [
    { type: 'r', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'q', color: 'w' },
    { type: 'k', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'r', color: 'w' },
  ],
];

export const ChessGame: React.FC<ChessGameProps> = ({
  language,
  isMuted = false,
  isColorblindMode = false,
  playMode = 'vs_ai',
  roomCode,
  onDeclareWinner,
}) => {
  const [board, setBoard] = useState<BoardState>(() => {
    try {
      const saved = localStorage.getItem('chess_game_board');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_BOARD;
  });
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [turn, setTurn] = useState<PieceColor>(() => {
    try {
      const saved = localStorage.getItem('chess_game_turn');
      if (saved === 'w' || saved === 'b') return saved;
    } catch (e) {}
    return 'w';
  });
  const [capturedByPlayer, setCapturedByPlayer] = useState<ChessPiece[]>(() => {
    try {
      const saved = localStorage.getItem('chess_game_captured_player');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [capturedByAi, setCapturedByAi] = useState<ChessPiece[]>(() => {
    try {
      const saved = localStorage.getItem('chess_game_captured_ai');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [moveHistory, setMoveHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chess_game_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [commentary, setCommentary] = useState<string | null>(
    '♟️ Grandmaster Chess match active! Select a piece to move.'
  );

  // Persist Chess state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chess_game_board', JSON.stringify(board));
      localStorage.setItem('chess_game_turn', turn);
      localStorage.setItem('chess_game_captured_player', JSON.stringify(capturedByPlayer));
      localStorage.setItem('chess_game_captured_ai', JSON.stringify(capturedByAi));
      localStorage.setItem('chess_game_history', JSON.stringify(moveHistory));
    } catch (e) {}
  }, [board, turn, capturedByPlayer, capturedByAi, moveHistory]);

  const resetGame = () => {
    soundManager.playDiceRoll();
    try {
      localStorage.removeItem('chess_game_board');
      localStorage.removeItem('chess_game_turn');
      localStorage.removeItem('chess_game_captured_player');
      localStorage.removeItem('chess_game_captured_ai');
      localStorage.removeItem('chess_game_history');
    } catch (e) {}
    setBoard(INITIAL_BOARD);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setTurn('w');
    setCapturedByPlayer([]);
    setCapturedByAi([]);
    setMoveHistory([]);
    setCommentary('♟️ New Chess Game started! White to move.');
  };

  const calculateMoves = useCallback((r: number, c: number, currentBoard: BoardState): [number, number][] => {
    const piece = currentBoard[r][c];
    if (!piece) return [];
    const moves: [number, number][] = [];

    const isEnemy = (tr: number, tc: number) => {
      const target = currentBoard[tr][tc];
      return target !== null && target.color !== piece.color;
    };

    const isEmpty = (tr: number, tc: number) => currentBoard[tr][tc] === null;

    if (piece.type === 'p') {
      const dir = piece.color === 'w' ? -1 : 1;
      const startRow = piece.color === 'w' ? 6 : 1;

      if (r + dir >= 0 && r + dir < 8 && isEmpty(r + dir, c)) {
        moves.push([r + dir, c]);
        if (r === startRow && isEmpty(r + 2 * dir, c)) {
          moves.push([r + 2 * dir, c]);
        }
      }
      // Captures
      [-1, 1].forEach((dc) => {
        if (r + dir >= 0 && r + dir < 8 && c + dc >= 0 && c + dc < 8 && isEnemy(r + dir, c + dc)) {
          moves.push([r + dir, c + dc]);
        }
      });
    } else if (piece.type === 'n') {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      offsets.forEach(([dr, dc]) => {
        const tr = r + dr;
        const tc = c + dc;
        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          if (isEmpty(tr, tc) || isEnemy(tr, tc)) moves.push([tr, tc]);
        }
      });
    } else if (piece.type === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const tr = r + dr;
          const tc = c + dc;
          if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
            if (isEmpty(tr, tc) || isEnemy(tr, tc)) moves.push([tr, tc]);
          }
        }
      }
    } else {
      // Sliding pieces: R, B, Q
      const dirs: [number, number][] = [];
      if (piece.type === 'r' || piece.type === 'q') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      if (piece.type === 'b' || piece.type === 'q') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);

      dirs.forEach(([dr, dc]) => {
        let tr = r + dr;
        let tc = c + dc;
        while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          if (isEmpty(tr, tc)) {
            moves.push([tr, tc]);
          } else if (isEnemy(tr, tc)) {
            moves.push([tr, tc]);
            break;
          } else {
            break; // friendly piece
          }
          tr += dr;
          tc += dc;
        }
      });
    }

    return moves;
  }, []);

  const handleSquareClick = (r: number, c: number) => {
    if (turn !== 'w') return;

    if (selectedSquare) {
      const [sr, sc] = selectedSquare;
      const isMoveValid = possibleMoves.some(([mr, mc]) => mr === r && mc === c);

      if (isMoveValid) {
        executeMove(sr, sc, r, c);
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }
    }

    const piece = board[r][c];
    if (piece && piece.color === 'w') {
      setSelectedSquare([r, c]);
      const legal = calculateMoves(r, c, board);
      setPossibleMoves(legal);
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const executeMove = (fromR: number, fromC: number, toR: number, toC: number) => {
    const newBoard = board.map((row) => [...row]);
    const movingPiece = newBoard[fromR][fromC]!;
    const targetPiece = newBoard[toR][toC];

    newBoard[toR][toC] = movingPiece;
    newBoard[fromR][fromC] = null;

    soundManager.playDiceRoll();

    if (targetPiece) {
      soundManager.playCapture();
      if (movingPiece.color === 'w') {
        setCapturedByPlayer((prev) => [...prev, targetPiece]);
        setCommentary(`⚔️ Captured Black ${targetPiece.type.toUpperCase()}!`);
      } else {
        setCapturedByAi((prev) => [...prev, targetPiece]);
        setCommentary(`🤖 AI Captured White ${targetPiece.type.toUpperCase()}!`);
      }
    } else {
      setCommentary(
        movingPiece.color === 'w'
          ? `♟️ Moved White ${movingPiece.type.toUpperCase()} to ${String.fromCharCode(97 + toC)}${8 - toR}`
          : `🤖 AI Moved Black ${movingPiece.type.toUpperCase()} to ${String.fromCharCode(97 + toC)}${8 - toR}`
      );
    }

    setBoard(newBoard);
    const moveNotation = `${movingPiece.type.toUpperCase()}:${String.fromCharCode(97 + fromC)}${8 - fromR}->${String.fromCharCode(97 + toC)}${8 - toR}`;
    setMoveHistory((prev) => [moveNotation, ...prev.slice(0, 15)]);

    const nextTurn = movingPiece.color === 'w' ? 'b' : 'w';
    setTurn(nextTurn);
  };

  // AI Turn Logic (Disabled in Pass & Play mode)
  useEffect(() => {
    if (playMode === 'pass_and_play') return;
    if (turn === 'b') {
      const timer = setTimeout(() => {
        // Find all possible AI moves
        const aiMoves: { from: [number, number]; to: [number, number]; score: number }[] = [];

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.color === 'b') {
              const legal = calculateMoves(r, c, board);
              legal.forEach(([tr, tc]) => {
                const target = board[tr][tc];
                let score = Math.random() * 2;
                if (target) {
                  const valMap: Record<PieceType, number> = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
                  score += valMap[target.type] * 10;
                }
                aiMoves.push({ from: [r, c], to: [tr, tc], score });
              });
            }
          }
        }

        if (aiMoves.length > 0) {
          aiMoves.sort((a, b) => b.score - a.score);
          const best = aiMoves[0];
          executeMove(best.from[0], best.from[1], best.to[0], best.to[1]);
        } else {
          setCommentary('🎉 Checkmate! AI has no legal moves left. You Win!');
          soundManager.playVictory();
          if (onDeclareWinner) {
            onDeclareWinner('You (Player 1)', true, 'CHESS GRANDMASTER', 'Checkmate! White Pieces Victory!');
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [turn, board, calculateMoves]);

  const [playTimerSeconds, setTurnTimerSeconds] = useState<number>(15);

  // 15-Second Play Timer for Human Turn in Chess
  useEffect(() => {
    if (turn !== 'w') {
      setTurnTimerSeconds(15);
      return;
    }
    const timerInterval = setInterval(() => {
      setTurnTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          // Auto-execute legal move for player
          const allLegalMoves: { from: [number, number]; to: [number, number] }[] = [];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (board[r][c]?.color === 'w') {
                const legal = calculateMoves(r, c, board);
                legal.forEach(([tr, tc]) => allLegalMoves.push({ from: [r, c], to: [tr, tc] }));
              }
            }
          }
          if (allLegalMoves.length > 0) {
            const chosen = allLegalMoves[Math.floor(Math.random() * allLegalMoves.length)];
            executeMove(chosen.from[0], chosen.from[1], chosen.to[0], chosen.to[1]);
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [turn, board]);

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <span className="text-2xl">♟️</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>Grandmaster Chess</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Standard Rules • Move Highlighting • Smart Tactician Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {turn === 'w' && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-black flex items-center gap-1.5 shadow-md">
              <span>⏱️ PLAY TIMER: {playTimerSeconds}s</span>
            </div>
          )}

          <button
            onClick={resetGame}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Game</span>
          </button>
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: 8x8 Board */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-3 w-full">
          <div className="bg-slate-950 p-2 sm:p-4 rounded-3xl border-4 border-slate-800 shadow-2xl w-full flex items-center justify-center">
            <div className="grid grid-cols-8 gap-0 border-2 border-slate-700 rounded-xl overflow-hidden w-full max-w-[760px] aspect-square">
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const isSelected = selectedSquare?.[0] === r && selectedSquare?.[1] === c;
                  const isMove = possibleMoves.some(([mr, mc]) => mr === r && mc === c);

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      className={`relative flex items-center justify-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold transition-all cursor-pointer ${
                        isLight ? 'bg-amber-100 text-slate-900' : 'bg-amber-800 text-amber-50'
                      } ${isSelected ? 'ring-4 ring-blue-500 z-10' : ''}`}
                    >
                      {cell && (
                        <span className={cell.color === 'w' ? 'drop-shadow-md text-slate-900' : 'drop-shadow-md text-black'}>
                          {PIECE_SYMBOLS[cell.color][cell.type]}
                        </span>
                      )}

                      {/* Move dot indicator */}
                      {isMove && (
                        <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-500/80 border-2 border-white shadow-lg animate-pulse" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Captured Pieces & Commentary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-indigo-400" />
              <span>Captured Pieces</span>
            </h2>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">You Captured:</span>
                <div className="flex flex-wrap gap-1 mt-1 text-lg">
                  {capturedByPlayer.map((p, idx) => (
                    <span key={idx}>{PIECE_SYMBOLS[p.color][p.type]}</span>
                  ))}
                  {capturedByPlayer.length === 0 && <span className="text-xs text-slate-600">None yet</span>}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">AI Captured:</span>
                <div className="flex flex-wrap gap-1 mt-1 text-lg">
                  {capturedByAi.map((p, idx) => (
                    <span key={idx}>{PIECE_SYMBOLS[p.color][p.type]}</span>
                  ))}
                  {capturedByAi.length === 0 && <span className="text-xs text-slate-600">None yet</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <BotCommentaryOverlay
              commentary={commentary}
              botName="Chess AI Tactician"
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
