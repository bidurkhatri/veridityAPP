/**
 * Webhook Security System
 * HMAC verification, API key scoping, rotation, and IP allowlists
 * Enterprise-grade webhook processing with comprehensive security
 */

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import winston from 'winston';

// Webhook Security Types
export interface WebhookSecurityConfig {
  hmac: HMACConfig;
  apiKeys: APIKeyConfig;
  ipAllowlist: IPAllowlistConfig;
  rateLimit: WebhookRateLimitConfig;
  replay: ReplayProtectionConfig;
  validation: WebhookValidationConfig;
  monitoring: WebhookMonitoringConfig;
}

export interface HMACConfig {
  enabled: boolean;
  algorithms: string[]; // ['sha256', 'sha512', etc.]
  headerName: string; // 'X-Hub-Signature-256'
  secretRotation: {
    enabled: boolean;
    intervalMs: number;
    gracePeriodMs: number; // Accept old secrets during rotation
  };
  tolerance: {
    timestampTolerance: number; // seconds
    bodyHashValidation: boolean;
  };
}

export interface APIKeyConfig {
  enabled: boolean;
  headerName: string; // 'X-API-Key'
  scoping: {
    enabled: boolean;
    scopeSeparator: string; // ':'
    defaultScopes: string[];
  };
  rotation: {
    enabled: boolean;
    intervalMs: number;
    gracePeriodMs: number;
    notificationWebhook?: string;
  };
  validation: {
    minLength: number;
    allowedCharacters: string;
    formatValidation: RegExp;
  };
}

export interface IPAllowlistConfig {
  enabled: boolean;
  mode: 'whitelist' | 'blacklist';
  ranges: IPRange[];
  cloudflare: {
    enabled: boolean;
    headerName: string; // 'CF-Connecting-IP'
  };
  proxy: {
    trusted: string[]; // Trusted proxy IPs
    headerName: string; // 'X-Forwarded-For'
  };
  geolocation: {
    enabled: boolean;
    allowedCountries: string[];
    blockedCountries: string[];
  };
}

export interface IPRange {
  start: string;
  end?: string;
  cidr?: string;
  description: string;
  type: 'single' | 'range' | 'cidr';
}

export interface WebhookRateLimitConfig {
  enabled: boolean;
  global: {
    requests: number;
    windowMs: number;
  };
  perEndpoint: Map<string, {
    requests: number;
    windowMs: number;
  }>;
  perIP: {
    requests: number;
    windowMs: number;
  };
  perAPIKey: {
    requests: number;
    windowMs: number;
  };
}

export interface ReplayProtectionConfig {
  enabled: boolean;
  methods: ('timestamp' | 'nonce' | 'sequence')[];
  timestamp: {
    headerName: string; // 'X-Timestamp'
    toleranceMs: number;
  };
  nonce: {
    headerName: string; // 'X-Nonce'
    storage: 'memory' | 'redis' | 'database';
    ttlMs: number;
  };
  sequence: {
    headerName: string; // 'X-Sequence'
    storage: 'memory' | 'redis' | 'database';
  };
}

export interface WebhookValidationConfig {
  enabled: boolean;
  contentType: {
    allowed: string[];
    strict: boolean;
  };
  bodySize: {
    maxBytes: number;
    minBytes: number;
  };
  headers: {
    required: string[];
    forbidden: string[];
    validation: Map<string, RegExp>;
  };
  payload: {
    jsonSchema?: any;
    customValidation?: (payload: any) => ValidationResult;
  };
}

export interface WebhookMonitoringConfig {
  enabled: boolean;
  metrics: {
    enabled: boolean;
    retention: number; // days
  };
  alerting: {
    enabled: boolean;
    thresholds: {
      failureRate: number; // percentage
      responseTime: number; // ms
      volumeSpike: number; // requests/minute
    };
    channels: AlertChannel[];
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    includePayload: boolean;
    includeHeaders: boolean;
    sanitization: string[]; // Fields to sanitize
  };
}

