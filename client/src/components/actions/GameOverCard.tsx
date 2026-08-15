import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { TrophyIcon, RefreshIcon } from '../icons/Icons';
import { GotiToken } from '../board/GotiToken';

interface GameOverCardProps {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

export function GameOverCard({ gameState, playerId, sendIntent }: GameOverCardProps) {
  const winner = gameState.players.find(p => p.id === gameState.winner);
  const isWinner = winner?.id === playerId;
  const winnerIndex = gameState.players.findIndex(p => p.id === winner?.id);

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '24px 16px',
        background: 'radial-gradient(ellipse at center, rgba(242, 169, 59, 0.12), rgba(18, 18, 28, 0.98))',
        borderRadius: '20px',
        border: '1.5px solid var(--saffron)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ padding: '12px', background: 'rgba(242, 169, 59, 0.2)', borderRadius: '50%', color: 'var(--saffron)' }}>
        <TrophyIcon size={36} color="var(--saffron)" />
      </div>

      <div>
        <h3 className="wordmark" style={{ color: 'var(--saffron)', fontSize: '26px', margin: 0 }}>
          Game Over
        </h3>
        <p style={{ marginTop: '6px', fontSize: '16px', fontWeight: '800', color: 'var(--ink)' }}>
          {isWinner ? '🏆 You Won!' : `🏆 ${winner?.name ?? 'Unknown'} Won!`}
        </p>
      </div>

      {winner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <GotiToken player={winner} playerIndex={winnerIndex >= 0 ? winnerIndex : 0} size="sm" />
          <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--saffron)', fontWeight: 700 }}>
            Final Cash: ₹{winner.cash.toLocaleString()}
          </div>
        </div>
      )}

      <button
        className="btn"
        onClick={() => sendIntent({ type: 'resetGame' })}
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '14px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <RefreshIcon size={16} color="#0b0b12" />
        <span>Play Again / Return to Lobby</span>
      </button>
    </div>
  );
}
