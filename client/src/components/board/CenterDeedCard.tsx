import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import {
  BOARD,
  GROUP_COUNTRIES,
  BASE_RENT,
  RENT_MULTIPLIERS,
  getMortgageValue,
} from '@vyapar/game-logic';
import { CountryCrestBadge, HouseIcon, HotelIcon, CloseIcon } from '../icons/Icons';

interface CenterDeedCardProps {
  tileIndex: number;
  gameState: GameState;
  playerId: string;
  onClose?: () => void;
  sendIntent?: (intent: PlayerIntent) => void;
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

export function CenterDeedCard({
  tileIndex,
  gameState,
  playerId,
  onClose,
}: CenterDeedCardProps) {
  const tile = BOARD[tileIndex];
  if (!tile) return null;

  const propState = gameState.properties[tileIndex];
  const owner = propState?.ownerId ? gameState.players.find(p => p.id === propState.ownerId) : null;
  const isOwner = propState?.ownerId === playerId;
  const isProperty = tile.type === 'property' && tile.group;
  const country = tile.group ? GROUP_COUNTRIES[tile.group] : '';
  const wash = tile.group ? GROUP_WASHES[tile.group] : 'special-util';
  const baseRent = tile.group ? BASE_RENT[tile.group] : 0;
  const mortgageVal = getMortgageValue(tileIndex);
  const houseCost = tile.price ? Math.round(tile.price / 2 / 50) * 50 : 0;

  return (
    <div className="center-deed-card animate-fadeIn">
      {/* Header with Country Crest and Title */}
      <div className={`center-deed-header wash-${wash}`}>
        <div className="center-deed-flag">
          {tile.group ? <CountryCrestBadge group={tile.group} size={28} /> : <span style={{ fontSize: '18px' }}>📍</span>}
        </div>
        <div className="center-deed-meta">
          <div className="center-deed-title">{tile.name}</div>
          <div className="center-deed-country">{country ? `${country} · Group ${tile.group}` : tile.type.toUpperCase()}</div>
        </div>
        {onClose && (
          <button className="center-deed-close" onClick={onClose} title="Close deed view">
            <CloseIcon size={14} color="var(--ink-dim)" />
          </button>
        )}
      </div>

      {/* Ownership & Status */}
      <div className="center-deed-status">
        {owner ? (
          <span className={`deed-status-tag ${isOwner ? 'status-mine' : 'status-owned'}`}>
            {isOwner ? '★ Owned by You' : `Owned by ${owner.name}`}
            {propState?.mortgaged && ' (MORTGAGED)'}
            {propState && propState.houses > 0 && (
              <span className="deed-buildings">
                {propState.houses === 5 ? (
                  <>
                    <HotelIcon size={11} color="#ffd18f" />
                    <span>Hotel</span>
                  </>
                ) : (
                  <>
                    <HouseIcon size={10} color="var(--saffron)" />
                    <span>{propState.houses} Houses</span>
                  </>
                )}
              </span>
            )}
          </span>
        ) : tile.price ? (
          <span className="deed-status-tag status-available">
            Available to Buy · ₹{tile.price.toLocaleString()}
          </span>
        ) : null}
      </div>

      {/* Compact Rent Table (Richup Style) */}
      {isProperty && baseRent > 0 && (
        <div className="center-deed-rent-table">
          <div className="deed-rent-row">
            <span>Base Rent</span>
            <span className="deed-val">₹{baseRent.toLocaleString()}</span>
          </div>
          <div className="deed-rent-row highlight">
            <span>With Color Set (×2)</span>
            <span className="deed-val">₹{(baseRent * 2).toLocaleString()}</span>
          </div>
          <div className="deed-rent-row">
            <span>With 1 House</span>
            <span className="deed-val">₹{(baseRent * (RENT_MULTIPLIERS[1] || 5)).toLocaleString()}</span>
          </div>
          <div className="deed-rent-row">
            <span>With 2 Houses</span>
            <span className="deed-val">₹{(baseRent * (RENT_MULTIPLIERS[2] || 15)).toLocaleString()}</span>
          </div>
          <div className="deed-rent-row">
            <span>With 3 Houses</span>
            <span className="deed-val">₹{(baseRent * (RENT_MULTIPLIERS[3] || 45)).toLocaleString()}</span>
          </div>
          <div className="deed-rent-row">
            <span>With 4 Houses</span>
            <span className="deed-val">₹{(baseRent * (RENT_MULTIPLIERS[4] || 80)).toLocaleString()}</span>
          </div>
          <div className="deed-rent-row hotel-row">
            <span>With Hotel</span>
            <span className="deed-val" style={{ color: '#ffd18f' }}>₹{(baseRent * (RENT_MULTIPLIERS[5] || 125)).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Airports Table */}
      {tile.type === 'airport' && (
        <div className="center-deed-rent-table">
          <div className="deed-rent-row"><span>1 Airport</span><span className="deed-val">₹250</span></div>
          <div className="deed-rent-row"><span>2 Airports</span><span className="deed-val">₹500</span></div>
          <div className="deed-rent-row"><span>3 Airports</span><span className="deed-val">₹1,000</span></div>
          <div className="deed-rent-row highlight"><span>All 4 Airports</span><span className="deed-val">₹2,000</span></div>
        </div>
      )}

      {/* Property Footnote Stats */}
      {tile.price && (
        <div className="center-deed-foot-stats">
          <div className="foot-stat">
            <span className="lbl">Price</span>
            <span className="val">₹{tile.price.toLocaleString()}</span>
          </div>
          {isProperty && (
            <div className="foot-stat">
              <span className="lbl">House Cost</span>
              <span className="val">₹{houseCost.toLocaleString()}</span>
            </div>
          )}
          <div className="foot-stat">
            <span className="lbl">Mortgage</span>
            <span className="val">₹{mortgageVal.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
