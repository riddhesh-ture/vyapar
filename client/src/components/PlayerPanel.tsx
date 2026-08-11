import type { GameState } from '@vyapar/game-logic';
import { BOARD } from '@vyapar/game-logic';

interface PlayerPanelProps {
  gameState: GameState;
  playerId: string;
}

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#22C55E', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];

export function PlayerPanel({ gameState, playerId }: PlayerPanelProps) {
  return (
    <div className="player-panel">
      <h3 className="panel-title">Players</h3>
      <div className="player-panel-list">
        {gameState.players.map((player, idx) => {
          const isCurrent = idx === gameState.currentPlayerIndex;
          const isYou = player.id === playerId;
          const position = BOARD[player.position];

          // Count properties owned
          const propertiesOwned = Object.values(gameState.properties)
            .filter(p => p.ownerId === player.id).length;

          return (
            <div
              key={player.id}
              className={`player-panel-card ${isCurrent ? 'is-current' : ''} ${player.bankrupt ? 'is-bankrupt' : ''} ${isYou ? 'is-you' : ''}`}
            >
              <div className="player-panel-header">
                <div
                  className="player-panel-avatar"
                  style={{ backgroundColor: PLAYER_COLORS[idx] }}
                >
                  {player.name[0]?.toUpperCase()}
                </div>
                <div className="player-panel-info">
                  <span className="player-panel-name">
                    {player.name}
                    {isYou && <span className="you-badge-sm">You</span>}
                  </span>
                  <span className="player-panel-position">
                    📍 {position?.name ?? 'GO'}
                  </span>
                </div>
                {isCurrent && !player.bankrupt && (
                  <div className="current-turn-dot" title="Current turn" />
                )}
              </div>

              <div className="player-panel-stats">
                <div className="stat">
                  <span className="stat-value">₹{player.cash.toLocaleString()}</span>
                  <span className="stat-label">Cash</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{propertiesOwned}</span>
                  <span className="stat-label">Properties</span>
                </div>
                {player.getOutOfJailFreeCards > 0 && (
                  <div className="stat">
                    <span className="stat-value">🃏 {player.getOutOfJailFreeCards}</span>
                    <span className="stat-label">Jail Cards</span>
                  </div>
                )}
              </div>

              {player.bankrupt && <div className="bankrupt-overlay">BANKRUPT</div>}
              {player.inJail && <div className="jail-indicator">🔒 In Jail</div>}
              {player.skipNextTurn && <div className="skip-indicator">😴 Skipping</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
