import {
  Server,
  routePartykitRequest,
  type Connection,
  type ConnectionContext,
  type WSMessage,
} from 'partyserver';
import type {
  GameState,
  GameConfig,
  Player,
  PlayerIntent,
  ServerMessage,
  GamePhase,
  DiceRoll,
} from '@vyapar/game-logic';
import {
  DEFAULT_CONFIG,
  BOARD,
  BOARD_SIZE,
  createPlayer,
  initializeProperties,
  createShuffledDecks,
  rollDice,
  movePosition,
  moveBackward,
  calculateRent,
  canBuyProperty,
  sendToJail,
  releaseFromJail,
  incrementJailTurn,
  canPayJailFine,
  canUseJailCard,
  isJailFineForced,
  resolveTax,
  drawCard,
  returnJailCard,
  findNearestTile,
  getActivePlayers,
  isGameOver,
  getWinner,
  transferMoney,
  canAfford,
  canMortgage,
  getMortgageValue,
  canUnmortgage,
  getUnmortgageCost,
  canBuildHouse,
  getBuildCost,
  canSellHouse,
  getHouseSellPrice,
} from '@vyapar/game-logic';

// ─── Cloudflare Durable Object Server ────────────────────────

export class VyaparServer extends Server {
  static options = {
    hibernate: true,
  };

  state!: GameState;

  /** Map connection ID → player ID */
  connectionToPlayer: Map<string, string> = new Map();

  onStart() {
    this.state = this.createWaitingState(this.name);
  }

  // ── Lifecycle ────────────────────────────────────────────────

  onConnect(conn: Connection, ctx: ConnectionContext) {
    if (!this.state) {
      this.state = this.createWaitingState(this.name);
    }
    const playerId = conn.id;

    // If game is in progress, check if this is a reconnect
    const existingPlayer = this.state.players.find(p => p.id === playerId);

    if (!existingPlayer && this.state.phase !== 'waiting') {
      // Game already started and not an existing player, reject
      this.sendTo(conn, {
        type: 'error',
        message: 'Game already in progress. Cannot join as a new player.',
      });
      return;
    }

    if (!existingPlayer && this.state.phase === 'waiting') {
      // New player joining the lobby
      if (this.state.players.length >= 8) {
        this.sendTo(conn, {
          type: 'error',
          message: 'Room is full (max 8 players).',
        });
        return;
      }

      const player = createPlayer(
        playerId,
        `Player ${this.state.players.length + 1}`,
        this.state.config.startingCash,
      );
      this.state.players.push(player);

      this.addLog(`${player.name} joined the room.`);
    }

    this.connectionToPlayer.set(conn.id, playerId);

    // Send room info to the connecting player
    this.sendTo(conn, {
      type: 'roomInfo',
      roomId: this.name,
      playerId,
    });

    // Broadcast updated state to all
    this.broadcastState();
  }

  onClose(conn: Connection) {
    const playerId = this.connectionToPlayer.get(conn.id);
    this.connectionToPlayer.delete(conn.id);

    if (playerId && this.state && this.state.phase === 'waiting') {
      // Remove from lobby
      this.state.players = this.state.players.filter(p => p.id !== playerId);
      this.addLog(`A player left the room.`);
      this.broadcastState();
    }
    // During game: player stays in state (they might reconnect)
  }

  onMessage(sender: Connection, message: WSMessage) {
    let intent: PlayerIntent;
    try {
      const text = typeof message === 'string' ? message : new TextDecoder().decode(message);
      intent = JSON.parse(text) as PlayerIntent;
    } catch {
      this.sendTo(sender, { type: 'error', message: 'Invalid message format.' });
      return;
    }

    const playerId = this.connectionToPlayer.get(sender.id);
    if (!playerId) {
      this.sendTo(sender, { type: 'error', message: 'Not connected.' });
      return;
    }

    try {
      this.handleIntent(playerId, intent);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.sendTo(sender, { type: 'error', message: msg });
    }
  }

  // ── Intent Handler ───────────────────────────────────────────

