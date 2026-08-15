import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { BOARD } from '@vyapar/game-logic';
import { Tile } from './Tile';
import { CenterConsole } from './CenterConsole';

interface BoardProps {
  gameState: GameState;
  playerId: string;
  sendIntent?: (intent: PlayerIntent) => void;
  onSelectTile?: (tileIndex: number) => void;
}

export function Board({ gameState, playerId, sendIntent, onSelectTile }: BoardProps) {
  return (
    <div className="board">
      <div className="board-grid">
        {BOARD.map((tile) => (
          <Tile
            key={tile.index}
            tile={tile}
            gameState={gameState}
            playerId={playerId}
            onSelectTile={onSelectTile}
          />
        ))}

        {/* Center area with Wordmark, Dice, Actions, and Cards */}
        <CenterConsole
          gameState={gameState}
          playerId={playerId}
          sendIntent={sendIntent}
        />
      </div>
    </div>
  );
}
