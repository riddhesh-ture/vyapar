import { useState, useEffect } from 'react';
import { generateRoomCode } from '../hooks/useVyapar';
import { GOTIS } from '../gotis';

interface LobbyHomeProps {
  onJoin: (roomId: string, playerName: string) => void;
}

export function LobbyHome({ onJoin }: LobbyHomeProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [selectedGotiIdx, setSelectedGotiIdx] = useState(0);

  // Auto-detect ?room=CODE or ?code=CODE in URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('room') || params.get('code');
    if (codeFromUrl) {
      setRoomCode(codeFromUrl.toUpperCase());
      setMode('join');
    }
  }, []);

  const handleCreate = () => {
    if (!playerName.trim()) return;
    const code = generateRoomCode();
    onJoin(code, playerName.trim());
  };

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    onJoin(roomCode.trim().toUpperCase(), playerName.trim());
  };

  return (
    <div className="lobby-home">
      <div className="wordmark" style={{ fontSize: '36px' }}>
        VYA<span className="accent">PAR</span>
      </div>
      <p className="eyebrow" style={{ marginTop: '-10px' }}>
        WORLD TILES &nbsp;·&nbsp; <b>ONLINE MULTIPLAYER</b>
      </p>

      {/* Choose your piece card */}
      <div className="picker-card">
        <div className="picker-title">Choose your piece</div>
        <div className="picker-grid">
          {GOTIS.map((goti, idx) => (
            <div
              key={goti.id}
              className={`picker-token ${goti.className} ${idx === selectedGotiIdx ? 'selected' : ''}`}
              onClick={() => setSelectedGotiIdx(idx)}
              title={goti.name}
            >
              {goti.emoji}
            </div>
          ))}
        </div>

        {/* Tab Switcher: Create vs Join */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            className={mode === 'create' ? 'btn' : 'btn-ghost'}
            style={{ flex: 1, padding: '10px 14px', fontSize: '13px' }}
            onClick={() => setMode('create')}
          >
            Create Room
          </button>
          <button
            type="button"
            className={mode === 'join' ? 'btn' : 'btn-ghost'}
            style={{ flex: 1, padding: '10px 14px', fontSize: '13px' }}
            onClick={() => setMode('join')}
          >
            Join Room
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-group">
            <label htmlFor="player-name" style={{ fontSize: '11px', color: 'var(--ink-dim)' }}>Your Name</label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            />
          </div>

          {mode === 'create' ? (
            <button
              className="btn"
              onClick={handleCreate}
              disabled={!playerName.trim()}
              style={{ width: '100%', padding: '14px' }}
            >
              🎲 Create New Room →
            </button>
          ) : (
            <>
              <div className="input-group">
                <label htmlFor="room-code-input" style={{ fontSize: '11px', color: 'var(--ink-dim)' }}>Room Code</label>
                <input
                  id="room-code-input"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. N24A4"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--saffron)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '4px',
                    textAlign: 'center',
                    outline: 'none',
                    fontSize: '18px',
                    fontWeight: '700',
                  }}
                />
              </div>
              <button
                className="btn"
                onClick={handleJoin}
                disabled={!playerName.trim() || roomCode.trim().length < 4}
                style={{ width: '100%', padding: '14px' }}
              >
                Join Room →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
