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
    <div className="kiosk-container flex flex-col items-center justify-center ">
      {/* Puzzle Selection Screen Image - Center of screen */}
      <div className="flex justify-center h-full">
        <img 
          src="/blank.png" 
          alt="Select Puzzle Screen" 
          className="w-auto h-full object-contain"
        />
      </div>

      {/* Centered content - positioned within the border area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Difficulty Selection */}
        <div className="flex gap-2 mb-4">
          {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
            const isSelected = selectedDifficulty === difficulty;
            
            return (
              <button
                key={difficulty}
                onClick={() => handleDifficultySelect(difficulty)}
                className={`transform hover:scale-105 transition-all duration-200 active:scale-95 relative rounded-md px-4 pt-[0.25rem] pb-[0.25rem] border-2 flex items-center justify-center ${
                  isSelected 
                    ? 'border-[#014A4E]' 
                    : 'border-[#014A4E] hover:border-[#014A4E]'
                }`}
                style={{
                  backgroundColor: isSelected ? '#002124' : '#004F53'
                }}
              >
                <span className="text-white font-medium text-sm text-center">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Puzzle Image */}
        <div className="relative">
          <img
            src={MAIN_PUZZLE.image}
            alt={MAIN_PUZZLE.title}
            className="w-72 h-72 object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}