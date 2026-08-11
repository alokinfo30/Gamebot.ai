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
