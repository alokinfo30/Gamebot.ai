<div align="center">

# 🎮 GAMEBOT.AI

### The Ultimate Cross-Platform AI Gaming Suite & Multi-Game Arena

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_AI-3.6_%26_3.8-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-green?logo=vitest&logoColor=white)](https://vitest.dev/)

<p align="center">
  <b>Play 16 classic Board, Card, Casino, and Sports Games instantly in your browser.</b><br/>
  Features adaptive Gemini AI bots, camera-based hand gesture controls, real-time multiplayer rooms, live multi-lingual commentary, an autonomous QA agent framework, and enterprise-grade self-healing architecture.
</p>

[Play Live App](https://ais-pre-5i6eax2jz764d3hlsxs7yh-440468285390.asia-east1.run.app) • [Explore Games](#-games-catalog-16-games) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [API Reference](#-api-endpoints)

---

</div>

## 📌 Executive Summary

**GAMEBOT.AI** is a comprehensive, production-grade web gaming arena designed for instant zero-download gameplay across desktop, tablet, and mobile devices. It seamlessly combines timeless classic games (such as Ludo, Chess, Teen Patti, Indian Rummy, Texas Hold'em, Carrom, and Snooker) with state-of-the-art AI capabilities powered by Google Gemini, full-duplex camera hand tracking, local & online multiplayer lobbies, and an autonomous QA / self-healing pipeline.

---

## 🎲 Games Catalog (16 Games)

GAMEBOT.AI features 16 fully developed games with dedicated game logic, rules enforcement, bot heuristics, and customizable visual themes:

### 1. ♟️ Board & Strategy
| Game | Players | Description & Key Highlights |
| :--- | :--- | :--- |
| **Ludo AI Master** | 1–4 Players | Classic 4-color board (Red, Green, Yellow, Blue) with safe star cells, home runway, 6s bonus rolls, consecutive-roll penalties, camera gesture controls, and Gemini match commentary. |
| **Chess AI Grandmaster** | 1 vs 1 | Full standard chess engine with legal move generation, check/checkmate detection, castling, en passant, pawn promotion, and AI move analysis. |
| **Snakes & Ladders 3D** | 1–4 Players | Interactive 100-cell board with animated climbable ladders, penalty snakes, multi-dice roll mechanics, and voice milestone announcements. |

### 2. 🎴 Casino & Classic Cards
| Game | Players | Description & Key Highlights |
| :--- | :--- | :--- |
| **Texas Hold'em Poker** | 1–6 Players | Professional table layout with Pre-Flop, Flop, Turn, and River community cards, chip bet sizing, All-In moments, pot odds calculation, and AI bot risk assessments. |
| **Indian Rummy (13-Card)** | 2–6 Players | Traditional 13-card rummy requiring pure sequence, secondary sequences, and sets. Includes auto card sorting, printed/wildcard jokers, and point calculation. |
| **Teen Patti Royal** | 1–6 Players | 3-Card Indian Brag featuring Blind vs. Seen betting, Chaal multipliers, Side-Show requests, Pot limits, and Trail/Trio hand hierarchy rankings. |
| **Blackjack 21 Pro** | 1 vs Dealer | Vegas-style Blackjack with Hit, Stand, Double Down, Split, and Insurance. Dealer draws to 16 and stands on soft 17 with card-counting AI intelligence. |
| **Klondike Solitaire** | 1 Player | Timeless 7-column card game with Draw-1 and Draw-3 options, foundation auto-fill, infinite undo, move counter, and timer. |

### 3. 🎯 Sports & Cue Physics
| Game | Players | Description & Key Highlights |
| :--- | :--- | :--- |
| **Carrom Board Physics** | 1 vs 1 | Canvas 2D realistic physics simulation featuring striker angle aiming, impulse friction, pocket collisions, white/black point scoring, and Queen cover bonus rules. |
| **8-Ball Snooker & Pool** | 1 vs AI | Billiards simulation with cue ball aiming guides, impulse velocity control, cue spin, pocket friction, and foul detection. |
| **Table Tennis Rally** | 1 vs AI | High-speed ping-pong simulator with paddle movement tracking, topspin/backspin physics, progressive rally counters, and smash mechanics. |

### 4. 🃏 Trick-Taking & Social Shedding
| Game | Players | Description & Key Highlights |
| :--- | :--- | :--- |
| **Satte Pe Satta (Sevens)** | 1–4 Players | Fast-paced sequence game starting from the 7 of Hearts. Players build up to King and down to Ace while tactically blocking opponents. |
| **Coat Piece (Rang / Pees)** | 2 vs 2 Teams | Classic partnership trick-taking card game. Trump (Rang) declaration, leading suit obligations, and race to 7 tricks for a "Coat" victory. |
| **Bhabhi Thulla** | 1–4 Players | Traditional South Asian shedding card game. Players follow suit or throw a penalty "Thulla" to force opponents to collect the trick pile. |
| **Bluff (I Doubt It)** | 1–4 Players | Social deception game where cards are played face down with claimed ranks. Players and AI call out bluffs or exploit risk tolerances. |
| **Donkey Challenge** | 1–4 Players | Fast-reflex simultaneous passing card game. Players collect 4-of-a-kind and race to grab the center token before opponents do. |

---

## ⚡ Core Features & Innovations

### 1. 🤖 Adaptive Gemini AI Integration
- **Post-Game Tactical Reports**: Detailed Gemini-generated evaluations analyzing aggressiveness, risk management, blunder count, key turning points, and tactical tips.
- **Dynamic Banter & Live Commentary**: Contextual 1-sentence banter during gameplay tailored to bot personalities (Aggressive, Balanced, Defensive, Grandmaster).
- **Graceful Fallback Mode**: Fully functional offline/fallback heuristics when `GEMINI_API_KEY` is omitted or quota is exceeded.

### 2. 🖐️ Camera-Based Touchless Gesture Controls
- Real-time webcam hand recognition for touchless interactions:
  - **Open Palm**: Dice Roll / Action trigger.
  - **Closed Fist / Thumbs Up**: Pass turn / Confirm selection.
  - **Pointing / Directional**: Navigate choices and select pawns.
- **Privacy-First**: Video streams are processed 100% locally in-browser via canvas frame processing; no video or image data is ever transmitted or stored remotely.
- **Sensitivity Calibration**: Adjustable threshold slider (0–100) with visual confidence indicators.

### 3. 🌐 Online Multiplayer & Room Synchronization
- **6-Digit Room Codes**: Instant room creation with shareable link generation and clipboard copying.
- **Matchmaking & Turn Coordination**: Real-time room synchronization, seat assignments, color locking, and disconnect recovery.
- **Live Spectator Hub**: Watch matches in real-time, view live player moves, learn strategies, and react with real-time emoji bubbles.

### 4. 🏆 ELO Rating & Global Leaderboards
- Complete chess-style ELO rating system calculating dynamic rating adjustments based on opponent strength.
- Per-game and cross-game leaderboards tracking matches played, wins, win streaks, and rank tiers:
  - 🥉 **Bronze** (0–1199)
  - 🥈 **Silver** (1200–1399)
  - 🥇 **Gold** (1400–1599)
  - 💎 **Platinum** (1600–1799)
  - 🔮 **Diamond** (1800–1999)
  - 👑 **Master** (2000–2199)
  - 🏆 **Grandmaster** (2200+)

### 5. 🗣️ Multi-Language Localization (7 Languages)
- Fully localized UI strings, game rules, coach tips, and text-to-speech commentary:
  - 🇬🇧 **English** (`en`)
  - 🇮🇳 **Hindi (हिंदी)** (`hi`)
  - 🇪🇸 **Spanish (Español)** (`es`)
  - 🇮🇳 **Marathi (मराठी)** (`mr`)
  - 🇧🇩 **Bengali (বাংলা)** (`bn`)
  - 🇮🇳 **Tamil (தமிழ்)** (`ta`)
  - 🇮🇳 **Telugu (తెలుగు)** (`te`)
- Includes auto-detection based on `navigator.language` and seamless instant switching.

### 6. 🔊 Synthesized Web Audio Sound Manager
- Zero external audio files required: all sound effects (dice rolls, card snaps, piece captures, token moves, striker hits, timer ticks, victory fanfares) are procedurally synthesized using the browser's native **Web Audio API** oscillators and gain nodes.
- Global mute toggle with persistence in `localStorage`.

### 7. 🛡️ Enterprise Security Shield & WAF
- **In-Memory Web Application Firewall (WAF)**: Active inspection of all incoming payloads for SQL injection, cross-site scripting (XSS), prototype pollution, and malformed script patterns.
- **Hardened HTTP Headers**:
  - Strict Content Security Policy (CSP)
  - HTTP Strict Transport Security (HSTS)
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Permissions-Policy: camera=(self)`
- **Security Dashboard**: Built-in modal displaying live security status, protected endpoints, and active WAF rules.

### 8. 🩺 Autonomous QA Agent & Self-Healing Pipeline
- **Autonomous Gameplay Engine**: Automated test bot (`qaAutomationEngine`) executing simulated turns across all 16 games.
- **Vision Evaluator**: Evaluates visual invariant criteria (turn locks, roll sequences, suit compliance, victory states).
- **3-Agent Self-Healing Pipeline**:
  - *Agent 1: Root Cause Analyzer* — parses runtime exceptions and categorizes failure domains.
  - *Agent 2: Patch Generator with Guardrails* — generates isolated, non-breaking logic corrections.
  - *Agent 3: Security & Test Runner* — executes regression suites inside isolated sandboxes before applying patches.

### 9. 📱 Progressive Web App (PWA) & Offline Support
- Fully configured Web App Manifest (`manifest.json`) and Service Worker (`sw.js`).
- Instant installation on iOS, Android, macOS, and Windows.
- Offline status indicator and state caching for uninterrupted play.

### 10. ♿ Accessibility & Colorblind Support
- High-contrast visual modes.
- Colorblind-friendly pattern overlays (stripes, dots, chevrons) on tokens and board cells.
- Accessible turn timers, large touch targets, and assistive coach tooltips.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │               React 19 + TypeScript                 │   │
│   │   GameHubHomePage • 16 Game Components • Board     │   │
│   │   GestureControl (Camera) • Audio Synthesizer       │   │
│   │   DailyMissions • Leaderboard • SpectatorHub        │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │ Fetch / JSON-RPC             │
└──────────────────────────────┼──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Express Full-Stack Server                │
│                           (server.ts)                       │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              WAF & Security Shield                  │   │
│   │     Input Sanitization • CSP • Rate Limiting        │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────┴──────────────────────────┐   │
│   │                   REST API Controllers              │   │
│   │   /api/ai/*         - Gemini Tactical Analysis      │   │
│   │   /api/rooms/*      - Multiplayer Room Management   │   │
│   │   /api/elo/*        - Leaderboard & Rating Sync     │   │
│   │   /api/self-healing - 3-Agent Error Audit Pipeline  │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │                 Google GenAI SDK                    │   │
│   │             (gemini-3.6-flash model)                │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
├── public/                     # Static assets, PWA manifest, service worker, icons
│   ├── favicon.svg             # SVG favicon
│   ├── manifest.json           # PWA Web App Manifest
│   ├── robots.txt              # Search engine crawler policies
│   └── sw.js                   # Service Worker for offline caching
├── scripts/
│   ├── generate-icons.mjs      # PWA icon generation utility
│   └── run-qa-agent.ts         # Autonomous QA Agent CLI runner script
├── server.ts                   # Full-Stack Express Server with WAF & Gemini Proxy
├── src/
│   ├── apiApp.ts               # Shared API utilities and types
│   ├── App.tsx                 # Root Application container & routing hub
│   ├── index.css               # Tailwind CSS stylesheet
│   ├── main.tsx                # React 19 entry point & Service Worker registration
│   ├── components/             # React UI components
│   │   ├── GameHubHomePage.tsx # 16-game catalog & category browser
│   │   ├── Board.tsx           # Ludo 4-player board renderer
│   │   ├── ChessGame.tsx       # Interactive Chess board & engine
│   │   ├── TeenPattiGame.tsx   # Teen Patti 3-card poker table
│   │   ├── RummyGame.tsx       # 13-Card Indian Rummy table
│   │   ├── PokerGame.tsx       # Texas Hold'em Poker table
│   │   ├── BlackjackGame.tsx   # Blackjack 21 table
│   │   ├── SolitaireGame.tsx   # Klondike Solitaire
│   │   ├── CarromGame.tsx      # Physics-based Carrom canvas board
│   │   ├── SnookerGame.tsx     # 8-Ball Snooker cue table
│   │   ├── TableTennisGame.tsx # Table Tennis 2D ping pong canvas
│   │   ├── SnakesAndLadders.tsx# Snakes & Ladders 100-cell board
│   │   ├── SattePeSattaGame.tsx# 7s card game
│   │   ├── CoatPieceGame.tsx   # 2v2 Coat Piece / Rang card game
│   │   ├── BhabhiGame.tsx      # Bhabhi Thulla shedding game
│   │   ├── BluffGame.tsx       # Bluff / I Doubt It deception game
│   │   ├── DonkeyGame.tsx      # Donkey reflex card game
│   │   ├── GestureControl.tsx  # Webcam hand tracking & gesture classifier
│   │   ├── LeaderboardModal.tsx# ELO rankings per game
│   │   ├── AIAnalysisModal.tsx # Gemini match analysis modal
│   │   └── SecurityShieldModal.tsx # WAF & Security architecture modal
│   ├── logic/                  # Business & game logic
│   │   ├── aiBot.ts            # Heuristic decision engines
│   │   ├── elo.ts              # ELO rating calculations & storage
│   │   ├── i18n.ts             # 7-language translation dictionary
│   │   ├── ludoBoard.ts        # Ludo board coordinates & step mapping
│   │   ├── security.ts         # Input sanitization & WAF payload checks
│   │   ├── selfHealingEngine.ts# Error interception & auto-recovery
│   │   └── soundManager.ts     # Procedural Web Audio API sound generator
│   ├── qa-agent/               # Autonomous QA & Self-Healing Framework
│   │   ├── gameplayAutomationEngine.ts # Turn simulation engine
│   │   ├── geminiVisionEvaluator.ts    # Visual invariant verifier
│   │   └── selfHealingPipeline.ts      # 3-tier repair engine
│   └── tests/                  # Automated Vitest test suite
│       ├── all.test.ts
│       ├── gameTimerStandardization.test.ts
│       ├── grandmasterPlaytest.test.ts
│       ├── multiplayer.test.ts
│       ├── pageRefreshStatePersistence.test.ts
│       ├── pauseGame.test.ts
│       ├── playingCardAesthetics.test.ts
│       ├── qaAgentFramework.test.ts
│       ├── snakesAndLadders.test.ts
│       ├── spectatorRuleLearning.test.ts
│       └── strictOwnership.test.ts
├── metadata.json               # AI Studio applet configuration & permissions
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite bundling & development configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/alokinfo30/Gamebot.ai.git
cd Gamebot.ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` or `.env` file in the root directory:
```bash
# Optional: Enables real-time Google Gemini match analysis and live witty commentary
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (default 3000)
PORT=3000
```
> *Note: If no API key is provided, the application automatically uses smart built-in heuristic algorithms for all bot decisions and commentary.*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🧪 Testing & Verification

GAMEBOT.AI includes a comprehensive testing suite powered by **Vitest** covering core board mechanics, ownership isolation, persistence, and timer synchronization.

```bash
# Run all unit and integration tests
npm run test

# Run TypeScript typecheck / linter
npm run lint

# Run the Autonomous AI QA Agent CLI
npx tsx scripts/run-qa-agent.ts
```

### Test Suite Highlights
- **`strictOwnership.test.ts`**: Verifies that players can never interact with opponent pieces or take moves out of turn.
- **`gameTimerStandardization.test.ts`**: Validates consistent 15-second turn timeouts across all games with auto-pass logic.
- **`grandmasterPlaytest.test.ts`**: Simulates end-to-end multi-turn matches to detect deadlocks, infinite loops, and rule anomalies.
- **`multiplayer.test.ts`**: Tests room creation, code validation, seat assignments, and state synchronization.
- **`pageRefreshStatePersistence.test.ts`**: Ensures games restore smoothly from `localStorage` on page reload.
- **`qaAgentFramework.test.ts`**: Verifies automated anomaly detection and self-healing patch pipelines.

---

## 📡 API Endpoints

The Express server exposes the following secure REST endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check verifying Gemini key presence and WAF status. |
| `GET` | `/api/security/status` | Returns active WAF inspection metrics and security architecture. |
| `POST` | `/api/ai/analysis` | Generates a deep tactical post-game report with Gemini AI. |
| `POST` | `/api/ai/commentary` | Generates a witty, contextual 1-sentence bot commentary line. |
| `GET` | `/api/elo/leaderboard` | Fetches leaderboard rankings for a specific game or overall (`?game=ludo`). |
| `POST` | `/api/elo/update` | Updates player match statistics, wins, and computes new ELO rating. |
| `POST` | `/api/rooms/create` | Creates a new multiplayer room with a unique 6-digit code. |
| `POST` | `/api/rooms/join` | Joins an existing multiplayer room and assigns player color. |
| `GET` | `/api/rooms/:code` | Fetches the current room state and connected players. |
| `POST` | `/api/rooms/:code/sync`| Synchronizes game board moves across connected room participants. |
| `POST` | `/api/self-healing/capture-error` | Captures client or server errors into the self-healing log. |
| `GET` | `/api/self-healing/status` | Retrieves status of the 3-agent self-healing pipeline and applied patches. |

---

## 🛡️ Security & Privacy

1. **Client-Side Camera Privacy**: Hand gestures are tracked using browser webcam feeds processed in memory on HTML5 Canvas. No frames, snapshots, or biometric data are transmitted across the network.
2. **Web Application Firewall (WAF)**: Every incoming JSON payload is examined for injection signatures before reaching route handlers.
3. **Safe Content Security Policy (CSP)**: Disallows unauthorized third-party scripts, restricts framing, and mandates HTTPS connections.
4. **No UI Secrets**: API keys are strictly maintained server-side in environment variables and are never leaked to client bundles.

---

## 📄 License & Credits

Built with ❤️ by the **GAMEBOT.AI Team**.

Licensed under the [MIT License](LICENSE).
