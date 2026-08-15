import React from 'react';
import type { GameState } from '@vyapar/game-logic';
import { PlayerCard } from './PlayerCard';

interface PlayerPanelProps {
  gameState: GameState;
  playerId: string;
  onSelectTile?: (tileIndex: number) => void;
}

export function PlayerPanel({ gameState, playerId, onSelectTile }: PlayerPanelProps) {
  const activeCount = gameState.players.filter(p => !p.bankrupt).length;

  return (
    <div className="player-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 4px' }}>
        <div className="panel-title" style={{ padding: 0 }}>Players</div>
        <span style={{ fontSize: '11px', color: 'var(--ink-dim)' }}>
          {activeCount} active
        </span>
      </div>

      <div className="player-panel-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {gameState.players.map((player, idx) => {
          const isCurrent = idx === gameState.currentPlayerIndex;
          const isYou = player.id === playerId;

          return (
            <PlayerCard
              key={player.id}
              player={player}
              playerIndex={idx}
              gameState={gameState}
              isYou={isYou}
              isCurrentTurn={isCurrent}
              onSelectTile={onSelectTile}
            />
          );
        })}
      </div>
    </div>
  );
}
