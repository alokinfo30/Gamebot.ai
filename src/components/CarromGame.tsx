import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Sparkles, Volume2, VolumeX, Trophy, Bot, Play, Target, Sliders } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface CarromGameProps {
  language: LanguageCode;
  isMuted: boolean;
  isColorblindMode: boolean;
}

export interface Coin {
  id: number;
  type: 'white' | 'black' | 'queen';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPocketed: boolean;
}

export interface Striker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baselineY: number;
  isMoving: boolean;
}

const BOARD_SIZE = 500;
const FRICTION = 0.982;
const POCKET_RADIUS = 24;

export const CarromGame: React.FC<CarromGameProps> = ({
  language,
  isMuted,
  isColorblindMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'ai'>('player');
  const [shotPower, setShotPower] = useState<number>(50); // 10 to 100
  const [aimAngle, setAimAngle] = useState<number>(-Math.PI / 2); // default points straight up
  const [strikerPosX, setStrikerPosX] = useState<number>(BOARD_SIZE / 2);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [commentary, setCommentary] = useState<string | null>(
    t('your_turn', language) + ' 🎯 Drag striker to position, aim and shoot!'
  );

  // Coins State in Ref for high-performance physics animation loop
  const coinsRef = useRef<Coin[]>([]);
  const strikerRef = useRef<Striker>({
    x: BOARD_SIZE / 2,
    y: BOARD_SIZE - 70,
    vx: 0,
    vy: 0,
    radius: 16,
    baselineY: BOARD_SIZE - 70,
    isMoving: false,
  });

  // Initialize Board Coins Setup
  const initializeCoins = useCallback(() => {
    const newCoins: Coin[] = [];
    const centerX = BOARD_SIZE / 2;
    const centerY = BOARD_SIZE / 2;
    const coinR = 11;

    // Queen at exact center
    newCoins.push({
      id: 0,
      type: 'queen',
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      radius: coinR,
      isPocketed: false,
    });

    // Ring of 6 coins around queen
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const dist = coinR * 2.1;
      newCoins.push({
        id: i + 1,
        type: i % 2 === 0 ? 'white' : 'black',
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: coinR,
        isPocketed: false,
      });
    }

    // Outer ring of 12 coins
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 + Math.PI / 12;
      const dist = coinR * 4.2;
      newCoins.push({
        id: i + 7,
        type: i % 2 === 0 ? 'white' : 'black',
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: coinR,
        isPocketed: false,
      });
    }

    coinsRef.current = newCoins;
    strikerRef.current = {
      x: BOARD_SIZE / 2,
      y: BOARD_SIZE - 70,
      vx: 0,
      vy: 0,
      radius: 16,
      baselineY: BOARD_SIZE - 70,
      isMoving: false,
    };
    setStrikerPosX(BOARD_SIZE / 2);
    setAimAngle(-Math.PI / 2);
    setIsSimulating(false);
  }, []);

  useEffect(() => {
    initializeCoins();
  }, [initializeCoins]);

  // Main Render & Physics Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // 1. Draw Wood Canvas Board
      ctx.fillStyle = '#fef3c7'; // warm wood cream
      ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // Outer Wood Frame
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, BOARD_SIZE - 14, BOARD_SIZE - 14);

      // Pockets at 4 Corners
      const pockets = [
        { x: 35, y: 35 },
        { x: BOARD_SIZE - 35, y: 35 },
        { x: 35, y: BOARD_SIZE - 35 },
        { x: BOARD_SIZE - 35, y: BOARD_SIZE - 35 },
      ];

      pockets.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      // Center Concentric Circles
      ctx.beginPath();
      ctx.arc(BOARD_SIZE / 2, BOARD_SIZE / 2, 45, 0, Math.PI * 2);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(BOARD_SIZE / 2, BOARD_SIZE / 2, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b22';
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Baseline Strike Lines
      // Bottom Baseline (Player)
      ctx.beginPath();
      ctx.moveTo(80, BOARD_SIZE - 70);
      ctx.lineTo(BOARD_SIZE - 80, BOARD_SIZE - 70);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top Baseline (AI)
      ctx.beginPath();
      ctx.moveTo(80, 70);
      ctx.lineTo(BOARD_SIZE - 80, 70);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Physics Simulation step if active
      if (isSimulating) {
        let activeMotion = false;

        const striker = strikerRef.current;
        if (striker.isMoving) {
          striker.x += striker.vx;
          striker.y += striker.vy;
          striker.vx *= FRICTION;
          striker.vy *= FRICTION;

          if (Math.abs(striker.vx) < 0.1 && Math.abs(striker.vy) < 0.1) {
            striker.vx = 0;
            striker.vy = 0;
            striker.isMoving = false;
          } else {
            activeMotion = true;
          }

          // Wall bounce for striker
          if (striker.x - striker.radius < 18 || striker.x + striker.radius > BOARD_SIZE - 18) {
            striker.vx = -striker.vx;
          }
          if (striker.y - striker.radius < 18 || striker.y + striker.radius > BOARD_SIZE - 18) {
            striker.vy = -striker.vy;
          }

          // Check pocket for striker (foul!)
          pockets.forEach((p) => {
            const dx = striker.x - p.x;
            const dy = striker.y - p.y;
            if (Math.sqrt(dx * dx + dy * dy) < POCKET_RADIUS) {
              soundManager.playCapture();
              setCommentary('⚠️ FOUL! Striker pocketed!');
              striker.vx = 0;
              striker.vy = 0;
              striker.isMoving = false;
            }
          });
        }

        // Update Coins
        coinsRef.current.forEach((coin) => {
          if (coin.isPocketed) return;

          if (Math.abs(coin.vx) > 0.05 || Math.abs(coin.vy) > 0.05) {
            coin.x += coin.vx;
            coin.y += coin.vy;
            coin.vx *= FRICTION;
            coin.vy *= FRICTION;
            activeMotion = true;

            // Wall bounce
            if (coin.x - coin.radius < 18 || coin.x + coin.radius > BOARD_SIZE - 18) {
              coin.vx = -coin.vx;
            }
            if (coin.y - coin.radius < 18 || coin.y + coin.radius > BOARD_SIZE - 18) {
              coin.vy = -coin.vy;
            }

            // Check pocketing
            pockets.forEach((p) => {
              const dx = coin.x - p.x;
              const dy = coin.y - p.y;
              if (Math.sqrt(dx * dx + dy * dy) < POCKET_RADIUS) {
                coin.isPocketed = true;
                soundManager.playHomeEntry();

                if (coin.type === 'white') {
                  if (currentTurn === 'player') setPlayerScore((s) => s + 10);
                  else setAiScore((s) => s + 10);
                  setCommentary(`🎉 White coin pocketed! (+10 pts)`);
                } else if (coin.type === 'black') {
                  if (currentTurn === 'player') setPlayerScore((s) => s + 5);
                  else setAiScore((s) => s + 5);
                  setCommentary(`🎯 Black coin pocketed! (+5 pts)`);
                } else if (coin.type === 'queen') {
                  if (currentTurn === 'player') setPlayerScore((s) => s + 50);
                  else setAiScore((s) => s + 50);
                  setCommentary(`👑 QUEEN POCKETED! (+50 pts)`);
                }
              }
            });
          }
        });

        // Elastic Collisions between Striker & Coins
        coinsRef.current.forEach((coin) => {
          if (coin.isPocketed) return;
          const dx = coin.x - striker.x;
          const dy = coin.y - striker.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = coin.radius + striker.radius;

          if (dist < minDist && dist > 0) {
            soundManager.playTickSound();
            const nx = dx / dist;
            const ny = dy / dist;

            const kx = striker.vx - coin.vx;
            const ky = striker.vy - coin.vy;
            const p = 2 * (nx * kx + ny * ky) / 2; // equal mass factor

            striker.vx -= p * nx * 0.85;
            striker.vy -= p * ny * 0.85;
            coin.vx += p * nx * 0.85;
            coin.vy += p * ny * 0.85;
          }
        });

        // Elastic Collisions between Coin & Coin
        for (let i = 0; i < coinsRef.current.length; i++) {
          for (let j = i + 1; j < coinsRef.current.length; j++) {
            const c1 = coinsRef.current[i];
            const c2 = coinsRef.current[j];
            if (c1.isPocketed || c2.isPocketed) continue;

            const dx = c2.x - c1.x;
            const dy = c2.y - c1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = c1.radius + c2.radius;

            if (dist < minDist && dist > 0) {
              const nx = dx / dist;
              const ny = dy / dist;

              const kx = c1.vx - c2.vx;
              const ky = c1.vy - c2.vy;
              const p = nx * kx + ny * ky;

              c1.vx -= p * nx * 0.9;
              c1.vy -= p * ny * 0.9;
              c2.vx += p * nx * 0.9;
              c2.vy += p * ny * 0.9;
            }
          }
        }

        // End of shot evaluation when all motion stops
        if (!activeMotion) {
          setIsSimulating(false);
          switchTurn();
        }
      }

      // 3. Draw Coins
      coinsRef.current.forEach((coin) => {
        if (coin.isPocketed) return;

        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);

        if (coin.type === 'white') {
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (coin.type === 'black') {
          ctx.fillStyle = '#1e293b';
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (coin.type === 'queen') {
          ctx.fillStyle = '#e11d48'; // vibrant red
          ctx.fill();
          ctx.strokeStyle = '#fbbf24'; // gold border
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      });

      // 4. Draw Striker
      const striker = strikerRef.current;
      ctx.beginPath();
      ctx.arc(striker.x, striker.y, striker.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 5. Draw Aim Arrow if it's Player turn and not simulating
      if (!isSimulating && currentTurn === 'player') {
        const arrowLen = 30 + (shotPower / 100) * 50;
        const endX = striker.x + Math.cos(aimAngle) * arrowLen;
        const endY = striker.y + Math.sin(aimAngle) * arrowLen;

        ctx.beginPath();
        ctx.moveTo(striker.x, striker.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isSimulating, currentTurn, aimAngle, shotPower]);

  // Handle Player Shot
  const handleFireShot = () => {
    if (isSimulating || currentTurn !== 'player') return;

    soundManager.playDiceRoll();
    const speed = 4 + (shotPower / 100) * 16;
    strikerRef.current.vx = Math.cos(aimAngle) * speed;
    strikerRef.current.vy = Math.sin(aimAngle) * speed;
    strikerRef.current.isMoving = true;
    setIsSimulating(true);
  };

  // AI Turn Logic
  const executeAiTurn = useCallback(() => {
    setCommentary('🤖 AI Carrom Bot is aiming for a coin...');

    setTimeout(() => {
      // Position striker along AI top baseline (y = 70)
      const targetCoins = coinsRef.current.filter((c) => !c.isPocketed);
      if (targetCoins.length === 0) return;

      const randomCoin = targetCoins[Math.floor(Math.random() * targetCoins.length)];
      const aiStrikerX = Math.min(Math.max(randomCoin.x + (Math.random() * 20 - 10), 100), BOARD_SIZE - 100);

      strikerRef.current.x = aiStrikerX;
      strikerRef.current.y = 70;

      // Aim angle from AI baseline towards coin
      const dx = randomCoin.x - aiStrikerX;
      const dy = randomCoin.y - 70;
      const angle = Math.atan2(dy, dx);

      const speed = 8 + Math.random() * 10;
      strikerRef.current.vx = Math.cos(angle) * speed;
      strikerRef.current.vy = Math.sin(angle) * speed;
      strikerRef.current.isMoving = true;

      soundManager.playDiceRoll();
      setIsSimulating(true);
    }, 1500);
  }, []);

  const switchTurn = () => {
    // Reset Striker to default
    const unpocketed = coinsRef.current.filter((c) => !c.isPocketed);
    if (unpocketed.length === 0) {
      soundManager.playVictory();
      const winText = playerScore > aiScore ? 'You Win!' : 'AI Bot Wins!';
      setWinner(winText);
      setCommentary(`🏆 GAME OVER! ${winText}`);
      return;
    }

    if (currentTurn === 'player') {
      setCurrentTurn('ai');
      executeAiTurn();
    } else {
      setCurrentTurn('player');
      strikerRef.current.x = strikerPosX;
      strikerRef.current.y = BOARD_SIZE - 70;
      setCommentary('🎯 Your Turn! Aim and strike!');
    }
  };

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_carrom', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                PHYSICS AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Realistic 2D Collision Engine • AI Shot Prediction • Queen & Points Rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={initializeCoins}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Board</span>
          </button>
        </div>
      </div>

      {/* Main Game Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Carrom Canvas Board */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-3 w-full">
          <div className="relative w-full max-w-[940px] aspect-square bg-slate-950 p-2 sm:p-4 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={BOARD_SIZE}
              height={BOARD_SIZE}
              className="w-full h-full rounded-xl cursor-crosshair"
            />
          </div>

          {/* Aim & Power Slider Controls */}
          {currentTurn === 'player' && !isSimulating && (
            <div className="w-full max-w-[500px] bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Striker Position Slider */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                    <span>Baseline Position</span>
                    <span className="text-blue-400 font-mono">{Math.round(strikerPosX)}px</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max={BOARD_SIZE - 100}
                    value={strikerPosX}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStrikerPosX(val);
                      strikerRef.current.x = val;
                    }}
                    className="w-full accent-blue-500 cursor-pointer mt-1"
                  />
                </div>

                {/* Shot Power Slider */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                    <span>Shot Power</span>
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

              {/* Aim Angle Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => setAimAngle((a) => a - 0.15)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  ↖ Aim Left
                </button>
                <button
                  onClick={() => setAimAngle(-Math.PI / 2)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs"
                >
                  ↑ Straight
                </button>
                <button
                  onClick={() => setAimAngle((a) => a + 0.15)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Aim Right ↗
                </button>

                <button
                  onClick={handleFireShot}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition active:scale-95 cursor-pointer ml-auto"
                >
                  🔥 STRIKE!
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Scoreboards & Live AI Commentary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Match Scorecard
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/30 space-y-1">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">You</span>
                <p className="text-2xl font-black text-white font-mono">{playerScore} pts</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">AI Bot</span>
                <p className="text-2xl font-black text-white font-mono">{aiScore} pts</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono flex items-center justify-between text-slate-300">
              <span>Active Turn:</span>
              <span className={`font-black ${currentTurn === 'player' ? 'text-blue-400' : 'text-emerald-400'}`}>
                {currentTurn === 'player' ? 'YOUR TURN' : 'AI BOT'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <BotCommentaryOverlay
              commentary={commentary}
              botName="AI Carrom Referee"
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
