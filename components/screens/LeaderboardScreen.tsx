'use client';

import { useState, useEffect } from 'react';
import { useAppContext, LeaderboardEntry } from '@/components/AppProvider';
import { getLeaderboard } from '@/lib/supabase';
import { formatTime, getScoreGrade } from '@/lib/scoring';
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
    <div className="kiosk-container flex flex-col p-6" style={{ backgroundColor: '#004F53' }}>
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Leaderboard
        </h1>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-xl text-white">Loading leaderboard...</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-4">
              <div className="grid grid-cols-3 gap-2 text-lg md:text-xl font-bold">
                <div>Name</div>
                <div>City</div>
                <div>Time</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {leaderboard.length === 0 ? (
                <div className="p-6 text-center text-lg text-gray-500">
                  No scores yet. Be the first to play!
                </div>
              ) : (
                leaderboard.slice(0, 10).map((entry, index) => {
                  return (
                    <div key={entry.id || index} className="p-4 hover:bg-gray-50">
                      <div className="grid grid-cols-3 gap-2 text-base md:text-lg items-center">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8">
                            {index === 0 ? (
                              <Image src="/gold.svg" alt="Gold Medal" width={32} height={32} />
                            ) : index === 1 ? (
                              <Image src="/silver.png" alt="Silver Medal" width={32} height={32} />
                            ) : index === 2 ? (
                              <Image src="/bronze.png" alt="Bronze Medal" width={32} height={32} />
                            ) : (
                              <span className="text-xl md:text-2xl font-bold text-emerald-600">
                                {index + 1}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-gray-800">
                            {entry.name}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-800">
                          {entry.city || 'Unknown'}
                        </div>
                        <div className="font-bold text-blue-600">
                          {formatTime(entry.time)}
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

      <div className="flex justify-center mt-6">
        <button
          onClick={handleHome}
          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xl font-bold py-3 px-8 rounded-2xl transition-colors border border-teal-700 shadow-lg flex items-center space-x-2"
        >
          <Image src="/Home.png" alt="Home" width={24} height={24} />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
}