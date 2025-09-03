import { randomBytes } from 'crypto';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';

export interface BiometricChallenge {
  challenge: string;
  timeout: number;
  userVerification: 'required' | 'preferred' | 'discouraged';
}

export interface BiometricRegistration {
  userId: string;
  deviceId: string;
  credentialId: string;
  publicKey: string;
  deviceName: string;
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux';
}

export interface BiometricAuthentication {
  userId: string;
  credentialId: string;
  challenge: string;
  signature: string;
  clientData: string;
}

export class BiometricService {
  
  // Generate WebAuthn registration challenge
  async generateRegistrationChallenge(userId: string): Promise<BiometricChallenge> {
    const challenge = randomBytes(32).toString('base64url');
    
    // Store challenge temporarily (implement with Redis or in-memory store in production)
    await this.storeChallengeTemporarily(userId, challenge);
    
    return {
      challenge,
      timeout: 300000, // 5 minutes
      userVerification: 'required'
    };
  }

  // Generate WebAuthn authentication challenge
  async generateAuthenticationChallenge(userId: string): Promise<BiometricChallenge> {
    const challenge = randomBytes(32).toString('base64url');
    
    await this.storeChallengeTemporarily(userId, challenge);
    
    return {
      challenge,
      timeout: 300000, // 5 minutes
      userVerification: 'required'
    };
  }

  // Register new biometric credential
  async registerBiometricCredential(registration: BiometricRegistration): Promise<boolean> {
    try {
      // Check if credential already exists
      const existing = await db.select()
        .from(biometricCredentials)
        .where(
          and(
            eq(biometricCredentials.userId, registration.userId),
            eq(biometricCredentials.credentialId, registration.credentialId)
          )
        );

      if (existing.length > 0) {
        throw new Error('Credential already registered');
      }

      // Store the credential
      await db.insert(biometricCredentials).values({
        userId: registration.userId,
        deviceId: registration.deviceId,
        credentialId: registration.credentialId,
        publicKey: registration.publicKey,
        deviceName: registration.deviceName,
        platform: registration.platform,
        isActive: true,
        createdAt: new Date(),
        lastUsedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      return false;
    }
  }

  // Authenticate using biometric credential
  async authenticateBiometric(auth: BiometricAuthentication): Promise<boolean> {
    try {
      // Get stored credential
      const credential = await db.select()
        .from(biometricCredentials)
        .where(
          and(
            eq(biometricCredentials.userId, auth.userId),
            eq(biometricCredentials.credentialId, auth.credentialId),
            eq(biometricCredentials.isActive, true)
          )
        );

      if (credential.length === 0) {
        return false;
      }

      // Verify challenge
      const isValidChallenge = await this.verifyChallenge(auth.userId, auth.challenge);
      if (!isValidChallenge) {
        return false;
      }

      // Verify signature (simplified - in production use WebAuthn verification library)
      const isValidSignature = this.verifySignature(
        credential[0].publicKey,
        auth.signature,
        auth.clientData,
        auth.challenge
      );

      if (isValidSignature) {
        // Update last used timestamp
        await db.update(biometricCredentials)
          .set({ lastUsedAt: new Date() })
          .where(eq(biometricCredentials.id, credential[0].id));
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  // Get user's registered biometric devices
  async getUserBiometricDevices(userId: string) {
    try {
      const devices = await db.select({
        id: biometricCredentials.id,
        deviceId: biometricCredentials.deviceId,
        deviceName: biometricCredentials.deviceName,
        platform: biometricCredentials.platform,
        createdAt: biometricCredentials.createdAt,
        lastUsedAt: biometricCredentials.lastUsedAt,
        isActive: biometricCredentials.isActive
      })
      .from(biometricCredentials)
      .where(eq(biometricCredentials.userId, userId));

      return devices;
    } catch (error) {
      console.error('Failed to get user biometric devices:', error);
      return [];
    }
  }

  // Deactivate biometric credential
  async deactivateBiometricCredential(userId: string, credentialId: string): Promise<boolean> {
    try {
      const result = await db.update(biometricCredentials)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(biometricCredentials.userId, userId),
            eq(biometricCredentials.credentialId, credentialId)
          )
        );

      return true;
    } catch (error) {
      console.error('Failed to deactivate biometric credential:', error);
      return false;
    }
  }

  // Check if biometric authentication is available for user
  async isBiometricAvailable(userId: string): Promise<boolean> {
    try {
      const activeCredentials = await db.select()
        .from(biometricCredentials)
        .where(
          and(
            eq(biometricCredentials.userId, userId),
            eq(biometricCredentials.isActive, true)
          )
        );

      return activeCredentials.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Platform-specific biometric capabilities
  getBiometricCapabilities(userAgent: string): {
    platform: string;
    supportsFaceId: boolean;
    supportsTouchId: boolean;
    supportsWindowsHello: boolean;
  } {
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isWindows = /Windows/.test(userAgent);
    const isMac = /Macintosh/.test(userAgent);

    return {
      platform: isIOS ? 'ios' : isAndroid ? 'android' : isWindows ? 'windows' : isMac ? 'macos' : 'unknown',
      supportsFaceId: isIOS || isAndroid,
      supportsTouchId: isIOS || isAndroid || isMac,
      supportsWindowsHello: isWindows
    };
  }

  // Private helper methods
  private async storeChallengeTemporarily(userId: string, challenge: string): Promise<void> {
    // In production, use Redis or similar for temporary storage
    // For now, we'll use a simple in-memory store with expiration
    const challenges = new Map<string, { challenge: string; expires: number }>();
    challenges.set(userId, {
      challenge,
      expires: Date.now() + 300000 // 5 minutes
    });

    // Cleanup expired challenges
    setTimeout(() => {
      const stored = challenges.get(userId);
      if (stored && stored.expires <= Date.now()) {
        challenges.delete(userId);
      }
    }, 300000);
  }

  private async verifyChallenge(userId: string, challenge: string): Promise<boolean> {
    // In production, verify against stored challenge
    // For now, accept any non-empty challenge
    return challenge && challenge.length > 0;
  }

  private verifySignature(
    publicKey: string,
    signature: string,
    clientData: string,
    challenge: string
  ): boolean {
    // In production, implement proper WebAuthn signature verification
    // This would involve:
    // 1. Parsing the signature and client data
    // 2. Reconstructing the signed data
    // 3. Verifying the signature using the stored public key
    
    // For now, return true for any non-empty signature
    return signature && signature.length > 0;
  }

  // Generate device fingerprint for additional security
  generateDeviceFingerprint(userAgent: string, ip: string): string {
    const crypto = require('crypto');
    const fingerprint = `${userAgent}|${ip}|${Date.now()}`;
    return crypto.createHash('sha256').update(fingerprint).digest('hex');
  }
}

export const biometricService = new BiometricService();