'use client';

import { useState, useEffect } from 'react';
import { useAppContext, LeaderboardEntry } from '@/components/AppProvider';
import { getLeaderboard } from '@/lib/supabase';
import { formatTime, getScoreGrade, calculateScore } from '@/lib/scoring';

export default function LeaderboardScreen() {
  const { setCurrentScreen, resetSession } = useAppContext();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleHome = () => {
    resetSession();
  };

  return (
    <div className="kiosk-container flex flex-col items-center justify-center">
      {/* Leaderboard Screen Image - Center of screen */}
      <div className="flex justify-center h-full">
        <img 
          src="/leaderboardscreen.png" 
          alt="Leaderboard Screen" 
          className="w-auto h-full object-contain"
        />
      </div>

      {/* Centered content - positioned within the border area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ padding: '120px 80px' }}>
        

        <div className="w-full max-w-[305px] mx-auto overflow-y-auto" style={{ maxHeight: '75vh' }}>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="text-lg text-white">Loading leaderboard...</div>
            </div>
          ) : (
            <div className="bg-[#004F53] rounded-md shadow-xl overflow-hidden">
              <div className="bg-[#005E60] text-white p-2">
                <div className="grid grid-cols-12 gap-2 text-sm font-normal">
                  <div className="col-span-1"></div>
                  <div className="col-span-4 ml-4">Name</div>
                  <div className="col-span-4">City</div>
                  <div className="col-span-3">Points</div>
                </div>
              </div>
              <div className="divide-y divide-[#005E60]">
                {leaderboard.length === 0 ? (
                  <div className="p-4 text-center text-base text-gray-300">
                    No scores yet. Be the first to play!
                  </div>
                ) : (
                  leaderboard.slice(0, 10).map((entry, index) => {
                    return (
                      <div key={entry.id || index} className="p-1.5 hover:bg-gray-600">
                        <div className="grid grid-cols-12 gap-2 text-xs items-center">
                          <div className="col-span-1 flex items-center justify-center">
                            <div className="flex items-center justify-center w-4 h-4">
                              {index === 0 ? (
                                <img src="/gold.svg" alt="Gold Medal" width={12} height={12} />
                              ) : index === 1 ? (
                                <img src="/silver.png" alt="Silver Medal" width={12} height={12} />
                              ) : index === 2 ? (
                                <img src="/bronze.png" alt="Bronze Medal" width={12} height={12} />
                              ) : (
                                <span className="text-xs font-normal text-white">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-span-4 font-normal text-white text-xs ml-4">
                            {entry.name}
                          </div>
                          <div className="col-span-4 font-normal text-white text-xs">
                            {entry.city || 'Unknown'}
                          </div>
                          <div className="col-span-3 font-normal text-white text-xs">
                            {calculateScore(entry.time, entry.difficulty)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleHome}
            className="transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <img 
              src="/Homebutton.png" 
              alt="Home" 
              className="w-auto h-10"
            />
          </button>
        </div>
      </div>
    </div>
  );
}