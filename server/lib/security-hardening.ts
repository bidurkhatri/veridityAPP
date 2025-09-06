/**
 * Security Hardening System
 * TLS 1.3, strict CSP/HSTS/COOP/COEP headers, rate limiting, and idempotency keys
 * Enterprise-grade security for production deployment
 */

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import helmet from 'helmet';

// Security Configuration Types
export interface SecurityConfig {
  tls: TLSConfig;
  headers: SecurityHeaders;
  rateLimit: RateLimitConfig;
  idempotency: IdempotencyConfig;
  cors: CORSConfig;
  csrf: CSRFConfig;
  contentSecurity: ContentSecurityConfig;
}

export interface TLSConfig {
  enabled: boolean;
  version: '1.2' | '1.3';
  ciphers: string[];
  dhparam?: string;
  certificate?: string;
  privateKey?: string;
  caBundle?: string;
  hsts: HSTSConfig;
  ocsp: boolean;
  sct: boolean; // Certificate Transparency
}

export interface HSTSConfig {
  enabled: boolean;
  maxAge: number; // seconds
  includeSubDomains: boolean;
  preload: boolean;
}

export interface SecurityHeaders {
  hsts: HSTSConfig;
  csp: CSPConfig;
  coop: COOPConfig;
  coep: COEPConfig;
  corp: CORPConfig;
  referrerPolicy: string;
  permissionsPolicy: PermissionsPolicyConfig;
  xFrameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  xContentTypeOptions: boolean;
  xXSSProtection: boolean;
}

export interface CSPConfig {
  enabled: boolean;
  reportOnly: boolean;
  reportUri?: string;
  directives: {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    fontSrc: string[];
    objectSrc: string[];
    mediaSrc: string[];
    frameSrc: string[];
    childSrc: string[];
    workerSrc: string[];
    manifestSrc: string[];
    baseUri: string[];
    formAction: string[];
    frameAncestors: string[];
    upgradeInsecureRequests: boolean;
    blockAllMixedContent: boolean;
  };
}

export interface COOPConfig {
  enabled: boolean;
  value: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';
}

export interface COEPConfig {
  enabled: boolean;
  value: 'unsafe-none' | 'require-corp' | 'credentialless';
}

export interface CORPConfig {
  enabled: boolean;
  value: 'same-site' | 'same-origin' | 'cross-origin';
}

export interface PermissionsPolicyConfig {
  enabled: boolean;
  policies: {
    camera: string[];
    microphone: string[];
    geolocation: string[];
    payment: string[];
    usb: string[];
    bluetooth: string[];
    accelerometer: string[];
    gyroscope: string[];
    magnetometer: string[];
    fullscreen: string[];
    pictureInPicture: string[];
  };
}

export interface RateLimitConfig {
  enabled: boolean;
  global: RateLimitRule;
  endpoints: Map<string, RateLimitRule>;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: (req: Request) => string;
  onLimitReached: (req: Request, res: Response) => void;
  store: 'memory' | 'redis' | 'mongodb';
  trustProxy: boolean;
}

export interface RateLimitRule {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  standardHeaders: boolean; // Return standard headers
  legacyHeaders: boolean; // Return legacy headers
  message: string; // Error message
  statusCode: number; // HTTP status code
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface IdempotencyConfig {
  enabled: boolean;
  headerName: string; // Default: 'Idempotency-Key'
  keyLength: number; // Minimum key length
  ttl: number; // Time to live in seconds
  methods: string[]; // HTTP methods to apply to
  store: 'memory' | 'redis' | 'database';
  conflictStatus: number; // Status for conflicts
  algorithms: string[]; // Supported algorithms
}

export interface CORSConfig {
  enabled: boolean;
  origin: string | string[] | ((origin: string) => boolean);
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number; // Preflight cache time
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

export interface CSRFConfig {
  enabled: boolean;
  secret: string;
  cookie: {
    name: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
  ignoreMethods: string[];
  value: (req: Request) => string;
}

export interface ContentSecurityConfig {
  enabled: boolean;
  nonce: {
    enabled: boolean;
    algorithm: 'sha256' | 'sha384' | 'sha512';
    length: number;
  };
  hash: {
    enabled: boolean;
    algorithm: 'sha256' | 'sha384' | 'sha512';
  };
  violation: {
    reportUri?: string;
    reportOnly: boolean;
  };
}

export interface SecurityMetrics {
  requests: {
    total: number;
    blocked: number;
    rateLimited: number;
    csrfProtected: number;
    tlsUpgraded: number;
  };
  headers: {
    hstsEnforced: number;
    cspViolations: number;
    coopBlocked: number;
    coepBlocked: number;
  };
  idempotency: {
    keysUsed: number;
    duplicateRequests: number;
    conflictsDetected: number;
  };
  performance: {
    averageResponseTime: number;
    securityOverhead: number;
    cacheHitRate: number;
  };
}

// Security logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' }),
    new winston.transports.Console()
  ]
});

