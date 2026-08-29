import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hand, Sparkles, X, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { GameState } from '../types/ludo';

interface GestureCheatSheetModalProps {
  gameState?: GameState;
  isGestureEnabled: boolean;
  onToggleGesture: () => void;
}

export const GestureCheatSheetModal: React.FC<GestureCheatSheetModalProps> = ({
  gameState,
  isGestureEnabled,
  onToggleGesture,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Determine current active gesture context
  const isRollPhase = gameState ? !gameState.diceRolled : true;
  const isSelectPhase = gameState ? gameState.diceRolled && !gameState.hasValidMoves : false;
  const isMovePhase = gameState ? gameState.diceRolled && gameState.hasValidMoves : false;

  return (
    <>
      {/* Floating Cheat Sheet Button on the Board */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition cursor-pointer hover:border-blue-400 group"
        title="View Camera Gesture Cheat Sheet"
      >
        <Hand className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
        <span>Gesture Cheat Sheet</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Cheat Sheet Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 text-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Hand className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Live Gesture Guide</h3>
                    <p className="text-[11px] text-slate-400">Contextual Hand Gesture Actions</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Context Status Banner */}
              <div className="my-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Current State</span>
                    <span className="font-bold text-white">
                      {isRollPhase
                        ? 'Waiting for Dice Roll'
                        : isMovePhase
                        ? 'Token Selection Required'
                        : 'Passing Turn'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {isGestureEnabled ? 'CAMERA LIVE' : 'CAM OFF'}
                </span>
              </div>

              {/* Gesture Cards */}
              <div className="space-y-2.5 my-3">
                <div
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isRollPhase
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-800/40 border-slate-700/50 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✋</div>
                    <div>
                      <div className="text-xs font-bold text-white">Open Palm</div>
                      <div className="text-[11px] text-slate-300">Rolls the Ludo Dice</div>
                    </div>
                  </div>
                  {isRollPhase && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500 text-white animate-pulse">
                      RECOMMENDED NOW
                    </span>
                  )}
                </div>

                <div
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isMovePhase
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/40 border-slate-700/50 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">☝️</div>
                    <div>
                      <div className="text-xs font-bold text-white">Pointing Finger</div>
                      <div className="text-[11px] text-slate-300">Selects Movable Token</div>
                    </div>
                  </div>
                  {isMovePhase && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500 text-white animate-pulse">
                      RECOMMENDED NOW
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 opacity-70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✌️</div>
                    <div>
                      <div className="text-xs font-bold text-white">Victory V</div>
                      <div className="text-[11px] text-slate-300">Passes Turn / Confirms</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 opacity-70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">👍</div>
                    <div>
                      <div className="text-xs font-bold text-white">Thumbs Up</div>
                      <div className="text-[11px] text-slate-300">Trigger AI Coach Recommendation</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={onToggleGesture}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isGestureEnabled
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  <span>{isGestureEnabled ? 'Disable Camera' : 'Enable Camera'}</span>
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
