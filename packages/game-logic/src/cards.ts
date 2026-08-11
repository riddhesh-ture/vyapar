import type { Card } from './types.js';

// ─── Chance Deck ─────────────────────────────────────────────

const CHANCE_CARDS: Card[] = [
  {
    id: 'ch-01', deck: 'chance',
    text: 'Advance to GO.',
    effect: { type: 'advanceToGo', tileIndex: 0 },
  },
  {
    id: 'ch-02', deck: 'chance',
    text: 'Advance to San Francisco. If you pass GO, collect nothing (no GO bonus).',
    effect: { type: 'moveTo', tileIndex: 39 },
  },
  {
    id: 'ch-03', deck: 'chance',
    text: 'Advance to London.',
    effect: { type: 'moveTo', tileIndex: 31 },
  },
  {
    id: 'ch-04', deck: 'chance',
    text: 'Advance to JFK Airport.',
    effect: { type: 'moveTo', tileIndex: 5 },
  },
  {
    id: 'ch-05', deck: 'chance',
    text: 'Advance to the nearest Airport. Pay the owner double rent if owned.',
    effect: { type: 'moveToNearest', nearestType: 'railway', payDoubleRent: true },
  },
  {
    id: 'ch-06', deck: 'chance',
    text: 'Advance to the nearest Airport. Pay the owner double rent if owned.',
    effect: { type: 'moveToNearest', nearestType: 'railway', payDoubleRent: true },
  },
  {
    id: 'ch-07', deck: 'chance',
    text: 'Advance to the nearest Utility. If owned, pay 10× your dice roll.',
    effect: { type: 'moveToNearest', nearestType: 'utility', payTenTimesDice: true },
  },
  {
    id: 'ch-08', deck: 'chance',
    text: 'Go back 3 spaces.',
    effect: { type: 'moveBack', spaces: 3 },
  },
  {
    id: 'ch-09', deck: 'chance',
    text: 'Go directly to Jail. Do not pass GO.',
    effect: { type: 'goToJail' },
  },
  {
    id: 'ch-10', deck: 'chance',
    text: 'Bank pays you a dividend of $500.',
    effect: { type: 'collectFromBank', amount: 500 },
  },
  {
    id: 'ch-11', deck: 'chance',
    text: 'Your investments mature. Collect $1,500.',
    effect: { type: 'collectFromBank', amount: 1500 },
  },
  {
    id: 'ch-12', deck: 'chance',
    text: 'Pay hospital bill: $1,000.',
    effect: { type: 'payToBank', amount: 1000 },
  },
  {
    id: 'ch-13', deck: 'chance',
    text: 'Pay school fees: $500.',
    effect: { type: 'payToBank', amount: 500 },
  },
  {
    id: 'ch-14', deck: 'chance',
    text: 'Speeding fine: pay $150.',
    effect: { type: 'payToBank', amount: 150 },
  },
  {
    id: 'ch-15', deck: 'chance',
    text: 'Rent-free pass! Your next rent payment is waived.',
    effect: { type: 'rentFreePass' },
  },
  {
    id: 'ch-16', deck: 'chance',
    text: 'Get Out of Jail Free. Keep this card until needed.',
    effect: { type: 'getOutOfJailFree' },
  },
];

// ─── Community Chest Deck ────────────────────────────────────

