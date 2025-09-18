# Single Puzzle Implementation Plan

## Overview
Transform the current multi-puzzle system into a single puzzle system with difficulty-based piece cutting and comprehensive scoring.

## Requirements Analysis

### Current State
- Multiple puzzle options with different images
- Fixed 3x3 grid (9 pieces)
- Basic scoring without difficulty consideration
- Simple leaderboard system

### Target State
- Single puzzle image (`puzzle.png`)
- Three difficulty levels: Easy, Medium, Hard
- Dynamic piece count based on difficulty
- Time-based scoring with difficulty multiplier
- Enhanced database schema for comprehensive scoring

## Implementation Plan

### Phase 1: Core System Updates

#### 1.1 Update App Context and Types
**File**: `components/AppProvider.tsx`

**Changes**:
```typescript
export interface UserSession {
  name: string;
  city: string;
  selectedDifficulty: 'easy' | 'medium' | 'hard';
  startTime: number;
  endTime: number;
  completionTime: number;
  score: number; // New field
}

export interface PuzzleConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
  pieceSize: number;
  tabSize: number;
  tabDepth: number;
}

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<string, PuzzleConfig> = {
  easy: { difficulty: 'easy', gridSize: 2, pieceSize: 120, tabSize: 30, tabDepth: 12 },
  medium: { difficulty: 'medium', gridSize: 3, pieceSize: 80, tabSize: 20, tabDepth: 8 },
  hard: { difficulty: 'hard', gridSize: 4, pieceSize: 60, tabSize: 15, tabDepth: 6 }
};
```

#### 1.2 Update Puzzle Selection Screen
**File**: `components/screens/PuzzleSelectionScreen.tsx`

**New Design**:
- Single puzzle image display
- Three difficulty buttons (Easy, Medium, Hard)
- Visual preview of piece count for each difficulty
- Difficulty selection with visual feedback

#### 1.3 Enhanced Puzzle Cutting Algorithm
**File**: `lib/jigsaw-cutter.ts`

**Improvements**:
- Dynamic grid size based on difficulty
- Optimized tab/blank pattern for better interlocking
- Improved collision detection
- Better visual feedback for correct placement

### Phase 2: Scoring System Implementation

#### 2.1 Scoring Algorithm
**Formula**: `Score = max(0, 100 - (completionTime * difficultyMultiplier / 1000))`

**Difficulty Multipliers**:
- Easy: 1.0
- Medium: 2.0  
- Hard: 3.0

**Example Calculations**:
- Easy, 30 seconds: `100 - (30000 * 1.0 / 1000) = 70 points`
- Medium, 45 seconds: `100 - (45000 * 2.0 / 1000) = 10 points`
- Hard, 60 seconds: `100 - (60000 * 3.0 / 1000) = -80 points` → 0 points

#### 2.2 Score Display and Feedback
- Real-time score calculation
- Score breakdown display
- Achievement system for high scores
- Visual feedback for score milestones

### Phase 3: Database Schema Updates

#### 3.1 Supabase Table Schema
**Table**: `leaderboard`

**New Schema**:
```sql
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  difficulty VARCHAR(10) NOT NULL, -- 'easy', 'medium', 'hard'
  completion_time INTEGER NOT NULL, -- in milliseconds
  score INTEGER NOT NULL, -- calculated score
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leaderboard_difficulty ON leaderboard(difficulty);
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_city ON leaderboard(city);
```

#### 3.2 Updated Supabase Functions
**File**: `lib/supabase.ts`

**New Interface**:
```typescript
export interface ScoreSubmission {
  name: string;
  city: 'Jeddah' | 'Riyadh';
  difficulty: 'easy' | 'medium' | 'hard';
  completion_time: number;
  score: number;
}
```

### Phase 4: Enhanced User Experience

#### 4.1 Difficulty Selection Screen
- Large puzzle preview
- Clear difficulty indicators
- Piece count visualization
- Estimated completion time hints

#### 4.2 Puzzle Play Screen Updates
- Dynamic grid layout
- Difficulty-specific piece sizes
- Enhanced visual feedback
- Progress indicators

#### 4.3 Completion Screen Enhancements
- Score breakdown display
- Difficulty-specific achievements
- Leaderboard integration
- Social sharing features

### Phase 5: Performance Optimizations

#### 5.1 Pre-generated Puzzle Templates
- Create puzzle templates for each difficulty
- Store as JSON/SVG files
- Load templates instead of real-time generation
- Cache frequently used patterns

#### 5.2 Image Optimization
- Optimize puzzle.png for different sizes
- Implement responsive image loading
- Use WebP format for better compression
- Lazy loading for better performance

## Technical Implementation Details

### Enhanced Jigsaw Cutting Algorithm

