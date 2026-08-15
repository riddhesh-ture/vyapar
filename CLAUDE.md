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
├── client/                   # Vite + React client application
│   ├── index.html            # SEO meta tags, title, entry HTML
│   ├── vite.config.ts        # Vite configuration
│   └── src/
│       ├── main.tsx          # React application entry point
│       ├── App.tsx           # Main router & screen manager (lobby vs waiting room vs game)
│       ├── index.css         # Complete UI design system, dark glassmorphic styling, board CSS
│       ├── hooks/
│       │   └── useVyapar.ts  # WebSocket connection hook wrapping Partysocket
│       └── components/
│           ├── Lobby.tsx     # Home screen: enter player name, create or join room
│           ├── WaitingRoom.tsx# Lobby waiting room: player list, room code copy, game settings
│           ├── Board.tsx     # 40-tile interactive board (11x11 grid, rotated side text, flags)
│           ├── ActionPanel.tsx# Context-sensitive HUD actions (roll, buy, tax, jail, auction)
│           ├── PlayerPanel.tsx# Left sidebar: player cash, position, property counts, status
│           ├── GameLog.tsx   # Right sidebar: real-time event log feed
│           └── GameView.tsx  # Main 3-column gameplay layout
├── server/                   # PartyKit WebSocket server
│   ├── partykit.json         # PartyKit server configuration
│   └── src/
│       └── server.ts         # Authoritative game state machine & room handler
└── packages/
    └── game-logic/           # Shared pure TypeScript logic
        └── src/
            ├── index.ts      # Barrel export
            ├── types.ts      # GameState, Player, Tile, PlayerIntent, ServerMessage interfaces
            ├── board.ts      # 40 tiles, country groups, flags, airport indices, base rent
            ├── config.ts     # Default GameConfig parameters
            ├── dice.ts       # Dice rolling logic, doubles tracking, movement helpers
            ├── rent.ts       # Rent calculations for properties, airports, and utilities
            ├── property.ts   # Buying, building houses/hotels, mortgage calculations
            ├── jail.ts       # Jail entry, fine payment, rolling for doubles, card release
            ├── tax.ts        # Income tax (flat vs 10% net worth), wealth tax calculations
            ├── cards.ts      # Decks (Chance, Community Chest, Surprise) & card execution
            └── player.ts     # Player CRUD, cash transfers, liquidation & bankruptcy logic
```

---

## How Everything Works

### 1. Architecture & State Management
- **Authoritative Server Pattern:** The PartyKit server (`server/src/server.ts`) holds the single source of truth for `GameState`.
- **Client Intent:** The client sends lightweight actions called `PlayerIntent` (e.g. `rollDice`, `buyProperty`, `placeBid`) over WebSocket using `Partysocket`.
- **State Broadcast:** Whenever the server mutates the state in response to an intent, it broadcasts the full updated `GameState` object back to all connected clients in the room.
- **Client Rendering:** The React client (`useVyapar`) receives the updated state and re-renders pure visual components.

### 2. Board & Theme Specs
- **Theme:** International business theme featuring 8 Country Property Groups with flag emojis:
  - **Group A (Brazil 🇧🇷):** Salvador, Rio de Janeiro ($600)
  - **Group B (France 🇫🇷):** Paris, Lyon, Toulouse ($1,000)
  - **Group C (China 🇨🇳):** Shanghai, Beijing, Shenzhen ($1,400)
  - **Group D (Japan 🇯🇵):** Tokyo, Osaka, Kyoto ($1,800)
  - **Group E (Italy 🇮🇹):** Rome, Milan, Venice ($2,200)
  - **Group F (Germany 🇩🇪):** Berlin, Munich, Frankfurt ($2,600)
  - **Group G (United Kingdom 🇬🇧):** London, Manchester, Liverpool ($3,000)
  - **Group H (United States 🇺🇸):** New York, San Francisco ($3,800)
- **Airports ✈️:** Replaced traditional railways with JFK Airport (5), CDG Airport (15), Heathrow Airport (25), Narita Airport (35).
- **Currency:** All monetary values use `$ USD` (starting cash $15,000).
- **Language:** Clean English-only interface ("VYAPAR" header branding).

### 3. Board UI Layout (Luxury Edition)
- **11x11 Grid Layout:** Corner tiles set to `2fr` / `2.2fr` size for higher prominence.
- **4-Orientation Rotated Tile System:**
  - `tile-left`: Rotated 90° (`transform: rotate(90deg)`) facing inward toward the center; owner strip on outer left edge, flag bubble on inner right edge (`right: -12px`).
  - `tile-right`: Rotated -90° (`transform: rotate(-90deg)`) facing inward toward the center; owner strip on outer right edge, flag bubble on inner left edge (`left: -12px`).
  - `tile-top`: Standard vertical column facing down; owner strip on outer top edge, flag bubble on inner bottom edge (`bottom: -12px`).
  - `tile-bottom`: Standard vertical column facing up; owner strip on outer bottom edge, flag bubble on inner top edge (`top: -12px`).
- **Luxury Aesthetic Elements:**
  - **Flag Bubbles (`.flag-bubble`):** Spherical 3D flag badges positioned on inner edges with radial shading and border glow.
  - **Owner Strips (`.owner-strip`):** Border indicator stripes (`.owner-unclaimed`, `.owner-p1`, `.owner-p2`, etc.) with diagonal stripe patterns and glowing player colors.
  - **Micro-Perforations (`.perf-h` / `.perf-v`):** Subtly dotted perforation lines across tickets for a luxury printed feel.
  - **Clean Typography & Badges:** `Fraunces` serif property titles, uppercase category subtitles, and high-contrast `.tile-price` pills with saffron currency accents.
  - **Goti Token Slots (`.goti-slot-box`):** Clean player piece positioning away from flag bubbles with hidden empty states.

---

## Accomplished Work
- [x] Full game-logic pure TypeScript package with 100% rule coverage per `game-design.md`.
- [x] PartyKit authoritative server handling complete game loop (lobby, turns, dice rolls, tile resolution, auctions, tax choices, card drawing, jail, bankruptcy).
- [x] Client connection layer (`useVyapar`) built on `partysocket`.
- [x] Complete React component set: `Lobby`, `WaitingRoom`, `Board`, `ActionPanel`, `PlayerPanel`, `GameLog`, `GameView`.
- [x] Rich visual redesign: Dark theme, glassmorphic cards, gold accent highlights, RichUp.io-style board layout with rotated side text and flag icons.
- [x] End-to-end verified multi-player real-time synchronization over local dev environment.

---

## Next Steps
1. **Auction UI Polish:** Enhancing visual animations and bid history.
2. **Card Effect UI:** Adding pop-up animations when drawing Chance/Community Chest/Surprise cards.
3. **Building Houses/Hotels UI:** Interactive property manager for upgrading owned color sets.
4. **Trading System:** Implementing trade proposals (properties + cash exchange between players).
5. **Animations & Sound:** Token smooth movement animations, dice roll animation.
6. **Mobile Responsiveness:** Adapting 3-column layout for smaller screen viewports.
7. **Deployment:** Deploying frontend to Cloudflare Pages and backend to PartyKit Cloud.

---

## Key Decisions & Conventions
- **Direct TS Source Export:** `@vyapar/game-logic` exports raw `.ts` files so both Vite and PartyKit compile it natively without a pre-build step.
- **Full State Sync:** Server broadcasts full `GameState` on every turn change/mutation.
- **Card Decks:** 16 cards per deck (Chance, Community Chest, Surprise). "Get Out of Jail Free" cards remain with player until played.
- **Hotel Rule:** Hotel cost = 4 houses + listed property price.
