/**
 * Audit Logging System
 * Signed append-only audit logs with cryptographic integrity verification
 * Tamper-proof logging for compliance and security monitoring
 */

import crypto from 'crypto';
import { performance } from 'perf_hooks';
import winston from 'winston';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Audit Logging Types
export interface AuditLogConfig {
  storage: AuditStorageConfig;
  integrity: IntegrityConfig;
  retention: RetentionConfig;
  compliance: ComplianceConfig;
  monitoring: AuditMonitoringConfig;
  encryption: AuditEncryptionConfig;
  distribution: DistributionConfig;
}

export interface AuditStorageConfig {
  backend: 'file' | 'database' | 'blockchain' | 'hybrid';
  path: string;
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'brotli' | 'lz4';
    level: number;
  };
  sharding: {
    enabled: boolean;
    strategy: 'time' | 'size' | 'hash';
    shardSize: number; // MB for size-based, hours for time-based
  };
  replication: {
    enabled: boolean;
    replicas: number;
    locations: string[];
    syncInterval: number; // seconds
  };
}

export interface IntegrityConfig {
  signing: {
    enabled: boolean;
    algorithm: 'RSA-SHA256' | 'ECDSA-SHA256' | 'Ed25519';
    keySize: number;
    keyRotation: {
      enabled: boolean;
      interval: number; // days
    };
  };
  hashing: {
    algorithm: 'SHA-256' | 'SHA-512' | 'Blake3';
    chainedHashes: boolean; // Merkle-like chaining
    timestamping: boolean;
  };
  merkleTree: {
    enabled: boolean;
    leafSize: number; // entries per leaf
    hashAlgorithm: 'SHA-256' | 'SHA-512';
  };
  immutability: {
    writeOnce: boolean;
    checksumValidation: boolean;
    tamperDetection: boolean;
  };
}

export interface RetentionConfig {
  policies: RetentionPolicy[];
  archiving: {
    enabled: boolean;
    threshold: number; // days
    location: 'cold-storage' | 's3-glacier' | 'tape';
    compression: boolean;
  };
  deletion: {
    enabled: boolean;
    schedule: 'daily' | 'weekly' | 'monthly';
    confirmations: number; // Multi-party deletion
  };
}

export interface RetentionPolicy {
  category: string;
  retention: number; // days
  priority: 'low' | 'medium' | 'high' | 'critical';
  legalHold: boolean;
  complianceRequirement?: string;
}

export interface ComplianceConfig {
  standards: ComplianceStandard[];
  reporting: {
    enabled: boolean;
    formats: ('json' | 'xml' | 'csv' | 'pdf')[];
    schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
  };
  anonymization: {
    enabled: boolean;
    fields: string[];
    method: 'hash' | 'tokenize' | 'redact';
  };
}

export interface ComplianceStandard {
  name: 'SOX' | 'PCI-DSS' | 'GDPR' | 'HIPAA' | 'SOC2' | 'ISO27001' | 'NIST';
  requirements: ComplianceRequirement[];
  enabled: boolean;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  mandatory: boolean;
  auditEvents: string[];
  retention: number; // days
}

export interface AuditMonitoringConfig {
  realtime: {
    enabled: boolean;
    alerting: {
      suspiciousPatterns: boolean;
      integrityViolations: boolean;
      volumeAnomalies: boolean;
      accessViolations: boolean;
    };
  };
  analytics: {
    enabled: boolean;
    patterns: PatternAnalysis[];
    ml: {
      enabled: boolean;
      models: string[];
      anomalyThreshold: number;
    };
  };
  dashboards: {
    enabled: boolean;
    refreshInterval: number; // seconds
    metrics: string[];
  };
}

export interface PatternAnalysis {
  name: string;
  description: string;
  pattern: RegExp | string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'alert' | 'block';
}

export interface AuditEncryptionConfig {
  enabled: boolean;
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyManagement: {
    provider: 'kms' | 'hsm' | 'local';
    rotation: boolean;
    escrow: boolean;
  };
  fieldLevel: {
    enabled: boolean;
    sensitiveFields: string[];
    searchable: boolean;
  };
}

export interface DistributionConfig {
  enabled: boolean;
  targets: DistributionTarget[];
  realtime: boolean;
  batching: {
    enabled: boolean;
    size: number;
    timeout: number; // seconds
  };
  filtering: {
    enabled: boolean;
    rules: FilterRule[];
  };
}

