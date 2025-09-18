import { createClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '@/components/AppProvider';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client if environment variables are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Score submission interface
export interface ScoreSubmission {
  name: string;
  city: 'Jeddah' | 'Riyadh';
  difficulty: 'easy' | 'medium' | 'hard';
  completion_time: number; // in milliseconds
  score: number;
}

export async function submitScore(entry: ScoreSubmission): Promise<void> {
  console.log('Submitting score:', entry);
  
  // Try Supabase first if available
  if (supabase) {
    try {
      const { error } = await supabase
        .from('leaderboard')
        .insert([{
          name: entry.name,
          city: entry.city,
          difficulty: entry.difficulty,
          completion_time: entry.completion_time,
          score: entry.score
        }]);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Score submitted to Supabase successfully');
      return;
    } catch (error) {
      console.error('Failed to submit to Supabase, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  const existingScores = getStoredScores();
  const newEntry: LeaderboardEntry = {
    id: Date.now(),
    name: entry.name,
    city: entry.city,
    difficulty: entry.difficulty,
    time: entry.completion_time,
    score: entry.score,
    completed_at: new Date().toISOString(),
  };
  
  existingScores.push(newEntry);
  localStorage.setItem('snb-leaderboard', JSON.stringify(existingScores));
  console.log('Score stored in localStorage as fallback');
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  console.log('Fetching leaderboard');
  
  // Try Supabase first if available
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Transform Supabase data to match LeaderboardEntry interface
      const transformedData: LeaderboardEntry[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        city: row.city,
        difficulty: row.difficulty,
        time: row.completion_time,
        score: row.score,
        completed_at: row.created_at
      }));
      
      console.log('Leaderboard fetched from Supabase successfully');
      return transformedData;
    } catch (error) {
      console.error('Failed to fetch from Supabase, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  const scores = getStoredScores();
  return scores.sort((a, b) => b.score - a.score);
}

// Helper function for localStorage fallback
function getStoredScores(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem('snb-leaderboard');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Health check function to test Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase) {
    console.log('Supabase not configured - using localStorage fallback');
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
}