export class SecurityHardeningManager {
  private static instance: SecurityHardeningManager;
  private config: SecurityConfig;
  private rateLimiters: Map<string, any> = new Map();
  private idempotencyStore: Map<string, IdempotencyRecord> = new Map();
  private securityMetrics: SecurityMetrics;
  private nonceStore: Map<string, string> = new Map();
  private csrfTokens: Set<string> = new Set();
  private readonly VERSION = '11.0.0-security-hardening';

  constructor() {
    this.securityMetrics = {
      requests: {
        total: 0,
        blocked: 0,
        rateLimited: 0,
        csrfProtected: 0,
        tlsUpgraded: 0
      },
      headers: {
        hstsEnforced: 0,
        cspViolations: 0,
        coopBlocked: 0,
        coepBlocked: 0
      },
      idempotency: {
        keysUsed: 0,
        duplicateRequests: 0,
        conflictsDetected: 0
      },
      performance: {
        averageResponseTime: 0,
        securityOverhead: 0,
        cacheHitRate: 0
      }
    };

    this.config = this.createSecurityConfig();
    this.initializeSecurityHardening();
  }

  static getInstance(): SecurityHardeningManager {
    if (!SecurityHardeningManager.instance) {
      SecurityHardeningManager.instance = new SecurityHardeningManager();
    }
    return SecurityHardeningManager.instance;
  }

