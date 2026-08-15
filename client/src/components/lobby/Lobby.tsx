import React, { useState, useEffect } from 'react';
import { generateRoomCode } from '../../hooks/useVyapar';
import { GOTIS } from '../../gotis';
import { GotiPicker } from './GotiPicker';

interface LobbyHomeProps {
  onJoin: (roomId: string, playerName: string, gotiId?: string) => void;
}

export function LobbyHome({ onJoin }: LobbyHomeProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [selectedGotiId, setSelectedGotiId] = useState<string>(GOTIS[0].id);

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
    onJoin(code, playerName.trim(), selectedGotiId);
  };

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    onJoin(roomCode.trim().toUpperCase(), playerName.trim(), selectedGotiId);
  };

  return (
    <div className="lobby-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div className="wordmark" style={{ fontSize: '42px', letterSpacing: '0.04em', marginBottom: '4px' }}>
        VYA<span className="accent">PAR</span>
      </div>
      <p className="eyebrow" style={{ marginBottom: '24px' }}>
        LUXURY WORLD BOARD &nbsp;·&nbsp; <b>ONLINE MULTIPLAYER</b>
      </p>

      {/* Choose your piece card */}
      <div className="picker-card" style={{ width: '100%', maxWidth: '380px', background: 'rgba(18, 18, 28, 0.85)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '24px', boxShadow: '0 24px 50px rgba(0,0,0,0.6)' }}>
        <div className="picker-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Choose your token</div>
        <GotiPicker selectedGotiId={selectedGotiId} onSelect={setSelectedGotiId} />

        {/* Tab Switcher: Create vs Join */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button
            type="button"
            className={mode === 'create' ? 'btn' : 'btn-ghost'}
            style={{ flex: 1, padding: '9px 12px', fontSize: '12.5px', borderRadius: '9px', border: 'none' }}
            onClick={() => setMode('create')}
          >
            Create Room
          </button>
          <button
            type="button"
            className={mode === 'join' ? 'btn' : 'btn-ghost'}
            style={{ flex: 1, padding: '9px 12px', fontSize: '12.5px', borderRadius: '9px', border: 'none' }}
            onClick={() => setMode('join')}
          >
            Join Room
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-group">
            <label htmlFor="player-name" style={{ fontSize: '11px', color: 'var(--ink-dim)', marginBottom: '4px', display: 'block' }}>Your Name</label>
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
                fontSize: '14px',
              }}
            />
          </div>

          {mode === 'create' ? (
            <button
              className="btn"
              onClick={handleCreate}
              disabled={!playerName.trim()}
              style={{ width: '100%', padding: '14px', fontSize: '14px', marginTop: '6px' }}
            >
              Create New Room →
            </button>
          ) : (
            <>
              <div className="input-group">
                <label htmlFor="room-code-input" style={{ fontSize: '11px', color: 'var(--ink-dim)', marginBottom: '4px', display: 'block' }}>Room Code</label>
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
                style={{ width: '100%', padding: '14px', fontSize: '14px', marginTop: '6px' }}
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
