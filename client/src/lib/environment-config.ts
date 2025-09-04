/**
 * Environment configuration management
 */

export interface EnvironmentConfig {
  nodeEnv: 'development' | 'production' | 'test';
  apiUrl: string;
  websocketUrl: string;
  features: {
    zkProofs: boolean;
    biometrics: boolean;
    voiceNav: boolean;
    analytics: boolean;
    errorTracking: boolean;
  };
  performance: {
    enableBundleAnalysis: boolean;
    enableMemoryMonitoring: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
  security: {
    enableCSRF: boolean;
    sessionTimeout: number;
    maxFileUpload: number;
  };
}

class EnvironmentManager {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EnvironmentConfig {
    const isDev = import.meta.env.MODE === 'development';
    const isProd = import.meta.env.MODE === 'production';

    return {
      nodeEnv: isDev ? 'development' : isProd ? 'production' : 'test',
      apiUrl: import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:5000' : ''),
      websocketUrl: import.meta.env.VITE_WS_URL || (isDev ? 'ws://localhost:5000' : ''),
      
      features: {
        zkProofs: import.meta.env.VITE_ENABLE_ZK_PROOFS !== 'false',
        biometrics: import.meta.env.VITE_ENABLE_BIOMETRICS !== 'false', 
        voiceNav: import.meta.env.VITE_ENABLE_VOICE_NAV !== 'false',
        analytics: isProd && import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
        errorTracking: isProd && import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true'
      },

      performance: {
        enableBundleAnalysis: isDev,
        enableMemoryMonitoring: isDev,
        logLevel: isDev ? 'debug' : 'error'
      },

      security: {
        enableCSRF: isProd,
        sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '86400000'), // 24h default
        maxFileUpload: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880') // 5MB default
      }
    };
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
    return this.config.features[feature];
  }

  getApiUrl(path?: string): string {
    const base = this.config.apiUrl;
    return path ? `${base}${path}` : base;
  }

  getWebSocketUrl(path?: string): string {
    const base = this.config.websocketUrl;
    return path ? `${base}${path}` : base;
  }

  isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  getLogLevel(): string {
    return this.config.performance.logLevel;
  }

  // Dynamic config updates
  updateFeature(feature: keyof EnvironmentConfig['features'], enabled: boolean) {
    this.config.features[feature] = enabled;
    
    // Persist to localStorage for client-side features
    localStorage.setItem(
      `veridity-feature-${feature}`,
      enabled.toString()
    );
  }
}

// Global environment manager
export const envManager = new EnvironmentManager();

// React hook for environment config
export function useEnvironment() {
  return {
    config: envManager.getConfig(),
    isFeatureEnabled: envManager.isFeatureEnabled.bind(envManager),
    getApiUrl: envManager.getApiUrl.bind(envManager),
    getWebSocketUrl: envManager.getWebSocketUrl.bind(envManager),
    isDevelopment: envManager.isDevelopment.bind(envManager),
    isProduction: envManager.isProduction.bind(envManager),
    updateFeature: envManager.updateFeature.bind(envManager)
  };
}

// Performance monitoring based on environment
export function shouldEnablePerformanceMonitoring(): boolean {
  return envManager.getConfig().performance.enableMemoryMonitoring;
}

export function shouldEnableBundleAnalysis(): boolean {
  return envManager.getConfig().performance.enableBundleAnalysis;
}

// Conditional logging
export function log(level: 'error' | 'warn' | 'info' | 'debug', message: string, ...args: any[]) {
  const configLevel = envManager.getConfig().performance.logLevel;
  const levels = ['error', 'warn', 'info', 'debug'];
  
  const configIndex = levels.indexOf(configLevel);
  const messageIndex = levels.indexOf(level);
  
  if (messageIndex <= configIndex) {
    console[level](message, ...args);
  }
}