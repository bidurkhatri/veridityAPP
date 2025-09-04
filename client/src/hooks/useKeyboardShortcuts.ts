/**
 * Keyboard shortcuts hook for better accessibility
 */

import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matches = (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.altKey === !!shortcut.altKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.metaKey === !!shortcut.metaKey
        );

        if (matches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
            event.stopPropagation();
          }
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [shortcuts]);
}

// Common keyboard shortcuts for the app
export function useAppKeyboardShortcuts() {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'h',
      altKey: true,
      action: () => {
        // Open help
        console.log('Open help');
      },
      description: 'Open help'
    },
    {
      key: 's',
      altKey: true,
      action: () => {
        // Skip to content
        const main = document.getElementById('main-content') || document.querySelector('main');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      },
      description: 'Skip to main content'
    },
    {
      key: 'm',
      altKey: true,
      action: () => {
        // Focus main menu
        const menu = document.querySelector('[role="navigation"]') as HTMLElement;
        if (menu) {
          menu.focus();
        }
      },
      description: 'Focus main menu'
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => {
        // Focus search
        const search = document.querySelector('input[type="search"]') as HTMLElement;
        if (search) {
          search.focus();
        }
      },
      description: 'Focus search'
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals/dropdowns
        const closeButtons = document.querySelectorAll('[aria-label="Close"], [data-testid*="close"]');
        if (closeButtons.length > 0) {
          (closeButtons[closeButtons.length - 1] as HTMLElement).click();
        }
      },
      description: 'Close modals'
    }
  ];

  useKeyboardShortcuts(shortcuts);
  
  return shortcuts;
}