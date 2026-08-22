import React from 'react';
import type { Player, GameState } from '@vyapar/game-logic';
import { BOARD, calculateNetWorth } from '@vyapar/game-logic';
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
  const isHost = (gameState.hostId || gameState.players[0]?.id) === player.id;

  // Net worth = cash + property value
  let netWorth = player.cash;
  try { netWorth = calculateNetWorth(player.id, gameState); } catch { netWorth = player.cash; }

  // Max net worth for wealth bar
  const maxNetWorth = Math.max(
    ...gameState.players.map(p => {
      try { return calculateNetWorth(p.id, gameState); } catch { return p.cash; }
    }),
    1
  );
  const wealthPct = Math.round((netWorth / maxNetWorth) * 100);

  // Owned properties
  const ownedProps = Object.entries(gameState.properties)
    .filter(([_, p]) => p.ownerId === player.id)
    .map(([idxStr, pState]) => ({
      index: Number(idxStr),
      tile: BOARD[Number(idxStr)],
      state: pState,
    }));

  return (
    <div className={`pc-card ${isCurrentTurn ? 'pc-card-active' : ''} ${player.bankrupt ? 'pc-card-bankrupt' : ''}`}>
      {/* Active turn glow bar */}
      {isCurrentTurn && <div className="pc-active-bar" />}

      {/* Top row */}
      <div className="pc-top">
        <GotiToken player={player} playerIndex={playerIndex} size="md" active={isCurrentTurn} />
        <div className="pc-info">
          <div className="pc-name-row">
            <span className="pc-name">{player.name}</span>
            {isHost && <CrownIcon size={11} color="var(--saffron)" />}
            {isYou && <span className="pc-you-tag">You</span>}
            {player.inJail && <LockIcon size={11} color="var(--danger)" />}
          </div>
          <div className="pc-cash">
            <span className="rs">₹</span>{player.cash.toLocaleString()}
          </div>
          <div className="pc-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10Z"/><circle cx="12" cy="11" r="2"/></svg>
            <span>{position?.name ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Wealth bar */}
      <div className="pc-wealth-bar-track">
        <div
          className="pc-wealth-bar-fill"
          style={{ width: `${wealthPct}%` }}
          title={`Net worth ₹${netWorth.toLocaleString()}`}
        />
      </div>
      <div className="pc-wealth-label">
        <span>Net worth</span>
        <span className="pc-wealth-val">₹{netWorth.toLocaleString()}</span>
      </div>

      {/* Status pills */}
      {player.inJail && (
        <div className="pc-status pc-status-jail">
          <LockIcon size={11} color="var(--danger)" />
          <span>In Jail ({player.jailTurns}/3 turns)</span>
        </div>
      )}
      {player.bankrupt && (
        <div className="pc-status pc-status-bankrupt">
          <SkullIcon size={11} color="var(--danger)" />
          <span>BANKRUPT</span>
        </div>
      )}

      {/* Property badges */}
      {ownedProps.length > 0 && (
        <div className="pc-props">
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
