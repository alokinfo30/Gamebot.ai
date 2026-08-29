import { describe, it, expect } from 'vitest';
import {
  getLiveSpectatableMatches,
  getGameRuleLesson,
  LIVE_SPECTATABLE_MATCHES,
  SpectatableMatch,
  GamePlayMode,
} from '../logic/multiplayerRoomManager';

describe('Live Spectator & Rule Learning Framework', () => {
  it('should have active live spectatable matches available for online watchers', () => {
    const matches = getLiveSpectatableMatches();
    expect(matches.length).toBeGreaterThanOrEqual(8);

    matches.forEach((m) => {
      expect(m.id).toBeDefined();
      expect(m.gameKey).toBeDefined();
      expect(m.gameTitle).toBeDefined();
      expect(m.player1.name).toBeDefined();
      expect(m.player2.name).toBeDefined();
      expect(m.spectatorsCount).toBeGreaterThan(0);
      expect(m.ruleHighlight).toBeDefined();
      expect(m.keyRules.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('should filter live matches correctly by game key', () => {
    const ludoMatches = getLiveSpectatableMatches('ludo');
    expect(ludoMatches.length).toBeGreaterThanOrEqual(1);
    expect(ludoMatches[0].gameKey).toBe('ludo');
    expect(ludoMatches[0].ruleHighlight).toContain('Star');

    const chessMatches = getLiveSpectatableMatches('chess');
    expect(chessMatches.length).toBeGreaterThanOrEqual(1);
    expect(chessMatches[0].gameKey).toBe('chess');
  });

  it('should provide comprehensive rule lessons for game learning', () => {
    const ludoLesson = getGameRuleLesson('ludo');
    expect(ludoLesson.title).toContain('Ludo');
    expect(ludoLesson.objective).toBeDefined();
    expect(ludoLesson.turnRules.length).toBeGreaterThanOrEqual(3);
    expect(ludoLesson.proTips.length).toBeGreaterThanOrEqual(1);
    expect(ludoLesson.winningRule).toBeDefined();

    const rummyLesson = getGameRuleLesson('rummy');
    expect(rummyLesson.title).toContain('Rummy');
    expect(rummyLesson.objective).toContain('Pure Sequence');
  });

  it('should support spectate mode in GamePlayMode union type', () => {
    const mode: GamePlayMode = 'spectate';
    expect(mode).toBe('spectate');
  });

  it('should have realistic ELO and competitor data for AI Grandmaster battles', () => {
    const chessMatch = LIVE_SPECTATABLE_MATCHES.find((m) => m.gameKey === 'chess');
    expect(chessMatch).toBeDefined();
    expect(chessMatch!.player1.elo).toBeGreaterThan(2000);
    expect(chessMatch!.player2.elo).toBeGreaterThan(2000);
  });
});
