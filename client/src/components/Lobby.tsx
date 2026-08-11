import { useState } from 'react';
import { generateRoomCode } from '../hooks/useVyapar';

interface LobbyHomeProps {
  onJoin: (roomId: string, playerName: string) => void;
}

export function LobbyHome({ onJoin }: LobbyHomeProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'home' | 'join'>('home');

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
      <div className="lobby-hero">
        <h1 className="lobby-title">
          <span className="title-accent">VYAPAR</span>
        </h1>
        <p className="lobby-subtitle">Real-time multiplayer board game</p>
      </div>

      <div className="lobby-card">
        <div className="input-group">
          <label htmlFor="player-name">Your Name</label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            autoFocus
          />
        </div>

        {mode === 'home' ? (
          <div className="lobby-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={handleCreate}
              disabled={!playerName.trim()}
            >
              <span className="btn-icon">🎲</span>
              Create Room
            </button>
            <div className="lobby-divider">
              <span>or</span>
            </div>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => setMode('join')}
              disabled={!playerName.trim()}
            >
              <span className="btn-icon">🔗</span>
              Join with Code
            </button>
          </div>
        ) : (
          <div className="lobby-actions">
            <div className="input-group">
              <label htmlFor="room-code">Room Code</label>
              <input
                id="room-code"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={6}
                className="room-code-input"
                autoFocus
              />
            </div>
            <button
              className="btn btn-primary btn-large"
              onClick={handleJoin}
              disabled={!playerName.trim() || roomCode.length < 4}
            >
              Join Room
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setMode('home')}
            >
              ← Back
            </button>
          </div>
        )}
      </div>

      <p className="lobby-footer">Play the classic business board game online with friends</p>
    </div>
  );
}
