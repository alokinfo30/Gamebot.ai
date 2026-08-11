import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Play,
  Trophy,
  Bot,
  Users,
  Search,
  Flame,
  Award,
  Gamepad2,
  Shield,
  Layers,
  HelpCircle,
  Zap,
  Swords,
  Globe,
  Camera,
} from 'lucide-react';
import { LanguageCode, t } from '../logic/i18n';
import { DailyMissions } from './DailyMissions';
import { UserProfile } from '../types/ludo';

export type GameKey =
  | 'ludo'
  | 'chess'
  | 'teen_patti'
  | 'rummy'
  | 'satte'
  | 'coat_piece'
  | 'bhabhi'
  | 'poker'
  | 'blackjack'
  | 'solitaire'
  | 'donkey'
  | 'bluff'
  | 'snakes'
  | 'carrom'
  | 'snooker'
  | 'tt';

interface GameHubHomePageProps {
  language: LanguageCode;
  onSelectGame: (gameKey: GameKey) => void;
  onOpenGuide: (gameKey: GameKey) => void;
  activeGameKey?: GameKey;
  userProfile?: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export interface GameMetadata {
  id: GameKey;
  title: string;
  category: 'board' | 'card' | 'sports' | 'casino';
  categoryLabel: string;
  emoji: string;
  badge: string;
  badgeColor: string;
  bgGradient: string;
  borderColor: string;
  description: string;
  playersInfo: string;
  features: string[];
}

export const GAMES_CATALOG: GameMetadata[] = [
  {
    id: 'ludo',
    title: 'Ludo AI Master',
    category: 'board',
    categoryLabel: 'Board & Strategy',
    emoji: '🎲',
    badge: 'Popular #1',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bgGradient: 'from-rose-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-rose-500/30 hover:border-rose-400',
    description: 'Classic 4-player Ludo with adaptive Gemini AI bots, live camera gestures, and online rooms.',
    playersInfo: '1 - 4 Players (AI & Online)',
    features: ['Adaptive AI Bots', 'Camera Gestures', 'Online Matchmaking'],
  },
  {
    id: 'chess',
    title: 'Chess AI Grandmaster',
    category: 'board',
    categoryLabel: 'Board & Strategy',
    emoji: '♟️',
    badge: 'Pro Mind',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    bgGradient: 'from-blue-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-blue-500/30 hover:border-blue-400',
    description: 'Deep tactical chess engine with real-time AI move analysis, ELO ratings, and legal move highlighting.',
    playersInfo: '1 vs 1 (AI or Local)',
    features: ['Real-time Analysis', 'Legal Move Guides', 'ELO Rating Track'],
  },
  {
    id: 'snakes',
    title: 'Snakes & Ladders 3D',
    category: 'board',
    categoryLabel: 'Board & Strategy',
    emoji: '🐍',
    badge: 'Family Fun',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bgGradient: 'from-emerald-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    description: 'Interactive 100-tile board with shortcut ladders, treacherous snakes, and multi-dice rolls.',
    playersInfo: '1 - 4 Players',
    features: ['Multi-Dice System', 'Voice Announcements', 'Animated Ladders'],
  },
  {
    id: 'carrom',
    title: 'Carrom Board Physics',
    category: 'sports',
    categoryLabel: 'Cue & Motion',
    emoji: '🎯',
    badge: 'Arcade Physics',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bgGradient: 'from-amber-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    description: 'Realistic striker friction, bank-shots, queen cover bonus, and precision angle aiming.',
    playersInfo: '1 vs 1 (AI & Local)',
    features: ['Striker Aim Assist', 'Queen Cover Rules', 'Physics Simulation'],
  },
  {
    id: 'teen_patti',
    title: 'Teen Patti Royal',
    category: 'card',
    categoryLabel: 'Casino & Cards',
    emoji: '🃏',
    badge: 'Trending',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    bgGradient: 'from-purple-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    description: 'Traditional 3-Card Brag with blind betting, side shows, pot limits, and AI bot bluffing.',
    playersInfo: '1 - 6 Players',
    features: ['Seen vs Blind Play', 'Side-Show Requests', 'Hand Rank Evaluator'],
  },
  {
    id: 'poker',
    title: 'Texas Hold\'em Poker',
    category: 'casino',
    categoryLabel: 'Casino & Cards',
    emoji: '♠️',
    badge: 'Tournament',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    bgGradient: 'from-indigo-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-indigo-500/30 hover:border-indigo-400',
    description: 'Full-stack poker table featuring flop, turn, river community cards, chip stacks, and AI pot odds.',
    playersInfo: '1 - 6 Players',
    features: ['Community Cards', 'Chip Stacks & All-In', 'Pot Odds Indicator'],
  },
  {
    id: 'rummy',
    title: 'Indian Rummy 13-Card',
    category: 'card',
    categoryLabel: 'Casino & Cards',
    emoji: '🎴',
    badge: 'Skill Classic',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    bgGradient: 'from-teal-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-teal-500/30 hover:border-teal-400',
    description: 'Form pure sequences, sets, and melds with auto-sorting, wildcard jokers, and quick declare.',
    playersInfo: '2 - 6 Players',
    features: ['Auto Card Sorting', 'Pure Sequence Check', 'Declared Points Calc'],
  },
  {
    id: 'snooker',
    title: '8-Ball Snooker & Pool',
    category: 'sports',
    categoryLabel: 'Cue & Motion',
    emoji: '🎱',
    badge: 'Precision',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    bgGradient: 'from-cyan-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-cyan-500/30 hover:border-cyan-400',
    description: 'Table cue sports with ball collision physics, power control gauge, and target trajectory lines.',
    playersInfo: '1 vs 1 (AI Bot)',
    features: ['Trajectory Guide', 'Power Adjustment', 'Pocket Collision'],
  },
  {
    id: 'tt',
    title: 'Table Tennis Rally',
    category: 'sports',
    categoryLabel: 'Cue & Motion',
    emoji: '🏓',
    badge: 'Fast Pace',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    bgGradient: 'from-yellow-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-yellow-500/30 hover:border-yellow-400',
    description: 'High-speed ping pong paddle rallies, topspin smashes, counter-cuts, and match score tracking.',
    playersInfo: '1 vs AI Paddle',
    features: ['Smash Velocity', 'Rally Counter', 'Reaction Paddle'],
  },
  {
    id: 'solitaire',
    title: 'Solitaire Classic',
    category: 'card',
    categoryLabel: 'Casino & Cards',
    emoji: '🃏',
    badge: 'Relax & Focus',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bgGradient: 'from-zinc-950 via-slate-900 to-slate-950',
    borderColor: 'border-zinc-700 hover:border-emerald-400',
    description: 'Timeless Klondike solitaire with Draw-1 or Draw-3 options, move undo, auto-complete, and timer.',
    playersInfo: 'Single Player',
    features: ['Draw 1 & Draw 3', 'Unlimited Undo', 'Auto-Complete Finish'],
  },
  {
    id: 'blackjack',
    title: 'Blackjack 21 Pro',
    category: 'casino',
    categoryLabel: 'Casino & Cards',
    emoji: '🪙',
    badge: 'High Stakes',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bgGradient: 'from-amber-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-amber-600/30 hover:border-amber-400',
    description: 'Beat the AI dealer with Hit, Stand, Double Down, Split, and insurance strategy calculations.',
    playersInfo: '1 vs Dealer',
    features: ['Dealer Rules 17', 'Double & Split', 'Insurance Protection'],
  },
  {
    id: 'satte',
    title: 'Satte Pe Satta (7s)',
    category: 'card',
    categoryLabel: 'Casino & Cards',
    emoji: '7️⃣',
    badge: 'Tactical',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bgGradient: 'from-rose-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-rose-600/30 hover:border-rose-400',
    description: 'Classic 7 of Hearts sequence card game. Block opponents and clear your hand first.',
    playersInfo: '1 - 4 Players',
    features: ['Card Blocking Tactics', '7 Start Sequence', 'AI Hand Tracking'],
  },
  {
    id: 'coat_piece',
    title: 'Coat Piece (Rang)',
    category: 'card',
    categoryLabel: 'Casino & Cards',
    emoji: '🧥',
    badge: 'Team Battle',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    bgGradient: 'from-blue-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-blue-600/30 hover:border-blue-400',
    description: 'Partner trick-taking card game. Declare trump (Rang) and capture 7 or more tricks to win.',
    playersInfo: '2 vs 2 Teams',
    features: ['Trump Declaration', 'Partner AI Logic', 'Trick Counter'],
  },
  {
    id: 'bhabhi',
    title: 'Bhabhi Thulla Shedding',
    category: 'card',
    categoryLabel: 'Casino & Cards',
    emoji: '🃏',
    badge: 'Strategic',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    bgGradient: 'from-purple-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-purple-600/30 hover:border-purple-400',
    description: 'Shed all cards quickly to avoid becoming the Bhabhi in this intense multiplayer card game.',
    playersInfo: '1 - 4 Players',
    features: ['Thulla Penalty Check', 'Suit Matching', 'Shedding Rankings'],
  },
  {
    id: 'bluff',
    title: 'Bluff (I Doubt It)',
    category: 'card',
    categoryLabel: 'Casino & Cards',
    emoji: '🤫',
    badge: 'Deception',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    bgGradient: 'from-red-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-red-600/30 hover:border-red-400',
    description: 'Play cards face down and claim rank. Call out opponents\' bluffs or trick them to win.',
    playersInfo: '1 - 4 Players',
    features: ['Bluff Detection AI', 'Penalty Card Swaps', 'Risk Assessment'],
  },
  {
    id: 'donkey',
    title: 'Donkey Card Challenge',
    category: 'card',
    categoryLabel: 'Casino & Cards',
    emoji: '🫏',
    badge: 'Speed & Reflex',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    bgGradient: 'from-yellow-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-yellow-600/30 hover:border-yellow-400',
    description: 'Pass cards simultaneously to assemble 4-of-a-kind and grab the token before anyone else.',
    playersInfo: '1 - 4 Players',
    features: ['Reflex Token Grab', '4-of-a-Kind Sets', 'Rapid Card Passes'],
  },
];

export const GameHubHomePage: React.FC<GameHubHomePageProps> = ({
  language,
  onSelectGame,
  onOpenGuide,
  activeGameKey,
  userProfile,
  onProfileUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredGames = GAMES_CATALOG.filter((game) => {
    const matchesCategory =
      selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Detect all active games in progress stored in localStorage or active
  const resumableGames = GAMES_CATALOG.filter((game) => {
    if (activeGameKey === game.id) return true;
    try {
      if (game.id === 'ludo') {
        const ludoState = localStorage.getItem('ludo_active_game_state');
        if (ludoState) {
          const parsed = JSON.parse(ludoState);
          return parsed.status === 'playing';
        }
      } else {
        const activeState = localStorage.getItem(`gamebot_active_${game.id}_state`);
        if (activeState === 'true') return true;
      }
    } catch (e) {}
    return false;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8 text-slate-100">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Decorative ambient background glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>GAMEBOT.AI MULTI-GAME ARENA</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Play <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">AI-Powered Games</span> Anytime, Anywhere
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Experience Ludo, Chess, Snakes & Ladders, Carrom, Poker, Teen Patti, Snooker, Table Tennis & Card Games against Gemini AI bots or real players online.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Bot className="w-3.5 h-3.5 text-blue-400" /> Adaptive AI Bots
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Camera className="w-3.5 h-3.5 text-emerald-400" /> Camera Hand Gestures
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Globe className="w-3.5 h-3.5 text-purple-400" /> Online Rooms
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Auto Progress Restore
              </span>
            </div>
          </div>

          {/* Quick Active Games Resume Widget */}
          {resumableGames.length > 0 && (
            <div className="w-full lg:w-88 p-4 rounded-2xl bg-slate-900/90 border border-blue-500/40 shadow-xl backdrop-blur-md flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Games in Progress ({resumableGames.length})</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  Ready to Resume
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {resumableGames.map((gameMeta) => (
                  <div
                    key={gameMeta.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-lg shadow-md border border-white/20 shrink-0">
                        {gameMeta.emoji}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white truncate">{gameMeta.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{gameMeta.categoryLabel}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectGame(gameMeta.id)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md shadow-blue-600/30 transition cursor-pointer shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Games', count: GAMES_CATALOG.length },
            { id: 'board', label: 'Board & Strategy', count: GAMES_CATALOG.filter((g) => g.category === 'board').length },
            { id: 'card', label: 'Card Games', count: GAMES_CATALOG.filter((g) => g.category === 'card').length },
            { id: 'casino', label: 'Casino', count: GAMES_CATALOG.filter((g) => g.category === 'casino').length },
            { id: 'sports', label: 'Cue & Motion', count: GAMES_CATALOG.filter((g) => g.category === 'sports').length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <span>{cat.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950/80 text-[10px] font-mono text-slate-400">
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games or rules..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition"
          />
        </div>
      </div>

      {/* Games Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredGames.map((game) => {
          const isActive = activeGameKey === game.id;
          return (
            <motion.div
              key={game.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.15 }}
              className={`relative rounded-2xl bg-gradient-to-b ${game.bgGradient} border ${game.borderColor} p-5 shadow-xl flex flex-col justify-between gap-4 group transition-all`}
            >
              {/* Card Header: Badge & Category */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${game.badgeColor}`}>
                  {game.badge}
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {game.categoryLabel}
                </span>
              </div>

              {/* Game Main Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    {game.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-white truncate flex items-center gap-1.5">
                      <span>{game.title}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="Active Game Session" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{game.playersInfo}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 pt-1">
                  {game.description}
                </p>
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-1">
                {game.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[10px] font-medium text-slate-400"
                  >
                    {feat}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectGame(game.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isActive ? 'Resume' : 'Play Game'}</span>
                </button>

                <button
                  onClick={() => onOpenGuide(game.id)}
                  title="View Rules & AI Guide"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No games matched "{searchQuery}"</h3>
          <p className="text-xs text-slate-500">Try searching for Ludo, Chess, Poker, Rummy, or Carrom.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 transition cursor-pointer"
          >
            Clear Search Filter
          </button>
        </div>
      )}

      {/* Daily Quests & ELO Boosts Section (Positioned After All Games Section) */}
      {userProfile && (
        <div className="pt-4 border-t border-slate-800/80">
          <DailyMissions
            userProfile={userProfile}
            onProfileUpdated={onProfileUpdated}
          />
        </div>
      )}
    </div>
  );
};
