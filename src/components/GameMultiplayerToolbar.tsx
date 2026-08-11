import React from 'react';
import { Globe, Users, Bot, Wifi, Share2 } from 'lucide-react';
import { GamePlayMode } from '../logic/multiplayerRoomManager';
import { soundManager } from '../logic/soundManager';

interface GameMultiplayerToolbarProps {
  playMode: GamePlayMode;
  roomCode?: string;
  onOpenLobby: () => void;
}

export const GameMultiplayerToolbar: React.FC<GameMultiplayerToolbarProps> = ({
  playMode,
  roomCode,
  onOpenLobby,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3">
        {playMode === 'vs_ai' && (
          <div className="flex items-center gap-2 text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>MODE: SINGLE PLAYER VS AI</span>
          </div>
        )}

        {playMode === 'pass_and_play' && (
          <div className="flex items-center gap-2 text-xs font-black text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
            <Users className="w-4 h-4 text-purple-400" />
            <span>MODE: OFFLINE PASS & PLAY</span>
          </div>
        )}

        {playMode === 'online' && (
          <div className="flex items-center gap-2 text-xs font-black text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
            <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>ONLINE ROOM: <strong className="font-mono tracking-wider">{roomCode || 'LIVE'}</strong></span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time Synchronized</span>
        </div>
      </div>

      <button
        onClick={() => {
          soundManager.playTickSound();
          onOpenLobby();
        }}
        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Switch Mode / Invite Friends</span>
      </button>
    </div>
  );
};
