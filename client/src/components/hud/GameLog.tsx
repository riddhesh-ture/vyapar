import React, { useEffect, useRef } from 'react';
import type { GameState } from '@vyapar/game-logic';

interface GameLogProps {
  gameState: GameState;
}

export function GameLog({ gameState }: GameLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.log.length]);

  return (
    <div className="game-log">
      <div className="log-header">Game Log</div>
      <div className="game-log-entries">
        {gameState.log.map((entry, idx) => (
          <div key={idx} className="log-entry" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '9px', color: 'rgba(247,242,234,0.3)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginTop: '3px' }}>
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span style={{ flex: 1, color: 'var(--ink-dim)', fontSize: '12.5px', lineHeight: 1.4 }}>
              {entry.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
