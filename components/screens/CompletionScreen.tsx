'use client';

import { useAppContext } from '@/components/AppProvider';
import { submitScore } from '@/lib/supabase';

export default function CompletionScreen() {
  const { setCurrentScreen, userSession, resetSession } = useAppContext();


  const handleViewLeaderboard = async () => {
    // Submit score to leaderboard
    try {
      await submitScore({
        name: userSession.name,
        city: userSession.city as 'Jeddah' | 'Riyadh',
        difficulty: userSession.selectedDifficulty,
        completion_time: userSession.completionTime,
        score: userSession.score,
      });
    } catch (error) {
      console.error('Error submitting score:', error);
    }
    
    setCurrentScreen('leaderboard');
  };


  return (
    <div className="kiosk-container flex flex-col items-center justify-center">
      {/* Congratulations Screen Image - Center of screen */}
      <div className="flex justify-center h-full">
        <img 
          src="/congratulationscreen.png" 
          alt="Congratulations Screen" 
          className="w-auto h-full object-contain"
        />
      </div>

      {/* Centered content - positioned within the border area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Leaderboard Button - Centered at bottom */}
        <div className="flex justify-center mt-auto mb-20">
          <button
            onClick={handleViewLeaderboard}
            className="transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <img 
              src="/Leaderboard.png" 
              alt="Leaderboard" 
              className="w-auto h-12"
            />
          </button>
        </div>
      </div>
    </div>
  );
}