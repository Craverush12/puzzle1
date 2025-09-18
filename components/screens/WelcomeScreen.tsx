'use client';

import { useAppContext } from '@/components/AppProvider';

export default function WelcomeScreen() {
  const { setCurrentScreen } = useAppContext();

  return (
    <div className="kiosk-container flex flex-col items-center justify-center p-6">
      {/* Hero Image - Center of screen */}
      <div className="flex justify-center mb-8">
        <img 
          src="/illustration.png" 
          alt="Saudi Arabia Development Illustration" 
          className="w-auto h-[40rem] object-contain"
        />
      </div>

      {/* Begin Button - Just below hero image */}
      <button
        onClick={() => setCurrentScreen('userInfo')}
        className="transform hover:scale-105 transition-all duration-200 active:scale-95 mb-4"
      >
        <img 
          src="/beginbutton.png" 
          alt="Begin" 
          className="w-auto h-[4rem]"
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