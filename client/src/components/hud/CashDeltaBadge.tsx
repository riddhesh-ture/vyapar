import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEngine';

interface CashDeltaBadgeProps {
  cash: number;
  playerId: string;
}

interface FloatingDelta {
  id: number;
  amount: number;
}

export function CashDeltaBadge({ cash, playerId }: CashDeltaBadgeProps) {
  const prevCashRef = useRef<number>(cash);
  const [deltas, setDeltas] = useState<FloatingDelta[]>([]);

  useEffect(() => {
    const diff = cash - prevCashRef.current;
    if (diff !== 0 && prevCashRef.current !== 0) {
      const newDelta: FloatingDelta = {
        id: Date.now() + Math.random(),
        amount: diff,
      };

      if (diff > 0) {
        sounds.playPassGo();
      } else {
        sounds.playPayRent();
      }

      setDeltas(prev => [...prev.slice(-3), newDelta]);

      const timer = setTimeout(() => {
        setDeltas(prev => prev.filter(d => d.id !== newDelta.id));
      }, 2000);

      return () => clearTimeout(timer);
    }
    prevCashRef.current = cash;
  }, [cash, playerId]);

  return (
    <div className="cash-delta-container">
      <AnimatePresence>
        {deltas.map(d => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -24, scale: 1.1 }}
            exit={{ opacity: 0, y: -45, scale: 0.9 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className={`cash-delta-badge ${d.amount > 0 ? 'delta-positive' : 'delta-negative'}`}
          >
            {d.amount > 0 ? `+₹${d.amount.toLocaleString()}` : `-₹${Math.abs(d.amount).toLocaleString()}`}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
