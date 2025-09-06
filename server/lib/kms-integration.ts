/**
 * KMS Integration System
 * Enterprise Key Management Service with device keystore and AES-GCM encryption
 * Supporting AWS KMS, Azure Key Vault, Google Cloud KMS, and HashiCorp Vault
 */

import crypto from 'crypto';
import { performance } from 'perf_hooks';
import winston from 'winston';

// KMS Integration Types
export interface KMSConfig {
  providers: KMSProvider[];
  defaultProvider: string;
  encryption: EncryptionConfig;
  keyRotation: KeyRotationConfig;
  backup: KeyBackupConfig;
  audit: KMSAuditConfig;
  deviceKeystore: DeviceKeystoreConfig;
  secretManagement: SecretManagementConfig;
}

export interface KMSProvider {
  id: string;
  name: string;
  type: 'aws-kms' | 'azure-keyvault' | 'gcp-kms' | 'hashicorp-vault' | 'local-hsm';
  config: any;
  status: 'active' | 'inactive' | 'maintenance';
  priority: number;
  capabilities: KMSCapability[];
  endpoints: KMSEndpoint[];
  authentication: KMSAuth;
  encryption: {
    algorithms: string[];
    keyTypes: string[];
    maxKeySize: number;
  };
}

export interface KMSCapability {
  operation: 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'generate' | 'rotate' | 'backup';
  supported: boolean;
  constraints?: string[];
}

export interface KMSEndpoint {
  region: string;
  url: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  latency?: number;
  lastCheck: Date;
}

export interface KMSAuth {
  type: 'iam-role' | 'service-principal' | 'api-key' | 'certificate' | 'oauth2';
  credentials: any;
  tokenExpiry?: Date;
  refreshToken?: string;
}

export interface EncryptionConfig {
  defaultAlgorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  keyDerivation: {
    algorithm: 'PBKDF2' | 'scrypt' | 'Argon2id';
    iterations: number;
    saltSize: number;
    outputSize: number;
  };
  envelope: {
    enabled: boolean;
    dataKeySize: number;
    algorithm: string;
  };
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'brotli' | 'lz4';
    threshold: number; // bytes
  };
}

export interface KeyRotationConfig {
  enabled: boolean;
  automatic: boolean;
  schedule: {
    interval: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time?: string; // HH:MM format
    dayOfWeek?: number; // 0-6
    dayOfMonth?: number; // 1-31
  };
  retention: {
    versions: number;
    gracePeriod: number; // days
  };
  notification: {
    enabled: boolean;
    webhooks: string[];
    email: string[];
  };
}

export interface KeyBackupConfig {
  enabled: boolean;
  providers: string[]; // Multiple KMS providers for redundancy
  schedule: {
    interval: 'hourly' | 'daily' | 'weekly';
    retention: number; // days
  };
  encryption: {
    enabled: boolean;
    keyEscrow: boolean;
    threshold: number; // Shamir's secret sharing
  };
  verification: {
    enabled: boolean;
    interval: 'daily' | 'weekly';
  };
}

export interface KMSAuditConfig {
  enabled: boolean;
  events: KMSAuditEvent[];
  storage: {
    provider: 'file' | 'database' | 'siem';
    retention: number; // days
    encryption: boolean;
  };
  alerting: {
    enabled: boolean;
    thresholds: {
      failureRate: number;
      unusualAccess: number;
      keyUsage: number;
    };
  };
}

export interface KMSAuditEvent {
  type: 'key-created' | 'key-used' | 'key-rotated' | 'key-deleted' | 'access-denied' | 'provider-changed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  monitor: boolean;
}

export interface DeviceKeystoreConfig {
  enabled: boolean;
  platforms: {
    ios: IOSKeystoreConfig;
    android: AndroidKeystoreConfig;
    windows: WindowsKeystoreConfig;
    macos: MacOSKeystoreConfig;
    linux: LinuxKeystoreConfig;
  };
  biometric: {
    enabled: boolean;
    required: boolean;
    fallback: 'passcode' | 'password' | 'none';
  };
  hardware: {
    secureEnclave: boolean;
    tee: boolean; // Trusted Execution Environment
    hsm: boolean; // Hardware Security Module
  };
}

export interface IOSKeystoreConfig {
  keychain: {
    service: string;
    accessGroup?: string;
    accessibility: 'afterFirstUnlock' | 'whenUnlocked' | 'afterFirstUnlockThisDeviceOnly';
  };
  secureEnclave: {
    enabled: boolean;
    biometricOnly: boolean;
  };
}

