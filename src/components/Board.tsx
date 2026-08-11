import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bot, HelpCircle, Sparkles } from 'lucide-react';
import {
  PlayerColor,
  TokenState,
  GameState,
  Player,
  GestureType,
  UserProfile,
} from '../types/ludo';
import {
  getTokenBoardCoordinate,
  SAFE_CIRCUIT_INDICES,
  MAIN_CIRCUIT_PATH,
  HOME_RUNWAY_PATHS,
} from '../logic/ludoBoard';
import { ActiveReaction } from './ReactionBubble';
import {
  ColorblindSvgDefs,
  ColorblindPatternOverlay,
  COLORBIND_SYMBOLS,
} from './ColorblindPatterns';
import { TurnTimer } from './TurnTimer';
import { Dice } from './Dice';
import { GestureControl } from './GestureControl';
import { ReactionsWidget } from './ReactionsWidget';
import { PlayerProfileModal } from './PlayerProfileModal';
import { GestureCheatSheetModal } from './GestureCheatSheetModal';

interface BoardProps {
  gameState: GameState;
  userProfile?: UserProfile;
  onTokenClick: (tokenId: number) => void;
  onRollDice?: () => void;
  selectedTokenId?: number | null;
  interactiveColor?: PlayerColor;
  activeReactions?: ActiveReaction[];
  isColorblindMode?: boolean;

  // Embedded In-Board Controls
  turnSecondsLeft?: number;
  maxTurnSeconds?: number;
  currentTurnPlayerName?: string;
  isCurrentTurnHuman?: boolean;
  isGestureEnabled?: boolean;
  onToggleGesture?: (enabled: boolean) => void;
  onGestureAction?: (gesture: GestureType) => void;
  onSendReaction?: (content: string, type: 'emoji' | 'message') => void;
}

