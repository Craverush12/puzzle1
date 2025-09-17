'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Screen = 'welcome' | 'userInfo' | 'puzzleSelection' | 'puzzlePlay' | 'completion' | 'leaderboard';

export interface Puzzle {
  id: string;
  title: string;
  image: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserSession {
  name: string;
  city: string;
  selectedPuzzle: Puzzle | null;
  startTime: number;
  endTime: number;
  completionTime: number;
}

export interface LeaderboardEntry {
  id?: number;
  name: string;
  city: string;
  time: number;
  completed_at?: string;
}

interface AppContextType {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  userSession: UserSession;
  setUserSession: (session: Partial<UserSession>) => void;
  resetSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUserSession: UserSession = {
  name: '',
  city: '',
  selectedPuzzle: null,
  startTime: 0,
  endTime: 0,
  completionTime: 0,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userSession, setUserSessionState] = useState<UserSession>(initialUserSession);

  const setUserSession = (updates: Partial<UserSession>) => {
    setUserSessionState(prev => ({ ...prev, ...updates }));
  };

  const resetSession = () => {
    setUserSessionState(initialUserSession);
    setCurrentScreen('welcome');
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      userSession,
      setUserSession,
      resetSession,
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