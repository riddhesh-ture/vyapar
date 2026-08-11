import type { GameConfig } from './types.js';

/**
 * Default game configuration matching game-design.md section 9.
 * This config lives in each room's authoritative state.
 */
export const DEFAULT_CONFIG: GameConfig = {
  startingCash: 15_000,
  passGoBonus: 0,
  freeParkingJackpot: false,
  auctionOnDecline: true,
  rollTwelveToStart: false,
  maxJailTurns: 3,
  jailFine: 1_000,
  doublesJailAfter: 3,
  turnTimerSeconds: 60,
  incomeTaxChoice: true,
  clubHouseFee: 100,
  restHouseSkipsFullTurn: true,
};
