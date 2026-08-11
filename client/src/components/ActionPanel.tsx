import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { BOARD, canBuyProperty, calculateNetWorth } from '@vyapar/game-logic';

interface ActionPanelProps {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#22C55E', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];

export function ActionPanel({ gameState, playerId, sendIntent }: ActionPanelProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const me = gameState.players.find(p => p.id === playerId);

  if (!me || me.bankrupt) {
    return (
      <div className="action-panel">
        <div className="action-status">
          <span className="status-text">💀 You are bankrupt</span>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'gameOver') {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return (
      <div className="action-panel">
        <div className="action-status game-over">
          <h3>🏆 Game Over!</h3>
          <p>{winner?.name ?? 'Unknown'} wins!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="action-panel">
      {/* Current player indicator */}
      <div className="turn-indicator">
        <div
          className="turn-player-avatar"
          style={{ backgroundColor: PLAYER_COLORS[gameState.currentPlayerIndex] }}
        >
          {currentPlayer?.name[0]?.toUpperCase()}
        </div>
        <div className="turn-info">
          <span className="turn-name">
            {isMyTurn ? 'Your Turn' : `${currentPlayer?.name}'s Turn`}
          </span>
          <span className="turn-phase">{getPhaseLabel(gameState.phase)}</span>
        </div>
      </div>

      {/* Your info */}
      <div className="my-info">
        <div className="my-cash">
          <span className="cash-label">Your Cash</span>
          <span className="cash-value">${me.cash.toLocaleString()}</span>
        </div>
        <div className="my-position">
          <span className="position-label">Position</span>
          <span className="position-value">{BOARD[me.position]?.name}</span>
        </div>
      </div>

      {/* Context-sensitive actions */}
      <div className="action-buttons">
        {isMyTurn && renderActions(gameState, playerId, sendIntent)}
      </div>

      {/* Auction panel */}
      {gameState.phase === 'auction' && gameState.auction && (
        <AuctionPanel
          gameState={gameState}
          playerId={playerId}
          sendIntent={sendIntent}
        />
      )}

      {!isMyTurn && gameState.phase !== 'auction' && (
        <div className="action-waiting">
          <div className="waiting-dots">
            <span>•</span><span>•</span><span>•</span>
          </div>
          <p>Waiting for {currentPlayer?.name}...</p>
        </div>
      )}
    </div>
  );
}

function renderActions(
  gameState: GameState,
  playerId: string,
  sendIntent: (intent: PlayerIntent) => void,
) {
  const { phase } = gameState;
  const player = gameState.players.find(p => p.id === playerId)!;
  const tile = BOARD[player.position];

  switch (phase) {
    case 'rolling':
      return (
        <button
          className="btn btn-primary btn-action"
          onClick={() => sendIntent({ type: 'rollDice' })}
        >
          🎲 Roll Dice
        </button>
      );

    case 'buyDecision':
      return (
        <>
          <div className="buy-info">
            <p>Buy <strong>{tile.name}</strong> for <strong>₹{tile.price?.toLocaleString()}</strong>?</p>
          </div>
          <div className="action-row">
            <button
              className="btn btn-primary btn-action"
              onClick={() => sendIntent({ type: 'buyProperty' })}
              disabled={!canBuyProperty(playerId, player.position, gameState)}
            >
              ✅ Buy
            </button>
            <button
              className="btn btn-secondary btn-action"
              onClick={() => sendIntent({ type: 'declineBuy' })}
            >
              ❌ Pass
            </button>
          </div>
        </>
      );

    case 'payingTax':
      return (
        <>
          <div className="buy-info">
            <p>{tile.name}: Pay ₹{tile.taxAmount?.toLocaleString()} flat or 10% of net worth?</p>
            <p className="tax-hint">
              Net worth: ₹{calculateNetWorth(playerId, gameState).toLocaleString()}
              {' → '}10% = ₹{Math.floor(calculateNetWorth(playerId, gameState) * 0.1).toLocaleString()}
            </p>
          </div>
          <div className="action-row">
            <button
              className="btn btn-primary btn-action"
              onClick={() => sendIntent({ type: 'payTaxFlat' })}
            >
              Pay ₹{tile.taxAmount?.toLocaleString()}
            </button>
            <button
              className="btn btn-secondary btn-action"
              onClick={() => sendIntent({ type: 'payTaxPercent' })}
            >
              Pay 10%
            </button>
          </div>
        </>
      );

    case 'inJail':
      return (
        <>
          <div className="buy-info">
            <p>You're in Jail! (Turn {player.jailTurns + 1}/{gameState.config.maxJailTurns})</p>
          </div>
          <div className="action-column">
            <button
              className="btn btn-primary btn-action"
              onClick={() => sendIntent({ type: 'rollForJail' })}
            >
              🎲 Roll for Doubles
            </button>
            <button
              className="btn btn-secondary btn-action"
              onClick={() => sendIntent({ type: 'payJailFine' })}
              disabled={player.cash < gameState.config.jailFine}
            >
              💰 Pay ₹{gameState.config.jailFine.toLocaleString()} Fine
            </button>
            {player.getOutOfJailFreeCards > 0 && (
              <button
                className="btn btn-secondary btn-action"
                onClick={() => sendIntent({ type: 'useGetOutOfJailCard' })}
              >
                🃏 Use Get Out of Jail Card
              </button>
            )}
          </div>
        </>
      );

    default:
      return null;
  }
}

function AuctionPanel({
  gameState,
  playerId,
  sendIntent,
}: {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}) {
  const auction = gameState.auction!;
  const tile = BOARD[auction.tileIndex];
  const currentBidder = auction.activeParticipants[auction.currentBidderTurnIndex];
  const isMyBid = currentBidder === playerId;
  const minBid = auction.currentBid + 10;

  return (
    <div className="auction-panel">
      <h3>🔨 Auction: {tile.name}</h3>
      <div className="auction-info">
        <span>Current Bid: <strong>₹{auction.currentBid.toLocaleString()}</strong></span>
        {auction.currentBidderId && (
          <span>
            by {gameState.players.find(p => p.id === auction.currentBidderId)?.name}
          </span>
        )}
      </div>
      {isMyBid && (
        <div className="action-row">
          <button
            className="btn btn-primary btn-action"
            onClick={() => sendIntent({ type: 'placeBid', amount: minBid })}
          >
            Bid ₹{minBid.toLocaleString()}
          </button>
          <button
            className="btn btn-primary btn-action"
            onClick={() => sendIntent({ type: 'placeBid', amount: minBid + 100 })}
          >
            Bid ₹{(minBid + 100).toLocaleString()}
          </button>
          <button
            className="btn btn-secondary btn-action"
            onClick={() => sendIntent({ type: 'passAuction' })}
          >
            Pass
          </button>
        </div>
      )}
      {!isMyBid && (
        <p className="auction-waiting">
          Waiting for {gameState.players.find(p => p.id === currentBidder)?.name} to bid...
        </p>
      )}
    </div>
  );
}

function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    rolling: 'Roll dice',
    moving: 'Moving...',
    landed: 'Resolving...',
    buyDecision: 'Buy or pass?',
    auction: 'Auction',
    payingRent: 'Paying rent',
    drawingCard: 'Drawing card...',
    resolvingCard: 'Resolving card...',
    payingTax: 'Tax time',
    inJail: 'In jail',
    trading: 'Trading',
    bankrupt: 'Bankrupt',
    gameOver: 'Game over',
  };
  return labels[phase] ?? phase;
}