export interface AlertChannel {
  type: 'webhook' | 'email' | 'slack' | 'discord';
  endpoint: string;
  config: any;
  enabled: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WebhookRequest {
  id: string;
  timestamp: Date;
  method: string;
  path: string;
  headers: Record<string, string>;
  body: any;
  ip: string;
  userAgent?: string;
  apiKey?: string;
  hmacValid?: boolean;
  security: {
    ipAllowed: boolean;
    apiKeyValid: boolean;
    hmacVerified: boolean;
    replayProtected: boolean;
    rateLimited: boolean;
  };
  validation: ValidationResult;
  processing: {
    startTime: number;
    endTime?: number;
    duration?: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    response?: {
      statusCode: number;
      headers: Record<string, string>;
      body: any;
    };
  };
}

export interface APIKey {
  id: string;
  key: string;
  name: string;
  description: string;
  scopes: string[];
  rateLimits: {
    requests: number;
    windowMs: number;
  };
  ipRestrictions: string[];
  created: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  rotatedAt?: Date;
  status: 'active' | 'expired' | 'revoked' | 'rotating';
  metadata: {
    createdBy: string;
    environment: string;
    application: string;
  };
  usage: {
    totalRequests: number;
    lastDay: number;
    lastWeek: number;
    lastMonth: number;
  };
}

export interface WebhookSecret {
  id: string;
  secret: string;
  algorithm: string;
  created: Date;
  expiresAt: Date;
  status: 'active' | 'rotating' | 'expired';
  usage: {
    totalRequests: number;
    lastUsed?: Date;
  };
}

// Webhook security logger
const webhookLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/webhook-security.log' }),
    new winston.transports.Console()
  ]
});

export class WebhookSecurityManager {
  private static instance: WebhookSecurityManager;
  private config: WebhookSecurityConfig;
  private apiKeys: Map<string, APIKey> = new Map();
  private secrets: Map<string, WebhookSecret> = new Map();
  private requestHistory: Map<string, WebhookRequest> = new Map();
  private nonceStore: Set<string> = new Set();
  private sequenceNumbers: Map<string, number> = new Map();
  private rateLimitCounters: Map<string, { count: number; resetTime: number }> = new Map();
  private ipCache: Map<string, { allowed: boolean; timestamp: number }> = new Map();
  private readonly VERSION = '12.0.0-webhook-security';

  constructor() {
    this.config = this.createWebhookSecurityConfig();
    this.initializeWebhookSecurity();
  }

  static getInstance(): WebhookSecurityManager {
    if (!WebhookSecurityManager.instance) {
      WebhookSecurityManager.instance = new WebhookSecurityManager();
    }
    return WebhookSecurityManager.instance;
  }

