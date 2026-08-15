import React from 'react';
import type { GameState } from '@vyapar/game-logic';
import {
  BOARD,
  GROUP_COUNTRIES,
  BASE_RENT,
  RENT_MULTIPLIERS,
  getMortgageValue,
} from '@vyapar/game-logic';
import { CountryCrestBadge, HouseIcon, HotelIcon } from '../icons/Icons';

interface RentBoardProps {
  gameState: GameState;
  playerId: string;
  onSelectTile?: (tileIndex: number) => void;
}

const GROUP_WASHES: Record<string, string> = {
  A: 'brazil',
  B: 'france',
  C: 'china',
  D: 'japan',
  E: 'italy',
  F: 'germany',
  G: 'uk',
  H: 'usa',
};

export function RentBoard({ gameState, playerId, onSelectTile }: RentBoardProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (!currentPlayer) return null;

  const tile = BOARD[currentPlayer.position];
  if (!tile) return null;

  // Only show for property tiles
  const isProperty = tile.type === 'property' && tile.group;
  const isRailway = tile.type === 'railway';
  const isUtility = tile.type === 'utility';

  if (!isProperty && !isRailway && !isUtility) return null;

  const propState = gameState.properties[currentPlayer.position];
  const owner = propState?.ownerId
    ? gameState.players.find(p => p.id === propState.ownerId)
    : null;
  const isOwner = propState?.ownerId === playerId;
  const country = tile.group ? GROUP_COUNTRIES[tile.group] : '';
  const wash = tile.group ? GROUP_WASHES[tile.group] : 'special-util';
  const baseRent = tile.group ? BASE_RENT[tile.group] : 0;
  const mortgageVal = getMortgageValue(currentPlayer.position);

  return (
    <div className="rent-board" onClick={() => onSelectTile?.(currentPlayer.position)}>
      {/* Colored header with flag */}
      <div className="rent-board-header">
        <div className={`wash ${wash}`}></div>
        {tile.group && <CountryCrestBadge group={tile.group} size={28} />}
        <div className="rent-board-name">{tile.name}</div>
        <div className="rent-board-sub">
          {country ? `${country} · Group ${tile.group}` : tile.type.toUpperCase()}
        </div>
        {/* Ownership status */}
        {owner ? (
          <span style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '20px',
            background: propState?.mortgaged ? 'rgba(227, 92, 92, 0.25)' : 'rgba(242, 169, 59, 0.2)',
            border: '1px solid var(--glass-border)',
            color: propState?.mortgaged ? 'var(--danger)' : 'var(--saffron)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}>
            {isOwner ? 'Owned by You' : `Owned by ${owner.name}`}
            {propState?.mortgaged && <span>(M)</span>}
            {propState && propState.houses > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
                {propState.houses === 5 ? (
                  <HotelIcon size={10} color="#ffd18f" />
                ) : (
                  <>
                    <HouseIcon size={9} color="var(--saffron)" />
                    <span>{propState.houses}</span>
                  </>
                )}
              </span>
            )}
          </span>
        ) : tile.price ? (
          <span style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--glass-border)',
            color: 'var(--ink-dim)',
          }}>
            Available · ₹{tile.price.toLocaleString()}
          </span>
        ) : null}
      </div>

      {/* Rent table for properties */}
      <div className="rent-board-body">
        {isProperty && baseRent > 0 && (
          <>
            <div className="rent-head">
              <span>When</span>
              <span>Rent</span>
            </div>
            <div className="rent-row">
              <span>Base Rent</span>
              <span className="val"><span className="rs">₹</span>{baseRent.toLocaleString()}</span>
            </div>
            <div className="rent-row highlight">
              <span>With Color Set (×2)</span>
              <span className="val"><span className="rs">₹</span>{(baseRent * 2).toLocaleString()}</span>
            </div>
            <div className="rent-row">
              <span>With 1 House</span>
              <span className="val"><span className="rs">₹</span>{(baseRent * (RENT_MULTIPLIERS[1] || 5)).toLocaleString()}</span>
            </div>
            <div className="rent-row">
              <span>With 2 Houses</span>
              <span className="val"><span className="rs">₹</span>{(baseRent * (RENT_MULTIPLIERS[2] || 15)).toLocaleString()}</span>
            </div>
            <div className="rent-row">
              <span>With 3 Houses</span>
              <span className="val"><span className="rs">₹</span>{(baseRent * (RENT_MULTIPLIERS[3] || 45)).toLocaleString()}</span>
            </div>
            <div className="rent-row">
              <span>With 4 Houses</span>
              <span className="val"><span className="rs">₹</span>{(baseRent * (RENT_MULTIPLIERS[4] || 80)).toLocaleString()}</span>
            </div>
            <div className="rent-row">
              <span>With Hotel</span>
              <span className="val" style={{ color: '#ffd18f' }}><span className="rs">₹</span>{(baseRent * (RENT_MULTIPLIERS[5] || 125)).toLocaleString()}</span>
            </div>
          </>
        )}

        {isRailway && (
          <>
            <div className="rent-head">
              <span>Airports Owned</span>
              <span>Rent</span>
            </div>
            <div className="rent-row"><span>1 Airport</span><span className="val"><span className="rs">₹</span>250</span></div>
            <div className="rent-row"><span>2 Airports</span><span className="val"><span className="rs">₹</span>500</span></div>
            <div className="rent-row"><span>3 Airports</span><span className="val"><span className="rs">₹</span>1,000</span></div>
            <div className="rent-row"><span>All 4 Airports</span><span className="val"><span className="rs">₹</span>2,000</span></div>
          </>
        )}

        {/* Stats row */}
        {tile.price && (
          <div className="stat-row">
            <div className="stat">
              <div className="stat-lbl">Price</div>
              <div className="stat-v"><span className="rs" style={{ color: 'var(--saffron)' }}>₹</span>{tile.price.toLocaleString()}</div>
            </div>
            {tile.group && (
              <div className="stat">
                <div className="stat-lbl">House</div>
                <div className="stat-v"><span className="rs" style={{ color: 'var(--saffron)' }}>₹</span>{Math.round(tile.price / 2 / 50) * 50}</div>
              </div>
            )}
            <div className="stat">
              <div className="stat-lbl">Mortgage</div>
              <div className="stat-v"><span className="rs" style={{ color: 'var(--saffron)' }}>₹</span>{mortgageVal.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
