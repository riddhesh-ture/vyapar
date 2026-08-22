# Vyapar — Project Context

## Stack
- **Client:** Vite + React 19 + TypeScript (scaffolded in `client/`)
- **Server:** PartyKit (Cloudflare Durable Objects) — authoritative game state, WebSocket room server (`server/`)
- **Shared Logic:** `@vyapar/game-logic` — pure TS functions for all game rules and state transitions
- **Hosting Target:** Cloudflare Pages (client) + PartyKit deploy (server) — 100% free tier
- **Monorepo:** npm workspaces (`client`, `server`, `packages/game-logic`)

---

## Detailed Folder Structure
```
vyapar/
├── package.json              # npm workspaces root configuration
├── CLAUDE.md                 # Project context & architecture documentation
├── game-design.md            # Rule specification source of truth
├── vyapar-components1.html   # Design reference: flags, tiles, modal, picker, lobby, waiting room
├── vyapar-components2.html   # Design reference: sidebar, goti tokens, action panel, game log
├── client/                   # Vite + React client application
│   ├── index.html            # SEO meta tags, title, entry HTML
│   ├── vite.config.ts        # Vite configuration
│   └── src/
│       ├── main.tsx          # React application entry point
│       ├── App.tsx           # Main router & screen manager (lobby → waiting → game)
│       ├── index.css         # Complete UI design system (~1300 lines): dark glassmorphic styling, board CSS, all component styles
│       ├── gotis.ts          # Goti token definitions (8 prestige vector tokens: falcon, crown, anchor, gem, compass, shield, citadel, medallion)
│       ├── hooks/
│       │   └── useVyapar.ts  # WebSocket connection hook wrapping Partysocket
│       ├── utils/            # Utility functions
│       └── components/
│           ├── GameView.tsx   # Main 3-column gameplay layout (sidebar-left | board | sidebar-right)
│           ├── Board.tsx      # Barrel re-export → board/Board.tsx
│           ├── Lobby.tsx      # Barrel re-export → lobby/Lobby.tsx
│           ├── WaitingRoom.tsx# Barrel re-export → lobby/WaitingRoom.tsx
│           ├── ActionPanel.tsx# Barrel re-export → actions/ActionPanel.tsx
│           ├── PlayerPanel.tsx# Barrel re-export → hud/PlayerPanel.tsx
│           ├── GameLog.tsx    # Barrel re-export → hud/GameLog.tsx
│           ├── PropertyModal.tsx # Barrel re-export → modals/PropertyModal.tsx
│           │
│           ├── board/         # Board & tile rendering
│           │   ├── Board.tsx          # 40-tile interactive board (11×11 CSS grid)
│           │   ├── Tile.tsx           # Individual tile renderer (4-orientation: top/bottom/left/right + corners)
│           │   ├── CenterConsole.tsx  # Board center: wordmark, dice, roll button, auction banner, turn indicator, game log
│           │   ├── DiceStage.tsx      # Dice display with pip-based rendering
│           │   ├── AnimatedDice.tsx   # Animated dice component
│           │   ├── CardPopup.tsx      # Chance/Community Chest/Surprise card reveal popup
│           │   ├── GotiToken.tsx      # Player token (goti) component with size variants (sm/md/lg)
│           │   └── boardUtils.ts      # Board helper functions
│           │
│           ├── lobby/         # Pre-game screens
│           │   ├── Lobby.tsx          # Home screen: player name entry, create/join room, token picker, invite link detection
│           │   ├── WaitingRoom.tsx    # Room lobby: player grid, share URL, game settings, start button
│           │   ├── GotiPicker.tsx     # Token selection grid (8 prestige vector tokens)
│           │   ├── RoomShareBox.tsx   # Copy-to-clipboard room URL component
│           │   └── RuleSettingsCard.tsx # Toggle-based game rules configuration panel
│           │
│           ├── hud/           # In-game HUD panels
│           │   ├── PlayerPanel.tsx    # Left sidebar: player list with active count
│           │   ├── PlayerCard.tsx     # Individual player card: token, name, cash, position, properties, jail/bankrupt status
│           │   ├── PropertyBadge.tsx  # Mini property ownership badge (color-coded, clickable)
│           │   ├── RentBoard.tsx      # Inline rent table for current tile (left sidebar, auto-shows on property tiles)
│           │   ├── GameLog.tsx        # Real-time event log feed (embedded in board center)
│           │   ├── LiveChat.tsx       # Game chat: player messages, emoji reactions, system event stream
│           │   ├── TurnTimerBar.tsx   # Turn countdown timer bar component
│           │   └── CashDeltaBadge.tsx # Animated cash change notification (+/- floating badge)
│           │
│           ├── actions/       # Game action controls
│           │   ├── ActionPanel.tsx    # Right sidebar: turn card, stat boxes, context-sensitive action controls
│           │   ├── TurnControls.tsx   # Phase-specific buttons: roll, buy/auction, tax choice, jail options
│           │   ├── AuctionArena.tsx   # Live auction: bid display, bid/pass buttons, current leader
│           │   └── GameOverCard.tsx   # Victory screen: winner display, trophy, play again button
│           │
│           ├── modals/        # Overlay modals
│           │   └── PropertyModal.tsx  # Property deed inspection: rent table, stats, buy/build/sell/mortgage/unmortgage actions
│           │
│           └── icons/         # SVG icon components
│               └── Icons.tsx          # All vector icons: country crest badges, game icons, UI icons (~21KB)
│
├── server/                    # PartyKit WebSocket server
│   ├── partykit.json          # PartyKit server configuration
│   ├── wrangler.jsonc         # Wrangler config for Cloudflare Workers
│   └── src/
│       └── server.ts          # Authoritative game state machine & room handler
│
└── packages/
    └── game-logic/            # Shared pure TypeScript logic
        └── src/
            ├── index.ts       # Barrel export (types, config, board, dice, rent, property, jail, tax, cards, player)
            ├── types.ts       # GameState, Player, Tile, PlayerIntent, ServerMessage, AuctionState, TradeState, Card interfaces
            ├── board.ts       # 40 tiles, 8 country groups (Brazil→USA), 4 airports, 2 utilities, base rent, rent multipliers
            ├── config.ts      # Default GameConfig parameters (₹15,000 start, no GO bonus, auction on decline, etc.)
            ├── dice.ts        # Dice rolling logic, doubles tracking, movement helpers
            ├── rent.ts        # Rent calculations: properties (base × multiplier), railways (scale by count), utilities (dice × multiplier)
            ├── property.ts    # Buying, building houses/hotels (even-build rule), mortgage/unmortgage calculations
            ├── jail.ts        # Jail entry, fine payment, rolling for doubles, card release, forced fine on max turns
            ├── tax.ts         # Income tax (flat ₹200 vs 10% net worth choice), wealth tax (flat ₹1,500)
            ├── cards.ts       # 3 decks × 16 cards (Chance, Community Chest, Surprise) & card execution
            └── player.ts      # Player CRUD, cash transfers, liquidation value, bankruptcy, active player check, winner detection
```