const COMMUNITY_CHEST_CARDS: Card[] = [
  {
    id: 'cc-01', deck: 'communityChest',
    text: 'Advance to GO.',
    effect: { type: 'advanceToGo', tileIndex: 0 },
  },
  {
    id: 'cc-02', deck: 'communityChest',
    text: 'Bank error in your favour. Collect $2,000.',
    effect: { type: 'collectFromBank', amount: 2000 },
  },
  {
    id: 'cc-03', deck: 'communityChest',
    text: "Doctor's fee. Pay $500.",
    effect: { type: 'payToBank', amount: 500 },
  },
  {
    id: 'cc-04', deck: 'communityChest',
    text: 'Sale of stock. Receive $500.',
    effect: { type: 'collectFromBank', amount: 500 },
  },
  {
    id: 'cc-05', deck: 'communityChest',
    text: 'Insurance premium. Pay $500.',
    effect: { type: 'payToBank', amount: 500 },
  },
  {
    id: 'cc-06', deck: 'communityChest',
    text: 'Income tax refund. Collect $200.',
    effect: { type: 'collectFromBank', amount: 200 },
  },
  {
    id: 'cc-07', deck: 'communityChest',
    text: "It's your birthday! Collect $100 from every player.",
    effect: { type: 'collectFromAll', amount: 100 },
  },
  {
    id: 'cc-08', deck: 'communityChest',
    text: 'Inherit $1,000.',
    effect: { type: 'collectFromBank', amount: 1000 },
  },
  {
    id: 'cc-09', deck: 'communityChest',
    text: 'Pay hospital bill: $1,000.',
    effect: { type: 'payToBank', amount: 1000 },
  },
  {
    id: 'cc-10', deck: 'communityChest',
    text: 'Receive consultancy fee: $250.',
    effect: { type: 'collectFromBank', amount: 250 },
  },
  {
    id: 'cc-11', deck: 'communityChest',
    text: 'Street repairs! Pay $400 per house and $1,150 per hotel.',
    effect: { type: 'payPerHouseHotel', perHouse: 400, perHotel: 1150 },
  },
  {
    id: 'cc-12', deck: 'communityChest',
    text: 'Won second prize in a beauty contest. Collect $100.',
    effect: { type: 'collectFromBank', amount: 100 },
  },
  {
    id: 'cc-13', deck: 'communityChest',
    text: 'Holiday fund matures. Collect $1,000.',
    effect: { type: 'collectFromBank', amount: 1000 },
  },
  {
    id: 'cc-14', deck: 'communityChest',
    text: 'Go directly to Jail. Do not pass GO.',
    effect: { type: 'goToJail' },
  },
  {
    id: 'cc-15', deck: 'communityChest',
    text: 'Get Out of Jail Free. Keep this card until needed.',
    effect: { type: 'getOutOfJailFree' },
  },
  {
    id: 'cc-16', deck: 'communityChest',
    text: 'Property repairs! Pay $250 per house and $800 per hotel.',
    effect: { type: 'payPerHouseHotel', perHouse: 250, perHotel: 800 },
  },
];

// ─── Surprise Deck ───────────────────────────────────────────

const SURPRISE_CARDS: Card[] = [
  {
    id: 'su-01', deck: 'surprise',
    text: 'Swap positions with a random player!',
    effect: { type: 'swapPosition' },
  },
  {
    id: 'su-02', deck: 'surprise',
    text: 'Swap positions with a random player!',
    effect: { type: 'swapPosition' },
  },
  {
    id: 'su-03', deck: 'surprise',
    text: 'Double trouble! Rent collected on your properties is doubled this round.',
    effect: { type: 'doubleRent' },
  },
  {
    id: 'su-04', deck: 'surprise',
    text: 'Double trouble! Rent collected on your properties is doubled this round.',
    effect: { type: 'doubleRent' },
  },
  {
    id: 'su-05', deck: 'surprise',
    text: 'Time freeze! Skip every other player\'s next turn.',
    effect: { type: 'skipOthersTurn' },
  },
  {
    id: 'su-06', deck: 'surprise',
    text: 'Mandatory auction! The property you\'re standing on goes to auction.',
    effect: { type: 'forceAuction' },
  },
  {
    id: 'su-07', deck: 'surprise',
    text: 'Mandatory auction! The property you\'re standing on goes to auction.',
    effect: { type: 'forceAuction' },
  },
  {
    id: 'su-08', deck: 'surprise',
    text: 'All players pay you $200 as tribute.',
    effect: { type: 'collectFromAll', amount: 200 },
  },
  {
    id: 'su-09', deck: 'surprise',
    text: 'Tax rebate! Collect $800 from the bank.',
    effect: { type: 'collectFromBank', amount: 800 },
  },
  {
    id: 'su-10', deck: 'surprise',
    text: 'Market crash! Pay $600 to the bank.',
    effect: { type: 'payToBank', amount: 600 },
  },
  {
    id: 'su-11', deck: 'surprise',
    text: 'Lucky break! Collect $1,200 from the bank.',
    effect: { type: 'collectFromBank', amount: 1200 },
  },
  {
    id: 'su-12', deck: 'surprise',
    text: 'Advance to Kyoto.',
    effect: { type: 'moveTo', tileIndex: 19 },
  },
  {
    id: 'su-13', deck: 'surprise',
    text: 'Advance to Tokyo.',
    effect: { type: 'moveTo', tileIndex: 16 },
  },
  {
    id: 'su-14', deck: 'surprise',
    text: 'Go directly to Jail. Do not pass GO.',
    effect: { type: 'goToJail' },
  },
  {
    id: 'su-15', deck: 'surprise',
    text: 'Get Out of Jail Free. Keep this card until needed.',
    effect: { type: 'getOutOfJailFree' },
  },
  {
    id: 'su-16', deck: 'surprise',
    text: 'Get Out of Jail Free. Keep this card until needed.',
    effect: { type: 'getOutOfJailFree' },
  },
];

