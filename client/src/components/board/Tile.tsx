import React from 'react';
import type { GameState, Tile as TileType } from '@vyapar/game-logic';
import { GROUP_COUNTRIES, GROUP_FLAGS } from '@vyapar/game-logic';
import { GotiToken } from './GotiToken';
import {
  CountryCrestBadge,
  StartFlagIcon,
  JailBarsIcon,
  VacationPalmIcon,
  PoliceBadgeIcon,
  JetlinerIcon,
  EnergyBoltIcon,
  TreasuryIcon,
  ChanceIcon,
  ChestIcon,
  BusinessIcon,
  RestHouseIcon,
} from '../icons/Icons';

interface TileProps {
  tile: TileType;
  gameState: GameState;
  playerId: string;
  onSelectTile?: (tileIndex: number) => void;
}

const OWNER_CLASSES = ['owner-p1', 'owner-p2', 'owner-p3', 'owner-p4', 'owner-p5'];

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

export function getTileGridPosition(index: number): { col: number; row: number; side: 'bottom' | 'left' | 'top' | 'right' } {
  if (index === 0) return { col: 1, row: 1, side: 'top' };
  if (index < 10) return { col: index + 1, row: 1, side: 'top' };
  if (index === 10) return { col: 11, row: 1, side: 'right' };
  if (index < 20) return { col: 11, row: index - 10 + 1, side: 'right' };
  if (index === 20) return { col: 11, row: 11, side: 'bottom' };
  if (index < 30) return { col: 11 - (index - 20), row: 11, side: 'bottom' };
  if (index === 30) return { col: 1, row: 11, side: 'left' };
  return { col: 1, row: 11 - (index - 30), side: 'left' };
}

function getSpecialTileDetails(tile: TileType): { washClass: string; renderIcon: () => React.ReactNode; kind: string } {
  if (tile.type === 'corner') {
    switch (tile.cornerType) {
      case 'go': return { washClass: 'corner-start', renderIcon: () => <StartFlagIcon size={20} color="var(--saffron)" />, kind: 'START' };
      case 'jail': return { washClass: 'corner-jail', renderIcon: () => <JailBarsIcon size={20} color="#ff9d6c" />, kind: 'In Prison' };
      case 'freeParking': return { washClass: 'corner-vac', renderIcon: () => <VacationPalmIcon size={20} color="#5ce39a" />, kind: 'Vacation' };
      case 'goToJail': return { washClass: 'corner-police', renderIcon: () => <PoliceBadgeIcon size={20} color="#e35c3c" />, kind: 'Go to Prison' };
      default: return { washClass: 'corner-jail', renderIcon: () => <JailBarsIcon size={20} />, kind: 'Corner' };
    }
  }
  if (tile.type === 'railway') return { washClass: 'special-util', renderIcon: () => <JetlinerIcon size={18} color="var(--saffron)" />, kind: 'Airport' };
  if (tile.type === 'utility') return { washClass: 'special-util', renderIcon: () => <EnergyBoltIcon size={18} color="var(--saffron)" />, kind: 'Company' };
  if (tile.type === 'tax') return { washClass: 'special-util', renderIcon: () => <TreasuryIcon size={18} color="#ffd18f" />, kind: 'Tax' };
  if (tile.type === 'card') {
    return {
      washClass: 'special-chest',
      renderIcon: () => tile.deck === 'chance' ? <ChanceIcon size={18} color="var(--saffron)" /> : <ChestIcon size={18} color="var(--saffron)" />,
      kind: tile.deck === 'chance' ? 'Chance' : tile.deck === 'communityChest' ? 'Chest' : 'Surprise',
    };
  }
  if (tile.type === 'fee') return { washClass: 'special-chest', renderIcon: () => <BusinessIcon size={18} color="#8fc7ff" />, kind: 'Business' };
  if (tile.type === 'skip') return { washClass: 'special-util', renderIcon: () => <RestHouseIcon size={18} color="#b9ec8a" />, kind: 'Rest' };
  return { washClass: 'special-util', renderIcon: () => <BusinessIcon size={18} />, kind: 'Property' };
}

