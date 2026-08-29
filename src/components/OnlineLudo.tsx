import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, LogIn, Copy, Check, RefreshCw, Trophy, Globe, Share2, MessageCircle, Sparkles } from 'lucide-react';
import { UserProfile, PlayerColor } from '../types/ludo';
import { SocialInviteModal } from './SocialInviteModal';

interface OnlineLudoProps {
  userProfile: UserProfile;
  onStartOnlineMatch: (roomCode: string, assignedColor: PlayerColor) => void;
  onBack: () => void;
  initialRoomCode?: string;
}

export const OnlineLudo: React.FC<OnlineLudoProps> = ({
  userProfile,
  onStartOnlineMatch,
  onBack,
  initialRoomCode = '',
}) => {
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode);
  const [currentRoom, setCurrentRoom] = useState<any | null>(null);
  const [assignedColor, setAssignedColor] = useState<PlayerColor>('red');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCodeInput(initialRoomCode);
    }
  }, [initialRoomCode]);

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: userProfile.name,
          hostColor: 'red',
          hostElo: userProfile.elo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentRoom(data.room);
        setAssignedColor('red');
      } else {
        setError('Failed to create online room.');
      }
    } catch (e) {
      setError('Connection error while creating room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCodeInput.trim(),
          playerName: userProfile.name,
          playerElo: userProfile.elo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentRoom(data.room);
        setAssignedColor(data.assignedColor);
      } else {
        setError(data.error || 'Unable to join room.');
      }
    } catch (e) {
      setError('Connection error while joining room.');
    } finally {
      setIsLoading(false);
    }
  };

  // Poll room updates every 2 seconds
  useEffect(() => {
    if (!currentRoom) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${currentRoom.code}`);
        const data = await res.json();
        if (data.room) {
          setCurrentRoom(data.room);
        }
      } catch (e) {
        // Silent catch for background polling
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentRoom]);

  const copyRoomCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-black text-white">Online Ranked Arena</h2>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white transition"
        >
          ← Back to Menu
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Lobby Choice Screen */}
      {!currentRoom ? (
        <div className="flex flex-col gap-5">
          <button
            onClick={handleCreateRoom}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-extrabold text-white shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-3 transition cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Ranked Room</span>
          </button>

          {/* Social Friend Invites Quick Button */}
          <button
            onClick={() => setShowSocialModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-950/60 via-purple-950/60 to-blue-950/60 border border-pink-500/40 hover:border-pink-500/80 font-bold text-slate-100 flex items-center justify-between transition cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-blue-600 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Invite FB & IG Friends</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono">
                    HOT
                  </span>
                </p>
                <p className="text-[10px] text-slate-400">Direct message, stories or shareable room link</p>
              </div>
            </div>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-pink-300 transition" />
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-wider my-0.5">
            <div className="flex-1 h-px bg-slate-800" />
            <span>OR JOIN EXISTING</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Enter 6-digit Room Code"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-center text-lg font-bold tracking-widest focus:outline-none focus:border-cyan-500 uppercase"
            />
            <button
              onClick={handleJoinRoom}
              disabled={isLoading || !roomCodeInput.trim()}
              className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>Join Room</span>
            </button>
          </div>
        </div>
      ) : (
        /* Inside Room Lobby */
        <div className="flex flex-col gap-6">
          {/* Room Header Code Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ROOM CODE
              </span>
              <p className="text-2xl font-black text-cyan-400 tracking-widest">
                {currentRoom.code}
              </p>
            </div>
            <button
              onClick={copyRoomCode}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Social Share Callout in Lobby */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-blue-950/40 border border-pink-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-5 h-5 text-pink-400" />
              <div>
                <p className="text-xs font-bold text-white">Invite Social Friends</p>
                <p className="text-[10px] text-pink-300">Share match on IG Story or FB Messenger</p>
              </div>
            </div>
            <button
              onClick={() => setShowSocialModal(true)}
              className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
            >
              Invite
            </button>
          </div>

          {/* Connected Players List */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Connected Players ({currentRoom.players.length}/4)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {['red', 'green', 'yellow', 'blue'].map((colorStr) => {
                const color = colorStr as PlayerColor;
                const player = currentRoom.players.find((p: any) => p.color === color);

                const colorBgMap: Record<PlayerColor, string> = {
                  red: 'border-red-500/40 bg-red-950/20 text-red-400',
                  green: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
                  yellow: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
                  blue: 'border-blue-500/40 bg-blue-950/20 text-blue-400',
                };

                return (
                  <div
                    key={color}
                    className={`p-3 rounded-2xl border ${colorBgMap[color]} flex flex-col justify-between h-20 relative`}
                  >
                    <span className="text-[10px] font-black uppercase">{color}</span>
                    {player ? (
                      <div>
                        <p className="text-xs font-bold text-white truncate">{player.name}</p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ⭐ {player.elo} ELO
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Waiting for player...</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onStartOnlineMatch(currentRoom.code, assignedColor)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-extrabold text-white shadow-lg shadow-emerald-500/30 transition cursor-pointer"
          >
            Launch Ranked Match
          </button>
        </div>
      )}

      {/* Render Social Invite Modal */}
      {showSocialModal && (
        <SocialInviteModal
          roomCode={currentRoom?.code || roomCodeInput || 'LUDO88'}
          userProfile={userProfile}
          onClose={() => setShowSocialModal(false)}
        />
      )}
    </div>
  );
};
