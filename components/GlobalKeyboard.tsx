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

  // Only show keyboard on userInfo screen AND when showKeyboard is true
  if (!showKeyboard || currentScreen !== 'userInfo') {
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
