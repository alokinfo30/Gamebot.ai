import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ShieldCheck, Sparkles, Hand, X, Check, Zap, AlertCircle } from 'lucide-react';

interface CameraOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable: () => void;
}

export const CameraOnboardingModal: React.FC<CameraOnboardingModalProps> = ({
  isOpen,
  onClose,
  onEnable,
}) => {
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestCamera = async () => {
    setIsRequesting(true);
    setPermissionError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
        });
        // Release immediate test stream
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsRequesting(false);
      onEnable();
      onClose();
    } catch (err: any) {
      setIsRequesting(false);
      setPermissionError(
        'Camera permission was blocked by the browser. Please click the camera icon in your browser address bar to allow camera access.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>AI Camera Gestures</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Touchless Motion
                </span>
              </h2>
              <p className="text-xs text-slate-400">Play games using real-time hand gestures</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gesture Controls Explanation Grid */}
        <div className="py-5 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Control dice rolls, token selection, and game turns without touching your screen or keyboard! Our client-side computer vision tracks simple hand gestures live.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 text-lg">✋</div>
              <div>
                <div className="text-xs font-extrabold text-white">Open Palm</div>
                <div className="text-[11px] text-slate-400 font-medium">Roll Dice / Main Action</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-lg">☝️</div>
              <div>
                <div className="text-xs font-extrabold text-white">Pointing Finger</div>
                <div className="text-[11px] text-slate-400 font-medium">Select Token / Item</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-lg">✌️</div>
              <div>
                <div className="text-xs font-extrabold text-white">Victory V</div>
                <div className="text-[11px] text-slate-400 font-medium">Pass Turn / Secondary</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 text-lg">👍</div>
              <div>
                <div className="text-xs font-extrabold text-white">Thumbs Up</div>
                <div className="text-[11px] text-slate-400 font-medium">Confirm / AI Strategy</div>
              </div>
            </div>
          </div>

          {/* Privacy & Permissions Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-[11px] text-slate-300">
              <span className="font-bold text-white block">100% On-Device Privacy Guaranteed</span>
              Video feed is processed entirely inside your browser memory. No images or video are stored or transmitted.
            </div>
          </div>

          {permissionError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{permissionError}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Cancel
          </button>

          <button
            onClick={handleRequestCamera}
            disabled={isRequesting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{isRequesting ? 'Requesting Access...' : 'Allow Camera & Enable Gestures'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
