import React, { useEffect, useState, useRef } from 'react';

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
      {deltas.map(d => (
        <div
          key={d.id}
          className={`cash-delta-badge ${d.amount > 0 ? 'delta-positive' : 'delta-negative'}`}
        >
          {d.amount > 0 ? `+₹${d.amount.toLocaleString()}` : `-₹${Math.abs(d.amount).toLocaleString()}`}
        </div>
      ))}
    </div>
  );
}
