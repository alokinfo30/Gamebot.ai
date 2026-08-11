import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Sparkles, Volume2, VolumeX, Trophy, Bot, Play, Target, Sliders } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

import { GamePlayMode } from '../logic/multiplayerRoomManager';

export interface SnookerGameProps {
  language?: LanguageCode;
  isMuted?: boolean;
  isColorblindMode?: boolean;
  playMode?: GamePlayMode;
  roomCode?: string;
  onDeclareWinner?: (winnerName: string, isHumanWinner: boolean, gameTitle: string, scoreText?: string) => void;
}

export interface SnookerBall {
  id: number;
  type: 'cue' | 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black';
  color: string;
  points: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPocketed: boolean;
}

const TABLE_W = 560;
const TABLE_H = 320;
const FRICTION = 0.985;
const POCKET_RADIUS = 18;

export const SnookerGame: React.FC<SnookerGameProps> = ({
  language,
  isMuted = false,
  isColorblindMode = false,
  playMode = 'vs_ai',
  roomCode,
  onDeclareWinner,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'ai'>('player');
  const [shotPower, setShotPower] = useState<number>(50); // 10 to 100
  const [aimAngle, setAimAngle] = useState<number>(0); // radians, default points right
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [commentary, setCommentary] = useState<string | null>(
    '🎱 Snooker match started! Aim your cue, set shot power, and pocket the balls!'
  );

  const ballsRef = useRef<SnookerBall[]>([]);

  // Initialize Snooker / Pool Table Rack
  const initializeRack = useCallback(() => {
    const newBalls: SnookerBall[] = [];
    const ballR = 8.5;

    // Cue Ball (White) on left baulk area
    newBalls.push({
      id: 0,
      type: 'cue',
      color: '#ffffff',
      points: 0,
      x: 130,
      y: TABLE_H / 2,
      vx: 0,
      vy: 0,
      radius: ballR,
      isPocketed: false,
    });

    // Triangle Red & Colored Balls Rack on right side
    const startX = TABLE_W * 0.65;
    const startY = TABLE_H / 2;

    let idCounter = 1;
    const ballConfigs: Array<{ type: SnookerBall['type']; color: string; points: number }> = [
      { type: 'red', color: '#ef4444', points: 1 },
      { type: 'yellow', color: '#facc15', points: 2 },
      { type: 'green', color: '#22c55e', points: 3 },
      { type: 'brown', color: '#a16207', points: 4 },
      { type: 'blue', color: '#3b82f6', points: 5 },
      { type: 'pink', color: '#ec4899', points: 6 },
      { type: 'black', color: '#1e293b', points: 7 },
    ];

    // Build triangular pyramid of 10 balls
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= r; c++) {
        const config = ballConfigs[(idCounter - 1) % ballConfigs.length];
        const x = startX + r * (ballR * 1.8);
        const y = startY + (c - r / 2) * (ballR * 2.05);

        newBalls.push({
          id: idCounter++,
          type: config.type,
          color: config.color,
          points: config.points,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: ballR,
          isPocketed: false,
        });
      }
    }

    ballsRef.current = newBalls;
    setAimAngle(0);
    setIsSimulating(false);
    setWinner(null);
  }, []);

  useEffect(() => {
    initializeRack();
  }, [initializeRack]);

  // Animation and Physics Simulation Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const pockets = [
      { x: 22, y: 22 }, // Top Left
      { x: TABLE_W / 2, y: 16 }, // Top Middle
      { x: TABLE_W - 22, y: 22 }, // Top Right
      { x: 22, y: TABLE_H - 22 }, // Bottom Left
      { x: TABLE_W / 2, y: TABLE_H - 16 }, // Bottom Middle
      { x: TABLE_W - 22, y: TABLE_H - 22 }, // Bottom Right
    ];

    const render = () => {
      // 1. Draw Wood Cushion Border
      ctx.fillStyle = '#451a03'; // mahogany dark wood
      ctx.fillRect(0, 0, TABLE_W, TABLE_H);

      // Green Felt Cloth Field
      ctx.fillStyle = '#065f46'; // rich snooker green felt
      ctx.fillRect(16, 16, TABLE_W - 32, TABLE_H - 32);

      // Baulk D-Line
      ctx.beginPath();
      ctx.moveTo(130, 16);
      ctx.lineTo(130, TABLE_H - 16);
      ctx.strokeStyle = '#a7f3d055';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // D-Semi-circle
      ctx.beginPath();
      ctx.arc(130, TABLE_H / 2, 35, Math.PI / 2, -Math.PI / 2);
      ctx.stroke();

      // 2. Draw Pockets
      pockets.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#d97706'; // brass pocket rim
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      // 3. Physics step if moving
      if (isSimulating) {
        let activeMotion = false;

        // Move all unpocketed balls
        ballsRef.current.forEach((ball) => {
          if (ball.isPocketed) return;

          if (Math.abs(ball.vx) > 0.05 || Math.abs(ball.vy) > 0.05) {
            ball.x += ball.vx;
            ball.y += ball.vy;
            ball.vx *= FRICTION;
            ball.vy *= FRICTION;
            activeMotion = true;

            // Cushion Bounces
            if (ball.x - ball.radius < 18 || ball.x + ball.radius > TABLE_W - 18) {
              ball.vx = -ball.vx;
            }
            if (ball.y - ball.radius < 18 || ball.y + ball.radius > TABLE_H - 18) {
              ball.vy = -ball.vy;
            }

            // Pocketing check
            pockets.forEach((p) => {
              const dx = ball.x - p.x;
              const dy = ball.y - p.y;
              if (Math.sqrt(dx * dx + dy * dy) < POCKET_RADIUS) {
                ball.isPocketed = true;
                soundManager.playHomeEntry();

                if (ball.type === 'cue') {
                  // Foul! Cue ball pocketed
                  soundManager.playCapture();
                  setCommentary('⚠️ FOUL! Cue ball pocketed in pocket!');
                  // Reset cue ball
                  setTimeout(() => {
                    ball.isPocketed = false;
                    ball.x = 130;
                    ball.y = TABLE_H / 2;
                    ball.vx = 0;
                    ball.vy = 0;
                  }, 800);
                } else {
                  if (currentTurn === 'player') {
                    setPlayerScore((s) => s + ball.points);
                  } else {
                    setAiScore((s) => s + ball.points);
                  }
                  setCommentary(
                    `🎉 ${ball.type.toUpperCase()} ball pocketed! (+${ball.points} pts)`
                  );
                }
              }
            });
          }
        });

        // Ball-to-Ball Elastic Collision
        for (let i = 0; i < ballsRef.current.length; i++) {
          for (let j = i + 1; j < ballsRef.current.length; j++) {
            const b1 = ballsRef.current[i];
            const b2 = ballsRef.current[j];
            if (b1.isPocketed || b2.isPocketed) continue;

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;

            if (dist < minDist && dist > 0) {
              soundManager.playTickSound();
              const nx = dx / dist;
              const ny = dy / dist;

              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const p = nx * kx + ny * ky;

              b1.vx -= p * nx * 0.92;
              b1.vy -= p * ny * 0.92;
              b2.vx += p * nx * 0.92;
              b2.vy += p * ny * 0.92;
            }
          }
        }

        if (!activeMotion) {
          setIsSimulating(false);
          switchTurn();
        }
      }

      // 4. Render Balls
      ballsRef.current.forEach((ball) => {
        if (ball.isPocketed) return;

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();

        // Shiny ball reflection highlight
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 5. Render Cue & Aim Line if Player turn
      const cueBall = ballsRef.current.find((b) => b.type === 'cue' && !b.isPocketed);
      if (cueBall && !isSimulating && currentTurn === 'player') {
        const aimLen = 40 + (shotPower / 100) * 80;
        const endX = cueBall.x + Math.cos(aimAngle) * aimLen;
        const endY = cueBall.y + Math.sin(aimAngle) * aimLen;

        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cue Stick behind ball
        const stickLen = 100;
        const stickStartX = cueBall.x - Math.cos(aimAngle) * (cueBall.radius + 10);
        const stickStartY = cueBall.y - Math.sin(aimAngle) * (cueBall.radius + 10);
        const stickEndX = stickStartX - Math.cos(aimAngle) * stickLen;
        const stickEndY = stickStartY - Math.sin(aimAngle) * stickLen;

        ctx.beginPath();
        ctx.moveTo(stickStartX, stickStartY);
        ctx.lineTo(stickEndX, stickEndY);
        ctx.strokeStyle = '#d97706'; // wood cue stick
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isSimulating, currentTurn, aimAngle, shotPower]);

  const handleShootPlayer = () => {
    if (isSimulating || currentTurn !== 'player') return;

    const cueBall = ballsRef.current.find((b) => b.type === 'cue');
    if (!cueBall) return;

    soundManager.playDiceRoll();
    const speed = 3 + (shotPower / 100) * 14;
    cueBall.vx = Math.cos(aimAngle) * speed;
    cueBall.vy = Math.sin(aimAngle) * speed;
    setIsSimulating(true);
  };

  const executeAiTurn = useCallback(() => {
    if (playMode === 'pass_and_play') {
      setCommentary('🎱 Player 2 Turn! Line up your shot and pot the colored balls.');
      return;
    }
    setCommentary('🤖 AI Snooker Bot is lining up a pot...');

    setTimeout(() => {
      const cueBall = ballsRef.current.find((b) => b.type === 'cue');
      const targetBalls = ballsRef.current.filter((b) => b.type !== 'cue' && !b.isPocketed);

      if (!cueBall || targetBalls.length === 0) return;

      // AI selects closest target ball
      let bestBall = targetBalls[0];
      let minD = Infinity;

      targetBalls.forEach((b) => {
        const d = Math.hypot(b.x - cueBall.x, b.y - cueBall.y);
        if (d < minD) {
          minD = d;
          bestBall = b;
        }
      });

      // Angle from cue to target
      const angle = Math.atan2(bestBall.y - cueBall.y, bestBall.x - cueBall.x);
      const speed = 6 + Math.random() * 8;

      cueBall.vx = Math.cos(angle) * speed;
      cueBall.vy = Math.sin(angle) * speed;

      soundManager.playDiceRoll();
      setIsSimulating(true);
    }, 1500);
  }, []);

  const switchTurn = () => {
    const remaining = ballsRef.current.filter((b) => b.type !== 'cue' && !b.isPocketed);
    if (remaining.length === 0) {
      soundManager.playVictory();
      const isHumanWin = playerScore >= aiScore;
      const winnerName = isHumanWin ? 'You (Player 1)' : 'AI Snooker Bot';
      setWinner(winnerName);
      setCommentary(`🏆 SNOOKER MATCH OVER! ${winnerName} Wins!`);
      if (onDeclareWinner) {
        onDeclareWinner(winnerName, isHumanWin, 'SNOOKER & POOL', `Final Score: ${playerScore} vs ${aiScore}`);
      }
      return;
    }

    if (currentTurn === 'player') {
      setCurrentTurn('ai');
      executeAiTurn();
    } else {
      setCurrentTurn('player');
      setCommentary('🎱 Your turn! Line up your shot and pot the colored balls.');
    }
  };

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="text-2xl">🎱</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_snooker', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                PHYSICS AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Realistic Cue Ball Physics • AI Shot Prediction • Snooker Rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={initializeRack}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-rack Table</span>
          </button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Snooker Canvas */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-3 w-full">
          <div className="relative w-full max-w-[940px] aspect-[7/4] bg-slate-950 p-2 sm:p-4 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={TABLE_W}
              height={TABLE_H}
              className="w-full h-full rounded-xl cursor-crosshair"
            />
          </div>

          {/* Cue Controller */}
          {currentTurn === 'player' && !isSimulating && (
            <div className="w-full max-w-[940px] bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                    <span>Aim Angle</span>
                    <span className="text-yellow-400 font-mono">
                      {Math.round((aimAngle * 180) / Math.PI)}°
                    </span>
                  </label>
                  <input
                    type="range"
                    min="-3.14"
                    max="3.14"
                    step="0.05"
                    value={aimAngle}
                    onChange={(e) => setAimAngle(Number(e.target.value))}
                    className="w-full accent-yellow-500 cursor-pointer mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                    <span>Cue Stroke Power</span>
                    <span className="text-amber-400 font-mono">{shotPower}%</span>
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    value={shotPower}
                    onChange={(e) => setShotPower(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => setAimAngle((a) => a - 0.1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  ↖ Rotate Left
                </button>
                <button
                  onClick={() => setAimAngle(0)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold text-xs"
                >
                  → Center Aim
                </button>
                <button
                  onClick={() => setAimAngle((a) => a + 0.1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Rotate Right ↗
                </button>

                <button
                  onClick={handleShootPlayer}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer ml-auto"
                >
                  🎱 STRIKE CUE!
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Scoreboard & Commentary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Snooker Frame Points
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">You</span>
                <p className="text-2xl font-black text-white font-mono">{playerScore} pts</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/30 space-y-1">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">AI Bot</span>
                <p className="text-2xl font-black text-white font-mono">{aiScore} pts</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <BotCommentaryOverlay
              commentary={commentary}
              botName="Snooker AI Commentator"
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
