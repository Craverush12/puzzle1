export interface ScoreBreakdown {
  baseScore: number;
  timePenalty: number;
  finalScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completionTime: number;
  difficultyMultiplier: number;
}

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
): ScoreBreakdown {
  const difficultyMultipliers = {
    easy: 1.0,
    medium: 2.0,
    hard: 3.0
  };
  
  const multiplier = difficultyMultipliers[difficulty];
  const timePenalty = (completionTime * multiplier) / 1000;
  const finalScore = calculateScore(completionTime, difficulty);
  
  return {
    baseScore: 100,
    timePenalty: Math.round(timePenalty),
    finalScore: finalScore,
    difficulty: difficulty,
    completionTime: completionTime,
    difficultyMultiplier: multiplier
  };
}

export function getDifficultyMultiplier(difficulty: 'easy' | 'medium' | 'hard'): number {
  const multipliers = {
    easy: 1.0,
    medium: 2.0,
    hard: 3.0
  };
  
  return multipliers[difficulty];
}

export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${remainingSeconds}s`;
}

export function getScoreGrade(score: number): { grade: string; color: string; message: string } {
  if (score >= 90) {
    return { 
      grade: 'S', 
      color: 'text-purple-600', 
      message: 'Perfect! Outstanding performance!' 
    };
  } else if (score >= 80) {
    return { 
      grade: 'A', 
      color: 'text-green-600', 
      message: 'Excellent! Great job!' 
    };
  } else if (score >= 70) {
    return { 
      grade: 'B', 
      color: 'text-blue-600', 
      message: 'Good work! Well done!' 
    };
  } else if (score >= 60) {
    return { 
      grade: 'C', 
      color: 'text-yellow-600', 
      message: 'Not bad! Keep practicing!' 
    };
  } else if (score >= 50) {
    return { 
      grade: 'D', 
      color: 'text-orange-600', 
      message: 'You can do better! Try again!' 
    };
  } else {
    return { 
      grade: 'F', 
      color: 'text-red-600', 
      message: 'Keep trying! Practice makes perfect!' 
    };
  }
}
