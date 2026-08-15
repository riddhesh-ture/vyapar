import React from 'react';
import { GOTIS } from '../../gotis';

interface GotiPickerProps {
  selectedGotiId: string;
  onSelect: (gotiId: string) => void;
}

export function GotiPicker({ selectedGotiId, onSelect }: GotiPickerProps) {
  return (
    <div className="picker-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
      {GOTIS.map((goti) => {
        const isSelected = goti.id === selectedGotiId;
        return (
          <div
            key={goti.id}
            className={`picker-token ${goti.className} ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(goti.id)}
            title={goti.name}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {goti.renderIcon({ size: 22, color: '#ffffff' })}
          </div>
        );
      })}
    </div>
  );
}