  handleIntent(playerId: string, intent: PlayerIntent): void {
    switch (intent.type) {
      case 'setName':
        this.handleSetName(playerId, intent.name);
        break;
      case 'setGoti':
        this.handleSetGoti(playerId, intent.gotiId);
        break;
      case 'updateConfig':
        this.handleUpdateConfig(playerId, intent.config);
        break;
      case 'startGame':
        this.handleStartGame(playerId);
        break;
      case 'resetGame':
        this.handleResetGame(playerId);
        break;
      case 'rollDice':
        this.handleRollDice(playerId);
        break;
      case 'buyProperty':
        this.handleBuyProperty(playerId);
        break;
      case 'declineBuy':
        this.handleDeclineBuy(playerId);
        break;
      case 'placeBid':
        this.handlePlaceBid(playerId, intent.amount);
        break;
      case 'passAuction':
        this.handlePassAuction(playerId);
        break;
      case 'buildHouse':
        this.handleBuildHouse(playerId, intent.tileIndex);
        break;
      case 'sellHouse':
        this.handleSellHouse(playerId, intent.tileIndex);
        break;
      case 'mortgage':
        this.handleMortgage(playerId, intent.tileIndex);
        break;
      case 'unmortgage':
        this.handleUnmortgage(playerId, intent.tileIndex);
        break;
      case 'payJailFine':
        this.handlePayJailFine(playerId);
        break;
      case 'useGetOutOfJailCard':
        this.handleUseJailCard(playerId);
        break;
      case 'rollForJail':
        this.handleRollForJail(playerId);
        break;
      case 'payTaxFlat':
        this.handlePayTax(playerId, 'flat');
        break;
      case 'payTaxPercent':
        this.handlePayTax(playerId, 'percent');
        break;
      case 'endTurn':
        this.handleEndTurn(playerId);
        break;
      default:
        throw new Error(`Unhandled intent: ${(intent as { type: string }).type}`);
    }

    this.broadcastState();
  }

  // ── Lobby ────────────────────────────────────────────────────