  private createWebhookSecurityConfig(): WebhookSecurityConfig {
    return {
      hmac: {
        enabled: true,
        algorithms: ['sha256', 'sha512'],
        headerName: 'X-Hub-Signature-256',
        secretRotation: {
          enabled: true,
          intervalMs: 30 * 24 * 60 * 60 * 1000, // 30 days
          gracePeriodMs: 7 * 24 * 60 * 60 * 1000 // 7 days
        },
        tolerance: {
          timestampTolerance: 300, // 5 minutes
          bodyHashValidation: true
        }
      },
      apiKeys: {
        enabled: true,
        headerName: 'X-API-Key',
        scoping: {
          enabled: true,
          scopeSeparator: ':',
          defaultScopes: ['webhook:receive']
        },
        rotation: {
          enabled: true,
          intervalMs: 90 * 24 * 60 * 60 * 1000, // 90 days
          gracePeriodMs: 14 * 24 * 60 * 60 * 1000 // 14 days
        },
        validation: {
          minLength: 32,
          allowedCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
          formatValidation: /^[A-Za-z0-9]{32,}$/
        }
      },
      ipAllowlist: {
        enabled: true,
        mode: 'whitelist',
        ranges: [
          { start: '127.0.0.1', type: 'single', description: 'Localhost' },
          { cidr: '10.0.0.0/8', type: 'cidr', description: 'Private network' },
          { cidr: '172.16.0.0/12', type: 'cidr', description: 'Private network' },
          { cidr: '192.168.0.0/16', type: 'cidr', description: 'Private network' }
        ],
        cloudflare: {
          enabled: true,
          headerName: 'CF-Connecting-IP'
        },
        proxy: {
          trusted: ['127.0.0.1', '::1'],
          headerName: 'X-Forwarded-For'
        },
        geolocation: {
          enabled: false,
          allowedCountries: ['US', 'CA', 'GB', 'DE', 'FR'],
          blockedCountries: []
        }
      },
      rateLimit: {
        enabled: true,
        global: {
          requests: 10000,
          windowMs: 60 * 60 * 1000 // 1 hour
        },
        perEndpoint: new Map([
          ['/api/webhooks/identity', { requests: 1000, windowMs: 60 * 60 * 1000 }],
          ['/api/webhooks/payment', { requests: 500, windowMs: 60 * 60 * 1000 }]
        ]),
        perIP: {
          requests: 100,
          windowMs: 60 * 60 * 1000 // 1 hour
        },
        perAPIKey: {
          requests: 5000,
          windowMs: 60 * 60 * 1000 // 1 hour
        }
      },
      replay: {
        enabled: true,
        methods: ['timestamp', 'nonce'],
        timestamp: {
          headerName: 'X-Timestamp',
          toleranceMs: 300000 // 5 minutes
        },
        nonce: {
          headerName: 'X-Nonce',
          storage: 'memory',
          ttlMs: 3600000 // 1 hour
        },
        sequence: {
          headerName: 'X-Sequence',
          storage: 'memory'
        }
      },
      validation: {
        enabled: true,
        contentType: {
          allowed: ['application/json', 'application/x-www-form-urlencoded'],
          strict: true
        },
        bodySize: {
          maxBytes: 10 * 1024 * 1024, // 10MB
          minBytes: 1
        },
        headers: {
          required: ['Content-Type', 'User-Agent'],
          forbidden: ['X-Forwarded-Proto'],
          validation: new Map([
            ['User-Agent', /^[a-zA-Z0-9\s\-\.\(\)\/]+$/],
            ['Content-Length', /^\d+$/]
          ])
        },
        payload: {
          customValidation: this.customPayloadValidation
        }
      },
      monitoring: {
        enabled: true,
        metrics: {
          enabled: true,
          retention: 30 // days
        },
        alerting: {
          enabled: true,
          thresholds: {
            failureRate: 10, // 10%
            responseTime: 5000, // 5 seconds
            volumeSpike: 1000 // requests/minute
          },
          channels: []
        },
        logging: {
          level: 'info',
          includePayload: false, // Security: don't log sensitive data
          includeHeaders: true,
          sanitization: ['password', 'secret', 'token', 'key']
        }
      }
    };
  }

  private async initializeWebhookSecurity(): Promise<void> {
    webhookLogger.info('Initializing Webhook Security System', { 
      version: this.VERSION 
    });

    // Setup default secrets and API keys
    await this.setupDefaultCredentials();

    // Initialize cleanup tasks
    await this.setupCleanupTasks();

    // Setup monitoring
    await this.setupMonitoring();

    webhookLogger.info('Webhook Security System initialized successfully');
  }

  // Main Security Middleware
  createWebhookSecurityMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const startTime = performance.now();
      const requestId = crypto.randomUUID();
      
      const webhookRequest: WebhookRequest = {
        id: requestId,
        timestamp: new Date(),
        method: req.method,
        path: req.path,
        headers: { ...req.headers } as Record<string, string>,
        body: req.body,
        ip: this.extractClientIP(req),
        userAgent: req.get('User-Agent'),
        security: {
          ipAllowed: false,
          apiKeyValid: false,
          hmacVerified: false,
          replayProtected: false,
          rateLimited: false
        },
        validation: { valid: false, errors: [], warnings: [] },
        processing: {
          startTime,
          status: 'pending'
        }
      };

