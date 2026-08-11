// ─── Types ───────────────────────────────────────────────────
export type {
  TileType,
  PropertyGroup,
  CardDeckType,
  CornerType,
  Tile,
  PropertyState,
  Player,
  DiceRoll,
  CardEffectType,
  CardEffect,
  Card,
  AuctionState,
  TradeOffer,
  TradeState,
  GamePhase,
  GameConfig,
  GameLogEntry,
  GameState,
  PlayerIntent,
  ServerMessage,
} from './types.js';

// ─── Config ──────────────────────────────────────────────────
export { DEFAULT_CONFIG } from './config.js';

// ─── Board ───────────────────────────────────────────────────
export {
  BOARD,
  BOARD_SIZE,
  RAILWAY_INDICES,
  UTILITY_INDICES,
  BASE_RENT,
  RENT_MULTIPLIERS,
  RAILWAY_RENT,
  UTILITY_MULTIPLIER,
  GROUP_FLAGS,
  GROUP_COUNTRIES,
  getGroupTiles,
  getOwnableTileIndices,
  getHouseCost,
  getHotelCost,
} from './board.js';

// ─── Dice ────────────────────────────────────────────────────
export { rollDice, movePosition, moveBackward } from './dice.js';

// ─── Rent ────────────────────────────────────────────────────
export {
  ownsFullGroup,
  countOwnedRailways,
  countOwnedUtilities,
  calculatePropertyRent,
  calculateRailwayRent,
  calculateUtilityRent,
  calculateRent,
} from './rent.js';

// ─── Property ────────────────────────────────────────────────
export {
  initializeProperties,
  canBuyProperty,
  canBuildHouse,
  getBuildCost,
  canSellHouse,
  getHouseSellPrice,
  canMortgage,
  getMortgageValue,
  getUnmortgageCost,
  canUnmortgage,
} from './property.js';

// ─── Jail ────────────────────────────────────────────────────
export {
  canPayJailFine,
  canUseJailCard,
  isJailFineForced,
  sendToJail,
  releaseFromJail,
  incrementJailTurn,
} from './jail.js';

// ─── Tax ─────────────────────────────────────────────────────
export {
  calculateNetWorth,
  calculateIncomeTax,
  calculateWealthTax,
  resolveTax,
} from './tax.js';

// ─── Cards ───────────────────────────────────────────────────
export {
  getCardById,
  shuffleDeck,
  createShuffledDecks,
  drawCard,
  returnJailCard,
  findNearestTile,
} from './cards.js';

// ─── Player ──────────────────────────────────────────────────
export {
  transferMoney,
  canAfford,
  countPlayerHouses,
  calculateLiquidationValue,
  createPlayer,
  getActivePlayers,
  isGameOver,
  getWinner,
} from './player.js';
