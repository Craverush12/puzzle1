'use client';

import { useState, useEffect } from 'react';
import { useAppContext, LeaderboardEntry } from '@/components/AppProvider';
import { getLeaderboard } from '@/lib/supabase';

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

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleHome = () => {
    resetSession();
  };

  return (
    <div className="kiosk-container flex flex-col p-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          🏆 Leaderboard 🏆
        </h1>
        <p className="text-lg md:text-xl text-gray-600">
          Top 10 Fastest Players
        </p>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-xl text-gray-500">Loading leaderboard...</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-4">
              <div className="grid grid-cols-4 gap-2 text-lg md:text-xl font-bold">
                <div>Rank</div>
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
                leaderboard.slice(0, 10).map((entry, index) => (
                  <div key={entry.id || index} className="p-4 hover:bg-gray-50">
                    <div className="grid grid-cols-4 gap-2 text-base md:text-lg items-center">
                      <div className="flex items-center">
                        <span className="text-xl md:text-2xl font-bold text-emerald-600 mr-2">
                          #{index + 1}
                        </span>
                        {index < 3 && (
                          <span className="text-lg">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-gray-800">
                        {entry.name}
                      </div>
                      <div className="text-gray-600">
                        {entry.city}
                      </div>
                      <div className="font-bold text-blue-600">
                        {formatTime(entry.time)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleHome}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold py-3 px-8 rounded-2xl transition-colors"
        >
          Home
        </button>
      </div>
    </div>
  );
}