'use client';

interface FunctionalKeyboardProps {
  onKeyPress: (value: string) => void;
  currentValue: string;
}

export default function FunctionalKeyboard({ onKeyPress, currentValue }: FunctionalKeyboardProps) {
  const handleKeyClick = (key: string) => {
    if (key === 'BACKSPACE') {
      onKeyPress(currentValue.slice(0, -1));
    } else if (key === 'SPACE') {
      onKeyPress(currentValue + ' ');
    } else if (key === 'ENTER') {
      // Handle enter key if needed
      console.log('Enter pressed');
    } else {
      onKeyPress(currentValue + key);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Original SVG as background */}
      <img 
        src="/Group 78.svg" 
        alt="Virtual Keyboard" 
        className="w-full h-full object-contain"
      />
      
      {/* Invisible clickable overlays positioned over each key */}
      <div className="absolute inset-0">
        {/* Row 1 - Q W E R T Y U I O P (coordinates from SVG) */}
        <button
          onClick={() => handleKeyClick('Q')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '3.5%',
            top: '3%',
            width: '8%',
            height: '16.4%',
            borderRadius: '19px'
          }}
        />
        <button
          onClick={() => handleKeyClick('W')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '13%',
            top: '3%',
            width: '8%',
            height: '16.4%',
            borderRadius: '19px'
          }}
        />
        <button
          onClick={() => handleKeyClick('E')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '22.4%',
            top: '3%',
            width: '8%',
            height: '16.4%',
            borderRadius: '19px'
          }}
        />
        <button
          onClick={() => handleKeyClick('R')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '31.8%',
            top: '3%',
            width: '8%',
            height: '16.4%',
            borderRadius: '19px'
          }}
        />
        <button
          onClick={() => handleKeyClick('T')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '41.2%',
            top: '3%',
            width: '8%',
            height: '16.4%',
            borderRadius: '19px'
          }}
        />
        <button
          onClick={() => handleKeyClick('Y')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '50.6%',
            top: '3%',
            width: '8%',
            height: '16.4%',
            borderRadius: '19px'
          }}
        />
        <button
          onClick={() => handleKeyClick('U')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '60%',
            top: '3%',
            width: '8%',
            height: '16.4%',
            borderRadius: '19px'
          }}
        />
        <button
          onClick={() => handleKeyClick('I')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '69.4%',
            top: '3%',
            width: '8%',
            height: '16.4%',
            borderRadius: '19px'
          }}
        />
        <button
          onClick={() => handleKeyClick('O')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '78.8%',
            top: '3%',
            width: '8%',
            height: '16.4%',
            borderRadius: '19px'
          }}
        />
        <button
          onClick={() => handleKeyClick('P')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '88.2%',
            top: '3%',
            width: '8%',
            height: '16.4%',
            borderRadius: '19px'
          }}
        />

        {/* Row 2 - A S D F G H J K L (starting from y=22.6%) */}
        <button
          onClick={() => handleKeyClick('A')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '8.2%',
            top: '22.6%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('S')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '17.7%',
            top: '22.6%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('D')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '27.1%',
            top: '22.6%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('F')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '36.5%',
            top: '22.6%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('G')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '45.9%',
            top: '22.6%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('H')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '55.3%',
            top: '22.6%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('J')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '64.7%',
            top: '22.6%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('K')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '74.1%',
            top: '22.6%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('L')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '83.5%',
            top: '22.6%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />

        {/* Row 3 - Z X C V B N M (starting from y=42.1%) */}
        <button
          onClick={() => handleKeyClick('Z')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '17.7%',
            top: '42.1%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('X')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '27.1%',
            top: '42.1%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('C')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '36.5%',
            top: '42.1%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('V')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '45.9%',
            top: '42.1%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('B')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '55.3%',
            top: '42.1%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('N')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '64.7%',
            top: '42.1%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        <button
          onClick={() => handleKeyClick('M')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '74.1%',
            top: '42.1%',
            width: '8%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />

        {/* Row 4 - Special keys (starting from y=61.5%) */}
        {/* Backspace */}
        <button
          onClick={() => handleKeyClick('BACKSPACE')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '3.5%',
            top: '61.5%',
            width: '12.7%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
        
        {/* Space */}
        <button
          onClick={() => handleKeyClick('SPACE')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '17.7%',
            top: '61.5%',
            width: '12.7%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />

        {/* Enter */}
        <button
          onClick={() => handleKeyClick('ENTER')}
          className="absolute bg-transparent hover:bg-white/10 transition-colors cursor-pointer"
          style={{
            left: '27.1%',
            top: '61.5%',
            width: '45.7%',
            height: '16.4%',
            borderRadius: '15px'
          }}
        />
      </div>
    </div>
  );
}
