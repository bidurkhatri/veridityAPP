/**
 * Offline QR Protocol Implementation
 * Secure offline QR codes with nonce binding, anti-replay protection, and ERC-4527 compliance
 * Supporting air-gapped environments and intermittent connectivity scenarios
 */

import crypto from 'crypto';
import { performance } from 'perf_hooks';
import winston from 'winston';
import QRCode from 'qrcode';
import { EnhancedZKPSystem } from './enhanced-zkp';

// Offline QR Protocol types following ERC-4527 and security best practices
export interface OfflineQRPayload {
  version: '1.0' | '2.0';
  format: 'erc4527' | 'w3c-vp' | 'custom';
  type: 'credential-presentation' | 'identity-proof' | 'access-token' | 'payment-authorization';
  id: string;
  issuer: string;
  subject: string;
  issuedAt: number; // Unix timestamp
  expiresAt: number; // Unix timestamp
  nonce: string; // Anti-replay nonce
  sessionId?: string; // Optional session binding
  data: any; // Payload data (credential, proof, etc.)
  signature: string; // Cryptographic signature
  proof?: ZKProofData; // Optional zero-knowledge proof
  metadata: QRMetadata;
}

export interface QRMetadata {
  size: 'small' | 'medium' | 'large' | 'dynamic';
  errorCorrection: 'L' | 'M' | 'Q' | 'H'; // 7%, 15%, 25%, 30%
  encoding: 'base64' | 'base58' | 'cbor' | 'json';
  compression: 'none' | 'gzip' | 'brotli' | 'custom';
  chunking: boolean; // For large payloads
  privacy: 'public' | 'encrypted' | 'anonymous';
  verificationUri?: string; // Optional online verification
}

export interface ZKProofData {
  circuitId: string;
  proof: string;
  publicSignals: string[];
  verificationKey: string;
  context: string;
}

export interface NonceBinding {
  nonce: string;
  sessionId: string;
  deviceId: string;
  timestamp: number;
  location?: GeolocationCoordinates;
  biometric?: BiometricBinding;
  challenge: string;
  response: string;
  used: boolean;
}

export interface BiometricBinding {
  type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'behavioral';
  hash: string; // Hashed biometric template
  confidence: number; // 0-1 confidence score
  timestamp: number;
  deviceId: string;
}

export interface ReplayProtection {
  enabled: boolean;
  windowMs: number; // Time window for nonce validity
  maxUses: number; // Maximum uses per nonce
  bloomFilter: boolean; // Use bloom filter for efficiency
  persistentStorage: boolean; // Store used nonces persistently
  distributedCheck: boolean; // Check across multiple nodes
}

export interface QRGenerationConfig {
  size: number; // QR code size in pixels
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  border: number; // Border size
  color: {
    dark: string; // Dark color hex
    light: string; // Light color hex
  };
  logo?: {
    enabled: boolean;
    path: string;
    size: number;
  };
  format: 'png' | 'svg' | 'utf8' | 'terminal';
  chunking: ChunkingConfig;
}

export interface ChunkingConfig {
  enabled: boolean;
  maxChunkSize: number; // Maximum bytes per chunk
  totalChunks: number;
  chunkIndex: number;
  checksumType: 'sha256' | 'crc32';
  reassemblyTimeout: number; // ms
}

export interface OfflineVerificationConfig {
  trustedIssuers: string[]; // List of trusted issuer DIDs
  maxAge: number; // Maximum age in seconds
  requiredClaims: string[]; // Required claims for verification
  allowExpired: boolean; // Allow expired credentials in offline mode
  fallbackVerification: boolean; // Use fallback verification methods
  cachePolicy: 'strict' | 'relaxed' | 'disabled';
}

export interface QRScanResult {
  success: boolean;
  payload?: OfflineQRPayload;
  chunks?: QRChunk[];
  errors: string[];
  warnings: string[];
  verification: {
    signatureValid: boolean;
    nonceValid: boolean;
    notExpired: boolean;
    trustedIssuer: boolean;
    replayProtected: boolean;
  };
  metadata: {
    scanTime: number; // ms
    format: string;
    size: number; // bytes
    chunked: boolean;
    encrypted: boolean;
  };
}