---

## How Everything Works

### 1. Architecture & State Management
- **Authoritative Server Pattern:** The PartyKit server (`server/src/server.ts`) holds the single source of truth for `GameState`.
- **Client Intent:** The client sends lightweight actions called `PlayerIntent` (e.g. `rollDice`, `buyProperty`, `placeBid`, `chat`, `buildHouse`, `mortgage`) over WebSocket using `Partysocket`.
- **State Broadcast:** Whenever the server mutates the state in response to an intent, it broadcasts the full updated `GameState` object back to all connected clients in the room.
- **Client Rendering:** The React client (`useVyapar`) receives the updated state and re-renders pure visual components.

### 2. Board & Theme Specs
- **Theme:** International business theme featuring 8 Country Property Groups with vector SVG flag crests:
  - **Group A (Brazil 🇧🇷):** Salvador, Rio de Janeiro (₹600)
  - **Group B (France 🇫🇷):** Paris, Lyon, Toulouse (₹1,000)
  - **Group C (China 🇨🇳):** Shanghai, Beijing, Shenzhen (₹1,400)
  - **Group D (Japan 🇯🇵):** Tokyo, Osaka, Kyoto (₹1,800)
  - **Group E (Italy 🇮🇹):** Rome, Milan, Venice (₹2,200)
  - **Group F (Germany 🇩🇪):** Berlin, Munich, Frankfurt (₹2,600)
  - **Group G (United Kingdom 🇬🇧):** London, Manchester, Liverpool (₹3,000)
  - **Group H (United States 🇺🇸):** New York, San Francisco (₹3,800)
