import type { GameState } from './types.js';
import { BOARD } from './board.js';

/**
 * Calculate a player's net worth for Income Tax 10% option.
 * Net worth = cash + property prices + house values.
 *
 * Note: mortgaged properties count at mortgage value (half price),
 * matching standard Monopoly net worth calculation.
 */
export function calculateNetWorth(
  playerId: string,
  state: GameState,
): number {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return 0;

  let netWorth = player.cash;

  for (const [tileIdxStr, prop] of Object.entries(state.properties)) {
    if (prop.ownerId !== playerId) continue;
    const tileIdx = Number(tileIdxStr);
    const tile = BOARD[tileIdx];
    if (!tile.price) continue;

    if (prop.mortgaged) {
      // Mortgaged property counts at half price
      netWorth += Math.floor(tile.price / 2);
    } else {
      netWorth += tile.price;

      // Add house/hotel values
      if (tile.type === 'property' && prop.houses > 0) {
        const houseCost = Math.round(tile.price / 2 / 50) * 50;
        if (prop.houses <= 4) {
          netWorth += houseCost * prop.houses;
        } else {
          // Hotel = 4 houses + property price
          netWorth += houseCost * 4 + tile.price;
        }
      }
    }
  }

  return netWorth;
}

/**
 * Calculate Income Tax owed.
 * Player can choose: ₹200 flat, or 10% of net worth.
 * If incomeTaxChoice is disabled in config, always pay flat.
 */
export function calculateIncomeTax(
  playerId: string,
  choice: 'flat' | 'percent',
  state: GameState,
): number {
  const tile = BOARD[4]; // Income Tax tile
  const flatAmount = tile.taxAmount ?? 200;

  if (choice === 'flat' || !state.config.incomeTaxChoice) {
    return flatAmount;
  }

  // 10% of net worth
  const netWorth = calculateNetWorth(playerId, state);
  return Math.floor(netWorth * 0.1);
}

/**
 * Calculate Wealth Tax owed (tile 37). Always ₹1,500 flat.
 */
export function calculateWealthTax(): number {
  return BOARD[37].taxAmount ?? 1_500;
}

/**
 * Resolve a tax tile landing.
 * Returns the amount owed.
 */
export function resolveTax(
  tileIndex: number,
  playerId: string,
  choice: 'flat' | 'percent',
  state: GameState,
): number {
  if (tileIndex === 4) {
    return calculateIncomeTax(playerId, choice, state);
  }
  if (tileIndex === 37) {
    return calculateWealthTax();
  }
  return 0;
}
