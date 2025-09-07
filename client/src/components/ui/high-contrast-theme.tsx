import React, { createContext, useContext, useEffect, useState } from 'react';

interface HighContrastContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const HighContrastContext = createContext<HighContrastContextType | null>(null);

export function useHighContrast() {
  const context = useContext(HighContrastContext);
  if (!context) {
    throw new Error('useHighContrast must be used within HighContrastProvider');
  }
  return context;
}

interface HighContrastProviderProps {
  children: React.ReactNode;
}

export function HighContrastProvider({ children }: HighContrastProviderProps) {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check for saved preference or system preference
    const saved = localStorage.getItem('veridity-high-contrast');
    const systemPrefers = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (saved !== null) {
      setIsHighContrast(saved === 'true');
    } else if (systemPrefers) {
      setIsHighContrast(true);
    }
  }, []);

  useEffect(() => {
    // Apply high contrast class to document
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Save preference
    localStorage.setItem('veridity-high-contrast', isHighContrast.toString());
  }, [isHighContrast]);

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
  };

  return (
    <HighContrastContext.Provider value={{ isHighContrast, toggleHighContrast }}>
      {children}
    </HighContrastContext.Provider>
  );
}