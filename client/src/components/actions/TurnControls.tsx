import React, { useEffect } from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { BOARD, canBuyProperty } from '@vyapar/game-logic';
import { DicePairIcon, CountryCrestBadge, LockIcon, GavelIcon } from '../icons/Icons';

interface TurnControlsProps {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

export function TurnControls({ gameState, playerId, sendIntent }: TurnControlsProps) {
  const player = gameState.players[gameState.currentPlayerIndex];
  if (!player || player.id !== playerId) return null;

  const tile = BOARD[player.position];

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' || e.code === 'KeyR') {
        if (gameState.phase === 'rolling') { e.preventDefault(); sendIntent({ type: 'rollDice' }); }
        if (gameState.phase === 'inJail') { e.preventDefault(); sendIntent({ type: 'rollForJail' }); }
      }
      if (e.code === 'KeyB' && gameState.phase === 'buyDecision') {
        e.preventDefault();
        if (canBuyProperty(playerId, player.position, gameState)) sendIntent({ type: 'buyProperty' });
      }
      if (e.code === 'KeyD' && gameState.phase === 'buyDecision') {
        e.preventDefault();
        sendIntent({ type: 'declineBuy' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState.phase, playerId, player.position, sendIntent, gameState]);

  switch (gameState.phase) {
    case 'rolling':
      return (
        <div className="tc-block">
          <div className="tc-label">Your move</div>
          <button
            className="btn tc-roll-btn"
            onClick={() => sendIntent({ type: 'rollDice' })}
          >
            <DicePairIcon size={20} color="#0b0b12" />
            <span>Roll Dice</span>
            <span className="tc-shortcut">Space</span>
          </button>
        </div>
      );

    case 'buyDecision': {
      const canAfford = canBuyProperty(playerId, player.position, gameState);
      return (
        <div className="tc-block">
          <div className="tc-label">Property decision</div>
          {/* Property preview */}
          <div className="tc-property-preview">
            {tile.group && <CountryCrestBadge group={tile.group} size={34} />}
            <div className="tc-prop-info">
              <div className="tc-prop-name">{tile.name}</div>
              <div className="tc-prop-price">₹{tile.price?.toLocaleString()}</div>
            </div>
          </div>
          <div className="tc-btn-row">
            <button
              className="btn tc-buy-btn"
              onClick={() => sendIntent({ type: 'buyProperty' })}
              disabled={!canAfford}
              title="Buy (B)"
            >
              Buy — ₹{tile.price?.toLocaleString()}
            </button>
            <button
              className="btn-ghost tc-auction-btn"
              onClick={() => sendIntent({ type: 'declineBuy' })}
              title="Auction (D)"
            >
              <GavelIcon size={14} />
              <span>Auction</span>
            </button>
          </div>
          {!canAfford && (
            <div className="tc-cant-afford">Insufficient funds to purchase</div>
          )}
        </div>
      );
    }

    case 'payingTax':
      return (
        <div className="tc-block">
          <div className="tc-label">Tax payment</div>
          <p className="tc-desc">{tile.name}: choose your calculation method</p>
          <div className="tc-btn-row">
            <button className="btn-ghost" style={{ flex: 1, padding: '12px 8px' }}
              onClick={() => sendIntent({ type: 'payTaxFlat' })}>
              Flat ₹{tile.taxAmount?.toLocaleString()}
            </button>
            <button className="btn-ghost" style={{ flex: 1, padding: '12px 8px' }}
              onClick={() => sendIntent({ type: 'payTaxPercent' })}>
              10% Net Worth
            </button>
          </div>
        </div>
      );

    case 'inJail':
      return (
        <div className="tc-block">
          <div className="tc-label">In jail</div>
          <div className="tc-jail-banner">
            <LockIcon size={14} color="var(--danger)" />
            <span>Turn {player.jailTurns + 1} of {gameState.config.maxJailTurns}</span>
          </div>
          <div className="tc-jail-options">
            <button
              className="btn tc-roll-btn"
              onClick={() => sendIntent({ type: 'rollForJail' })}
            >
              <DicePairIcon size={16} color="#0b0b12" />
              <span>Roll for Doubles</span>
              <span className="tc-shortcut">Space</span>
            </button>
            <button
              className="btn-ghost action-full"
              onClick={() => sendIntent({ type: 'payJailFine' })}
              disabled={player.cash < gameState.config.jailFine}
              style={{ padding: '11px', fontSize: '13px' }}
            >
              Pay Fine — ₹{gameState.config.jailFine}
            </button>
            {player.getOutOfJailFreeCards > 0 && (
              <button
                className="btn-ghost action-full"
                onClick={() => sendIntent({ type: 'useGetOutOfJailCard' })}
                style={{ padding: '11px', fontSize: '13px', color: 'var(--saffron)' }}
              >
                🃏 Use Jail Pass Card
              </button>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