// ─── Deck Management ─────────────────────────────────────────

/** All cards indexed by ID for quick lookup */
const ALL_CARDS_MAP = new Map<string, Card>();
for (const card of [...CHANCE_CARDS, ...COMMUNITY_CHEST_CARDS, ...SURPRISE_CARDS]) {
  ALL_CARDS_MAP.set(card.id, card);
}

/** Get a card by ID */
export function getCardById(id: string): Card | undefined {
  return ALL_CARDS_MAP.get(id);
}

/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 */
export function shuffleDeck<T>(deck: readonly T[]): T[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create shuffled decks for game start.
 * Returns card ID arrays (top of deck = index 0).
 */
export function createShuffledDecks(): {
  chance: string[];
  communityChest: string[];
  surprise: string[];
} {
  return {
    chance: shuffleDeck(CHANCE_CARDS.map(c => c.id)),
    communityChest: shuffleDeck(COMMUNITY_CHEST_CARDS.map(c => c.id)),
    surprise: shuffleDeck(SURPRISE_CARDS.map(c => c.id)),
  };
}

/**
 * Draw the top card from a deck.
 * Returns { card, remainingDeck }.
 * Get Out of Jail Free cards are removed from the deck;
 * all other cards go to the bottom.
 */
export function drawCard(
  deckIds: string[],
): { card: Card; remainingDeck: string[] } | null {
  if (deckIds.length === 0) return null;

  const [topId, ...rest] = deckIds;
  const card = getCardById(topId);
  if (!card) return null;

  // Get Out of Jail Free cards don't return to deck
  const remainingDeck = card.effect.type === 'getOutOfJailFree'
    ? rest
    : [...rest, topId]; // Return to bottom

  return { card, remainingDeck };
}

/**
 * Return a Get Out of Jail Free card to the bottom of its deck.
 */
export function returnJailCard(
  cardId: string,
  deckIds: string[],
): string[] {
  return [...deckIds, cardId];
}

/**
 * Find the nearest tile of a given type from a position,
 * searching forward (clockwise).
 */
export function findNearestTile(
  position: number,
  tileType: 'railway' | 'utility',
  boardSize: number = 40,
): number {
  const indices = tileType === 'railway'
    ? [5, 15, 25, 35]
    : [12, 28];

  for (let i = 1; i <= boardSize; i++) {
    const checkIdx = (position + i) % boardSize;
    if (indices.includes(checkIdx)) return checkIdx;
  }

  return indices[0]; // Fallback (shouldn't happen)
}
