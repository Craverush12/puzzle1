'use client';

import { useEffect, useState } from 'react';

export interface KioskScreenInfo {
  width: number;
  height: number;
  aspectRatio: number;
  isVertical: boolean;
  isHorizontal: boolean;
  scaleFactor: number;
  devicePixelRatio: number;
}

export function useKioskScaling() {
  const [screenInfo, setScreenInfo] = useState<KioskScreenInfo>({
    width: 0,
    height: 0,
    aspectRatio: 0,
    isVertical: false,
    isHorizontal: false,
    scaleFactor: 1,
    devicePixelRatio: 1,
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      const isVertical = height > width;
      const isHorizontal = width > height;
      const devicePixelRatio = window.devicePixelRatio || 1;

      // Calculate scale factor based on common kiosk screen sizes
      let scaleFactor = 1;
      
      // Common kiosk screen sizes and their optimal scale factors
      if (width <= 768) {
        // Small kiosk (tablet size)
        scaleFactor = 0.8;
      } else if (width <= 1024) {
        // Medium kiosk
        scaleFactor = 1;
      } else if (width <= 1366) {
        // Large kiosk
        scaleFactor = 1.2;
      } else if (width <= 1920) {
        // Extra large kiosk
        scaleFactor = 1.4;
      } else {
        // Ultra large kiosk
        scaleFactor = 1.6;
      }

      // Adjust for vertical orientation
      if (isVertical) {
        scaleFactor *= 0.9; // Slightly smaller for vertical
      }

      setScreenInfo({
        width,
        height,
        aspectRatio,
        isVertical,
        isHorizontal,
        scaleFactor,
        devicePixelRatio,
      });

      // Apply CSS custom properties for scaling
      document.documentElement.style.setProperty('--kiosk-scale', scaleFactor.toString());
      document.documentElement.style.setProperty('--kiosk-width', `${width}px`);
      document.documentElement.style.setProperty('--kiosk-height', `${height}px`);
      document.documentElement.style.setProperty('--kiosk-aspect-ratio', aspectRatio.toString());
    };

    // Initial calculation
    updateScreenInfo();

    // Listen for resize events
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  // Get responsive classes based on screen size
  const getResponsiveClasses = (baseClasses: string = '') => {
    const { width, isVertical } = screenInfo;
    
    let sizeClass = '';
    if (width <= 768) {
      sizeClass = 'kiosk-small';
    } else if (width <= 1024) {
      sizeClass = 'kiosk-medium';
    } else if (width <= 1366) {
      sizeClass = 'kiosk-large';
    } else {
      sizeClass = 'kiosk-extra-large';
    }

    const orientationClass = isVertical ? 'kiosk-vertical' : 'kiosk-horizontal';
    
    return `${baseClasses} ${sizeClass} ${orientationClass}`.trim();
  };

  // Get scaled dimensions for components
  const getScaledSize = (baseSize: number) => {
    return Math.round(baseSize * screenInfo.scaleFactor);
  };

  // Get responsive font size
  const getResponsiveFontSize = (baseSize: number) => {
    const scaledSize = getScaledSize(baseSize);
    return `${scaledSize}px`;
  };

  return {
    screenInfo,
    getResponsiveClasses,
    getScaledSize,
    getResponsiveFontSize,
  };
}
