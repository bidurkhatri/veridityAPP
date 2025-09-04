/**
 * Accessibility provider with keyboard navigation and focus management
 */

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';

interface AccessibilityContextType {
  isKeyboardNavigation: boolean;
  focusedElement: string | null;
  setFocusedElement: (id: string | null) => void;
  announceToScreenReader: (message: string) => void;
  skipToContent: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [highContrast, setHighContrast] = useState(false);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Detect keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        setIsKeyboardNavigation(true);
        document.body.classList.add('using-keyboard');
      }
    };

    const handleMousedown = () => {
      setIsKeyboardNavigation(false);
      document.body.classList.remove('using-keyboard');
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleMousedown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleMousedown);
    };
  }, []);

  // Skip navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Alt + S to skip to main content
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        skipToContent();
      }
      
      // Alt + H for help
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        announceToScreenReader('Press Alt + S to skip to main content, Alt + M for main menu, or Tab to navigate through interactive elements.');
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  // High contrast mode
  useEffect(() => {
    const saved = localStorage.getItem('veridity-high-contrast');
    if (saved === 'true') {
      setHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('veridity-high-contrast', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    announceToScreenReader(`High contrast mode ${newValue ? 'enabled' : 'disabled'}`);
  };

  const announceToScreenReader = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const skipToContent = () => {
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
      announceToScreenReader('Skipped to main content');
    }
  };

  const value: AccessibilityContextType = {
    isKeyboardNavigation,
    focusedElement,
    setFocusedElement,
    announceToScreenReader,
    skipToContent,
    highContrast,
    toggleHighContrast
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
        data-testid="screen-reader-announcements"
      />
      
      {/* Skip navigation links */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-[9999] bg-primary text-primary-foreground p-2 rounded">
        <button
          onClick={skipToContent}
          className="underline"
          data-testid="skip-to-content"
        >
          Skip to main content (Alt + S)
        </button>
      </div>

      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Focus management hook
export function useFocusManagement() {
  const { setFocusedElement, announceToScreenReader } = useAccessibility();
  const elementRef = useRef<HTMLElement>(null);

  const handleFocus = (event: FocusEvent) => {
    const element = event.target as HTMLElement;
    const id = element.id || element.getAttribute('data-testid') || 'unnamed-element';
    setFocusedElement(id);
    
    // Announce focused element to screen readers
    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('title') ||
                  element.textContent?.trim() ||
                  'Interactive element';
    
    if (label && label.length < 100) {
      announceToScreenReader(`Focused: ${label}`);
    }
  };

  const handleBlur = () => {
    setFocusedElement(null);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);
      
      return () => {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  return elementRef;
}

// ARIA live region hook
export function useAriaLiveRegion() {
  const regionRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (regionRef.current) {
      regionRef.current.setAttribute('aria-live', priority);
      regionRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const LiveRegion = () => (
    <div
      ref={regionRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );

  return { announce, LiveRegion };
}