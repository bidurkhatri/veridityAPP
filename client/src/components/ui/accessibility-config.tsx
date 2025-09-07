// Accessibility Configuration - Brief Requirements
// Achieve Axe score ≥ 98 with ESLint a11y rules and CI checks

import React from 'react';

// ARIA labels and descriptions for common UI patterns
export const a11yLabels = {
  navigation: {
    mainMenu: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
    tabs: 'Tab navigation'
  },
  
  forms: {
    required: 'Required field',
    optional: 'Optional field',
    error: 'Error message',
    help: 'Help text',
    validation: 'Field validation status'
  },

  actions: {
    close: 'Close dialog',
    expand: 'Expand section',
    collapse: 'Collapse section',
    menu: 'Open menu',
    search: 'Search',
    filter: 'Filter results'
  },

  status: {
    loading: 'Loading content',
    success: 'Operation successful',
    error: 'Error occurred',
    warning: 'Warning message',
    info: 'Information'
  }
};

// Focus management utility
export class FocusManager {
  private static previousFocus: HTMLElement | null = null;

  static trap(containerSelector: string) {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    // Store previous focus
    this.previousFocus = document.activeElement as HTMLElement;

    // Focus first focusable element
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }

  static restore() {
    if (this.previousFocus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
  }
}

// Screen reader announcements
export class ScreenReaderAnnouncer {
  private static liveRegion: HTMLElement | null = null;

  static init() {
    if (this.liveRegion) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(this.liveRegion);
  }

  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) this.init();
    
    if (this.liveRegion) {
      this.liveRegion.setAttribute('aria-live', priority);
      this.liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (this.liveRegion) {
          this.liveRegion.textContent = '';
        }
      }, 1000);
    }
  }
}

// Keyboard navigation hook
export function useKeyboardNavigation(containerRef: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            event.preventDefault();
          }
        }
      }

      if (event.key === 'Escape') {
        FocusManager.restore();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef]);
}

// Accessible button component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  loading?: boolean;
}

export function AccessibleButton({ 
  children, 
  ariaLabel, 
  ariaDescribedBy, 
  loading = false,
  ...props 
}: AccessibleButtonProps) {
  return (
    <button
      {...props}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={loading || props.disabled}
      aria-busy={loading}
    >
      {children}
      {loading && (
        <span className="sr-only" aria-live="polite">
          Loading
        </span>
      )}
    </button>
  );
}

// Initialize accessibility features
export function initializeA11y() {
  ScreenReaderAnnouncer.init();
  
  // Add skip link for keyboard users
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-brand-emerald-600 text-white px-4 py-2 rounded';
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add focus visible styles
  document.documentElement.classList.add('js-focus-visible');
}