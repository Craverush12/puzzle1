'use client';

import { useAppContext } from '@/components/AppProvider';
import { submitScore } from '@/lib/supabase';
import { formatTime } from '@/lib/scoring';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative" style={{ backgroundColor: 'var(--background-primary)' }}>
      {/* Background SVG */}
      <div className="absolute inset-0 opacity-30">
        <img src="/Group.svg" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Decorative Border - Triple Line */}
      <div className="absolute inset-0 border-4 border-teal-600">
        <div className="absolute inset-4 border-4 border-teal-700">
          <div className="absolute inset-4 border-4 border-teal-500"></div>
        </div>
      </div>

      {/* Top Section - Simple Fireworks */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
        <div className="text-white text-4xl">*</div>
        <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full opacity-60"></div>
        <div className="absolute top-3 right-2 w-1 h-1 bg-white rounded-full opacity-60"></div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Congratulation
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8">
          Together we celebrate the pride of Saudi Arabia
        </p>
        
        {/* Score Display - Exact match to design */}
        <div className="bg-teal-800 rounded-2xl p-6 mb-8 max-w-sm mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {userSession.score} Points
            </div>
            <div className="text-lg text-teal-200">
              {formatTime(userSession.completionTime)} • {userSession.selectedDifficulty.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Leaderboard Button - Exact match to design */}
        <button
          onClick={handleViewLeaderboard}
          className="transform hover:scale-105 transition-all duration-200 active:scale-95"
        >
          <img 
            src="/Leaderboard.png" 
            alt="Leaderboard" 
            className="w-auto h-16 md:h-20"
          />
        </button>
      </div>
    </div>
  );
}