import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { getGotiForPlayerIndex } from '../gotis';

interface WaitingRoomProps {
  gameState: GameState;
  playerId: string;
  roomId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

export function WaitingRoom({ gameState, playerId, roomId, sendIntent }: WaitingRoomProps) {
  const isHost = gameState.players[0]?.id === playerId;
  const canStart = isHost && gameState.players.length >= 2;

  const handleStart = () => {
    sendIntent({ type: 'startGame' });
  };

  const shareUrl = `${window.location.origin}/?room=${roomId.toUpperCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const emptySlotsCount = Math.max(0, 8 - gameState.players.length);

  return (
    <div className="waiting-room-wrap" style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 20px 60px' }}>
      {/* Header & Share */}
      <div className="lobby-strip">
        <div className="wordmark">
          VYA<span className="accent">PAR</span>
        </div>
        <div className="share-box">
          <input type="text" readOnly value={shareUrl} />
          <button className="btn-ghost" onClick={handleCopy} style={{ padding: '8px 16px', fontSize: '12px' }}>
            Copy Link
          </button>
        </div>
      </div>

      {/* Players Section */}
      <div className="section-label" style={{ margin: '24px 0 10px' }}>
        ROOM PLAYERS ({gameState.players.length}/8)
      </div>

      <div className="hud-row">
        {gameState.players.map((player, idx) => {
          const goti = getGotiForPlayerIndex(idx);
          const isYou = player.id === playerId;
          return (
            <div key={player.id} className={`hud-chip ${isYou ? 'active-turn' : ''}`}>
              <div className={`goti ${goti.className}`}>{goti.emoji}</div>
              <div className="hud-info">
                <div className="hud-name">
                  {player.name}
                  {idx === 0 && <span className="crown" title="Host">👑</span>}
                  {isYou && <span style={{ fontSize: '10px', color: 'var(--saffron)' }}>(You)</span>}
                </div>
                <div className="hud-cash">
                  <span className="rs">₹</span>
                  {player.cash.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty slots for joining players */}
        {Array.from({ length: Math.min(emptySlotsCount, 4) }).map((_, i) => (
          <div key={`empty-${i}`} className="hud-chip" style={{ opacity: 0.4, borderStyle: 'dashed' }}>
            <div className="goti" style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px dashed rgba(255,255,255,0.3)' }}>?</div>
            <div className="hud-info">
              <div className="hud-name" style={{ color: 'var(--ink-dim)' }}>
                Waiting...
              </div>
              <div className="hud-cash" style={{ fontSize: '10px' }}>Open Slot</div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Settings Section */}
      <div className="section-label" style={{ margin: '24px 0 10px' }}>
        GAME SETTINGS
      </div>

      <div className="settings-card">
        <div className="settings-title">Game settings</div>
        <div className="settings-hint">From your config in game-design.md</div>

        <div className="rule-row">
          <div className="rule-icon">🚫</div>
          <div className="rule-text">
            <div className="rule-title">No GO bonus</div>
            <div className="rule-desc">Passing or landing on GO pays nothing — this is Vyapar's default</div>
          </div>
          <div className="toggle on locked"></div>
        </div>

        <div className="rule-row">
          <div className="rule-icon">💰</div>
          <div className="rule-text">
            <div className="rule-title">×2 rent on full sets</div>
            <div className="rule-desc">Owning every property in a group doubles base rent before any houses built</div>
          </div>
          <div className="toggle on"></div>
        </div>

        <div className="rule-row">
          <div className="rule-icon">🏝️</div>
          <div className="rule-text">
            <div className="rule-title">Vacation jackpot</div>
            <div className="rule-desc">Off by default — landing on Vacation earns nothing, matches board</div>
          </div>
          <div className={`toggle ${gameState.config.freeParkingJackpot ? 'on' : ''}`}></div>
        </div>

        <div className="rule-row">
          <div className="rule-icon">🔨</div>
          <div className="rule-text">
            <div className="rule-title">Auction on decline</div>
            <div className="rule-desc">If a player skips buying, it goes to highest bidder</div>
          </div>
          <div className={`toggle ${gameState.config.auctionOnDecline ? 'on' : ''}`}></div>
        </div>

        <div className="rule-row">
          <div className="rule-icon">⛓️</div>
          <div className="rule-text">
            <div className="rule-title">Jail Fine ₹{gameState.config.jailFine}</div>
            <div className="rule-desc">Pay fine or roll doubles to leave jail</div>
          </div>
          <div className="toggle on"></div>
        </div>
      </div>

      {/* Start Button */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        {isHost ? (
          <button
            className="btn"
            onClick={handleStart}
            disabled={!canStart}
            style={{ width: '100%', maxWidth: '340px', padding: '15px' }}
          >
            {canStart ? '🎲 Start Game' : 'Waiting for at least 2 players...'}
          </button>
        ) : (
          <p className="eyebrow" style={{ marginTop: '16px' }}>Waiting for room host to start the game...</p>
        )}
      </div>
    </div>
  );
}
