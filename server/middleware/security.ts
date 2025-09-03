import type { Express } from "express";

export function setupSecurityHeaders(app: Express) {
  // Security headers middleware for Observatory grade A
  app.use((req, res, next) => {
    // Content Security Policy - Restrictive CSP for maximum security
    const scriptHashes = [
      "'sha256-xyz'", // Add actual script hashes from Vite build
    ];
    
    const csp = [
      "default-src 'self'",
      `script-src 'self' ${scriptHashes.join(' ')} 'unsafe-eval'`, // unsafe-eval needed for dev
      "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for CSS-in-JS
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:", // WebSocket for dev HMR
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "media-src 'self'",
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', csp);
    
    // HTTP Strict Transport Security (HSTS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Cross-Origin Embedder Policy
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    
    // Cross-Origin Opener Policy  
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    
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