import type { Player, GameConfig } from './types.js';

/**
 * Result of attempting to exit jail.
 */
export interface JailExitResult {
  exited: boolean;
  method: 'fine' | 'doubles' | 'card' | 'forcedFine';
  finePaid?: number;
}

/**
 * Can the player pay the jail fine to exit?
 */
export function canPayJailFine(player: Player, config: GameConfig): boolean {
  return player.inJail && player.cash >= config.jailFine;
}

/**
 * Can the player use a Get Out of Jail Free card?
 */
export function canUseJailCard(player: Player): boolean {
  return player.inJail && player.getOutOfJailFreeCards > 0;
}

/**
 * Is the player forced to pay on this jail turn?
 * (3rd turn in jail → forced fine, per game-design.md §5)
 */
export function isJailFineForced(player: Player, config: GameConfig): boolean {
  return player.inJail && player.jailTurns >= config.maxJailTurns;
}

/**
 * Send a player to jail.
 */
export function sendToJail(player: Player): Player {
  return {
    ...player,
    position: 10, // Jail tile
    inJail: true,
    jailTurns: 0,
  };
}

/**
 * Release a player from jail.
 */
export function releaseFromJail(player: Player): Player {
  return {
    ...player,
    inJail: false,
    jailTurns: 0,
  };
}

/**
 * Increment the jail turn counter for a player.
 */
export function incrementJailTurn(player: Player): Player {
  return {
    ...player,
    jailTurns: player.jailTurns + 1,
  };
}
