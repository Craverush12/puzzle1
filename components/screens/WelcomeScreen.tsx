'use client';

import { useAppContext } from '@/components/AppProvider';

export default function WelcomeScreen() {
  const { setCurrentScreen } = useAppContext();

  return (
    <div className="kiosk-container flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        {/* Simplified design - just the button and subtitle */}
      </div>

      <button
        onClick={() => setCurrentScreen('userInfo')}
        className="transform hover:scale-105 transition-all duration-200 active:scale-95"
      >
        <img 
          src="/begin.png" 
          alt="Begin" 
          className="w-auto h-20 md:h-24"
        />
      </button>
      
      <p className="text-white text-lg md:text-xl mt-4">
        Touch to start
      </p>

      <div className="absolute bottom-6 text-white text-lg md:text-xl">
        {/* Arabic text placeholder - to be added based on requirements */}
      </div>
    </div>
  );
}