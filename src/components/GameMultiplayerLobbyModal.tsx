import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Users, PlusCircle, LogIn, Copy, Check, Share2, Sparkles, X, ShieldCheck, Play } from 'lucide-react';
import { UserProfile } from '../types/ludo';
import { createMultiplayerRoom, joinMultiplayerRoom, MultiplayerRoom, GamePlayMode } from '../logic/multiplayerRoomManager';
import { soundManager } from '../logic/soundManager';

interface GameMultiplayerLobbyModalProps {
  isOpen: boolean;
  gameKey: string;
  gameTitle: string;
  userProfile: UserProfile;
  onClose: () => void;
  onStartMatch: (mode: GamePlayMode, roomCode?: string, passAndPlayPlayersCount?: number) => void;
}

export const GameMultiplayerLobbyModal: React.FC<GameMultiplayerLobbyModalProps> = ({
  isOpen,
  gameKey,
  gameTitle,
  userProfile,
  onClose,
  onStartMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'online' | 'pass_and_play'>('online');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [passAndPlayCount, setPassAndPlayCount] = useState<number>(2);

  if (!isOpen) return null;

  const handleCreateOnlineRoom = () => {
    soundManager.playTickSound();
    setIsLoading(true);
    setError(null);
    try {
      const room = createMultiplayerRoom(gameKey, userProfile.name, userProfile.elo, 2);
      setCurrentRoom(room);
    } catch (e) {
      setError('Failed to create online room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinOnlineRoom = () => {
    soundManager.playTickSound();
    if (!roomCodeInput.trim()) return;
    setIsLoading(true);
    setError(null);

    const res = joinMultiplayerRoom(roomCodeInput, userProfile.name, userProfile.elo);
    if (res.success && res.room) {
      setCurrentRoom(res.room);
      onStartMatch('online', res.room.code);
      onClose();
    } else {
      setError(res.error || 'Failed to join room.');
    }
    setIsLoading(false);
  };

  const handleCopyCode = () => {
    if (!currentRoom) return;
    soundManager.playTickSound();
    navigator.clipboard.writeText(currentRoom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!currentRoom) return;
    soundManager.playTickSound();
    const text = `🎮 Join my ${gameTitle} online match on Gamebot.ai! Room Code: *${currentRoom.code}*`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-6 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">{gameTitle} Multiplayer</h3>
                <p className="text-xs text-slate-400 font-medium">Select Online Room or Offline Pass & Play</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => {
                soundManager.playTickSound();
                setActiveTab('online');
              }}
              className={`py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'online'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>🌐 Online Room</span>
            </button>

            <button
              onClick={() => {
                soundManager.playTickSound();
                setActiveTab('pass_and_play');
              }}
              className={`py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'pass_and_play'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>👥 Pass & Play</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 font-bold">
              {error}
            </div>
          )}

          {/* Online Room Content */}
          {activeTab === 'online' && (
            <div className="flex flex-col gap-5">
              {!currentRoom ? (
                <>
                  <button
                    onClick={handleCreateOnlineRoom}
                    disabled={isLoading}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 font-extrabold text-white shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-3 transition cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5 text-cyan-200" />
                    <span>Create Ranked Online Room</span>
                  </button>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-wider my-1">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span>OR JOIN WITH CODE</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="ENTER 6-DIGIT ROOM CODE"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-center text-lg font-black tracking-widest focus:outline-none focus:border-cyan-500 uppercase"
                    />
                    <button
                      onClick={handleJoinOnlineRoom}
                      disabled={isLoading || !roomCodeInput.trim()}
                      className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <LogIn className="w-4 h-4 text-cyan-400" />
                      <span>Join Room</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Inside Created Room Lobby */
                <div className="flex flex-col gap-5">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ROOM CODE</span>
                      <p className="text-2xl font-black text-cyan-400 tracking-widest font-mono">{currentRoom.code}</p>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Share buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleShareWhatsApp}
                      className="py-3 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp Share</span>
                    </button>
                    <button
                      onClick={handleCopyCode}
                      className="py-3 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-blue-400" />
                      <span>Copy Room Link</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playVictory();
                      onStartMatch('online', currentRoom.code);
                      onClose();
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-black text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer text-base"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Match Now</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pass and Play Content */}
          {activeTab === 'pass_and_play' && (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Number of Local Players</span>
                <div className="grid grid-cols-3 gap-3">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        soundManager.playTickSound();
                        setPassAndPlayCount(count);
                      }}
                      className={`py-3 rounded-xl font-black text-sm transition cursor-pointer border ${
                        passAndPlayCount === count
                          ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {count} Players
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  soundManager.playVictory();
                  onStartMatch('pass_and_play', undefined, passAndPlayCount);
                  onClose();
                }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 font-black text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition cursor-pointer text-base"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Launch Pass & Play Match</span>
              </button>
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Cheat Protected • Verified Low-Latency Synchronized Room</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
