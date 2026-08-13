# GAMEBOT.AI 🎲♟️🃏
### Multi-Game AI Arena & ELO Ranked Ecosystem

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-3.6_Flash-8E44AD?logo=google)](https://deepmind.google/technologies/gemini/)
[![Vitest](https://img.shields.io/badge/Tests-38_Passed-27AE60?logo=vitest)](https://vitest.dev/)

**GAMEBOT.AI** is a premium, web-based multi-game arena featuring **16+ AI-powered board, card, and motion sports games**. Designed with rich aesthetics, real-time Gemini AI integration, webcam gesture tracking, live multilingual voice commentary, ELO rank progression, and multi-layered WAF security.

[Click here to Play Now ](https://gamebot-ai.ai.studio)

## 🌟 Key Features & Capabilities

### 1. Standard Ludo Engine & High-Res Board
- **Full Rule Enforcement**: Accurate 15x15 board layout with 52-step main circuit, 8 safe star cells, colored home stretch runways, and central home triangles.
- **Rules Mechanics**: Base yard exit on 6, extra turns on 6s / captures / home entries, 3-consecutive-6s forfeit rule, and safe cell token stacking.
- **Interactive Corner Badges**: Click any corner player card (Red, Green, Yellow, Blue) to open an in-match profile modal showing token statuses, win rates, and ELO rank tiers.
- **Responsive Layout**: Doubled board dimensions (880px–940px) with auto-scaling across desktop, tablet, and mobile displays.

### 2. Webcam Camera Gestures & Dynamic Cheat Sheet
- **Motion & Skin Contour Tracking**: Real-time webcam tracking in browser memory using HTML5 Canvas motion differential math:
  - ✋ **Open Palm / Wave**: Automatically rolls the turn dice.
  - ☝️ **1 Finger**: Selects & moves Token 1.
  - ✌️ **2 Fingers**: Selects & moves Token 2.
  - 🤟 **3 Fingers**: Selects & moves Token 3.
  - 🖖 **4 Fingers**: Selects & moves Token 4.
  - ✊ **Fist**: Passes turn.
- **Dynamic Gesture Cheat Sheet**: In-board modal overlay (`GestureCheatSheetModal`) that **dynamically highlights active gestures** matching the current turn context (e.g. highlighting ✋ when rolling dice or ☝️-🖖 for available token move choices).
- **Header Camera Control & Listening Indicator**: Top navbar camera toggle with a glowing green **"LISTENING"** status badge indicating active motion tracking.
- **Local Privacy Assurance**: `CameraPermissionModal` explaining 100% on-device processing (zero video/image data uploaded or stored).

### 3. Daily Quests & ELO Missions
- **Daily Missions Component**: Located on `GameHubHomePage` (`DailyMissions.tsx`):
  - 🏆 *Victory Streak*: Win 3 matches (+150 ELO, "Master Strategist" Badge).
  - ⚡ *Game Time*: Play for 5 minutes (+50 ELO, "Speed Runner" Badge).
  - 🎲 *Lucky Striker*: Roll 10 Sixes (+75 ELO, "Lucky Sixer" Badge).
  - 💥 *Token Hunter*: Capture 3 opponent tokens (+100 ELO, "Aggressive Hunter" Badge).
  - 🕹️ *Arena Explorer*: Try 3 different games (+100 ELO, "Versatile Gamer" Badge).
- Progress tracking bars, countdown reset timer, confetti celebrations, and `localStorage` persistence.

### 4. 16+ AI Board, Card & Motion Sports Games
- **🎲 Ludo AI Master**: 4-player Ludo with adaptive Gemini AI bots and online rooms.
- **♟️ Chess AI Grandmaster**: 8x8 chessboard with legal move guides, capture logs, and AI lookahead.
- **🃏 Teen Patti Royal**: 3-card brag with Trail, Pure Sequence, Color, Pair evaluation, Blind & Chaal betting.
- **🎴 13-Card Indian Rummy**: Auto-sorting, Stock & Discard piles, wildcard jokers, sequence verification.
- **7️⃣ Satte Pe Satta (7s)**: 7 of Hearts sequence builder, suit blocking tactics, and AI hand tracking.
- **🧥 Coat Piece (Court Piece)**: 2v2 trick-taking partnership game with Rang (Trump) selection.
- **🃏 Bhabhi Thulla**: Shedding game with suit-following constraints and Thulla penalty tracking.
- **♠️ Texas Hold'em Poker**: Pre-flop, Flop, Turn, River community cards, chip stacks, pot odds calculations.
- **🪙 Blackjack 21 Pro**: Beat the AI Dealer with Soft 17 rules, Double Down, and Split actions.
- **🃏 Klondike Solitaire**: Draw-1 / Draw-3 options, unlimited undo, timer, auto-complete finish.
- **🫏 Donkey Card Challenge**: Simultaneous card passing and reflex token grabbing.
- **🤫 Bluff (I Doubt It)**: Face-down rank claims, Call Bluff challenge system, and penalty collection.
- **🐍 Snakes & Ladders 3D**: 100-square board with shortcut ladders and treacherous snakes.
- **🎯 Carrom Board Physics**: Realistic striker friction, bank-shots, queen cover bonus, angle aim assist.
- **🎱 8-Ball Snooker & Pool**: 2D rigid-body collision physics, aim trajectory guide, stroke power gauge.
- **🏓 Table Tennis Rally**: High-speed ping pong rallies, topspin smashes, counter-cuts, 11-point tournament score.

### 5. Generative & Agentic AI Engine
- **Adaptive AI Bot Engine**: Real-time tactical evaluation of captures, safe-cell camping, threat avoidance, and home stretches.
- **Server-Side Gemini 3.6 Flash Analysis**: Express backend endpoint (`/api/ai/analysis`) utilizing `@google/genai` to generate post-match reports, player style breakdowns, and coaching tips.
- **Multilingual TTS Voice Commentary**: Express backend endpoint (`/api/ai/commentary`) converted to browser SpeechSynthesis voice streaming in 13+ languages (English, Hindi, Spanish, French, German, Portuguese, Bengali, Tamil, Telugu, Arabic, Chinese, Japanese, Russian).

### 6. Local & Online Multiplayer
- **Offline VS AI**: Play offline anywhere against 1–3 Gemini AI bots.
- **Local Pass & Play**: Single-device multiplayer for 2–4 players.
- **Online Ranked Arena**: 6-digit room codes with real-time lobbies and ELO updates.
- **Facebook & Instagram Social Invites**: Custom formatted challenge cards, direct messaging, Instagram story links, and match QR codes.

### 7. Competitive 15s Turn Countdown Timer & Audio Synth
- 15-second turn clock per phase with color-coded urgency bars (Emerald > 5s, Amber 3-5s, Pulsing Rose <= 2s).
- Synthesized audio tick alerts during final 5 seconds (`soundManager.ts`).
- Automatic timeout execution (auto-rolls dice or moves valid token if time expires).

### 8. Colorblind Accessibility Engine
- **Pattern Overlays**: Diagonal Stripes (Red), Polka Dots (Green), Crosshatch Grid (Yellow), Horizontal Waves (Blue).
- **Shape Symbols**: ▲ Triangle (Red), ● Circle (Green), ◆ Diamond (Yellow), ■ Square (Blue).
- Applied across board paths, starting yards, home runways, corner badges, and tokens.

### 9. Custom Background Theme Engine
- 8 Theme Presets (*Slate Dark, Midnight, Emerald, Royal Purple, Crimson, Sunset Gold, Obsidian, Deep Teal*) + Custom Solid Color Picker.
- Reactive `useEffect` forcing **immediate DOM body updates** and stripping conflicting Tailwind background classes.

### 10. Multi-Layered Security Architecture
- **CSP Headers**: Script-src, style-src, connect-src, img-src restrictions.
- **Web Application Firewall (WAF)**: Server-side middleware detecting XSS and SQL injection payloads.
- **Input Sanitization**: Contextual HTML entity escaping (`escapeHtml`, `sanitizeInput`, `sanitizeObject`).
- **Secure Cookie Config**: HttpOnly, Secure, SameSite=Strict protection.
- **Security Shield Dashboard**: Verification modal displaying active WAF metrics.

### 11. Automated QA Testing Suite
- Built-in Vitest test suite (`npm test` / `npx vitest run`) covering **38 unit & integration tests**:
  - Universal Online & Offline Multiplayer Room Engine and 6-digit code generation.
  - Room joining, seat assignments, and room capacity overflow guards.
  - Turn locks, anti-cheating invariants, and roll-before-move strict guards.
  - Authentic follow-lead-suit rules (Coat Piece & Bhabhi) and Satte Pe Satta playable card locks.
  - Winner celebration modal, audio fanfare, and confetti triggers.
  - Security architecture & WAF payload neutralization.
  - Ludo board circuit bounds, safe cells, turn rotation, and base exit rules.
  - ELO calculations and AI decision heuristics.
  - Multilingual i18n translation dictionary fallbacks.
  - Daily Missions reward computation & Theme DOM update synchronization.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 6 |
| **Styling & UI** | Vanilla CSS, Tailwind CSS 4, Lucide Icons, Framer Motion |
| **AI Integration** | `@google/genai` (Gemini 3.6 Flash), Web Speech Synthesis API |
| **Backend Server** | Node.js, Express, tsx |
| **Testing** | Vitest |
| **Effects & Audio** | HTML5 Web Audio Synthesizer, Canvas-Confetti |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+)
- npm or bun

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/alokinfo30/Gamebot.ai.git
   cd Gamebot.ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

6. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
