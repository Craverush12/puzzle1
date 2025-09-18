'use client';

import { useState, useEffect } from 'react';
import { useAppContext, LeaderboardEntry } from '@/components/AppProvider';
import { getLeaderboard } from '@/lib/supabase';
import { formatTime, getScoreGrade, calculateScore } from '@/lib/scoring';
import Image from 'next/image';

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
    <div className="kiosk-container flex flex-col justify-center p-6" style={{ backgroundColor: '#003437' }}>
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-medium text-white mb-3">
          Leaderboard
        </h1>
      </div>

      <div className="max-w-lg mx-auto w-full overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-xl text-white">Loading leaderboard...</div>
          </div>
        ) : (
          <div className="bg-[#004F53] rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#004F53] text-white p-3">
              <div className="grid grid-cols-12 gap-1 text-base md:text-lg font-normal">
                <div className="col-span-5">Name</div>
                <div className="col-span-4">City</div>
                <div className="col-span-3 text-right">Points</div>
              </div>
            </div>
            <div className="divide-y divide-gray-400">
              {leaderboard.length === 0 ? (
                <div className="p-6 text-center text-lg text-gray-300">
                  No scores yet. Be the first to play!
                </div>
              ) : (
                leaderboard.slice(0, 10).map((entry, index) => {
                  return (
                    <div key={entry.id || index} className="p-2 hover:bg-gray-600">
                      <div className="grid grid-cols-12 gap-1 text-sm md:text-base items-center">
                        <div className="col-span-5 flex items-center space-x-2">
                          <div className="flex items-center justify-center w-8 h-8">
                            {index === 0 ? (
                              <img src="/gold.svg" alt="Gold Medal" width={24} height={24} />
                            ) : index === 1 ? (
                              <img src="/silver.png" alt="Silver Medal" width={24} height={24} />
                            ) : index === 2 ? (
                              <img src="/bronze.png" alt="Bronze Medal" width={24} height={24} />
                            ) : (
                              <span className="text-lg md:text-xl font-normal text-white">
                                {index + 1}
                              </span>
                            )}
                          </div>
                          <div className="font-normal text-white">
                            {entry.name}
                          </div>
                        </div>
                        <div className="col-span-4 font-normal text-white">
                          {entry.city || 'Unknown'}
                        </div>
                        <div className="col-span-3 font-normal text-white text-right">
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

      <div className="flex justify-center mt-4">
        <button
          onClick={handleHome}
          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xl font-bold py-3 px-8 rounded-2xl transition-colors border border-teal-700 shadow-lg flex items-center space-x-2"
        >
          <Image src="/Homebutton.png" alt="Home" width={24} height={24} />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
}