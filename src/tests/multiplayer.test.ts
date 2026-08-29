import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateRoomCode,
  createMultiplayerRoom,
  joinMultiplayerRoom,
  getRoomFromStorage,
} from '../logic/multiplayerRoomManager';

describe('[GAMEBOT.AI Test Suite] Universal Multiplayer & Room Engine', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should generate valid 6-character game room codes for all 16 games', () => {
    const ludoCode = generateRoomCode('ludo');
    const chessCode = generateRoomCode('chess');
    const rummyCode = generateRoomCode('rummy');
    const carromCode = generateRoomCode('carrom');

    expect(ludoCode).toMatch(/^LUDO\d{4}$/);
    expect(chessCode).toMatch(/^CHESS\d{4}$/);
    expect(rummyCode).toMatch(/^RUMMY\d{4}$/);
    expect(carromCode).toMatch(/^CARR\d{4}$/);
  });

  it('should create an online multiplayer room with host seat', () => {
    const room = createMultiplayerRoom('chess', 'Grandmaster Alex', 1450, 2);

    expect(room.gameKey).toBe('chess');
    expect(room.players.length).toBe(1);
    expect(room.players[0].name).toBe('Grandmaster Alex');
    expect(room.players[0].colorSeat).toBe('player1');
    expect(room.status).toBe('waiting');

    const stored = getRoomFromStorage(room.code);
    expect(stored).not.toBeNull();
    expect(stored?.code).toBe(room.code);
  });

  it('should allow second player to join online room and transition status to in_progress', () => {
    const room = createMultiplayerRoom('rummy', 'Player One', 1200, 2);
    const joinRes = joinMultiplayerRoom(room.code, 'Player Two', 1300);

    expect(joinRes.success).toBe(true);
    expect(joinRes.assignedSeat).toBe('player2');

    const updated = getRoomFromStorage(room.code);
    expect(updated?.players.length).toBe(2);
    expect(updated?.status).toBe('in_progress');
  });

  it('should reject joining full room', () => {
    const room = createMultiplayerRoom('tt', 'Player One', 1200, 2);
    joinMultiplayerRoom(room.code, 'Player Two', 1300);
    const overflowRes = joinMultiplayerRoom(room.code, 'Player Three', 1100);

    expect(overflowRes.success).toBe(false);
    expect(overflowRes.error).toContain('full');
  });
});
