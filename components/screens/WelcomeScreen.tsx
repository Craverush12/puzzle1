'use client';

import { useAppContext } from '@/components/AppProvider';

export default function WelcomeScreen() {
  const { setCurrentScreen } = useAppContext();

  return (
    <div className="kiosk-container flex flex-col items-center justify-center">
      {/* Welcome Screen Image - Center of screen */}
      <div className="flex justify-center h-full">
        <img 
          src="/welcomescreen.png" 
          alt="Welcome Screen" 
          className="w-auto h-full object-contain"
        />
      </div>

      {/* Begin Button - Just below hero image */}
      <button
        onClick={() => setCurrentScreen('userInfo')}
        className="transform hover:scale-105 transition-all duration-200 active:scale-95 absolute bottom-40"
      >
        <img 
          src="/beginbutton.png" 
          alt="Begin" 
          className="w-auto h-[2rem]"
        />
      </button>
      
      <p className="text-white text-md md:text-xs absolute bottom-32">
        Touch to start
      </p>

      <div className="absolute bottom-6 text-white text-lg md:text-xl">
        {/* Arabic text placeholder - to be added based on requirements */}
      </div>
    </div>
  );
}