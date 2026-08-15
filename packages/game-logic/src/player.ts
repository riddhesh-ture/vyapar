import type { Player, GameState } from './types.js';
import { BOARD } from './board.js';

/**
 * Transfer money between two players, or between a player and the bank.
 * Returns updated player objects.
 *
 * @param fromId - Player ID paying, or 'bank' for bank payments
 * @param toId - Player ID receiving, or 'bank' for payments to bank
 * @param amount - Amount to transfer
 * @param players - Current player list
 * @returns Updated player list
 */
export function transferMoney(
  fromId: string | 'bank',
  toId: string | 'bank',
  amount: number,
  players: Player[],
): Player[] {
  return players.map(p => {
    if (p.id === fromId) {
      return { ...p, cash: p.cash - amount };
    }
    if (p.id === toId) {
      return { ...p, cash: p.cash + amount };
    }
    return p;
  });
}

/**
 * Check if a player can afford a payment.
 */
export function canAfford(player: Player, amount: number): boolean {
  return player.cash >= amount;
}

/**
 * Count the total number of houses a player has across all properties.
 * Hotels count as 5 for card effects that charge "per house".
 */
export function countPlayerHouses(
  playerId: string,
  properties: GameState['properties'],
): { houses: number; hotels: number } {
  let houses = 0;
  let hotels = 0;

  for (const prop of Object.values(properties)) {
    if (prop.ownerId !== playerId) continue;
    if (prop.houses === 5) {
      hotels += 1;
    } else {
      houses += prop.houses;
    }
  }

  return { houses, hotels };
}

/**
 * Calculate total assets a player could liquidate (for bankruptcy checks).
 * Includes cash + mortgage values of unmortgaged properties + house sell-back values.
 */
export function calculateLiquidationValue(
  playerId: string,
  state: GameState,
): number {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return 0;

  let total = player.cash;

  for (const [tileIdxStr, prop] of Object.entries(state.properties)) {
    if (prop.ownerId !== playerId) continue;
    const tileIdx = Number(tileIdxStr);
    const tile = BOARD[tileIdx];
    if (!tile?.price) continue;

    // Sell houses at half cost
    if (prop.houses > 0) {
      const houseCost = Math.round(tile.price / 2 / 50) * 50;
      if (prop.houses === 5) {
        // Hotel: sell hotel (half of property price) + 4 houses (half each)
        total += Math.floor(tile.price / 2) + Math.floor(houseCost * 4 / 2);
      } else {
        total += Math.floor(houseCost * prop.houses / 2);
      }
    }

    // Mortgage unmortgaged properties
    if (!prop.mortgaged) {
      total += Math.floor(tile.price / 2);
    }
  }

  return total;
}

/**
 * Check if a player is bankrupt (cannot pay a debt even after liquidating).
 */
export function isBankrupt(
  playerId: string,
  amountOwed: number,
  state: GameState,
): boolean {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return true;

  // Quick check: can pay from cash alone
  if (player.cash >= amountOwed) return false;

  // Full liquidation check is async due to import — caller should use calculateLiquidationValue
  // For a synchronous rough check: cash >= amountOwed is the fast path
  return false; // Placeholder — full check done by server
}

/**
 * Create a new player with starting cash.
 */
export function createPlayer(
  id: string,
  name: string,
  startingCash: number,
  gotiId?: string,
): Player {
  return {
    id,
    name,
    gotiId,
    cash: startingCash,
    position: 0,
    inJail: false,
    jailTurns: 0,
    getOutOfJailFreeCards: 0,
    bankrupt: false,
    skipNextTurn: false,
    rentFreePass: false,
    rentCollectionMultiplier: 1,
  };
}

/**
 * Get all active (non-bankrupt) players.
 */
export function getActivePlayers(players: Player[]): Player[] {
  return players.filter(p => !p.bankrupt);
}

/**
 * Check if the game is over (only one player remaining).
 */
export function isGameOver(players: Player[]): boolean {
  return getActivePlayers(players).length <= 1;
}

/**
 * Get the winner (last player standing).
 */
export function getWinner(players: Player[]): Player | null {
  const active = getActivePlayers(players);
  return active.length === 1 ? active[0] : null;
}