      try {
        webhookLogger.info('Processing webhook request', {
          requestId,
          method: req.method,
          path: req.path,
          ip: webhookRequest.ip
        });

        // 1. IP Allowlist Check
        if (this.config.ipAllowlist.enabled) {
          webhookRequest.security.ipAllowed = await this.validateIP(webhookRequest.ip);
          if (!webhookRequest.security.ipAllowed) {
            return this.rejectRequest(res, webhookRequest, 403, 'IP not allowed');
          }
        }

        // 2. Rate Limiting
        if (this.config.rateLimit.enabled) {
          const rateLimited = await this.checkRateLimit(req, webhookRequest);
          if (rateLimited) {
            webhookRequest.security.rateLimited = true;
            return this.rejectRequest(res, webhookRequest, 429, 'Rate limit exceeded');
          }
        }

        // 3. API Key Validation
        if (this.config.apiKeys.enabled) {
          const apiKeyResult = await this.validateAPIKey(req);
          webhookRequest.security.apiKeyValid = apiKeyResult.valid;
          webhookRequest.apiKey = apiKeyResult.key;
          
          if (!apiKeyResult.valid) {
            return this.rejectRequest(res, webhookRequest, 401, 'Invalid API key');
          }
        }

        // 4. HMAC Verification
        if (this.config.hmac.enabled) {
          webhookRequest.security.hmacVerified = await this.verifyHMAC(req);
          if (!webhookRequest.security.hmacVerified) {
            return this.rejectRequest(res, webhookRequest, 401, 'Invalid HMAC signature');
          }
        }

        // 5. Replay Protection
        if (this.config.replay.enabled) {
          webhookRequest.security.replayProtected = await this.checkReplayProtection(req);
          if (!webhookRequest.security.replayProtected) {
            return this.rejectRequest(res, webhookRequest, 400, 'Replay attack detected');
          }
        }

        // 6. Payload Validation
        if (this.config.validation.enabled) {
          webhookRequest.validation = await this.validateRequest(req);
          if (!webhookRequest.validation.valid) {
            return this.rejectRequest(res, webhookRequest, 400, 'Invalid request payload');
          }
        }

        // All checks passed
        webhookRequest.processing.status = 'processing';
        this.requestHistory.set(requestId, webhookRequest);

        // Add request context to response locals
        res.locals.webhookRequest = webhookRequest;
        res.locals.webhookSecurity = webhookRequest.security;

        webhookLogger.info('Webhook request authorized', {
          requestId,
          security: webhookRequest.security,
          processingTime: Math.round(performance.now() - startTime)
        });

        next();

      } catch (error) {
        webhookLogger.error('Webhook security error', {
          requestId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        this.rejectRequest(res, webhookRequest, 500, 'Security validation failed');
      }
    };
  }

  // IP Validation
  private async validateIP(ip: string): Promise<boolean> {
    // Check cache first
    const cached = this.ipCache.get(ip);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
      return cached.allowed;
    }

    let allowed = false;

    if (this.config.ipAllowlist.mode === 'whitelist') {
      allowed = this.isIPInAllowlist(ip);
    } else {
      allowed = !this.isIPInBlocklist(ip);
    }

    // Cache result
    this.ipCache.set(ip, { allowed, timestamp: Date.now() });

