'use client';

import { useState } from 'react';
import WelcomeScreen from '@/components/screens/WelcomeScreen';
import UserInfoScreen from '@/components/screens/UserInfoScreen';
import PuzzleSelectionScreen from '@/components/screens/PuzzleSelectionScreen';
import PuzzlePlayScreen from '@/components/screens/PuzzlePlayScreen';
import CompletionScreen from '@/components/screens/CompletionScreen';
import LeaderboardScreen from '@/components/screens/LeaderboardScreen';
import { useAppContext } from '@/components/AppProvider';
// import SupabaseTest from '@/components/SupabaseTest'; // Commented out for production
import { useKiosk } from '@/hooks/use-kiosk';
import { useKioskScaling } from '@/hooks/use-kiosk-scaling';
import { useKioskPerformance } from '@/hooks/use-kiosk-performance';
import { KioskErrorBoundary } from '@/components/KioskErrorBoundary';

export default function Home() {
  const { currentScreen } = useAppContext();
  
  // Initialize kiosk mode with auto-fullscreen and security features
  const { isKioskMode, isFullscreen } = useKiosk({
    autoFullscreen: true,
    preventContextMenu: true,
    preventKeyboard: true,
    preventRightClick: true,
    autoRestart: true,
    restartInterval: 120, // 2 hours
  });

  // Initialize responsive scaling for different kiosk screen sizes
  const { getResponsiveClasses } = useKioskScaling();

  // Initialize performance monitoring for kiosk optimization
  const { metrics: performanceMetrics } = useKioskPerformance();

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
    <KioskErrorBoundary>
      <main className={getResponsiveClasses("h-full w-full overflow-hidden no-select")}>
        {renderScreen()}
        {/* <SupabaseTest /> */} {/* Commented out for production */}
      </main>
    </KioskErrorBoundary>
  );
}