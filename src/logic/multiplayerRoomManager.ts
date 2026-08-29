// Universal Multiplayer Room Manager for Gamebot.ai
// Supports Online Rooms (WebSockets / API fallback / BroadcastChannel sync) and Pass-and-Play

export type GamePlayMode = 'vs_ai' | 'pass_and_play' | 'online' | 'spectate';

export interface SpectatableMatch {
  id: string;
  gameKey: string;
  gameTitle: string;
  category: 'board' | 'card' | 'sports';
  player1: { name: string; elo: number; avatar: string; color?: string };
  player2: { name: string; elo: number; avatar: string; color?: string };
  spectatorsCount: number;
  status: 'live' | 'match_point' | 'final_turn';
  turnText: string;
  scoreText: string;
  ruleHighlight: string;
  tacticalTip: string;
  keyRules: string[];
}

export interface GameRuleLesson {
  gameKey: string;
  title: string;
  objective: string;
  turnRules: string[];
  proTips: string[];
  winningRule: string;
}

export const LIVE_SPECTATABLE_MATCHES: SpectatableMatch[] = [
  {
    id: 'live_ludo_01',
    gameKey: 'ludo',
    gameTitle: 'Ludo Championship Arena',
    category: 'board',
    player1: { name: 'Grandmaster AI', elo: 2250, avatar: '🤖', color: 'red' },
    player2: { name: 'Ludo_Wizard_99', elo: 2040, avatar: '🧙‍♂️', color: 'green' },
    spectatorsCount: 64,
    status: 'live',
    turnText: 'Turn 18 • Red Token 1 on Star Safe Cell',
    scoreText: 'Red 3 In Home • Green 2 In Home',
    ruleHighlight: 'Safe Star Rule: Tokens landed on star marked cells cannot be captured by opponent pawns.',
    tacticalTip: 'Grandmaster AI is parking on Star cells to bait Green into advancing past the home runway entry point.',
    keyRules: [
      'Roll a 6 to release token from base onto the starting tile.',
      'Rolling a 6 or capturing an opponent token awards 1 bonus roll.',
      'Landing on star-marked safe cells protects tokens from capture.',
      'All 4 tokens must reach the central Home triangle to win.',
    ],
  },
  {
    id: 'live_chess_01',
    gameKey: 'chess',
    gameTitle: 'Master Grandmaster Chess',
    category: 'board',
    player1: { name: 'Magnus_AI_Bot', elo: 2850, avatar: '👑', color: 'White' },
    player2: { name: 'DeepBlue_Pro', elo: 2280, avatar: '🤖', color: 'Black' },
    spectatorsCount: 112,
    status: 'live',
    turnText: 'Move 24 • Queen & Rook Battery on d-file',
    scoreText: '+1.8 White Evaluation Advantage',
    ruleHighlight: 'Castling & Central Control: King safety secured with O-O kingside castling.',
    tacticalTip: 'White is leveraging knight outposts on d5 to restrict Black bishop mobility.',
    keyRules: [
      'Knights move in L-shapes and can jump over other pieces.',
      'Checkmate occurs when King is under attack with no legal escape.',
      'Pawns promote to Queen, Rook, Bishop, or Knight upon reaching the 8th rank.',
      'Castling requires King and Rook having never moved and no pieces between.',
    ],
  },
  {
    id: 'live_teenpatti_01',
    gameKey: 'teen_patti',
    gameTitle: 'Royal High-Stakes Teen Patti',
    category: 'card',
    player1: { name: 'Royal_Chaal_King', elo: 2380, avatar: '🃏', color: 'Chaal' },
    player2: { name: 'Blind_Better_Pro', elo: 2190, avatar: '😎', color: 'Blind' },
    spectatorsCount: 48,
    status: 'live',
    turnText: 'Round 4 • Chaal 80 Chips vs Blind 40 Chips',
    scoreText: 'Pot: 1,840 Chips',
    ruleHighlight: 'Hand Rankings: Trail (Trio) > Pure Sequence > Sequence > Color (Flush) > Pair > High Card.',
    tacticalTip: 'Royal Chaal King is sizing Chaal bets to pressure blind player into revealing hand.',
    keyRules: [
      'Players are dealt 3 cards each face down.',
      'Blind players bet half the Chaal amount without seeing their cards.',
      'Trail (Three of a kind, e.g. A-A-A) is the highest ranking hand.',
      'Showdown occurs when only 2 players remain and one requests Show.',
    ],
  },
  {
    id: 'live_rummy_01',
    gameKey: 'rummy',
    gameTitle: 'Indian Rummy Masterclass',
    category: 'card',
    player1: { name: 'Pure_Sequence_Pro', elo: 2320, avatar: '🎴' },
    player2: { name: 'Meld_King_AI', elo: 2140, avatar: '💎' },
    spectatorsCount: 52,
    status: 'live',
    turnText: 'Turn 7 • First Life Pure Sequence Formed (7♠ 8♠ 9♠)',
    scoreText: 'Card Melds: 1 Pure Seq + 1 Impure Seq',
    ruleHighlight: 'Mandatory Rule: At least ONE Pure Sequence (without Joker) is strictly required to declare.',
    tacticalTip: 'Discarding high-value unmatched face cards early to minimize penalty points.',
    keyRules: [
      '13 cards dealt to each player with open and closed draw piles.',
      'At least one Pure Sequence (3+ consecutive cards of same suit, no Joker) is mandatory.',
      'Remaining cards must form valid sets or impure sequences with Jokers.',
      'Valid declaration gives 0 points penalty to winner.',
    ],
  },
  {
    id: 'live_poker_01',
    gameKey: 'poker',
    gameTitle: "Texas Hold'em Pro High Roller",
    category: 'card',
    player1: { name: 'High_Roller_Ace', elo: 2510, avatar: '🤠' },
    player2: { name: 'AllIn_Bluffer', elo: 2390, avatar: '🕶️' },
    spectatorsCount: 89,
    status: 'live',
    turnText: 'Turn Card Dealt: A♠ K♥ 10♦ 7♠',
    scoreText: 'Pot: $4,200 (Blinds $50/$100)',
    ruleHighlight: '5-Card Best Hand: Best combination of 2 hole cards + 5 community cards determines winner.',
    tacticalTip: 'High Roller Ace is checking turn to induce a river bluff from AllIn Bluffer.',
    keyRules: [
      'Players receive 2 private hole cards; 5 community cards revealed in Flop, Turn, River.',
      'Hand Hierarchy: Royal Flush > Straight Flush > 4-of-a-Kind > Full House > Flush > Straight.',
      'Betting rounds: Pre-flop, Flop (3 cards), Turn (1 card), River (1 card).',
      'Players can Check, Call, Raise, or Fold.',
    ],
  },
  {
    id: 'live_carrom_01',
    gameKey: 'carrom',
    gameTitle: '3D Carrom Board Striker Arena',
    category: 'sports',
    player1: { name: 'Pocket_Striker_3D', elo: 2210, avatar: '🎯' },
    player2: { name: 'Queen_Collector', elo: 2040, avatar: '👑' },
    spectatorsCount: 38,
    status: 'live',
    turnText: 'Red Queen Pocketed • Cover Shot In Progress',
    scoreText: 'White: 4 Carrom Men • Black: 3 Carrom Men',
    ruleHighlight: 'Queen Cover Rule: Pocketing the Red Queen requires immediately pocketing a cover piece in the next strike.',
    tacticalTip: 'Pocket Striker uses corner cushion rebounds to align cover shot into bottom right pocket.',
    keyRules: [
      'Striker must touch both base lines before being flicked.',
      'Pocketing own color piece awards another continuous strike.',
      'Red Queen is worth 3 bonus points and must be covered immediately.',
      'First player to pocket all own pieces with Queen wins the board.',
    ],
  },
  {
    id: 'live_snooker_01',
    gameKey: 'snooker',
    gameTitle: '3D Snooker Championship 147 Break',
    category: 'sports',
    player1: { name: 'Break_147_Master', elo: 2410, avatar: '🎱' },
    player2: { name: 'Cue_Ball_Wizard', elo: 2230, avatar: '🪄' },
    spectatorsCount: 76,
    status: 'live',
    turnText: 'Break of 52 • Red -> Black -> Red Sequence',
    scoreText: 'Frame Score: 64 - 12',
    ruleHighlight: 'Alternating Pot Rule: A Red ball must be potted before shooting at any color ball (worth 2 to 7 pts).',
    tacticalTip: 'Screwing back cue ball with bottom spin to land perfectly behind the black spot.',
    keyRules: [
      'Must pot a 1-point Red ball before attempting any colored ball.',
      'Colored balls are respotted on their marked spots until all 15 Reds are cleared.',
      'Points: Red (1), Yellow (2), Green (3), Brown (4), Blue (5), Pink (6), Black (7).',
      'Fouls award 4 to 7 penalty points to the opposing player.',
    ],
  },
  {
    id: 'live_snakes_01',
    gameKey: 'snakes',
    gameTitle: 'Snakes and Ladders Speed Race',
    category: 'board',
    player1: { name: 'Ladder_Climber_99', elo: 2080, avatar: '🪜' },
    player2: { name: 'Dice_Lucky_King', elo: 1910, avatar: '🎲' },
    spectatorsCount: 29,
    status: 'live',
    turnText: 'Turn 12 • Player on Tile 84 (Near Tile 98 Snake Danger)',
    scoreText: 'Positions: Tile 84 vs Tile 71',
    ruleHighlight: 'Ladder & Snake Mechanics: Ladders advance you up; Snake heads drop you down to the tail tile.',
    tacticalTip: 'Needs exact roll of 16 steps or roll of 6 to climb ladder on tile 90.',
    keyRules: [
      'Roll dice from 1 to 6 to advance your colored pawn along the grid 1-100.',
      'Landing at the base of a ladder instantly ascends you to the top tile.',
      'Landing on a snake head slides you back down to the tail tile.',
      'Must roll exact dice count to land on tile 100 and claim victory.',
    ],
  },
];

