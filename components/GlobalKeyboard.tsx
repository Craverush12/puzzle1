'use client';

import { useAppContext } from '@/components/AppProvider';
import VirtualKeyboard from '@/components/VirtualKeyboard';

export default function GlobalKeyboard() {
  const { 
    currentScreen,
    showKeyboard, 
    setShowKeyboard, 
    keyboardValue, 
    setKeyboardValue,
    activeInput,
    setActiveInput 
  } = useAppContext();

  const handleKeyPress = (value: string) => {
    setKeyboardValue(value);
  };

  const handleClose = () => {
    setShowKeyboard(false);
    setActiveInput(null);
  };

  // Don't show keyboard on userInfo screen as it uses custom Group 78.svg keyboard
  // Only show keyboard on other screens when showKeyboard is true
  if (!showKeyboard || currentScreen === 'userInfo') {
    return null;
  }

  return (
    <VirtualKeyboard
      onKeyPress={handleKeyPress}
      onClose={handleClose}
      currentValue={keyboardValue}
      showCloseButton={false}
    />
  );
}