- **Airports ✈️:** JFK Airport (5), CDG Airport (15), Heathrow Airport (25), Narita Airport (35) — ₹2,000 each.
- **Utilities:** Power Co. (12), Water Board (28) — ₹1,500 each.
- **Special Tiles:** Club House (17, flat ₹100 fee), Rest House (33, skip next turn).
- **Currency:** ₹ (Rupee). Starting cash ₹15,000.
- **Fonts:** `Fraunces` (serif, property names/wordmark), `IBM Plex Mono` (monospace, prices/cash), `Inter` (sans-serif, body text).
- **Color scheme:** Dark luxe (`#0b0b12` void, `#141420` surface, `#f2a93b` saffron gold accents, glassmorphic borders).

### 3. Board UI Layout (Luxury Edition)
- **11×11 Grid Layout:** Corner tiles at `1.45fr`, regular tiles at `1fr`.
- **4-Orientation Rotated Tile System:**
  - `tile-top` (indices 0–9): Standard column facing down; owner strip on top edge, flag bubble on bottom edge.
  - `tile-right` (indices 10–19): Rotated −90°; owner strip on right edge, flag bubble on left edge (inner).
  - `tile-bottom` (indices 20–29): Standard column facing up; owner strip on bottom edge, flag bubble on top edge.
  - `tile-left` (indices 30–39): Rotated 90°; owner strip on left edge, flag bubble on right edge (inner).
- **Known Issue:** Text and flag orientation on left/right side tiles doesn't perfectly match richup.io reference — text/flag alignment needs fixing (see v2 upgrade plan).
- **Luxury Aesthetic Elements:**
  - **Flag Bubbles (`.flag-bubble`):** Spherical 3D vector SVG flag crests (not emoji) positioned on inner edges.
  - **Owner Strips (`.owner-strip`):** Gradient stripes with glowing player colors (5 player colors supported).
  - **Micro-Perforations (`.perf-h` / `.perf-v`):** Dotted perforation lines for luxury printed feel.
  - **Typography:** `Fraunces` serif titles, saffron `₹` currency symbols, `IBM Plex Mono` prices.
  - **Country Wash Gradients:** Each group has a distinctive gradient background (brazil green, france blue-red, china red, etc.).

### 4. Game View Layout
- **3-Column Grid:** `260px` left sidebar | fluid center | `280px` right sidebar.
- **Left Sidebar:** `PlayerPanel` (player cards with property badges) + `RentBoard` (inline rent table for current tile).
- **Center:** `Board` containing `CenterConsole` (wordmark, dice, roll button, auction banner, turn indicator, card popup, embedded game log).
- **Right Sidebar:** `ActionPanel` (turn card, stat boxes, context-sensitive controls: roll/buy/auction/tax/jail).

### 5. Component Design References
- `vyapar-components1.html` — Design system reference for: vector country flags, property tiles, property modal, token picker, lobby card, waiting room.
- `vyapar-components2.html` — Design system reference for: player sidebar, on-board goti tokens, action panel (all phases), game log.

