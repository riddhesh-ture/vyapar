import React from 'react';
import type { DiceRoll } from '@vyapar/game-logic';

interface AnimatedDiceProps {
  dice: DiceRoll | null;
  rolling?: boolean;
}

interface DieProps {
  value: number;
  isRolling: boolean;
}

export function SingleDie({ value, isRolling }: DieProps) {
  const faceVal = Math.min(Math.max(value, 1), 6);

  return (
    <div
      className={`die 3d-die face-${faceVal} ${isRolling ? 'die-rolling-anim' : ''}`}
    >
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

export function AnimatedDice({ dice, rolling }: AnimatedDiceProps) {
  const die1Val = dice?.die1 ?? 1;
  const die2Val = dice?.die2 ?? 2;
  const isDoubles = dice?.isDoubles ?? false;

  return (
    <div className="dice-stage-wrap">
      <div className="dice-row">
        <SingleDie value={die1Val} isRolling={!!rolling} />
        <SingleDie value={die2Val} isRolling={!!rolling} />
      </div>

      {dice ? (
        <div className={`dice-total-pill ${isDoubles ? 'doubles-glow' : ''}`}>
          {isDoubles ? (
            <span>✨ DOUBLES! ({dice.total})</span>
          ) : (
            <span>Total: <b>{dice.total}</b></span>
          )}
        </div>
      ) : (
        <div className="dice-total-pill placeholder-pill">
          <span>Ready to Roll</span>
        </div>
      )}
    </div>
  );
}
