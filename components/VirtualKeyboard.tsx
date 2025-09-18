'use client';

import { useState } from 'react';

interface VirtualKeyboardProps {
  onKeyPress: (value: string) => void;
  onClose: () => void;
  currentValue: string;
  showCloseButton?: boolean;
}

export default function VirtualKeyboard({ onKeyPress, onClose, currentValue, showCloseButton = true }: VirtualKeyboardProps) {
  const [isShift, setIsShift] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);

  // Virtual keyboard is always visible for kiosk mode

  // Exact layout from the image
  const qwertyRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const handleKeyPress = (key: string) => {
    let newValue = currentValue;

    if (key === 'backspace') {
      newValue = currentValue.slice(0, -1);
    } else if (key === 'space') {
      newValue = currentValue + ' ';
    } else if (key === 'enter') {
      // Enter key doesn't close keyboard anymore, just adds a newline or continues
      newValue = currentValue + '\n';
    } else if (key === 'mic') {
      // Microphone key - could be used for voice input in future
      return; // Do nothing for now
    } else {
      const charToAdd = isShift ? key.toUpperCase() : key.toLowerCase();
      newValue = currentValue + charToAdd;
    }

    onKeyPress(newValue);
  };

  const renderKey = (key: string, className = '') => (
    <button
      key={key}
      onClick={() => handleKeyPress(key)}
      className={`keyboard-key ${className}`}
    >
      {isShift ? key.toUpperCase() : key.toLowerCase()}
    </button>
  );

  return (
    <div className="virtual-keyboard p-4">
      {/* Close button - only show on desktop */}
      {showCloseButton && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold"
          >
            ✕ Close
          </button>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* Top row with numbers - only show when toggled */}
        {showNumbers && (
          <div className="grid grid-cols-10 gap-1 mb-2">
            {numberRow.map(num => renderKey(num, 'h-10 text-lg'))}
          </div>
        )}

        {/* QWERTY Row 1: Q W E R T Y U I O P */}
        <div className="grid grid-cols-10 gap-1 mb-1">
          {qwertyRows[0].map(key => renderKey(key, 'h-12 text-xl'))}
        </div>

        {/* QWERTY Row 2: A S D F G H J K L - Center aligned */}
        <div className="grid grid-cols-9 gap-1 mb-1">
          {qwertyRows[1].map(key => renderKey(key, 'h-12 text-xl'))}
        </div>

        {/* QWERTY Row 3: Shift + Z X C V B N M + Backspace */}
        <div className="flex gap-1 mb-1 justify-center items-center">
          {/* Shift key - wider */}
          <button
            onClick={() => setIsShift(!isShift)}
            className={`keyboard-key shift-key ${isShift ? 'active' : ''}`}
            style={{ width: '90px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l8 8h-5v10h-6V10H4l8-8z"/>
            </svg>
          </button>
          
          {/* Z X C V B N M */}
          {qwertyRows[2].map(key => renderKey(key, 'h-12 text-xl'))}
          
          {/* Backspace key - wider */}
          <button
            onClick={() => handleKeyPress('backspace')}
            className="keyboard-key backspace-key"
            style={{ width: '90px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>
            </svg>
          </button>
        </div>

        {/* Bottom row: 123 + Mic + Space + . + Enter */}
        <div className="flex gap-1 justify-center items-center">
          {/* 123 key */}
          <button
            onClick={() => setShowNumbers(!showNumbers)}
            className="keyboard-key number-key"
            style={{ width: '72px' }}
          >
            123
          </button>
          
          {/* Microphone key */}
          <button
            onClick={() => handleKeyPress('mic')}
            className="keyboard-key mic-key"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </button>
          
          {/* Space key - very wide */}
          <button
            onClick={() => handleKeyPress('space')}
            className="keyboard-key space-key"
            style={{ width: '288px' }}
          >
            space
          </button>
          
          {/* Period key */}
          <button
            onClick={() => handleKeyPress('.')}
            className="keyboard-key period-key"
          >
            .
          </button>
          
          {/* Enter key - wider */}
          <button
            onClick={() => handleKeyPress('enter')}
            className="keyboard-key enter-key"
            style={{ width: '72px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7h-2z"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}