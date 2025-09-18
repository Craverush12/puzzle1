'use client';

import { useState } from 'react';
import { useAppContext, MAIN_PUZZLE, DIFFICULTY_CONFIGS } from '@/components/AppProvider';

export default function PuzzleSelectionScreen() {
  const { setCurrentScreen, setUserSession, userSession } = useAppContext();
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    console.log('Difficulty selected:', difficulty); // Debug log
    setSelectedDifficulty(difficulty);
    // Automatically start the puzzle when a difficulty is selected
    setUserSession({ selectedDifficulty: difficulty });
    setCurrentScreen('puzzlePlay');
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--background-primary)' }}>
      {/* Title */}
      <h1 className="text-white text-3xl font-bold mb-8">
        Select the Puzzle
      </h1>

      {/* Difficulty Selection */}
      <div className="flex gap-4 mb-8">
        {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
          const isSelected = selectedDifficulty === difficulty;
          
          return (
            <button
              key={difficulty}
              onClick={() => handleDifficultySelect(difficulty)}
              className={`transform hover:scale-105 transition-all duration-200 active:scale-95 relative border-2 rounded-2xl px-6 py-4 ${
                isSelected 
                  ? 'border-teal-400 bg-teal-800/50' 
                  : 'border-gray-400 bg-gray-800/30 hover:border-teal-300'
              }`}
            >
              <span className="text-white font-bold text-lg">
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Puzzle Image */}
      <div className="relative">
        <div className="border-2 border-green-500 p-2">
          <div className="border-2 border-teal-800">
            <img
              src={MAIN_PUZZLE.image}
              alt={MAIN_PUZZLE.title}
              className="w-80 h-80 object-cover"
            />
          </div>
        </div>
      </div>

    </div>
  );
}