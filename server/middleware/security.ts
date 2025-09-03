import type { Express } from "express";

export function setupSecurityHeaders(app: Express) {
  // Security headers middleware for Observatory grade A
  app.use((req, res, next) => {
    // Content Security Policy - Restrictive CSP for maximum security
    const scriptHashes = [
      "'sha256-xyz'", // Add actual script hashes from Vite build
    ];
    
    // Relaxed CSP for development to allow Vite HMR and React development
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const csp = isDevelopment ? [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:", // Vite needs these for dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' ws: wss: https:",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "media-src 'self' data: blob:",
    ].join('; ') : [
      "default-src 'self'",
      `script-src 'self' ${scriptHashes.join(' ')}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "media-src 'self'",
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', csp);
    
    // HTTP Strict Transport Security (HSTS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Cross-Origin policies - relaxed for development
    if (!isDevelopment) {
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    }
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy (formerly Feature Policy)
    const permissions = [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'camera=("self")', // Allow camera for QR scanning
      'cross-origin-isolated=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'execution-while-not-rendered=()',
      'execution-while-out-of-viewport=()',
      'fullscreen=("self")',
      'geolocation=()',
      'gyroscope=()',
      'keyboard-map=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'navigation-override=()',
      'payment=("self")', // Allow for future payment features
      'picture-in-picture=()',
      'publickey-credentials-get=("self")', // For WebAuthn/Passkeys
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=("self")',
      'xr-spatial-tracking=()',
    ].join(', ');
    
    res.setHeader('Permissions-Policy', permissions);
    
    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // X-Frame-Options (backup for frame-ancestors)
    res.setHeader('X-Frame-Options', 'DENY');
    
    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    next();
  });
}

// Rate limiting configuration
export const RATE_LIMITS = {
  API_PER_MINUTE: 60,
  VERIFY_PER_HOUR: 100,
  AUTH_PER_MINUTE: 5,
} as const;

// Nonce configuration  
export const NONCE_CONFIG = {
  TTL_HOURS: 24,
  LENGTH: 16,
} as const;