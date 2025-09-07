import crypto from 'crypto';
import { z } from 'zod';
import {
  SecureQRPayload,
  QRGenerationRequest,
  QRVerificationResult,
  QRToken,
  QR_SECURITY_CONFIG,
  QR_ERROR_MESSAGES,
  SecureQRPayloadSchema,
  QRTokenSchema
} from '@shared/qr-schema';

// Secret key for QR signing (should be environment variable in production)
const QR_SIGNING_SECRET = process.env.QR_SIGNING_SECRET || 'veridity-qr-secret-key-change-in-production';
const QR_ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || 'veridity-qr-encrypt-change-in-production-32';

// Nonce storage for replay attack prevention (use Redis in production)
const usedNonces = new Set<string>();

export class QRSecurityService {
  /**
   * Generate a secure, tamper-proof QR code token
   */
  async generateSecureQR(request: QRGenerationRequest, issuerId: string, issuerName: string): Promise<{
    token: string;
    qrCodeUrl: string;
    expiresAt: number;
    deepLinkUrl: string;
  }> {
    // Generate cryptographically secure nonce
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Calculate expiry timestamp
    const expiresAt = Date.now() + (request.expiryMinutes * 60 * 1000);
    
    // Create payload
    const payload: SecureQRPayload = {
      version: QR_SECURITY_CONFIG.CURRENT_VERSION,
      type: request.type,
      nonce,
      expiresAt,
      issuer: {
        id: issuerId,
        name: request.issuer?.name || issuerName,
        domain: request.issuer?.domain
      },
      payload: request.payload,
      signature: '', // Will be calculated below
      metadata: {
        timestamp: Date.now(),
        userAgent: undefined, // Set by client if needed
        ipAddress: undefined   // Set by client if needed
      }
    };
    
    // Generate signature for tamper protection
    payload.signature = this.signPayload(payload);
    
    // Encrypt and encode the payload
    const encryptedPayload = this.encryptPayload(payload);
    const checksum = this.generateChecksum(encryptedPayload);
    
    const token: QRToken = {
      token: encryptedPayload,
      checksum
    };
    
    // Create deep link URL
    const deepLinkUrl = `/verify/${encodeURIComponent(token.token)}?c=${token.checksum}`;
    
    // For QR code generation, we'll use the full URL
    const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}${deepLinkUrl}`;
    
    return {
      token: token.token,
      qrCodeUrl,
      expiresAt,
      deepLinkUrl
    };
  }
  
  /**
   * Verify and decrypt a QR token
   */
  async verifyQRToken(tokenStr: string, checksum?: string): Promise<QRVerificationResult> {
    const verifiedAt = Date.now();
    
    try {
      // Validate checksum if provided
      if (checksum && this.generateChecksum(tokenStr) !== checksum) {
        return {
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: QR_ERROR_MESSAGES.INVALID_FORMAT
          },
          metadata: {
            verifiedAt,
            timeToExpiry: 0,
            issuerVerified: false,
            nonceChecked: false
          }
        };
      }
      
      // Decrypt payload
      const payload = this.decryptPayload(tokenStr);
      
      // Validate payload structure
      const validation = SecureQRPayloadSchema.safeParse(payload);
      if (!validation.success) {
        return {
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: QR_ERROR_MESSAGES.INVALID_FORMAT,
            details: validation.error
          },
          metadata: {
            verifiedAt,
            timeToExpiry: 0,
            issuerVerified: false,
            nonceChecked: false
          }
        };
      }
      
      const validPayload = validation.data;
      
      // Check version compatibility
      if (validPayload.version !== QR_SECURITY_CONFIG.CURRENT_VERSION) {
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_VERSION',
            message: QR_ERROR_MESSAGES.UNSUPPORTED_VERSION
          },
          metadata: {
            verifiedAt,
            timeToExpiry: validPayload.expiresAt - verifiedAt,
            issuerVerified: false,
            nonceChecked: false
          }
        };
      }
      
      // Check expiry
      const timeToExpiry = validPayload.expiresAt - verifiedAt;
      if (timeToExpiry <= 0) {
        return {
          success: false,
          error: {
            code: 'EXPIRED',
            message: QR_ERROR_MESSAGES.EXPIRED
          },
          metadata: {
            verifiedAt,
            timeToExpiry,
            issuerVerified: false,
            nonceChecked: false
          }
        };
      }
      
      // Check for replay attacks
      if (usedNonces.has(validPayload.nonce)) {
        return {
          success: false,
          error: {
            code: 'REPLAY_ATTACK',
            message: QR_ERROR_MESSAGES.REPLAY_ATTACK
          },
          metadata: {
            verifiedAt,
            timeToExpiry,
            issuerVerified: false,
            nonceChecked: true
          }
        };
      }
      
      // Verify signature
      const expectedSignature = this.signPayload(validPayload);
      if (validPayload.signature !== expectedSignature) {
        return {
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: QR_ERROR_MESSAGES.INVALID_SIGNATURE
          },
          metadata: {
            verifiedAt,
            timeToExpiry,
            issuerVerified: false,
            nonceChecked: true
          }
        };
      }
      
      // Mark nonce as used
      usedNonces.add(validPayload.nonce);
      
      // Clean up old nonces periodically (simple implementation)
      if (usedNonces.size > 10000) {
        this.cleanupOldNonces();
      }
      
      return {
        success: true,
        payload: validPayload,
        metadata: {
          verifiedAt,
          timeToExpiry,
          issuerVerified: true,
          nonceChecked: true
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INVALID_FORMAT',
          message: QR_ERROR_MESSAGES.INVALID_FORMAT,
          details: error
        },
        metadata: {
          verifiedAt,
          timeToExpiry: 0,
          issuerVerified: false,
          nonceChecked: false
        }
      };
    }
  }
  
  /**
   * Generate cryptographic signature for payload
   */
  private signPayload(payload: SecureQRPayload): string {
    // Create a copy without signature for signing
    const { signature, ...payloadToSign } = payload;
    
    const payloadString = JSON.stringify(payloadToSign, Object.keys(payloadToSign).sort());
    return crypto
      .createHmac('sha256', QR_SIGNING_SECRET)
      .update(payloadString)
      .digest('hex');
  }
  
  /**
   * Encrypt payload for QR token
   */
  private encryptPayload(payload: SecureQRPayload): string {
    const payloadString = JSON.stringify(payload);
    const cipher = crypto.createCipher('aes-256-cbc', QR_ENCRYPTION_KEY);
    let encrypted = cipher.update(payloadString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return Buffer.from(encrypted).toString('base64');
  }
  
  /**
   * Decrypt payload from QR token
   */
  private decryptPayload(encryptedToken: string): SecureQRPayload {
    const encryptedData = Buffer.from(encryptedToken, 'base64').toString('hex');
    const decipher = crypto.createDecipher('aes-256-cbc', QR_ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
  
  /**
   * Generate checksum for quick validation
   */
  private generateChecksum(data: string): string {
    return crypto
      .createHash('md5')
      .update(data)
      .digest('hex')
      .substring(0, 8);
  }
  
  /**
   * Clean up old nonces to prevent memory leaks
   */
  private cleanupOldNonces(): void {
    // Simple cleanup - in production, use TTL with Redis
    usedNonces.clear();
  }
  
  /**
   * Rate limiting for QR operations
   */
  async checkRateLimit(operation: 'generate' | 'verify', identifier: string): Promise<boolean> {
    // Simple in-memory rate limiting (use Redis in production)
    // For now, always allow - implement proper rate limiting in production
    return true;
  }
}

export const qrSecurityService = new QRSecurityService();