import { PlayerColor, TokenState, Player, GameState, BotDifficulty, BotPersonality } from '../types/ludo';
import {
  getAbsoluteCircuitStep,
  isSafeAbsoluteStep,
  MAIN_CIRCUIT_PATH,
  COLOR_START_OFFSET,
} from './ludoBoard';

export interface BotDecision {
  tokenId: number;
  targetStep: number;
  reasoning: string;
}

/**
 * Evaluates the best token move for an AI Bot
 */
export function selectBotMove(
  botPlayer: Player,
  gameState: GameState,
  dice: number
): BotDecision | null {
  const validMoves = gameState.validMoves;
  if (validMoves.length === 0) return null;
  if (validMoves.length === 1) {
    return {
      tokenId: validMoves[0].tokenId,
      targetStep: validMoves[0].targetStep,
      reasoning: 'Only available valid move.',
    };
  }

  const difficulty = botPlayer.botDifficulty || 'adaptive';
  const personality = botPlayer.botPersonality || 'grandmaster';

  // Determine effective difficulty (adaptive adjusts dynamically based on game state)
  let effectiveDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (difficulty === 'easy') {
    effectiveDifficulty = 'easy';
  } else if (difficulty === 'hard') {
    effectiveDifficulty = 'hard';
  } else if (difficulty === 'medium') {
    effectiveDifficulty = 'medium';
  } else {
    // Adaptive: assess human player's threat level
    const humanPlayer = gameState.players.find((p) => p.type === 'human');
    const humanMaxStep = humanPlayer
      ? Math.max(...humanPlayer.tokens.map((t) => t.step), -1)
      : 0;
    const humanHomes = humanPlayer
      ? humanPlayer.tokens.filter((t) => t.isHome || t.step >= 58).length
      : 0;
    if (humanMaxStep >= 40 || humanHomes >= 1) {
      effectiveDifficulty = 'hard';
    } else {
      effectiveDifficulty = 'medium';
    }
  }

  // 1. Difficulty Randomness / Blunder Check
  // Easy: 55% chance of picking a random/casual move
  if (effectiveDifficulty === 'easy' && Math.random() < 0.55) {
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    return {
      tokenId: randomMove.tokenId,
      targetStep: randomMove.targetStep,
      reasoning: 'Casual relaxed move (Easy AI).',
    };
  }

  // Medium: 10% slight human-like blunder/sub-optimal selection
  if (effectiveDifficulty === 'medium' && Math.random() < 0.1) {
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    return {
      tokenId: randomMove.tokenId,
      targetStep: randomMove.targetStep,
      reasoning: 'Standard move (Medium AI).',
    };
  }

  // 2. Weight Parameters by Difficulty Level
  const weights = {
    easy: {
      exitBase: 15,
      home: 80,
      capture: 35,
      safeCell: 15,
      homeRunway: 25,
      escapeDanger: 0, // Unaware of danger behind
      avoidDanger: 0, // Doesn't anticipate landing in front of opponent
      stepProgress: 0.5,
      personalityMultiplier: 1.0,
    },
    medium: {
      exitBase: 45,
      home: 150,
      capture: 110,
      safeCell: 40,
      homeRunway: 60,
      escapeDanger: 45,
      avoidDanger: -30,
      stepProgress: 1.4,
      personalityMultiplier: 1.25,
    },
    hard: {
      exitBase: 65,
      home: 220,
      capture: 180,
      safeCell: 70,
      homeRunway: 90,
      escapeDanger: 85,
      avoidDanger: -75,
      stepProgress: 2.0,
      personalityMultiplier: 1.5,
    },
  }[effectiveDifficulty];

  let bestMove = validMoves[0];
  let highestScore = -Infinity;
  let bestReasoning = `Tactical step forward (${effectiveDifficulty.toUpperCase()} AI).`;

  for (const move of validMoves) {
    const token = botPlayer.tokens.find((t) => t.id === move.tokenId);
    if (!token) continue;

    let score = 0;
    let reasoning = `Advancing token (${effectiveDifficulty.toUpperCase()} AI).`;

    // A. Exiting Base Yard (from -1 to 0)
    if (token.step === -1 && move.targetStep === 0) {
      score += weights.exitBase;
      reasoning =
        effectiveDifficulty === 'hard'
          ? 'Ruthless deployment: expanding board domination!'
          : 'Deploying fresh token onto the board!';
    }

    // B. Reaching Home (step 58)
    if (move.targetStep === 58) {
      score += weights.home;
      reasoning =
        effectiveDifficulty === 'hard'
          ? 'Critical home finish locked in!'
          : 'Scoring token into Home!';
    }

    // C. Check for Captures
    const targetAbsStep = getAbsoluteCircuitStep(botPlayer.color, move.targetStep);
    if (targetAbsStep !== -1 && !isSafeAbsoluteStep(targetAbsStep)) {
      let capturedOpponent = false;
      for (const otherPlayer of gameState.players) {
        if (otherPlayer.color === botPlayer.color) continue;
        for (const oppToken of otherPlayer.tokens) {
          const oppAbsStep = getAbsoluteCircuitStep(otherPlayer.color, oppToken.step);
          if (oppAbsStep === targetAbsStep) {
            capturedOpponent = true;
            score += weights.capture;
            reasoning =
              effectiveDifficulty === 'hard'
                ? `Grandmaster Strike! Eliminating ${otherPlayer.color.toUpperCase()} token!`
                : `Strike! Capturing ${otherPlayer.color.toUpperCase()} token!`;
            break;
          }
        }
      }
    }

    // D. Landing on a Safe Cell (Star / Start)
    if (targetAbsStep !== -1 && isSafeAbsoluteStep(targetAbsStep)) {
      score += weights.safeCell;
      reasoning =
        effectiveDifficulty === 'hard'
          ? 'Calculated star cell sanctuary, denying opponent line.'
          : 'Securing safe cell sanctuary.';
    }

    // E. Entering colored Home Runway (step 52..57)
    if (move.targetStep >= 52 && token.step < 52) {
      score += weights.homeRunway;
      reasoning = 'Escaping circuit into Home Stretch!';
    }

    // F. Distance Progress Bonus
    score += move.targetStep * weights.stepProgress;

    // G. Check Danger Escaped (only active in medium & hard)
    if (weights.escapeDanger > 0) {
      const currentAbsStep = getAbsoluteCircuitStep(botPlayer.color, token.step);
      if (currentAbsStep !== -1 && !isSafeAbsoluteStep(currentAbsStep)) {
        // Is an opponent behind us within 1..6 steps?
        let inDanger = false;
        for (const otherPlayer of gameState.players) {
          if (otherPlayer.color === botPlayer.color) continue;
          for (const oppToken of otherPlayer.tokens) {
            const oppAbsStep = getAbsoluteCircuitStep(otherPlayer.color, oppToken.step);
            if (oppAbsStep !== -1) {
              const distanceBehind = (currentAbsStep - oppAbsStep + 52) % 52;
              if (distanceBehind >= 1 && distanceBehind <= 6) {
                inDanger = true;
                break;
              }
            }
          }
        }
        if (inDanger) {
          score += weights.escapeDanger;
          reasoning = 'Evading imminent opponent capture!';
        }
      }
    }

    // H. Avoid Landing in Danger (only active in medium & hard)
    if (weights.avoidDanger !== 0 && targetAbsStep !== -1 && !isSafeAbsoluteStep(targetAbsStep)) {
      let futureDanger = false;
      for (const otherPlayer of gameState.players) {
        if (otherPlayer.color === botPlayer.color) continue;
        for (const oppToken of otherPlayer.tokens) {
          const oppAbsStep = getAbsoluteCircuitStep(otherPlayer.color, oppToken.step);
          if (oppAbsStep !== -1) {
            const dist = (targetAbsStep - oppAbsStep + 52) % 52;
            if (dist >= 1 && dist <= 6) {
              futureDanger = true;
              break;
            }
          }
        }
      }
      if (futureDanger) {
        score += weights.avoidDanger;
      }
    }

    // Personality Multipliers
    if (personality === 'blitz') {
      if (reasoning.includes('Strike') || reasoning.includes('Deploying')) {
        score *= weights.personalityMultiplier;
      }
    } else if (personality === 'shield') {
      if (reasoning.includes('Safe') || reasoning.includes('Evading') || reasoning.includes('sanctuary')) {
        score *= weights.personalityMultiplier;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMove = move;
      bestReasoning = reasoning;
    }
  }

  return {
    tokenId: bestMove.tokenId,
    targetStep: bestMove.targetStep,
    reasoning: bestReasoning,
  };
}
