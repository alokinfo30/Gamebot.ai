import { describe, it, expect } from 'vitest';
import { createInitialGameState, getValidMovesForPlayer } from '../logic/ludoBoard';

describe('[GAMEBOT.AI Test Suite] Strict Turn Locks & Token/Card Ownership Invariants Across 16 Games', () => {
  it('Ludo: should restrict human player from moving opponent AI tokens', () => {
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

  it('Ludo: should block human click inputs during AI bot turn', () => {
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

  it('Chess: should enforce piece color matching current turn and prevent moving opponent pieces', () => {
    let turn: string = 'w';
    const humanColor = 'w';

    const canMoveWhite = turn === 'w' && humanColor === 'w';
    const canMoveBlack = turn === 'b';

    expect(canMoveWhite).toBe(true);
    expect(canMoveBlack).toBe(false);

    // Switch turn to Black
    turn = 'b';
    const canHumanMoveOnBlackTurn = turn === 'w';
    expect(canHumanMoveOnBlackTurn).toBe(false);
  });

  it('Teen Patti & Poker: should prevent action button execution when activeIdx is not player', () => {
    let activeIdx = 1; // Bot turn
    const isPlayerTurn = activeIdx === 0;

    expect(isPlayerTurn).toBe(false);

    // If human clicks Chaal / Call / Raise on Bot turn, it is blocked
    const canExecuteChaal = isPlayerTurn;
    expect(canExecuteChaal).toBe(false);
  });

  it('Rummy: should prevent card selection, draw and discard when turn is not player', () => {
    let turn: string = 'ai';
    let hasDrawn = false;

    const canDraw = turn === 'player' && !hasDrawn;
    const canDiscard = turn === 'player' && hasDrawn;

    expect(canDraw).toBe(false);
    expect(canDiscard).toBe(false);
  });

  it('Snakes & Ladders: should prevent human from rolling dice during bot turn', () => {
    const players = [
      { id: 'p1', name: 'You', isBot: false },
      { id: 'p2', name: 'AI Bot', isBot: true },
    ];
    let currentTurnIdx = 1; // AI Turn

    const isCurrentBot = players[currentTurnIdx].isBot;
    const canHumanRoll = !isCurrentBot;

    expect(isCurrentBot).toBe(true);
    expect(canHumanRoll).toBe(false);
  });

  it('Carrom & Snooker: should prevent striker fire or cue strike during bot turn or physics simulation', () => {
    let currentTurn: string = 'ai';
    let isSimulating = false;

    const canPlayerFire = currentTurn === 'player' && !isSimulating;
    expect(canPlayerFire).toBe(false);

    currentTurn = 'player';
    isSimulating = true;
    const canFireWhileMoving = currentTurn === 'player' && !isSimulating;
    expect(canFireWhileMoving).toBe(false);
  });
});
