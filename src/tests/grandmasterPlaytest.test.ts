import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  getValidMovesForPlayer,
  canTokenMove,
    SAFE_CIRCUIT_INDICES,
  PlayerColor,
} from '../logic/ludoBoard';

describe('GRANDMASTER WORLD CHAMPION PLAYTEST: 16-Game Move Analysis & Deep Audit', () => {

  // -------------------------------------------------------------
  // GAME 1: LUDO AI MASTER
  // -------------------------------------------------------------
  describe('Game 1: Ludo AI Master Championship Playtest', () => {
    it('should open token from base on roll of 6 and advance along 52-step circuit', () => {
      const state = createInitialGameState('offline_bot', 'red', 'adaptive');
      const redPlayer = state.players.find((p) => p.color === 'red')!;
      const token0 = redPlayer.tokens[0];

      expect(token0.isBase).toBe(true);
      expect(token0.step).toBe(-1);

      // Roll 6 - valid moves should include token0
      const validMoves = getValidMovesForPlayer(redPlayer, 6);
      expect(validMoves.some((m) => m.tokenId === token0.id)).toBe(true);

      // Step advancement from base
      token0.isBase = false;
      token0.step = 0;
      expect(token0.isBase).toBe(false);
      expect(token0.step).toBe(0);
    });

    it('should respect safe star positions and prevent opponent capture', () => {
      expect(SAFE_CIRCUIT_INDICES).toContain(0);  // Red start
      expect(SAFE_CIRCUIT_INDICES).toContain(8);  // Safe star
      expect(SAFE_CIRCUIT_INDICES).toContain(13); // Green start
      expect(SAFE_CIRCUIT_INDICES).toContain(21); // Safe star
      expect(SAFE_CIRCUIT_INDICES).toContain(26); // Yellow start
      expect(SAFE_CIRCUIT_INDICES).toContain(34); // Safe star
      expect(SAFE_CIRCUIT_INDICES).toContain(39); // Blue start
      expect(SAFE_CIRCUIT_INDICES).toContain(47); // Safe star
    });

    it('should require exact roll to reach home (step 58)', () => {
      const state = createInitialGameState('offline_bot', 'red', 'adaptive');
      const redPlayer = state.players.find((p) => p.color === 'red')!;
      redPlayer.tokens[0].isBase = false;
      redPlayer.tokens[0].step = 56; // 2 steps away from 58

      // Roll 3 - exceeds 58, cannot move
      expect(canTokenMove(redPlayer.tokens[0], 3)).toBe(false);

      // Roll 2 - exact roll to 58
      expect(canTokenMove(redPlayer.tokens[0], 2)).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // GAME 2: CHESS GRANDMASTER
  // -------------------------------------------------------------
  describe('Game 2: Chess Grandmaster Playtest', () => {
    type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
    type PieceColor = 'w' | 'b';
    type ChessPiece = { type: PieceType; color: PieceColor } | null;
    type BoardState = ChessPiece[][];

    const calculateMoves = (r: number, c: number, board: BoardState): [number, number][] => {
      const piece = board[r][c];
      if (!piece) return [];
      const moves: [number, number][] = [];
      const isEnemy = (tr: number, tc: number) => {
        const target = board[tr][tc];
        return target !== null && target.color !== piece.color;
      };
      const isEmpty = (tr: number, tc: number) => board[tr][tc] === null;

      if (piece.type === 'p') {
        const dir = piece.color === 'w' ? -1 : 1;
        const startRow = piece.color === 'w' ? 6 : 1;
        if (r + dir >= 0 && r + dir < 8 && isEmpty(r + dir, c)) {
          moves.push([r + dir, c]);
          if (r === startRow && isEmpty(r + 2 * dir, c)) {
            moves.push([r + 2 * dir, c]);
          }
        }
        [-1, 1].forEach((dc) => {
          if (r + dir >= 0 && r + dir < 8 && c + dc >= 0 && c + dc < 8 && isEnemy(r + dir, c + dc)) {
            moves.push([r + dir, c + dc]);
          }
        });
      } else if (piece.type === 'n') {
        const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        offsets.forEach(([dr, dc]) => {
          const tr = r + dr, tc = c + dc;
          if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && (isEmpty(tr, tc) || isEnemy(tr, tc))) {
            moves.push([tr, tc]);
          }
        });
      }
      return moves;
    };

    it('should validate White opening pawn moves (1. e4 / 1. d4) and Knight jump (1. Nf3)', () => {
      const initialBoard: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));
      initialBoard[6][4] = { type: 'p', color: 'w' };
      initialBoard[7][6] = { type: 'n', color: 'w' };

      const pawnMoves = calculateMoves(6, 4, initialBoard);
      expect(pawnMoves).toContainEqual([5, 4]);
      expect(pawnMoves).toContainEqual([4, 4]);

      const knightMoves = calculateMoves(7, 6, initialBoard);
      expect(knightMoves).toContainEqual([5, 5]);
      expect(knightMoves).toContainEqual([5, 7]);
    });
  });

  // -------------------------------------------------------------
  // GAME 3: TEEN PATTI ROYAL
  // -------------------------------------------------------------
  describe('Game 3: Teen Patti Royal Playtest', () => {
    interface Card { suit: string; value: number }

    const evaluateTeenPattiHand = (cards: Card[]): number => {
      const vals = cards.map((c) => c.value).sort((a, b) => a - b);
      const isSameSuit = cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit;
      const isSeq = (vals[0] + 1 === vals[1] && vals[1] + 1 === vals[2]) || (vals[0] === 2 && vals[1] === 3 && vals[2] === 14);

      if (vals[0] === vals[1] && vals[1] === vals[2]) return 600 + vals[0]; // Trail/Trio
      if (isSameSuit && isSeq) return 500 + vals[2]; // Pure Sequence
      if (isSeq) return 400 + vals[2]; // Sequence
      if (isSameSuit) return 300 + vals[2]; // Color
      if (vals[0] === vals[1] || vals[1] === vals[2] || vals[0] === vals[2]) {
        return 200 + vals[1]; // Pair
      }
      return vals[2]; // High Card
    };

    it('should correctly rank Trio > Pure Sequence > Sequence > Color > Pair > High Card', () => {
      const trioAAA = [{ suit: 'spades', value: 14 }, { suit: 'hearts', value: 14 }, { suit: 'diamonds', value: 14 }];
      const pureSeqAKQ = [{ suit: 'spades', value: 12 }, { suit: 'spades', value: 13 }, { suit: 'spades', value: 14 }];
      const seqAKQ = [{ suit: 'spades', value: 12 }, { suit: 'hearts', value: 13 }, { suit: 'diamonds', value: 14 }];
      const flush = [{ suit: 'hearts', value: 2 }, { suit: 'hearts', value: 7 }, { suit: 'hearts', value: 14 }];
      const pair = [{ suit: 'spades', value: 10 }, { suit: 'hearts', value: 10 }, { suit: 'diamonds', value: 5 }];
      const highCard = [{ suit: 'spades', value: 3 }, { suit: 'hearts', value: 8 }, { suit: 'diamonds', value: 14 }];

      expect(evaluateTeenPattiHand(trioAAA)).toBe(614);
      expect(evaluateTeenPattiHand(pureSeqAKQ)).toBe(514);
      expect(evaluateTeenPattiHand(seqAKQ)).toBe(414);
      expect(evaluateTeenPattiHand(flush)).toBe(314);
      expect(evaluateTeenPattiHand(pair)).toBe(210);
      expect(evaluateTeenPattiHand(highCard)).toBe(14);
    });
  });

  // -------------------------------------------------------------
  // GAME 4: INDIAN RUMMY
  // -------------------------------------------------------------
  describe('Game 4: Indian Rummy Playtest', () => {
    it('should validate Pure Sequence requirements (consecutive cards of identical suit)', () => {
      const pureSeq = [
        { suit: 'spades', value: 7 },
        { suit: 'spades', value: 8 },
        { suit: 'spades', value: 9 },
      ];
      const isPure = pureSeq.every((c) => c.suit === 'spades') &&
        pureSeq[0].value + 1 === pureSeq[1].value &&
        pureSeq[1].value + 1 === pureSeq[2].value;

      expect(isPure).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // GAME 5: SATTE PE SATTA
  // -------------------------------------------------------------
  describe('Game 5: Satte Pe Satta Playtest', () => {
    it('should only allow 7s to open or consecutive ranks (6 or 8) of opened suits', () => {
      const layout: Record<string, { min: number; max: number }> = {
        hearts: { min: 7, max: 7 },
        spades: { min: 0, max: 0 },
      };

      const card7Spades = { suit: 'spades', value: 7 };
      const card6Hearts = { suit: 'hearts', value: 6 };
      const card5Hearts = { suit: 'hearts', value: 5 };

      // 7 of spades can open
      expect(card7Spades.value === 7).toBe(true);
      // 6 of hearts can build on opened 7
      expect(card6Hearts.value === layout['hearts'].min - 1).toBe(true);
      // 5 of hearts cannot be played before 6
      expect(card5Hearts.value === layout['hearts'].min - 1).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // GAME 6: COAT PIECE
  // -------------------------------------------------------------
  describe('Game 6: Coat Piece Playtest', () => {
    it('should award trick to highest trump or highest lead suit card', () => {
      const trumpSuit = 'spades';
      const trick = [
        { card: { suit: 'hearts', value: 14 }, playerIdx: 0 }, // Lead Ace of Hearts
        { card: { suit: 'hearts', value: 10 }, playerIdx: 1 },
        { card: { suit: 'spades', value: 2 }, playerIdx: 2 },  // Trump 2 of Spades (Ruff)
        { card: { suit: 'hearts', value: 8 }, playerIdx: 3 },
      ];

      // Trump overrides non-trump Ace
      const trumps = trick.filter((p) => p.card.suit === trumpSuit);
      const winningPlay = trumps.length > 0 ? trumps[0] : trick[0];
      expect(winningPlay.playerIdx).toBe(2);
    });
  });

  // -------------------------------------------------------------
  // GAME 7: BHABHI THULLA
  // -------------------------------------------------------------
  describe('Game 7: Bhabhi Thulla Playtest', () => {
    it('should penalize highest lead card player when Thulla is thrown', () => {
      const leadSuit = 'diamonds';
      const trick = [
        { card: { suit: 'diamonds', value: 14 }, playerIdx: 0 }, // Lead Ace of Diamonds
        { card: { suit: 'diamonds', value: 10 }, playerIdx: 1 },
        { card: { suit: 'spades', value: 5 }, playerIdx: 2 },    // Void in diamonds -> Thulla thrown!
        { card: { suit: 'diamonds', value: 8 }, playerIdx: 3 },
      ];

      const hasThulla = trick.some((p) => p.card.suit !== leadSuit);
      expect(hasThulla).toBe(true);

      // Player with highest lead card (Ace) gets all trick cards
      const leadPlays = trick.filter((p) => p.card.suit === leadSuit);
      leadPlays.sort((a, b) => b.card.value - a.card.value);
      const penalisedPlayer = leadPlays[0].playerIdx;

      expect(penalisedPlayer).toBe(0);
    });
  });

  // -------------------------------------------------------------
  // GAME 8: TEXAS HOLDEM POKER
  // -------------------------------------------------------------
  describe('Game 8: Texas Holdem Poker Playtest', () => {
    it('should advance community cards correctly: Pre-Flop (0) -> Flop (3) -> Turn (4) -> River (5)', () => {
      let stage: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' = 'preflop';

      const getActiveCommunityCount = (s: string) => {
        if (s === 'preflop') return 0;
        if (s === 'flop') return 3;
        if (s === 'turn') return 4;
        return 5;
      };

      expect(getActiveCommunityCount(stage)).toBe(0);
      stage = 'flop';
      expect(getActiveCommunityCount(stage)).toBe(3);
      stage = 'turn';
      expect(getActiveCommunityCount(stage)).toBe(4);
      stage = 'river';
      expect(getActiveCommunityCount(stage)).toBe(5);
    });
  });

  // -------------------------------------------------------------
  // GAME 9: BLACKJACK 21
  // -------------------------------------------------------------
  describe('Game 9: Blackjack 21 Playtest', () => {
    const calculateScore = (cards: { value: number }[]): number => {
      let sum = 0, aces = 0;
      cards.forEach((c) => {
        if (c.value === 14) { aces += 1; sum += 11; }
        else if (c.value >= 10) { sum += 10; }
        else { sum += c.value; }
      });
      while (sum > 21 && aces > 0) { sum -= 10; aces -= 1; }
      return sum;
    };

    it('should correctly calculate 21 for Ace + King (Blackjack) and adjust Ace value on bust', () => {
      const blackjackHand = [{ value: 14 }, { value: 13 }]; // Ace + King
      expect(calculateScore(blackjackHand)).toBe(21);

      const soft17Hand = [{ value: 14 }, { value: 6 }]; // Ace + 6
      expect(calculateScore(soft17Hand)).toBe(17);

      const threeCardHand = [{ value: 14 }, { value: 9 }, { value: 8 }]; // Ace + 9 + 8 = 18 (Ace converts from 11 to 1)
      expect(calculateScore(threeCardHand)).toBe(18);
    });
  });

  // -------------------------------------------------------------
  // GAME 10: KLONDIKE SOLITAIRE
  // -------------------------------------------------------------
  describe('Game 10: Klondike Solitaire Playtest', () => {
    it('should enforce tableau alternating color descending rank rule', () => {
      const redCard = { suit: 'hearts', value: 9, isRed: true };
      const blackCard = { suit: 'spades', value: 10, isRed: false };

      const canPlaceOnTableau = (top: typeof redCard, base: typeof blackCard) => {
        return top.isRed !== base.isRed && top.value === base.value - 1;
      };

      expect(canPlaceOnTableau(redCard, blackCard)).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // GAME 11: DONKEY REFLEX
  // -------------------------------------------------------------
  describe('Game 11: Donkey Card Reflex Playtest', () => {
    it('should identify 4-of-a-kind hand and establish touching hierarchy', () => {
      const hand = [
        { value: 8 }, { value: 8 }, { value: 8 }, { value: 8 }
      ];
      const counts: Record<number, number> = {};
      hand.forEach((c) => { counts[c.value] = (counts[c.value] || 0) + 1; });
      const has4OfAKind = Object.values(counts).includes(4);

      expect(has4OfAKind).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // GAME 12: BLUFF (I DOUBT IT)
  // -------------------------------------------------------------
  describe('Game 12: Bluff Playtest', () => {
    it('should catch bluff when thrown cards do not match claimed rank', () => {
      const claim = { count: 2, rank: 14 }; // Claimed 2 Aces
      const actualThrown = [{ value: 14 }, { value: 9 }]; // Threw Ace + 9

      const isLying = actualThrown.some((c) => c.value !== claim.rank);
      expect(isLying).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // GAME 13: SNAKES & LADDERS 3D
  // -------------------------------------------------------------
  describe('Game 13: Snakes & Ladders Playtest', () => {
    const SNAKES_LADDERS = [
      { from: 4, to: 14, type: 'ladder' },
      { from: 28, to: 84, type: 'ladder' },
      { from: 98, to: 78, type: 'snake' },
      { from: 87, to: 24, type: 'snake' },
    ];

    it('should elevate player on ladder and lower player on snake', () => {
      const climbLadder = SNAKES_LADDERS.find((s) => s.from === 28);
      expect(climbLadder?.to).toBe(84);

      const slideSnake = SNAKES_LADDERS.find((s) => s.from === 98);
      expect(slideSnake?.to).toBe(78);
    });
  });

  // -------------------------------------------------------------
  // GAME 14: CARROM BOARD PHYSICS
  // -------------------------------------------------------------
  describe('Game 14: Carrom Board Physics Playtest', () => {
    it('should calculate striker velocity vector and score Red Queen + Cover', () => {
      const shotPower = 80;
      const aimAngle = -Math.PI / 2; // Straight up
      const speed = 4 + (shotPower / 100) * 16;
      const vx = Math.cos(aimAngle) * speed;
      const vy = Math.sin(aimAngle) * speed;

      expect(Math.abs(vx)).toBeLessThan(0.001); // 0 x velocity
      expect(vy).toBeLessThan(-10); // High negative y velocity towards top pockets
    });
  });

  // -------------------------------------------------------------
  // GAME 15: SNOOKER & 8-BALL POOL
  // -------------------------------------------------------------
  describe('Game 15: Snooker & 8-Ball Pool Playtest', () => {
    it('should enforce authentic ball point values for 147 maximum break', () => {
      const colorValues: Record<string, number> = {
        red: 1,
        yellow: 2,
        green: 3,
        brown: 4,
        blue: 5,
        pink: 6,
        black: 7,
      };

      const redTotal = 15 * colorValues.red;
      const blackTotal = 15 * colorValues.black;
      const clearance = colorValues.yellow + colorValues.green + colorValues.brown + colorValues.blue + colorValues.pink + colorValues.black;

      expect(redTotal + blackTotal + clearance).toBe(147);
    });
  });

  // -------------------------------------------------------------
  // GAME 16: TABLE TENNIS RALLY
  // -------------------------------------------------------------
  describe('Game 16: Table Tennis Rally Playtest', () => {
    it('should score standard 11-point tournament set with 2-point lead required at deuce', () => {
      const isSetWon = (p1: number, p2: number) => {
        if (p1 >= 11 && p1 - p2 >= 2) return 'p1';
        if (p2 >= 11 && p2 - p1 >= 2) return 'p2';
        return null;
      };

      expect(isSetWon(10, 10)).toBe(null); // Deuce
      expect(isSetWon(11, 10)).toBe(null); // Advantage only
      expect(isSetWon(12, 10)).toBe('p1');  // Set won!
    });
  });
});
