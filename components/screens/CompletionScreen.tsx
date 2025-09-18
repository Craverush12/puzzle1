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
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--background-primary)' }}>
      {/* Background SVG */}
      <div className="absolute inset-0 opacity-30">
        {/* <img src="/Group.svg" alt="" className="w-full h-full object-cover" /> */}
      </div>


      {/* Content Container - Top to bottom flow with proper padding */}
      <div className="relative z-10 pt-16 pb-16 px-8 min-h-screen flex flex-col">
        
        {/* Fireworks Image - Top center */}
        <div className="flex justify-center mb-16">
          <img 
            src="/congrats.svg" 
            alt="Fireworks celebration" 
            className="w-80 h-80 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px] object-contain"
            loading="eager"
            onError={(e) => {
              console.error('Failed to load congrats.svg:', e);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => console.log('congrats.svg loaded successfully')}
          />
        </div>

        {/* Congratulation Text - Centered */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-white">
            Congratulation
          </h1>
        </div>
        
        {/* Subtitle Text - Centered */}
        <div className="text-center mb-12">
          <p className="text-xl md:text-2xl lg:text-3xl text-white">
            Together we celebrate the pride of Saudi Arabia
          </p>
        </div>
        

        {/* Leaderboard Button - Centered at bottom */}
        <div className="flex justify-center">
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
    </div>
  );
}