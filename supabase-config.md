# Supabase Configuration Guide

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Create leaderboard table
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL CHECK (city IN ('Jeddah', 'Riyadh')),
  puzzle_id VARCHAR(50) NOT NULL,
  completion_time INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON leaderboard
  FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON leaderboard
  FOR INSERT WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_leaderboard_completion_time ON leaderboard(completion_time);
CREATE INDEX idx_leaderboard_created_at ON leaderboard(created_at);
```

## Supabase Project Setup Steps

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy your Project URL and anon public key
5. Paste them into your `.env.local` file
6. Run the SQL schema in the SQL Editor
7. Test the connection
