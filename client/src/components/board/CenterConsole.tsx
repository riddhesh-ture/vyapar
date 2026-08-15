import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { BOARD } from '@vyapar/game-logic';
import { DiceStage } from './DiceStage';
import { CardPopup } from './CardPopup';
import { GameLog } from '../hud/GameLog';
import { GavelIcon, DicePairIcon } from '../icons/Icons';

interface CenterConsoleProps {
  gameState: GameState;
  playerId: string;
  sendIntent?: (intent: PlayerIntent) => void;
}

export function CenterConsole({ gameState, playerId, sendIntent }: CenterConsoleProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;

  return (
    <div className="board-center" style={{ gridColumn: '2 / 11', gridRow: '2 / 11' }}>
      <div className="board-center-content">
        {/* Luxury Brand Wordmark */}
        <div className="wordmark" style={{ fontSize: '36px' }}>
          VYA<span className="accent">PAR</span>
        </div>

        {/* 3D Dice Stage */}
        <DiceStage dice={gameState.dice} />

        {/* Interactive Roll Dice Button in Board Center */}
        {isMyTurn && gameState.phase === 'rolling' && sendIntent && (
          <button
            className="btn"
            onClick={() => sendIntent({ type: 'rollDice' })}
            style={{ padding: '14px 36px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <DicePairIcon size={20} color="#0b0b12" />
            <span>Roll Dice</span>
          </button>
        )}

        {/* Live Auction Banner in Center Board */}
        {gameState.phase === 'auction' && gameState.auction && (
          <div style={{ background: 'rgba(242, 169, 59, 0.12)', border: '1.5px solid var(--saffron)', borderRadius: '16px', padding: '12px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: 'var(--saffron)' }}>
              <GavelIcon size={16} color="var(--saffron)" />
              <span>AUCTION: {BOARD[gameState.auction.tileIndex]?.name}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink)' }}>
              Current Bid: <strong style={{ color: 'var(--saffron)' }}>₹{gameState.auction.currentBid}</strong>
            </div>
          </div>
        )}

        {/* Current Turn Indicator */}
        {currentPlayer && gameState.phase !== 'gameOver' && (
          <div className="turn-banner">
            <div className="turn-dot"></div>
            <span>
              {isMyTurn ? "It's " : ''}
              <b>{isMyTurn ? 'Your' : currentPlayer.name + "'s"}</b> turn
            </span>
          </div>
        )}

        {/* Card Popup */}
        <CardPopup card={gameState.currentCard} />

        {/* Game Log — embedded in board center */}
        <div className="center-log-wrap">
          <GameLog gameState={gameState} />
        </div>
      </div>
    </div>
  );
}
