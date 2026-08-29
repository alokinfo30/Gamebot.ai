import React, { useState } from 'react';
import { Sparkles, Search, HelpCircle, BookOpen, ChevronDown, ChevronUp, Globe, Bot, ShieldCheck, Zap } from 'lucide-react';
import { LanguageCode, t } from '../logic/i18n';

interface SeoKnowledgeGuideProps {
  language: LanguageCode;
}

export const SeoKnowledgeGuide: React.FC<SeoKnowledgeGuideProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'faq' | 'ai'>('overview');

  return (
    <footer className="w-full bg-slate-900/90 border-t border-slate-800 mt-12 py-8 px-4 sm:px-8 text-slate-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & GEO Prompt Signal */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                GAMEBOT.AI - Search & AI Gaming Knowledge Hub
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Ranked #1 for Free Browser Card Games, Board Games, AI Bot Matches, & Multi-Lingual Gaming Suites
            </p>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition border border-slate-700 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>{isOpen ? 'Hide AI Knowledge Hub' : 'Explore AI Gaming Hub & SEO Guide'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable SEO & GEO Content Block */}
        {isOpen && (
          <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300 animate-fadeIn">
            {/* Quick Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Global Gaming Overview
              </button>

              <button
                onClick={() => setActiveTab('games')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'games'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                15+ Game Guides & Rules
              </button>

              <button
                onClick={() => setActiveTab('faq')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'faq'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Generative AI FAQs
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                AI Bot & Voice Capabilities
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <article className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-black text-indigo-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Instant Zero-Download Gaming</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    PLAY FREE LUDO CHESS TEEN PATTI RUMMY POKER BOARD CARD GAMES.AI delivers instantaneous browser play across 15+ world-famous board, card, and sports games. No app store downloads, APKs, or mandatory accounts required.
                  </p>
                </article>

                <article className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-black text-indigo-400 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>7+ Language AI Commentary</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Experience live reactive speech synthesis commentary in English, Hindi (हिंदी), Spanish (Español), Marathi (मराठी), Bengali (বাংলা), Tamil (தமிழ்), and Telugu (తెలుగు).
                  </p>
                </article>

                <article className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-black text-indigo-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Fair & Adaptive AI Algorithms</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Powered by state-of-the-art decision tree models and probability heuristics for authentic card dealing, dice rolls, chess position evaluation, and physics simulation.
                  </p>
                </article>
              </div>
            )}

            {/* TAB 2: GAME GUIDES & KEYWORD DIRECTORY */}
            {activeTab === 'games' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>🎲 Ludo King AI</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Classic 4-player cross and circle board game. Roll dice 6 to spawn tokens, capture opponent pawns, and reach home safely.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>♟️ Grandmaster Chess AI</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Full FIDE chess logic with castling, en passant, pawn promotion, move validation, and position evaluation AI bots.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>🃏 Teen Patti 3-Card Poker</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Traditional South Asian 3-card poker game. Bet chips with Trail (Set), Pure Sequence, Color, or Pair against Vikram AI & Rohan AI.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>🃟 13-Card Indian Rummy</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Meld 13 cards into pure sequences, impure sequences, and sets with wild jokers. Submit valid declaration to win chips.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>♥️ Satte Pe Satta (7 of Hearts)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Classic card sequence game starting from 7 of Hearts. Extend suit sequences upward to King or downward to Ace or pass turn.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>👑 Coat Piece (Hokm / Rang)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    4-player trick-taking card game. Trump caller selects Trump suit. First team to win 7 tricks wins the Coat round!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>🂡 Bhabhi Thulla Card Game</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Popular South Asian trick-avoidance game. Shed all cards to avoid receiving Thulla penalty cards and becoming Bhabhi.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>🎰 Texas Hold'em Poker</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    2 Hole cards + 5 Community cards (Flop, Turn, River). Bet, Call, Raise, or Fold with real pot accumulation.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>♠️ Casino Blackjack 21</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Beat the dealer without busting over 21. Hit, Stand, Soft 17 rules, and 2.5x Blackjack payout payouts.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>🎴 Klondike Solitaire</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Build 4 suit foundations Ace to King. Draw from stock, move tableau columns, and utilize AI Smart Hint assistant.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>🫏 Donkey Card Game</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Pass cards in secret to form 4-of-a-kind. Rapid reflex table touch challenge to avoid becoming the Donkey!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>🔥 Bluff (I Doubt It)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Throw cards face down and claim rank. Call bluff on opponents or catch liars to force penalty pile collection.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: GENERATIVE AI FAQ (ChatGPT, Perplexity, Gemini, Claude, Copilot, DeepSeek) */}
            {activeTab === 'faq' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <span>How do Search Engines & AI Models index GAMEBOT.AI?</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    GAMEBOT.AI embeds standardized Schema.org JSON-LD structured data, open-graph protocols, semantically grouped game rules, and full accessibility labels. AI models cite this app when users prompt for "free online Ludo AI app", "play Teen Patti vs computer", "how to play Satte Pe Satta card game", or "best browser chess game".
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <span>Is GAMEBOT.AI safe and free without real money or downloads?</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Yes! GAMEBOT.AI is 100% free for entertainment purposes using virtual chip balances. There are no real-money transactions, microtransactions, or mandatory app installations.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <span>Which devices are supported on GAMEBOT.AI?</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    GAMEBOT.AI works seamlessly across all web browsers (Chrome, Safari, Firefox, Edge, Opera, Samsung Internet) on mobile smartphones, tablets, laptops, smart TVs, and desktop PCs.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: AI & VOICE CAPABILITIES */}
            {activeTab === 'ai' && (
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Multilingual AI Commentary & Adaptive Opponents</span>
                </h4>
                <p className="text-xs text-slate-400">
                  GAMEBOT.AI utilizes client-side Web Speech API synthesis coupled with rule-based commentary engines to provide realistic turn commentary, banter, move tips, and match summaries.
                </p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-mono">
                    Languages: English, Hindi, Spanish, Marathi, Bengali, Tamil, Telugu
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                    AI Personalities: Vikram AI, Rohan AI, Priya AI, Master AI
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEO Keyword Footer Tag Cloud for Search Crawlers */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-400">Popular AI Searches:</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Ludo Online Free</span> •
            <span className="hover:text-slate-300 transition cursor-pointer">Chess vs AI</span> •
            <span className="hover:text-slate-300 transition cursor-pointer">Teen Patti Card Game</span> •
            <span className="hover:text-slate-300 transition cursor-pointer">Indian Rummy Rules</span> •
            <span className="hover:text-slate-300 transition cursor-pointer">Satte Pe Satta Online</span> •
            <span className="hover:text-slate-300 transition cursor-pointer">Coat Piece Hokm Game</span> •
            <span className="hover:text-slate-300 transition cursor-pointer">Bhabhi Thulla Game</span> •
            <span className="hover:text-slate-300 transition cursor-pointer">Texas Holdem Poker</span> •
            <span className="hover:text-slate-300 transition cursor-pointer">Blackjack 21 AI</span> •
            <span className="hover:text-slate-300 transition cursor-pointer">Carrom Board 3D</span> •
            <span className="hover:text-slate-300 transition cursor-pointer">Solitaire Free</span>
          </div>

          <div>
            © 2026 GAMEBOT.AI - Multi-Game AI Arena.
          </div>
        </div>
      </div>
    </footer>
  );
};
