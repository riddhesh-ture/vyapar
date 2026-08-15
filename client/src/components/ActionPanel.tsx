import type { GameState, PlayerIntent, PropertyGroup } from '@vyapar/game-logic';
import { BOARD, GROUP_FLAGS, GROUP_COUNTRIES, BASE_RENT, canBuyProperty } from '@vyapar/game-logic';

import { getGotiForPlayerIndex } from '../gotis';

interface ActionPanelProps {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

const GROUP_WASHES: Record<PropertyGroup, string> = {
  A: 'brazil',
  B: 'france',
  C: 'china',
  D: 'japan',
  E: 'italy',
  F: 'germany',
  G: 'uk',
  H: 'usa',
};

export function ActionPanel({ gameState, playerId, sendIntent }: ActionPanelProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const me = gameState.players.find(p => p.id === playerId);
  const currentGoti = getGotiForPlayerIndex(gameState.currentPlayerIndex);

  if (!me || me.bankrupt) {
    return (
      <div className="action-panel">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <span style={{ fontSize: '18px' }}>💀 You are bankrupt</span>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'gameOver') {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return (
      <div className="action-panel">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3 className="wordmark" style={{ color: 'var(--saffron)' }}>🏆 Game Over!</h3>
          <p style={{ marginTop: '8px' }}>{winner?.name ?? 'Unknown'} wins!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="action-panel">
      {/* Current Turn Chip */}
      <div className="hud-chip active-turn">
        <div className={`goti ${currentGoti.className}`}>{currentGoti.emoji}</div>
        <div className="hud-info">
          <div className="hud-name">
            {isMyTurn ? 'Your Turn' : `${currentPlayer?.name}'s Turn`}
          </div>
          <div className="hud-cash" style={{ fontSize: '11px', color: 'var(--ink-dim)' }}>
            Phase: {getPhaseLabel(gameState.phase)}
          </div>
        </div>
      </div>

      {/* Your Info */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        <div style={{ flex: 1 }}>
          <div className="sq-kind">Cash</div>
          <div className="hud-cash" style={{ fontSize: '15px' }}><span className="rs">₹</span>{me.cash.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="sq-kind">Position</div>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>{BOARD[me.position]?.name}</div>
        </div>
      </div>

      {/* Context Actions */}
      <div style={{ marginTop: '8px' }}>
        {isMyTurn && renderActions(gameState, playerId, sendIntent)}
      </div>

      {/* Auction */}
      {gameState.phase === 'auction' && gameState.auction && (
        <AuctionSection
          gameState={gameState}
          playerId={playerId}
          sendIntent={sendIntent}
        />
      )}

      {!isMyTurn && gameState.phase !== 'auction' && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink-dim)', fontSize: '13px' }}>
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
          className="btn"
          onClick={() => sendIntent({ type: 'rollDice' })}
          style={{ width: '100%', padding: '14px' }}
        >
          🎲 Roll Dice
        </button>
      );

    case 'buyDecision': {
      if (tile.type !== 'property' || !tile.group || !tile.price) {
        return (
          <div className="modal-btns">
            <button className="btn" onClick={() => sendIntent({ type: 'buyProperty' })}>
              Buy — ₹{tile.price ?? 0}
            </button>
            <button className="btn-ghost" onClick={() => sendIntent({ type: 'declineBuy' })}>
              Decline & Auction
            </button>
          </div>
        );
      }

      const flag = GROUP_FLAGS[tile.group];
      const country = GROUP_COUNTRIES[tile.group];
      const wash = GROUP_WASHES[tile.group];
      const baseRent = BASE_RENT[tile.group];
      const houseCost = Math.round(tile.price / 2 / 50) * 50;

      return (
        <div className="modal-wrap" style={{ margin: '0 auto', width: '100%' }}>
          <div className="modal-flag">{flag}</div>
          <div className="modal-card">
            <div className={`wash ${wash}`}></div>
            <div className="perf"></div>
            <div className="modal-content" style={{ padding: '38px 16px 16px' }}>
              <div className="modal-name" style={{ fontSize: '22px' }}>{tile.name}</div>
              <div className="modal-sub">{country} · Group {tile.group}</div>

              <div className="rent-head"><span>When</span><span>Get</span></div>
              <div className="rent-row"><span>With rent</span><span className="val"><span className="rs">₹</span>{baseRent}</span></div>
              <div className="rent-row"><span>With 1 house</span><span className="val"><span className="rs">₹</span>{baseRent * 5}</span></div>
              <div className="rent-row"><span>With 2 houses</span><span className="val"><span className="rs">₹</span>{baseRent * 15}</span></div>
              <div className="rent-row"><span>With 3 houses</span><span className="val"><span className="rs">₹</span>{baseRent * 45}</span></div>
              <div className="rent-row"><span>With 4 houses</span><span className="val"><span className="rs">₹</span>{baseRent * 80}</span></div>
              <div className="rent-row"><span>With a hotel</span><span className="val"><span className="rs">₹</span>{baseRent * 125}</span></div>

              <div className="stat-row" style={{ marginTop: '12px', paddingTop: '10px' }}>
                <div className="stat"><div className="stat-label">Price</div><div className="stat-val">₹{tile.price}</div></div>
                <div className="stat"><div className="stat-label">House</div><div className="stat-val">₹{houseCost}</div></div>
                <div className="stat"><div className="stat-label">Hotel</div><div className="stat-val">₹{tile.price}</div></div>
              </div>

              <div className="modal-btns">
                <button
                  className="btn"
                  onClick={() => sendIntent({ type: 'buyProperty' })}
                  disabled={!canBuyProperty(playerId, player.position, gameState)}
                >
                  Buy — ₹{tile.price}
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => sendIntent({ type: 'declineBuy' })}
                >
                  Decline & Auction
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'payingTax':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>
            {tile.name}: Pay ₹{tile.taxAmount} flat or 10% net worth?
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => sendIntent({ type: 'payTaxFlat' })}>
              Pay ₹{tile.taxAmount}
            </button>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => sendIntent({ type: 'payTaxPercent' })}>
              Pay 10%
            </button>
          </div>
        </div>
      );

    case 'inJail':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>
            In Jail (Turn {player.jailTurns + 1}/{gameState.config.maxJailTurns})
          </p>
          <button className="btn" onClick={() => sendIntent({ type: 'rollForJail' })}>
            🎲 Roll for Doubles
          </button>
          <button
            className="btn-ghost"
            onClick={() => sendIntent({ type: 'payJailFine' })}
            disabled={player.cash < gameState.config.jailFine}
          >
            Pay ₹{gameState.config.jailFine} Fine
          </button>
          {player.getOutOfJailFreeCards > 0 && (
            <button className="btn-ghost" onClick={() => sendIntent({ type: 'useGetOutOfJailCard' })}>
              Use Jail Pass Card
            </button>
          )}
        </div>
      );

    default:
      return null;
  }
}

function AuctionSection({
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
    <div style={{ padding: '14px', background: 'rgba(242, 169, 59, 0.06)', borderRadius: '16px', border: '1px solid var(--glass-border)', marginTop: '12px' }}>
      <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>🔨 Auction: {tile.name}</div>
      <div style={{ fontSize: '12px', color: 'var(--ink-dim)', marginBottom: '10px' }}>
        Current Bid: <strong style={{ color: 'var(--saffron)' }}>₹{auction.currentBid}</strong>
      </div>
      {isMyBid ? (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn" style={{ padding: '8px 12px', fontSize: '12px' }} onClick={() => sendIntent({ type: 'placeBid', amount: minBid })}>
            Bid ₹{minBid}
          </button>
          <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: '12px' }} onClick={() => sendIntent({ type: 'passAuction' })}>
            Pass
          </button>
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>
          Waiting for {gameState.players.find(p => p.id === currentBidder)?.name}...
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
    buyDecision: 'Property Option',
    auction: 'Auction',
    payingRent: 'Paying rent',
    drawingCard: 'Drawing card',
    resolvingCard: 'Resolving card',
    payingTax: 'Tax payment',
    inJail: 'In jail',
    trading: 'Trading',
    bankrupt: 'Bankrupt',
    gameOver: 'Game over',
  };
  return labels[phase] ?? phase;
}
