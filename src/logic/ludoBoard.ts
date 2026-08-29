import { PlayerColor, TokenState, Player, GameState, MoveLog } from '../types/ludo';

// Absolute circuit coordinates on a 15x15 grid [row, col]
export const MAIN_CIRCUIT_PATH: [number, number][] = [
  [6, 1],   // 0: Red Start (Safe)
  [6, 2],   // 1
  [6, 3],   // 2
  [6, 4],   // 3
  [6, 5],   // 4
  [5, 6],   // 5
  [4, 6],   // 6
  [3, 6],   // 7
  [2, 6],   // 8 (Star Safe)
  [1, 6],   // 9
  [0, 6],   // 10
  [0, 7],   // 11
  [0, 8],   // 12
  [1, 8],   // 13: Green Start (Safe)
  [2, 8],   // 14
  [3, 8],   // 15
  [4, 8],   // 16
  [5, 8],   // 17
  [6, 9],   // 18
  [6, 10],  // 19
  [6, 11],  // 20
  [6, 12],  // 21 (Star Safe)
  [6, 13],  // 22
  [6, 14],  // 23
  [7, 14],  // 24
  [8, 14],  // 25
  [8, 13],  // 26: Yellow Start (Safe)
  [8, 12],  // 27
  [8, 11],  // 28
  [8, 10],  // 29
  [8, 9],   // 30
  [9, 8],   // 31
  [10, 8],  // 32
  [11, 8],  // 33
  [12, 8],  // 34 (Star Safe)
  [13, 8],  // 35
  [14, 8],  // 36
  [14, 7],  // 37
  [14, 6],  // 38
  [13, 6],  // 39: Blue Start (Safe)
  [12, 6],  // 40
  [11, 6],  // 41
  [10, 6],  // 42
  [9, 6],   // 43
  [8, 5],   // 44
  [8, 4],   // 45
  [8, 3],   // 46
  [8, 2],   // 47 (Star Safe)
  [8, 1],   // 48
  [8, 0],   // 49
  [7, 0],   // 50
  [6, 0],   // 51
];

// Colored Home Runway paths (Steps 52 to 57)
export const HOME_RUNWAY_PATHS: Record<PlayerColor, [number, number][]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

// Base Yard Token Coordinates (row, col) for 4 tokens per color
export const BASE_YARD_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [
    [1.5, 1.5],
    [1.5, 3.5],
    [3.5, 1.5],
    [3.5, 3.5],
  ],
  green: [
    [1.5, 10.5],
    [1.5, 12.5],
    [3.5, 10.5],
    [3.5, 12.5],
  ],
  yellow: [
    [10.5, 10.5],
    [10.5, 12.5],
    [12.5, 10.5],
    [12.5, 12.5],
  ],
  blue: [
    [10.5, 1.5],
    [10.5, 3.5],
    [12.5, 1.5],
    [12.5, 3.5],
  ],
};

// Start step index on MAIN_CIRCUIT_PATH relative to Red (0)
export const COLOR_START_OFFSET: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Absolute circuit indices that are Safe Cells (Star cells + Starts)
export const SAFE_CIRCUIT_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

/**
 * Converts a player's relative step (-1 to 58) into 15x15 board coordinates [row, col]
 */
export function getTokenBoardCoordinate(
  color: PlayerColor,
  step: number,
  tokenId: number
): [number, number] {
  if (step === -1) {
    // Inside Base Yard
    return BASE_YARD_COORDS[color][tokenId];
  }

  if (step >= 0 && step <= 50) {
    // On Main Circuit Path
    const absoluteCircuitIndex = (COLOR_START_OFFSET[color] + step) % 52;
    return MAIN_CIRCUIT_PATH[absoluteCircuitIndex];
  }

  if (step === 51) {
    // Final step on main circuit before turning into home runway
    const absoluteCircuitIndex = (COLOR_START_OFFSET[color] + 51) % 52;
    return MAIN_CIRCUIT_PATH[absoluteCircuitIndex];
  }

  if (step >= 52 && step <= 57) {
    // Inside Home Runway (Steps 52..57)
    const runwayIndex = step - 52;
    return HOME_RUNWAY_PATHS[color][runwayIndex];
  }

  if (step >= 58) {
    // Completed in Center Triangle
    const centerCoords: Record<PlayerColor, [number, number]> = {
      red: [7, 6.2],
      green: [6.2, 7],
      yellow: [7, 7.8],
      blue: [7.8, 7],
    };
    return centerCoords[color];
  }

  return [7, 7];
}

/**
 * Returns the absolute circuit step (0..51) for a token if it is on the main circuit.
 * Returns -1 if the token is in base yard or inside home runway/finished.
 */
