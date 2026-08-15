import type { GameState } from '@vyapar/game-logic';
import { BOARD } from '@vyapar/game-logic';
import { getGotiForPlayerIndex } from '../gotis';

interface PlayerPanelProps {
  gameState: GameState;
  playerId: string;
}

export function PlayerPanel({ gameState, playerId }: PlayerPanelProps) {
  return (
    <div className="player-panel">
      <h3 className="panel-title">Players</h3>
      <div className="player-panel-list">
        {gameState.players.map((player, idx) => {
          const isCurrent = idx === gameState.currentPlayerIndex;
          const isYou = player.id === playerId;
          const goti = getGotiForPlayerIndex(idx);
          const position = BOARD[player.position];

          const propertiesOwned = Object.values(gameState.properties).filter(
            p => p.ownerId === player.id
          ).length;

          return (
            <div
              key={player.id}
              className={`hud-chip ${isCurrent ? 'active-turn' : ''}`}
              style={{
                width: '100%',
                opacity: player.bankrupt ? 0.4 : 1,
                position: 'relative',
              }}
            >
              <div className={`goti ${goti.className}`}>{goti.emoji}</div>
              <div className="hud-info" style={{ flex: 1 }}>
                <div className="hud-name">
                  {player.name}
                  {idx === 0 && <span className="crown">👑</span>}
                  {isYou && (
                    <span style={{ fontSize: '10px', color: 'var(--saffron)' }}>
                      (You)
                    </span>
                  )}
                </div>
                <div className="hud-cash">
                  <span className="rs">₹</span>
                  {player.cash.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--ink-dim)' }}>
                  📍 {position?.name} · 🏷️ {propertiesOwned}
                </div>
                {player.inJail && (
                  <div style={{ fontSize: '10px', color: 'var(--danger)' }}>
                    🔒 In Jail ({player.jailTurns} turns)
                  </div>
                )}
                {player.bankrupt && (
                  <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 'bold' }}>
                    BANKRUPT
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