```typescript
// lib/jigsaw-cutter.ts - Key improvements

export function generateJigsawPiece(
  row: number, 
  col: number, 
  config: PuzzleConfig
): string {
  const { pieceSize, tabSize, tabDepth } = config;
  
  // Improved interlocking pattern
  const topTabOut = (row * config.gridSize + col) % 2 === 0;
  const bottomTabOut = ((row + 1) * config.gridSize + col) % 2 === 0;
  const leftTabOut = (row * config.gridSize + col) % 2 === 0;
  const rightTabOut = (row * config.gridSize + (col + 1)) % 2 === 0;
  
  // Generate more realistic tab shapes
  // ... implementation details
}

// Enhanced collision detection
export function isPieceInCorrectPosition(
  piece: JigsawPiece,
  config: PuzzleConfig,
  tolerance: number = 15 // Reduced tolerance for better accuracy
): boolean {
  // Improved position calculation
  // ... implementation details
}
```

### Scoring System Implementation

```typescript
// lib/scoring.ts - New file

export function calculateScore(
  completionTime: number,
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  const difficultyMultipliers = {
    easy: 1.0,
    medium: 2.0,
    hard: 3.0
  };
  
  const multiplier = difficultyMultipliers[difficulty];
  const score = Math.max(0, 100 - (completionTime * multiplier / 1000));
  
  return Math.round(score);
}

export function getScoreBreakdown(
  completionTime: number,
  difficulty: 'easy' | 'medium' | 'hard'
) {
  const score = calculateScore(completionTime, difficulty);
  const timePenalty = (completionTime * difficultyMultipliers[difficulty]) / 1000;
  
  return {
    baseScore: 100,
    timePenalty: Math.round(timePenalty),
    finalScore: score,
    difficulty: difficulty,
    completionTime: completionTime
  };
}
```

## Database Migration Guide

### Step 1: Update Supabase Schema
```sql
-- Add new columns to existing table
ALTER TABLE leaderboard 
ADD COLUMN difficulty VARCHAR(10) NOT NULL DEFAULT 'medium',
ADD COLUMN score INTEGER NOT NULL DEFAULT 0;

-- Update existing records (optional)
UPDATE leaderboard 
SET difficulty = 'medium', 
    score = CASE 
      WHEN completion_time < 30000 THEN 90
      WHEN completion_time < 60000 THEN 70
      ELSE 50
    END;

-- Create new indexes
CREATE INDEX idx_leaderboard_difficulty ON leaderboard(difficulty);
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
```

### Step 2: Update RLS Policies
```sql
-- Allow public read access
CREATE POLICY "Allow public read access" ON leaderboard
FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON leaderboard
FOR INSERT WITH CHECK (true);
```

## File Structure Changes

```
project/
├── components/
│   ├── screens/
│   │   ├── PuzzleSelectionScreen.tsx (MAJOR UPDATE)
│   │   ├── PuzzlePlayScreen.tsx (UPDATE)
│   │   ├── CompletionScreen.tsx (UPDATE)
│   │   └── LeaderboardScreen.tsx (UPDATE)
│   └── AppProvider.tsx (UPDATE)
├── lib/
│   ├── jigsaw-cutter.ts (ENHANCED)
│   ├── supabase.ts (UPDATE)
│   └── scoring.ts (NEW)
├── public/
│   └── puzzle.png (NEW - main puzzle image)
└── SINGLE_PUZZLE_IMPLEMENTATION_PLAN.md (THIS FILE)
```

## Testing Strategy

### Unit Tests
- Scoring algorithm accuracy
- Puzzle piece generation
- Collision detection
- Database operations

### Integration Tests
- End-to-end puzzle completion flow
- Score submission and retrieval
- Leaderboard functionality
- Cross-browser compatibility

### Performance Tests
- Large puzzle rendering (4x4 grid)
- Memory usage optimization
- Touch interaction responsiveness
- Database query performance

## Deployment Checklist

### Pre-deployment
- [ ] Update Supabase schema
- [ ] Test all difficulty levels
- [ ] Verify scoring calculations
- [ ] Test database operations
- [ ] Optimize puzzle.png image
- [ ] Update environment variables

### Post-deployment
- [ ] Monitor database performance
- [ ] Check leaderboard functionality
- [ ] Verify score calculations
- [ ] Test touch interactions
- [ ] Monitor error logs

## Success Metrics

### Technical Metrics
- Puzzle completion rate: >95%
- Score calculation accuracy: 100%
- Database query performance: <100ms
- Touch interaction responsiveness: <50ms

### User Experience Metrics
- Average completion time by difficulty
- Score distribution analysis
- User engagement metrics
- Error rate monitoring

## Future Enhancements

### Phase 2 Features
- Multiple puzzle themes
- Custom difficulty settings
- Achievement system
- Social features
- Analytics dashboard

### Performance Improvements
- WebGL rendering for complex puzzles
- Progressive image loading
- Offline mode support
- Caching strategies

## Conclusion

This implementation plan provides a comprehensive roadmap for transforming the current multi-puzzle system into a sophisticated single-puzzle system with difficulty-based scoring. The phased approach ensures minimal disruption while delivering enhanced user experience and robust functionality.

The key success factors are:
1. **Accurate scoring system** that rewards both speed and difficulty
2. **Enhanced puzzle cutting algorithm** for better piece interlocking
3. **Robust database schema** for comprehensive score tracking
4. **Optimized user experience** with clear difficulty progression
5. **Performance optimization** for smooth kiosk operation

This plan ensures the system will be production-ready for kiosk deployment with excellent user engagement and reliable performance.