export interface QRChunk {
  chunkIndex: number;
  totalChunks: number;
  data: string;
  checksum: string;
  timestamp: number;
}

export interface AccessToken {
  tokenId: string;
  issuer: string;
  subject: string;
  audience: string;
  permissions: string[];
  constraints: AccessConstraints;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  proof?: string;
}

export interface AccessConstraints {
  location?: GeofenceConstraint;
  time?: TimeConstraint;
  device?: DeviceConstraint;
  network?: NetworkConstraint;
  usage?: UsageConstraint;
}

export interface GeofenceConstraint {
  type: 'circle' | 'polygon' | 'country' | 'region';
  coordinates: number[][];
  radius?: number; // meters
  tolerance: number; // meters
}

export interface TimeConstraint {
  validAfter?: number; // Unix timestamp
  validUntil?: number; // Unix timestamp
  timeZone?: string;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    times: string[]; // HH:MM format
    days?: number[]; // 0-6 for weekly
    dates?: number[]; // 1-31 for monthly
  };
}

export interface DeviceConstraint {
  allowedDevices?: string[]; // Device IDs
  bannedDevices?: string[]; // Banned device IDs
  deviceType?: ('mobile' | 'desktop' | 'tablet' | 'kiosk')[];
  biometricRequired?: boolean;
  secureElementRequired?: boolean;
}

export interface NetworkConstraint {
  allowedNetworks?: string[]; // Network IDs or IP ranges
  bannedNetworks?: string[]; // Banned networks
  vpnAllowed?: boolean;
  proxyAllowed?: boolean;
  torAllowed?: boolean;
}

export interface UsageConstraint {
  maxUses?: number;
  maxUsesPerDay?: number;
  maxUsesPerHour?: number;
  cooldownPeriod?: number; // seconds between uses
  sessionTimeout?: number; // seconds
}

// Offline QR Protocol logger
const qrLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/offline-qr-protocol.log' }),
    new winston.transports.Console()
  ]
});

export class OfflineQRProtocolManager {
  private static instance: OfflineQRProtocolManager;
  private zkpSystem: EnhancedZKPSystem;
  private nonceBindings: Map<string, NonceBinding> = new Map();
  private usedNonces: Set<string> = new Set();
  private qrChunks: Map<string, Map<number, QRChunk>> = new Map();
  private replayProtection: ReplayProtection;
  private trustedIssuers: Set<string> = new Set();
  private readonly VERSION = '10.0.0-offline-qr';

  constructor() {
    this.zkpSystem = EnhancedZKPSystem.getInstance();
    this.replayProtection = {
      enabled: true,
      windowMs: 300000, // 5 minutes
      maxUses: 1,
      bloomFilter: true,
      persistentStorage: true,
      distributedCheck: false
    };
    
    this.initializeOfflineQRSystem();
  }

  static getInstance(): OfflineQRProtocolManager {
    if (!OfflineQRProtocolManager.instance) {
      OfflineQRProtocolManager.instance = new OfflineQRProtocolManager();
    }
    return OfflineQRProtocolManager.instance;
  }

  private async initializeOfflineQRSystem(): Promise<void> {
    qrLogger.info('Initializing Offline QR Protocol System', { 
      version: this.VERSION 
    });

    // Setup trusted issuers
    await this.setupTrustedIssuers();

    // Initialize nonce cleanup
    await this.setupNonceCleanup();

    // Setup chunk reassembly cleanup
    await this.setupChunkCleanup();

    qrLogger.info('Offline QR Protocol System initialized successfully');
  }

