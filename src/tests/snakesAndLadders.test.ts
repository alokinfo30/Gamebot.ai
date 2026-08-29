import { describe, it, expect } from 'vitest';
import { SNAKES_AND_LADDERS_DATA } from '../components/SnakesAndLadders';

describe('[GAMEBOT.AI Test Suite] Snakes & Ladders 3D Dice & Connecting Overlay Invariants', () => {
  it('should contain valid ladders that move players upwards on the 100-tile board', () => {
    const ladders = SNAKES_AND_LADDERS_DATA.filter((item) => item.type === 'ladder');
    expect(ladders.length).toBeGreaterThan(0);

    for (const ladder of ladders) {
      expect(ladder.to).toBeGreaterThan(ladder.from);
      expect(ladder.from).toBeGreaterThanOrEqual(1);
      expect(ladder.to).toBeLessThanOrEqual(100);
    }
  });

  it('should contain valid snakes that slither players downwards on the 100-tile board', () => {
    const snakes = SNAKES_AND_LADDERS_DATA.filter((item) => item.type === 'snake');
    expect(snakes.length).toBeGreaterThan(0);

    for (const snake of snakes) {
      expect(snake.to).toBeLessThan(snake.from);
      expect(snake.from).toBeGreaterThanOrEqual(1);
      expect(snake.to).toBeGreaterThanOrEqual(1);
    }
  });
});