export const Board: React.FC<BoardProps> = ({
  gameState,
  userProfile,
  onTokenClick,
  onRollDice,
  selectedTokenId,
  interactiveColor,
  activeReactions = [],
  isColorblindMode = false,
  turnSecondsLeft,
  maxTurnSeconds = 15,
  currentTurnPlayerName,
  isCurrentTurnHuman = true,
  isGestureEnabled = false,
  onToggleGesture,
  onGestureAction,
  onSendReaction,
}) => {
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);
  const isCurrentTurn = interactiveColor === gameState.currentTurnColor;
  const currentTurnPlayer = gameState.players.find((p) => p.color === gameState.currentTurnColor);

  // Group all active tokens by board coordinate to offset stacked tokens
  const tokenMap: Record<string, { token: TokenState; player: Player }[]> = {};

  gameState.players.forEach((player) => {
    player.tokens.forEach((token) => {
      const [r, c] = getTokenBoardCoordinate(player.color, token.step, token.id);
      const key = `${r.toFixed(1)}_${c.toFixed(1)}`;
      if (!tokenMap[key]) tokenMap[key] = [];
      tokenMap[key].push({ token, player });
    });
  });

  const getCellColor = (r: number, c: number): string => {
    // Red Base (0..5, 0..5)
    if (r <= 5 && c <= 5) return 'bg-rose-500/20 border-rose-500/40';
    // Green Base (0..5, 9..14)
    if (r <= 5 && c >= 9) return 'bg-emerald-500/20 border-emerald-500/40';
    // Yellow Base (9..14, 9..14)
    if (r >= 9 && c >= 9) return 'bg-amber-500/20 border-amber-500/40';
    // Blue Base (9..14, 0..5)
    if (r >= 9 && c <= 5) return 'bg-blue-500/20 border-blue-500/40';

    // Red Runway (Row 7, Col 1..5)
    if (r === 7 && c >= 1 && c <= 5) return 'bg-rose-500 border-rose-600';
    // Green Runway (Row 1..5, Col 7)
    if (c === 7 && r >= 1 && r <= 5) return 'bg-emerald-500 border-emerald-600';
    // Yellow Runway (Row 7, Col 9..13)
    if (r === 7 && c >= 9 && c <= 13) return 'bg-amber-500 border-amber-600';
    // Blue Runway (Row 9..13, Col 7)
    if (c === 7 && r >= 9 && r <= 13) return 'bg-blue-500 border-blue-600';

    // Start Cells
    if (r === 6 && c === 1) return 'bg-rose-500 border-rose-600';
    if (r === 1 && c === 8) return 'bg-emerald-500 border-emerald-600';
    if (r === 8 && c === 13) return 'bg-amber-500 border-amber-600';
    if (r === 13 && c === 6) return 'bg-blue-500 border-blue-600';

    return 'bg-slate-900 border-slate-700/80';
  };

  const isStarCell = (r: number, c: number): boolean => {
    return (
      (r === 2 && c === 6) ||
      (r === 6 && c === 12) ||
      (r === 12 && c === 8) ||
      (r === 8 && c === 2)
    );
  };

  const getBoardCellColorblindColor = (r: number, c: number): PlayerColor | null => {
    if (r <= 5 && c <= 5) return 'red';
    if (r <= 5 && c >= 9) return 'green';
    if (r >= 9 && c >= 9) return 'yellow';
    if (r >= 9 && c <= 5) return 'blue';

    if (r === 7 && c >= 1 && c <= 5) return 'red';
    if (c === 7 && r >= 1 && r <= 5) return 'green';
    if (r === 7 && c >= 9 && c <= 13) return 'yellow';
    if (c === 7 && r >= 9 && r <= 13) return 'blue';

    if (r === 6 && c === 1) return 'red';
    if (r === 1 && c === 8) return 'green';
    if (r === 8 && c === 13) return 'yellow';
    if (r === 13 && c === 6) return 'blue';

    return null;
  };

  return (
    <div className="relative w-full max-w-[920px] bg-slate-900 p-3 sm:p-5 shadow-2xl rounded-3xl border-4 sm:border-8 border-slate-800 select-none flex flex-col gap-3.5 sm:gap-4">
      {/* Top In-Board Header: Move Timer & Turn Dice */}
      {(turnSecondsLeft !== undefined || onRollDice) && (
        <div className="w-full bg-slate-950/90 border border-slate-800 p-3 rounded-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shadow-inner">
          {/* Move Timer */}
          <div className="flex-1 min-w-[200px]">
            {turnSecondsLeft !== undefined && (
              <TurnTimer
                secondsLeft={turnSecondsLeft}
                maxSeconds={maxTurnSeconds}
                turnColor={gameState.currentTurnColor}
                hasRolled={gameState.hasRolled}
                playerName={currentTurnPlayerName || currentTurnPlayer?.name}
                isHuman={isCurrentTurnHuman}
              />
            )}
          </div>

          {/* Turn Dice */}
          {onRollDice && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Turn Dice</span>
                <span className="text-xs font-black text-amber-400">
                  {gameState.hasRolled ? `Rolled: ${gameState.diceValue}` : 'Click / Gesture to Roll'}
                </span>
              </div>
              <Dice
                value={gameState.diceValue}
                onRoll={onRollDice}
                disabled={
                  gameState.hasRolled ||
                  currentTurnPlayer?.type !== 'human' ||
                  gameState.status === 'finished'
                }
                currentColor={gameState.currentTurnColor}
                hasRolled={gameState.hasRolled}
              />
            </div>
          )}

          {/* Gesture Cheat Sheet Overlay Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCheatSheet(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            title="Open Dynamic Gesture Cheat Sheet"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Gesture Cheat Sheet</span>
          </button>
        </div>
      )}

      {/* Main 15x15 Ludo Board Grid Canvas */}
      <div
        onClick={() => {
          if (!gameState.hasRolled && isCurrentTurn && onRollDice) {
            onRollDice();
          }
        }}
        className={`relative w-full aspect-square bg-slate-800 p-2 sm:p-3 shadow-2xl rounded-2xl border-2 sm:border-4 border-slate-700 overflow-hidden flex flex-col justify-center items-center ${
          !gameState.hasRolled && isCurrentTurn ? 'cursor-pointer' : ''
        }`}
      >
      {/* SVG Defs for Colorblind Pattern Fills */}
      <ColorblindSvgDefs />

      {/* 15x15 Ludo Grid */}
      <div className="grid grid-cols-15 grid-rows-15 w-full h-full gap-0.5 rounded-xl bg-slate-900 overflow-hidden relative border border-slate-700/80">
        {/* Render 15x15 Cells */}
        {Array.from({ length: 15 }).map((_, row) =>
          Array.from({ length: 15 }).map((_, col) => {
            const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;
            if (isCenter && !(row === 6 && col === 6)) {
              // Handled by central triangle overlay
              return null;
            }

            if (row === 6 && col === 6) {
              return (
                <div
                  key="center_triangle"
                  className="col-span-3 row-span-3 relative w-full h-full bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden"
                >
                  {/* Triangles pointing to center */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <polygon points="0,0 50,50 0,100" fill="#ef4444" opacity="0.9" />
                    <polygon points="0,0 50,50 100,0" fill="#10b981" opacity="0.9" />
                    <polygon points="100,0 50,50 100,100" fill="#f59e0b" opacity="0.9" />
                    <polygon points="0,100 50,50 100,100" fill="#3b82f6" opacity="0.9" />

                    {/* Colorblind Pattern Overlay for Triangles */}
                    {isColorblindMode && (
                      <>
                        <polygon points="0,0 50,50 0,100" fill="url(#cb-pattern-red)" opacity="0.8" />
                        <polygon points="0,0 50,50 100,0" fill="url(#cb-pattern-green)" opacity="0.8" />
                        <polygon points="100,0 50,50 100,100" fill="url(#cb-pattern-yellow)" opacity="0.8" />
                        <polygon points="0,100 50,50 100,100" fill="url(#cb-pattern-blue)" opacity="0.8" />
                      </>
                    )}
                  </svg>
                  <div className="absolute inset-2 sm:inset-3 rounded-full bg-slate-950/80 border-2 border-yellow-400/60 flex items-center justify-center text-xs sm:text-base font-black text-amber-300 tracking-wider shadow-inner">
                    HOME
                  </div>
                </div>
              );
            }

            const isStar = isStarCell(row, col);
            const isRedStart = row === 6 && col === 1;
            const isGreenStart = row === 1 && col === 8;
            const isYellowStart = row === 8 && col === 13;
            const isBlueStart = row === 13 && col === 6;
            const cbColor = isColorblindMode ? getBoardCellColorblindColor(row, col) : null;

            return (
              <div
                key={`${row}_${col}`}
                className={`relative w-full h-full border ${getCellColor(
                  row,
                  col
                )} flex items-center justify-center transition-colors duration-200 overflow-hidden`}
              >
                {/* Colorblind Pattern Overlay on Paths & Yards */}
                {cbColor && <ColorblindPatternOverlay color={cbColor} opacity={0.5} />}

                {isStar && (
                  <span className="text-amber-300 text-sm sm:text-xl font-black animate-pulse drop-shadow z-10">
                    ★
                  </span>
                )}
                {isRedStart && <span className="text-white text-xs sm:text-base font-black z-10">➔</span>}
                {isGreenStart && <span className="text-white text-xs sm:text-base font-black z-10">⬇</span>}
                {isYellowStart && <span className="text-white text-xs sm:text-base font-black z-10">⬅</span>}
                {isBlueStart && <span className="text-white text-xs sm:text-base font-black z-10">⬆</span>}

                {/* Corner Bases White Circle Frames */}
                {row <= 5 && col <= 5 && (row === 1 || row === 3) && (col === 1 || col === 3) && (
                  <div className="w-full h-full rounded-full bg-red-900/30 border-2 border-red-400/50 z-10 flex items-center justify-center text-[10px] sm:text-xs text-white/60 font-black">
                    {isColorblindMode && COLORBIND_SYMBOLS.red}
                  </div>
                )}
                {row <= 5 && col >= 9 && (row === 1 || row === 3) && (col === 10 || col === 12) && (
                  <div className="w-full h-full rounded-full bg-emerald-900/30 border-2 border-emerald-400/50 z-10 flex items-center justify-center text-[10px] sm:text-xs text-white/60 font-black">
                    {isColorblindMode && COLORBIND_SYMBOLS.green}
                  </div>
                )}
                {row >= 9 && col >= 9 && (row === 10 || row === 12) && (col === 10 || col === 12) && (
                  <div className="w-full h-full rounded-full bg-amber-900/30 border-2 border-amber-400/50 z-10 flex items-center justify-center text-[10px] sm:text-xs text-slate-900/60 font-black">
                    {isColorblindMode && COLORBIND_SYMBOLS.yellow}
                  </div>
                )}
                {row >= 9 && col <= 5 && (row === 10 || row === 12) && (col === 1 || col === 3) && (
                  <div className="w-full h-full rounded-full bg-blue-900/30 border-2 border-blue-400/50 z-10 flex items-center justify-center text-[10px] sm:text-xs text-white/60 font-black">
                    {isColorblindMode && COLORBIND_SYMBOLS.blue}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Tokens Overlay Layer */}
        {Object.entries(tokenMap).map(([coordKey, tokenGroup]) => {
          const [rStr, cStr] = coordKey.split('_');
          const r = parseFloat(rStr);
          const c = parseFloat(cStr);

          return (
            <div
              key={coordKey}
              style={{
                top: `${(r / 15) * 100}%`,
                left: `${(c / 15) * 100}%`,
                width: `${(1 / 15) * 100}%`,
                height: `${(1 / 15) * 100}%`,
              }}
              className="absolute pointer-events-none flex items-center justify-center z-20"
            >
              {tokenGroup.map(({ token, player }, index) => {
                const isMovable =
                  isCurrentTurn &&
                  gameState.hasRolled &&
                  player.color === gameState.currentTurnColor &&
                  gameState.validMoves.some((m) => m.tokenId === token.id);

                const isSelected =
                  player.color === interactiveColor && selectedTokenId === token.id;

                // Stacking offset if multiple tokens land on same cell
                const count = tokenGroup.length;
                const offsetX = count > 1 ? (index - (count - 1) / 2) * 6 : 0;
                const offsetY = count > 1 ? (index - (count - 1) / 2) * 6 : 0;

                const tokenBg =
                  token.color === 'red'
                    ? 'bg-rose-500 shadow-rose-500/50'
                    : token.color === 'green'
                    ? 'bg-emerald-500 shadow-emerald-500/50'
                    : token.color === 'yellow'
                    ? 'bg-amber-500 shadow-amber-500/50'
                    : 'bg-blue-500 shadow-blue-500/50';

                return (
                  <motion.div
                    key={`${token.color}_${token.id}`}
                    layout
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{
                      scale: isSelected ? 1.25 : 1,
                      x: offsetX,
                      y: offsetY,
                      opacity: 1,
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isMovable) {
                        onTokenClick(token.id);
                      } else if (!gameState.hasRolled && isCurrentTurn && onRollDice) {
                        onRollDice();
                      }
                    }}
                    className={`pointer-events-auto cursor-pointer relative w-4/5 h-4/5 rounded-full border-2 border-white shadow-md flex items-center justify-center font-extrabold text-[10px] text-white overflow-hidden ${tokenBg} ${
                      isMovable
                        ? 'ring-4 ring-yellow-300 ring-offset-1 ring-offset-slate-950 animate-bounce z-30'
                        : ''
                    } ${isSelected ? 'ring-4 ring-cyan-400 z-40' : ''}`}
                  >
                    {/* Pattern Texture Overlay on Token */}
                    {isColorblindMode && (
                      <ColorblindPatternOverlay color={token.color} opacity={0.85} />
                    )}

                    {/* Inner Token Core Ring with Number & Symbol */}
                    <div className="w-2/3 h-2/3 rounded-full border border-white/80 bg-slate-950/60 flex items-center justify-center relative z-10 backdrop-blur-[1px]">
                      <span className="text-[9px] font-black text-white drop-shadow-md flex items-center gap-0.5">
                        {isColorblindMode && (
                          <span className="text-[8px] opacity-90">{COLORBIND_SYMBOLS[token.color]}</span>
                        )}
                        <span>{token.id + 1}</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Corner Active Player Name Tags */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
          const player = gameState.players.find((p) => p.color === color);
          if (!player) return null;

          const isCurrentTurn = gameState.currentTurnColor === color;

          const cornerPositionMap: Record<PlayerColor, string> = {
            red: 'top-2.5 left-2.5',
            green: 'top-2.5 right-2.5',
            yellow: 'bottom-2.5 right-2.5',
            blue: 'bottom-2.5 left-2.5',
          };

          const colorThemeMap: Record<
            PlayerColor,
            { bg: string; text: string; border: string; dotBg: string; activeGlow: string }
          > = {
            red: {
              bg: 'bg-slate-950/90',
              text: 'text-rose-300',
              border: 'border-rose-500/60',
              dotBg: 'bg-rose-500',
              activeGlow: 'ring-2 ring-rose-400 shadow-rose-500/50',
            },
            green: {
              bg: 'bg-slate-950/90',
              text: 'text-emerald-300',
              border: 'border-emerald-500/60',
              dotBg: 'bg-emerald-500',
              activeGlow: 'ring-2 ring-emerald-400 shadow-emerald-500/50',
            },
            yellow: {
              bg: 'bg-slate-950/90',
              text: 'text-amber-300',
              border: 'border-amber-500/60',
              dotBg: 'bg-amber-400',
              activeGlow: 'ring-2 ring-amber-400 shadow-amber-500/50',
            },
            blue: {
              bg: 'bg-slate-950/90',
              text: 'text-blue-300',
              border: 'border-blue-500/60',
              dotBg: 'bg-blue-500',
              activeGlow: 'ring-2 ring-blue-400 shadow-blue-500/50',
            },
          };

          const theme = colorThemeMap[color];

          return (
            <div
              key={color}
              onClick={(e) => {
                e.stopPropagation();
                setInspectedPlayer(player);
              }}
              title={`Click to view ${player.name}'s Profile`}
              className={`absolute ${cornerPositionMap[color]} flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl ${
                theme.bg
              } border ${theme.border} backdrop-blur-md shadow-lg transition-all cursor-pointer hover:scale-105 pointer-events-auto ${
                isCurrentTurn ? `${theme.activeGlow} scale-105 z-40` : 'opacity-90 z-30'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${theme.dotBg} ${
                    isCurrentTurn ? 'animate-ping opacity-80' : ''
                  }`}
                />
                <div className={`w-2 h-2 rounded-full ${theme.dotBg} absolute`} />
              </div>

              {player.type === 'bot' ? (
                <Bot className={`w-3.5 h-3.5 ${theme.text}`} />
              ) : (
                <User className={`w-3.5 h-3.5 ${theme.text}`} />
              )}

              <span
                className={`text-[9px] sm:text-xs font-black truncate max-w-[60px] sm:max-w-[90px] ${theme.text}`}
              >
                {player.name}
              </span>

              {isCurrentTurn && !gameState.hasRolled && onRollDice && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRollDice();
                  }}
                  className="text-[9px] font-black text-amber-300 animate-pulse bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40 flex items-center gap-0.5 ml-0.5 hover:bg-amber-500/40 cursor-pointer"
                >
                  <span>ROLL</span> 🎲
                </button>
              )}

              <span className="text-[9px] font-bold text-slate-400 bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700 ml-0.5 hover:text-white hidden sm:inline-block">
                Profile 👤
              </span>

              {isColorblindMode && (
                <span className="text-[9px] font-mono font-black opacity-80 pl-0.5">
                  {COLORBIND_SYMBOLS[color]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Reaction Bubbles Overlay over Corner Bases */}
      <div className="absolute inset-0 pointer-events-none z-50">
        {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
          const reaction = activeReactions.find((r) => r.playerColor === color);
          if (!reaction) return null;

          const cornerPositionMap: Record<PlayerColor, string> = {
            red: 'top-8 left-8',
            green: 'top-8 right-8',
            yellow: 'bottom-8 right-8',
            blue: 'bottom-8 left-8',
          };

          const colorBgMap: Record<PlayerColor, string> = {
            red: 'bg-rose-600 text-white border-rose-400',
            green: 'bg-emerald-600 text-white border-emerald-400',
            yellow: 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold',
            blue: 'bg-blue-600 text-white border-blue-400',
          };

          return (
            <AnimatePresence key={reaction.id}>
              <motion.div
                initial={{ scale: 0.2, opacity: 0, y: 15 }}
                animate={{ scale: 1.1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className={`absolute ${cornerPositionMap[color]} transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center px-3 py-1.5 rounded-2xl border-2 shadow-2xl ${
                  colorBgMap[color]
                }`}
              >
                {reaction.type === 'emoji' ? (
                  <span className="text-2xl animate-bounce drop-shadow">{reaction.content}</span>
                ) : (
                  <span className="text-xs font-black tracking-wide font-sans">{reaction.content}</span>
                )}
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>
    </div>

      {/* Bottom In-Board Footer: Enable Camera Gestures & Expressive Chat Reactions */}
      {(onGestureAction || onSendReaction) && (
        <div className="w-full bg-slate-950/90 border border-slate-800 p-3 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3.5 shadow-inner">
          {/* Interactive Gesture Control / Motion Camera */}
          {onGestureAction && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                📷 Interactive Gesture Control
              </span>
              <GestureControl
                onGestureAction={onGestureAction}
                isEnabled={isGestureEnabled}
                onToggle={onToggleGesture || (() => {})}
              />
            </div>
          )}

          {/* Expressive Chat & Reactions */}
          {onSendReaction && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                💬 Expressive Chat & Reactions
              </span>
              <ReactionsWidget
                onSendReaction={onSendReaction}
                userColor={gameState.currentTurnColor}
                disabled={gameState.status === 'finished'}
              />
            </div>
          )}
        </div>
      )}

      {/* Player Profile Modal when a player is clicked on the board */}
      <AnimatePresence>
        {inspectedPlayer && (
          <PlayerProfileModal
            player={inspectedPlayer}
            userProfile={userProfile}
            onClose={() => setInspectedPlayer(null)}
          />
        )}
      </AnimatePresence>

      {/* Dynamic Gesture Cheat Sheet Overlay Modal */}
      <GestureCheatSheetModal
        isOpen={showCheatSheet}
        onClose={() => setShowCheatSheet(false)}
        gameState={gameState}
        isGestureEnabled={isGestureEnabled}
        onToggleGesture={onToggleGesture}
      />
    </div>
  );
};
