import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { BOARD } from '@vyapar/game-logic';
import { GotiToken } from '../board/GotiToken';
import { TurnControls } from './TurnControls';
import { AuctionArena } from './AuctionArena';
import { GameOverCard } from './GameOverCard';
import { SkullIcon } from '../icons/Icons';

interface ActionPanelProps {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

export function ActionPanel({ gameState, playerId, sendIntent }: ActionPanelProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const me = gameState.players.find(p => p.id === playerId);

  if (!me || me.bankrupt) {
    return (
      <div className="action-panel">
        <div style={{ textAlign: 'center', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <SkullIcon size={24} color="var(--danger)" />
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--danger)' }}>You are bankrupt</span>
          <p style={{ fontSize: '11.5px', color: 'var(--ink-dim)', margin: 0 }}>
            Spectating the remaining players...
          </p>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'gameOver') {
    return (
      <div className="action-panel">
        <GameOverCard gameState={gameState} playerId={playerId} sendIntent={sendIntent} />
      </div>
    );
  }

  return (
    <div className="action-panel">
      {/* v5 Turn Card */}
      <div className="turn-card">
        <GotiToken player={currentPlayer} playerIndex={gameState.currentPlayerIndex} size="lg" active />
        <div className="turn-card-info">
          <div className="turn-card-title">
            {isMyTurn ? 'Your Turn' : `${currentPlayer?.name}'s Turn`}
          </div>
          <div className="turn-card-phase">
            Phase: {getPhaseLabel(gameState.phase)}
          </div>
        </div>
      </div>

      {/* v5 Stat Pair: Cash + Position */}
      <div className="stat-pair">
        <div className="stat-box-card">
          <div className="stat-box-label">Cash</div>
          <div className="stat-box-val">₹{me.cash.toLocaleString()}</div>
        </div>
        <div className="stat-box-card">
          <div className="stat-box-label">Position</div>
          <div className="stat-box-val name">{BOARD[me.position]?.name}</div>
        </div>
      </div>

      {/* Turn Action Controls */}
      {isMyTurn && (
        <div>
          <TurnControls gameState={gameState} playerId={playerId} sendIntent={sendIntent} />
        </div>
      )}

      {/* Live Auction Stage (Visible to all players during auction) */}
      {gameState.phase === 'auction' && (
        <div>
          <AuctionArena gameState={gameState} playerId={playerId} sendIntent={sendIntent} />
        </div>
      )}
    </div>
  );
}

function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    rolling: 'Roll dice',
    moving: 'Moving...',
    landed: 'Resolving...',
    buyDecision: 'Property Option',
    auction: 'Auction in progress',
    payingRent: 'Paying rent',
    drawingCard: 'Drawing card',
    resolvingCard: 'Resolving card',
    payingTax: 'Tax payment',
    inJail: 'In jail',
    trading: 'Trading',
    bankrupt: 'Bankrupt',
    gameOver: 'Game over',
  };
  return labels[phase] ?? phase;
}