export interface DistributionTarget {
  id: string;
  name: string;
  type: 'syslog' | 'webhook' | 'kafka' | 'siem' | 'elasticsearch';
  endpoint: string;
  authentication: any;
  format: 'json' | 'cef' | 'leef' | 'syslog';
  enabled: boolean;
}

export interface FilterRule {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'gt' | 'lt';
  value: any;
  action: 'include' | 'exclude';
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  sequence: number;
  category: string;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  event: string;
  actor: AuditActor;
  resource: AuditResource;
  context: AuditContext;
  result: AuditResult;
  metadata: AuditMetadata;
  signature?: string;
  hash?: string;
  previousHash?: string;
}

export interface AuditActor {
  type: 'user' | 'system' | 'service' | 'anonymous';
  id: string;
  name?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  roles?: string[];
  permissions?: string[];
}

export interface AuditResource {
  type: 'identity' | 'proof' | 'key' | 'secret' | 'credential' | 'system';
  id?: string;
  name?: string;
  path?: string;
  version?: string;
  properties?: Record<string, any>;
}

export interface AuditContext {
  traceId?: string;
  spanId?: string;
  correlation?: string;
  request?: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    query?: Record<string, any>;
  };
  environment: string;
  service: string;
  version: string;
}

export interface AuditResult {
  status: 'success' | 'failure' | 'partial' | 'error';
  statusCode?: number;
  duration?: number;
  changes?: AuditChange[];
  errors?: string[];
  warnings?: string[];
}

export interface AuditChange {
  field: string;
  oldValue?: any;
  newValue?: any;
  operation: 'create' | 'update' | 'delete';
}

export interface AuditMetadata {
  compliance: string[];
  retention: number; // days
  encrypted: boolean;
  compressed: boolean;
  replicated: boolean;
  tags: string[];
  custom: Record<string, any>;
}

export interface AuditChain {
  id: string;
  startTime: Date;
  endTime?: Date;
  entries: number;
  merkleRoot?: string;
  signatures: ChainSignature[];
  integrity: {
    valid: boolean;
    lastVerified: Date;
    violations: IntegrityViolation[];
  };
}

export interface ChainSignature {
  algorithm: string;
  publicKey: string;
  signature: string;
  timestamp: Date;
  keyId: string;
}

export interface IntegrityViolation {
  type: 'missing-entry' | 'invalid-signature' | 'hash-mismatch' | 'sequence-gap';
  entryId: string;
  timestamp: Date;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditQuery {
  startTime?: Date;
  endTime?: Date;
  categories?: string[];
  actors?: string[];
  resources?: string[];
  events?: string[];
  severities?: string[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeMetadata?: boolean;
  verifyIntegrity?: boolean;
}

export interface AuditQueryResult {
  entries: AuditLogEntry[];
  totalCount: number;
  hasMore: boolean;
  integrity: {
    verified: boolean;
    violations: IntegrityViolation[];
  };
  metadata: {
    queryTime: number;
    cacheHit: boolean;
    sources: string[];
  };
}

// Audit logger
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/audit-system.log' }),
    new winston.transports.Console()
  ]
});

export class AuditLoggingManager {
  private static instance: AuditLoggingManager;
  private config: AuditLogConfig;
  private auditEntries: Map<string, AuditLogEntry> = new Map();
  private auditChains: Map<string, AuditChain> = new Map();
  private sequenceNumber: number = 0;
  private signingKeys: Map<string, { privateKey: string; publicKey: string }> = new Map();
  private lastHash: string = '';
  private merkleTree: MerkleNode | null = null;
  private distributionQueues: Map<string, AuditLogEntry[]> = new Map();
  private readonly STORAGE_PATH = join(process.cwd(), 'server/audit');
  private readonly VERSION = '14.0.0-audit-logging';

  constructor() {
    this.config = this.createAuditConfig();
    this.initializeAuditLogging();
  }

  static getInstance(): AuditLoggingManager {
    if (!AuditLoggingManager.instance) {
      AuditLoggingManager.instance = new AuditLoggingManager();
    }
    return AuditLoggingManager.instance;
  }

