import React from 'react';
import { Camera, ShieldCheck, Sparkles, X, CheckCircle2, Lock } from 'lucide-react';
import { LanguageCode } from '../logic/i18n';

interface CameraPermissionModalProps {
  isOpen: boolean;
  onGrant: () => void;
  onClose: () => void;
  language?: LanguageCode;
}

export const CameraPermissionModal: React.FC<CameraPermissionModalProps> = ({
  isOpen,
  onGrant,
  onClose,
  language = 'en',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Enable Camera Gestures</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/40 uppercase">
                  AI Motion
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Control the game hands-free using real-time motion gestures
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

        {/* Content Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[75vh]">
          {/* Gesture Explanation Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Supported Hand Gestures</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl flex-shrink-0">
                  ✋
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Open Palm / Wave</h4>
                  <p className="text-[10px] text-slate-400">Roll the dice automatically</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl flex-shrink-0">
                  ☝️
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">1 Finger</h4>
                  <p className="text-[10px] text-slate-400">Select & move Token 1</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl flex-shrink-0">
                  ✌️
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">2 Fingers</h4>
                  <p className="text-[10px] text-slate-400">Select & move Token 2</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl flex-shrink-0">
                  🤟
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">3-4 Fingers</h4>
                  <p className="text-[10px] text-slate-400">Select Tokens 3 & 4</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Security Guarantee Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Private & On-Device Processing</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed">
              Your camera stream is processed strictly in your browser memory via local HTML5 Canvas differential analysis. Video data is <strong>never recorded</strong>, stored, or sent to any server.
            </p>
          </div>

          {/* Permission Prompt Expectation */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-blue-400 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-200">Browser Permission Request</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Clicking "Grant Permission" will trigger your browser's native camera popup asking for access. You can disable camera tracking at any time using the top navbar switch.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs transition cursor-pointer"
          >
            Cancel / Keep Disabled
          </button>

          <button
            onClick={onGrant}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Grant Permission & Enable</span>
          </button>
        </div>
      </div>
    </div>
  );
};
