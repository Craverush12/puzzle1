'use client';

import { useEffect, useState } from 'react';

interface BorderFrameProps {
  children: React.ReactNode;
}

export default function BorderFrame({ children }: BorderFrameProps) {
  const [shouldShowBorder, setShouldShowBorder] = useState(false);

  useEffect(() => {
    const checkScreenRatio = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      // Ratio-based detection for kiosk vs desktop screens
      // Desktop screens typically have aspect ratios around 16:9 (1.78) or 16:10 (1.6)
      // Kiosk screens are typically more square or vertical
      
      // Define ratio thresholds
      const DESKTOP_RATIO_THRESHOLD = 1.5; // 3:2 ratio and wider
      const KIOSK_RATIO_THRESHOLD = 1.3;   // 4:3 ratio and narrower
      
      // Determine screen type based primarily on aspect ratio
      const isDesktopRatio = aspectRatio >= DESKTOP_RATIO_THRESHOLD;
      const isKioskRatio = aspectRatio <= KIOSK_RATIO_THRESHOLD;
      const isPortrait = height > width;
      
      // Show border for kiosk-style screens (square, vertical, or portrait)
      // This includes tablets, vertical displays, and portrait orientations
      const shouldShow = isKioskRatio || isPortrait || !isDesktopRatio;
      
      setShouldShowBorder(shouldShow);
    };

    checkScreenRatio();
    window.addEventListener('resize', checkScreenRatio);
    window.addEventListener('orientationchange', checkScreenRatio);

    return () => {
      window.removeEventListener('resize', checkScreenRatio);
      window.removeEventListener('orientationchange', checkScreenRatio);
    };
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
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url(/border.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 1, // Increased from 0.9 for debugging
          // Debug: Add a temporary background color to see if element is there
          backgroundColor: 'rgba(255, 0, 0, 0.1)', // Very light red tint
          border: '2px solid red' // Temporary red border to see the element
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