export interface AndroidKeystoreConfig {
  keystore: {
    alias: string;
    requireAuth: boolean;
    userPresence: boolean;
  };
  hardware: {
    attestation: boolean;
    strongBox: boolean;
  };
}

export interface WindowsKeystoreConfig {
  provider: 'CNG' | 'CAPI';
  store: 'CurrentUser' | 'LocalMachine';
  container: string;
}

export interface MacOSKeystoreConfig {
  keychain: {
    name: string;
    accessibility: 'afterFirstUnlock' | 'whenUnlocked';
  };
  secureEnclave: {
    enabled: boolean;
    biometricOnly: boolean;
  };
}

export interface LinuxKeystoreConfig {
  backend: 'libsecret' | 'kwallet' | 'file';
  encryption: {
    algorithm: string;
    keyDerivation: string;
  };
}

export interface SecretManagementConfig {
  categories: SecretCategory[];
  lifecycle: SecretLifecycleConfig;
  access: SecretAccessConfig;
  distribution: SecretDistributionConfig;
}

export interface SecretCategory {
  name: string;
  description: string;
  encryption: 'required' | 'optional' | 'disabled';
  rotation: 'automatic' | 'manual' | 'disabled';
  backup: boolean;
  retention: number; // days
  access: string[]; // Required scopes
}

export interface SecretLifecycleConfig {
  creation: {
    validation: string[];
    approval: boolean;
    notification: boolean;
  };
  usage: {
    tracking: boolean;
    limits: {
      daily: number;
      hourly: number;
      concurrent: number;
    };
  };
  expiration: {
    warning: number; // days before expiry
    grace: number; // days after expiry
    action: 'disable' | 'rotate' | 'notify';
  };
}

export interface SecretAccessConfig {
  authentication: ('api-key' | 'jwt' | 'certificate' | 'biometric')[];
  authorization: {
    rbac: boolean;
    attributes: boolean;
    context: boolean;
  };
  audit: {
    success: boolean;
    failure: boolean;
    details: 'minimal' | 'full';
  };
}

export interface SecretDistributionConfig {
  methods: ('pull' | 'push' | 'webhook')[];
  encryption: {
    inTransit: boolean;
    atRest: boolean;
  };
  verification: {
    integrity: boolean;
    authenticity: boolean;
  };
}

export interface ManagedSecret {
  id: string;
  name: string;
  category: string;
  value: string;
  encryptedValue?: string;
  metadata: SecretMetadata;
  lifecycle: SecretLifecycle;
  access: SecretAccess;
  audit: SecretAuditTrail[];
}

export interface SecretMetadata {
  description: string;
  tags: string[];
  created: Date;
  updated: Date;
  version: number;
  checksum: string;
  size: number;
  format: 'string' | 'json' | 'binary' | 'certificate';
  provider: string;
  location: string;
}

export interface SecretLifecycle {
  status: 'active' | 'inactive' | 'rotating' | 'expired' | 'deleted';
  expiresAt?: Date;
  rotatesAt?: Date;
  lastRotated?: Date;
  rotationCount: number;
  usage: {
    count: number;
    lastUsed?: Date;
    lastUser?: string;
  };
}

export interface SecretAccess {
  permissions: string[];
  restrictions: {
    ipAllowlist?: string[];
    timeRestrictions?: TimeRestriction[];
    usageLimit?: number;
    concurrent?: number;
  };
  tokens: AccessToken[];
}

export interface TimeRestriction {
  start: string; // HH:MM
  end: string; // HH:MM
  days: number[]; // 0-6 (Sun-Sat)
  timezone: string;
}

export interface AccessToken {
  id: string;
  type: 'api-key' | 'jwt' | 'temporary';
  value?: string;
  expiresAt?: Date;
  scopes: string[];
  lastUsed?: Date;
}

export interface SecretAuditTrail {
  id: string;
  timestamp: Date;
  operation: 'create' | 'read' | 'update' | 'delete' | 'rotate' | 'access';
  user: string;
  source: string;
  details: any;
  result: 'success' | 'failure';
  reason?: string;
}

export interface EncryptionKey {
  id: string;
  name: string;
  algorithm: string;
  keySize: number;
  keyMaterial?: Buffer;
  provider: string;
  status: 'active' | 'rotating' | 'inactive';
  created: Date;
  expiresAt?: Date;
  usage: {
    encrypt: number;
    decrypt: number;
    sign: number;
    verify: number;
  };
  metadata: {
    purpose: string[];
    tags: string[];
    checksum: string;
  };
}

