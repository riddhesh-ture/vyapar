import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { GotiToken } from '../board/GotiToken';
import { RoomShareBox } from './RoomShareBox';
import { RuleSettingsCard } from './RuleSettingsCard';
import { CrownIcon } from '../icons/Icons';

interface WaitingRoomProps {
  gameState: GameState;
  playerId: string;
  roomId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

export function WaitingRoom({ gameState, playerId, roomId, sendIntent }: WaitingRoomProps) {
  const isHost = (gameState.hostId || gameState.players[0]?.id) === playerId;
  const canStart = isHost && gameState.players.length >= 2;
  const playerCount = gameState.players.length;

  const handleStart = () => {
    sendIntent({ type: 'startGame' });
  };

  return (
    <div className="waiting-room-bg">
      <div className="waiting-room-wrap">

        {/* Header */}
        <div className="wr-header">
          <div className="wordmark wr-wordmark">
            VYA<span className="accent">PAR</span>
          </div>
          <div className="wr-tagline">Waiting for players to join…</div>
          <RoomShareBox roomId={roomId} />
        </div>

        {/* Players grid */}
        <div className="wr-section">
          <div className="wr-section-header">
            <span className="wr-section-title">Players</span>
            <span className="wr-player-count">
              <span className="wr-count-active">{playerCount}</span>
              <span className="wr-count-max"> / 8</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="wr-progress-bar">
            <div
              className="wr-progress-fill"
              style={{ width: `${(playerCount / 8) * 100}%` }}
            />
          </div>

          <div className="wr-players-grid">
            {/* Filled slots */}
            {gameState.players.map((player, idx) => {
              const isYou = player.id === playerId;
              const isPlayerHost = (gameState.hostId || gameState.players[0]?.id) === player.id;
              return (
                <div
                  key={player.id}
                  className={`wr-player-slot wr-slot-filled ${isYou ? 'wr-slot-you' : ''}`}
                >
                  <div className="wr-slot-token">
                    <GotiToken player={player} playerIndex={idx} size="md" />
                    {isPlayerHost && (
                      <div className="wr-host-badge" title="Room Host">
                        <CrownIcon size={10} color="#0b0b12" />
                      </div>
                    )}
                  </div>
                  <div className="wr-slot-info">
                    <div className="wr-slot-name">
                      {player.name}
                      {isYou && <span className="wr-you-tag">You</span>}
                    </div>
                    <div className="wr-slot-cash">
                      <span className="rs">₹</span>
                      {player.cash.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 8 - playerCount) }).map((_, i) => (
              <div key={`empty-${i}`} className="wr-player-slot wr-slot-empty">
                <div className="wr-slot-empty-avatar">
                  <span className="wr-slot-empty-icon">+</span>
                </div>
                <div className="wr-slot-info">
                  <div className="wr-slot-name wr-slot-waiting">Waiting…</div>
                  <div className="wr-slot-cash wr-slot-open">Open slot</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="wr-section">
          <div className="wr-section-header">
            <span className="wr-section-title">Game Rules</span>
            {isHost && <span className="wr-section-hint">Click to toggle</span>}
          </div>
          <RuleSettingsCard gameState={gameState} isHost={isHost} sendIntent={sendIntent} />
        </div>

        {/* Start CTA */}
        <div className="wr-start-wrap">
          {isHost ? (
            <button
              className="btn wr-start-btn"
              onClick={handleStart}
              disabled={!canStart}
            >
              {canStart
                ? `Start Game with ${playerCount} Players →`
                : `Need at least 2 players (${playerCount}/2)`}
            </button>
          ) : (
            <div className="wr-waiting-msg">
              <div className="wr-waiting-dot" />
              Waiting for the host to start the game…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
