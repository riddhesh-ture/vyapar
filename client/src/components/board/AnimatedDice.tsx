import React from 'react';
import { motion } from 'framer-motion';
import type { DiceRoll } from '@vyapar/game-logic';

interface AnimatedDiceProps {
  dice: DiceRoll | null;
  rolling?: boolean;
}

interface DieProps {
  value: number;
  isRolling: boolean;
  rollKey: string;
}

export function SingleDie({ value, isRolling, rollKey }: DieProps) {
  const faceVal = Math.min(Math.max(value, 1), 6);

  return (
    <motion.div
      key={rollKey}
      className={`die 3d-die face-${faceVal}`}
      initial={{ rotateX: -15, rotateY: 15, scale: 0.95 }}
      animate={
        isRolling
          ? {
              rotateX: [0, 360, 720, 1080],
              rotateY: [0, -360, -720, -1080],
              rotateZ: [0, 180, 360],
              scale: [0.9, 1.15, 0.95, 1],
              y: [-15, 8, -4, 0],
            }
          : { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1, y: 0 }
      }
      transition={{ duration: 0.65, ease: 'easeOut' }}
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
    </motion.div>
  );
}

export function AnimatedDice({ dice, rolling }: AnimatedDiceProps) {
  const die1Val = dice?.die1 ?? 1;
  const die2Val = dice?.die2 ?? 2;
  const isDoubles = dice?.isDoubles ?? false;
  const rollKey = `${dice?.die1 ?? 1}-${dice?.die2 ?? 2}-${dice?.total ?? 0}`;

  return (
    <div className="dice-stage-wrap">
      <div className="dice-row">
        <SingleDie value={die1Val} isRolling={!!rolling || (dice !== null)} rollKey={`d1-${rollKey}`} />
        <SingleDie value={die2Val} isRolling={!!rolling || (dice !== null)} rollKey={`d2-${rollKey}`} />
      </div>

      {dice ? (
        <motion.div
          key={rollKey}
          initial={{ opacity: 0, scale: 0.8, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`dice-total-pill ${isDoubles ? 'doubles-glow' : ''}`}
        >
          {isDoubles ? (
            <span>✨ DOUBLES! ({dice.total})</span>
          ) : (
            <span>Total: <b>{dice.total}</b></span>
          )}
        </motion.div>
      ) : (
        <div className="dice-total-pill placeholder-pill">
          <span>Ready to Roll</span>
        </div>
      )}
    </div>
  );
}
