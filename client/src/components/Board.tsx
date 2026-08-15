import type { GameState, PropertyGroup, PlayerIntent } from '@vyapar/game-logic';
import { BOARD, GROUP_FLAGS, GROUP_COUNTRIES } from '@vyapar/game-logic';
import { getGotiForPlayerIndex } from '../gotis';

interface BoardProps {
  gameState: GameState;
  playerId: string;
  sendIntent?: (intent: PlayerIntent) => void;
}

const OWNER_CLASSES = ['owner-red', 'owner-blue', 'owner-green', 'owner-yellow', 'owner-purple'];

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

function getTileGridPosition(index: number): { col: number; row: number; side: 'bottom' | 'left' | 'top' | 'right' } {
  if (index === 0) return { col: 1, row: 1, side: 'top' };
  if (index < 10) return { col: index + 1, row: 1, side: 'top' };
  if (index === 10) return { col: 11, row: 1, side: 'right' };
  if (index < 20) return { col: 11, row: index - 10 + 1, side: 'right' };
  if (index === 20) return { col: 11, row: 11, side: 'bottom' };
  if (index < 30) return { col: 11 - (index - 20), row: 11, side: 'bottom' };
  if (index === 30) return { col: 1, row: 11, side: 'left' };
  return { col: 1, row: 11 - (index - 30), side: 'left' };
}

function getSpecialTileDetails(tile: typeof BOARD[number]): { washClass: string; icon: string; kind: string } {
  if (tile.type === 'corner') {
    switch (tile.cornerType) {
      case 'go': return { washClass: 'go', icon: '🏁', kind: 'START' };
      case 'jail': return { washClass: 'jail', icon: '⛓️', kind: 'In Prison' };
      case 'freeParking': return { washClass: 'vacation', icon: '🏝️', kind: 'Vacation' };
      case 'goToJail': return { washClass: 'jail', icon: '💀', kind: 'Go to prison' };
      default: return { washClass: 'jail', icon: '📍', kind: 'Corner' };
    }
  }
  if (tile.type === 'railway') return { washClass: 'airport', icon: '✈️', kind: 'Airport' };
  if (tile.type === 'utility') return { washClass: 'company', icon: '⚡', kind: 'Company' };
  if (tile.type === 'tax') return { washClass: 'tax', icon: '💰', kind: 'Tax' };
  if (tile.type === 'card') {
    return {
      washClass: 'card',
      icon: tile.deck === 'chance' ? '❓' : tile.deck === 'communityChest' ? '📦' : '🎁',
      kind: tile.deck === 'chance' ? 'Chance' : tile.deck === 'communityChest' ? 'Chest' : 'Surprise',
    };
  }
  if (tile.type === 'fee') return { washClass: 'shop', icon: '🏪', kind: 'Business' };
  if (tile.type === 'skip') return { washClass: 'agri', icon: '🌾', kind: 'Rest' };
  return { washClass: 'company', icon: '🏠', kind: 'Property' };
}

function DieFace({ value }: { value: number }) {
  const faceVal = Math.min(Math.max(value, 1), 6);
  return (
    <div className={`die face-${faceVal}`}>
      <div className="pip p1"></div>
      <div className="pip p2"></div>
      <div className="pip p3"></div>
      <div className="pip p4"></div>
      <div className="pip p5"></div>
      <div className="pip p6"></div>
      <div className="pip p7"></div>
      <div className="pip p8"></div>
      <div className="pip p9"></div>
    </div>
  );
}

