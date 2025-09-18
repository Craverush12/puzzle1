'use client';

import { useState, useEffect } from 'react';
import { useAppContext, LeaderboardEntry } from '@/components/AppProvider';
import { getLeaderboard } from '@/lib/supabase';
import { formatTime, getScoreGrade } from '@/lib/scoring';

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          Top 10 Highest Scores
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
              <div className="grid grid-cols-5 gap-2 text-lg md:text-xl font-bold">
                <div>Rank</div>
                <div>Name</div>
                <div>Score</div>
                <div>Difficulty</div>
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
                  const scoreGrade = getScoreGrade(entry.score);
                  return (
                    <div key={entry.id || index} className="p-4 hover:bg-gray-50">
                      <div className="grid grid-cols-5 gap-2 text-base md:text-lg items-center">
                        <div className="flex items-center justify-center">
                          {index < 3 ? (
                            <span className="text-3xl md:text-4xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className="text-xl md:text-2xl font-bold text-emerald-600">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-gray-800">
                          {entry.name}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg" style={{ color: scoreGrade.color }}>
                            {entry.score}
                          </span>
                          <span className="text-sm font-bold" style={{ color: scoreGrade.color }}>
                            {scoreGrade.grade}
                          </span>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(entry.difficulty)}`}>
                            {entry.difficulty}
                          </span>
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
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold py-3 px-8 rounded-2xl transition-colors"
        >
          Home
        </button>
      </div>
    </div>
  );
}