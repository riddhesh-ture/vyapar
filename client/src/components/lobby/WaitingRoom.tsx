import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { GOTIS } from '../../gotis';
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
  const isHost = gameState.players[0]?.id === playerId;
  const canStart = isHost && gameState.players.length >= 2;

  const handleStart = () => {
    sendIntent({ type: 'startGame' });
  };

  const myPlayer = gameState.players.find(p => p.id === playerId);
  const emptySlotsCount = Math.max(0, 8 - gameState.players.length);

  return (
    <div className="waiting-room-wrap" style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 20px 60px' }}>
      {/* Header & Share */}
      <div className="lobby-strip">
        <div className="wordmark">
          VYA<span className="accent">PAR</span>
        </div>
        <RoomShareBox roomId={roomId} />
      </div>

      {/* Players Section */}
      <div className="section-label" style={{ margin: '24px 0 10px' }}>
        ROOM PLAYERS ({gameState.players.length}/8)
      </div>

      <div className="hud-row">
        {gameState.players.map((player, idx) => {
          const isYou = player.id === playerId;
          return (
            <div key={player.id} className={`hud-chip ${isYou ? 'active-turn' : ''}`}>
              <GotiToken player={player} playerIndex={idx} size="md" />
              <div className="hud-info">
                <div className="hud-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{player.name}</span>
                  {idx === 0 && <CrownIcon size={13} color="var(--saffron)" />}
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
            <div className="goti" style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px dashed rgba(255,255,255,0.3)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              <span style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>?</span>
            </div>
            <div className="hud-info">
              <div className="hud-name" style={{ color: 'var(--ink-dim)' }}>
                Waiting...
              </div>
              <div className="hud-cash" style={{ fontSize: '10px' }}>Open Slot</div>
            </div>
          </div>
        ))}
      </div>

      {/* Token Switcher */}
      <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-dim)', marginBottom: '10px' }}>
          Change Your Token
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {GOTIS.map((goti) => {
            const isSelected = (myPlayer?.gotiId || GOTIS[gameState.players.findIndex(p => p.id === playerId) % GOTIS.length]?.id) === goti.id;
            return (
              <button
                key={goti.id}
                type="button"
                onClick={() => sendIntent({ type: 'setGoti', gotiId: goti.id })}
                className={`picker-token ${goti.className} ${isSelected ? 'selected' : ''}`}
                style={{ width: '38px', height: '38px', cursor: 'pointer', border: isSelected ? '2px solid var(--saffron)' : '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                title={goti.name}
              >
                {goti.renderIcon({ size: 18, color: '#ffffff' })}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Settings Section */}
      <div className="section-label" style={{ margin: '24px 0 10px' }}>
        GAME SETTINGS {isHost && <span style={{ fontSize: '10px', color: 'var(--saffron)' }}>(Click to toggle)</span>}
      </div>

      <RuleSettingsCard gameState={gameState} isHost={isHost} sendIntent={sendIntent} />

      {/* Start Button */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        {isHost ? (
          <button
            className="btn"
            onClick={handleStart}
            disabled={!canStart}
            style={{ width: '100%', maxWidth: '340px', padding: '15px', fontSize: '14px' }}
          >
            {canStart ? 'Start Game →' : 'Waiting for at least 2 players...'}
          </button>
        ) : (
          <p className="eyebrow" style={{ marginTop: '16px' }}>Waiting for room host to start the game...</p>
        )}
      </div>
    </div>
  );
}
