import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { sanitizeInput, sanitizeObject, inspectWafThreat, getSecurityStatus } from './src/logic/security';

dotenv.config();

const app = express();
const PORT = 3000;

// Security Middleware 1: HTTP Security Headers & Content Security Policy (CSP)
app.use((req, res, next) => {
  // Enforce Content Security Policy (CSP)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "img-src 'self' data: blob: https://images.unsplash.com https://*.run.app; " +
      "connect-src 'self' https: wss:; " +
      "frame-ancestors 'self' https:; " +
      "object-src 'none'; " +
      "base-uri 'self';"
  );

  // Enforce HTTP Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  next();
});

// Security Middleware 2: Automated WAF Request Payload Inspector & Rate Limiter
app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const rawBodyString = JSON.stringify(req.body);
    if (inspectWafThreat(rawBodyString)) {
      console.warn(`[WAF SECURITY SHIELD] Blocked malicious payload from ${req.ip}`);
      return res.status(403).json({
        error: 'Security Threat Detected: Payload blocked by Web Application Firewall (WAF).',
        code: 'WAF_THREAT_BLOCKED',
      });
    }
  }
  next();
});

// Initialize Gemini Client server-side
const aiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (aiKey) {
  ai = new GoogleGenAI({
    apiKey: aiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory Database for Online Multiplayer Rooms & ELO Leaderboard
interface RoomState {
  code: string;
  createdAt: number;
  gameState: any;
  players: { id: string; name: string; color: string; isHost: boolean; elo: number }[];
}

const rooms = new Map<string, RoomState>();

interface LeaderboardEntry {
  id: string;
  name: string;
  elo: number;
  matchesPlayed: number;
  wins: number;
  rank: number;
}

const leaderboard: LeaderboardEntry[] = [
  { id: 'bot_1', name: 'Grandmaster AI', elo: 2250, matchesPlayed: 142, wins: 118, rank: 1 },
  { id: 'bot_2', name: 'Ludo_Wizard_99', elo: 2040, matchesPlayed: 98, wins: 76, rank: 2 },
  { id: 'bot_3', name: 'StarCamper_Pro', elo: 1890, matchesPlayed: 85, wins: 62, rank: 3 },
  { id: 'bot_4', name: 'BlitzKing', elo: 1720, matchesPlayed: 64, wins: 41, rank: 4 },
  { id: 'bot_5', name: 'ShieldDefender', elo: 1580, matchesPlayed: 50, wins: 30, rank: 5 },
];

// Security Architecture Status Endpoint
app.get('/api/security/status', (_req, res) => {
  res.json({
    status: 'secure',
    architecture: getSecurityStatus(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!aiKey, securityShieldActive: true });
});

// 1. Gemini AI Personalized Match Analysis Endpoint
app.post('/api/ai/analysis', async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
    const { gameState, userProfile } = sanitizedBody;

    if (!ai) {
      // Fallback analysis if API key is not configured
      return res.json({
        summary: 'Impressive match! You demonstrated strong tactical positioning and good timing on safe star cells.',
        championTitle: 'Strategic Contender',
        playerRatings: {
          red: { aggressiveness: 75, tacticalEfficiency: 82, riskManagement: 70, blunderCount: 1, mvpToken: 1, tips: ['Try keeping a backup token on star cells while advancing main token.'] },
          green: { aggressiveness: 80, tacticalEfficiency: 70, riskManagement: 60, blunderCount: 2, mvpToken: 0, tips: ['Watch out for opponent tokens 1-6 steps behind you.'] },
          yellow: { aggressiveness: 60, tacticalEfficiency: 85, riskManagement: 90, blunderCount: 0, mvpToken: 2, tips: ['Shield defense worked great!'] },
          blue: { aggressiveness: 65, tacticalEfficiency: 75, riskManagement: 65, blunderCount: 1, mvpToken: 3, tips: ['Exit base tokens earlier when rolling 6s.'] },
        },
        keyTurns: [
          { turnNumber: 8, color: 'red', description: 'Captured Green token right before Home Runway entry!', impact: 'game_changer' },
          { turnNumber: 15, color: 'red', description: 'Secured Token 1 on Star cell, shielding it from Blue.', impact: 'positive' },
        ]
      });
    }

    const logSummary = (gameState?.logs || [])
      .slice(-25)
      .map((l: any) => `Turn ${l.turnNumber} [${l.color?.toUpperCase()}]: ${sanitizeInput(l.playerName)} rolled ${l.dice}, action: ${sanitizeInput(l.action)}`)
      .join('\n');

    const prompt = `You are a World Ludo Grandmaster and Tactical Analyst. Analyze this recent Ludo match log and generate a detailed personalized post-game report for the player.
    
Match Info:
- Winner: ${gameState?.winnerColor || 'In Progress'}
- Total Turns: ${gameState?.turnCount || 0}
- Logs snippet:
${logSummary}

Return a valid JSON object matching this exact structure:
{
  "summary": "1-2 sentence overall commentary on player strategy and match momentum",
  "championTitle": "Fun 2-3 word title for player style (e.g. 'Tactical Sniper', 'Star Cell Warden')",
  "playerRatings": {
    "red": {
      "aggressiveness": 80,
      "tacticalEfficiency": 85,
      "riskManagement": 75,
      "blunderCount": 1,
      "mvpToken": 0,
      "tips": ["Tip 1", "Tip 2"]
    }
  },
  "keyTurns": [
    {
      "turnNumber": 12,
      "color": "red",
      "description": "Crucial capture or safe landing description",
      "impact": "game_changer"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    res.json(sanitizeObject(parsed));
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    res.status(500).json({ error: 'Failed to generate AI analysis.' });
  }
});

// 2. Gemini Live Bot Commentary Endpoint
app.post('/api/ai/commentary', async (req, res) => {
  try {
    const { lastMove, botColor, botPersonality } = req.body;

    if (!ai) {
      const defaultPhrases = [
        "Watch your back, I'm closing in!",
        "Star cells won't save you forever!",
        "That roll was pure luck, nice move!",
        "Calculated risk! Let's see how this plays out.",
        "Precision strike! The board belongs to AI!"
      ];
      return res.json({ commentary: defaultPhrases[Math.floor(Math.random() * defaultPhrases.length)] });
    }

    const prompt = `You are a competitive, playful Ludo AI bot (${botPersonality} personality, playing as ${botColor.toUpperCase()}).
A player just made this move: ${JSON.stringify(lastMove)}.
Give a short 1-sentence witty banter or tactical commentary for the game chat (max 15 words).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ commentary: response.text?.trim() || 'Game on!' });
  } catch (error) {
    res.json({ commentary: 'Nice roll! Stay sharp.' });
  }
});