---

## Accomplished Work
- [x] Full game-logic pure TypeScript package with 100% rule coverage per `game-design.md`.
- [x] PartyKit authoritative server handling complete game loop (lobby, turns, dice rolls, tile resolution, auctions, tax choices, card drawing, jail, bankruptcy, game over, reset).
- [x] Client connection layer (`useVyapar`) built on `partysocket` with error handling.
- [x] Complete React component set organized into 6 directories: `board/`, `lobby/`, `hud/`, `actions/`, `modals/`, `icons/`.
- [x] Rich visual design: Dark luxe theme, glassmorphic cards, gold saffron accents, RichUp.io-inspired board layout.
- [x] 4-orientation tile system with rotated side text and vector SVG flag crest badges (not emoji).
- [x] Property management: build houses/hotels, sell improvements, mortgage/unmortgage via PropertyModal.
- [x] Live auction system with bid/pass mechanics and visual auction arena.
- [x] Player card sidebar with property portfolio badges, jail/bankrupt status indicators.
- [x] Inline rent board (left sidebar) auto-showing for current tile.
- [x] Live chat system with emoji reactions and system event interleaving.
- [x] Game over card with winner display and play again / reset.
- [x] 8 prestige vector goti tokens (falcon, crown, anchor, gem, compass, shield, citadel, medallion).
- [x] Room invite link detection — opening `?room=CODE` auto-fills join form.
- [x] Configurable game rules with toggle UI (no GO bonus, ×2 rent on full sets, vacation jackpot, auction on decline, jail fine).
- [x] End-to-end verified multi-player real-time synchronization over local dev environment.
- [x] Error toast notification system with dismissal.

---

## Next Steps (v2 Upgrade)
1. **Tile Text/Flag Orientation Fix:** Fix text and flag alignment on left/right side tiles to match richup.io reference.
2. **Lobby & Waiting Room Polish:** Animations, improved token picker, better player slot grid, share URL feedback.
3. **Game View & Sidebar Upgrade:** Animated player cards, net worth display, keyboard shortcuts, improved auction UI with bid history.
4. **Board Center & Dice Upgrade:** Dice roll animation (CSS 3D), card reveal flip effect, improved game log with timestamps and icons.
5. **Property Modal Redesign:** Larger flag badge, color wash header, group neighbors display, mortgage warning styling.
6. **Visual Polish & Micro-Animations:** Gold shimmer, border pulse, stagger fade-in, hover tooltips, board glow.
7. **Logic & QoL:** Page transitions, keyboard shortcuts, confetti on win, full player rankings at game over.
8. **Trading System UI:** Trade proposal interface (properties + cash exchange between players).
9. **Mobile Responsiveness:** Proper mobile-first redesign for smaller viewports.
10. **Deployment:** Cloudflare Pages (client) + PartyKit Cloud (server).

---

## Key Decisions & Conventions
- **Direct TS Source Export:** `@vyapar/game-logic` exports raw `.ts` files so both Vite and PartyKit compile it natively without a pre-build step.
- **Full State Sync:** Server broadcasts full `GameState` on every turn change/mutation.
- **Card Decks:** 16 cards per deck (Chance, Community Chest, Surprise). "Get Out of Jail Free" cards remain with player until played.
- **Hotel Rule:** Hotel cost = 4 houses + listed property price. House cost = price ÷ 2, rounded to nearest ₹50.
- **Vector Icons Only:** All flags and game icons are inline SVG — no emoji, no external image dependencies.
- **CSS-Only Styling:** Single `index.css` file contains all styles (~1300 lines). No CSS-in-JS, no Tailwind.
- **Barrel Re-exports:** Root-level component files (e.g. `components/Board.tsx`) re-export from nested directories for backward compatibility.
- **Player Intent Pattern:** All client actions go through `sendIntent()` → server validates → broadcasts updated `GameState`. Client never mutates state directly.
