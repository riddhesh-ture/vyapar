import React, { useEffect, useState } from 'react';

interface TurnTimerBarProps {
  turnPlayerId: string;
  durationSeconds?: number;
  isMyTurn?: boolean;
}

export function TurnTimerBar({
  turnPlayerId,
  durationSeconds = 25,
  isMyTurn = false,
}: TurnTimerBarProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsedSec);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [turnPlayerId, durationSeconds]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / durationSeconds) * 100));
  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 10;

  const barColor = isUrgent
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : isMyTurn
    ? 'var(--saffron)'
    : '#3b82f6';

  return (
    <div className="turn-timer-container">
      <div className="turn-timer-track">
        <div
          className={`turn-timer-fill ${isUrgent ? 'urgent-pulse' : ''}`}
          style={{
            width: `${percentage}%`,
            background: barColor,
            boxShadow: `0 0 10px ${barColor}`,
          }}
        />
      </div>
      <div className="turn-timer-meta">
        <span className="turn-timer-label">
          {isMyTurn ? 'Your Turn' : 'Turn Time'}
        </span>
        <span className={`turn-timer-seconds ${isUrgent ? 'text-urgent' : ''}`}>
          {timeLeft}s
        </span>
      </div>
    </div>
  );
}