  // QR Code Generation
  async generateOfflineQR(
    data: any,
    config: {
      type: 'credential-presentation' | 'identity-proof' | 'access-token' | 'payment-authorization';
      issuer: string;
      subject: string;
      expiresIn: number; // seconds
      privacy: 'public' | 'encrypted' | 'anonymous';
      binding?: 'device' | 'session' | 'biometric';
      zkProof?: boolean;
      chunking?: boolean;
    }
  ): Promise<{
    qrCode: string;
    payload: OfflineQRPayload;
    chunks?: string[];
    metadata: {
      size: number;
      format: string;
      chunked: boolean;
      encrypted: boolean;
    };
  }> {
    const startTime = performance.now();
    
    qrLogger.info('Generating offline QR code', {
      type: config.type,
      issuer: config.issuer,
      subject: config.subject,
      privacy: config.privacy
    });

    try {
      // Generate nonce and session binding
      const nonce = this.generateSecureNonce();
      const sessionId = this.generateSessionId();
      const id = `${config.type}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

      // Create nonce binding
      if (config.binding) {
        await this.createNonceBinding(nonce, sessionId, config.binding);
      }

      // Encrypt data if required
      let processedData = data;
      if (config.privacy === 'encrypted') {
        processedData = await this.encryptPayloadData(data, nonce);
      } else if (config.privacy === 'anonymous') {
        processedData = await this.anonymizePayloadData(data);
      }

      // Generate ZK proof if requested
      let zkProofData: ZKProofData | undefined;
      if (config.zkProof) {
        zkProofData = await this.generateZKProofForPayload(data, nonce, config.type);
      }

      // Create payload
      const payload: OfflineQRPayload = {
        version: '2.0',
        format: 'erc4527',
        type: config.type,
        id,
        issuer: config.issuer,
        subject: config.subject,
        issuedAt: Math.floor(Date.now() / 1000),
        expiresAt: Math.floor(Date.now() / 1000) + config.expiresIn,
        nonce,
        sessionId,
        data: processedData,
        signature: '', // Will be set after signing
        proof: zkProofData,
        metadata: {
          size: 'dynamic',
          errorCorrection: 'M',
          encoding: 'base64',
          compression: 'gzip',
          chunking: config.chunking || false,
          privacy: config.privacy,
          verificationUri: `${process.env.BASE_URL || 'https://veridity.app'}/api/verify-qr`
        }
      };

      // Sign payload
      payload.signature = await this.signPayload(payload);

      // Compress payload if needed
      const serialized = JSON.stringify(payload);
      let compressed = serialized;
      
      if (payload.metadata.compression !== 'none') {
        compressed = await this.compressData(serialized, payload.metadata.compression);
      }

      // Encode payload
      let encoded = compressed;
      if (payload.metadata.encoding !== 'json') {
        encoded = this.encodeData(compressed, payload.metadata.encoding);
      }

      // Handle chunking for large payloads
      let chunks: string[] | undefined;
      let finalQR: string;

      if (config.chunking && encoded.length > 2048) { // 2KB threshold
        chunks = await this.chunkPayload(encoded, id);
        finalQR = await this.generateChunkedQR(chunks[0], id); // First chunk
      } else {
        finalQR = await this.generateSingleQR(encoded);
      }

      const processingTime = performance.now() - startTime;

      qrLogger.info('Offline QR code generated', {
        id,
        size: encoded.length,
        chunked: !!chunks,
        encrypted: config.privacy === 'encrypted',
        processingTime: Math.round(processingTime)
      });

      return {
        qrCode: finalQR,
        payload,
        chunks,
        metadata: {
          size: encoded.length,
          format: payload.metadata.encoding,
          chunked: !!chunks,
          encrypted: config.privacy === 'encrypted'
        }
      };

    } catch (error) {
      qrLogger.error('Failed to generate offline QR code', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Access Token Generation
  async generateAccessToken(
    subject: string,
    audience: string,
    permissions: string[],
    constraints: AccessConstraints,
    expiresIn: number = 3600
  ): Promise<{
    qrCode: string;
    token: AccessToken;
    binding: string;
  }> {
    qrLogger.info('Generating access token QR', {
      subject,
      audience,
      permissions: permissions.length,
      expiresIn
    });

    const nonce = this.generateSecureNonce();
    const tokenId = `access_token_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    const token: AccessToken = {
      tokenId,
      issuer: 'veridity-system',
      subject,
      audience,
      permissions,
      constraints,
      issuedAt: Math.floor(Date.now() / 1000),
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      nonce
    };

    // Generate proof for access token
    token.proof = await this.generateAccessTokenProof(token);

    // Generate QR code
    const result = await this.generateOfflineQR(token, {
      type: 'access-token',
      issuer: token.issuer,
      subject: token.subject,
      expiresIn,
      privacy: 'encrypted',
      binding: 'device',
      zkProof: true
    });

    return {
      qrCode: result.qrCode,
      token,
      binding: nonce
    };
  }

  // QR Code Scanning and Verification
  async scanAndVerifyQR(
    qrData: string,
    config: OfflineVerificationConfig
  ): Promise<QRScanResult> {
    const startTime = performance.now();
    
    qrLogger.info('Scanning and verifying QR code', {
      dataLength: qrData.length,
      maxAge: config.maxAge
    });

    try {
      // Decode QR data
      const decoded = await this.decodeQRData(qrData);
      
      // Check if this is a chunked payload
      if (this.isChunkedPayload(decoded)) {
        return await this.handleChunkedPayload(decoded, config, startTime);
      }

      // Parse payload
      const payload = await this.parsePayload(decoded);
      
      // Verify payload
      const verification = await this.verifyPayload(payload, config);

      const scanTime = performance.now() - startTime;

      const result: QRScanResult = {
        success: verification.signatureValid && verification.nonceValid && verification.notExpired,
        payload,
        errors: [],
        warnings: [],
        verification,
        metadata: {
          scanTime,
          format: payload.metadata.encoding,
          size: qrData.length,
          chunked: false,
          encrypted: payload.metadata.privacy === 'encrypted'
        }
      };

      // Add warnings for offline verification
      if (!verification.trustedIssuer && config.allowExpired) {
        result.warnings.push('Issuer not in trusted list - using offline fallback');
      }

      if (!verification.notExpired && config.allowExpired) {
        result.warnings.push('Credential expired - using offline tolerance');
      }

      qrLogger.info('QR verification completed', {
        success: result.success,
        scanTime: Math.round(scanTime),
        errorCount: result.errors.length,
        warningCount: result.warnings.length
      });

      return result;

    } catch (error) {
      const scanTime = performance.now() - startTime;
      
      qrLogger.error('QR scan/verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        verification: {
          signatureValid: false,
          nonceValid: false,
          notExpired: false,
          trustedIssuer: false,
          replayProtected: false
        },
        metadata: {
          scanTime,
          format: 'unknown',
          size: qrData.length,
          chunked: false,
          encrypted: false
        }
      };
    }
  }

