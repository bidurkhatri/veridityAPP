// Visual Testing Configuration - Brief Requirements
// Ensure light/dark/high-contrast parity across all components

import React from 'react';
import { cn } from '@/lib/utils';

// Visual testing component to verify theme consistency
interface VisualTestSuiteProps {
  children: React.ReactNode;
  testId?: string;
}

export function VisualTestSuite({ children, testId = 'visual-test-suite' }: VisualTestSuiteProps) {
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark' | 'high-contrast'>('light');

  const themes = [
    { name: 'light', label: 'Light Mode', class: '' },
    { name: 'dark', label: 'Dark Mode', class: 'dark' },
    { name: 'high-contrast', label: 'High Contrast', class: 'high-contrast' }
  ] as const;

  React.useEffect(() => {
    const root = document.documentElement;
    
    // Clear existing theme classes
    root.classList.remove('dark', 'high-contrast');
    
    // Apply current theme
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else if (currentTheme === 'high-contrast') {
      root.classList.add('high-contrast');
    }
  }, [currentTheme]);

  return (
    <div data-testid={testId} className="min-h-screen bg-surface transition-colors">
      {/* Theme Switcher for Testing */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 p-2 bg-surface border border-border-default rounded-lg shadow-md">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => setCurrentTheme(theme.name)}
            className={cn(
              "px-3 py-1 text-sm rounded transition-colors",
              currentTheme === theme.name
                ? "bg-brand-emerald-600 text-white"
                : "bg-surface-secondary text-text-secondary hover:bg-surface-tertiary"
            )}
            data-testid={`theme-${theme.name}`}
          >
            {theme.label}
          </button>
        ))}
      </div>

      {/* Test Content */}
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Visual Theme Testing
          </h1>
          <p className="text-text-secondary">
            Current theme: <span className="font-medium">{themes.find(t => t.name === currentTheme)?.label}</span>
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}

// Component test grid to verify consistency
export function ComponentTestGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Buttons Test */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text-primary">Buttons</h3>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-brand-emerald-600 text-white rounded-lg hover:bg-brand-emerald-700 transition-colors">
            Primary Button
          </button>
          <button className="w-full px-4 py-2 border border-border-default text-text-primary rounded-lg hover:bg-surface-secondary transition-colors">
            Secondary Button
          </button>
          <button className="w-full px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
            Quiet Button
          </button>
        </div>
      </div>

      {/* Cards Test */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text-primary">Cards</h3>
        <div className="p-4 bg-surface border border-border-default rounded-lg">
          <h4 className="font-medium text-text-primary mb-2">Card Title</h4>
          <p className="text-text-secondary text-sm">Card content with secondary text color.</p>
        </div>
      </div>

      {/* Status Indicators Test */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text-primary">Status</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success-text rounded-full"></div>
            <span className="text-success-text text-sm">Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-error-text rounded-full"></div>
            <span className="text-error-text text-sm">Error</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-warning-text rounded-full"></div>
            <span className="text-warning-text text-sm">Warning</span>
          </div>
        </div>
      </div>

      {/* Forms Test */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text-primary">Forms</h3>
        <div className="space-y-2">
          <input 
            type="text" 
            placeholder="Text input"
            className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface text-text-primary focus:border-brand-emerald-600 focus:outline-none"
          />
          <select className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface text-text-primary">
            <option>Select option</option>
          </select>
        </div>
      </div>

      {/* Navigation Test */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text-primary">Navigation</h3>
        <nav className="space-y-1">
          <a href="#" className="block px-3 py-2 text-text-primary hover:bg-surface-secondary rounded-lg transition-colors">
            Active Link
          </a>
          <a href="#" className="block px-3 py-2 text-text-secondary hover:text-text-primary transition-colors">
            Inactive Link
          </a>
        </nav>
      </div>

      {/* Data Display Test */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text-primary">Data</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Label:</span>
            <span className="text-text-primary font-medium">Value</span>
          </div>
          <div className="h-px bg-border-default"></div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Another:</span>
            <span className="text-text-primary font-medium">Data</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Automated visual testing utilities
export const visualTestUtils = {
  // Check color contrast ratios
  checkContrast(foreground: string, background: string): number {
    // Simplified contrast calculation
    // In real implementation, would use proper WCAG contrast calculation
    const getLuminance = (color: string) => {
      // Simplified - would parse actual color values
      return 0.5; // Placeholder
    };
    
    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  },

  // Verify theme consistency
  verifyThemeConsistency(): { passed: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check if all theme variables are defined
    const requiredVars = [
      '--text-primary',
      '--text-secondary', 
      '--bg-surface',
      '--border-default',
      '--brand-emerald-600'
    ];
    
    const computedStyle = getComputedStyle(document.documentElement);
    
    requiredVars.forEach(varName => {
      const value = computedStyle.getPropertyValue(varName);
      if (!value || value.trim() === '') {
        issues.push(`Missing CSS variable: ${varName}`);
      }
    });

    return {
      passed: issues.length === 0,
      issues
    };
  },

  // Generate accessibility report
  generateA11yReport(): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`);
      score -= images.length * 5;
    }

    // Check for missing form labels
    const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length} inputs missing labels`);
      score -= unlabeledInputs.length * 10;
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }
};