import React from 'react';
import type { Card } from '@vyapar/game-logic';
import { ChanceIcon, ChestIcon } from '../icons/Icons';

interface CardPopupProps {
  card: Card | null;
}

export function CardPopup({ card }: CardPopupProps) {
  if (!card) return null;

  const isChance = card.deck === 'chance';

  return (
    <div className="card-popup card-content" style={{ marginTop: '8px', padding: '12px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--saffron)' }}>
        {isChance ? <ChanceIcon size={18} color="var(--saffron)" /> : <ChestIcon size={18} color="var(--saffron)" />}
        <span className="sq-kind" style={{ color: 'var(--saffron)', fontWeight: 700 }}>
          {card.deck.toUpperCase()}
        </span>
      </div>
      <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--ink)', lineHeight: 1.35, margin: 0 }}>
        {card.text}
      </p>
    </div>
  );
}
