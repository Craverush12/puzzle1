'use client';

import { useEffect, useState, useCallback } from 'react';

export interface PerformanceMetrics {
  memoryUsage: number;
  fps: number;
  loadTime: number;
  renderTime: number;
  isLowPerformance: boolean;
}

export function useKioskPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    fps: 60,
    loadTime: 0,
    renderTime: 0,
    isLowPerformance: false,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  // Memory usage monitoring
  const updateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: usedMB,
        isLowPerformance: usedMB > 100, // Flag if memory usage > 100MB
      }));
    }
  }, []);

  // FPS monitoring
  const monitorFPS = useCallback(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        setMetrics(prev => ({
          ...prev,
          fps,
          isLowPerformance: prev.isLowPerformance || fps < 30,
        }));
      }
      
      if (isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };

    requestAnimationFrame(measureFPS);
  }, [isMonitoring]);

  // Performance optimization functions
  const optimizeForKiosk = useCallback(() => {
    // Disable unnecessary browser features for kiosk
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }

    // Optimize image loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.loading = 'lazy';
      img.decoding = 'async';
    });

    // Preload critical resources (only if they're actually used)
    // Removed unused preloads to fix console warnings
  }, []);

  // Memory cleanup
  const cleanupMemory = useCallback(() => {
    // Clear unused images from memory
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete || img.naturalWidth === 0) {
        img.src = '';
      }
    });

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }

    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('workbox') || name.includes('next')) {
            caches.delete(name);
          }
        });
      });
    }
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Initial memory check
    updateMemoryUsage();
    
    // Monitor memory every 30 seconds
    const memoryInterval = setInterval(updateMemoryUsage, 30000);
    
    // Monitor FPS
    monitorFPS();
    
    // Cleanup memory every 5 minutes
    const cleanupInterval = setInterval(cleanupMemory, 300000);
    
    return () => {
      setIsMonitoring(false);
      clearInterval(memoryInterval);
      clearInterval(cleanupInterval);
    };
  }, [updateMemoryUsage, monitorFPS, cleanupMemory]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Initialize performance optimizations
  useEffect(() => {
    optimizeForKiosk();
    
    // Measure initial load time
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, loadTime }));
    
    // Start monitoring after initial load
    const cleanup = setTimeout(() => {
      startMonitoring();
    }, 2000);

    return () => {
      clearTimeout(cleanup);
      stopMonitoring();
    };
  }, [optimizeForKiosk, startMonitoring, stopMonitoring]);

  // Auto-restart if performance is too low
  useEffect(() => {
    if (metrics.isLowPerformance && metrics.memoryUsage > 200) {
      console.warn('Low performance detected, considering restart...');
      
      // Try cleanup first
      cleanupMemory();
      
      // If still low performance after cleanup, restart
      setTimeout(() => {
        if (metrics.memoryUsage > 200) {
          console.warn('Performance still low after cleanup, restarting...');
          window.location.reload();
        }
      }, 10000);
    }
  }, [metrics.isLowPerformance, metrics.memoryUsage, cleanupMemory]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    cleanupMemory,
    optimizeForKiosk,
  };
}
