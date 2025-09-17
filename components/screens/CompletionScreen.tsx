'use client';

import { useAppContext } from '@/components/AppProvider';
import { submitScore } from '@/lib/supabase';

export default function CompletionScreen() {
  const { setCurrentScreen, userSession, resetSession } = useAppContext();

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleViewLeaderboard = async () => {
    // Submit score to leaderboard
    try {
      await submitScore({
        name: userSession.name,
        city: userSession.city as 'Jeddah' | 'Riyadh',
        puzzle_id: userSession.selectedPuzzle?.id || 'unknown',
        completion_time: userSession.completionTime,
      });
    } catch (error) {
      console.error('Error submitting score:', error);
    }
    
    setCurrentScreen('leaderboard');
  };

  const handlePlayAgain = () => {
    resetSession();
  };

  return (
    <div className="kiosk-container flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-emerald-600 mb-6">
          🎉 Congratulations! 🎉
        </h1>
        <p className="text-2xl md:text-3xl text-gray-700 mb-4">
          Well done, {userSession.name}!
        </p>
        <p className="text-xl md:text-2xl text-gray-600 mb-3">
          You completed the puzzle in
        </p>
        <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-6">
          {formatTime(userSession.completionTime)}
        </div>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-6">
        <button
          onClick={handleViewLeaderboard}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-2xl md:text-3xl font-bold py-4 px-8 md:py-6 md:px-12 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 active:scale-95"
        >
          View Leaderboard
        </button>
        <button
          onClick={handlePlayAgain}
          className="bg-blue-500 hover:bg-blue-600 text-white text-2xl md:text-3xl font-bold py-4 px-8 md:py-6 md:px-12 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 active:scale-95"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}