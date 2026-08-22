import { useState } from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { Board } from './board/Board';
import { ActionPanel } from './actions/ActionPanel';
import { PlayerPanel } from './hud/PlayerPanel';
import { RentBoard } from './hud/RentBoard';
import { PropertyModal } from './modals/PropertyModal';
import { AuctionOverlay } from './actions/AuctionOverlay';

interface GameViewProps {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

export function GameView({ gameState, playerId, sendIntent }: GameViewProps) {
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);

  return (
    <div className="game-view">
      {/* Left sidebar: player panel + inline rent board */}
      <aside className="game-sidebar game-sidebar-left">
        <PlayerPanel
          gameState={gameState}
          playerId={playerId}
          onSelectTile={(idx) => setSelectedTileIndex(idx)}
        />
        <RentBoard
          gameState={gameState}
          playerId={playerId}
          onSelectTile={(idx) => setSelectedTileIndex(idx)}
        />
      </aside>

      {/* Center: board (game log now embedded inside CenterConsole) */}
      <main className="game-main">
        <Board
          gameState={gameState}
          playerId={playerId}
          sendIntent={sendIntent}
          onSelectTile={(idx) => setSelectedTileIndex(idx)}
        />
      </main>

      {/* Right sidebar: actions only (log moved to center) */}
      <aside className="game-sidebar game-sidebar-right">
        <ActionPanel
          gameState={gameState}
          playerId={playerId}
          sendIntent={sendIntent}
        />
      </aside>

      {/* Property Deed Inspection Modal */}
      {selectedTileIndex !== null && (
        <PropertyModal
          tileIndex={selectedTileIndex}
          gameState={gameState}
          playerId={playerId}
          onClose={() => setSelectedTileIndex(null)}
          sendIntent={sendIntent}
        />
      )}

      {/* Richup.io-style Auction Modal Overlay */}
      {gameState.phase === 'auction' && gameState.auction && (
        <AuctionOverlay
          gameState={gameState}
          playerId={playerId}
          sendIntent={sendIntent}
        />
      )}
    </div>
  );
}