export const getLiveSpectatableMatches = (gameKey?: string): SpectatableMatch[] => {
  if (!gameKey || gameKey === 'all' || gameKey === 'home') {
    return LIVE_SPECTATABLE_MATCHES;
  }
  const filtered = LIVE_SPECTATABLE_MATCHES.filter((m) => m.gameKey === gameKey);
  return filtered.length > 0 ? filtered : LIVE_SPECTATABLE_MATCHES;
};

export const getGameRuleLesson = (gameKey: string): GameRuleLesson => {
  const match = LIVE_SPECTATABLE_MATCHES.find((m) => m.gameKey === gameKey);
  if (match) {
    return {
      gameKey: match.gameKey,
      title: match.gameTitle,
      objective: match.ruleHighlight,
      turnRules: match.keyRules,
      proTips: [match.tacticalTip, 'Study AI movements to master spatial board control.'],
      winningRule: match.keyRules[match.keyRules.length - 1] || 'Achieve highest score/objective.',
    };
  }
  return {
    gameKey,
    title: `${gameKey.toUpperCase()} Game Rules`,
    objective: 'Outplay opponent with tactical decision making and calculated risk.',
    turnRules: [
      'Take turns in clockwise order.',
      'Follow game-specific piece or card movements.',
      'Leverage special actions and defensive positioning.',
    ],
    proTips: ['Think 2-3 moves ahead.', 'Anticipate opponent counters.'],
    winningRule: 'Complete primary win condition first.',
  };
};