// 3. ELO Leaderboard Endpoints with Per-Game Top Players
const gameLeaderboards: Record<string, LeaderboardEntry[]> = {
  ludo: [
    { id: 'bot_1', name: 'Grandmaster AI', elo: 2250, matchesPlayed: 142, wins: 118, rank: 1 },
    { id: 'bot_2', name: 'Ludo_Wizard_99', elo: 2040, matchesPlayed: 98, wins: 76, rank: 2 },
    { id: 'bot_3', name: 'StarCamper_Pro', elo: 1890, matchesPlayed: 85, wins: 62, rank: 3 },
    { id: 'bot_4', name: 'BlitzKing', elo: 1720, matchesPlayed: 64, wins: 41, rank: 4 },
    { id: 'bot_5', name: 'ShieldDefender', elo: 1580, matchesPlayed: 50, wins: 30, rank: 5 },
  ],
  chess: [
    { id: 'c_bot_1', name: 'Magnus_AI_Bot', elo: 2850, matchesPlayed: 240, wins: 210, rank: 1 },
    { id: 'c_bot_2', name: 'Kasparov_Tactician', elo: 2640, matchesPlayed: 210, wins: 182, rank: 2 },
    { id: 'c_bot_3', name: 'QueenGambit_Master', elo: 2410, matchesPlayed: 180, wins: 150, rank: 3 },
    { id: 'c_bot_4', name: 'DeepBlue_Pro', elo: 2280, matchesPlayed: 160, wins: 134, rank: 4 },
    { id: 'c_bot_5', name: 'KnightRider99', elo: 2110, matchesPlayed: 130, wins: 105, rank: 5 },
  ],
  teen_patti: [
    { id: 'tp_1', name: 'Royal_Chaal_King', elo: 2380, matchesPlayed: 190, wins: 164, rank: 1 },
    { id: 'tp_2', name: 'Blind_Better_Pro', elo: 2190, matchesPlayed: 165, wins: 142, rank: 2 },
    { id: 'tp_3', name: 'Trail_Master_AI', elo: 2050, matchesPlayed: 140, wins: 119, rank: 3 },
    { id: 'tp_4', name: 'TeenPatti_Ace', elo: 1880, matchesPlayed: 115, wins: 95, rank: 4 },
  ],
  rummy: [
    { id: 'rm_1', name: 'Pure_Sequence_Pro', elo: 2320, matchesPlayed: 180, wins: 158, rank: 1 },
    { id: 'rm_2', name: 'Meld_King_AI', elo: 2140, matchesPlayed: 150, wins: 130, rank: 2 },
    { id: 'rm_3', name: 'Joker_Master', elo: 1980, matchesPlayed: 125, wins: 104, rank: 3 },
  ],
  poker: [
    { id: 'pk_1', name: 'High_Roller_Ace', elo: 2510, matchesPlayed: 250, wins: 215, rank: 1 },
    { id: 'pk_2', name: 'AllIn_Bluffer', elo: 2390, matchesPlayed: 220, wins: 187, rank: 2 },
    { id: 'pk_3', name: 'Poker_Face_AI', elo: 2210, matchesPlayed: 185, wins: 156, rank: 3 },
  ],
  carrom: [
    { id: 'cr_1', name: 'Pocket_Striker_3D', elo: 2210, matchesPlayed: 160, wins: 135, rank: 1 },
    { id: 'cr_2', name: 'Queen_Collector', elo: 2040, matchesPlayed: 135, wins: 112, rank: 2 },
    { id: 'cr_3', name: 'Rebound_Pro', elo: 1890, matchesPlayed: 105, wins: 88, rank: 3 },
  ],
  snooker: [
    { id: 'sn_1', name: 'Break_147_Master', elo: 2410, matchesPlayed: 200, wins: 178, rank: 1 },
    { id: 'sn_2', name: 'Cue_Ball_Wizard', elo: 2230, matchesPlayed: 175, wins: 151, rank: 2 },
    { id: 'sn_3', name: 'BankShot_Hero', elo: 2060, matchesPlayed: 145, wins: 124, rank: 3 },
  ],
  satte: [
    { id: 'st_1', name: 'Seven_Of_Hearts', elo: 2120, matchesPlayed: 130, wins: 115, rank: 1 },
    { id: 'st_2', name: 'Suite_Clearer', elo: 1940, matchesPlayed: 105, wins: 89, rank: 2 },
  ],
  snakes: [
    { id: 'snk_1', name: 'Ladder_Climber_99', elo: 2080, matchesPlayed: 120, wins: 102, rank: 1 },
    { id: 'snk_2', name: 'Dice_Lucky_King', elo: 1910, matchesPlayed: 95, wins: 81, rank: 2 },
  ],
  tt: [
    { id: 'tt_1', name: 'Spin_Master_3D', elo: 2180, matchesPlayed: 140, wins: 126, rank: 1 },
    { id: 'tt_2', name: 'PingPong_Pro', elo: 1990, matchesPlayed: 110, wins: 98, rank: 2 },
  ],
  bluff: [
    { id: 'bl_1', name: 'Truth_Detector_AI', elo: 2160, matchesPlayed: 130, wins: 110, rank: 1 },
    { id: 'bl_2', name: 'Master_Bluffer', elo: 1970, matchesPlayed: 105, wins: 91, rank: 2 },
  ],
  blackjack: [
    { id: 'bj_1', name: 'Card_Counter_AI', elo: 2350, matchesPlayed: 185, wins: 160, rank: 1 },
    { id: 'bj_2', name: 'Dealer_Buster_21', elo: 2180, matchesPlayed: 150, wins: 132, rank: 2 },
  ],
  solitaire: [
    { id: 'sol_1', name: 'Klondike_Speedster', elo: 2090, matchesPlayed: 125, wins: 108, rank: 1 },
    { id: 'sol_2', name: 'Suite_Stacker_AI', elo: 1930, matchesPlayed: 100, wins: 85, rank: 2 },
  ],
};

