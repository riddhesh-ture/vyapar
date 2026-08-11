import type { Tile, PropertyGroup } from './types.js';

/**
 * Country flag for each property group.
 * Groups are themed around real-world countries.
 */
export const GROUP_FLAGS: Record<PropertyGroup, string> = {
  A: '🇧🇷', // Brazil
  B: '🇫🇷', // France
  C: '🇨🇳', // China
  D: '🇯🇵', // Japan
  E: '🇮🇹', // Italy
  F: '🇩🇪', // Germany
  G: '🇬🇧', // United Kingdom
  H: '🇺🇸', // United States
};

export const GROUP_COUNTRIES: Record<PropertyGroup, string> = {
  A: 'Brazil',
  B: 'France',
  C: 'China',
  D: 'Japan',
  E: 'Italy',
  F: 'Germany',
  G: 'United Kingdom',
  H: 'United States',
};

/**
 * All 40 tiles, matching game-design.md structure.
 * Index = board position (0-39).
 * Theme: World cities grouped by country.
 */
export const BOARD: readonly Tile[] = [
  // ── Bottom row (0-9) ──
  { index: 0,  name: 'GO',               type: 'corner',   cornerType: 'go' },
  { index: 1,  name: 'Salvador',         type: 'property', group: 'A', price: 600 },
  { index: 2,  name: 'Community Chest',  type: 'card',     deck: 'communityChest' },
  { index: 3,  name: 'Rio de Janeiro',   type: 'property', group: 'A', price: 600 },
  { index: 4,  name: 'Income Tax',       type: 'tax',      taxAmount: 200, taxPercentOption: true },
  { index: 5,  name: 'JFK Airport',      type: 'railway',  price: 2_000 },
  { index: 6,  name: 'Paris',            type: 'property', group: 'B', price: 1_000 },
  { index: 7,  name: 'Chance',           type: 'card',     deck: 'chance' },
  { index: 8,  name: 'Lyon',             type: 'property', group: 'B', price: 1_000 },
  { index: 9,  name: 'Toulouse',         type: 'property', group: 'B', price: 1_000 },

  // ── Left column (10-19) ──
  { index: 10, name: 'Jail / Just Visiting', type: 'corner', cornerType: 'jail' },
  { index: 11, name: 'Shanghai',         type: 'property', group: 'C', price: 1_400 },
  { index: 12, name: 'Power Co.',        type: 'utility',  price: 1_500 },
  { index: 13, name: 'Beijing',          type: 'property', group: 'C', price: 1_400 },
  { index: 14, name: 'Shenzhen',         type: 'property', group: 'C', price: 1_400 },
  { index: 15, name: 'CDG Airport',      type: 'railway',  price: 2_000 },
  { index: 16, name: 'Tokyo',            type: 'property', group: 'D', price: 1_800 },
  { index: 17, name: 'Club House',       type: 'fee',      fee: 100 },
  { index: 18, name: 'Osaka',            type: 'property', group: 'D', price: 1_800 },
  { index: 19, name: 'Kyoto',            type: 'property', group: 'D', price: 1_800 },

  // ── Top row (20-29) ──
  { index: 20, name: 'Free Parking',     type: 'corner',   cornerType: 'freeParking' },
  { index: 21, name: 'Rome',             type: 'property', group: 'E', price: 2_200 },
  { index: 22, name: 'Chance',           type: 'card',     deck: 'chance' },
  { index: 23, name: 'Milan',            type: 'property', group: 'E', price: 2_200 },
  { index: 24, name: 'Venice',           type: 'property', group: 'E', price: 2_200 },
  { index: 25, name: 'Heathrow Airport', type: 'railway',  price: 2_000 },
  { index: 26, name: 'Berlin',           type: 'property', group: 'F', price: 2_600 },
  { index: 27, name: 'Munich',           type: 'property', group: 'F', price: 2_600 },
  { index: 28, name: 'Water Board',      type: 'utility',  price: 1_500 },
  { index: 29, name: 'Frankfurt',        type: 'property', group: 'F', price: 2_600 },

  // ── Right column (30-39) ──
  { index: 30, name: 'Go To Jail',       type: 'corner',   cornerType: 'goToJail' },
  { index: 31, name: 'London',           type: 'property', group: 'G', price: 3_000 },
  { index: 32, name: 'Manchester',       type: 'property', group: 'G', price: 3_000 },
  { index: 33, name: 'Rest House',       type: 'skip' },
  { index: 34, name: 'Liverpool',        type: 'property', group: 'G', price: 3_000 },
  { index: 35, name: 'Narita Airport',   type: 'railway',  price: 2_000 },
  { index: 36, name: 'Surprise',         type: 'card',     deck: 'surprise' },
  { index: 37, name: 'Wealth Tax',       type: 'tax',      taxAmount: 1_500 },
  { index: 38, name: 'New York',         type: 'property', group: 'H', price: 3_800 },
  { index: 39, name: 'San Francisco',    type: 'property', group: 'H', price: 3_800 },
] as const;

/** Number of tiles on the board */
export const BOARD_SIZE = 40;

/** Tile indices that are railways (airports) */
export const RAILWAY_INDICES = [5, 15, 25, 35] as const;

/** Tile indices that are utilities */
export const UTILITY_INDICES = [12, 28] as const;

/** Base (unimproved) rent for each property group */
export const BASE_RENT: Record<PropertyGroup, number> = {
  A: 40,
  B: 70,
  C: 100,
  D: 140,
  E: 180,
  F: 220,
  G: 260,
  H: 350,
};

/**
 * Rent multipliers by improvement level.
 * Index 0 = unimproved, 1 = 1 house, ..., 4 = 4 houses, 5 = hotel.
 * Actual rent = BASE_RENT[group] × RENT_MULTIPLIERS[houses]
 */
export const RENT_MULTIPLIERS = [1, 5, 15, 45, 80, 125] as const;

/** Railway (airport) rent by number owned by the same player */
export const RAILWAY_RENT = [0, 250, 500, 1_000, 2_000] as const;

/**
 * Utility rent multiplier: diceTotal × UTILITY_MULTIPLIER[count].
 * Index 0 unused, 1 = own 1 utility, 2 = own both.
 */
export const UTILITY_MULTIPLIER = [0, 4, 10] as const;

/**
 * Returns all tile indices that belong to a given property group.
 */
export function getGroupTiles(group: PropertyGroup): number[] {
  return BOARD.filter(t => t.group === group).map(t => t.index);
}

/**
 * Returns all ownable tile indices (properties, railways, utilities).
 */
export function getOwnableTileIndices(): number[] {
  return BOARD
    .filter(t => t.type === 'property' || t.type === 'railway' || t.type === 'utility')
    .map(t => t.index);
}

/**
 * House cost for a property = price ÷ 2, rounded to nearest $50.
 */
export function getHouseCost(price: number): number {
  return Math.round(price / 2 / 50) * 50;
}

/**
 * Hotel upgrade cost = the property's listed price.
 * (Player must already have 4 houses; those go back to the bank.)
 */
export function getHotelCost(price: number): number {
  return price;
}
