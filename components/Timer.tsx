'use client';

import { useState, useEffect } from 'react';

interface TimerProps {
  startTime: number;
  onTimeUpdate?: (elapsed: number) => void;
}

export default function Timer({ startTime, onTimeUpdate }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const newElapsed = now - startTime;
      setElapsed(newElapsed);
      onTimeUpdate?.(newElapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, onTimeUpdate]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-white px-4 py-2 rounded-2xl" style={{ backgroundColor: '#014A4E' }}>
      <div className="text-xl md:text-xl font-bold">
        {formatTime(elapsed)}
      </div>
    </div>
  );
}