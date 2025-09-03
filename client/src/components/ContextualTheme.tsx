import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeMode = 'default' | 'banking' | 'government' | 'education' | 'healthcare' | 'emergency';

interface ContextualThemeProps {
  mode: ThemeMode;
  organization?: string;
  primaryColor?: string;
  logoUrl?: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  organization?: string;
  setOrganization: (org: string) => void;
  themeConfig: ThemeConfig;
}

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    headerWeight: string;
    bodyWeight: string;
  };
  branding: {
    name: string;
    tagline: string;
    icon: string;
  };
  ui: {
    borderRadius: string;
    shadowStyle: string;
    buttonStyle: string;
  };
}

const themeConfigs: Record<ThemeMode, ThemeConfig> = {
  default: {
    colors: {
      primary: '#14B8A6', // Teal
      secondary: '#0F766E',
      accent: '#F59E0B', // Amber
      background: '#FFFFFF',
      text: '#1F2937'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headerWeight: '700',
      bodyWeight: '400'
    },
    branding: {
      name: 'Veridity',
      tagline: 'Privacy-first digital identity',
      icon: '🛡️'
    },
    ui: {
      borderRadius: '12px',
      shadowStyle: 'shadow-lg',
      buttonStyle: 'rounded-xl'
    }
  },
  banking: {
    colors: {
      primary: '#1E40AF', // Deep Blue
      secondary: '#1E3A8A',
      accent: '#059669', // Green
      background: '#F8FAFC',
      text: '#0F172A'
    },
    typography: {
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      headerWeight: '600',
      bodyWeight: '400'
    },
    branding: {
      name: 'Secure Banking Identity',
      tagline: 'Trust • Security • Privacy',
      icon: '🏦'
    },
    ui: {
      borderRadius: '8px',
      shadowStyle: 'shadow-md',
      buttonStyle: 'rounded-lg'
    }
  },
  government: {
    colors: {
      primary: '#DC2626', // Nepal Red
      secondary: '#B91C1C',
      accent: '#1D4ED8', // Nepal Blue
      background: '#FEFEFE',
      text: '#111827'
    },
    typography: {
      fontFamily: '"Times New Roman", serif',
      headerWeight: '700',
      bodyWeight: '400'
    },
    branding: {
      name: 'नेपाल सरकार • Government of Nepal',
      tagline: 'Official Digital Identity Platform',
      icon: '🇳🇵'
    },
    ui: {
      borderRadius: '6px',
      shadowStyle: 'shadow-sm',
      buttonStyle: 'rounded-md'
    }
  },
  education: {
    colors: {
      primary: '#7C3AED', // Purple
      secondary: '#6D28D9',
      accent: '#F59E0B', // Amber
      background: '#FDFCFD',
      text: '#374151'
    },
    typography: {
      fontFamily: '"Open Sans", "Helvetica Neue", sans-serif',
      headerWeight: '600',
      bodyWeight: '400'
    },
    branding: {
      name: 'Academic Verification',
      tagline: 'Empowering Education Through Trust',
      icon: '🎓'
    },
    ui: {
      borderRadius: '16px',
      shadowStyle: 'shadow-lg',
      buttonStyle: 'rounded-2xl'
    }
  },
  healthcare: {
    colors: {
      primary: '#059669', // Medical Green
      secondary: '#047857',
      accent: '#EF4444', // Medical Red
      background: '#F0FDF4',
      text: '#065F46'
    },
    typography: {
      fontFamily: '"Source Sans Pro", Arial, sans-serif',
      headerWeight: '600',
      bodyWeight: '400'
    },
    branding: {
      name: 'HealthCare Identity',
      tagline: 'Secure Medical Verification',
      icon: '⚕️'
    },
    ui: {
      borderRadius: '10px',
      shadowStyle: 'shadow-md',
      buttonStyle: 'rounded-xl'
    }
  },
  emergency: {
    colors: {
      primary: '#DC2626', // Red
      secondary: '#B91C1C',
      accent: '#F59E0B', // Amber
      background: '#FEF2F2',
      text: '#7F1D1D'
    },
    typography: {
      fontFamily: '"Roboto Condensed", sans-serif',
      headerWeight: '700',
      bodyWeight: '500'
    },
    branding: {
      name: 'Emergency Services',
      tagline: 'Critical Identity Verification',
      icon: '🚨'
    },
    ui: {
      borderRadius: '8px',
      shadowStyle: 'shadow-xl',
      buttonStyle: 'rounded-lg'
    }
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ContextualThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('default');
  const [organization, setOrganization] = useState<string>('');

  const themeConfig = themeConfigs[mode];

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    const config = themeConfigs[mode];
    
    // Set CSS custom properties
    root.style.setProperty('--color-primary', config.colors.primary);
    root.style.setProperty('--color-secondary', config.colors.secondary);
    root.style.setProperty('--color-accent', config.colors.accent);
    root.style.setProperty('--color-background', config.colors.background);
    root.style.setProperty('--color-text', config.colors.text);
    root.style.setProperty('--font-family', config.typography.fontFamily);
    root.style.setProperty('--border-radius', config.ui.borderRadius);
    
    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${mode}`);
    
    return () => {
      document.body.classList.remove(`theme-${mode}`);
    };
  }, [mode]);

  return (
    <ThemeContext.Provider value={{
      mode,
      setMode,
      organization,
      setOrganization,
      themeConfig
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useContextualTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useContextualTheme must be used within ContextualThemeProvider');
  }
  return context;
}

// Auto-detect theme based on URL or organization
export function useAutoThemeDetection() {
  const { setMode, setOrganization } = useContextualTheme();
  
  useEffect(() => {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orgParam = urlParams.get('org');
    const modeParam = urlParams.get('mode') as ThemeMode;
    
    if (modeParam && themeConfigs[modeParam]) {
      setMode(modeParam);
    }
    
    if (orgParam) {
      setOrganization(orgParam);
      // Auto-detect mode based on organization type
      if (orgParam.includes('bank') || orgParam.includes('financial')) {
        setMode('banking');
      } else if (orgParam.includes('gov') || orgParam.includes('government')) {
        setMode('government');
      } else if (orgParam.includes('university') || orgParam.includes('school')) {
        setMode('education');
      } else if (orgParam.includes('hospital') || orgParam.includes('health')) {
        setMode('healthcare');
      }
    }
  }, [setMode, setOrganization]);
}

// Theme-aware component wrapper
export function ThemedCard({ children, className = '', ...props }: { children: ReactNode, className?: string }) {
  const { themeConfig } = useContextualTheme();
  
  return (
    <div 
      className={`bg-background border border-primary/20 ${themeConfig.ui.shadowStyle} ${className}`}
      style={{ borderRadius: themeConfig.ui.borderRadius }}
      {...props}
    >
      {children}
    </div>
  );
}

export function ThemedButton({ children, variant = 'primary', className = '', ...props }: { 
  children: ReactNode, 
  variant?: 'primary' | 'secondary' | 'accent',
  className?: string 
}) {
  const { themeConfig } = useContextualTheme();
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-secondary',
    secondary: 'bg-secondary text-white hover:bg-primary',
    accent: 'bg-accent text-white hover:opacity-90'
  };
  
  return (
    <button 
      className={`px-4 py-2 font-medium transition-colors ${variantStyles[variant]} ${themeConfig.ui.buttonStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}