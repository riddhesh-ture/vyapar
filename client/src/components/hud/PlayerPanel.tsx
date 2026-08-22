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
      <div className="pp-header">
        <div className="panel-title">Players</div>
        <div className="pp-active-badge">{activeCount} active</div>
      </div>

      <div className="player-panel-list">
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