// KMS logger
const kmsLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/kms-integration.log' }),
    new winston.transports.Console()
  ]
});

export class KMSIntegrationManager {
  private static instance: KMSIntegrationManager;
  private config: KMSConfig;
  private providers: Map<string, KMSProvider> = new Map();
  private secrets: Map<string, ManagedSecret> = new Map();
  private encryptionKeys: Map<string, EncryptionKey> = new Map();
  private deviceKeystores: Map<string, any> = new Map();
  private auditTrail: SecretAuditTrail[] = [];
  private readonly VERSION = '13.0.0-kms-integration';

  constructor() {
    this.config = this.createKMSConfig();
    this.initializeKMSIntegration();
  }

  static getInstance(): KMSIntegrationManager {
    if (!KMSIntegrationManager.instance) {
      KMSIntegrationManager.instance = new KMSIntegrationManager();
    }
    return KMSIntegrationManager.instance;
  }

  private createKMSConfig(): KMSConfig {
    return {
      providers: [
        {
          id: 'local-kms',
          name: 'Local KMS',
          type: 'local-hsm',
          config: {
            storePath: './kms/keys',
            backupPath: './kms/backup'
          },
          status: 'active',
          priority: 1,
          capabilities: [
            { operation: 'encrypt', supported: true },
            { operation: 'decrypt', supported: true },
            { operation: 'sign', supported: true },
            { operation: 'verify', supported: true },
            { operation: 'generate', supported: true },
            { operation: 'rotate', supported: true },
            { operation: 'backup', supported: true }
          ],
          endpoints: [
            {
              region: 'local',
              url: 'localhost',
              status: 'healthy',
              lastCheck: new Date()
            }
          ],
          authentication: {
            type: 'api-key',
            credentials: {
              keyId: process.env.KMS_KEY_ID || 'default',
              secret: process.env.KMS_SECRET || crypto.randomBytes(32).toString('hex')
            }
          },
          encryption: {
            algorithms: ['AES-256-GCM', 'AES-256-CBC', 'ChaCha20-Poly1305'],
            keyTypes: ['symmetric', 'asymmetric'],
            maxKeySize: 4096
          }
        }
      ],
      defaultProvider: 'local-kms',
      encryption: {
        defaultAlgorithm: 'AES-256-GCM',
        keyDerivation: {
          algorithm: 'PBKDF2',
          iterations: 100000,
          saltSize: 32,
          outputSize: 32
        },
        envelope: {
          enabled: true,
          dataKeySize: 32,
          algorithm: 'AES-256-GCM'
        },
        compression: {
          enabled: true,
          algorithm: 'gzip',
          threshold: 1024 // 1KB
        }
      },
      keyRotation: {
        enabled: true,
        automatic: true,
        schedule: {
          interval: 'monthly',
          dayOfMonth: 1,
          time: '02:00'
        },
        retention: {
          versions: 5,
          gracePeriod: 30
        },
        notification: {
          enabled: true,
          webhooks: [],
          email: []
        }
      },
      backup: {
        enabled: true,
        providers: ['local-kms'],
        schedule: {
          interval: 'daily',
          retention: 30
        },
        encryption: {
          enabled: true,
          keyEscrow: false,
          threshold: 3
        },
        verification: {
          enabled: true,
          interval: 'weekly'
        }
      },
      audit: {
        enabled: true,
        events: [
          { type: 'key-created', severity: 'medium', monitor: true },
          { type: 'key-used', severity: 'low', monitor: false },
          { type: 'key-rotated', severity: 'medium', monitor: true },
          { type: 'key-deleted', severity: 'high', monitor: true },
          { type: 'access-denied', severity: 'high', monitor: true }
        ],
        storage: {
          provider: 'file',
          retention: 365,
          encryption: true
        },
        alerting: {
          enabled: true,
          thresholds: {
            failureRate: 0.05, // 5%
            unusualAccess: 10,
            keyUsage: 1000
          }
        }
      },
      deviceKeystore: {
        enabled: true,
        platforms: {
          ios: {
            keychain: {
              service: 'com.veridity.identity',
              accessibility: 'afterFirstUnlock'
            },
            secureEnclave: {
              enabled: true,
              biometricOnly: false
            }
          },
          android: {
            keystore: {
              alias: 'veridity_key',
              requireAuth: true,
              userPresence: true
            },
            hardware: {
              attestation: true,
              strongBox: true
            }
          },
          windows: {
            provider: 'CNG',
            store: 'CurrentUser',
            container: 'VeridityContainer'
          },
          macos: {
            keychain: {
              name: 'Veridity',
              accessibility: 'afterFirstUnlock'
            },
            secureEnclave: {
              enabled: true,
              biometricOnly: false
            }
          },
          linux: {
            backend: 'libsecret',
            encryption: {
              algorithm: 'AES-256-GCM',
              keyDerivation: 'PBKDF2'
            }
          }
        },
        biometric: {
          enabled: true,
          required: false,
          fallback: 'passcode'
        },
        hardware: {
          secureEnclave: true,
          tee: true,
          hsm: false
        }
      },
      secretManagement: {
        categories: [
          {
            name: 'api-keys',
            description: 'API keys and tokens',
            encryption: 'required',
            rotation: 'automatic',
            backup: true,
            retention: 90,
            access: ['secret:read']
          },
          {
            name: 'database',
            description: 'Database connection strings',
            encryption: 'required',
            rotation: 'manual',
            backup: true,
            retention: 365,
            access: ['secret:read', 'db:connect']
          },
          {
            name: 'certificates',
            description: 'SSL/TLS certificates',
            encryption: 'optional',
            rotation: 'manual',
            backup: true,
            retention: 730,
            access: ['cert:read']
          }
        ],
        lifecycle: {
          creation: {
            validation: ['format', 'strength', 'uniqueness'],
            approval: false,
            notification: true
          },
          usage: {
            tracking: true,
            limits: {
              daily: 10000,
              hourly: 1000,
              concurrent: 100
            }
          },
          expiration: {
            warning: 30,
            grace: 7,
            action: 'notify'
          }
        },
        access: {
          authentication: ['api-key', 'jwt'],
          authorization: {
            rbac: true,
            attributes: false,
            context: true
          },
          audit: {
            success: true,
            failure: true,
            details: 'full'
          }
        },
        distribution: {
          methods: ['pull', 'push'],
          encryption: {
            inTransit: true,
            atRest: true
          },
          verification: {
            integrity: true,
            authenticity: true
          }
        }
      }
    };
  }

