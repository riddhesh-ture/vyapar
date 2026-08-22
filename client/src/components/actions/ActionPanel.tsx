import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { BOARD, calculateNetWorth } from '@vyapar/game-logic';
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

  let netWorth = me?.cash ?? 0;
  try { if (me) netWorth = calculateNetWorth(me.id, gameState); } catch {}

  if (!me || me.bankrupt) {
    return (
      <div className="action-panel">
        <div className="ap-bankrupt">
          <SkullIcon size={28} color="var(--danger)" />
          <span className="ap-bankrupt-title">You went bankrupt</span>
          <p className="ap-bankrupt-sub">Spectating the remaining players…</p>
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

      {/* Turn card */}
      <div className={`ap-turn-card ${isMyTurn ? 'ap-turn-card-mine' : ''}`}>
        {isMyTurn && <div className="ap-turn-pulse" />}
        <GotiToken player={currentPlayer} playerIndex={gameState.currentPlayerIndex} size="lg" active />
        <div className="ap-turn-info">
          <div className="ap-turn-name">
            {isMyTurn ? 'Your Turn' : `${currentPlayer?.name}'s Turn`}
          </div>
          <div className="ap-turn-phase">
            Phase: {getPhaseLabel(gameState.phase)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="ap-stats-row">
        <div className="ap-stat-box">
          <div className="ap-stat-label">Cash</div>
          <div className="ap-stat-val">₹{me.cash.toLocaleString()}</div>
        </div>
        <div className="ap-stat-box">
          <div className="ap-stat-label">Position</div>
          <div className="ap-stat-val ap-stat-name">{BOARD[me.position]?.name ?? '—'}</div>
        </div>
      </div>

      {/* Net worth */}
      <div className="ap-networth-row">
        <span className="ap-networth-label">Net Worth</span>
        <span className="ap-networth-val">₹{netWorth.toLocaleString()}</span>
      </div>

      {/* My-turn controls */}
      {isMyTurn && (
        <TurnControls gameState={gameState} playerId={playerId} sendIntent={sendIntent} />
      )}

      {/* Waiting for other player */}
      {!isMyTurn && gameState.phase !== 'auction' && (
        <div className="ap-waiting">
          <div className="ap-waiting-dot" />
          <span>Waiting for <strong>{currentPlayer?.name}</strong>…</span>
        </div>
      )}

      {/* Live auction (all players) */}
      {gameState.phase === 'auction' && (
        <AuctionArena gameState={gameState} playerId={playerId} sendIntent={sendIntent} />
      )}
    </div>
  );
}

function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    rolling: 'Roll dice',
    moving: 'Moving…',
    landed: 'Resolving…',
    buyDecision: 'Property decision',
    auction: 'Auction',
    payingRent: 'Paying rent',
    drawingCard: 'Drawing card',
    resolvingCard: 'Card effect',
    payingTax: 'Tax time',
    inJail: 'In jail',
    trading: 'Trading',
    bankrupt: 'Bankrupt',
    gameOver: 'Game over',
  };
  return labels[phase] ?? phase;
}
