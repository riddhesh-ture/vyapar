import React from 'react';
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

  switch (gameState.phase) {
    case 'rolling':
      return (
        <div className="action-block">
          <div className="action-block-label">Rolling phase</div>
          <button
            className="btn action-full"
            onClick={() => sendIntent({ type: 'rollDice' })}
            style={{ padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <DicePairIcon size={20} color="#0b0b12" />
            <span>Roll Dice</span>
          </button>
        </div>
      );

    case 'buyDecision': {
      const canAfford = canBuyProperty(playerId, player.position, gameState);
      return (
        <div className="action-block">
          <div className="action-block-label">Property option</div>
          {/* Property info card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid var(--glass-border)', marginBottom: '10px' }}>
            {tile.group && <CountryCrestBadge group={tile.group} size={30} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>{tile.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--saffron)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{tile.price?.toLocaleString()}</div>
            </div>
          </div>
          <div className="action-btns-row">
            <button
              className="btn"
              onClick={() => sendIntent({ type: 'buyProperty' })}
              disabled={!canAfford}
            >
              Buy — ₹{tile.price?.toLocaleString()}
            </button>
            <button
              className="btn-ghost"
              onClick={() => sendIntent({ type: 'declineBuy' })}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <GavelIcon size={14} />
              <span>Auction</span>
            </button>
          </div>
        </div>
      );
    }

    case 'payingTax':
      return (
        <div className="action-block">
          <div className="action-block-label">Tax choice</div>
          <p style={{ fontSize: '12px', color: 'var(--ink-dim)', margin: '0 0 8px' }}>
            {tile.name}: Choose tax calculation method
          </p>
          <div className="action-btns-row">
            <button className="btn-ghost" onClick={() => sendIntent({ type: 'payTaxFlat' })}>
              Pay Flat ₹{tile.taxAmount?.toLocaleString()}
            </button>
            <button className="btn-ghost" onClick={() => sendIntent({ type: 'payTaxPercent' })}>
              Pay 10% Net Worth
            </button>
          </div>
        </div>
      );

    case 'inJail':
      return (
        <div className="action-block">
          <div className="action-block-label">In jail</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--danger)', background: 'rgba(227,92,92,0.1)', padding: '8px 12px', borderRadius: '10px', marginBottom: '10px' }}>
            <LockIcon size={14} color="var(--danger)" />
            <span>In Jail (Turn {player.jailTurns + 1}/{gameState.config.maxJailTurns})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn action-full"
              onClick={() => sendIntent({ type: 'rollForJail' })}
              style={{ padding: '13px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <DicePairIcon size={16} color="#0b0b12" />
              <span>Roll for Doubles</span>
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
                Use Jail Pass Card
              </button>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
