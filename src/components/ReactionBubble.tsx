import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerColor } from '../types/ludo';

export interface ActiveReaction {
  id: string;
  playerColor: PlayerColor;
  playerName: string;
  content: string;
  type: 'emoji' | 'message';
  timestamp: number;
}

interface ReactionBubbleProps {
  reaction: ActiveReaction | null;
  position?: 'inline' | 'floating';
}

export const ReactionBubble: React.FC<ReactionBubbleProps> = ({
  reaction,
  position = 'inline',
}) => {
  if (!reaction) return null;

  const colorBgMap: Record<PlayerColor, string> = {
    red: 'bg-rose-600 text-white border-rose-400',
    green: 'bg-emerald-600 text-white border-emerald-400',
    yellow: 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold',
    blue: 'bg-blue-600 text-white border-blue-400',
  };

  return (
    <AnimatePresence>
      <motion.div
        key={reaction.id}
        initial={{ scale: 0.2, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -15 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shadow-xl z-30 font-bold ${
          colorBgMap[reaction.playerColor]
        } ${reaction.type === 'emoji' ? 'text-xl py-1' : 'text-xs'}`}
      >
        {reaction.type === 'emoji' ? (
          <span className="animate-bounce inline-block">{reaction.content}</span>
        ) : (
          <span>{reaction.content}</span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
