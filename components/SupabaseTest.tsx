'use client';

import { useState } from 'react';
import { testSupabaseConnection, submitScore, getLeaderboard } from '@/lib/supabase';

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? '✅ Connected to Supabase' : '❌ Using localStorage fallback');
    } catch (error) {
      setConnectionStatus('❌ Connection failed');
      console.error('Connection test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testSubmission = async () => {
    setIsLoading(true);
    try {
      const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
      const cities: ('Jeddah' | 'Riyadh')[] = ['Jeddah', 'Riyadh'];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      
      const testScore = {
        name: `Test User ${Date.now()}`,
        city: randomCity,
        difficulty: randomDifficulty,
        completion_time: Math.floor(Math.random() * 60000) + 10000, // 10-70 seconds
        score: Math.floor(Math.random() * 1000) + 500, // Random score between 500-1500
      };
      
      await submitScore(testScore);
      setLastResult(`✅ Submitted: ${testScore.name} - ${Math.floor(testScore.completion_time/1000)}s`);
      console.log('Test score submitted:', testScore);
    } catch (error) {
      setLastResult(`❌ Submission failed: ${error}`);
      console.error('Submission test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testLeaderboard = async () => {
    setIsLoading(true);
    try {
      const leaderboard = await getLeaderboard();
      setLeaderboardData(leaderboard);
      setLastResult(`✅ Retrieved ${leaderboard.length} entries`);
      console.log('Leaderboard data:', leaderboard);
    } catch (error) {
      setLastResult(`❌ Fetch failed: ${error}`);
      console.error('Leaderboard test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2 text-black">Supabase Test</h3>
      <p className="text-sm mb-3 text-black">{connectionStatus}</p>
      
      {lastResult && (
        <p className="text-xs mb-3 p-2 bg-gray-100 rounded text-black">{lastResult}</p>
      )}
      
      <div className="space-y-2">
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="individual-button text-sm px-3 py-1 rounded disabled:opacity-50 w-full"
        >
          Test Connection
        </button>
        
        <button
          onClick={testSubmission}
          disabled={isLoading}
          className="individual-button text-sm px-3 py-1 rounded disabled:opacity-50 w-full"
        >
          Test Submit
        </button>
        
        <button
          onClick={testLeaderboard}
          disabled={isLoading}
          className="individual-button text-sm px-3 py-1 rounded disabled:opacity-50 w-full"
        >
          Test Fetch
        </button>
      </div>
      
      {leaderboardData.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto">
          <h4 className="font-semibold text-xs mb-1 text-black">Leaderboard Data:</h4>
          {leaderboardData.slice(0, 5).map((entry, index) => (
            <div key={entry.id} className="text-xs p-1 bg-gray-50 rounded mb-1 text-black">
              #{index + 1} {entry.name} - {Math.floor(entry.time/1000)}s ({entry.city})
            </div>
          ))}
          {leaderboardData.length > 5 && (
            <div className="text-xs text-gray-600">... and {leaderboardData.length - 5} more</div>
          )}
        </div>
      )}
    </div>
  );
}
