import React from 'react';
import type { Player, GameState } from '@vyapar/game-logic';
import { BOARD } from '@vyapar/game-logic';
import { GotiToken } from '../board/GotiToken';
import { PropertyBadge } from './PropertyBadge';
import { CrownIcon, LockIcon, SkullIcon } from '../icons/Icons';

interface PlayerCardProps {
  player: Player;
  playerIndex: number;
  gameState: GameState;
  isYou: boolean;
  isCurrentTurn: boolean;
  onSelectTile?: (tileIndex: number) => void;
}

export function PlayerCard({
  player,
  playerIndex,
  gameState,
  isYou,
  isCurrentTurn,
  onSelectTile,
}: PlayerCardProps) {
  const position = BOARD[player.position];

  // Get owned properties with details
  const ownedProps = Object.entries(gameState.properties)
    .filter(([_, p]) => p.ownerId === player.id)
    .map(([idxStr, pState]) => ({
      index: Number(idxStr),
      tile: BOARD[Number(idxStr)],
      state: pState,
    }));

  return (
    <div
      className={`hud-chip ${isCurrentTurn ? 'active-turn' : ''}`}
      style={{
        width: '100%',
        opacity: player.bankrupt ? 0.35 : 1,
        position: 'relative',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '6px',
      }}
    >
      {/* Top row: token + name/cash */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <GotiToken player={player} playerIndex={playerIndex} size="md" active={isCurrentTurn} />
        <div className="hud-info">
          <div className="hud-name">
            <span>{player.name}</span>
            {((gameState.hostId || gameState.players[0]?.id) === player.id) && <CrownIcon size={13} color="var(--saffron)" />}
            {isYou && <span className="you-tag">(You)</span>}
          </div>
          <div className="hud-cash">
            <span className="rs">₹</span>
            {player.cash.toLocaleString()}
          </div>
          {/* Meta line: position + properties */}
          <div className="player-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10Z"/><circle cx="12" cy="11" r="2"/></svg>
            <span>{position?.name}</span>
            <span className="meta-divider">·</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
            <span>{ownedProps.length} properties</span>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {player.inJail && (
        <div style={{ fontSize: '10.5px', color: 'var(--danger)', background: 'rgba(227, 92, 92, 0.12)', padding: '3px 8px', borderRadius: '6px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <LockIcon size={12} color="var(--danger)" />
          <span>In Jail ({player.jailTurns} turns left)</span>
        </div>
      )}
      {player.bankrupt && (
        <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 'bold', background: 'rgba(227, 92, 92, 0.15)', padding: '4px', borderRadius: '6px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <SkullIcon size={13} color="var(--danger)" />
          <span>BANKRUPT</span>
        </div>
      )}

      {/* Property Portfolio Badges */}
      {ownedProps.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
          {ownedProps.map(({ index: pIdx, tile: pTile, state: pState }) => (
            <PropertyBadge
              key={pIdx}
              tile={pTile}
              state={pState}
              tileIndex={pIdx}
              onClick={() => onSelectTile?.(pIdx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