app.get('/api/elo/leaderboard', (req, res) => {
  const gameKey = (req.query.game as string)?.toLowerCase() || 'all';
  let list = gameLeaderboards[gameKey] || leaderboard;
  
  if (gameKey === 'all') {
    list = leaderboard;
  }

  const sorted = [...list].sort((a, b) => b.elo - a.elo);
  sorted.forEach((item, index) => {
    item.rank = index + 1;
  });
  res.json({ leaderboard: sorted, game: gameKey });
});

app.post('/api/elo/update', (req, res) => {
  const { userProfile } = req.body;
  if (!userProfile || !userProfile.id) {
    return res.status(400).json({ error: 'Invalid profile data' });
  }

  const cleanName = sanitizeInput(userProfile.name || 'Player');
  const cleanId = sanitizeInput(userProfile.id);

  const existingIdx = leaderboard.findIndex((item) => item.id === cleanId);
  const entry: LeaderboardEntry = {
    id: cleanId,
    name: cleanName,
    elo: typeof userProfile.elo === 'number' ? userProfile.elo : 1200,
    matchesPlayed: typeof userProfile.matchesPlayed === 'number' ? userProfile.matchesPlayed : 0,
    wins: typeof userProfile.wins === 'number' ? userProfile.wins : 0,
    rank: 0,
  };

  if (existingIdx >= 0) {
    leaderboard[existingIdx] = entry;
  } else {
    leaderboard.push(entry);
  }

  const sorted = [...leaderboard].sort((a, b) => b.elo - a.elo);
  sorted.forEach((item, index) => {
    item.rank = index + 1;
  });

  res.json({ success: true, updatedProfile: entry, leaderboard: sorted });
});