export function getAbsoluteCircuitStep(color: PlayerColor, step: number): number {
  if (step >= 0 && step <= 51) {
    return (COLOR_START_OFFSET[color] + step) % 52;
  }
  return -1;
}

/**
 * Checks if an absolute circuit step is a safe cell
 */
export function isSafeAbsoluteStep(absoluteStep: number): boolean {
  return SAFE_CIRCUIT_INDICES.includes(absoluteStep);
}

/**
 * Evaluates whether a specific token can move given a dice roll value
 */
export function canTokenMove(token: TokenState, dice: number): boolean {
  if (token.isHome || token.step >= 58) return false;

  if (token.step === -1) {
    // Must roll a 6 to exit Base Yard
    return dice === 6;
  }

  const targetStep = token.step + dice;
  // Cannot exceed step 58 (exact roll required to enter Home)
  return targetStep <= 58;
}

/**
 * Returns all valid moves for a player given their current tokens and dice roll
 */
export function getValidMovesForPlayer(
  player: Player,
  dice: number
): { tokenId: number; targetStep: number }[] {
  const moves: { tokenId: number; targetStep: number }[] = [];

  for (const token of player.tokens) {
    if (canTokenMove(token, dice)) {
      const targetStep = token.step === -1 ? 0 : token.step + dice;
      moves.push({ tokenId: token.id, targetStep });
    }
  }

  return moves;
}

/**
 * Checks if a player has any valid moves with a roll
 */
export function hasValidMoves(player: Player, dice: number): boolean {
  return getValidMovesForPlayer(player, dice).length > 0;
}

/**
 * Creates initial 4 players with default tokens
 */
export function createInitialPlayers(
  mode: 'offline_bot' | 'local_pass' | 'online_room',
  humanColor: PlayerColor = 'red',
  botDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive' = 'adaptive'
): Player[] {
  const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

  return colors.map((color) => {
    let type: 'human' | 'bot' | 'network' = 'human';
    let name = '';

    if (mode === 'offline_bot') {
      if (color === humanColor) {
        type = 'human';
        name = 'Player (You)';
      } else {
        type = 'bot';
        const botNames: Record<PlayerColor, string> = {
          red: 'Red Raider AI',
          green: 'Green Sentinel AI',
          yellow: 'Yellow Flash AI',
          blue: 'Blue Titan AI',
        };
        name = botNames[color];
      }
    } else if (mode === 'local_pass') {
      type = 'human';
      const colorNames: Record<PlayerColor, string> = {
        red: 'Player 1 (Red)',
        green: 'Player 2 (Green)',
        yellow: 'Player 3 (Yellow)',
        blue: 'Player 4 (Blue)',
      };
      name = colorNames[color];
    } else {
      // online
      type = color === humanColor ? 'human' : 'network';
      name = color === humanColor ? 'You' : `Player ${color.toUpperCase()}`;
    }

    const tokens: TokenState[] = [0, 1, 2, 3].map((id) => ({
      id,
      color,
      step: -1,
      isHome: false,
      isBase: true,
    }));

    return {
      id: `player_${color}`,
      name,
      color,
      type,
      elo: 1200,
      tokens,
      botDifficulty,
      botPersonality: color === 'green' ? 'blitz' : color === 'yellow' ? 'shield' : 'grandmaster',
      isReady: true,
      connected: true,
    };
  });
}

/**
 * Creates initial game state
 */
export function createInitialGameState(
  mode: 'offline_bot' | 'local_pass' | 'online_room' = 'offline_bot',
  humanColor: PlayerColor = 'red',
  botDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive' = 'adaptive'
): GameState {
  const players = createInitialPlayers(mode, humanColor, botDifficulty);
  return {
    id: `game_${Date.now()}`,
    mode,
    players,
    currentTurnColor: 'red',
    diceValue: null,
    hasRolled: false,
    sixesInARow: 0,
    validMoves: [],
    status: 'playing',
    winnerColor: null,
    rankings: [],
    logs: [],
    commentary: 'Match started! Red rolls first.',
    turnCount: 1,
    lastActionTime: Date.now(),
  };
}

/**
 * Returns the next active player color in order: Red -> Green -> Yellow -> Blue
 */
export function getNextTurnColor(
  currentColor: PlayerColor,
  players: Player[],
  rankings: PlayerColor[]
): PlayerColor {
  const order: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
  let idx = order.indexOf(currentColor);

  for (let i = 1; i <= 4; i++) {
    const nextColor = order[(idx + i) % 4];
    // Skip players who have already completed all tokens (in rankings)
    if (!rankings.includes(nextColor)) {
      return nextColor;
    }
  }

  return currentColor;
}

/**
 * Checks if a player has finished all 4 tokens
 */
export function isPlayerFinished(player: Player): boolean {
  return player.tokens.every((t) => t.isHome || t.step >= 58);
}
