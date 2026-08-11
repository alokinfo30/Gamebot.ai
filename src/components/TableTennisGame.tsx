import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Sparkles, Volume2, VolumeX, Trophy, Bot, Play, Zap, Shield } from 'lucide-react';
import { soundManager } from '../logic/soundManager';
import { LanguageCode, t } from '../logic/i18n';
import { BotCommentaryOverlay } from './BotCommentaryOverlay';

export interface TableTennisGameProps {
  language: LanguageCode;
  isMuted: boolean;
  isColorblindMode: boolean;
}

const COURT_W = 500;
const COURT_H = 340;

export const TableTennisGame: React.FC<TableTennisGameProps> = ({
  language,
  isMuted,
  isColorblindMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [server, setServer] = useState<'player' | 'ai'>('player');
  const [isRallying, setIsRallying] = useState<boolean>(false);
  const [shotType, setShotType] = useState<'drive' | 'topspin' | 'slice' | 'smash'>('drive');
  const [winner, setWinner] = useState<string | null>(null);
  const [commentary, setCommentary] = useState<string | null>(
    '🏓 Table Tennis Match! Click "Serve Ball" to begin rally!'
  );

  // Paddles and Ball Refs for fast animation
  const playerPaddleRef = useRef({ x: COURT_W / 2, y: COURT_H - 30, w: 70, h: 12 });
  const aiPaddleRef = useRef({ x: COURT_W / 2, y: 30, w: 70, h: 12 });
  const ballRef = useRef({
    x: COURT_W / 2,
    y: COURT_H - 50,
    vx: 0,
    vy: 0,
    radius: 7,
    z: 0, // height elevation simulation
  });

  const resetRally = useCallback((nextServer: 'player' | 'ai') => {
    setIsRallying(false);
    setServer(nextServer);

    if (nextServer === 'player') {
      ballRef.current = {
        x: playerPaddleRef.current.x,
        y: COURT_H - 50,
        vx: 0,
        vy: 0,
        radius: 7,
        z: 0,
      };
      setCommentary('🏓 Your Serve! Choose shot spin & press Serve Ball.');
    } else {
      ballRef.current = {
        x: aiPaddleRef.current.x,
        y: 50,
        vx: 0,
        vy: 0,
        radius: 7,
        z: 0,
      };
      setCommentary('🤖 AI Bot is preparing to serve...');
      setTimeout(() => serveAi(), 1200);
    }
  }, []);

  const resetGame = () => {
    soundManager.playDiceRoll();
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    resetRally('player');
  };

  const servePlayer = () => {
    if (isRallying || winner) return;

    soundManager.playDiceRoll();
    let speedY = -7;
    let speedX = (Math.random() - 0.5) * 4;

    if (shotType === 'smash') {
      speedY = -10;
      speedX *= 1.5;
    } else if (shotType === 'slice') {
      speedY = -5;
    }

    ballRef.current.vx = speedX;
    ballRef.current.vy = speedY;
    setIsRallying(true);
    setCommentary(`🔥 You served a fast ${shotType.toUpperCase()}!`);
  };

  const serveAi = () => {
    soundManager.playDiceRoll();
    ballRef.current.vx = (Math.random() - 0.5) * 4;
    ballRef.current.vy = 6;
    setIsRallying(true);
    setCommentary('🤖 AI served the ball down the line!');
  };

  // Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // 1. Draw Table Field
      ctx.fillStyle = '#1e3a8a'; // Deep ping pong blue
      ctx.fillRect(0, 0, COURT_W, COURT_H);

      // Table Border lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, COURT_W - 20, COURT_H - 20);

      // Center Line
      ctx.beginPath();
      ctx.moveTo(COURT_W / 2, 10);
      ctx.lineTo(COURT_W / 2, COURT_H - 10);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Net across middle
      ctx.beginPath();
      ctx.moveTo(10, COURT_H / 2);
      ctx.lineTo(COURT_W - 10, COURT_H / 2);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Net mesh pattern
      ctx.beginPath();
      ctx.moveTo(10, COURT_H / 2);
      ctx.lineTo(COURT_W - 10, COURT_H / 2);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Physics Update
      if (isRallying) {
        const ball = ballRef.current;
        const playerP = playerPaddleRef.current;
        const aiP = aiPaddleRef.current;

        ball.x += ball.vx;
        ball.y += ball.vy;

        // Side wall bounce
        if (ball.x - ball.radius < 10 || ball.x + ball.radius > COURT_W - 10) {
          ball.vx = -ball.vx;
          soundManager.playTickSound();
        }

        // AI Paddle Movement Tracking
        const aiSpeed = 3.8;
        if (aiP.x < ball.x - 10) aiP.x += aiSpeed;
        else if (aiP.x > ball.x + 10) aiP.x -= aiSpeed;

        // Collision with Player Paddle
        if (
          ball.y + ball.radius >= playerP.y - playerP.h / 2 &&
          ball.y - ball.radius <= playerP.y + playerP.h / 2 &&
          ball.x >= playerP.x - playerP.w / 2 &&
          ball.x <= playerP.x + playerP.w / 2 &&
          ball.vy > 0
        ) {
          soundManager.playDiceRoll();
          ball.vy = -Math.abs(ball.vy) * 1.05;
          ball.vx = (ball.x - playerP.x) * 0.15;
          setCommentary('🏓 Great return shot!');
        }

        // Collision with AI Paddle
        if (
          ball.y - ball.radius <= aiP.y + aiP.h / 2 &&
          ball.y + ball.radius >= aiP.y - aiP.h / 2 &&
          ball.x >= aiP.x - aiP.w / 2 &&
          ball.x <= aiP.x + aiP.w / 2 &&
          ball.vy < 0
        ) {
          soundManager.playDiceRoll();
          ball.vy = Math.abs(ball.vy) * 1.05;
          ball.vx = (ball.x - aiP.x) * 0.15;
          setCommentary('🤖 AI returned with a cross-court drive!');
        }

        // Out of Bounds / Scoring
        if (ball.y < 0) {
          // Player scored!
          soundManager.playHomeEntry();
          setPlayerScore((s) => {
            const next = s + 1;
            if (next >= 11) {
              soundManager.playVictory();
              setWinner('You Win!');
              setCommentary('🏆 CONGRATULATIONS! YOU WON THE TABLE TENNIS MATCH!');
            } else {
              setCommentary(`🎉 Point for You! (+1) Score: You ${next} - AI ${aiScore}`);
              resetRally('ai');
            }
            return next;
          });
        } else if (ball.y > COURT_H) {
          // AI scored!
          soundManager.playCapture();
          setAiScore((s) => {
            const next = s + 1;
            if (next >= 11) {
              setWinner('AI Bot Wins!');
              setCommentary('🤖 AI BOT WON THE TABLE TENNIS MATCH!');
            } else {
              setCommentary(`💥 Point for AI! Score: You ${playerScore} - AI ${next}`);
              resetRally('player');
            }
            return next;
          });
        }
      }

      // 3. Render AI Paddle
      const aiP = aiPaddleRef.current;
      ctx.fillStyle = '#ef4444'; // Red paddle rubber
      ctx.fillRect(aiP.x - aiP.w / 2, aiP.y - aiP.h / 2, aiP.w, aiP.h);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.strokeRect(aiP.x - aiP.w / 2, aiP.y - aiP.h / 2, aiP.w, aiP.h);

      // 4. Render Player Paddle
      const playerP = playerPaddleRef.current;
      ctx.fillStyle = '#3b82f6'; // Blue paddle rubber
      ctx.fillRect(playerP.x - playerP.w / 2, playerP.y - playerP.h / 2, playerP.w, playerP.h);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.strokeRect(playerP.x - playerP.w / 2, playerP.y - playerP.h / 2, playerP.w, playerP.h);

      // 5. Render Ping Pong Ball
      const ball = ballRef.current;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15'; // Yellow 3-star ping pong ball
      ctx.fill();
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isRallying, resetRally, playerScore, aiScore]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <span className="text-2xl">🏓</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{t('game_tt', language)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-bold">
                PRO SPINS AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Realtime Paddle Tracking • Topspin & Slices • 11-Point Tournament Set
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetGame}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Match</span>
          </button>
        </div>
      </div>

      {/* Main Game Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Court Canvas */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-3">
          <div className="relative w-full max-w-[500px] aspect-[5/3.4] bg-slate-950 p-2 rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={COURT_W}
              height={COURT_H}
              className="w-full h-full rounded-xl cursor-crosshair"
            />
          </div>

          {/* Paddle & Serve Controller */}
          {!winner && (
            <div className="w-full max-w-[500px] bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
              <div>
                <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                  <span>Paddle Position</span>
                  <span className="text-blue-400 font-mono">
                    {Math.round(playerPaddleRef.current.x)}px
                  </span>
                </label>
                <input
                  type="range"
                  min="50"
                  max={COURT_W - 50}
                  defaultValue={COURT_W / 2}
                  onChange={(e) => {
                    playerPaddleRef.current.x = Number(e.target.value);
                  }}
                  className="w-full accent-blue-500 cursor-pointer mt-1"
                />
              </div>

              {/* Shot Spin Selector */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { id: 'drive' as const, label: '🏓 Drive' },
                  { id: 'topspin' as const, label: '🌀 Topspin' },
                  { id: 'slice' as const, label: '✂️ Slice' },
                  { id: 'smash' as const, label: '💥 Smash' },
                ].map((shot) => (
                  <button
                    key={shot.id}
                    onClick={() => setShotType(shot.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      shotType === shot.id
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {shot.label}
                  </button>
                ))}
              </div>

              {!isRallying && server === 'player' && (
                <button
                  onClick={servePlayer}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
                >
                  🏓 SERVE BALL!
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Scoreboard & Commentary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              11-Point Match Score
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/30 space-y-1">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">You</span>
                <p className="text-2xl font-black text-white font-mono">{playerScore} pts</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30 space-y-1">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">AI Bot</span>
                <p className="text-2xl font-black text-white font-mono">{aiScore} pts</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <BotCommentaryOverlay
              commentary={commentary}
              botName="TT AI Referee"
              botColor="blue"
              isMuted={isMuted}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
