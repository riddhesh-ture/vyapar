import type { DiceRoll } from './types.js';

/**
 * Roll two six-sided dice. Returns the result including doubles detection.
 * Pure function — caller provides the random values or uses defaults.
 */
export function rollDice(
  die1: number = Math.ceil(Math.random() * 6),
  die2: number = Math.ceil(Math.random() * 6),
): DiceRoll {
  return {
    die1,
    die2,
    total: die1 + die2,
    isDoubles: die1 === die2,
  };
}

/**
 * Calculate new position after moving `steps` from `currentPosition`.
 * Returns { newPosition, passedGo }.
 */
export function movePosition(
  currentPosition: number,
  steps: number,
  boardSize: number = 40,
): { newPosition: number; passedGo: boolean } {
  const newPosition = (currentPosition + steps) % boardSize;
  const passedGo = currentPosition + steps >= boardSize;
  return { newPosition, passedGo };
}

/**
 * Move backward (e.g. "Go back 3 spaces" card).
 * Cannot pass GO backward — wraps to end of board.
 */
export function moveBackward(
  currentPosition: number,
  spaces: number,
  boardSize: number = 40,
): number {
  return ((currentPosition - spaces) % boardSize + boardSize) % boardSize;
}