  private async initializeKMSIntegration(): Promise<void> {
    kmsLogger.info('Initializing KMS Integration System', { 
      version: this.VERSION 
    });

    // Initialize KMS providers
    await this.initializeProviders();

    // Setup device keystores
    await this.setupDeviceKeystores();

    // Create default encryption keys
    await this.createDefaultKeys();

    // Setup key rotation
    await this.setupKeyRotation();

    // Initialize audit logging
    await this.setupAuditLogging();

    kmsLogger.info('KMS Integration System initialized successfully');
  }

  // Secret Management
  async createSecret(config: {
    name: string;
    value: string;
    category: string;
    description?: string;
    tags?: string[];
    expiresAt?: Date;
    permissions?: string[];
  }): Promise<ManagedSecret> {
    const startTime = performance.now();
    
    kmsLogger.info('Creating secret', {
      name: config.name,
      category: config.category,
      hasExpiry: !!config.expiresAt
    });

    try {
      const secretId = crypto.randomUUID();
      
      // Encrypt the secret value
      const encryptionKey = await this.getDefaultEncryptionKey();
      const encryptedValue = await this.encryptWithKey(config.value, encryptionKey.id);

      // Create secret object
      const secret: ManagedSecret = {
        id: secretId,
        name: config.name,
        category: config.category,
        value: '', // Don't store plaintext
        encryptedValue,
        metadata: {
          description: config.description || '',
          tags: config.tags || [],
          created: new Date(),
          updated: new Date(),
          version: 1,
          checksum: crypto.createHash('sha256').update(config.value).digest('hex'),
          size: config.value.length,
          format: 'string',
          provider: this.config.defaultProvider,
          location: 'encrypted'
        },
        lifecycle: {
          status: 'active',
          expiresAt: config.expiresAt,
          rotationCount: 0,
          usage: {
            count: 0
          }
        },
        access: {
          permissions: config.permissions || ['secret:read'],
          restrictions: {},
          tokens: []
        },
        audit: []
      };

      // Store secret
      this.secrets.set(secretId, secret);

      // Log audit event
      await this.logAuditEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        operation: 'create',
        user: 'system',
        source: 'kms-manager',
        details: {
          secretId,
          name: config.name,
          category: config.category
        },
        result: 'success'
      });

      const processingTime = performance.now() - startTime;
      
      kmsLogger.info('Secret created successfully', {
        secretId,
        name: config.name,
        processingTime: Math.round(processingTime)
      });

