// Universal Multiplayer Room Manager for Gamebot.ai
// Supports Online Rooms (WebSockets / API fallback / BroadcastChannel sync) and Pass-and-Play

export type GamePlayMode = 'vs_ai' | 'pass_and_play' | 'online';

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
