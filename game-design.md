# Vyapar — Game Design Doc (v2, 40-tile, international edition)

Real-time multiplayer, world-cities themed. Rules blend the classic Indian
"Business" board game (Club House, Rest House, auction-on-decline, ₹15,000 start)
with cleaner Monopoly-style building/rent math, plus custom house rules
(no GO bonus, three card decks instead of two). Properties are themed
around 8 real-world countries with international city names.

---

## 1. Setup

- **Players:** 2–8
- **Starting cash:** ₹15,000 each, everyone equal (matches the real Business game)
- **Bank:** unlimited funds, holds unowned properties, houses/hotels, collects fines & taxes
- **Passing/landing on GO:** no cash bonus — explicit house rule, deviates from the
  real Business game (which pays ₹1,500 on GO) and from Monopoly
- **Turn order:** host starts first; subsequent turns follow join order
- **Goti tokens:** 8 prestige vector tokens — Falcon, Crown, Anchor, Gem, Compass,
  Shield, Citadel, Medallion — each with a unique gradient color and SVG icon
- **Optional authentic rule (toggle, off by default for online play):** in the physical
  Business game, everyone rolls each round until someone hits exactly 12 before any
  movement starts. Fun in person, slow online — left as a config toggle, not default.

---

## 2. The Board (40 tiles)

8 property groups (22 properties across 8 countries), 4 international airports,
2 utilities, 2 tax tiles, 3 card decks (Chance / Community Chest / Surprise),
Club House, Rest House, and 4 corners.

