export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
export type PlayerType = 'human' | 'bot' | 'network';
export type BotDifficulty = 'easy' | 'medium' | 'hard' | 'adaptive';
export type BotPersonality = 'blitz' | 'shield' | 'grandmaster' | 'easy';

export interface TokenState {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1: Base yard, 0..51: Main circuit, 52..57: Colored Home Track, 58: Completed Home
  isHome: boolean;
  isBase: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  type: PlayerType;
  elo: number;
  tokens: TokenState[];
  botDifficulty?: BotDifficulty;
  botPersonality?: BotPersonality;
  isReady?: boolean;
  connected?: boolean;
  rank?: number; // 1st, 2nd, 3rd, 4th
}

export interface MoveLog {
  turnNumber: number;
  color: PlayerColor;
  playerName: string;
  dice: number;
  action: 'roll_six' | 'exit_base' | 'move' | 'capture' | 'enter_home' | 'pass' | 'three_sixes_forfeit';
  tokenId: number;
  fromStep: number;
  toStep: number;
  capturedColor?: PlayerColor;
  timestamp: number;
}

export interface GameState {
  id: string;
  mode: 'offline_bot' | 'local_pass' | 'online_room';
  roomCode?: string;
  players: Player[];
  currentTurnColor: PlayerColor;
  diceValue: number | null;
  hasRolled: boolean;
  sixesInARow: number;
  validMoves: { tokenId: number; targetStep: number }[];
  status: 'waiting' | 'playing' | 'finished';
  winnerColor: PlayerColor | null;
  rankings: PlayerColor[];
  logs: MoveLog[];
  commentary: string | null;
  turnCount: number;
  lastActionTime: number;
}

export interface GameAnalysis {
  summary: string;
  overallPerformance: string;
  championTitle: string;
  playerRatings: Record<string, {
    aggressiveness: number;
    tacticalEfficiency: number;
    riskManagement: number;
    blunderCount: number;
    mvpToken: number;
    tips: string[];
  }>;
  keyTurns: {
    turnNumber: number;
    color: PlayerColor;
    description: string;
    impact: 'positive' | 'blunder' | 'game_changer';
  }[];
}

export type GestureType = 'open_hand' | 'one_finger' | 'two_fingers' | 'three_fingers' | 'four_fingers' | 'fist' | 'none';

export interface UserProfile {
  id: string;
  name: string;
  elo: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  captures: number;
  tokensHome: number;
}
