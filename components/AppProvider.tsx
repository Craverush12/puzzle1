'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Screen = 'welcome' | 'userInfo' | 'puzzleSelection' | 'puzzlePlay' | 'completion' | 'leaderboard';

export interface Puzzle {
  id: string;
  title: string;
  image: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PuzzleConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
  pieceSize: number;
  tabSize: number;
  tabDepth: number;
}

export interface UserSession {
  name: string;
  city: string;
  selectedDifficulty: 'easy' | 'medium' | 'hard';
  startTime: number;
  endTime: number;
  completionTime: number;
  score: number;
}

export interface LeaderboardEntry {
  id?: number;
  name: string;
  city: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time: number;
  score: number;
  completed_at?: string;
}

interface AppContextType {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  userSession: UserSession;
  setUserSession: (session: Partial<UserSession>) => void;
  resetSession: () => void;
  // Keyboard state
  showKeyboard: boolean;
  setShowKeyboard: (show: boolean) => void;
  keyboardValue: string;
  setKeyboardValue: (value: string) => void;
  activeInput: string | null;
  setActiveInput: (input: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUserSession: UserSession = {
  name: '',
  city: '',
  selectedDifficulty: 'medium',
  startTime: 0,
  endTime: 0,
  completionTime: 0,
  score: 0,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userSession, setUserSessionState] = useState<UserSession>(initialUserSession);
  
  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardValue, setKeyboardValue] = useState('');
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const setUserSession = (updates: Partial<UserSession>) => {
    setUserSessionState(prev => ({ ...prev, ...updates }));
  };

  const resetSession = () => {
    setUserSessionState(initialUserSession);
    setCurrentScreen('welcome');
    // Reset keyboard state
    setShowKeyboard(false);
    setKeyboardValue('');
    setActiveInput(null);
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      userSession,
      setUserSession,
      resetSession,
      // Keyboard state
      showKeyboard,
      setShowKeyboard,
      keyboardValue,
      setKeyboardValue,
      activeInput,
      setActiveInput,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<string, PuzzleConfig> = {
  easy: { 
    difficulty: 'easy', 
    gridSize: 3, 
    pieceSize: 180, 
    tabSize: 0, 
    tabDepth: 0 
  },
  medium: { 
    difficulty: 'medium', 
    gridSize: 6, 
    pieceSize: 90, 
    tabSize: 0, 
    tabDepth: 0 
  },
  hard: { 
    difficulty: 'hard', 
    gridSize: 9, 
    pieceSize: 60, 
    tabSize: 0, 
    tabDepth: 0 
  }
};

// Single puzzle configuration
export const MAIN_PUZZLE: Puzzle = {
  id: 'main-puzzle',
  title: 'Select the Puzzle',
  image: '/puzzle.png',
  difficulty: 'medium'
};