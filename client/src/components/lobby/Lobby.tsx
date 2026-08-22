import React, { useState, useEffect } from 'react';
import { generateRoomCode } from '../../hooks/useVyapar';
import { GOTIS } from '../../gotis';
import { GotiPicker } from './GotiPicker';

interface LobbyHomeProps {
  onJoin: (roomId: string, playerName: string, gotiId?: string) => void;
}

export function LobbyHome({ onJoin }: LobbyHomeProps) {
  const [initialRoomCode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return (params.get('room') || params.get('code') || '').toUpperCase();
    } catch {
      return '';
    }
  });

  const [mode, setMode] = useState<'create' | 'join'>(() => {
    return initialRoomCode ? 'join' : 'create';
  });

  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [playerName, setPlayerName] = useState('');
  const [selectedGotiId, setSelectedGotiId] = useState<string>(GOTIS[0].id);
  const [nameFocused, setNameFocused] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('room') || params.get('code');
    if (codeFromUrl && codeFromUrl.toUpperCase() !== roomCode) {
      setRoomCode(codeFromUrl.toUpperCase());
      setMode('join');
    }
  }, [roomCode]);

  const handleCreate = () => {
    if (!playerName.trim()) return;
    const code = generateRoomCode();
    onJoin(code, playerName.trim(), selectedGotiId);
  };

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    onJoin(roomCode.trim().toUpperCase(), playerName.trim(), selectedGotiId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'create') handleCreate();
      else handleJoin();
    }
  };

  return (
    <div className="lobby-home">
      {/* Animated background orbs */}
      <div className="lobby-bg-orb lobby-bg-orb-1" />
      <div className="lobby-bg-orb lobby-bg-orb-2" />

      {/* Wordmark */}
      <div className="lobby-wordmark-wrap">
        <div className="wordmark lobby-wordmark">
          VYA<span className="accent">PAR</span>
        </div>
        <div className="lobby-tagline">The world is your board</div>
      </div>

      {/* Main card */}
      <div className="lobby-card">
        {/* Invitation banner */}
        {initialRoomCode && mode === 'join' && (
          <div className="lobby-invite-banner">
            <span className="lobby-invite-label">Invited to room</span>
            <div className="lobby-invite-code">{roomCode}</div>
          </div>
        )}

        {/* Token picker */}
        <div className="lobby-section-label">Choose your token</div>
        <GotiPicker selectedGotiId={selectedGotiId} onSelect={setSelectedGotiId} />

        {/* Tab switcher */}
        <div className="lobby-tab-bar">
          <button
            type="button"
            className={`lobby-tab ${mode === 'create' ? 'lobby-tab-active' : ''}`}
            onClick={() => setMode('create')}
          >
            Create Room
          </button>
          <button
            type="button"
            className={`lobby-tab ${mode === 'join' ? 'lobby-tab-active' : ''}`}
            onClick={() => setMode('join')}
          >
            Join Room
          </button>
        </div>

        {/* Inputs */}
        <div className="lobby-fields">
          <div className="lobby-field">
            <label htmlFor="player-name" className="lobby-field-label">Your Name</label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder="Enter your player name"
              maxLength={20}
              autoFocus
              className={`lobby-input ${nameFocused ? 'lobby-input-focused' : ''}`}
            />
          </div>

          {mode === 'create' ? (
            <button
              className="btn lobby-cta-btn"
              onClick={handleCreate}
              disabled={!playerName.trim()}
            >
              Create New Room →
            </button>
          ) : (
            <>
              {!initialRoomCode && (
                <div className="lobby-field">
                  <label htmlFor="room-code-input" className="lobby-field-label">Room Code</label>
                  <input
                    id="room-code-input"
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. N24A4"
                    maxLength={6}
                    className="lobby-input lobby-code-input"
                  />
                </div>
              )}
              <button
                className="btn lobby-cta-btn"
                onClick={handleJoin}
                disabled={!playerName.trim() || roomCode.trim().length < 4}
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