    return allowed;
  }

  private isIPInAllowlist(ip: string): boolean {
    for (const range of this.config.ipAllowlist.ranges) {
      if (this.isIPInRange(ip, range)) {
        return true;
      }
    }
    return false;
  }

  private isIPInBlocklist(ip: string): boolean {
    // Implementation would check against blocklist
    return false;
  }

  private isIPInRange(ip: string, range: IPRange): boolean {
    if (range.type === 'single') {
      return ip === range.start;
    }

    if (range.type === 'cidr' && range.cidr) {
      return this.isIPInCIDR(ip, range.cidr);
    }

    if (range.type === 'range' && range.end) {
      return this.isIPInIPRange(ip, range.start, range.end);
    }

    return false;
  }

  private isIPInCIDR(ip: string, cidr: string): boolean {
    // Simplified CIDR check - would use proper IP library in production
    const [network, prefix] = cidr.split('/');
    const prefixLength = parseInt(prefix, 10);
    
    // Convert IPs to integers and compare
    const ipInt = this.ipToInt(ip);
    const networkInt = this.ipToInt(network);
    const mask = ~(0xffffffff >>> prefixLength);
    
    return (ipInt & mask) === (networkInt & mask);
  }

  private isIPInIPRange(ip: string, start: string, end: string): boolean {
    const ipInt = this.ipToInt(ip);
    const startInt = this.ipToInt(start);
    const endInt = this.ipToInt(end);
    
    return ipInt >= startInt && ipInt <= endInt;
  }

  private ipToInt(ip: string): number {
    return ip.split('.').reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0) >>> 0;
  }

  // API Key Management
  async createAPIKey(config: {
    name: string;
    description: string;
    scopes: string[];
    rateLimits?: { requests: number; windowMs: number };
    ipRestrictions?: string[];
    expiresAt?: Date;
    metadata: { createdBy: string; environment: string; application: string };
  }): Promise<APIKey> {
    const key = crypto.randomBytes(32).toString('hex');
    const id = crypto.randomUUID();

    const apiKey: APIKey = {
      id,
      key,
      name: config.name,
      description: config.description,
      scopes: config.scopes,
      rateLimits: config.rateLimits || {
        requests: this.config.rateLimit.perAPIKey.requests,
        windowMs: this.config.rateLimit.perAPIKey.windowMs
      },
      ipRestrictions: config.ipRestrictions || [],
      created: new Date(),
      expiresAt: config.expiresAt,
      status: 'active',
      metadata: config.metadata,
      usage: {
        totalRequests: 0,
        lastDay: 0,
        lastWeek: 0,
        lastMonth: 0
      }
    };

    this.apiKeys.set(key, apiKey);

    webhookLogger.info('API key created', {
      id,
      name: config.name,
      scopes: config.scopes
    });

    return apiKey;
  }

  async rotateAPIKey(keyId: string): Promise<{ oldKey: string; newKey: string }> {
    const oldApiKey = Array.from(this.apiKeys.values()).find(k => k.id === keyId);
    if (!oldApiKey) {
      throw new Error('API key not found');
    }

    const newKey = crypto.randomBytes(32).toString('hex');
    const newApiKey: APIKey = {
      ...oldApiKey,
      key: newKey,
      rotatedAt: new Date(),
      status: 'active'
    };

    // Mark old key as rotating
    oldApiKey.status = 'rotating';

    // Add new key
    this.apiKeys.set(newKey, newApiKey);

    // Schedule old key removal after grace period
    setTimeout(() => {
      this.apiKeys.delete(oldApiKey.key);
      webhookLogger.info('Old API key removed after rotation', { keyId });
    }, this.config.apiKeys.rotation.gracePeriodMs);

    webhookLogger.info('API key rotated', {
      keyId,
      gracePeriodMs: this.config.apiKeys.rotation.gracePeriodMs
    });

    return { oldKey: oldApiKey.key, newKey };
  }

  private async validateAPIKey(req: Request): Promise<{ valid: boolean; key?: string; apiKey?: APIKey }> {
    const keyHeader = req.get(this.config.apiKeys.headerName);
    if (!keyHeader) {
      return { valid: false };
    }

    const apiKey = this.apiKeys.get(keyHeader);
    if (!apiKey) {
      return { valid: false };
    }

    // Check if key is expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false };
    }

    // Check if key is active
    if (apiKey.status !== 'active') {
      return { valid: false };
    }

    // Update usage statistics
    apiKey.usage.totalRequests++;
    apiKey.lastUsed = new Date();

    return { valid: true, key: keyHeader, apiKey };
  }

  // HMAC Verification
  private async verifyHMAC(req: Request): Promise<boolean> {
    const signature = req.get(this.config.hmac.headerName);
    if (!signature) {
      return false;
    }

    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    // Try all active secrets
    for (const [secretId, secret] of this.secrets) {
      if (secret.status === 'active' || secret.status === 'rotating') {
        const expectedSignature = this.calculateHMAC(body, secret.secret, secret.algorithm);
        
        if (this.secureCompare(signature, expectedSignature)) {
          secret.usage.totalRequests++;
          secret.usage.lastUsed = new Date();
          return true;
        }
      }
    }

    return false;
  }

  private calculateHMAC(body: string, secret: string, algorithm: string): string {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(body);
    return `${algorithm}=${hmac.digest('hex')}`;
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  // Rate Limiting
  private async checkRateLimit(req: Request, webhookRequest: WebhookRequest): Promise<boolean> {
    const now = Date.now();
    const checks = [
      { key: 'global', limit: this.config.rateLimit.global },
      { key: `ip:${webhookRequest.ip}`, limit: this.config.rateLimit.perIP },
      { key: `endpoint:${req.path}`, limit: this.config.rateLimit.perEndpoint.get(req.path) }
    ];

    if (webhookRequest.apiKey) {
      checks.push({ key: `apikey:${webhookRequest.apiKey}`, limit: this.config.rateLimit.perAPIKey });
    }

    for (const check of checks) {
      if (!check.limit) continue;

      const counter = this.rateLimitCounters.get(check.key);
      
      if (!counter || now > counter.resetTime) {
        // Reset counter
        this.rateLimitCounters.set(check.key, {
          count: 1,
          resetTime: now + check.limit.windowMs
        });
      } else {
        counter.count++;
        
        if (counter.count > check.limit.requests) {
          webhookLogger.warn('Rate limit exceeded', {
            key: check.key,
            count: counter.count,
            limit: check.limit.requests
          });
          return true;
        }
      }
    }

    return false;
  }

  // Replay Protection
  private async checkReplayProtection(req: Request): Promise<boolean> {
    for (const method of this.config.replay.methods) {
      const isProtected = await this.checkReplayMethod(req, method);
      if (!isProtected) {
        return false;
      }
    }
    return true;
  }

  private async checkReplayMethod(req: Request, method: string): Promise<boolean> {
    switch (method) {
      case 'timestamp':
        return this.checkTimestampReplay(req);
      case 'nonce':
        return this.checkNonceReplay(req);
      case 'sequence':
        return this.checkSequenceReplay(req);
      default:
        return true;
    }
  }

  private checkTimestampReplay(req: Request): boolean {
    const timestamp = req.get(this.config.replay.timestamp.headerName);
    if (!timestamp) {
      return false;
    }

    const requestTime = parseInt(timestamp, 10) * 1000; // Convert to ms
    const now = Date.now();
    const tolerance = this.config.replay.timestamp.toleranceMs;

    return Math.abs(now - requestTime) <= tolerance;
  }

  private checkNonceReplay(req: Request): boolean {
    const nonce = req.get(this.config.replay.nonce.headerName);
    if (!nonce) {
      return false;
    }

    if (this.nonceStore.has(nonce)) {
      return false; // Replay detected
    }

    this.nonceStore.add(nonce);

    // Clean up old nonces
    setTimeout(() => {
      this.nonceStore.delete(nonce);
    }, this.config.replay.nonce.ttlMs);

    return true;
  }

  private checkSequenceReplay(req: Request): boolean {
    const sequence = req.get(this.config.replay.sequence.headerName);
    const apiKey = req.get(this.config.apiKeys.headerName);
    
    if (!sequence || !apiKey) {
      return false;
    }

    const sequenceNum = parseInt(sequence, 10);
    const lastSequence = this.sequenceNumbers.get(apiKey) || 0;

    if (sequenceNum <= lastSequence) {
      return false; // Replay detected
    }

    this.sequenceNumbers.set(apiKey, sequenceNum);
    return true;
  }

  // Request Validation
  private async validateRequest(req: Request): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Content-Type validation
    const contentType = req.get('Content-Type');
    if (!contentType || !this.config.validation.contentType.allowed.includes(contentType.split(';')[0])) {
      errors.push(`Invalid Content-Type: ${contentType}`);
    }

    // Body size validation
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    if (contentLength > this.config.validation.bodySize.maxBytes) {
      errors.push(`Request body too large: ${contentLength} bytes`);
    }
    if (contentLength < this.config.validation.bodySize.minBytes) {
      errors.push(`Request body too small: ${contentLength} bytes`);
    }

    // Required headers validation
    for (const header of this.config.validation.headers.required) {
      if (!req.get(header)) {
        errors.push(`Missing required header: ${header}`);
      }
    }

    // Forbidden headers validation
    for (const header of this.config.validation.headers.forbidden) {
      if (req.get(header)) {
        errors.push(`Forbidden header present: ${header}`);
      }
    }

    // Header format validation
    for (const [header, pattern] of this.config.validation.headers.validation) {
      const value = req.get(header);
      if (value && !pattern.test(value)) {
        errors.push(`Invalid header format: ${header}`);
      }
    }

    // Custom payload validation
    if (this.config.validation.payload.customValidation) {
      const customResult = this.config.validation.payload.customValidation(req.body);
      errors.push(...customResult.errors);
      warnings.push(...customResult.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private customPayloadValidation(payload: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic payload structure validation
    if (!payload || typeof payload !== 'object') {
      errors.push('Payload must be a valid object');
      return { valid: false, errors, warnings };
    }

    // Check for required fields
    const requiredFields = ['event', 'data'];
    for (const field of requiredFields) {
      if (!(field in payload)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate event type
    if (payload.event && typeof payload.event !== 'string') {
      errors.push('Event field must be a string');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  // Helper Methods
  private extractClientIP(req: Request): string {
    // Check Cloudflare header first
    if (this.config.ipAllowlist.cloudflare.enabled) {
      const cfIP = req.get(this.config.ipAllowlist.cloudflare.headerName);
      if (cfIP) return cfIP;
    }

    // Check trusted proxy headers
    const forwardedFor = req.get(this.config.ipAllowlist.proxy.headerName);
    if (forwardedFor) {
      const ips = forwardedFor.split(',').map(ip => ip.trim());
      return ips[0]; // First IP is the client
    }

    return req.ip || req.connection.remoteAddress || '127.0.0.1';
  }

  private rejectRequest(
    res: Response, 
    webhookRequest: WebhookRequest, 
    statusCode: number, 
    message: string
  ): void {
    webhookRequest.processing.status = 'failed';
    webhookRequest.processing.endTime = performance.now();
    webhookRequest.processing.duration = webhookRequest.processing.endTime - webhookRequest.processing.startTime;

    webhookLogger.warn('Webhook request rejected', {
      requestId: webhookRequest.id,
      statusCode,
      message,
      security: webhookRequest.security,
      processingTime: Math.round(webhookRequest.processing.duration)
    });

    res.status(statusCode).json({
      error: message,
      requestId: webhookRequest.id,
      timestamp: new Date().toISOString()
    });
  }

  // Setup and Cleanup Methods
  private async setupDefaultCredentials(): Promise<void> {
    // Create default webhook secret
    const defaultSecret: WebhookSecret = {
      id: crypto.randomUUID(),
      secret: process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex'),
      algorithm: 'sha256',
      created: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      status: 'active',
      usage: { totalRequests: 0 }
    };

    this.secrets.set(defaultSecret.id, defaultSecret);

    // Create default API key for testing
    if (process.env.NODE_ENV === 'development') {
      await this.createAPIKey({
        name: 'Development Key',
        description: 'Default API key for development',
        scopes: ['webhook:receive', 'webhook:admin'],
        metadata: {
          createdBy: 'system',
          environment: 'development',
          application: 'veridity'
        }
      });
    }

    webhookLogger.info('Default webhook credentials configured');
  }

  private async setupCleanupTasks(): Promise<void> {
    // Cleanup expired rate limit counters every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, counter] of this.rateLimitCounters) {
        if (now > counter.resetTime) {
          this.rateLimitCounters.delete(key);
        }
      }
    }, 300000);

    // Cleanup IP cache every 10 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [ip, entry] of this.ipCache) {
        if (now - entry.timestamp > 600000) { // 10 minutes
          this.ipCache.delete(ip);
        }
      }
    }, 600000);

    webhookLogger.info('Webhook security cleanup tasks scheduled');
  }

  private async setupMonitoring(): Promise<void> {
    if (this.config.monitoring.enabled) {
      // Log metrics every minute
      setInterval(() => {
        this.logWebhookMetrics();
      }, 60000);
    }

    webhookLogger.info('Webhook security monitoring enabled');
  }

  private logWebhookMetrics(): void {
    const metrics = {
      apiKeys: this.apiKeys.size,
      secrets: this.secrets.size,
      activeRequests: Array.from(this.requestHistory.values()).filter(r => r.processing.status === 'processing').length,
      rateLimitCounters: this.rateLimitCounters.size,
      ipCache: this.ipCache.size,
      nonceStore: this.nonceStore.size
    };

    webhookLogger.info('Webhook security metrics', metrics);
  }

  // Public API Methods
  getWebhookMetrics() {
    return {
      security: {
        apiKeys: this.apiKeys.size,
        secrets: this.secrets.size,
        rateLimitCounters: this.rateLimitCounters.size,
        ipCache: this.ipCache.size
      },
      requests: {
        active: Array.from(this.requestHistory.values()).filter(r => r.processing.status === 'processing').length,
        total: this.requestHistory.size,
        completed: Array.from(this.requestHistory.values()).filter(r => r.processing.status === 'completed').length,
        failed: Array.from(this.requestHistory.values()).filter(r => r.processing.status === 'failed').length
      }
    };
  }

  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      webhookSecurity: 'operational',
      config: {
        hmacEnabled: this.config.hmac.enabled,
        apiKeysEnabled: this.config.apiKeys.enabled,
        ipAllowlistEnabled: this.config.ipAllowlist.enabled,
        rateLimitEnabled: this.config.rateLimit.enabled,
        replayProtectionEnabled: this.config.replay.enabled
      },
      metrics: this.getWebhookMetrics(),
      version: this.VERSION,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const webhookSecurityManager = WebhookSecurityManager.getInstance();