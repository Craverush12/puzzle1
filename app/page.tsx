'use client';

import { useState } from 'react';
import WelcomeScreen from '@/components/screens/WelcomeScreen';
import UserInfoScreen from '@/components/screens/UserInfoScreen';
import PuzzleSelectionScreen from '@/components/screens/PuzzleSelectionScreen';
import PuzzlePlayScreen from '@/components/screens/PuzzlePlayScreen';
import CompletionScreen from '@/components/screens/CompletionScreen';
import LeaderboardScreen from '@/components/screens/LeaderboardScreen';
import { useAppContext } from '@/components/AppProvider';
import SupabaseTest from '@/components/SupabaseTest';

export default function Home() {
  const { currentScreen } = useAppContext();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'userInfo':
        return <UserInfoScreen />;
      case 'puzzleSelection':
        return <PuzzleSelectionScreen />;
      case 'puzzlePlay':
        return <PuzzlePlayScreen />;
      case 'completion':
        return <CompletionScreen />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <main className="h-full w-full overflow-hidden no-select">
      {renderScreen()}
      <SupabaseTest />
    </main>
  );
}