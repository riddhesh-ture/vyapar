import React from 'react';
import type { Tile, PropertyState } from '@vyapar/game-logic';
import { CountryCrestBadge, HouseIcon, HotelIcon } from '../icons/Icons';

interface PropertyBadgeProps {
  tile: Tile;
  state: PropertyState;
  tileIndex: number;
  onClick?: () => void;
}

export function PropertyBadge({ tile, state, tileIndex, onClick }: PropertyBadgeProps) {
  return (
    <span
      onClick={onClick}
      title={`${tile.name} — Click to inspect`}
      style={{
        fontSize: '10px',
        padding: '3px 8px',
        borderRadius: '6px',
        background: state.mortgaged ? 'rgba(227, 92, 92, 0.18)' : 'rgba(255, 255, 255, 0.08)',
        border: `1px solid ${state.mortgaged ? 'var(--danger)' : 'rgba(255,255,255,0.15)'}`,
        color: state.mortgaged ? 'var(--danger)' : 'var(--ink)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.15s ease',
      }}
    >
      {tile.group ? (
        <CountryCrestBadge group={tile.group} size={14} />
      ) : (
        <span style={{ fontSize: '10px' }}>📍</span>
      )}
      <span style={{ maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
        {tile.name}
      </span>
      {state.houses > 0 && (
        <span style={{ color: state.houses === 5 ? '#ffd18f' : 'var(--saffron)', display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
          {state.houses === 5 ? (
            <HotelIcon size={12} color="#ffd18f" />
          ) : (
            <>
              <HouseIcon size={11} color="var(--saffron)" />
              <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{state.houses}</span>
            </>
          )}
        </span>
      )}
      {state.mortgaged && <span style={{ fontSize: '9px', fontWeight: 'bold' }}>(M)</span>}
    </span>
  );
}
