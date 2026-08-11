import React from 'react';
import { X, Sparkles, Hand, Zap, HelpCircle, CheckCircle } from 'lucide-react';
import { GameState, GestureType } from '../types/ludo';

interface GestureCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  isGestureEnabled: boolean;
  onToggleGesture?: (enabled: boolean) => void;
}

export const GestureCheatSheetModal: React.FC<GestureCheatSheetModalProps> = ({
  isOpen,
  onClose,
  gameState,
  isGestureEnabled,
  onToggleGesture,
}) => {
  if (!isOpen) return null;

  const currentTurnPlayer = gameState.players.find((p) => p.color === gameState.currentTurnColor);
  const isHumanTurn = currentTurnPlayer?.type === 'human' && gameState.status === 'playing';

  // Determine active dynamic gesture based on board context
  const isRollActive = isHumanTurn && !gameState.hasRolled;
  
  const validTokenIds = gameState.hasRolled
    ? gameState.validMoves.map((m) => m.tokenId)
    : [];

  const isToken1Active = isHumanTurn && gameState.hasRolled && validTokenIds.includes(0);
  const isToken2Active = isHumanTurn && gameState.hasRolled && validTokenIds.includes(1);
  const isToken3Active = isHumanTurn && gameState.hasRolled && validTokenIds.includes(2);
  const isToken4Active = isHumanTurn && gameState.hasRolled && validTokenIds.includes(3);

  const gestures = [
    {
      id: 'open_hand',
      emoji: '✋',
      name: 'Open Palm / Wave',
      action: 'Roll Dice',
      description: 'Hold up open palm or wave hand to roll the turn dice',
      isActive: isRollActive,
      activeMessage: '🎯 ACTIVE NOW: Wave palm to roll dice!',
    },
    {
      id: 'one_finger',
      emoji: '☝️',
      name: '1 Finger Raised',
      action: 'Select Token 1',
      description: 'Move Token 1 forward on the board',
      isActive: isToken1Active,
      activeMessage: '✨ ACTIVE NOW: Move Token 1!',
    },
    {
      id: 'two_fingers',
      emoji: '✌️',
      name: '2 Fingers Raised',
      action: 'Select Token 2',
      description: 'Move Token 2 forward on the board',
      isActive: isToken2Active,
      activeMessage: '✨ ACTIVE NOW: Move Token 2!',
    },
    {
      id: 'three_fingers',
      emoji: '🤟',
      name: '3 Fingers Raised',
      action: 'Select Token 3',
      description: 'Move Token 3 forward on the board',
      isActive: isToken3Active,
      activeMessage: '✨ ACTIVE NOW: Move Token 3!',
    },
    {
      id: 'four_fingers',
      emoji: '🖖',
      name: '4 Fingers Raised',
      action: 'Select Token 4',
      description: 'Move Token 4 forward on the board',
      isActive: isToken4Active,
      activeMessage: '✨ ACTIVE NOW: Move Token 4!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-md">
              🖐️
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Gesture Cheat Sheet</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40 uppercase tracking-wider">
                  Live Dynamic Context
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Highlighted gestures indicate valid moves for the current board state
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Turn Context Summary Banner */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">Current Turn:</span>
            <span className="font-extrabold uppercase text-white">
              {currentTurnPlayer?.name || gameState.currentTurnColor}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Phase:</span>
            <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              {!isHumanTurn
                ? 'Opponent / AI Turn'
                : !gameState.hasRolled
                ? 'Dice Roll Needed'
                : 'Token Move Choice'}
            </span>
          </div>
        </div>

        {/* Gestures List */}
        <div className="p-5 space-y-3 flex-1 overflow-y-auto">
          {gestures.map((g) => {
            return (
              <div
                key={g.id}
                className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                  g.isActive
                    ? 'bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/20 border-blue-400 shadow-lg shadow-blue-600/20 ring-2 ring-blue-500/50 scale-[1.01]'
                    : 'bg-slate-950 border-slate-800/80 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border shadow-inner ${
                      g.isActive
                        ? 'bg-blue-600 border-white/40 text-white shadow-blue-500/50 animate-bounce'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {g.emoji}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white truncate">{g.name}</h3>
                      {g.isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase font-mono tracking-wider animate-pulse flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>Active Now</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                      Action: <strong className="text-blue-400">{g.action}</strong> — {g.description}
                    </p>

                    {g.isActive && (
                      <p className="text-[11px] font-extrabold text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                        <CheckCircle className="w-3 h-3" />
                        <span>{g.activeMessage}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Camera Status:</span>
            <span
              className={`font-extrabold font-mono px-2 py-0.5 rounded ${
                isGestureEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isGestureEnabled ? 'Tracking Active' : 'Camera Off'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleGesture && (
              <button
                onClick={() => onToggleGesture(!isGestureEnabled)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer border border-slate-700"
              >
                {isGestureEnabled ? 'Disable Camera' : 'Enable Camera'}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