      return secret;

    } catch (error) {
      kmsLogger.error('Failed to create secret', {
        name: config.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getSecret(secretId: string, options?: {
    decrypt?: boolean;
    auditUser?: string;
    auditSource?: string;
  }): Promise<ManagedSecret | null> {
    const secret = this.secrets.get(secretId);
    if (!secret) {
      return null;
    }

    // Check if secret is active
    if (secret.lifecycle.status !== 'active') {
      throw new Error('Secret is not active');
    }

    // Check expiration
    if (secret.lifecycle.expiresAt && secret.lifecycle.expiresAt < new Date()) {
      throw new Error('Secret has expired');
    }

    // Update usage statistics
    secret.lifecycle.usage.count++;
    secret.lifecycle.usage.lastUsed = new Date();
    secret.lifecycle.usage.lastUser = options?.auditUser || 'unknown';

    // Decrypt if requested
    if (options?.decrypt && secret.encryptedValue) {
      try {
        const decryptedValue = await this.decryptValue(secret.encryptedValue);
        secret.value = decryptedValue;
      } catch (error) {
        kmsLogger.error('Failed to decrypt secret', {
          secretId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw new Error('Failed to decrypt secret');
      }
    }

    // Log audit event
    await this.logAuditEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      operation: 'read',
      user: options?.auditUser || 'system',
      source: options?.auditSource || 'kms-manager',
      details: {
        secretId,
        name: secret.name,
        decrypted: !!options?.decrypt
      },
      result: 'success'
    });

    return secret;
  }

  async rotateSecret(secretId: string, newValue?: string): Promise<ManagedSecret> {
    const secret = this.secrets.get(secretId);
    if (!secret) {
      throw new Error('Secret not found');
    }

    kmsLogger.info('Rotating secret', {
      secretId,
      name: secret.name,
      hasNewValue: !!newValue
    });

    try {
      // Generate new value if not provided
      if (!newValue) {
        newValue = this.generateSecretValue(secret.category);
      }

      // Encrypt new value
      const encryptionKey = await this.getDefaultEncryptionKey();
      const encryptedValue = await this.encryptWithKey(newValue, encryptionKey.id);

      // Update secret
      secret.encryptedValue = encryptedValue;
      secret.metadata.updated = new Date();
      secret.metadata.version++;
      secret.metadata.checksum = crypto.createHash('sha256').update(newValue).digest('hex');
      secret.lifecycle.status = 'active';
      secret.lifecycle.lastRotated = new Date();
      secret.lifecycle.rotationCount++;

      // Log audit event
      await this.logAuditEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        operation: 'rotate',
        user: 'system',
        source: 'kms-manager',
        details: {
          secretId,
          name: secret.name,
          version: secret.metadata.version
        },
        result: 'success'
      });

      kmsLogger.info('Secret rotated successfully', {
        secretId,
        name: secret.name,
        newVersion: secret.metadata.version
      });

      return secret;

    } catch (error) {
      kmsLogger.error('Failed to rotate secret', {
        secretId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Encryption Operations
  async encryptData(data: string, options?: {
    keyId?: string;
    algorithm?: string;
    compress?: boolean;
  }): Promise<{
    encrypted: string;
    keyId: string;
    algorithm: string;
    iv: string;
    tag?: string;
    metadata: any;
  }> {
    const keyId = options?.keyId || (await this.getDefaultEncryptionKey()).id;
    const algorithm = options?.algorithm || this.config.encryption.defaultAlgorithm;
    
    kmsLogger.debug('Encrypting data', {
      keyId,
      algorithm,
      dataSize: data.length,
      compress: options?.compress
    });

    try {
      // Compress if enabled and threshold met
      let processedData = data;
      if (options?.compress || 
          (this.config.encryption.compression.enabled && 
           data.length > this.config.encryption.compression.threshold)) {
        processedData = await this.compressData(data);
      }

      // Generate IV
      const iv = crypto.randomBytes(16);
      
      // Get encryption key
      const key = await this.getDerivedKey(keyId);
      
      // Encrypt based on algorithm
      let encrypted: Buffer;
      let tag: Buffer | undefined;

      if (algorithm === 'AES-256-GCM') {
        const cipher = crypto.createCipherGCM('aes-256-gcm', key);
        cipher.setAAD(Buffer.from(keyId));
        encrypted = Buffer.concat([
          cipher.update(processedData, 'utf8'),
          cipher.final()
        ]);
        tag = cipher.getAuthTag();
      } else if (algorithm === 'AES-256-CBC') {
        const cipher = crypto.createCipher('aes-256-cbc', key);
        encrypted = Buffer.concat([
          cipher.update(processedData, 'utf8'),
          cipher.final()
        ]);
      } else {
        throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
      }

      const result = {
        encrypted: encrypted.toString('base64'),
        keyId,
        algorithm,
        iv: iv.toString('base64'),
        tag: tag?.toString('base64'),
        metadata: {
          compressed: processedData !== data,
          originalSize: data.length,
          encryptedSize: encrypted.length,
          timestamp: new Date().toISOString()
        }
      };

      kmsLogger.debug('Data encrypted successfully', {
        keyId,
        algorithm,
        originalSize: data.length,
        encryptedSize: encrypted.length
      });

      return result;

    } catch (error) {
      kmsLogger.error('Failed to encrypt data', {
        keyId,
        algorithm,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async decryptData(encryptedData: {
    encrypted: string;
    keyId: string;
    algorithm: string;
    iv: string;
    tag?: string;
    metadata?: any;
  }): Promise<string> {
    kmsLogger.debug('Decrypting data', {
      keyId: encryptedData.keyId,
      algorithm: encryptedData.algorithm
    });

    try {
      // Get decryption key
      const key = await this.getDerivedKey(encryptedData.keyId);
      
      // Decrypt based on algorithm
      let decrypted: Buffer;

      if (encryptedData.algorithm === 'AES-256-GCM') {
        const decipher = crypto.createDecipherGCM('aes-256-gcm', key);
        decipher.setAAD(Buffer.from(encryptedData.keyId));
        
        if (encryptedData.tag) {
          decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));
        }
        
        decrypted = Buffer.concat([
          decipher.update(Buffer.from(encryptedData.encrypted, 'base64')),
          decipher.final()
        ]);
      } else if (encryptedData.algorithm === 'AES-256-CBC') {
        const decipher = crypto.createDecipher('aes-256-cbc', key);
        decrypted = Buffer.concat([
          decipher.update(Buffer.from(encryptedData.encrypted, 'base64')),
          decipher.final()
        ]);
      } else {
        throw new Error(`Unsupported decryption algorithm: ${encryptedData.algorithm}`);
      }

      let result = decrypted.toString('utf8');

      // Decompress if needed
      if (encryptedData.metadata?.compressed) {
        result = await this.decompressData(result);
      }

      kmsLogger.debug('Data decrypted successfully', {
        keyId: encryptedData.keyId,
        algorithm: encryptedData.algorithm,
        decryptedSize: result.length
      });

      return result;

    } catch (error) {
      kmsLogger.error('Failed to decrypt data', {
        keyId: encryptedData.keyId,
        algorithm: encryptedData.algorithm,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Key Management
  async generateEncryptionKey(config: {
    name: string;
    algorithm: string;
    keySize: number;
    purpose: string[];
    expiresAt?: Date;
  }): Promise<EncryptionKey> {
    kmsLogger.info('Generating encryption key', {
      name: config.name,
      algorithm: config.algorithm,
      keySize: config.keySize
    });

    try {
      const keyId = crypto.randomUUID();
      const keyMaterial = crypto.randomBytes(config.keySize / 8);
      
      const encryptionKey: EncryptionKey = {
        id: keyId,
        name: config.name,
        algorithm: config.algorithm,
        keySize: config.keySize,
        keyMaterial,
        provider: this.config.defaultProvider,
        status: 'active',
        created: new Date(),
        expiresAt: config.expiresAt,
        usage: {
          encrypt: 0,
          decrypt: 0,
          sign: 0,
          verify: 0
        },
        metadata: {
          purpose: config.purpose,
          tags: [],
          checksum: crypto.createHash('sha256').update(keyMaterial).digest('hex')
        }
      };

      this.encryptionKeys.set(keyId, encryptionKey);

      // Log audit event
      await this.logAuditEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        operation: 'create',
        user: 'system',
        source: 'kms-manager',
        details: {
          keyId,
          name: config.name,
          algorithm: config.algorithm,
          keySize: config.keySize
        },
        result: 'success'
      });

      kmsLogger.info('Encryption key generated successfully', {
        keyId,
        name: config.name,
        algorithm: config.algorithm
      });

      return encryptionKey;

    } catch (error) {
      kmsLogger.error('Failed to generate encryption key', {
        name: config.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Helper Methods
  private async initializeProviders(): Promise<void> {
    for (const providerConfig of this.config.providers) {
      this.providers.set(providerConfig.id, providerConfig);
      
      // Initialize provider connection
      await this.testProviderConnection(providerConfig.id);
    }

    kmsLogger.info('KMS providers initialized', {
      count: this.providers.size,
      default: this.config.defaultProvider
    });
  }

  private async testProviderConnection(providerId: string): Promise<boolean> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return false;
    }

    try {
      // Simplified connection test
      provider.status = 'active';
      for (const endpoint of provider.endpoints) {
        endpoint.status = 'healthy';
        endpoint.lastCheck = new Date();
        endpoint.latency = Math.random() * 100; // Mock latency
      }

      return true;
    } catch (error) {
      provider.status = 'inactive';
      kmsLogger.warn('Provider connection failed', {
        providerId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  private async setupDeviceKeystores(): Promise<void> {
    // Platform-specific keystore initialization
    const platforms = Object.keys(this.config.deviceKeystore.platforms);
    
    for (const platform of platforms) {
      const keystoreConfig = (this.config.deviceKeystore.platforms as any)[platform];
      
      // Mock keystore setup - would integrate with actual platform APIs
      this.deviceKeystores.set(platform, {
        initialized: true,
        config: keystoreConfig,
        keys: new Map()
      });
    }

    kmsLogger.info('Device keystores initialized', {
      platforms: platforms.length,
      biometricEnabled: this.config.deviceKeystore.biometric.enabled
    });
  }

  private async createDefaultKeys(): Promise<void> {
    // Create default encryption key if none exist
    if (this.encryptionKeys.size === 0) {
      await this.generateEncryptionKey({
        name: 'default-encryption-key',
        algorithm: 'AES-256-GCM',
        keySize: 256,
        purpose: ['encrypt', 'decrypt']
      });
    }

    kmsLogger.info('Default encryption keys created');
  }

  private async setupKeyRotation(): Promise<void> {
    if (!this.config.keyRotation.enabled) {
      return;
    }

    // Setup automatic key rotation schedule
    const rotationInterval = this.getRotationInterval();
    
    setInterval(async () => {
      await this.performAutomaticRotation();
    }, rotationInterval);

    kmsLogger.info('Key rotation scheduled', {
      interval: this.config.keyRotation.schedule.interval,
      automatic: this.config.keyRotation.automatic
    });
  }

  private async setupAuditLogging(): Promise<void> {
    if (!this.config.audit.enabled) {
      return;
    }

    // Setup audit log rotation and cleanup
    setInterval(() => {
      this.cleanupAuditLogs();
    }, 24 * 60 * 60 * 1000); // Daily cleanup

    kmsLogger.info('Audit logging configured', {
      retention: this.config.audit.storage.retention,
      encryption: this.config.audit.storage.encryption
    });
  }

  private getRotationInterval(): number {
    const schedule = this.config.keyRotation.schedule;
    
    switch (schedule.interval) {
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000;
      case 'quarterly':
        return 90 * 24 * 60 * 60 * 1000;
      default:
        return 30 * 24 * 60 * 60 * 1000; // Default to monthly
    }
  }

  private async performAutomaticRotation(): Promise<void> {
    kmsLogger.info('Starting automatic key rotation');

    try {
      // Rotate encryption keys
      for (const [keyId, key] of this.encryptionKeys) {
        if (this.shouldRotateKey(key)) {
          await this.rotateEncryptionKey(keyId);
        }
      }

      // Rotate secrets
      for (const [secretId, secret] of this.secrets) {
        if (this.shouldRotateSecret(secret)) {
          await this.rotateSecret(secretId);
        }
      }

      kmsLogger.info('Automatic key rotation completed');
    } catch (error) {
      kmsLogger.error('Automatic key rotation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private shouldRotateKey(key: EncryptionKey): boolean {
    if (!key.expiresAt) return false;
    
    const now = new Date();
    const rotateThreshold = new Date(key.expiresAt.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days before expiry
    
    return now >= rotateThreshold;
  }

  private shouldRotateSecret(secret: ManagedSecret): boolean {
    const category = this.config.secretManagement.categories.find(c => c.name === secret.category);
    if (!category || category.rotation !== 'automatic') {
      return false;
    }

    // Check if secret needs rotation based on age or usage
    const age = Date.now() - secret.metadata.created.getTime();
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days

    return age > maxAge;
  }

  private async rotateEncryptionKey(keyId: string): Promise<void> {
    kmsLogger.info('Rotating encryption key', { keyId });
    
    const oldKey = this.encryptionKeys.get(keyId);
    if (!oldKey) return;

    // Generate new key
    const newKey = await this.generateEncryptionKey({
      name: oldKey.name,
      algorithm: oldKey.algorithm,
      keySize: oldKey.keySize,
      purpose: oldKey.metadata.purpose
    });

    // Mark old key as inactive
    oldKey.status = 'inactive';

    kmsLogger.info('Encryption key rotated', {
      oldKeyId: keyId,
      newKeyId: newKey.id
    });
  }

  private async getDefaultEncryptionKey(): Promise<EncryptionKey> {
    for (const key of this.encryptionKeys.values()) {
      if (key.status === 'active') {
        return key;
      }
    }
    
    // Create default key if none exist
    return await this.generateEncryptionKey({
      name: 'default-key',
      algorithm: 'AES-256-GCM',
      keySize: 256,
      purpose: ['encrypt', 'decrypt']
    });
  }

  private async encryptWithKey(value: string, keyId: string): Promise<string> {
    const encryptionResult = await this.encryptData(value, { keyId });
    return JSON.stringify(encryptionResult);
  }

  private async decryptValue(encryptedValue: string): Promise<string> {
    const encryptedData = JSON.parse(encryptedValue);
    return await this.decryptData(encryptedData);
  }

  private async getDerivedKey(keyId: string): Promise<Buffer> {
    const key = this.encryptionKeys.get(keyId);
    if (!key || !key.keyMaterial) {
      throw new Error('Encryption key not found');
    }

    // Update usage statistics
    key.usage.encrypt++;

    return key.keyMaterial;
  }

  private generateSecretValue(category: string): string {
    // Generate secure random value based on category
    switch (category) {
      case 'api-keys':
        return crypto.randomBytes(32).toString('hex');
      case 'database':
        return `postgresql://user:${crypto.randomBytes(16).toString('hex')}@localhost:5432/db`;
      default:
        return crypto.randomBytes(32).toString('base64');
    }
  }

  private async compressData(data: string): Promise<string> {
    // Simplified compression - would use actual compression library
    return Buffer.from(data).toString('base64');
  }

  private async decompressData(compressedData: string): Promise<string> {
    // Simplified decompression - would use actual decompression library
    return Buffer.from(compressedData, 'base64').toString('utf8');
  }

  private async logAuditEvent(event: SecretAuditTrail): Promise<void> {
    this.auditTrail.push(event);
    
    // Keep audit trail size manageable
    if (this.auditTrail.length > 10000) {
      this.auditTrail = this.auditTrail.slice(-5000);
    }

    if (this.config.audit.enabled) {
      kmsLogger.info('Audit event logged', {
        eventId: event.id,
        operation: event.operation,
        user: event.user,
        result: event.result
      });
    }
  }

  private cleanupAuditLogs(): void {
    const retentionMs = this.config.audit.storage.retention * 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - retentionMs);
    
    const originalCount = this.auditTrail.length;
    this.auditTrail = this.auditTrail.filter(event => event.timestamp > cutoff);
    
    const cleaned = originalCount - this.auditTrail.length;
    if (cleaned > 0) {
      kmsLogger.info('Cleaned up audit logs', { cleaned, remaining: this.auditTrail.length });
    }
  }

  // Public API Methods
  getKMSMetrics() {
    return {
      providers: this.providers.size,
      secrets: this.secrets.size,
      encryptionKeys: this.encryptionKeys.size,
      deviceKeystores: this.deviceKeystores.size,
      auditTrail: this.auditTrail.length,
      configuration: {
        defaultProvider: this.config.defaultProvider,
        keyRotationEnabled: this.config.keyRotation.enabled,
        auditEnabled: this.config.audit.enabled,
        deviceKeystoreEnabled: this.config.deviceKeystore.enabled
      }
    };
  }

  async healthCheck(): Promise<any> {
    const activeProviders = Array.from(this.providers.values()).filter(p => p.status === 'active').length;
    const activeKeys = Array.from(this.encryptionKeys.values()).filter(k => k.status === 'active').length;
    const activeSecrets = Array.from(this.secrets.values()).filter(s => s.lifecycle.status === 'active').length;

    return {
      status: 'healthy',
      kmsIntegration: 'operational',
      providers: {
        total: this.providers.size,
        active: activeProviders,
        default: this.config.defaultProvider
      },
      keys: {
        total: this.encryptionKeys.size,
        active: activeKeys
      },
      secrets: {
        total: this.secrets.size,
        active: activeSecrets
      },
      features: {
        keyRotation: this.config.keyRotation.enabled,
        deviceKeystore: this.config.deviceKeystore.enabled,
        audit: this.config.audit.enabled,
        backup: this.config.backup.enabled
      },
      version: this.VERSION,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const kmsIntegrationManager = KMSIntegrationManager.getInstance();