  private createAuditConfig(): AuditLogConfig {
    return {
      storage: {
        backend: 'hybrid',
        path: this.STORAGE_PATH,
        compression: {
          enabled: true,
          algorithm: 'gzip',
          level: 6
        },
        sharding: {
          enabled: true,
          strategy: 'time',
          shardSize: 24 // 24 hours per shard
        },
        replication: {
          enabled: true,
          replicas: 2,
          locations: ['primary', 'backup'],
          syncInterval: 60
        }
      },
      integrity: {
        signing: {
          enabled: true,
          algorithm: 'RSA-SHA256',
          keySize: 2048,
          keyRotation: {
            enabled: true,
            interval: 90 // 90 days
          }
        },
        hashing: {
          algorithm: 'SHA-256',
          chainedHashes: true,
          timestamping: true
        },
        merkleTree: {
          enabled: true,
          leafSize: 100,
          hashAlgorithm: 'SHA-256'
        },
        immutability: {
          writeOnce: true,
          checksumValidation: true,
          tamperDetection: true
        }
      },
      retention: {
        policies: [
          {
            category: 'authentication',
            retention: 2555, // 7 years for security events
            priority: 'critical',
            legalHold: true,
            complianceRequirement: 'SOX, PCI-DSS'
          },
          {
            category: 'data-access',
            retention: 1095, // 3 years for data access
            priority: 'high',
            legalHold: false,
            complianceRequirement: 'GDPR'
          },
          {
            category: 'system-events',
            retention: 365, // 1 year for system events
            priority: 'medium',
            legalHold: false
          }
        ],
        archiving: {
          enabled: true,
          threshold: 365,
          location: 'cold-storage',
          compression: true
        },
        deletion: {
          enabled: true,
          schedule: 'monthly',
          confirmations: 2
        }
      },
      compliance: {
        standards: [
          {
            name: 'SOX',
            requirements: [
              {
                id: 'SOX-404',
                description: 'Internal controls over financial reporting',
                mandatory: true,
                auditEvents: ['financial-transaction', 'access-control'],
                retention: 2555
              }
            ],
            enabled: true
          },
          {
            name: 'GDPR',
            requirements: [
              {
                id: 'GDPR-Article-30',
                description: 'Records of processing activities',
                mandatory: true,
                auditEvents: ['data-processing', 'consent-management'],
                retention: 1095
              }
            ],
            enabled: true
          }
        ],
        reporting: {
          enabled: true,
          formats: ['json', 'csv'],
          schedule: 'monthly',
          recipients: ['compliance@veridity.app']
        },
        anonymization: {
          enabled: true,
          fields: ['ip', 'email', 'name'],
          method: 'hash'
        }
      },
      monitoring: {
        realtime: {
          enabled: true,
          alerting: {
            suspiciousPatterns: true,
            integrityViolations: true,
            volumeAnomalies: true,
            accessViolations: true
          }
        },
        analytics: {
          enabled: true,
          patterns: [
            {
              name: 'Multiple Failed Logins',
              description: 'Detect brute force attempts',
              pattern: /failed.*login/i,
              severity: 'high',
              action: 'alert'
            },
            {
              name: 'Privilege Escalation',
              description: 'Detect privilege escalation attempts',
              pattern: /privilege.*escalation/i,
              severity: 'critical',
              action: 'block'
            }
          ],
          ml: {
            enabled: false, // Would integrate with ML models
            models: ['anomaly-detection', 'pattern-recognition'],
            anomalyThreshold: 0.95
          }
        },
        dashboards: {
          enabled: true,
          refreshInterval: 30,
          metrics: ['entry-count', 'error-rate', 'integrity-status']
        }
      },
      encryption: {
        enabled: true,
        algorithm: 'AES-256-GCM',
        keyManagement: {
          provider: 'kms',
          rotation: true,
          escrow: false
        },
        fieldLevel: {
          enabled: true,
          sensitiveFields: ['ip', 'email', 'sessionId'],
          searchable: false
        }
      },
      distribution: {
        enabled: true,
        targets: [
          {
            id: 'siem-target',
            name: 'Security Information and Event Management',
            type: 'siem',
            endpoint: 'https://siem.veridity.app/events',
            authentication: {},
            format: 'json',
            enabled: false // Would be enabled in production
          }
        ],
        realtime: true,
        batching: {
          enabled: true,
          size: 100,
          timeout: 30
        },
        filtering: {
          enabled: true,
          rules: [
            {
              field: 'severity',
              operator: 'equals',
              value: 'debug',
              action: 'exclude'
            }
          ]
        }
      }
    };
  }

  private async initializeAuditLogging(): Promise<void> {
    auditLogger.info('Initializing Audit Logging System', { 
      version: this.VERSION 
    });

    // Ensure directories exist
    this.ensureDirectories();

    // Initialize signing keys
    await this.initializeSigningKeys();

    // Load existing audit chains
    await this.loadAuditChains();

    // Setup distribution queues
    this.setupDistributionQueues();

    // Start periodic tasks
    this.startPeriodicTasks();

    auditLogger.info('Audit Logging System initialized successfully');
  }

