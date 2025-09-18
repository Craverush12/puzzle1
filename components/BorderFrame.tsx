'use client';

import { useEffect, useState } from 'react';

interface BorderFrameProps {
  children: React.ReactNode;
}

export default function BorderFrame({ children }: BorderFrameProps) {
  const [shouldShowBorder, setShouldShowBorder] = useState(false);

  useEffect(() => {
    // Always show border for now to test
    setShouldShowBorder(true);
  }, []);

  if (!shouldShowBorder) {
    return <>{children}</>;
  }

  return (
    <div className="border-frame-container">
      {/* Border SVG as background - positioned to match reference image */}
      <div 
        className="border-frame-bg"
        style={{
          position: 'fixed',
          top: 8,
          // bottom: 8,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url("/border.png")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 11,
          pointerEvents: 'none',
          opacity: 1,
          // Debug: Add a fallback background color to see if element is there
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}
      />
      
      {/* Content area with proper spacing for border */}
      <div 
        className="border-frame-content"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    </div>
  );
}