  private createSecurityConfig(): SecurityConfig {
    return {
      tls: {
        enabled: process.env.NODE_ENV === 'production',
        version: '1.3',
        ciphers: [
          'TLS_AES_256_GCM_SHA384',
          'TLS_CHACHA20_POLY1305_SHA256',
          'TLS_AES_128_GCM_SHA256',
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES256-GCM-SHA384'
        ],
        hsts: {
          enabled: true,
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true
        },
        ocsp: true,
        sct: true
      },
      headers: {
        hsts: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
        csp: {
          enabled: true,
          reportOnly: false,
          reportUri: '/api/security/csp-violations',
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'nonce-{nonce}'", "'strict-dynamic'"],
            styleSrc: ["'self'", "'nonce-{nonce}'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:", "wss:"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            childSrc: ["'self'"],
            workerSrc: ["'self'"],
            manifestSrc: ["'self'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: true,
            blockAllMixedContent: true
          }
        },
        coop: {
          enabled: true,
          value: 'same-origin'
        },
        coep: {
          enabled: true,
          value: 'require-corp'
        },
        corp: {
          enabled: true,
          value: 'same-origin'
        },
        referrerPolicy: 'strict-origin-when-cross-origin',
        permissionsPolicy: {
          enabled: true,
          policies: {
            camera: ['self'],
            microphone: ['self'],
            geolocation: ['self'],
            payment: ['self'],
            usb: ['none'],
            bluetooth: ['none'],
            accelerometer: ['self'],
            gyroscope: ['self'],
            magnetometer: ['self'],
            fullscreen: ['self'],
            pictureInPicture: ['self']
          }
        },
        xFrameOptions: 'DENY',
        xContentTypeOptions: true,
        xXSSProtection: true
      },
      rateLimit: {
        enabled: true,
        global: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 1000, // Limit each IP to 1000 requests per windowMs
          standardHeaders: true,
          legacyHeaders: false,
          message: 'Too many requests from this IP',
          statusCode: 429
        },
        endpoints: new Map([
          ['/api/auth/login', {
            windowMs: 15 * 60 * 1000,
            max: 5,
            standardHeaders: true,
            legacyHeaders: false,
            message: 'Too many login attempts',
            statusCode: 429
          }],
          ['/api/proof/generate', {
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 10,
            standardHeaders: true,
            legacyHeaders: false,
            message: 'Too many proof generation requests',
            statusCode: 429
          }]
        ]),
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        keyGenerator: (req) => req.ip,
        onLimitReached: (req, res) => {
          securityLogger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent')
          });
        },
        store: 'memory',
        trustProxy: true
      },
      idempotency: {
        enabled: true,
        headerName: 'Idempotency-Key',
        keyLength: 16,
        ttl: 3600, // 1 hour
        methods: ['POST', 'PUT', 'PATCH'],
        store: 'memory',
        conflictStatus: 409,
        algorithms: ['sha256', 'sha384', 'sha512']
      },
      cors: {
        enabled: true,
        origin: (origin) => {
          const allowedOrigins = [
            'https://veridity.app',
            'https://www.veridity.app',
            'https://admin.veridity.app'
          ];
          return !origin || allowedOrigins.includes(origin);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key'],
        exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
        credentials: true,
        maxAge: 86400, // 24 hours
        preflightContinue: false,
        optionsSuccessStatus: 204
      },
      csrf: {
        enabled: true,
        secret: process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex'),
        cookie: {
          name: '_csrf',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000 // 1 hour
        },
        ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
        value: (req) => req.body._csrf || req.query._csrf || req.headers['x-csrf-token']
      },
      contentSecurity: {
        enabled: true,
        nonce: {
          enabled: true,
          algorithm: 'sha256',
          length: 32
        },
        hash: {
          enabled: true,
          algorithm: 'sha256'
        },
        violation: {
          reportUri: '/api/security/csp-violations',
          reportOnly: false
        }
      }
    };
  }

  private async initializeSecurityHardening(): Promise<void> {
    securityLogger.info('Initializing Security Hardening System', { 
      version: this.VERSION 
    });

    // Initialize rate limiters
    await this.setupRateLimiters();

    // Setup security monitoring
    await this.setupSecurityMonitoring();

    // Initialize cleanup tasks
    await this.setupCleanupTasks();

    securityLogger.info('Security Hardening System initialized successfully');
  }

  // Middleware Functions
  getSecurityMiddleware() {
    return {
      helmet: this.createHelmetMiddleware(),
      rateLimit: this.createRateLimitMiddleware(),
      idempotency: this.createIdempotencyMiddleware(),
      cors: this.createCORSMiddleware(),
      csrf: this.createCSRFMiddleware(),
      contentSecurity: this.createContentSecurityMiddleware()
    };
  }

  private createHelmetMiddleware() {
    return helmet({
      contentSecurityPolicy: this.config.headers.csp.enabled ? {
        directives: this.buildCSPDirectives(),
        reportOnly: this.config.headers.csp.reportOnly
      } : false,
      hsts: this.config.headers.hsts.enabled ? {
        maxAge: this.config.headers.hsts.maxAge,
        includeSubDomains: this.config.headers.hsts.includeSubDomains,
        preload: this.config.headers.hsts.preload
      } : false,
      crossOriginEmbedderPolicy: this.config.headers.coep.enabled ? {
        policy: this.config.headers.coep.value
      } : false,
      crossOriginOpenerPolicy: this.config.headers.coop.enabled ? {
        policy: this.config.headers.coop.value
      } : false,
      crossOriginResourcePolicy: this.config.headers.corp.enabled ? {
        policy: this.config.headers.corp.value
      } : false,
      referrerPolicy: { policy: this.config.headers.referrerPolicy }
    });
  }

  private createRateLimitMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.rateLimit.enabled) {
        return next();
      }

      const endpoint = this.findEndpointPattern(req.path);
      const limiterKey = endpoint || 'global';
      
      let limiter = this.rateLimiters.get(limiterKey);
      if (!limiter) {
        const config = endpoint ? 
          this.config.rateLimit.endpoints.get(endpoint) : 
          this.config.rateLimit.global;
        
        limiter = rateLimit({
          ...config,
          keyGenerator: this.config.rateLimit.keyGenerator,
          onLimitReached: this.config.rateLimit.onLimitReached
        });
        
        this.rateLimiters.set(limiterKey, limiter);
      }

      limiter(req, res, (error: any) => {
        if (error) {
          this.securityMetrics.requests.rateLimited++;
        }
        next(error);
      });
    };
  }

  private createIdempotencyMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.idempotency.enabled) {
        return next();
      }

      if (!this.config.idempotency.methods.includes(req.method)) {
        return next();
      }

      const idempotencyKey = req.headers[this.config.idempotency.headerName.toLowerCase()] as string;
      
      if (!idempotencyKey) {
        return res.status(400).json({
          error: 'Missing idempotency key',
          message: `${this.config.idempotency.headerName} header is required for ${req.method} requests`
        });
      }

      if (idempotencyKey.length < this.config.idempotency.keyLength) {
        return res.status(400).json({
          error: 'Invalid idempotency key',
          message: `Idempotency key must be at least ${this.config.idempotency.keyLength} characters`
        });
      }

      const requestKey = this.generateRequestKey(req, idempotencyKey);
      const existingRecord = this.idempotencyStore.get(requestKey);

      if (existingRecord) {
        this.securityMetrics.idempotency.duplicateRequests++;
        
        if (existingRecord.completed) {
          // Return cached response
          return res.status(existingRecord.statusCode)
            .set(existingRecord.headers)
            .json(existingRecord.body);
        } else {
          // Request in progress
          return res.status(this.config.idempotency.conflictStatus).json({
            error: 'Request in progress',
            message: 'A request with this idempotency key is currently being processed'
          });
        }
      }

      // Create new idempotency record
      const record: IdempotencyRecord = {
        key: idempotencyKey,
        requestKey,
        method: req.method,
        path: req.path,
        body: req.body,
        headers: {},
        statusCode: 0,
        completed: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.config.idempotency.ttl * 1000)
      };

      this.idempotencyStore.set(requestKey, record);
      this.securityMetrics.idempotency.keysUsed++;

      // Intercept response to cache it
      const originalSend = res.send;
      const originalJson = res.json;

      res.send = function(body: any) {
        record.body = body;
        record.statusCode = res.statusCode;
        record.headers = { ...res.getHeaders() };
        record.completed = true;
        return originalSend.call(this, body);
      };

      res.json = function(body: any) {
        record.body = body;
        record.statusCode = res.statusCode;
        record.headers = { ...res.getHeaders() };
        record.completed = true;
        return originalJson.call(this, body);
      };

      next();
    };
  }

  private createCORSMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.cors.enabled) {
        return next();
      }

      const origin = req.headers.origin;
      let allowOrigin = false;

      if (typeof this.config.cors.origin === 'function') {
        allowOrigin = this.config.cors.origin(origin || '');
      } else if (Array.isArray(this.config.cors.origin)) {
        allowOrigin = this.config.cors.origin.includes(origin || '');
      } else {
        allowOrigin = this.config.cors.origin === origin;
      }

      if (allowOrigin && origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      if (this.config.cors.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      res.setHeader('Access-Control-Allow-Methods', this.config.cors.methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', this.config.cors.allowedHeaders.join(', '));
      res.setHeader('Access-Control-Expose-Headers', this.config.cors.exposedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', this.config.cors.maxAge.toString());

      if (req.method === 'OPTIONS') {
        return res.status(this.config.cors.optionsSuccessStatus).end();
      }

      next();
    };
  }

  private createCSRFMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.csrf.enabled) {
        return next();
      }

      if (this.config.csrf.ignoreMethods.includes(req.method)) {
        return next();
      }

      const token = this.config.csrf.value(req);
      
      if (!token || !this.csrfTokens.has(token)) {
        this.securityMetrics.requests.blocked++;
        return res.status(403).json({
          error: 'Invalid CSRF token',
          message: 'CSRF token is missing or invalid'
        });
      }

      this.securityMetrics.requests.csrfProtected++;
      next();
    };
  }

  private createContentSecurityMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.contentSecurity.enabled) {
        return next();
      }

      // Generate nonce for this request
      const nonce = this.generateNonce();
      this.nonceStore.set(req.ip + req.path, nonce);

      // Add nonce to res.locals for template rendering
      res.locals.cspNonce = nonce;

      // Set CSP header with nonce
      const cspHeader = this.buildCSPHeader(nonce);
      res.setHeader('Content-Security-Policy', cspHeader);

      next();
    };
  }

  // Helper Methods
  private buildCSPDirectives(): any {
    const directives: any = {};
    
    for (const [key, value] of Object.entries(this.config.headers.csp.directives)) {
      if (typeof value === 'boolean') {
        if (value) directives[this.camelToKebab(key)] = [];
      } else if (Array.isArray(value)) {
        directives[this.camelToKebab(key)] = value;
      }
    }

    return directives;
  }

  private buildCSPHeader(nonce: string): string {
    const directives = [];
    
    for (const [key, value] of Object.entries(this.config.headers.csp.directives)) {
      if (typeof value === 'boolean') {
        if (value) {
          directives.push(this.camelToKebab(key));
        }
      } else if (Array.isArray(value)) {
        const directiveValue = value
          .map(v => v.replace('{nonce}', nonce))
          .join(' ');
        directives.push(`${this.camelToKebab(key)} ${directiveValue}`);
      }
    }

    return directives.join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private findEndpointPattern(path: string): string | null {
    for (const endpoint of this.config.rateLimit.endpoints.keys()) {
      if (path.startsWith(endpoint)) {
        return endpoint;
      }
    }
    return null;
  }

  private generateRequestKey(req: Request, idempotencyKey: string): string {
    const payload = {
      method: req.method,
      path: req.path,
      body: req.body,
      key: idempotencyKey
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(payload, Object.keys(payload).sort()))
      .digest('hex');
  }

  private generateNonce(): string {
    return crypto
      .randomBytes(this.config.contentSecurity.nonce.length)
      .toString('base64');
  }

  private async setupRateLimiters(): Promise<void> {
    // Global rate limiter
    this.rateLimiters.set('global', rateLimit(this.config.rateLimit.global));

    // Endpoint-specific rate limiters
    for (const [endpoint, config] of this.config.rateLimit.endpoints) {
      this.rateLimiters.set(endpoint, rateLimit(config));
    }

    securityLogger.info('Rate limiters configured', {
      global: true,
      endpoints: this.config.rateLimit.endpoints.size
    });
  }

  private async setupSecurityMonitoring(): Promise<void> {
    // Monitor security metrics every minute
    setInterval(() => {
      this.logSecurityMetrics();
    }, 60000);

    securityLogger.info('Security monitoring enabled');
  }

  private async setupCleanupTasks(): Promise<void> {
    // Clean up expired idempotency records every 5 minutes
    setInterval(() => {
      this.cleanupIdempotencyRecords();
    }, 300000);

    // Clean up expired nonces every hour
    setInterval(() => {
      this.cleanupNonces();
    }, 3600000);

    securityLogger.info('Cleanup tasks scheduled');
  }

  private cleanupIdempotencyRecords(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [key, record] of this.idempotencyStore) {
      if (record.expiresAt < now) {
        this.idempotencyStore.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      securityLogger.info('Cleaned up expired idempotency records', { count: cleaned });
    }
  }

  private cleanupNonces(): void {
    // Simple cleanup - in production would track nonce creation time
    this.nonceStore.clear();
    securityLogger.info('Cleaned up CSP nonces');
  }

  private logSecurityMetrics(): void {
    securityLogger.info('Security metrics', this.securityMetrics);
  }

  // Public API Methods
  generateCSRFToken(): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.csrfTokens.add(token);
    
    // Clean up old tokens (keep last 1000)
    if (this.csrfTokens.size > 1000) {
      const tokensArray = Array.from(this.csrfTokens);
      this.csrfTokens = new Set(tokensArray.slice(-1000));
    }

    return token;
  }

  getSecurityMetrics(): SecurityMetrics {
    return { ...this.securityMetrics };
  }

  updateSecurityConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
    securityLogger.info('Security configuration updated');
  }

  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      securityHardening: 'operational',
      rateLimiters: this.rateLimiters.size,
      idempotencyRecords: this.idempotencyStore.size,
      csrfTokens: this.csrfTokens.size,
      nonceStore: this.nonceStore.size,
      tlsEnabled: this.config.tls.enabled,
      version: this.VERSION,
      timestamp: new Date().toISOString()
    };
  }
}

// Idempotency record interface
interface IdempotencyRecord {
  key: string;
  requestKey: string;
  method: string;
  path: string;
  body: any;
  headers: any;
  statusCode: number;
  completed: boolean;
  createdAt: Date;
  expiresAt: Date;
}

// Export singleton instance
export const securityHardeningManager = SecurityHardeningManager.getInstance();