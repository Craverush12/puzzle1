'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/components/AppProvider';
import PuzzleGame from '@/components/PuzzleGame';
import Timer from '@/components/Timer';

export default function PuzzlePlayScreen() {
  const { setCurrentScreen, userSession, setUserSession } = useAppContext();
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!gameStarted) {
      const startTime = Date.now();
      setUserSession({ startTime });
      setGameStarted(true);
    }
  }, [gameStarted, setUserSession]);

  const handlePuzzleComplete = () => {
    const endTime = Date.now();
    const completionTime = endTime - userSession.startTime;
    setUserSession({ 
      endTime, 
      completionTime 
    });
    setCurrentScreen('completion');
  };

  const handleHome = () => {
    setCurrentScreen('welcome');
  };

  const handleBack = () => {
    setCurrentScreen('puzzleSelection');
  };

  if (!userSession.selectedPuzzle) {
    return null;
  }

  return (
    <div className="kiosk-container flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg md:text-xl font-bold text-gray-800">
          Player: {userSession.name}
        </div>
        <Timer 
          startTime={userSession.startTime}
          onTimeUpdate={setTimeElapsed}
        />
      </div>

      {/* Puzzle Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <PuzzleGame
          puzzle={userSession.selectedPuzzle}
          onComplete={handlePuzzleComplete}
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center space-x-4 mt-4">
        <button
          onClick={handleBack}
          className="bg-gray-500 hover:bg-gray-600 text-white text-lg font-bold py-2 px-6 rounded-2xl transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleHome}
          className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold py-2 px-6 rounded-2xl transition-colors"
        >
          Home
        </button>
      </div>
    </div>
  );
}