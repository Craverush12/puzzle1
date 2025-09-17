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
        className="individual-button text-3xl md:text-4xl font-bold py-6 px-12 md:py-8 md:px-16 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 active:scale-95"
      >
        Begin
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