export interface MultiplayerRoom {
  code: string;
  gameKey: string;
  hostName: string;
  hostElo: number;
  players: {
    id: string;
    name: string;
    elo: number;
    colorSeat: string;
    isReady: boolean;
    isHost: boolean;
  }[];
  maxPlayers: number;
  status: 'waiting' | 'in_progress' | 'finished';
  createdAt: number;
  lastState?: any;
}

const STORAGE_PREFIX = 'gamebot_room_';

// BroadcastChannel for instant cross-tab sync in modern browsers
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('gamebot_multiplayer_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not available, falling back to localStorage events');
}

export const generateRoomCode = (gameKey: string): string => {
  const prefixMap: Record<string, string> = {
    ludo: 'LUDO',
    chess: 'CHESS',
    teen_patti: 'PATTI',
    rummy: 'RUMMY',
    satte: 'SATTE',
    coat_piece: 'COAT',
    bhabhi: 'BHABHI',
    poker: 'POKER',
    blackjack: 'JACK',
    solitaire: 'SOLI',
    donkey: 'DONK',
    bluff: 'BLUFF',
    snakes: 'SNAKE',
    carrom: 'CARR',
    snooker: 'SNOOK',
    tt: 'PONG',
  };
  const prefix = prefixMap[gameKey] || 'GAME';
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${num}`;
};

export const createMultiplayerRoom = (
  gameKey: string,
  hostName: string,
  hostElo: number = 1200,
  maxPlayers: number = 2
): MultiplayerRoom => {
  const code = generateRoomCode(gameKey);
  const room: MultiplayerRoom = {
    code,
    gameKey,
    hostName,
    hostElo,
    players: [
      {
        id: `player_${Date.now()}_1`,
        name: hostName,
        elo: hostElo,
        colorSeat: 'player1',
        isReady: true,
        isHost: true,
      },
    ],
    maxPlayers,
    status: 'waiting',
    createdAt: Date.now(),
  };

  saveRoomToStorage(room);
  broadcastRoomEvent(room.code, 'room_created', room);
  return room;
};

export const joinMultiplayerRoom = (
  code: string,
  playerName: string,
  playerElo: number = 1200
): { success: boolean; room?: MultiplayerRoom; assignedSeat?: string; error?: string } => {
  const cleanCode = code.trim().toUpperCase();
  const room = getRoomFromStorage(cleanCode);

  if (!room) {
    return { success: false, error: 'Room code not found. Please check code or create a new room.' };
  }

  if (room.players.length >= room.maxPlayers) {
    return { success: false, error: 'Room is full.' };
  }

  const seatIndex = room.players.length + 1;
  const assignedSeat = `player${seatIndex}`;

  const newPlayer = {
    id: `player_${Date.now()}_${seatIndex}`,
    name: playerName,
    elo: playerElo,
    colorSeat: assignedSeat,
    isReady: true,
    isHost: false,
  };

  room.players.push(newPlayer);
  if (room.players.length === room.maxPlayers) {
    room.status = 'in_progress';
  }

  saveRoomToStorage(room);
  broadcastRoomEvent(room.code, 'player_joined', room);

  return { success: true, room, assignedSeat };
};

export const broadcastGameState = (code: string, gameState: any) => {
  const room = getRoomFromStorage(code);
  if (room) {
    room.lastState = gameState;
    saveRoomToStorage(room);
  }
  broadcastRoomEvent(code, 'state_update', gameState);
};

export const subscribeRoomEvents = (
  roomCode: string,
  onUpdate: (event: { type: string; payload: any }) => void
) => {
  const handler = (e: MessageEvent) => {
    if (e.data && e.data.roomCode === roomCode.trim().toUpperCase()) {
      onUpdate(e.data);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handler);
  }

  const storageHandler = (e: StorageEvent) => {
    if (e.key === `${STORAGE_PREFIX}${roomCode.trim().toUpperCase()}` && e.newValue) {
      try {
        const room = JSON.parse(e.newValue);
        onUpdate({ type: 'room_updated', payload: room });
      } catch (err) {}
    }
  };

  window.addEventListener('storage', storageHandler);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handler);
    }
    window.removeEventListener('storage', storageHandler);
  };
};

const getStorage = () => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
};

const memoryStore: Record<string, string> = {};

const saveRoomToStorage = (room: MultiplayerRoom) => {
  try {
    const storage = getStorage();
    const val = JSON.stringify(room);
    if (storage) {
      storage.setItem(`${STORAGE_PREFIX}${room.code}`, val);
    } else {
      memoryStore[`${STORAGE_PREFIX}${room.code}`] = val;
    }
  } catch (e) {}
};

export const getRoomFromStorage = (code: string): MultiplayerRoom | null => {
  try {
    const storage = getStorage();
    const raw = storage ? storage.getItem(`${STORAGE_PREFIX}${code.trim().toUpperCase()}`) : memoryStore[`${STORAGE_PREFIX}${code.trim().toUpperCase()}`];
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const broadcastRoomEvent = (roomCode: string, type: string, payload: any) => {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ roomCode, type, payload });
  }
};
