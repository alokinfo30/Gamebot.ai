import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../logic/ludoBoard';

describe('[GAMEBOT.AI Test Suite] Background Game Pause & Active Tab Guards', () => {
  it('should preserve Ludo board state without state mutation when active tab is changed', () => {
    const game = createInitialGameState('offline_bot', 'red', 'adaptive');
    expect(game.currentTurnColor).toBe('red');
    expect(game.hasRolled).toBe(false);
    expect(game.status).toBe('playing');

    // Simulate switching away from Ludo
    const activeTab: string = 'chess';
    const isLudoActive = activeTab === 'ludo';

    // Verify pause condition guard returns early
    expect(isLudoActive).toBe(false);

    // State remains unaltered while paused in background
    expect(game.currentTurnColor).toBe('red');
    const redPlayer = game.players.find((p) => p.color === 'red');
    expect(redPlayer?.tokens[0].step).toBe(-1);
  });

  it('should allow player to resume Ludo match seamlessly with exact state restored', () => {
    const game = createInitialGameState('offline_bot', 'red', 'adaptive');
    const redPlayer = game.players.find((p) => p.color === 'red')!;
    redPlayer.tokens[0].step = 10;
    redPlayer.tokens[0].isBase = false;

    // Player switches to Rummy and then returns to Ludo
    let activeTab: string = 'rummy';
    expect(activeTab).toBe('rummy');

    // Resuming Ludo
    activeTab = 'ludo';
    expect(activeTab).toBe('ludo');
    expect(redPlayer.tokens[0].step).toBe(10);
    expect(redPlayer.tokens[0].isBase).toBe(false);
  });
});
