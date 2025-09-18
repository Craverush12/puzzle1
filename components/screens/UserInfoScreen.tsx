'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/components/AppProvider';
import VirtualKeyboard from '@/components/VirtualKeyboard';

const cities: ('Jeddah' | 'Riyadh')[] = [
  'Jeddah', 'Riyadh'
];

export default function UserInfoScreen() {
  const { setCurrentScreen, setUserSession } = useAppContext();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState<'name' | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      const isMobileScreen = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileScreen);
      
      // Always show keyboard on mobile
      if (isMobileScreen) {
        setShowKeyboard(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNameClick = () => {
    setActiveInput('name');
    setShowKeyboard(true);
  };

  const handleKeyboardInput = (value: string) => {
    if (activeInput === 'name') {
      setName(value);
    }
  };

  const handleContinue = () => {
    if (name.trim() && city) {
      setUserSession({ name: name.trim(), city });
      setCurrentScreen('puzzleSelection');
    }
  };

  return (
    <div className={`kiosk-container flex flex-col p-6 pb-0 ${showKeyboard ? 'keyboard-visible' : ''}`}>
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Enter your info
        </h1>

        <div className="w-full space-y-6 mb-6">
          <div>
            <label className="block text-2xl md:text-3xl font-semibold text-white mb-3">
              Name
            </label>
            <input
              type="text"
              value={name}
              readOnly
              onClick={handleNameClick}
              className={`w-full text-2xl md:text-3xl p-4 md:p-6 border-4 rounded-2xl focus:outline-none shadow-lg text-black cursor-pointer transition-all ${
                activeInput === 'name' 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-300 bg-white hover:border-emerald-300'
              }`}
              placeholder="Click here to enter your name"
            />
          </div>

          <div>
            <label className="block text-2xl md:text-3xl font-semibold text-white mb-3">
              City
            </label>
            <div className="grid grid-cols-2 gap-4">
              {cities.map(cityName => (
                <button
                  key={cityName}
                  onClick={() => setCity(cityName)}
                  className={`kiosk-button text-2xl md:text-3xl p-4 md:p-6 border-4 rounded-2xl transition-all shadow-lg font-semibold ${
                    city === cityName
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                      : 'border-gray-300 bg-white text-black hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {cityName}
                </button>
              ))}
            </div>
            {city && (
              <div className="mt-3 text-center">
                <span className="text-xl text-white">Selected: </span>
                <span className="text-xl font-bold text-emerald-400">{city}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentScreen('welcome')}
            className="individual-button hover:opacity-80 active:opacity-60 text-xl md:text-2xl font-bold py-3 px-6 md:py-4 md:px-8 rounded-2xl transition-all"
          >
            Back
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!name.trim() || !city}
            className="individual-button hover:opacity-80 active:opacity-60 disabled:opacity-50 disabled:cursor-not-allowed text-xl md:text-2xl font-bold py-3 px-8 md:py-4 md:px-12 rounded-2xl transition-all"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Virtual keyboard - always visible on mobile, toggle on desktop */}
      {showKeyboard && (
        <VirtualKeyboard
          onKeyPress={handleKeyboardInput}
          onClose={() => {
            setActiveInput(null);
            // Only close keyboard on desktop, keep it open on mobile
            if (!isMobile) {
              setShowKeyboard(false);
            }
          }}
          currentValue={name}
          showCloseButton={!isMobile}
        />
      )}
    </div>
  );
}