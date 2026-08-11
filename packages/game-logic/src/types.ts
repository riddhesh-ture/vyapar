// ─── Tile Types ──────────────────────────────────────────────

export type TileType =
  | 'property'
  | 'railway'
  | 'utility'
  | 'tax'
  | 'card'
  | 'corner'
  | 'fee'
  | 'skip';

export type PropertyGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export type CardDeckType = 'chance' | 'communityChest' | 'surprise';

export type CornerType = 'go' | 'jail' | 'freeParking' | 'goToJail';

export interface Tile {
  index: number;
  name: string;
  type: TileType;
  /** Property / Railway / Utility group */
  group?: PropertyGroup;
  /** Purchase price (properties, railways, utilities) */
  price?: number;
  /** For tax tiles — flat amount */
  taxAmount?: number;
  /** Income Tax lets the player choose flat vs 10% net worth */
  taxPercentOption?: boolean;
  /** Which card deck to draw from */
  deck?: CardDeckType;
  /** Corner subtype */
  cornerType?: CornerType;
  /** Flat fee (Club House) */
  fee?: number;
}

// ─── Property State ──────────────────────────────────────────

export interface PropertyState {
  ownerId: string | null;
  mortgaged: boolean;
  /** 0-4 = houses, 5 = hotel */
  houses: number;
}

// ─── Player ──────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  cash: number;
  /** Tile index 0-39 */
  position: number;
  inJail: boolean;
  /** Turns spent in jail this stay */
  jailTurns: number;
  getOutOfJailFreeCards: number;
  bankrupt: boolean;
  /** Rest House: skip your entire next turn */
  skipNextTurn: boolean;
  /** Card effect: next rent payment is free */
  rentFreePass: boolean;
  /** Card effect: rent multiplier override (e.g. 2 for double) — 1 = normal */
  rentCollectionMultiplier: number;
}

// ─── Dice ────────────────────────────────────────────────────

export interface DiceRoll {
  die1: number;
  die2: number;
  total: number;
  isDoubles: boolean;
}

// ─── Cards ───────────────────────────────────────────────────

export type CardEffectType =
  | 'moveTo'
  | 'moveBack'
  | 'moveToNearest'
  | 'collectFromBank'
  | 'payToBank'
  | 'collectFromAll'
  | 'payPerHouseHotel'
  | 'goToJail'
  | 'getOutOfJailFree'
  | 'rentFreePass'
  | 'swapPosition'
  | 'doubleRent'
  | 'skipOthersTurn'
  | 'forceAuction'
  | 'advanceToGo';

export interface CardEffect {
  type: CardEffectType;
  /** Target tile index (moveTo, advanceToGo) */
  tileIndex?: number;
  /** Spaces to go back (moveBack) */
  spaces?: number;
  /** What to find nearest of (moveToNearest) */
  nearestType?: 'railway' | 'utility';
  /** Money amount (collect/pay) */
  amount?: number;
  /** Per-house cost (payPerHouseHotel) */
  perHouse?: number;
  /** Per-hotel cost (payPerHouseHotel) */
  perHotel?: number;
  /** Pay double rent when landing on moveToNearest railway */
  payDoubleRent?: boolean;
  /** Pay 10× dice for moveToNearest utility */
  payTenTimesDice?: boolean;
}

export interface Card {
  id: string;
  deck: CardDeckType;
  text: string;
  effect: CardEffect;
}

// ─── Auction ─────────────────────────────────────────────────

export interface AuctionState {
  tileIndex: number;
  currentBid: number;
  currentBidderId: string | null;
  /** Player IDs still eligible to bid (in bidding order) */
  activeParticipants: string[];
  /** Index into activeParticipants for whose turn to bid */
  currentBidderTurnIndex: number;
  /** Player IDs who have passed */
  passed: string[];
}

// ─── Trading ─────────────────────────────────────────────────

export interface TradeOffer {
  cash: number;
  properties: number[];
  getOutOfJailFreeCards: number;
}

export interface TradeState {
  proposerId: string;
  targetId: string;
  offering: TradeOffer;
  requesting: TradeOffer;
  status: 'pending' | 'accepted' | 'rejected';
}

// ─── Game Phase ──────────────────────────────────────────────

export type GamePhase =
  | 'waiting'
  | 'rolling'
  | 'moving'
  | 'landed'
  | 'buyDecision'
  | 'auction'
  | 'payingRent'
  | 'drawingCard'
  | 'resolvingCard'
  | 'payingTax'
  | 'inJail'
  | 'trading'
  | 'bankrupt'
  | 'gameOver';

// ─── Game Config ─────────────────────────────────────────────

export interface GameConfig {
  startingCash: number;
  passGoBonus: number;
  freeParkingJackpot: boolean;
  auctionOnDecline: boolean;
  rollTwelveToStart: boolean;
  maxJailTurns: number;
  jailFine: number;
  doublesJailAfter: number;
  turnTimerSeconds: number;
  incomeTaxChoice: boolean;
  clubHouseFee: number;
  restHouseSkipsFullTurn: boolean;
}

// ─── Game Log ────────────────────────────────────────────────

export interface GameLogEntry {
  timestamp: number;
  message: string;
  playerId?: string;
}

// ─── Full Game State ─────────────────────────────────────────

export interface GameState {
  roomId: string;
  config: GameConfig;
  players: Player[];
  /** Keyed by tile index — only tiles that can be owned */
  properties: Record<number, PropertyState>;
  currentPlayerIndex: number;
  phase: GamePhase;
  dice: DiceRoll | null;
  /** Consecutive doubles rolled this turn */
  doublesCount: number;
  decks: {
    chance: string[];
    communityChest: string[];
    surprise: string[];
  };
  currentCard: Card | null;
  auction: AuctionState | null;
  trade: TradeState | null;
  /** Player IDs in turn order */
  turnOrder: string[];
  winner: string | null;
  log: GameLogEntry[];
}

// ─── Client ↔ Server Messages ────────────────────────────────

export type PlayerIntent =
  | { type: 'setName'; name: string }
  | { type: 'updateConfig'; config: Partial<GameConfig> }
  | { type: 'startGame' }
  | { type: 'rollDice' }
  | { type: 'buyProperty' }
  | { type: 'declineBuy' }
  | { type: 'placeBid'; amount: number }
  | { type: 'passAuction' }
  | { type: 'buildHouse'; tileIndex: number }
  | { type: 'sellHouse'; tileIndex: number }
  | { type: 'mortgage'; tileIndex: number }
  | { type: 'unmortgage'; tileIndex: number }
  | { type: 'payJailFine' }
  | { type: 'useGetOutOfJailCard' }
  | { type: 'rollForJail' }
  | { type: 'payTaxFlat' }
  | { type: 'payTaxPercent' }
  | { type: 'proposeTrade'; targetId: string; offering: TradeOffer; requesting: TradeOffer }
  | { type: 'acceptTrade' }
  | { type: 'rejectTrade' }
  | { type: 'endTurn' };

export type ServerMessage =
  | { type: 'gameState'; state: GameState }
  | { type: 'error'; message: string }
  | { type: 'roomInfo'; roomId: string; playerId: string };
