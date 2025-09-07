import { useEffect, useCallback } from 'react';

// Enhanced keyboard navigation hook for focus management
export function useKeyboardNavigation() {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Add keyboard navigation class on tab key
    if (e.key === 'Tab') {
      document.body.classList.add('using-keyboard');
      document.body.classList.remove('no-focus-ring');
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    // Remove keyboard navigation class on mouse interaction
    document.body.classList.remove('using-keyboard');
    document.body.classList.add('no-focus-ring');
  }, []);

  useEffect(() => {
    // Set up focus management
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    // Initialize with mouse mode
    document.body.classList.add('no-focus-ring');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleKeyDown, handleMouseDown]);
}

// Focus trap hook for modals and overlays
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, isActive]);
}