import React from 'react';
import { GOTIS } from '../../gotis';

interface GotiPickerProps {
  selectedGotiId: string;
  onSelect: (gotiId: string) => string | void;
}

export function GotiPicker({ selectedGotiId, onSelect }: GotiPickerProps) {
  return (
    <div className="goti-picker-grid">
      {GOTIS.map((goti) => {
        const isSelected = goti.id === selectedGotiId;
        return (
          <button
            key={goti.id}
            type="button"
            className={`goti-pick-btn ${goti.className} ${isSelected ? 'goti-pick-selected' : ''}`}
            onClick={() => onSelect(goti.id)}
            title={goti.name}
            aria-label={`Select ${goti.name} token`}
          >
            {goti.renderIcon({ size: 24, color: '#ffffff' })}
            <span className="goti-pick-name">{goti.name}</span>
          </button>
        );
      })}
    </div>
  );
}
