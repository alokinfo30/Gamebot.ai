import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, MessageSquare, Zap, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { PlayerColor } from '../types/ludo';
import { soundManager } from '../logic/soundManager';

interface ReactionsWidgetProps {
  onSendReaction: (content: string, type: 'emoji' | 'message') => void;
  userColor?: PlayerColor;
  disabled?: boolean;
}

const EMOJI_LIST = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '🎯', label: 'Bullseye' },
  { emoji: '😱', label: 'Shock' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🏆', label: 'Trophy' },
  { emoji: '💥', label: 'Boom' },
  { emoji: '🎲', label: 'Dice' },
  { emoji: '👑', label: 'Crown' },
  { emoji: '💩', label: 'Poop' },
  { emoji: '⚡', label: 'Zap' },
  { emoji: '💖', label: 'Heart' },
];

const PREDEFINED_MESSAGES = [
  "Good luck! 🎲",
  "Well played! 👏",
  "Nice move! 🎯",
  "Oops! 😅",
  "Need a 6! 🤞",
  "Hurry up! ⏱️",
  "Gotcha! 💥",
  "Rematch? 🔁",
  "gg! 🏆",
  "Haha no way! 😂",
  "So close! 🤏",
  "Unbelievable! 🤯"
];

export const ReactionsWidget: React.FC<ReactionsWidgetProps> = ({
  onSendReaction,
  userColor = 'red',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'emojis' | 'messages'>('emojis');

  const handleSelectContent = (content: string, type: 'emoji' | 'message') => {
    if (disabled) return;
    soundManager.playReactionSound();
    onSendReaction(content, type);
    // Auto-close full popover after selection
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Quick Emoji Bar & Toggle Button */}
      <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
        {/* Top 5 Quick Emojis */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {EMOJI_LIST.slice(0, 5).map((item) => (
            <button
              key={item.emoji}
              onClick={() => handleSelectContent(item.emoji, 'emoji')}
              disabled={disabled}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-lg flex items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-40"
              title={item.label}
            >
              {item.emoji}
            </button>
          ))}
        </div>

        {/* Expand Panel Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
            isOpen
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          <Smile className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Reactions</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-30 flex flex-col gap-3 backdrop-blur-md"
          >
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('emojis')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    activeTab === 'emojis'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Emojis</span>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    activeTab === 'messages'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Quick Chat</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                Live Reactions
              </span>
            </div>

            {/* Tab Contents */}
            {activeTab === 'emojis' ? (
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_LIST.map((item) => (
                  <button
                    key={item.emoji}
                    onClick={() => handleSelectContent(item.emoji, 'emoji')}
                    className="aspect-square rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-xl flex items-center justify-center transition transform hover:scale-125 active:scale-90 cursor-pointer shadow-sm"
                    title={item.label}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {PREDEFINED_MESSAGES.map((msg) => (
                  <button
                    key={msg}
                    onClick={() => handleSelectContent(msg, 'message')}
                    className="p-2 text-left rounded-xl bg-slate-950 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/50 text-slate-200 hover:text-white text-xs font-medium transition cursor-pointer truncate flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{msg}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
