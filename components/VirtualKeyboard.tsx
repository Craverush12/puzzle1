'use client';

import { useState } from 'react';

interface VirtualKeyboardProps {
  onKeyPress: (value: string) => void;
  onClose: () => void;
  currentValue: string;
}

export default function VirtualKeyboard({ onKeyPress, onClose, currentValue }: VirtualKeyboardProps) {
  const [isShift, setIsShift] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);

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
      onClose();
      return;
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
      className={`keyboard-button hover:opacity-80 active:opacity-60 font-semibold transition-all shadow-md text-white ${className}`}
    >
      {isShift ? key.toUpperCase() : key.toLowerCase()}
    </button>
  );

  return (
    <div className="bg-gray-800 bg-opacity-90 p-6 rounded-t-3xl">
      <div className="max-w-4xl mx-auto">
        {/* Top row with numbers */}
        {showNumbers && (
          <div className="grid grid-cols-10 gap-2 mb-4">
            {numberRow.map(num => renderKey(num, 'h-12 text-xl'))}
          </div>
        )}

        {/* QWERTY rows */}
        <div className="space-y-3">
          {qwertyRows.map((row, rowIndex) => (
            <div key={rowIndex} className={`grid gap-2 ${
              rowIndex === 0 ? 'grid-cols-10' : 
              rowIndex === 1 ? 'grid-cols-9' : 
              'grid-cols-7'
            }`}>
              {row.map(key => renderKey(key, 'h-14 text-2xl'))}
            </div>
          ))}
        </div>

        {/* Bottom row with special keys */}
        <div className="grid grid-cols-6 gap-2 mt-4">
          <button
            onClick={() => setShowNumbers(!showNumbers)}
            className="keyboard-button hover:opacity-80 active:opacity-60 font-semibold transition-all shadow-md h-14 text-lg text-white"
          >
            123
          </button>
          <button
            onClick={() => setIsShift(!isShift)}
            className={`keyboard-button hover:opacity-80 active:opacity-60 font-semibold transition-all shadow-md h-14 text-lg text-white ${isShift ? 'opacity-100' : 'opacity-70'}`}
          >
            ⇧
          </button>
          <button
            onClick={() => handleKeyPress('space')}
            className="col-span-2 keyboard-button hover:opacity-80 active:opacity-60 font-semibold transition-all shadow-md h-14 text-lg text-white"
          >
            Space
          </button>
          <button
            onClick={() => handleKeyPress('backspace')}
            className="keyboard-button hover:opacity-80 active:opacity-60 font-semibold transition-all shadow-md h-14 text-lg text-white"
          >
            ⌫
          </button>
          <button
            onClick={() => handleKeyPress('enter')}
            className="keyboard-button hover:opacity-80 active:opacity-60 font-semibold transition-all shadow-md h-14 text-lg text-white"
          >
            Enter
          </button>
        </div>

      </div>
    </div>
  );
}