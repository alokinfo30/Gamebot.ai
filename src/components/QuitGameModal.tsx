import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, LogOut, X, ShieldAlert } from 'lucide-react';
import { LanguageCode } from '../logic/i18n';

interface QuitGameModalProps {
  isOpen: boolean;
  gameTitle: string;
  isOnline: boolean;
  language?: LanguageCode;
  onConfirmQuit: () => void;
  onCancel: () => void;
}

export const QuitGameModal: React.FC<QuitGameModalProps> = ({
  isOpen,
  gameTitle,
  isOnline,
  onConfirmQuit,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl shadow-rose-950/50 space-y-5 relative overflow-hidden"
        >
          {/* Top Rose Ambient Glow */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Quit & Forfeit Match?</h3>
              <p className="text-xs text-rose-300 font-mono font-bold">
                {gameTitle} ({isOnline ? 'Online Ranked Match' : 'Offline VS AI Match'})
              </p>
            </div>
          </div>

          {/* Warning Card */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Forfeit Warning</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Quitting this match will count as an immediate <strong>forfeit loss</strong> (-25 ELO penalty) and clear your saved progress for this session.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer border border-slate-700"
            >
              Continue Playing
            </button>

            <button
              onClick={onConfirmQuit}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center gap-1.5 border border-rose-400/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Yes, Quit & Forfeit</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
