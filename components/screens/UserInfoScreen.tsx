'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/components/AppProvider';
import FunctionalKeyboard from '@/components/FunctionalKeyboard';

const cities: ('Jeddah' | 'Riyadh')[] = [
  'Jeddah', 'Riyadh'
];

export default function UserInfoScreen() {
  const { 
    setCurrentScreen, 
    setUserSession,
    showKeyboard,
    setShowKeyboard,
    keyboardValue,
    setKeyboardValue,
    activeInput,
    setActiveInput
  } = useAppContext();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Show keyboard when entering this screen, hide when leaving
  useEffect(() => {
    setShowKeyboard(true);
    setKeyboardValue(name); // Initialize with current name
    
    // Cleanup: Hide keyboard when leaving this screen
    return () => {
      setShowKeyboard(false);
      setActiveInput(null);
    };
  }, []);

  // Update name when keyboard value changes and name input is active
  useEffect(() => {
    if (activeInput === 'name') {
      setName(keyboardValue);
    }
  }, [keyboardValue, activeInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCityDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.city-dropdown-container')) {
          setShowCityDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCityDropdown]);

  // Auto-navigate to next page when both name and city are filled
  useEffect(() => {
    if (name.trim() && city) {
      setIsComplete(true);
      // Add a small delay to show the selection before navigating
      const timer = setTimeout(() => {
        handleContinue();
      }, 1500); // 1.5 second delay to show completion

      return () => clearTimeout(timer);
    } else {
      setIsComplete(false);
    }
  }, [name, city]);

  const handleNameClick = () => {
    handleNameFocus();
    setShowKeyboard(true);
  };

  const handleCityClick = () => {
    setShowCityDropdown(!showCityDropdown);
    setActiveInput(null);
  };

  const handleCitySelect = (selectedCity: 'Jeddah' | 'Riyadh') => {
    setCity(selectedCity);
    setShowCityDropdown(false);
  };

  const handleNameFocus = () => {
    setActiveInput('name');
    setKeyboardValue(name); // Set current name value to keyboard
  };

  const handleContinue = () => {
    if (name.trim() && city) {
      setUserSession({ name: name.trim(), city });
      setCurrentScreen('puzzleSelection');
    }
  };

  return (
    <div className="kiosk-container user-info-screen flex flex-col items-center justify-center relative">
      {/* Background Image Container - Centered and constrained */}
      <div className="flex justify-center h-full w-full relative">
        <div className="relative h-full" style={{ aspectRatio: '9/16' }}>
          <img 
            src="/infoscreen.png" 
            alt="Info Screen Background" 
            className="w-full h-full object-contain"
          />
          
          {/* Content Container - Positioned absolutely within the background image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ padding: '120px 80px' }}>
            {/* Title - positioned within background image boundaries */}
          

            {/* Main content area - centered inputs within background boundaries */}
            <div className="flex-1 flex flex-col w-full items-center justify-center mb-8">
              {/* Completion indicator */}
              
              <div className="w-full max-w-2xl space-y-4" style={{ maxWidth: '90%' }}>
                {/* Name Field */}
                <div>
                  <label className="block text-lg font-medium text-white mb-3">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    readOnly
                    onClick={handleNameClick}
                    className={`w-full info-input cursor-pointer text-sm ${
                      activeInput === 'name' ? 'active' : ''
                    } ${name.trim() ? 'completed' : ''}`}
                    placeholder="Click here to enter your name"
                  />
                </div>

                {/* City Field */}
                <div>
                  <label className="block text-lg md:text-xl font-medium text-white mb-3">
                    City
                  </label>
                  <div className="relative city-dropdown-container">
                    <button
                      onClick={handleCityClick}
                      className={`w-full info-dropdown cursor-pointer text-left flex items-center justify-between ${
                        city ? 'selected completed' : ''
                      }`}
                    >
                      <span>{city || 'Choose your city'}</span>
                      <svg 
                        className={`w-6 h-6 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown */}
                    {showCityDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 dropdown-options z-10">
                        {cities.map(cityName => (
                          <button
                            key={cityName}
                            onClick={() => handleCitySelect(cityName)}
                            className="w-full dropdown-option text-left"
                          >
                            {cityName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Container - Takes up 1/4th of the background image frame */}
            {showKeyboard && (
              <div className="absolute bottom-0 left-0 right-0 h-[25%] flex justify-center items-center w-full">
                <div className="w-full max-w-none" style={{ width: '96%' }}>
                  <FunctionalKeyboard 
                    onKeyPress={setKeyboardValue}
                    currentValue={keyboardValue}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}