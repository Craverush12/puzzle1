'use client';

import { useEffect, useState } from 'react';

export interface KioskConfig {
  autoFullscreen: boolean;
  preventContextMenu: boolean;
  preventKeyboard: boolean;
  preventRightClick: boolean;
  autoRestart: boolean;
  restartInterval: number; // in minutes
}

const defaultConfig: KioskConfig = {
  autoFullscreen: true,
  preventContextMenu: true,
  preventKeyboard: true,
  preventRightClick: true,
  autoRestart: true,
  restartInterval: 60, // 1 hour
};

export function useKiosk(config: Partial<KioskConfig> = {}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isKioskMode, setIsKioskMode] = useState(false);
  const finalConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    // Check if we're in kiosk mode (fullscreen or specific user agent)
    const checkKioskMode = () => {
      const isFullscreenActive = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      
      const isKioskUserAgent = /kiosk|touch/i.test(navigator.userAgent);
      
      setIsFullscreen(isFullscreenActive);
      setIsKioskMode(isFullscreenActive || isKioskUserAgent);
    };

    checkKioskMode();

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      checkKioskMode();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      
      setIsFullscreen(true);
      setIsKioskMode(true);
    } catch (error) {
      console.warn('Failed to enter fullscreen:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      
      setIsFullscreen(false);
      setIsKioskMode(false);
    } catch (error) {
      console.warn('Failed to exit fullscreen:', error);
    }
  };

  // Auto-enter fullscreen on first interaction
  useEffect(() => {
    if (!finalConfig.autoFullscreen || isFullscreen) return;

    const handleFirstInteraction = async (e: Event) => {
      // Only attempt fullscreen if it's a direct user interaction
      try {
        await enterFullscreen();
      } catch (error) {
        console.warn('Fullscreen not available or blocked:', error);
      }
      
      // Remove listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [finalConfig.autoFullscreen, isFullscreen]);

  // Prevent context menu
  useEffect(() => {
    if (!finalConfig.preventContextMenu) return;

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [finalConfig.preventContextMenu]);

  // Prevent right click
  useEffect(() => {
    if (!finalConfig.preventRightClick) return;

    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('mousedown', handleRightClick);
    return () => document.removeEventListener('mousedown', handleRightClick);
  }, [finalConfig.preventRightClick]);

  // Prevent keyboard shortcuts
  useEffect(() => {
    if (!finalConfig.preventKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow only specific keys for accessibility
      const allowedKeys = [
        'Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 
        'ArrowLeft', 'ArrowRight', 'Space'
      ];
      
      if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
      }
      
      // Prevent common browser shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [finalConfig.preventKeyboard]);

  // Auto-restart functionality
  useEffect(() => {
    if (!finalConfig.autoRestart) return;

    const restartInterval = finalConfig.restartInterval * 60 * 1000; // Convert to milliseconds
    
    const timer = setTimeout(() => {
      window.location.reload();
    }, restartInterval);

    return () => clearTimeout(timer);
  }, [finalConfig.autoRestart, finalConfig.restartInterval]);

  return {
    isFullscreen,
    isKioskMode,
    enterFullscreen,
    exitFullscreen,
    config: finalConfig
  };
}
