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
    <div className="text-white px-6 py-1.5 rounded-[0.5rem]" style={{ backgroundColor: '#014A4E' }}>
      <div className="text-lg md:text-lg font-medium">
        {formatTime(elapsed)}
      </div>
    </div>
  );
}