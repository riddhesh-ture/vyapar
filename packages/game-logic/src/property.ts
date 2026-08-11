import type { GameState, PropertyState } from './types.js';
import { BOARD, getGroupTiles, getHouseCost, getOwnableTileIndices } from './board.js';
import { ownsFullGroup } from './rent.js';

/**
 * Initialize property state for all ownable tiles.
 */
export function initializeProperties(): Record<number, PropertyState> {
  const properties: Record<number, PropertyState> = {};
  for (const idx of getOwnableTileIndices()) {
    properties[idx] = { ownerId: null, mortgaged: false, houses: 0 };
  }
  return properties;
}

/**
 * Can the player buy the property at the given tile?
 * Tile must be unowned and player must have enough cash.
 */
export function canBuyProperty(
  playerId: string,
  tileIndex: number,
  state: GameState,
): boolean {
  const tile = BOARD[tileIndex];
  if (!tile.price) return false;

  const prop = state.properties[tileIndex];
  if (!prop || prop.ownerId !== null) return false;

  const player = state.players.find(p => p.id === playerId);
  if (!player || player.bankrupt) return false;

  return player.cash >= tile.price;
}

/**
 * Can the player build a house on this property?
 *
 * Rules from game-design.md §4:
 * - Must own the full group
 * - Houses must be built evenly (can't have >1 difference within group)
 * - Can't build on mortgaged properties
 * - Max 5 (hotel)
 */
export function canBuildHouse(
  playerId: string,
  tileIndex: number,
  state: GameState,
): boolean {
  const tile = BOARD[tileIndex];
  if (tile.type !== 'property' || !tile.group || !tile.price) return false;

  const prop = state.properties[tileIndex];
  if (!prop || prop.ownerId !== playerId || prop.mortgaged) return false;
  if (prop.houses >= 5) return false; // Already has hotel

  // Must own full group
  if (!ownsFullGroup(playerId, tile.group, state.properties)) return false;

  // No mortgaged properties in the group
  const groupTiles = getGroupTiles(tile.group);
  if (groupTiles.some(idx => state.properties[idx]?.mortgaged)) return false;

  // Even building: this tile's houses must be ≤ min houses in group
  const minHouses = Math.min(...groupTiles.map(idx => state.properties[idx]?.houses ?? 0));
  if (prop.houses > minHouses) return false;

  // Player must afford it
  const player = state.players.find(p => p.id === playerId);
  if (!player) return false;

  const cost = prop.houses === 4
    ? tile.price         // Hotel upgrade = property price
    : getHouseCost(tile.price);

  return player.cash >= cost;
}

/**
 * Get the cost to build the next improvement on a property.
 * Returns the cost for either a house or hotel upgrade.
 */
export function getBuildCost(tileIndex: number, currentHouses: number): number {
  const tile = BOARD[tileIndex];
  if (!tile.price) return 0;

  if (currentHouses === 4) {
    // Hotel upgrade
    return tile.price;
  }
  return getHouseCost(tile.price);
}

/**
 * Can the player sell a house from this property?
 * Houses must be sold evenly (reverse of building).
 */
export function canSellHouse(
  playerId: string,
  tileIndex: number,
  state: GameState,
): boolean {
  const tile = BOARD[tileIndex];
  if (tile.type !== 'property' || !tile.group) return false;

  const prop = state.properties[tileIndex];
  if (!prop || prop.ownerId !== playerId) return false;
  if (prop.houses <= 0) return false;

  // Even selling: this tile's houses must be ≥ max houses in group
  const groupTiles = getGroupTiles(tile.group);
  const maxHouses = Math.max(...groupTiles.map(idx => state.properties[idx]?.houses ?? 0));
  if (prop.houses < maxHouses) return false;

  return true;
}

/**
 * Sale price when selling a house back to the bank = half the purchase cost.
 */
export function getHouseSellPrice(tileIndex: number, currentHouses: number): number {
  return Math.floor(getBuildCost(tileIndex, currentHouses === 5 ? 4 : currentHouses - 1) / 2);
}

/**
 * Can a property be mortgaged?
 * Must be owned, not already mortgaged, and have no houses.
 * All properties in the group must have 0 houses to mortgage any of them.
 */
export function canMortgage(
  playerId: string,
  tileIndex: number,
  state: GameState,
): boolean {
  const tile = BOARD[tileIndex];
  const prop = state.properties[tileIndex];
  if (!prop || prop.ownerId !== playerId || prop.mortgaged) return false;
  if (prop.houses > 0) return false;

  // For properties in a group, all must have 0 houses
  if (tile.group) {
    const groupTiles = getGroupTiles(tile.group);
    if (groupTiles.some(idx => (state.properties[idx]?.houses ?? 0) > 0)) return false;
  }

  return true;
}

/**
 * Mortgage value = half the property price.
 */
export function getMortgageValue(tileIndex: number): number {
  const tile = BOARD[tileIndex];
  return tile.price ? Math.floor(tile.price / 2) : 0;
}

/**
 * Unmortgage cost = mortgage value + 10% interest.
 */
export function getUnmortgageCost(tileIndex: number): number {
  const value = getMortgageValue(tileIndex);
  return Math.ceil(value * 1.1);
}

/**
 * Can a property be unmortgaged?
 */
export function canUnmortgage(
  playerId: string,
  tileIndex: number,
  state: GameState,
): boolean {
  const prop = state.properties[tileIndex];
  if (!prop || prop.ownerId !== playerId || !prop.mortgaged) return false;

  const player = state.players.find(p => p.id === playerId);
  if (!player) return false;

  return player.cash >= getUnmortgageCost(tileIndex);
}
