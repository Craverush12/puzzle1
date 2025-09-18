'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/components/AppProvider';

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
    <div className="kiosk-container user-info-screen flex flex-col h-full">
      {/* Title - positioned just below border */}
      <div className="flex justify-center pt-[5rem] pb-4">
        <h1 className="text-4xl md:text-5xl font-medium text-white">
          Enter your info
        </h1>
      </div>

      {/* Main content area - centered inputs */}
      <div className="flex-1 flex flex-col items-center justify-center p-6" style={{ paddingBottom: `calc(${showKeyboard ? '350px' : '24px'} * var(--kiosk-scale))` }}>
        {/* Completion indicator */}
        {isComplete && (
          <div className="mb-6 text-center">
            <div className="text-white text-lg font-semibold animate-pulse">
              ✓ Form Complete - Proceeding...
            </div>
          </div>
        )}
        
        <div className="w-full max-w-md space-y-8">
          {/* Name Field */}
          <div>
            <label className="block text-2xl md:text-3xl font-semibold text-white mb-4">
              Name
            </label>
            <input
              type="text"
              value={name}
              readOnly
              onClick={handleNameClick}
              className={`w-full info-input cursor-pointer ${
                activeInput === 'name' ? 'active' : ''
              } ${name.trim() ? 'completed' : ''}`}
              placeholder="Click here to enter your name"
            />
          </div>

          {/* City Field */}
          <div>
            <label className="block text-2xl md:text-3xl font-semibold text-white mb-4">
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

    </div>
  );
}