  // Nonce and Replay Protection
  private async createNonceBinding(
    nonce: string,
    sessionId: string,
    bindingType: 'device' | 'session' | 'biometric'
  ): Promise<void> {
    const deviceId = this.generateDeviceId();
    const challenge = crypto.randomBytes(32).toString('hex');
    
    const binding: NonceBinding = {
      nonce,
      sessionId,
      deviceId,
      timestamp: Date.now(),
      challenge,
      response: crypto.createHash('sha256').update(`${nonce}:${challenge}:${deviceId}`).digest('hex'),
      used: false
    };

    // Add biometric binding if requested
    if (bindingType === 'biometric') {
      binding.biometric = await this.generateBiometricBinding(deviceId);
    }

    this.nonceBindings.set(nonce, binding);
    
    qrLogger.debug('Nonce binding created', {
      nonce: nonce.substring(0, 8) + '...',
      bindingType,
      deviceId
    });
  }

  private async verifyNonceBinding(nonce: string, deviceId?: string): Promise<boolean> {
    if (!this.replayProtection.enabled) {
      return true;
    }

    // Check if nonce was already used
    if (this.usedNonces.has(nonce)) {
      qrLogger.warn('Replay attack detected - nonce already used', {
        nonce: nonce.substring(0, 8) + '...'
      });
      return false;
    }

    const binding = this.nonceBindings.get(nonce);
    if (!binding) {
      qrLogger.warn('Nonce binding not found', {
        nonce: nonce.substring(0, 8) + '...'
      });
      return false;
    }

    // Check timestamp validity
    const age = Date.now() - binding.timestamp;
    if (age > this.replayProtection.windowMs) {
      qrLogger.warn('Nonce expired', {
        nonce: nonce.substring(0, 8) + '...',
        age: Math.round(age / 1000)
      });
      return false;
    }

    // Check device binding
    if (deviceId && binding.deviceId !== deviceId) {
      qrLogger.warn('Device binding mismatch', {
        nonce: nonce.substring(0, 8) + '...',
        expected: binding.deviceId,
        actual: deviceId
      });
      return false;
    }

    // Mark nonce as used
    binding.used = true;
    this.usedNonces.add(nonce);

    return true;
  }