export function Tile({ tile, gameState, playerId, onSelectTile }: TileProps) {
  const { col, row, side } = getTileGridPosition(tile.index);
  const isProperty = tile.type === 'property' && tile.group;
  const prop = gameState.properties[tile.index];
  const owner = prop?.ownerId
    ? gameState.players.find(p => p.id === prop.ownerId)
    : null;
  const ownerIndex = owner
    ? gameState.players.findIndex(p => p.id === owner.id)
    : -1;
  const ownerClass = ownerIndex >= 0 ? OWNER_CLASSES[ownerIndex % OWNER_CLASSES.length] : 'owner-unclaimed';

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isCurrentPlayerLand = currentPlayer && currentPlayer.position === tile.index;

  const playersHere = gameState.players.filter(
    p => p.position === tile.index && !p.bankrupt
  );

  if (isProperty && tile.group) {
    const country = GROUP_COUNTRIES[tile.group];
    const wash = GROUP_WASHES[tile.group] || 'brazil';

    return (
      <div
        className={`tile-wrap side-${side}`}
        style={{ gridColumn: col, gridRow: row }}
        title={`${tile.name} (${country}) — Click to inspect`}
      >
        <div
          className={`tile-node tile-${side} ${isCurrentPlayerLand ? 'active-land' : ''}`}
          onClick={() => onSelectTile?.(tile.index)}
        >
          <div className={`wash ${wash}`}></div>
          <div className={side === 'left' || side === 'right' ? 'perf-v' : 'perf-h'}></div>

          {/* Vector Country Crest Badge */}
          <div className="flag-bubble" title={country}>
            <CountryCrestBadge group={tile.group} size={22} />
          </div>

          {/* Owner strip */}
          <div className={`owner-strip ${ownerClass}`}></div>

          {/* Tile Content (Rotated for side columns) */}
          <div className={side === 'left' || side === 'right' ? 'tile-body-rotated' : 'tile-body'}>
            <div className="tile-name">{tile.name}</div>
            <div className="tile-kind">{country}</div>
            <div className="tile-price">
              <span className="rs">₹</span>
              {tile.price?.toLocaleString()}
            </div>
          </div>

          {/* Players on Tile */}
          <div className={`goti-slot-box ${playersHere.length === 0 ? 'empty' : ''}`}>
            {playersHere.map((p) => {
              const pIdx = gameState.players.findIndex(pl => pl.id === p.id);
              return <GotiToken key={p.id} player={p} playerIndex={pIdx} size="sm" />;
            })}
          </div>
        </div>
      </div>
    );
  }

  // Corner & Special Tiles
  const details = getSpecialTileDetails(tile);

  if (tile.type === 'corner') {
    return (
      <div
        className={`tile-wrap side-${side}`}
        style={{ gridColumn: col, gridRow: row }}
        title={tile.name}
      >
        <div
          className={`tile-node tile-corner side-${side} ${isCurrentPlayerLand ? 'active-land' : ''}`}
          onClick={() => onSelectTile?.(tile.index)}
        >
          <div className={`wash ${details.washClass}`}></div>
          <div className="corner-inner">
            <div className="corner-icon">{details.renderIcon()}</div>
            <div className="corner-title">{tile.name}</div>
            <div className="corner-desc">{details.kind}</div>
          </div>
          <div className={`goti-slot-box ${playersHere.length === 0 ? 'empty' : ''}`}>
            {playersHere.map((p) => {
              const pIdx = gameState.players.findIndex(pl => pl.id === p.id);
              return <GotiToken key={p.id} player={p} playerIndex={pIdx} size="sm" />;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`tile-wrap side-${side}`}
      style={{ gridColumn: col, gridRow: row }}
      title={tile.name}
    >
      <div
        className={`tile-node tile-${side} ${isCurrentPlayerLand ? 'active-land' : ''}`}
        onClick={() => onSelectTile?.(tile.index)}
      >
        <div className={`wash ${details.washClass}`}></div>
        <div className={side === 'left' || side === 'right' ? 'perf-v' : 'perf-h'}></div>
        <div className="flag-bubble">{details.renderIcon()}</div>
        <div className={`owner-strip ${ownerClass}`}></div>
        <div className={side === 'left' || side === 'right' ? 'tile-body-rotated' : 'tile-body'}>
          <div className="tile-name">{tile.name}</div>
          <div className="tile-kind">{details.kind}</div>
          {tile.price ? (
            <div className="tile-price">
              <span className="rs">₹</span>
              {tile.price.toLocaleString()}
            </div>
          ) : null}
        </div>
        <div className={`goti-slot-box ${playersHere.length === 0 ? 'empty' : ''}`}>
          {playersHere.map((p) => {
            const pIdx = gameState.players.findIndex(pl => pl.id === p.id);
            return <GotiToken key={p.id} player={p} playerIndex={pIdx} size="sm" />;
          })}
        </div>
      </div>
    </div>
  );
}
