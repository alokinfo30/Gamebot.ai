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

  // Easy bot: 40% random move
  if (difficulty === 'easy' && Math.random() < 0.4) {
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    return {
      tokenId: randomMove.tokenId,
      targetStep: randomMove.targetStep,
      reasoning: 'Casual move.',
    };
  }

  let bestMove = validMoves[0];
  let highestScore = -Infinity;
  let bestReasoning = 'Tactical step forward.';

  for (const move of validMoves) {
    const token = botPlayer.tokens.find((t) => t.id === move.tokenId);
    if (!token) continue;

    let score = 0;
    let reasoning = 'Advancing token.';

    // 1. Exiting Base Yard (from -1 to 0)
    if (token.step === -1 && move.targetStep === 0) {
      score += 45;
      reasoning = 'Deploying fresh token onto the board!';
    }

    // 2. Reaching Home (step 58)
    if (move.targetStep === 58) {
      score += 150;
      reasoning = 'Scoring token into Home!';
    }

    // 3. Check for Captures
    const targetAbsStep = getAbsoluteCircuitStep(botPlayer.color, move.targetStep);
    if (targetAbsStep !== -1 && !isSafeAbsoluteStep(targetAbsStep)) {
      let capturedOpponent = false;
      for (const otherPlayer of gameState.players) {
        if (otherPlayer.color === botPlayer.color) continue;
        for (const oppToken of otherPlayer.tokens) {
          const oppAbsStep = getAbsoluteCircuitStep(otherPlayer.color, oppToken.step);
          if (oppAbsStep === targetAbsStep) {
            capturedOpponent = true;
            score += 120;
            reasoning = `Strike! Capturing ${otherPlayer.color.toUpperCase()} token!`;
            break;
          }
        }
      }
    }

    // 4. Landing on a Safe Cell (Star / Start)
    if (targetAbsStep !== -1 && isSafeAbsoluteStep(targetAbsStep)) {
      score += 40;
      reasoning = 'Securing safe cell sanctuary.';
    }

    // 5. Entering colored Home Runway (step 52..57)
    if (move.targetStep >= 52 && token.step < 52) {
      score += 65;
      reasoning = 'Escaping circuit into Home Stretch!';
    }

    // 6. Distance Progress Bonus
    score += move.targetStep * 1.5;

    // 7. Check Danger Escaped
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
        score += 55;
        reasoning = 'Escaping imminent opponent capture!';
      }
    }

    // 8. Avoid Landing in Danger
    if (targetAbsStep !== -1 && !isSafeAbsoluteStep(targetAbsStep)) {
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
        score -= 30;
      }
    }

    // Personality Multipliers
    if (personality === 'blitz') {
      if (reasoning.includes('Strike') || reasoning.includes('Deploying')) score *= 1.3;
    } else if (personality === 'shield') {
      if (reasoning.includes('Safe') || reasoning.includes('Escaping')) score *= 1.4;
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