  handleSetName(playerId: string, name: string): void {
    const player = this.getPlayer(playerId);
    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) throw new Error('Name cannot be empty.');
    player.name = trimmed;
    this.addLog(`${player.name} updated their name.`);
  }

  handleSetGoti(playerId: string, gotiId: string): void {
    const player = this.getPlayer(playerId);
    player.gotiId = gotiId;
  }

  handleResetGame(playerId: string): void {
    const roomPlayers = this.state.players.map(p => ({
      ...p,
      cash: this.state.config.startingCash,
      position: 0,
      inJail: false,
      jailTurns: 0,
      getOutOfJailFreeCards: 0,
      bankrupt: false,
      skipNextTurn: false,
      rentFreePass: false,
      rentCollectionMultiplier: 1,
    }));
    this.state = this.createWaitingState(this.name);
    this.state.players = roomPlayers;
    this.addLog('Game reset to lobby.');
  }

  handleMortgage(playerId: string, tileIndex: number): void {
    if (this.state.phase === 'waiting' || this.state.phase === 'gameOver') {
      throw new Error('Cannot mortgage right now.');
    }
    const player = this.getPlayer(playerId);
    if (!canMortgage(playerId, tileIndex, this.state)) {
      throw new Error('Cannot mortgage this property.');
    }
    const tile = BOARD[tileIndex];
    const prop = this.state.properties[tileIndex];
    const val = getMortgageValue(tileIndex);
    prop.mortgaged = true;
    player.cash += val;
    this.addLog(`${player.name} mortgaged ${tile.name} for ₹${val}.`);
  }

  handleUnmortgage(playerId: string, tileIndex: number): void {
    if (this.state.phase === 'waiting' || this.state.phase === 'gameOver') {
      throw new Error('Cannot unmortgage right now.');
    }
    const player = this.getPlayer(playerId);
    if (!canUnmortgage(playerId, tileIndex, this.state)) {
      throw new Error('Cannot unmortgage this property.');
    }
    const tile = BOARD[tileIndex];
    const prop = this.state.properties[tileIndex];
    const cost = getUnmortgageCost(tileIndex);
    player.cash -= cost;
    prop.mortgaged = false;
    this.addLog(`${player.name} lifted mortgage on ${tile.name} for ₹${cost}.`);
  }

  handleBuildHouse(playerId: string, tileIndex: number): void {
    if (this.state.phase === 'waiting' || this.state.phase === 'gameOver') {
      throw new Error('Cannot build right now.');
    }
    const player = this.getPlayer(playerId);
    if (!canBuildHouse(playerId, tileIndex, this.state)) {
      throw new Error('Cannot build on this property.');
    }
    const tile = BOARD[tileIndex];
    const prop = this.state.properties[tileIndex];
    const cost = getBuildCost(tileIndex, prop.houses);
    player.cash -= cost;
    prop.houses += 1;
    const upgradeType = prop.houses === 5 ? 'a Hotel 🏨' : `House #${prop.houses} 🏠`;
    this.addLog(`${player.name} built ${upgradeType} on ${tile.name} for ₹${cost}.`);
  }

  handleSellHouse(playerId: string, tileIndex: number): void {
    if (this.state.phase === 'waiting' || this.state.phase === 'gameOver') {
      throw new Error('Cannot sell houses right now.');
    }
    const player = this.getPlayer(playerId);
    if (!canSellHouse(playerId, tileIndex, this.state)) {
      throw new Error('Cannot sell house from this property.');
    }
    const tile = BOARD[tileIndex];
    const prop = this.state.properties[tileIndex];
    const refund = getHouseSellPrice(tileIndex, prop.houses);
    prop.houses -= 1;
    player.cash += refund;
    this.addLog(`${player.name} sold a house from ${tile.name} for ₹${refund}.`);
  }

  handleUpdateConfig(playerId: string, config: Partial<GameConfig>): void {
    if (this.state.phase !== 'waiting') throw new Error('Cannot change config during game.');
    // Only first player (host) can change config
    if (this.state.players[0]?.id !== playerId) throw new Error('Only the host can change settings.');
    this.state.config = { ...this.state.config, ...config };
    this.addLog('Game settings updated.');
  }

  handleStartGame(playerId: string): void {
    if (this.state.phase !== 'waiting') throw new Error('Game already started.');
    if (this.state.players[0]?.id !== playerId) throw new Error('Only the host can start the game.');
    if (this.state.players.length < 2) throw new Error('Need at least 2 players.');

    // Determine turn order: highest single die roll goes first
    const rolls = this.state.players.map(p => ({
      id: p.id,
      roll: Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6),
    }));
    rolls.sort((a, b) => b.roll - a.roll);
    this.state.turnOrder = rolls.map(r => r.id);

    // Reorder players array to match turn order
    const playerMap = new Map(this.state.players.map(p => [p.id, p]));
    this.state.players = this.state.turnOrder.map(id => playerMap.get(id)!);

    // Initialize board
    this.state.properties = initializeProperties();
    this.state.decks = createShuffledDecks();
    this.state.currentPlayerIndex = 0;
    this.state.phase = 'rolling';
    this.state.doublesCount = 0;

    this.addLog(`Game started! ${this.state.players[0].name} goes first.`);
  }

  // ── Rolling & Movement ───────────────────────────────────────

  handleRollDice(playerId: string): void {
    this.assertCurrentPlayer(playerId);
    this.assertPhase('rolling');

    const player = this.getCurrentPlayer();
    const dice = rollDice();
    this.state.dice = dice;

    this.addLog(`${player.name} rolled ${dice.die1} + ${dice.die2} = ${dice.total}.`);

    // Check for 3 consecutive doubles → jail
    if (dice.isDoubles) {
      this.state.doublesCount += 1;
      if (this.state.doublesCount >= this.state.config.doublesJailAfter) {
        this.addLog(`${player.name} rolled doubles ${this.state.doublesCount} times — go to Jail!`);
        this.goToJail(player);
        this.state.phase = 'rolling';
        this.advanceTurn();
        return;
      }
    } else {
      this.state.doublesCount = 0;
    }

    // Move
    const { newPosition, passedGo } = movePosition(player.position, dice.total);
    player.position = newPosition;

    // Pass GO bonus
    if (passedGo && this.state.config.passGoBonus > 0) {
      player.cash += this.state.config.passGoBonus;
      this.addLog(`${player.name} passed GO and collected ₹${this.state.config.passGoBonus}.`);
    }

    this.addLog(`${player.name} landed on ${BOARD[newPosition].name}.`);

    // Resolve tile
    this.resolveTile(player);
  }

  // ── Tile Resolution ──────────────────────────────────────────

  resolveTile(player: Player): void {
    const tile = BOARD[player.position];

    switch (tile.type) {
      case 'property':
      case 'railway':
      case 'utility': {
        const prop = this.state.properties[tile.index];
        if (!prop) break;

        if (prop.ownerId === null) {
          // Unowned — buy decision
          if (canBuyProperty(player.id, tile.index, this.state)) {
            this.state.phase = 'buyDecision';
          } else if (this.state.config.auctionOnDecline) {
            this.startAuction(tile.index);
          } else {
            this.state.phase = 'rolling';
            this.finishTurnOrContinue();
          }
        } else if (prop.ownerId !== player.id && !prop.mortgaged) {
          // Owned by someone else — pay rent
          const rentResult = calculateRent(tile.index, player.id, this.state);
          if (rentResult) {
            this.payRent(player, rentResult.amount, rentResult.ownerId);
          } else {
            this.finishTurnOrContinue();
          }
        } else {
          // Own property or mortgaged — nothing happens
          this.finishTurnOrContinue();
        }
        break;
      }

      case 'tax':
        if (tile.taxPercentOption && this.state.config.incomeTaxChoice) {
          // Income Tax — player must choose
          this.state.phase = 'payingTax';
        } else {
          // Wealth Tax or Income Tax without choice — pay flat
          const amount = tile.taxAmount ?? 0;
          player.cash -= amount;
          this.addLog(`${player.name} paid ₹${amount} in ${tile.name}.`);
          this.finishTurnOrContinue();
        }
        break;

      case 'card': {
        const deckType = tile.deck!;
        const deckKey = deckType as keyof typeof this.state.decks;
        const result = drawCard(this.state.decks[deckKey]);

        if (!result) {
          this.finishTurnOrContinue();
          break;
        }

        this.state.decks[deckKey] = result.remainingDeck;
        this.state.currentCard = result.card;
        this.addLog(`${player.name} drew: "${result.card.text}"`);

        this.resolveCardEffect(player, result.card);
        break;
      }

      case 'corner':
        if (tile.cornerType === 'goToJail') {
          this.addLog(`${player.name} landed on Go To Jail!`);
          this.goToJail(player);
          this.finishTurnOrContinue();
        } else {
          // GO, Free Parking, Just Visiting — nothing happens
          this.finishTurnOrContinue();
        }
        break;

      case 'fee': {
        // Club House
        const fee = tile.fee ?? this.state.config.clubHouseFee;
        player.cash -= fee;
        this.addLog(`${player.name} paid ₹${fee} at ${tile.name}.`);
        this.finishTurnOrContinue();
        break;
      }

      case 'skip':
        // Rest House
        if (this.state.config.restHouseSkipsFullTurn) {
          player.skipNextTurn = true;
          this.addLog(`${player.name} landed on Rest House — will skip next turn.`);
        }
        this.finishTurnOrContinue();
        break;
    }
  }

  // ── Card Resolution ──────────────────────────────────────────

  resolveCardEffect(player: Player, card: typeof this.state.currentCard & {}): void {
    const effect = card.effect;

    switch (effect.type) {
      case 'advanceToGo':
      case 'moveTo': {
        const target = effect.tileIndex ?? 0;
        // Check if passing GO
        if (target < player.position && this.state.config.passGoBonus > 0) {
          player.cash += this.state.config.passGoBonus;
        }
        player.position = target;
        // Resolve the destination tile
        this.resolveTile(player);
        return; // resolveTile handles phase transition
      }

      case 'moveBack': {
        const spaces = effect.spaces ?? 0;
        player.position = moveBackward(player.position, spaces);
        this.resolveTile(player);
        return;
      }

      case 'moveToNearest': {
        const target = findNearestTile(player.position, effect.nearestType ?? 'railway');
        // Check if passing GO
        if (target < player.position && this.state.config.passGoBonus > 0) {
          player.cash += this.state.config.passGoBonus;
        }
        player.position = target;
        // For now, resolve normally (double rent handling is a TODO)
        this.resolveTile(player);
        return;
      }

      case 'collectFromBank':
        player.cash += effect.amount ?? 0;
        this.addLog(`${player.name} collected ₹${effect.amount} from the bank.`);
        break;

      case 'payToBank':
        player.cash -= effect.amount ?? 0;
        this.addLog(`${player.name} paid ₹${effect.amount} to the bank.`);
        break;

      case 'collectFromAll': {
        const amount = effect.amount ?? 0;
        const others = this.state.players.filter(p => p.id !== player.id && !p.bankrupt);
        for (const other of others) {
          other.cash -= amount;
          player.cash += amount;
        }
        this.addLog(`${player.name} collected ₹${amount} from each player.`);
        break;
      }

      case 'payPerHouseHotel': {
        const perHouse = effect.perHouse ?? 0;
        const perHotel = effect.perHotel ?? 0;
        let total = 0;
        for (const prop of Object.values(this.state.properties)) {
          if (prop.ownerId !== player.id) continue;
          if (prop.houses === 5) total += perHotel;
          else total += prop.houses * perHouse;
        }
        player.cash -= total;
        this.addLog(`${player.name} paid ₹${total} for property repairs.`);
        break;
      }

      case 'goToJail':
        this.goToJail(player);
        break;

      case 'getOutOfJailFree':
        player.getOutOfJailFreeCards += 1;
        this.addLog(`${player.name} received a Get Out of Jail Free card.`);
        break;

      case 'rentFreePass':
        player.rentFreePass = true;
        this.addLog(`${player.name} has a rent-free pass for the next landing.`);
        break;

      case 'swapPosition': {
        const others = this.state.players.filter(p => p.id !== player.id && !p.bankrupt);
        if (others.length > 0) {
          const target = others[Math.floor(Math.random() * others.length)];
          const temp = player.position;
          player.position = target.position;
          target.position = temp;
          this.addLog(`${player.name} swapped positions with ${target.name}!`);
        }
        break;
      }

      case 'doubleRent':
        player.rentCollectionMultiplier = 2;
        this.addLog(`${player.name}'s rent collection is doubled this round!`);
        break;

      case 'skipOthersTurn': {
        const others = this.state.players.filter(p => p.id !== player.id && !p.bankrupt);
        for (const other of others) {
          other.skipNextTurn = true;
        }
        this.addLog(`All other players will skip their next turn!`);
        break;
      }

      case 'forceAuction': {
        const tile = BOARD[player.position];
        const prop = this.state.properties[player.position];
        if (prop && (tile.type === 'property' || tile.type === 'railway' || tile.type === 'utility')) {
          this.startAuction(player.position);
          return; // Auction handles phase transition
        }
        break;
      }
    }

    this.state.currentCard = null;
    this.finishTurnOrContinue();
  }

  // ── Buy / Auction ────────────────────────────────────────────

  handleBuyProperty(playerId: string): void {
    this.assertCurrentPlayer(playerId);
    this.assertPhase('buyDecision');

    const player = this.getCurrentPlayer();
    const tile = BOARD[player.position];
    const prop = this.state.properties[tile.index];

    if (!tile.price || !prop || prop.ownerId !== null) {
      throw new Error('Cannot buy this property.');
    }

    if (!canAfford(player, tile.price)) {
      throw new Error('Not enough cash.');
    }

    player.cash -= tile.price;
    prop.ownerId = player.id;
    this.addLog(`${player.name} bought ${tile.name} for ₹${tile.price}.`);

    this.finishTurnOrContinue();
  }

  handleDeclineBuy(playerId: string): void {
    this.assertCurrentPlayer(playerId);
    this.assertPhase('buyDecision');

    const player = this.getCurrentPlayer();
    const tile = BOARD[player.position];
    this.addLog(`${player.name} declined to buy ${tile.name}.`);

    if (this.state.config.auctionOnDecline) {
      this.startAuction(tile.index);
    } else {
      this.finishTurnOrContinue();
    }
  }

  startAuction(tileIndex: number): void {
    const activePlayers = getActivePlayers(this.state.players);
    this.state.auction = {
      tileIndex,
      currentBid: 0,
      currentBidderId: null,
      activeParticipants: activePlayers.map(p => p.id),
      currentBidderTurnIndex: 0,
      passed: [],
    };
    this.state.phase = 'auction';
    this.addLog(`Auction started for ${BOARD[tileIndex].name}!`);
  }

  handlePlaceBid(playerId: string, amount: number): void {
    this.assertPhase('auction');
    const auction = this.state.auction!;

    // Verify it's this player's turn to bid
    const currentBidderId = auction.activeParticipants[auction.currentBidderTurnIndex];
    if (currentBidderId !== playerId) throw new Error('Not your turn to bid.');

    const player = this.getPlayer(playerId);
    if (amount <= auction.currentBid) throw new Error('Bid must be higher than current bid.');
    if (!canAfford(player, amount)) throw new Error('Cannot afford this bid.');

    auction.currentBid = amount;
    auction.currentBidderId = playerId;
    this.addLog(`${player.name} bid ₹${amount}.`);

    this.advanceAuction();
  }

  handlePassAuction(playerId: string): void {
    this.assertPhase('auction');
    const auction = this.state.auction!;

    const currentBidderId = auction.activeParticipants[auction.currentBidderTurnIndex];
    if (currentBidderId !== playerId) throw new Error('Not your turn to bid.');

    const player = this.getPlayer(playerId);
    auction.passed.push(playerId);
    auction.activeParticipants = auction.activeParticipants.filter(id => id !== playerId);
    this.addLog(`${player.name} passed on the auction.`);

    // Check if auction is over
    if (auction.activeParticipants.length <= 1 && auction.currentBidderId) {
      this.resolveAuction();
    } else if (auction.activeParticipants.length === 0) {
      // Nobody bid
      this.addLog('No one bid. Property remains unowned.');
      this.state.auction = null;
      this.finishTurnOrContinue();
    } else {
      // Adjust index since we removed a player
      if (auction.currentBidderTurnIndex >= auction.activeParticipants.length) {
        auction.currentBidderTurnIndex = 0;
      }
      // If only the current highest bidder remains, they win
      if (auction.activeParticipants.length === 1 && auction.currentBidderId === auction.activeParticipants[0]) {
        this.resolveAuction();
      }
    }
  }

  advanceAuction(): void {
    const auction = this.state.auction!;
    auction.currentBidderTurnIndex = (auction.currentBidderTurnIndex + 1) % auction.activeParticipants.length;

    // Skip the current highest bidder (they already bid)
    if (auction.activeParticipants[auction.currentBidderTurnIndex] === auction.currentBidderId) {
      if (auction.activeParticipants.length === 1) {
        this.resolveAuction();
      } else {
        auction.currentBidderTurnIndex = (auction.currentBidderTurnIndex + 1) % auction.activeParticipants.length;
      }
    }
  }

  resolveAuction(): void {
    const auction = this.state.auction!;
    if (!auction.currentBidderId || auction.currentBid <= 0) {
      this.addLog('Auction ended with no valid bid. Property remains unowned.');
      this.state.auction = null;
      this.finishTurnOrContinue();
      return;
    }

    const winner = this.getPlayer(auction.currentBidderId);
    const tile = BOARD[auction.tileIndex];
    const prop = this.state.properties[auction.tileIndex];

    winner.cash -= auction.currentBid;
    prop.ownerId = winner.id;
    this.addLog(`${winner.name} won the auction for ${tile.name} at ₹${auction.currentBid}.`);

    this.state.auction = null;
    this.finishTurnOrContinue();
  }

  // ── Rent ─────────────────────────────────────────────────────

  payRent(player: Player, amount: number, ownerId: string): void {
    const owner = this.getPlayer(ownerId);

    // Clear rent-free pass if it was active
    if (player.rentFreePass) {
      player.rentFreePass = false;
      this.addLog(`${player.name} used their rent-free pass!`);
      this.finishTurnOrContinue();
      return;
    }

    player.cash -= amount;
    owner.cash += amount;
    this.addLog(`${player.name} paid ₹${amount} rent to ${owner.name}.`);

    // Reset owner's rent multiplier after collection
    if (owner.rentCollectionMultiplier !== 1) {
      owner.rentCollectionMultiplier = 1;
    }

    this.finishTurnOrContinue();
  }

  // ── Jail ─────────────────────────────────────────────────────

  handlePayJailFine(playerId: string): void {
    this.assertCurrentPlayer(playerId);
    const player = this.getCurrentPlayer();
    if (!player.inJail) throw new Error('Not in jail.');

    if (!canPayJailFine(player, this.state.config)) {
      throw new Error('Cannot afford jail fine.');
    }

    player.cash -= this.state.config.jailFine;
    const freed = releaseFromJail(player);
    Object.assign(player, freed);
    this.addLog(`${player.name} paid ₹${this.state.config.jailFine} to get out of jail.`);
    this.state.phase = 'rolling';
  }

  handleUseJailCard(playerId: string): void {
    this.assertCurrentPlayer(playerId);
    const player = this.getCurrentPlayer();
    if (!canUseJailCard(player)) throw new Error('No Get Out of Jail Free card.');

    player.getOutOfJailFreeCards -= 1;
    const freed = releaseFromJail(player);
    Object.assign(player, freed);
    this.addLog(`${player.name} used a Get Out of Jail Free card.`);

    // Return card to a random deck (simplified: return to chance)
    // TODO: track which deck the card came from
    this.state.phase = 'rolling';
  }

  handleRollForJail(playerId: string): void {
    this.assertCurrentPlayer(playerId);
    const player = this.getCurrentPlayer();
    if (!player.inJail) throw new Error('Not in jail.');

    const dice = rollDice();
    this.state.dice = dice;
    this.addLog(`${player.name} rolled ${dice.die1} + ${dice.die2} in jail.`);

    if (dice.isDoubles) {
      const freed = releaseFromJail(player);
      Object.assign(player, freed);
      this.addLog(`Doubles! ${player.name} is free!`);

      // Move with the roll
      const { newPosition, passedGo } = movePosition(player.position, dice.total);
      player.position = newPosition;
      if (passedGo && this.state.config.passGoBonus > 0) {
        player.cash += this.state.config.passGoBonus;
      }
      this.addLog(`${player.name} landed on ${BOARD[newPosition].name}.`);
      this.resolveTile(player);
    } else {
      const updated = incrementJailTurn(player);
      Object.assign(player, updated);

      // Check if forced to pay on max jail turns
      if (isJailFineForced(player, this.state.config)) {
        player.cash -= this.state.config.jailFine;
        const freed = releaseFromJail(player);
        Object.assign(player, freed);
        this.addLog(`${player.name} was forced to pay ₹${this.state.config.jailFine} after ${this.state.config.maxJailTurns} turns in jail.`);
        this.state.phase = 'rolling';
      } else {
        this.addLog(`${player.name} stays in jail. (Turn ${player.jailTurns}/${this.state.config.maxJailTurns})`);
        this.advanceTurn();
      }
    }
  }

  // ── Tax ──────────────────────────────────────────────────────

  handlePayTax(playerId: string, choice: 'flat' | 'percent'): void {
    this.assertCurrentPlayer(playerId);
    this.assertPhase('payingTax');

    const player = this.getCurrentPlayer();
    const amount = resolveTax(player.position, player.id, choice, this.state);
    player.cash -= amount;
    this.addLog(`${player.name} paid ₹${amount} in tax.`);

    this.finishTurnOrContinue();
  }

  // ── Turn Management ──────────────────────────────────────────

  handleEndTurn(playerId: string): void {
    this.assertCurrentPlayer(playerId);
    this.advanceTurn();
  }

  finishTurnOrContinue(): void {
    // Check for game over
    if (isGameOver(this.state.players)) {
      const winner = getWinner(this.state.players);
      this.state.winner = winner?.id ?? null;
      this.state.phase = 'gameOver';
      this.addLog(`Game over! ${winner?.name ?? 'Nobody'} wins!`);
      return;
    }

    // If doubles were rolled, player rolls again (unless sent to jail)
    const player = this.getCurrentPlayer();
    if (this.state.dice?.isDoubles && !player.inJail && this.state.doublesCount > 0) {
      this.state.phase = 'rolling';
      this.addLog(`${player.name} rolled doubles — roll again!`);
    } else {
      this.state.phase = 'rolling';
      this.advanceTurn();
    }
  }

  advanceTurn(): void {
    this.state.doublesCount = 0;
    this.state.dice = null;
    this.state.currentCard = null;

    // Find next non-bankrupt player
    let nextIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    let attempts = 0;
    while (attempts < this.state.players.length) {
      const nextPlayer = this.state.players[nextIndex];
      if (!nextPlayer.bankrupt) {
        // Check for skip (Rest House)
        if (nextPlayer.skipNextTurn) {
          nextPlayer.skipNextTurn = false;
          this.addLog(`${nextPlayer.name}'s turn was skipped (Rest House).`);
          nextIndex = (nextIndex + 1) % this.state.players.length;
          attempts++;
          continue;
        }
        break;
      }
      nextIndex = (nextIndex + 1) % this.state.players.length;
      attempts++;
    }

    this.state.currentPlayerIndex = nextIndex;
    const currentPlayer = this.getCurrentPlayer();

    if (currentPlayer.inJail) {
      this.state.phase = 'inJail';
    } else {
      this.state.phase = 'rolling';
    }
  }

  // ── Helpers ──────────────────────────────────────────────────

  goToJail(player: Player): void {
    const jailed = sendToJail(player);
    Object.assign(player, jailed);
    this.state.doublesCount = 0;
    this.addLog(`${player.name} is in Jail!`);
  }

  getCurrentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex];
  }

  getPlayer(playerId: string): Player {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) throw new Error('Player not found.');
    return player;
  }

  assertCurrentPlayer(playerId: string): void {
    const current = this.getCurrentPlayer();
    if (current.id !== playerId) throw new Error('Not your turn.');
  }

  assertPhase(expected: GamePhase): void {
    if (this.state.phase !== expected) {
      throw new Error(`Invalid action for phase "${this.state.phase}". Expected "${expected}".`);
    }
  }

  addLog(message: string, playerId?: string): void {
    this.state.log.push({
      timestamp: Date.now(),
      message,
      playerId,
    });
    // Keep log manageable
    if (this.state.log.length > 200) {
      this.state.log = this.state.log.slice(-100);
    }
  }

  createWaitingState(roomId: string): GameState {
    return {
      roomId,
      config: { ...DEFAULT_CONFIG },
      players: [],
      properties: {},
      currentPlayerIndex: 0,
      phase: 'waiting',
      dice: null,
      doublesCount: 0,
      decks: { chance: [], communityChest: [], surprise: [] },
      currentCard: null,
      auction: null,
      trade: null,
      turnOrder: [],
      winner: null,
      log: [],
    };
  }

  // ── Messaging ────────────────────────────────────────────────

  sendTo(conn: Connection, message: ServerMessage): void {
    conn.send(JSON.stringify(message));
  }

  broadcastState(): void {
    if (!this.state) {
      this.state = this.createWaitingState(this.name);
    }
    const message: ServerMessage = {
      type: 'gameState',
      state: this.state,
    };
    const serialized = JSON.stringify(message);
    this.broadcast(serialized);
  }
}

// ── Cloudflare Worker Fetch Entrypoint ───────────────────────

export default {
  async fetch(request: Request, env: any, ctx?: any) {
    // 1. Route via partyserver handler
    const partyResponse = await routePartykitRequest(request, env, { cors: true });
    if (partyResponse) return partyResponse;

    // 2. Direct WebSocket upgrade fallback for any room endpoint
    const url = new URL(request.url);
    const doBinding = env.VyaparServer || env.main;
    if (doBinding && request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      const parts = url.pathname.split('/').filter(Boolean);
      const roomId = parts[parts.length - 1] || 'default-room';
      const id = doBinding.idFromName(roomId);
      const stub = doBinding.get(id);
      return stub.fetch(request);
    }

    return new Response('Vyapar Multiplayer Server is running on Cloudflare Workers', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};