export function Board({ gameState, playerId, sendIntent }: BoardProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;

  return (
    <div className="board">
      <div className="board-grid">
        {BOARD.map((tile) => {
          const { col, row, side } = getTileGridPosition(tile.index);
          const isProperty = tile.type === 'property' && tile.group;
          const prop = gameState.properties[tile.index];
          const owner = prop?.ownerId
            ? gameState.players.find(p => p.id === prop.ownerId)
            : null;
          const ownerIndex = owner
            ? gameState.players.findIndex(p => p.id === owner.id)
            : -1;
          const ownerClass = ownerIndex >= 0 ? OWNER_CLASSES[ownerIndex % OWNER_CLASSES.length] : 'unclaimed';

          // Players on this tile
          const playersHere = gameState.players.filter(
            p => p.position === tile.index && !p.bankrupt
          );

          if (isProperty && tile.group) {
            const country = GROUP_COUNTRIES[tile.group];
            const flag = GROUP_FLAGS[tile.group];
            const wash = GROUP_WASHES[tile.group];

            return (
              <div
                key={tile.index}
                className={`tile-wrap side-${side}`}
                style={{ gridColumn: col, gridRow: row }}
                title={`${tile.name} (${country}) — ₹${tile.price}`}
              >
                <div className="tile-prop">
                  <div className={`wash ${wash}`}></div>

                  {/* Circular Flag Badge sitting on inner border edge */}
                  <div className="circle-flag" title={country}>
                    {flag}
                  </div>

                  {/* Price Tag Pill */}
                  <div className="price-pill">
                    <span className="rs">₹</span>
                    {tile.price?.toLocaleString()}
                  </div>

                  {/* Tile Name */}
                  <div className="tile-name-text">
                    {tile.name}
                  </div>

                  {/* Players / Goti tokens */}
                  <div className={`goti-slot ${playersHere.length === 0 ? 'empty' : ''}`}>
                    {playersHere.map((p) => {
                      const pIdx = gameState.players.findIndex(pl => pl.id === p.id);
                      const goti = getGotiForPlayerIndex(pIdx);
                      return (
                        <div
                          key={p.id}
                          className={`goti goti-board ${goti.className}`}
                          title={p.name}
                        >
                          {goti.emoji}
                        </div>
                      );
                    })}
                  </div>

                  {/* Owner strip */}
                  <div className={`owner ${ownerClass}`}>
                    {owner ? owner.name[0]?.toUpperCase() : ''}
                  </div>
                </div>
              </div>
            );
          }

          // Special Square Tile
          const details = getSpecialTileDetails(tile);

          return (
            <div
              key={tile.index}
              className={`sq side-${side}`}
              style={{ gridColumn: col, gridRow: row }}
              title={tile.name}
            >
              <div className={details.washClass}></div>
              <div className="sq-content">
                <div className="sq-icon">{details.icon}</div>
                <div className="sq-name">{tile.name}</div>
                <div className="sq-kind">{details.kind}</div>
                <div className={`goti-slot ${playersHere.length === 0 ? 'empty' : ''}`} style={{ marginBottom: 0 }}>
                  {playersHere.map((p) => {
                    const pIdx = gameState.players.findIndex(pl => pl.id === p.id);
                    const goti = getGotiForPlayerIndex(pIdx);
                    return (
                      <div
                        key={p.id}
                        className={`goti goti-board ${goti.className}`}
                        title={p.name}
                      >
                        {goti.emoji}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Center area */}
        <div className="board-center" style={{ gridColumn: '2 / 11', gridRow: '2 / 11' }}>
          <div className="board-center-content">
            <div className="wordmark" style={{ fontSize: '36px' }}>
              VYA<span className="accent">PAR</span>
            </div>

            {gameState.dice && (
              <div className="dice-block">
                <div className="dice-row">
                  <DieFace value={gameState.dice.die1} />
                  <DieFace value={gameState.dice.die2} />
                </div>
              </div>
            )}

            {/* Interactive Roll Dice Button in Board Center */}
            {isMyTurn && gameState.phase === 'rolling' && sendIntent && (
              <button
                className="btn"
                onClick={() => sendIntent({ type: 'rollDice' })}
                style={{ padding: '14px 36px', fontSize: '16px' }}
              >
                🎲 Roll Dice
              </button>
            )}

            {currentPlayer && (
              <div className="turn-banner">
                <div className="turn-dot"></div>
                <span>It's <b>{currentPlayer.name}</b>'s turn</span>
              </div>
            )}

            {gameState.currentCard && (
              <div className="card-popup card-content" style={{ marginTop: '6px', padding: '10px 16px' }}>
                <span className="sq-kind">
                  {gameState.currentCard.deck}
                </span>
                <p style={{ fontSize: '13px', marginTop: '4px', textAlign: 'center', color: 'var(--ink)' }}>
                  {gameState.currentCard.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
