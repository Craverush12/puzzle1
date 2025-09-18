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
      
      // Determine if this is a kiosk screen (not desktop)
      // Based on the design requirements, we apply borders for screens with certain ratios
      // Desktop screens typically have aspect ratios around 16:9 (1.78) or 16:10 (1.6)
      // Kiosk screens are typically more square or vertical
      
      // More precise detection for kiosk vs desktop
      const isDesktop = (aspectRatio >= 1.6 && width >= 1200) || 
                       (aspectRatio >= 1.4 && width >= 1600); // Desktop screens
      
      // Apply borders for kiosk screens (tablets, vertical displays, etc.)
      // For testing, let's be more permissive with border display
      const isKiosk = !isDesktop && (
        width <= 1024 || // Small screens
        aspectRatio <= 1.4 || // Vertical or square screens (increased from 1.3)
        height > width || // Portrait orientation
        width <= 1366 // Medium screens should also show borders
      );
      
      setShouldShowBorder(isKiosk);
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
          opacity: 0.9
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