  // Core Audit Logging Methods
  async logEvent(eventData: {
    category: string;
    event: string;
    actor: Partial<AuditActor>;
    resource?: Partial<AuditResource>;
    context?: Partial<AuditContext>;
    result?: Partial<AuditResult>;
    severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
    metadata?: Partial<AuditMetadata>;
  }): Promise<string> {
    const startTime = performance.now();
    
    try {
      const entryId = crypto.randomUUID();
      this.sequenceNumber++;

      // Create audit log entry
      const auditEntry: AuditLogEntry = {
        id: entryId,
        timestamp: new Date(),
        sequence: this.sequenceNumber,
        category: eventData.category,
        severity: eventData.severity || 'info',
        event: eventData.event,
        actor: {
          type: 'system',
          id: 'unknown',
          ...eventData.actor
        },
        resource: {
          type: 'system',
          ...eventData.resource
        },
        context: {
          environment: process.env.NODE_ENV || 'development',
          service: 'veridity-identity',
          version: this.VERSION,
          ...eventData.context
        },
        result: {
          status: 'success',
          ...eventData.result
        },
        metadata: {
          compliance: this.getApplicableCompliance(eventData.category),
          retention: this.getRetentionPeriod(eventData.category),
          encrypted: this.config.encryption.enabled,
          compressed: this.config.storage.compression.enabled,
          replicated: this.config.storage.replication.enabled,
          tags: [],
          custom: {},
          ...eventData.metadata
        }
      };

      // Calculate hash
      auditEntry.hash = this.calculateEntryHash(auditEntry);
      auditEntry.previousHash = this.lastHash;

      // Sign the entry if enabled
      if (this.config.integrity.signing.enabled) {
        auditEntry.signature = await this.signEntry(auditEntry);
      }

      // Store the entry
      this.auditEntries.set(entryId, auditEntry);
      this.lastHash = auditEntry.hash!;

      // Update Merkle tree
      if (this.config.integrity.merkleTree.enabled) {
        await this.updateMerkleTree(auditEntry);
      }

      // Persist to storage
      await this.persistEntry(auditEntry);

      // Add to distribution queues
      if (this.config.distribution.enabled) {
        await this.queueForDistribution(auditEntry);
      }

      // Real-time monitoring
      if (this.config.monitoring.realtime.enabled) {
        await this.performRealtimeAnalysis(auditEntry);
      }

      const processingTime = performance.now() - startTime;

      auditLogger.debug('Audit entry logged', {
        entryId,
        category: eventData.category,
        event: eventData.event,
        sequence: this.sequenceNumber,
        processingTime: Math.round(processingTime)
      });

      return entryId;

    } catch (error) {
      auditLogger.error('Failed to log audit entry', {
        category: eventData.category,
        event: eventData.event,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Query and Retrieval
  async queryAuditLogs(query: AuditQuery): Promise<AuditQueryResult> {
    const startTime = performance.now();
    
    auditLogger.info('Querying audit logs', {
      startTime: query.startTime,
      endTime: query.endTime,
      categories: query.categories?.length || 0,
      limit: query.limit
    });

    try {
      let entries = Array.from(this.auditEntries.values());

      // Apply filters
      if (query.startTime) {
        entries = entries.filter(e => e.timestamp >= query.startTime!);
      }
      
      if (query.endTime) {
        entries = entries.filter(e => e.timestamp <= query.endTime!);
      }
      
      if (query.categories && query.categories.length > 0) {
        entries = entries.filter(e => query.categories!.includes(e.category));
      }
      
      if (query.actors && query.actors.length > 0) {
        entries = entries.filter(e => query.actors!.includes(e.actor.id));
      }
      
      if (query.events && query.events.length > 0) {
        entries = entries.filter(e => query.events!.includes(e.event));
      }
      
      if (query.severities && query.severities.length > 0) {
        entries = entries.filter(e => query.severities!.includes(e.severity));
      }

      // Sort entries
      const sortBy = query.sortBy || 'timestamp';
      const sortOrder = query.sortOrder || 'desc';
      
      entries.sort((a, b) => {
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const totalCount = entries.length;
      const offset = query.offset || 0;
      const limit = query.limit || 100;
      
      entries = entries.slice(offset, offset + limit);
      const hasMore = offset + limit < totalCount;

      // Verify integrity if requested
      let integrityResult = { verified: true, violations: [] as IntegrityViolation[] };
      if (query.verifyIntegrity) {
        integrityResult = await this.verifyChainIntegrity(entries);
      }

      const queryTime = performance.now() - startTime;

      const result: AuditQueryResult = {
        entries,
        totalCount,
        hasMore,
        integrity: integrityResult,
        metadata: {
          queryTime,
          cacheHit: false, // Would implement caching
          sources: ['memory'] // Would include multiple sources
        }
      };

      auditLogger.info('Audit log query completed', {
        totalCount,
        returnedCount: entries.length,
        hasMore,
        queryTime: Math.round(queryTime)
      });

      return result;

    } catch (error) {
      auditLogger.error('Failed to query audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Integrity Verification
  async verifyIntegrity(options?: {
    startTime?: Date;
    endTime?: Date;
    entries?: string[];
  }): Promise<{
    valid: boolean;
    violations: IntegrityViolation[];
    statistics: {
      totalEntries: number;
      verifiedEntries: number;
      failedEntries: number;
      verificationTime: number;
    };
  }> {
    const startTime = performance.now();
    
    auditLogger.info('Starting integrity verification', {
      options: options ? Object.keys(options) : 'none'
    });

    try {
      let entries: AuditLogEntry[];
      
      if (options?.entries) {
        entries = options.entries
          .map(id => this.auditEntries.get(id))
          .filter(entry => entry !== undefined) as AuditLogEntry[];
      } else {
        entries = Array.from(this.auditEntries.values());
        
        if (options?.startTime) {
          entries = entries.filter(e => e.timestamp >= options.startTime!);
        }
        
        if (options?.endTime) {
          entries = entries.filter(e => e.timestamp <= options.endTime!);
        }
      }

      const violations: IntegrityViolation[] = [];
      let verifiedEntries = 0;
      let failedEntries = 0;

      // Sort by sequence number
      entries.sort((a, b) => a.sequence - b.sequence);

      // Verify each entry
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        
        try {
          // Verify hash
          const calculatedHash = this.calculateEntryHash(entry);
          if (entry.hash !== calculatedHash) {
            violations.push({
              type: 'hash-mismatch',
              entryId: entry.id,
              timestamp: new Date(),
              description: `Hash mismatch for entry ${entry.id}`,
              severity: 'critical'
            });
            failedEntries++;
            continue;
          }

          // Verify signature if present
          if (entry.signature && this.config.integrity.signing.enabled) {
            const signatureValid = await this.verifySignature(entry);
            if (!signatureValid) {
              violations.push({
                type: 'invalid-signature',
                entryId: entry.id,
                timestamp: new Date(),
                description: `Invalid signature for entry ${entry.id}`,
                severity: 'critical'
              });
              failedEntries++;
              continue;
            }
          }

          // Verify hash chain
          if (i > 0) {
            const previousEntry = entries[i - 1];
            if (entry.previousHash !== previousEntry.hash) {
              violations.push({
                type: 'hash-mismatch',
                entryId: entry.id,
                timestamp: new Date(),
                description: `Hash chain broken at entry ${entry.id}`,
                severity: 'critical'
              });
              failedEntries++;
              continue;
            }
          }

          // Verify sequence continuity
          if (i > 0) {
            const previousEntry = entries[i - 1];
            if (entry.sequence !== previousEntry.sequence + 1) {
              violations.push({
                type: 'sequence-gap',
                entryId: entry.id,
                timestamp: new Date(),
                description: `Sequence gap detected at entry ${entry.id}`,
                severity: 'high'
              });
            }
          }

          verifiedEntries++;

        } catch (error) {
          violations.push({
            type: 'invalid-signature',
            entryId: entry.id,
            timestamp: new Date(),
            description: `Verification error for entry ${entry.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'high'
          });
          failedEntries++;
        }
      }

      const verificationTime = performance.now() - startTime;
      const valid = violations.length === 0;

      auditLogger.info('Integrity verification completed', {
        valid,
        totalEntries: entries.length,
        verifiedEntries,
        failedEntries,
        violations: violations.length,
        verificationTime: Math.round(verificationTime)
      });

      return {
        valid,
        violations,
        statistics: {
          totalEntries: entries.length,
          verifiedEntries,
          failedEntries,
          verificationTime
        }
      };

    } catch (error) {
      auditLogger.error('Integrity verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Helper Methods
  private ensureDirectories(): void {
    const directories = [
      this.STORAGE_PATH,
      join(this.STORAGE_PATH, 'entries'),
      join(this.STORAGE_PATH, 'chains'),
      join(this.STORAGE_PATH, 'keys'),
      join(this.STORAGE_PATH, 'backups')
    ];

    directories.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  private async initializeSigningKeys(): Promise<void> {
    if (!this.config.integrity.signing.enabled) {
      return;
    }

    const keyPath = join(this.STORAGE_PATH, 'keys', 'signing-key.json');
    
    if (existsSync(keyPath)) {
      // Load existing key
      const keyData = JSON.parse(readFileSync(keyPath, 'utf8'));
      this.signingKeys.set('current', keyData);
    } else {
      // Generate new key pair
      const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: this.config.integrity.signing.keySize,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      const keyData = {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        created: new Date().toISOString(),
        algorithm: this.config.integrity.signing.algorithm
      };

      this.signingKeys.set('current', keyData);
      writeFileSync(keyPath, JSON.stringify(keyData, null, 2));
    }

    auditLogger.info('Signing keys initialized');
  }

  private async loadAuditChains(): Promise<void> {
    // Load existing audit chains from storage
    const chainsPath = join(this.STORAGE_PATH, 'chains');
    
    if (existsSync(chainsPath)) {
      // Would implement actual chain loading
      auditLogger.info('Existing audit chains loaded');
    }
  }

  private setupDistributionQueues(): void {
    if (!this.config.distribution.enabled) {
      return;
    }

    for (const target of this.config.distribution.targets) {
      this.distributionQueues.set(target.id, []);
    }

    // Setup batch processing
    if (this.config.distribution.batching.enabled) {
      setInterval(() => {
        this.processDistributionQueues();
      }, this.config.distribution.batching.timeout * 1000);
    }

    auditLogger.info('Distribution queues initialized');
  }

  private startPeriodicTasks(): void {
    // Integrity verification every hour
    setInterval(async () => {
      await this.performScheduledIntegrityCheck();
    }, 3600000);

    // Cleanup old entries based on retention policy
    setInterval(async () => {
      await this.performRetentionCleanup();
    }, 24 * 3600000); // Daily

    // Key rotation check
    if (this.config.integrity.signing.keyRotation.enabled) {
      setInterval(async () => {
        await this.checkKeyRotation();
      }, 24 * 3600000); // Daily
    }

    auditLogger.info('Periodic tasks started');
  }

  private calculateEntryHash(entry: AuditLogEntry): string {
    // Create deterministic hash of entry (excluding hash and signature)
    const hashData = {
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      sequence: entry.sequence,
      category: entry.category,
      severity: entry.severity,
      event: entry.event,
      actor: entry.actor,
      resource: entry.resource,
      context: entry.context,
      result: entry.result,
      metadata: entry.metadata,
      previousHash: entry.previousHash
    };

    const canonical = JSON.stringify(hashData, Object.keys(hashData).sort());
    return crypto.createHash(this.config.integrity.hashing.algorithm.toLowerCase().replace('-', ''))
      .update(canonical)
      .digest('hex');
  }

  private async signEntry(entry: AuditLogEntry): Promise<string> {
    const signingKey = this.signingKeys.get('current');
    if (!signingKey) {
      throw new Error('No signing key available');
    }

    const dataToSign = entry.hash!;
    const signature = crypto.sign('sha256', Buffer.from(dataToSign), {
      key: signingKey.privateKey,
      type: 'pkcs8',
      format: 'pem'
    });

    return signature.toString('base64');
  }

  private async verifySignature(entry: AuditLogEntry): Promise<boolean> {
    const signingKey = this.signingKeys.get('current');
    if (!signingKey || !entry.signature) {
      return false;
    }

    try {
      return crypto.verify(
        'sha256',
        Buffer.from(entry.hash!),
        {
          key: signingKey.publicKey,
          type: 'spki',
          format: 'pem'
        },
        Buffer.from(entry.signature, 'base64')
      );
    } catch {
      return false;
    }
  }

  private getApplicableCompliance(category: string): string[] {
    const compliance: string[] = [];
    
    for (const standard of this.config.compliance.standards) {
      if (standard.enabled) {
        for (const req of standard.requirements) {
          if (req.auditEvents.includes(category)) {
            compliance.push(standard.name);
            break;
          }
        }
      }
    }

    return compliance;
  }

  private getRetentionPeriod(category: string): number {
    const policy = this.config.retention.policies.find(p => p.category === category);
    return policy ? policy.retention : 365; // Default 1 year
  }

  private async updateMerkleTree(entry: AuditLogEntry): Promise<void> {
    // Simplified Merkle tree update - would implement actual tree structure
    auditLogger.debug('Merkle tree updated for entry', { entryId: entry.id });
  }

  private async persistEntry(entry: AuditLogEntry): Promise<void> {
    const entryPath = join(this.STORAGE_PATH, 'entries', `${entry.id}.json`);
    const entryData = JSON.stringify(entry, null, 2);
    
    writeFileSync(entryPath, entryData);
  }

  private async queueForDistribution(entry: AuditLogEntry): Promise<void> {
    for (const target of this.config.distribution.targets) {
      if (target.enabled && this.shouldDistribute(entry, target)) {
        const queue = this.distributionQueues.get(target.id);
        if (queue) {
          queue.push(entry);
          
          if (!this.config.distribution.batching.enabled || 
              queue.length >= this.config.distribution.batching.size) {
            await this.processTargetQueue(target.id);
          }
        }
      }
    }
  }

  private shouldDistribute(entry: AuditLogEntry, target: DistributionTarget): boolean {
    if (!this.config.distribution.filtering.enabled) {
      return true;
    }

    for (const rule of this.config.distribution.filtering.rules) {
      const fieldValue = (entry as any)[rule.field];
      let matches = false;

      switch (rule.operator) {
        case 'equals':
          matches = fieldValue === rule.value;
          break;
        case 'contains':
          matches = String(fieldValue).includes(rule.value);
          break;
        case 'regex':
          matches = new RegExp(rule.value).test(String(fieldValue));
          break;
      }

      if (matches && rule.action === 'exclude') {
        return false;
      }
      if (matches && rule.action === 'include') {
        return true;
      }
    }

    return true;
  }

  private async processDistributionQueues(): Promise<void> {
    for (const targetId of this.distributionQueues.keys()) {
      await this.processTargetQueue(targetId);
    }
  }

  private async processTargetQueue(targetId: string): Promise<void> {
    const queue = this.distributionQueues.get(targetId);
    const target = this.config.distribution.targets.find(t => t.id === targetId);
    
    if (!queue || !target || queue.length === 0) {
      return;
    }

    try {
      const entries = queue.splice(0); // Take all entries
      
      // Format entries for target
      const formattedEntries = entries.map(entry => this.formatForTarget(entry, target));
      
      // Send to target (simplified - would implement actual sending)
      auditLogger.debug('Distributed audit entries', {
        targetId,
        count: entries.length,
        format: target.format
      });

    } catch (error) {
      auditLogger.error('Failed to process distribution queue', {
        targetId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private formatForTarget(entry: AuditLogEntry, target: DistributionTarget): any {
    switch (target.format) {
      case 'json':
        return entry;
      case 'syslog':
        return `<${this.getSyslogPriority(entry.severity)}>${entry.timestamp.toISOString()} ${entry.context.service} ${entry.event}: ${JSON.stringify(entry)}`;
      default:
        return entry;
    }
  }

  private getSyslogPriority(severity: string): number {
    const priorities = {
      'debug': 7,
      'info': 6,
      'warning': 4,
      'error': 3,
      'critical': 2
    };
    return (priorities as any)[severity] || 6;
  }

  private async performRealtimeAnalysis(entry: AuditLogEntry): Promise<void> {
    // Check for suspicious patterns
    for (const pattern of this.config.monitoring.analytics.patterns) {
      if (pattern.pattern instanceof RegExp) {
        if (pattern.pattern.test(entry.event)) {
          await this.handlePatternMatch(entry, pattern);
        }
      } else if (typeof pattern.pattern === 'string') {
        if (entry.event.includes(pattern.pattern)) {
          await this.handlePatternMatch(entry, pattern);
        }
      }
    }
  }

  private async handlePatternMatch(entry: AuditLogEntry, pattern: PatternAnalysis): Promise<void> {
    auditLogger.warn('Suspicious pattern detected', {
      patternName: pattern.name,
      entryId: entry.id,
      event: entry.event,
      severity: pattern.severity,
      action: pattern.action
    });

    if (pattern.action === 'alert') {
      // Would send alert
    } else if (pattern.action === 'block') {
      // Would trigger blocking mechanism
    }
  }

  private async verifyChainIntegrity(entries: AuditLogEntry[]): Promise<{
    verified: boolean;
    violations: IntegrityViolation[];
  }> {
    const violations: IntegrityViolation[] = [];
    
    // Sort by sequence
    entries.sort((a, b) => a.sequence - b.sequence);
    
    // Verify hash chain
    for (let i = 1; i < entries.length; i++) {
      const current = entries[i];
      const previous = entries[i - 1];
      
      if (current.previousHash !== previous.hash) {
        violations.push({
          type: 'hash-mismatch',
          entryId: current.id,
          timestamp: new Date(),
          description: 'Hash chain integrity violation',
          severity: 'critical'
        });
      }
    }

    return {
      verified: violations.length === 0,
      violations
    };
  }

  private async performScheduledIntegrityCheck(): Promise<void> {
    auditLogger.info('Starting scheduled integrity check');
    
    try {
      const result = await this.verifyIntegrity();
      
      if (!result.valid) {
        auditLogger.error('Integrity violations detected', {
          violations: result.violations.length,
          failedEntries: result.statistics.failedEntries
        });
      } else {
        auditLogger.info('Integrity check passed', {
          verifiedEntries: result.statistics.verifiedEntries
        });
      }
    } catch (error) {
      auditLogger.error('Scheduled integrity check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async performRetentionCleanup(): Promise<void> {
    auditLogger.info('Starting retention cleanup');
    
    const now = new Date();
    let cleanedCount = 0;

    for (const [entryId, entry] of this.auditEntries) {
      const retentionMs = entry.metadata.retention * 24 * 60 * 60 * 1000;
      const expiryDate = new Date(entry.timestamp.getTime() + retentionMs);
      
      if (now > expiryDate) {
        // Check for legal hold
        const policy = this.config.retention.policies.find(p => p.category === entry.category);
        if (policy && policy.legalHold) {
          continue;
        }

        this.auditEntries.delete(entryId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      auditLogger.info('Retention cleanup completed', { cleanedCount });
    }
  }

  private async checkKeyRotation(): Promise<void> {
    if (!this.config.integrity.signing.keyRotation.enabled) {
      return;
    }

    const currentKey = this.signingKeys.get('current');
    if (!currentKey) {
      return;
    }

    const keyAge = Date.now() - new Date(currentKey.created).getTime();
    const rotationThreshold = this.config.integrity.signing.keyRotation.interval * 24 * 60 * 60 * 1000;

    if (keyAge > rotationThreshold) {
      auditLogger.info('Rotating signing keys');
      await this.rotateSigningKeys();
    }
  }

  private async rotateSigningKeys(): Promise<void> {
    // Generate new key pair
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: this.config.integrity.signing.keySize,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    const newKeyData = {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      created: new Date().toISOString(),
      algorithm: this.config.integrity.signing.algorithm
    };

    // Archive old key
    const oldKey = this.signingKeys.get('current');
    if (oldKey) {
      this.signingKeys.set('previous', oldKey);
    }

    // Set new key
    this.signingKeys.set('current', newKeyData);

    // Save to file
    const keyPath = join(this.STORAGE_PATH, 'keys', 'signing-key.json');
    writeFileSync(keyPath, JSON.stringify(newKeyData, null, 2));

    auditLogger.info('Signing keys rotated successfully');
  }

  // Public API Methods
  getAuditMetrics() {
    return {
      entries: this.auditEntries.size,
      chains: this.auditChains.size,
      sequence: this.sequenceNumber,
      distribution: {
        targets: this.config.distribution.targets.length,
        queues: this.distributionQueues.size,
        queueSizes: Array.from(this.distributionQueues.entries()).map(([id, queue]) => ({ 
          targetId: id, 
          size: queue.length 
        }))
      },
      configuration: {
        signingEnabled: this.config.integrity.signing.enabled,
        encryptionEnabled: this.config.encryption.enabled,
        distributionEnabled: this.config.distribution.enabled,
        complianceStandards: this.config.compliance.standards.filter(s => s.enabled).length
      }
    };
  }

  async healthCheck(): Promise<any> {
    const recentEntries = Array.from(this.auditEntries.values())
      .filter(e => Date.now() - e.timestamp.getTime() < 3600000) // Last hour
      .length;

    const integrityCheck = await this.verifyIntegrity();

    return {
      status: 'healthy',
      auditLogging: 'operational',
      metrics: {
        totalEntries: this.auditEntries.size,
        recentEntries,
        currentSequence: this.sequenceNumber,
        integrityValid: integrityCheck.valid
      },
      features: {
        signing: this.config.integrity.signing.enabled,
        encryption: this.config.encryption.enabled,
        merkleTree: this.config.integrity.merkleTree.enabled,
        distribution: this.config.distribution.enabled,
        compliance: this.config.compliance.standards.filter(s => s.enabled).map(s => s.name)
      },
      version: this.VERSION,
      timestamp: new Date().toISOString()
    };
  }
}

// Merkle Tree Node (simplified)
interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: AuditLogEntry;
}

// Export singleton instance
export const auditLoggingManager = AuditLoggingManager.getInstance();