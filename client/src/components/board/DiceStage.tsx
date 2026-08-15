import React from 'react';
import type { DiceRoll } from '@vyapar/game-logic';

interface DiceStageProps {
  dice: DiceRoll | null;
  rolling?: boolean;
}

export function DieFace({ value, rolling }: { value: number; rolling?: boolean }) {
  const faceVal = Math.min(Math.max(value, 1), 6);
  return (
    <div className={`die face-${faceVal} ${rolling ? 'rolling' : ''}`}>
      <div className="pip p1"></div>
      <div className="pip p2"></div>
      <div className="pip p3"></div>
      <div className="pip p4"></div>
      <div className="pip p5"></div>
      <div className="pip p6"></div>
      <div className="pip p7"></div>
      <div className="pip p8"></div>
      <div className="pip p9"></div>
    </div>
  );
}

export function DiceStage({ dice, rolling }: DiceStageProps) {
  if (!dice && !rolling) return null;

  return (
    <div className="dice-block">
      <div className="dice-row">
        <DieFace value={dice?.die1 ?? 1} rolling={rolling} />
        <DieFace value={dice?.die2 ?? 1} rolling={rolling} />
      </div>
      {dice && (
        <div style={{ marginTop: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--saffron)', fontWeight: 700 }}>
          {dice.isDoubles ? `✨ DOUBLES! (${dice.total})` : `Total: ${dice.total}`}
        </div>
      )}
    </div>
  );
}
