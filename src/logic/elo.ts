import { UserProfile } from '../types/ludo';

export interface RankTier {
  name: string;
  minElo: number;
  color: string;
  badge: string;
}

export const RANK_TIERS: RankTier[] = [
  { name: 'Grandmaster', minElo: 2200, color: 'text-amber-400', badge: '👑' },
  { name: 'Master', minElo: 2000, color: 'text-purple-400', badge: '💎' },
  { name: 'Diamond', minElo: 1800, color: 'text-cyan-400', badge: '💠' },
  { name: 'Platinum', minElo: 1600, color: 'text-emerald-400', badge: '✨' },
  { name: 'Gold', minElo: 1400, color: 'text-yellow-400', badge: '🏆' },
  { name: 'Silver', minElo: 1200, color: 'text-slate-300', badge: '🥈' },
  { name: 'Bronze', minElo: 1000, color: 'text-amber-600', badge: '🥉' },
  { name: 'Novice', minElo: 0, color: 'text-gray-400', badge: '🌱' },
];

export function getRankTier(elo: number): RankTier {
  for (const tier of RANK_TIERS) {
    if (elo >= tier.minElo) {
      return tier;
    }
  }
  return RANK_TIERS[RANK_TIERS.length - 1];
}

/**
 * Calculates ELO change after a 4-player Ludo match
 * @param playerElo The rating of the player being evaluated
 * @param opponentElos Ratings of all other players in the match
 * @param rankPosition Finish rank (1 = 1st place, 2 = 2nd place, 3 = 3rd place, 4 = 4th place)
 * @param totalPlayers Total number of players (default 4)
 */
export function calculateEloChange(
  playerElo: number,
  opponentElos: number[],
  rankPosition: number,
  totalPlayers: number = 4
): number {
  if (opponentElos.length === 0) return 0;

  const avgOpponentElo = opponentElos.reduce((a, b) => a + b, 0) / opponentElos.length;
  
  // Actual score S based on placement: 1st = 1.0, 2nd = 0.66, 3rd = 0.33, 4th = 0
  const actualScore = (totalPlayers - rankPosition) / (totalPlayers - 1);

  // Expected score E formula
  const expectedScore = 1 / (1 + Math.pow(10, (avgOpponentElo - playerElo) / 400));

  const K = 36; // K-factor
  const delta = Math.round(K * (actualScore - expectedScore));

  return delta;
}

const LOCAL_STORAGE_KEY = 'ai_ludo_user_profile';
const MATCH_HISTORY_KEY = 'gamebot_user_match_history_v1';

export interface MatchHistoryEntry {
  id: string;
  matchIndex: number;
  label: string;
  game: string;
  gameTitle: string;
  elo: number;
  delta: number;
  result: 'win' | 'loss' | '2nd' | '3rd';
  opponent: string;
  timestamp: number;
  formattedDate: string;
}

export function getStoredMatchHistory(currentElo: number = 1200): MatchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(MATCH_HISTORY_KEY);
    if (raw) {
      const parsed: MatchHistoryEntry[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(-20).map((m, idx) => ({
          ...m,
          matchIndex: idx + 1,
          label: `M${idx + 1}`,
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load match history:', e);
  }

  // Generate realistic 20-match seed progression leading to current ELO
  const history: MatchHistoryEntry[] = [];
  const gamesList = ['Ludo AI Master', 'Chess AI Grandmaster', 'Carrom Board Physics', 'Teen Patti Royal', 'Texas Hold\'em Poker'];
  const opponentsList = ['Grandmaster AI', 'BlitzKing Bot', 'Ludo_Wizard_99', 'DeepBlue_Pro', 'QueenGambit_Master', 'StarCamper_Pro'];
  
  let simulatedElo = Math.max(900, currentElo - 160);
  const now = Date.now();

  for (let i = 1; i <= 20; i++) {
    const isWin = i % 3 !== 0 || i === 20;
    const delta = isWin ? Math.floor(14 + Math.random() * 18) : -Math.floor(10 + Math.random() * 15);
    simulatedElo = Math.max(800, simulatedElo + delta);
    
    // Scale the last match to match user's actual currentElo
    if (i === 20) {
      simulatedElo = currentElo;
    }

    const timeAgo = now - (20 - i) * (1000 * 60 * 45); // each 45 min apart
    const dateObj = new Date(timeAgo);
    const formattedDate = `${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;

    history.push({
      id: `match_${i}_${Date.now()}`,
      matchIndex: i,
      label: `M${i}`,
      game: 'ludo',
      gameTitle: gamesList[(i - 1) % gamesList.length],
      elo: simulatedElo,
      delta,
      result: isWin ? 'win' : (i % 2 === 0 ? '2nd' : 'loss'),
      opponent: opponentsList[(i - 1) % opponentsList.length],
      timestamp: timeAgo,
      formattedDate,
    });
  }

  saveStoredMatchHistory(history);
  return history;
}

export function saveStoredMatchHistory(history: MatchHistoryEntry[]): void {
  try {
    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(history.slice(-20)));
  } catch (e) {
    console.error('Failed to save match history:', e);
  }
}

export function recordMatchToHistory(
  gameKey: string,
  gameTitle: string,
  result: 'win' | 'loss' | '2nd' | '3rd',
  newElo: number,
  delta: number,
  opponent: string = 'Gemini AI Bot'
): MatchHistoryEntry[] {
  const existing = getStoredMatchHistory(newElo - delta);
  const now = Date.now();
  const dateObj = new Date(now);
  const formattedDate = `${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;

  const newEntry: MatchHistoryEntry = {
    id: `match_${Date.now()}`,
    matchIndex: existing.length + 1,
    label: `M${existing.length + 1}`,
    game: gameKey,
    gameTitle,
    elo: newElo,
    delta,
    result,
    opponent,
    timestamp: now,
    formattedDate,
  };

  const updated = [...existing, newEntry].slice(-20).map((m, idx) => ({
    ...m,
    matchIndex: idx + 1,
    label: `M${idx + 1}`,
  }));

  saveStoredMatchHistory(updated);
  return updated;
}

export function getStoredUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load profile:', e);
  }

  const defaultProfile: UserProfile = {
    id: `usr_${Math.random().toString(36).substring(2, 9)}`,
    name: 'Gamebot Challenger',
    elo: 1200,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    captures: 0,
    tokensHome: 0,
  };

  saveUserProfile(defaultProfile);
  return defaultProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}