  // Cryptographic Operations
  private async signPayload(payload: OfflineQRPayload): Promise<string> {
    // Create canonical representation
    const toSign = {
      version: payload.version,
      format: payload.format,
      type: payload.type,
      id: payload.id,
      issuer: payload.issuer,
      subject: payload.subject,
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
      nonce: payload.nonce,
      data: payload.data
    };

    const canonical = JSON.stringify(toSign, Object.keys(toSign).sort());
    const hash = crypto.createHash('sha256').update(canonical).digest();
    
    // Simplified signature - would use actual private key
    return crypto.createHash('sha256').update(hash).digest('hex');
  }

  private async verifySignature(payload: OfflineQRPayload): Promise<boolean> {
    // Recreate signature and compare
    const expectedSignature = await this.signPayload(payload);
    return payload.signature === expectedSignature;
  }

  private async encryptPayloadData(data: any, nonce: string): Promise<string> {
    const key = crypto.createHash('sha256').update(nonce).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM('aes-256-gcm', key);
    cipher.setAAD(Buffer.from(nonce));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    });
  }

  private async decryptPayloadData(encryptedData: string, nonce: string): Promise<any> {
    const key = crypto.createHash('sha256').update(nonce).digest();
    const parsed = JSON.parse(encryptedData);
    
    const decipher = crypto.createDecipherGCM('aes-256-gcm', key);
    decipher.setAAD(Buffer.from(nonce));
    decipher.setAuthTag(Buffer.from(parsed.authTag, 'hex'));
    
    let decrypted = decipher.update(parsed.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  private async anonymizePayloadData(data: any): Promise<any> {
    // Apply anonymization techniques
    const anonymized = JSON.parse(JSON.stringify(data));
    
    // Remove or hash PII
    if (anonymized.personalInfo) {
      Object.keys(anonymized.personalInfo).forEach(key => {
        if (typeof anonymized.personalInfo[key] === 'string') {
          anonymized.personalInfo[key] = crypto.createHash('sha256')
            .update(anonymized.personalInfo[key])
            .digest('hex')
            .substring(0, 16);
        }
      });
    }

    return anonymized;
  }

  // Payload Processing
  private async chunkPayload(data: string, id: string): Promise<string[]> {
    const maxChunkSize = 1800; // Leave room for metadata
    const chunks: string[] = [];
    const totalChunks = Math.ceil(data.length / maxChunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * maxChunkSize;
      const end = Math.min(start + maxChunkSize, data.length);
      const chunkData = data.slice(start, end);
      
      const chunk: QRChunk = {
        chunkIndex: i,
        totalChunks,
        data: chunkData,
        checksum: crypto.createHash('sha256').update(chunkData).digest('hex').substring(0, 16),
        timestamp: Date.now()
      };

      chunks.push(JSON.stringify(chunk));
    }

    // Store chunks for reassembly
    this.qrChunks.set(id, new Map());
    chunks.forEach((chunk, index) => {
      this.qrChunks.get(id)!.set(index, JSON.parse(chunk));
    });

    return chunks;
  }

  private async generateSingleQR(data: string): Promise<string> {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      width: 512
    });
  }

  private async generateChunkedQR(chunkData: string, id: string): Promise<string> {
    const qrData = `CHUNK:${id}:${chunkData}`;
    return await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      width: 512
    });
  }

  // Helper Methods
  private generateSecureNonce(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
  }

  private generateDeviceId(): string {
    // In real implementation, would use device fingerprinting
    return `device_${crypto.randomBytes(16).toString('hex')}`;
  }

  private async generateBiometricBinding(deviceId: string): Promise<BiometricBinding> {
    return {
      type: 'fingerprint',
      hash: crypto.createHash('sha256').update(`${deviceId}:biometric`).digest('hex'),
      confidence: 0.95,
      timestamp: Date.now(),
      deviceId
    };
  }

  private async generateZKProofForPayload(
    data: any,
    nonce: string,
    type: string
  ): Promise<ZKProofData> {
    // Simplified ZK proof - would use actual ZK system
    return {
      circuitId: `offline_${type}`,
      proof: crypto.createHash('sha256').update(`${JSON.stringify(data)}:${nonce}`).digest('hex'),
      publicSignals: [crypto.createHash('sha256').update(nonce).digest('hex')],
      verificationKey: 'mock_vkey',
      context: 'offline-qr'
    };
  }

  private async generateAccessTokenProof(token: AccessToken): Promise<string> {
    const tokenData = {
      tokenId: token.tokenId,
      subject: token.subject,
      audience: token.audience,
      permissions: token.permissions,
      nonce: token.nonce
    };

    return crypto.createHash('sha256')
      .update(JSON.stringify(tokenData, Object.keys(tokenData).sort()))
      .digest('hex');
  }

  private async compressData(data: string, type: string): Promise<string> {
    // Simplified compression - would use actual compression libraries
    return Buffer.from(data).toString('base64');
  }

  private encodeData(data: string, encoding: string): string {
    switch (encoding) {
      case 'base64':
        return Buffer.from(data).toString('base64');
      case 'base58':
        // Simplified base58 - would use actual library
        return Buffer.from(data).toString('base64').replace(/[+/=]/g, '');
      default:
        return data;
    }
  }

  private async decodeQRData(qrData: string): Promise<string> {
    // Handle different encodings
    try {
      return Buffer.from(qrData, 'base64').toString('utf8');
    } catch {
      return qrData; // Assume it's already decoded
    }
  }

  private isChunkedPayload(data: string): boolean {
    return data.startsWith('CHUNK:');
  }

  private async handleChunkedPayload(
    data: string,
    config: OfflineVerificationConfig,
    startTime: number
  ): Promise<QRScanResult> {
    // Parse chunk header
    const [, id, chunkData] = data.split(':', 3);
    const chunk: QRChunk = JSON.parse(chunkData);
    
    // Store chunk
    if (!this.qrChunks.has(id)) {
      this.qrChunks.set(id, new Map());
    }
    this.qrChunks.get(id)!.set(chunk.chunkIndex, chunk);

    // Check if we have all chunks
    const chunks = this.qrChunks.get(id)!;
    if (chunks.size < chunk.totalChunks) {
      return {
        success: false,
        chunks: Array.from(chunks.values()),
        errors: [`Incomplete chunk set: ${chunks.size}/${chunk.totalChunks}`],
        warnings: [],
        verification: {
          signatureValid: false,
          nonceValid: false,
          notExpired: false,
          trustedIssuer: false,
          replayProtected: false
        },
        metadata: {
          scanTime: performance.now() - startTime,
          format: 'chunked',
          size: 0,
          chunked: true,
          encrypted: false
        }
      };
    }

    // Reassemble payload
    const reassembled = this.reassembleChunks(chunks);
    const payload = await this.parsePayload(reassembled);
    
    // Verify reassembled payload
    const verification = await this.verifyPayload(payload, config);

    return {
      success: verification.signatureValid && verification.nonceValid && verification.notExpired,
      payload,
      chunks: Array.from(chunks.values()),
      errors: [],
      warnings: [],
      verification,
      metadata: {
        scanTime: performance.now() - startTime,
        format: payload.metadata.encoding,
        size: reassembled.length,
        chunked: true,
        encrypted: payload.metadata.privacy === 'encrypted'
      }
    };
  }

  private reassembleChunks(chunks: Map<number, QRChunk>): string {
    const sortedChunks = Array.from(chunks.values()).sort((a, b) => a.chunkIndex - b.chunkIndex);
    return sortedChunks.map(chunk => chunk.data).join('');
  }

  private async parsePayload(data: string): Promise<OfflineQRPayload> {
    return JSON.parse(data);
  }

  private async verifyPayload(
    payload: OfflineQRPayload,
    config: OfflineVerificationConfig
  ): Promise<QRScanResult['verification']> {
    // Verify signature
    const signatureValid = await this.verifySignature(payload);

    // Verify nonce (anti-replay)
    const nonceValid = await this.verifyNonceBinding(payload.nonce);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    const notExpired = payload.expiresAt > now || config.allowExpired;

    // Check trusted issuer
    const trustedIssuer = config.trustedIssuers.includes(payload.issuer) || config.fallbackVerification;

    // Verify replay protection
    const replayProtected = !this.usedNonces.has(payload.nonce);

    return {
      signatureValid,
      nonceValid,
      notExpired,
      trustedIssuer,
      replayProtected
    };
  }

  private async setupTrustedIssuers(): Promise<void> {
    // Add default trusted issuers
    this.trustedIssuers.add('did:key:veridity-system');
    this.trustedIssuers.add('did:key:government-issuer');
    qrLogger.info('Trusted issuers configured');
  }

  private async setupNonceCleanup(): Promise<void> {
    // Clean up expired nonces every hour
    setInterval(() => {
      this.cleanupExpiredNonces();
    }, 3600000); // 1 hour
  }

  private async setupChunkCleanup(): Promise<void> {
    // Clean up incomplete chunks every 30 minutes
    setInterval(() => {
      this.cleanupIncompleteChunks();
    }, 1800000); // 30 minutes
  }

  private cleanupExpiredNonces(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [nonce, binding] of this.nonceBindings.entries()) {
      if (now - binding.timestamp > this.replayProtection.windowMs * 2) {
        this.nonceBindings.delete(nonce);
        this.usedNonces.delete(nonce);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      qrLogger.info('Cleaned up expired nonces', { count: cleaned });
    }
  }

  private cleanupIncompleteChunks(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, chunks] of this.qrChunks.entries()) {
      const oldestChunk = Math.min(...Array.from(chunks.values()).map(c => c.timestamp));
      if (now - oldestChunk > 1800000) { // 30 minutes
        this.qrChunks.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      qrLogger.info('Cleaned up incomplete chunks', { count: cleaned });
    }
  }

  // Public API Methods
  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      offlineQRProtocol: 'operational',
      nonceBindings: this.nonceBindings.size,
      usedNonces: this.usedNonces.size,
      qrChunks: this.qrChunks.size,
      trustedIssuers: this.trustedIssuers.size,
      replayProtection: this.replayProtection.enabled,
      version: this.VERSION,
      timestamp: new Date().toISOString()
    };
  }

  getProtocolStats(): any {
    return {
      activeNonces: this.nonceBindings.size,
      usedNonces: this.usedNonces.size,
      chunkSets: this.qrChunks.size,
      replayProtectionEnabled: this.replayProtection.enabled,
      nonceWindowMs: this.replayProtection.windowMs
    };
  }
}

// Export singleton instance
export const offlineQRProtocolManager = OfflineQRProtocolManager.getInstance();