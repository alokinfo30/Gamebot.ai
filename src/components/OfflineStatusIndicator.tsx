import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, CheckCircle2, Download, Zap, X, ShieldCheck } from 'lucide-react';
import { swManager, SWState } from '../registerServiceWorker';

export const OfflineStatusIndicator: React.FC = () => {
  const [swState, setSwState] = useState<SWState>(swManager.getState());
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [showOfflineNotice, setShowOfflineNotice] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = swManager.subscribe((state) => {
      setSwState(state);
      if (state.isOffline) {
        setShowOfflineNotice(true);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {/* Offline Status Warning Banner */}
      <AnimatePresence>
        {swState.isOffline && showOfflineNotice && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="pointer-events-auto p-4 rounded-2xl bg-slate-900/95 border border-amber-500/40 text-slate-100 shadow-2xl backdrop-blur-md max-w-sm flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <WifiOff className="w-4 h-4 animate-pulse" />
                </div>
                <span className="text-xs font-black text-white">Offline Mode Active</span>
              </div>
              <button
                onClick={() => setShowOfflineNotice(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              You are currently offline. Thanks to our Service Worker cache, all 15+ games, local AI bots, and audio engines remain <strong className="text-amber-300 font-bold">100% playable</strong>!
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Service Worker Active</span>
              </span>
              <button
                onClick={() => setShowOfflineNotice(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition"
              >
                Continue Offline
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Badge Button in Corner */}
      {swState.isRegistered && (
        <div className="pointer-events-auto">
          <button
            onClick={() => setShowOfflineNotice(!showOfflineNotice)}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md transition cursor-pointer ${
              swState.isOffline
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-900/90 border-emerald-500/40 text-emerald-300 hover:bg-slate-800'
            }`}
            title="Service Worker Offline Cache Status"
          >
            {swState.isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>OFFLINE READY</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>PWA SW ONLINE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
