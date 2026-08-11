import type { GameState, PlayerIntent } from '@vyapar/game-logic';

interface WaitingRoomProps {
  gameState: GameState;
  playerId: string;
  roomId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#22C55E', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];

export function WaitingRoom({ gameState, playerId, roomId, sendIntent }: WaitingRoomProps) {
  const isHost = gameState.players[0]?.id === playerId;
  const canStart = isHost && gameState.players.length >= 2;

  const handleStart = () => {
    sendIntent({ type: 'startGame' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="waiting-room">
      <div className="waiting-header">
        <h1 className="waiting-title">
          <span className="title-accent">VYAPAR</span>
        </h1>
        <div className="room-code-display" onClick={handleCopyCode} title="Click to copy">
          <span className="room-code-label">Room Code</span>
          <span className="room-code-value">{roomId}</span>
          <span className="room-code-copy">📋</span>
        </div>
      </div>

      <div className="waiting-content">
        <div className="waiting-players">
          <h2>Players ({gameState.players.length}/8)</h2>
          <div className="player-list">
            {gameState.players.map((player, idx) => (
              <div
                key={player.id}
                className={`player-card ${player.id === playerId ? 'is-you' : ''}`}
              >
                <div
                  className="player-avatar"
                  style={{ backgroundColor: PLAYER_COLORS[idx] }}
                >
                  {player.name[0]?.toUpperCase()}
                </div>
                <div className="player-info">
                  <span className="player-name">
                    {player.name}
                    {player.id === playerId && <span className="you-badge">You</span>}
                  </span>
                  {idx === 0 && <span className="host-badge">Host</span>}
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 2 - gameState.players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="player-card player-card-empty">
                <div className="player-avatar player-avatar-empty">?</div>
                <div className="player-info">
                  <span className="player-name-empty">Waiting for player...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="waiting-config">
          <h2>Game Settings</h2>
          <div className="config-grid">
            <ConfigItem label="Starting Cash" value={`$${gameState.config.startingCash.toLocaleString()}`} />
            <ConfigItem label="GO Bonus" value={gameState.config.passGoBonus === 0 ? 'None' : `$${gameState.config.passGoBonus}`} />
            <ConfigItem label="Auction on Decline" value={gameState.config.auctionOnDecline ? 'Yes' : 'No'} />
            <ConfigItem label="Jail Fine" value={`$${gameState.config.jailFine.toLocaleString()}`} />
            <ConfigItem label="Max Jail Turns" value={String(gameState.config.maxJailTurns)} />
            <ConfigItem label="Turn Timer" value={`${gameState.config.turnTimerSeconds}s`} />
            <ConfigItem label="Income Tax Choice" value={gameState.config.incomeTaxChoice ? 'Yes' : 'No'} />
            <ConfigItem label="Club House Fee" value={`$${gameState.config.clubHouseFee}`} />
          </div>
        </div>
      </div>

      <div className="waiting-footer">
        {isHost ? (
          <button
            className="btn btn-primary btn-large btn-start"
            onClick={handleStart}
            disabled={!canStart}
          >
            {canStart ? '🎮 Start Game' : 'Need at least 2 players'}
          </button>
        ) : (
          <p className="waiting-message">Waiting for the host to start the game...</p>
        )}
      </div>
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="config-item">
      <span className="config-label">{label}</span>
      <span className="config-value">{value}</span>
    </div>
  );
}