| # | Tile | Type | Group | Price / Effect |
|---|------|------|-------|-----------  |
| 0 | GO | Corner | — | — |
| 1 | Salvador | Property | A (Brazil) | ₹600 |
| 2 | Community Chest | Card | — | — |
| 3 | Rio de Janeiro | Property | A (Brazil) | ₹600 |
| 4 | Income Tax | Tax | — | pay ₹200 flat, or 10% net worth (player's choice) |
| 5 | JFK Airport | Railway | — | ₹2,000 |
| 6 | Paris | Property | B (France) | ₹1,000 |
| 7 | Chance | Card | — | — |
| 8 | Lyon | Property | B (France) | ₹1,000 |
| 9 | Toulouse | Property | B (France) | ₹1,000 |
| 10 | Jail / Just Visiting | Corner | — | — |
| 11 | Shanghai | Property | C (China) | ₹1,400 |
| 12 | Power Co. | Utility | — | ₹1,500 |
| 13 | Beijing | Property | C (China) | ₹1,400 |
| 14 | Shenzhen | Property | C (China) | ₹1,400 |
| 15 | CDG Airport | Railway | — | ₹2,000 |
| 16 | Tokyo | Property | D (Japan) | ₹1,800 |
| 17 | Club House | Fee | — | pay ₹100 flat to bank |
| 18 | Osaka | Property | D (Japan) | ₹1,800 |
| 19 | Kyoto | Property | D (Japan) | ₹1,800 |
| 20 | Free Parking | Corner | — | no jackpot — strict/classic, matches your board |
| 21 | Rome | Property | E (Italy) | ₹2,200 |
| 22 | Chance | Card | — | — |
| 23 | Milan | Property | E (Italy) | ₹2,200 |
| 24 | Venice | Property | E (Italy) | ₹2,200 |
| 25 | Heathrow Airport | Railway | — | ₹2,000 |
| 26 | Berlin | Property | F (Germany) | ₹2,600 |
| 27 | Munich | Property | F (Germany) | ₹2,600 |
| 28 | Water Board | Utility | — | ₹1,500 |
| 29 | Frankfurt | Property | F (Germany) | ₹2,600 |
| 30 | Go To Jail | Corner | — | — |
| 31 | London | Property | G (UK) | ₹3,000 |
| 32 | Manchester | Property | G (UK) | ₹3,000 |
| 33 | Rest House | Skip | — | skip your entire next turn |
| 34 | Liverpool | Property | G (UK) | ₹3,000 |
| 35 | Narita Airport | Railway | — | ₹2,000 |
| 36 | Surprise | Card | — | — |
| 37 | Wealth Tax | Tax | — | pay ₹1,500 flat |
| 38 | New York | Property | H (USA) | ₹3,800 |
| 39 | San Francisco | Property | H (USA) | ₹3,800 |

### Property Groups Summary

| Group | Country | Flag | Cities | Price | Base Rent | Color Wash |
|-------|---------|------|--------|-------|-----------|------------|
| A | Brazil 🇧🇷 | Green/Gold | Salvador, Rio de Janeiro | ₹600 | ₹40 | Green gradient |
| B | France 🇫🇷 | Blue/White/Red | Paris, Lyon, Toulouse | ₹1,000 | ₹70 | Blue-red gradient |
| C | China 🇨🇳 | Red/Gold stars | Shanghai, Beijing, Shenzhen | ₹1,400 | ₹100 | Red gradient |
| D | Japan 🇯🇵 | White/Red circle | Tokyo, Osaka, Kyoto | ₹1,800 | ₹140 | Red-white gradient |
| E | Italy 🇮🇹 | Green/White/Red | Rome, Milan, Venice | ₹2,200 | ₹180 | Green-red gradient |
| F | Germany 🇩🇪 | Black/Red/Gold | Berlin, Munich, Frankfurt | ₹2,600 | ₹220 | Dark-red gradient |
| G | UK 🇬🇧 | Union Jack | London, Manchester, Liverpool | ₹3,000 | ₹260 | Blue-red gradient |
| H | USA 🇺🇸 | Stars & Stripes | New York, San Francisco | ₹3,800 | ₹350 | Blue gradient |

*Groups A & H have 2 properties; Groups B–G have 3 properties each. Total: 22 properties.*

---

## 3. Turn Structure

1. Roll two dice, move that many tiles.
2. Resolve the tile you land on (buy, pay rent, draw card, pay tax, Club House fee,
   Rest House, etc.)
3. Rolling doubles = roll again after resolving; **3 doubles in a row → go directly
   to Jail.**
4. End turn.

---

## 4. Property Rules

- **Buying:** landing on an unowned property lets you buy at listed price. Decline →
  goes to **auction**, open to all players including you. If nobody bids, it stays
  unowned (this matches the real Business game — the bank doesn't force-sell it).
- **Rent (unimproved) by group:** A ₹40 · B ₹70 · C ₹100 · D ₹140 · E ₹180 · F ₹220 ·
  G ₹260 · H ₹350
- **Full color group, no houses:** rent doubles automatically (configurable via "×2 rent on full sets" toggle).
- **Building:** must own the full group to build. Houses must be built evenly across
  the group (can't have one tile at 3 houses while another has 0).
- **Rent multiplier by improvement:** base ×1 (unimproved) → ×5 (1 house) →
  ×15 (2 houses) → ×45 (3 houses) → ×80 (4 houses) → ×125 (hotel).
- **House cost:** Price ÷ 2 per house, rounded to nearest ₹50. Hotel = 4 houses + Price.
- **Airports:** rent scales with how many the same player owns — 1: ₹250, 2: ₹500,
  3: ₹1,000, 4: ₹2,000.
- **Utilities:** rent = dice roll × 4 (own 1) or × 10 (own both).
- **Mortgaging:** mortgage an unimproved property for half its price; unmortgage by
  repaying + 10% interest. Mortgaged properties collect no rent.

---

## 5. Jail

- **Enter via:** landing on "Go To Jail", a Chance/Community Chest/Surprise card, or
  3 doubles in a row.
- **Just visiting:** landing on the Jail tile during normal play (not sent there) costs
  nothing — you're just passing through, matches the real Business game.
- **Exit via:** pay ₹1,000 fine (configurable), roll doubles, or use a "Get Out of Jail Free" card.
- **Max stay:** 3 turns — on the 3rd turn, fine payment is forced automatically.

---

## 6. Non-Property Special Tiles

- **Club House (tile 17):** flat ₹100 fee to the bank. Small, frequent, keeps cash
  moving early game — authentic Business game tile Monopoly doesn't have.
- **Rest House (tile 33):** landing here skips your entire next turn (no dice roll
  at all that turn) — also authentic to the real Business game, and a nice
  mid/late-game tempo swing since it's placed on the expensive side of the board.
- **Free Parking (tile 20):** Labeled as "Vacation" in the UI. Configurable via
  "Vacation jackpot" toggle — when enabled, landing here earns accumulated tax pool.
  Default: off (no jackpot, strict classic rules).

---

## 7. Card Decks (draw and resolve immediately, return to bottom of deck)

**Chance** — market/luck swings: move to a specific tile, collect/pay a flat sum,
go to Jail, get a rent-free pass on your next landed property.

**Community Chest** — civic/personal events: pay a per-house repair tax, collect
from every other player, inherit a small sum, advance to GO (no bonus, since GO
gives none in this ruleset).

**Surprise** — the wildcard deck, this is what richup.io lacks entirely: swap
positions with another random player, double rent collected this round, skip
everyone else's next turn, force a mandatory auction on your current tile.

Each deck contains 16 cards, including 1–2 "Get Out of Jail Free" cards that stay
with the player until used or sold.

---

## 8. Trading & Bankruptcy

- Players can trade properties, cash, and Get Out of Jail Free cards freely, any
  time (not just on your turn).
- If a player owes more than they can pay: they must mortgage properties / sell
  houses back to the bank at half price first.
- Still short → bankrupt. Assets go to the creditor (if owed to a player) or back
  to the bank (if owed to the bank, e.g. tax).
- Game ends when one player remains, or by agreed time/lap limit with highest net
  worth winning.

---

## 9. Configurable Rules (toggle per room via WaitingRoom settings panel)

| Rule | Default | Description |
|------|---------|-------------|
| `startingCash` | ₹15,000 | Starting cash per player |
| `passGoBonus` | 0 (No GO bonus) | Cash awarded for passing/landing on GO |
| `freeParkingJackpot` | false | Vacation jackpot — landing on Free Parking earns accumulated tax pool |
| `auctionOnDecline` | true | Declined properties go to auction |
| `rollTwelveToStart` | false | Everyone rolls until someone hits 12 before game starts (offline rule) |
| `maxJailTurns` | 3 | Turns in jail before forced fine |
| `jailFine` | ₹1,000 | Fine to leave jail |
| `doublesJailAfter` | 3 | Consecutive doubles before jail |
| `turnTimerSeconds` | 60 | Turn time limit (UI component exists, server enforcement TBD) |
| `incomeTaxChoice` | true | Income Tax lets player choose flat vs 10% |
| `clubHouseFee` | ₹100 | Club House landing fee |
| `restHouseSkipsFullTurn` | true | Rest House skips your entire next turn |

```json
{
  "startingCash": 15000,
  "passGoBonus": 0,
  "freeParkingJackpot": false,
  "auctionOnDecline": true,
  "rollTwelveToStart": false,
  "maxJailTurns": 3,
  "jailFine": 1000,
  "doublesJailAfter": 3,
  "turnTimerSeconds": 60,
  "incomeTaxChoice": true,
  "clubHouseFee": 100,
  "restHouseSkipsFullTurn": true
}
```

This config object lives in each room's authoritative state — makes "no GO
bonus, international cities, real bank, auctions, Club House, Rest House" the *default*,
not something buried in options.

---

## 10. Visual Theme & UI Design Language

- **Dark Luxe Aesthetic:** Deep void background (`#0b0b12`), glassmorphic surface cards,
  saffron gold (`#f2a93b`) accent highlights throughout.
- **Country Identity:** Each property group has a unique color wash gradient matching
  its country's flag palette. Vector SVG flag crests (not emoji) are used in flag
  bubbles on tiles and property modals.
- **Board Layout:** 11×11 CSS grid with 4-orientation tile system. Tiles rotate text
  to face inward toward the board center. Corner tiles are 1.45× wider/taller.
- **Design References:** richup.io (board layout, tile style, sidebar layout) adapted
  with a premium dark/gold visual identity unique to Vyapar.
- **Reference Files:** `vyapar-components1.html` and `vyapar-components2.html` contain
  static HTML/CSS prototypes of all UI components for design reference.