import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { Board } from './Board';
import { ActionPanel } from './ActionPanel';
import { PlayerPanel } from './PlayerPanel';
import { GameLog } from './GameLog';

interface GameViewProps {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

export function GameView({ gameState, playerId, sendIntent }: GameViewProps) {
  return (
    <div className="game-view">
      {/* Left sidebar: player panel */}
      <aside className="game-sidebar game-sidebar-left">
        <PlayerPanel gameState={gameState} playerId={playerId} />
      </aside>

      {/* Center: board */}
      <main className="game-main">
        <Board gameState={gameState} playerId={playerId} />
      </main>

      {/* Right sidebar: actions + log */}
      <aside className="game-sidebar game-sidebar-right">
        <ActionPanel
          gameState={gameState}
          playerId={playerId}
          sendIntent={sendIntent}
        />
        <GameLog gameState={gameState} />
      </aside>
    </div>
  );
}
