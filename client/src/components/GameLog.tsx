import type { GameState } from '@vyapar/game-logic';
import { useEffect, useRef } from 'react';

interface GameLogProps {
  gameState: GameState;
}

export function GameLog({ gameState }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.log.length]);

  // Show last 30 entries
  const visibleLog = gameState.log.slice(-30);

  return (
    <div className="game-log">
      <h3 className="panel-title">Game Log</h3>
      <div className="game-log-entries" ref={scrollRef}>
        {visibleLog.map((entry, idx) => (
          <div key={`${entry.timestamp}-${idx}`} className="log-entry">
            <span className="log-message">{entry.message}</span>
          </div>
        ))}
        {visibleLog.length === 0 && (
          <div className="log-entry log-empty">
            <span className="log-message">Game log will appear here...</span>
          </div>
        )}
      </div>
    </div>
  );
}
