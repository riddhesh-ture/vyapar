import React from 'react';
import { getGotiForPlayer, getGotiForPlayerIndex } from '../../gotis';
import type { Player } from '@vyapar/game-logic';

interface GotiTokenProps {
  player?: Player;
  playerIndex?: number;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function GotiToken({
  player,
  playerIndex = 0,
  size = 'md',
  active = false,
  className = '',
  style,
}: GotiTokenProps) {
  const goti = player ? getGotiForPlayer(player, playerIndex) : getGotiForPlayerIndex(playerIndex);

  const sizePx = size === 'sm' ? 24 : size === 'lg' ? 44 : 32;
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;

  return (
    <div
      className={`goti goti-board ${goti.className} ${active ? 'goti-active' : ''} ${className}`}
      title={player?.name || goti.name}
      style={{
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        boxShadow: active
          ? '0 0 14px var(--saffron), inset 0 2px 4px rgba(255,255,255,0.4)'
          : '0 4px 10px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.25)',
        ...style,
      }}
    >
      {goti.renderIcon({ size: iconSize, color: '#ffffff' })}
    </div>
  );
}
