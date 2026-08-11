import type { GameState, PropertyGroup } from '@vyapar/game-logic';
import { BOARD, GROUP_FLAGS } from '@vyapar/game-logic';

interface BoardProps {
  gameState: GameState;
  playerId: string;
}

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#22C55E', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];

const GROUP_COLORS: Record<PropertyGroup, string> = {
  A: '#7B2D8E',
  B: '#0EA5E9',
  C: '#EC4899',
  D: '#F97316',
  E: '#EF4444',
  F: '#EAB308',
  G: '#22C55E',
  H: '#1E40AF',
};

/**
 * Map tile index → CSS grid position { col, row }.
 * The board is an 11×11 grid:
 * - Row 1 = top, Row 11 = bottom
 * - Col 1 = left, Col 11 = right
 */
function getTileGridPosition(index: number): { col: number; row: number; side: string } {
  // Bottom row: tiles 0-10 (GO on right, Jail on left)
  if (index <= 10) {
    return { col: 11 - index, row: 11, side: 'bottom' };
  }
  // Left column: tiles 11-19 (bottom to top)
  if (index <= 19) {
    return { col: 1, row: 11 - (index - 10), side: 'left' };
  }
  // Top row: tiles 20-30 (left to right)
  if (index <= 30) {
    return { col: index - 20 + 1, row: 1, side: 'top' };
  }
  // Right column: tiles 31-39 (top to bottom)
  return { col: 11, row: index - 30 + 1, side: 'right' };
}

function getTypeIcon(type: string, cornerType?: string, deckType?: string): string {
  switch (type) {
    case 'corner':
      switch (cornerType) {
        case 'go': return '→';
        case 'jail': return '🔒';
        case 'freeParking': return '🅿️';
        case 'goToJail': return '👮';
        default: return '';
      }
    case 'railway': return '✈️';
    case 'utility': return '⚡';
    case 'tax': return '💰';
    case 'card':
      switch (deckType) {
        case 'chance': return '❓';
        case 'communityChest': return '📦';
        case 'surprise': return '🎁';
        default: return '🃏';
      }
    case 'fee': return '🏠';
    case 'skip': return '😴';
    default: return '';
  }
}

export function Board({ gameState, playerId }: BoardProps) {
  return (
    <div className="board">
      <div className="board-grid">
        {BOARD.map((tile) => {
          const { col, row, side } = getTileGridPosition(tile.index);
          const isCorner = tile.type === 'corner' || tile.index === 0 || tile.index === 10 || tile.index === 20 || tile.index === 30;
          const groupColor = tile.group ? GROUP_COLORS[tile.group] : undefined;
          const prop = gameState.properties[tile.index];
          const owner = prop?.ownerId
            ? gameState.players.find(p => p.id === prop.ownerId)
            : null;
          const ownerIndex = owner
            ? gameState.players.findIndex(p => p.id === owner.id)
            : -1;

          // Players on this tile
          const playersHere = gameState.players.filter(
            p => p.position === tile.index && !p.bankrupt
          );

          return (
            <div
              key={tile.index}
              className={`tile tile-${side} ${isCorner ? 'tile-corner' : ''} ${tile.type === 'property' ? 'tile-property' : ''}`}
              style={{
                gridColumn: col,
                gridRow: row,
              }}
              title={`${tile.name}${tile.price ? ` — $${tile.price}` : ''}`}
            >
              {/* Color bar for properties */}
              {groupColor && (
                <div
                  className="tile-color-bar"
                  style={{ backgroundColor: groupColor }}
                >
                  {prop && prop.houses > 0 && (
                    <div className="tile-houses">
                      {prop.houses === 5
                        ? <span className="hotel">🏨</span>
                        : Array.from({ length: prop.houses }).map((_, i) => (
                            <span key={i} className="house">🏠</span>
                          ))
                      }
                    </div>
                  )}
                </div>
              )}

              {/* Tile content */}
              <div className="tile-content">
                {tile.group && (
                  <span className="tile-icon">
                    {GROUP_FLAGS[tile.group]}
                  </span>
                )}
                {!tile.group && (
                  <span className="tile-icon">
                    {getTypeIcon(tile.type, tile.cornerType, tile.deck)}
                  </span>
                )}
                <span className="tile-name">{tile.name}</span>
                {tile.price && <span className="tile-price">${tile.price.toLocaleString()}</span>}
              </div>

              {/* Ownership indicator */}
              {owner && (
                <div
                  className="tile-owner-dot"
                  style={{ backgroundColor: PLAYER_COLORS[ownerIndex] ?? '#666' }}
                  title={`Owned by ${owner.name}`}
                />
              )}

              {/* Mortgage indicator */}
              {prop?.mortgaged && (
                <div className="tile-mortgage-badge">M</div>
              )}

              {/* Player tokens */}
              {playersHere.length > 0 && (
                <div className="tile-players">
                  {playersHere.map((p) => {
                    const pIdx = gameState.players.findIndex(pl => pl.id === p.id);
                    return (
                      <div
                        key={p.id}
                        className={`player-token ${p.id === playerId ? 'is-you' : ''}`}
                        style={{ backgroundColor: PLAYER_COLORS[pIdx] }}
                        title={p.name}
                      >
                        {p.name[0]?.toUpperCase()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Center area */}
        <div className="board-center" style={{ gridColumn: '2 / 11', gridRow: '2 / 11' }}>
          <div className="board-center-content">
            <h2 className="board-title">
              <span className="title-accent">VYAPAR</span>
            </h2>
            {gameState.dice && (
              <div className="dice-display">
                <div className="die">{getDiceFace(gameState.dice.die1)}</div>
                <div className="die">{getDiceFace(gameState.dice.die2)}</div>
              </div>
            )}
            {gameState.currentCard && (
              <div className="current-card-display">
                <div className={`card-popup card-${gameState.currentCard.deck}`}>
                  <span className="card-deck-label">
                    {gameState.currentCard.deck === 'communityChest' ? 'Community Chest'
                      : gameState.currentCard.deck === 'chance' ? 'Chance'
                      : 'Surprise'}
                  </span>
                  <p className="card-text">{gameState.currentCard.text}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getDiceFace(value: number): string {
  const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return faces[value] ?? '?';
}
