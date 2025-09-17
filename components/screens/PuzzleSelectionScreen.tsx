'use client';

import { useAppContext, Puzzle } from '@/components/AppProvider';

const puzzles: Puzzle[] = [
  { id: '1', title: 'Beautiful Landscape', image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg', difficulty: 'easy' },
  { id: '2', title: 'Ocean Sunset', image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', difficulty: 'medium' },
  { id: '3', title: 'Mountain Peak', image: 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg', difficulty: 'medium' },
  { id: '4', title: 'Forest Path', image: 'https://images.pexels.com/photos/441923/pexels-photo-441923.jpeg', difficulty: 'easy' },
  { id: '5', title: 'City Skyline', image: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg', difficulty: 'hard' },
  { id: '6', title: 'Desert Dunes', image: 'https://images.pexels.com/photos/631477/pexels-photo-631477.jpeg', difficulty: 'hard' },
];

export default function PuzzleSelectionScreen() {
  const { setCurrentScreen, setUserSession, userSession } = useAppContext();

  const handlePuzzleSelect = (puzzle: Puzzle) => {
    setUserSession({ selectedPuzzle: puzzle });
    setCurrentScreen('puzzlePlay');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="kiosk-container flex flex-col p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Choose Your Puzzle, {userSession.name}!
        </h1>
        <p className="text-lg md:text-xl text-gray-600">
          Select a puzzle to begin your challenge
        </p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 max-w-2xl mx-auto overflow-y-auto">
        {puzzles.map((puzzle) => (
          <div
            key={puzzle.id}
            onClick={() => handlePuzzleSelect(puzzle)}
            className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <div className="relative h-40 md:h-48">
              <img
                src={puzzle.image}
                alt={puzzle.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-2 right-2 ${getDifficultyColor(puzzle.difficulty)} text-white px-2 py-1 rounded-full text-xs font-semibold capitalize`}>
                {puzzle.difficulty}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 text-center">
                {puzzle.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setCurrentScreen('userInfo')}
          className="bg-gray-500 hover:bg-gray-600 text-white text-xl font-bold py-3 px-6 rounded-2xl transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}