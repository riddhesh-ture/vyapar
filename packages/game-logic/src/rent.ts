import type { GameState, PropertyGroup, DiceRoll } from './types.js';
import {
  BOARD,
  BASE_RENT,
  RENT_MULTIPLIERS,
  RAILWAY_INDICES,
  RAILWAY_RENT,
  UTILITY_INDICES,
  UTILITY_MULTIPLIER,
  getGroupTiles,
} from './board.js';

/**
 * Does one player own every property in the given group?
 */
export function ownsFullGroup(
  playerId: string,
  group: PropertyGroup,
  properties: GameState['properties'],
): boolean {
  const tiles = getGroupTiles(group);
  return tiles.every(idx => properties[idx]?.ownerId === playerId);
}

/**
 * Count how many railways a player owns.
 */
export function countOwnedRailways(
  playerId: string,
  properties: GameState['properties'],
): number {
  return RAILWAY_INDICES.filter(idx => properties[idx]?.ownerId === playerId).length;
}

/**
 * Count how many utilities a player owns.
 */
export function countOwnedUtilities(
  playerId: string,
  properties: GameState['properties'],
): number {
  return UTILITY_INDICES.filter(idx => properties[idx]?.ownerId === playerId).length;
}

/**
 * Calculate rent for a property tile.
 * Returns 0 if unowned or mortgaged.
 *
 * Rules from game-design.md §4:
 * - Unimproved: BASE_RENT[group]
 * - Full group, no houses: base rent ×2
 * - With houses/hotel: BASE_RENT[group] × RENT_MULTIPLIERS[houses]
 */
export function calculatePropertyRent(
  tileIndex: number,
  properties: GameState['properties'],
): number {
  const prop = properties[tileIndex];
  if (!prop || !prop.ownerId || prop.mortgaged) return 0;

  const tile = BOARD[tileIndex];
  if (tile.type !== 'property' || !tile.group) return 0;

  const baseRent = BASE_RENT[tile.group];

  if (prop.houses > 0) {
    // Houses or hotel
    return baseRent * RENT_MULTIPLIERS[prop.houses];
  }

  // Unimproved — doubles if owner has full group
  if (ownsFullGroup(prop.ownerId, tile.group, properties)) {
    return baseRent * 2;
  }

  return baseRent;
}

/**
 * Calculate rent for a railway.
 * Rules: 1 owned → ₹250, 2 → ₹500, 3 → ₹1,000, 4 → ₹2,000.
 */
export function calculateRailwayRent(
  tileIndex: number,
  properties: GameState['properties'],
): number {
  const prop = properties[tileIndex];
  if (!prop || !prop.ownerId || prop.mortgaged) return 0;

  const count = countOwnedRailways(prop.ownerId, properties);
  return RAILWAY_RENT[count] ?? 0;
}

/**
 * Calculate rent for a utility.
 * Rules: dice roll × 4 (own 1) or × 10 (own both).
 */
export function calculateUtilityRent(
  tileIndex: number,
  properties: GameState['properties'],
  diceRoll: DiceRoll,
): number {
  const prop = properties[tileIndex];
  if (!prop || !prop.ownerId || prop.mortgaged) return 0;

  const count = countOwnedUtilities(prop.ownerId, properties);
  return diceRoll.total * (UTILITY_MULTIPLIER[count] ?? 0);
}

/**
 * Calculate the total rent owed when landing on a tile.
 * Dispatches to the correct rent function based on tile type.
 * Returns { amount, ownerId } or null if no rent is owed.
 */
export function calculateRent(
  tileIndex: number,
  landingPlayerId: string,
  state: GameState,
): { amount: number; ownerId: string } | null {
  const prop = state.properties[tileIndex];
  if (!prop || !prop.ownerId || prop.mortgaged) return null;

  // Don't pay rent to yourself
  if (prop.ownerId === landingPlayerId) return null;

  const tile = BOARD[tileIndex];
  let amount = 0;

  switch (tile.type) {
    case 'property':
      amount = calculatePropertyRent(tileIndex, state.properties);
      break;
    case 'railway':
      amount = calculateRailwayRent(tileIndex, state.properties);
      break;
    case 'utility':
      amount = calculateUtilityRent(tileIndex, state.properties, state.dice!);
      break;
    default:
      return null;
  }

  if (amount <= 0) return null;

  // Apply owner's rent collection multiplier (from card effects like double rent)
  const owner = state.players.find(p => p.id === prop.ownerId);
  if (owner && owner.rentCollectionMultiplier !== 1) {
    amount = Math.floor(amount * owner.rentCollectionMultiplier);
  }

  // Check if landing player has a rent-free pass
  const landingPlayer = state.players.find(p => p.id === landingPlayerId);
  if (landingPlayer?.rentFreePass) {
    return null;
  }

  return { amount, ownerId: prop.ownerId };
}
