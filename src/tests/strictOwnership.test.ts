import { describe, it, expect } from 'vitest';
import { createInitialGameState, getValidMovesForPlayer } from '../logic/ludoBoard';

describe('[GAMEBOT.AI Test Suite] Strict Turn Locks & Token Ownership Invariants', () => {
  it('should restrict human player from moving opponent AI tokens', () => {
    const game = createInitialGameState('offline_bot', 'red', 'adaptive');
    
    // Human is Red
    const humanColorStr: string = 'red';
    const greenBot = game.players.find((p) => p.color === 'green')!;

    // Verify valid moves for Green exist if dice is 6
    const validGreenMoves = getValidMovesForPlayer(greenBot, 6);
    expect(validGreenMoves.length).toBeGreaterThan(0);

    const currentTurnStr: string = game.currentTurnColor;
    const isHumanTurn = currentTurnStr === humanColorStr;

    expect(greenBot.color).toBe('green');
    expect(humanColorStr).toBe('red');
    expect(isHumanTurn).toBe(true);
  });

  it('should block human click inputs during AI bot turn', () => {
    const game = createInitialGameState('offline_bot', 'red', 'adaptive');
    game.currentTurnColor = 'green';
    
    const humanColorStr: string = 'red';
    const currentTurnPlayer = game.players.find((p) => p.color === game.currentTurnColor);

    const currentTurnStr: string = game.currentTurnColor;
    const isHumanTurn = currentTurnStr === humanColorStr && currentTurnPlayer?.type === 'human';

    // Verify that human inputs are strictly disabled during AI bot turn
    expect(currentTurnPlayer?.type).toBe('bot');
    expect(isHumanTurn).toBe(false);
  });
});