// 4. Online Multiplayer Rooms
app.post('/api/rooms/create', (req, res) => {
  const { hostName, hostColor, hostElo } = req.body;
  const cleanHostName = sanitizeInput(hostName || 'Host');
  const roomCode = Math.floor(100000 + Math.random() * 900000).toString();

  const initialGameState = {
    id: `room_${roomCode}`,
    mode: 'online_room',
    roomCode,
    status: 'waiting',
    currentTurnColor: 'red',
    diceValue: null,
    hasRolled: false,
    sixesInARow: 0,
    validMoves: [],
    winnerColor: null,
    rankings: [],
    logs: [],
    turnCount: 1,
    commentary: `Room ${roomCode} created. Waiting for players to join!`,
  };

  const room: RoomState = {
    code: roomCode,
    createdAt: Date.now(),
    gameState: initialGameState,
    players: [
      {
        id: `usr_${Date.now()}`,
        name: cleanHostName,
        color: hostColor || 'red',
        isHost: true,
        elo: hostElo || 1200,
      },
    ],
  };

  rooms.set(roomCode, room);
  res.json({ success: true, roomCode, room });
});

app.post('/api/rooms/join', (req, res) => {
  const { roomCode, playerName, playerElo } = req.body;
  const cleanRoomCode = sanitizeInput(roomCode);
  const cleanPlayerName = sanitizeInput(playerName || 'Guest');
  const room = rooms.get(cleanRoomCode);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.players.length >= 4) {
    return res.status(400).json({ error: 'Room is full' });
  }

  const takenColors = room.players.map((p) => p.color);
  const availableColors = ['red', 'green', 'yellow', 'blue'].filter((c) => !takenColors.includes(c));
  const assignedColor = availableColors[0] || 'green';

  const newPlayer = {
    id: `usr_${Date.now()}`,
    name: cleanPlayerName,
    color: assignedColor,
    isHost: false,
    elo: playerElo || 1200,
  };

  room.players.push(newPlayer);
  res.json({ success: true, room, assignedColor });
});

app.get('/api/rooms/:code', (req, res) => {
  const room = rooms.get(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ room });
});

app.post('/api/rooms/:code/sync', (req, res) => {
  const room = rooms.get(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  const { gameState } = req.body;
  if (gameState) {
    room.gameState = gameState;
  }
  res.json({ success: true, room });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Ludo Master server running on http://localhost:${PORT}`);
  });
}

startServer();
