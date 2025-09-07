import { z } from 'zod';

// Secure QR Payload Schema v1.0
// This schema ensures QR codes cannot be tampered with and have proper expiry
export const SecureQRPayloadSchema = z.object({
  // Protocol version for future compatibility
  version: z.literal('1.0'),
  
  // Request type for different QR use cases
  type: z.enum(['proof_verification', 'identity_share', 'login_request']),
  
  // Unique nonce to prevent replay attacks
  nonce: z.string().min(32, 'Nonce must be at least 32 characters'),
  
  // Expiry timestamp to prevent stale QR codes
  expiresAt: z.number().int().positive(),
  
  // Issuer information for validation
  issuer: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    domain: z.string().url().optional()
  }),
  
  // Request-specific payload data
  payload: z.object({
    // For proof verification requests
    proofTypes: z.array(z.string()).optional(),
    requiredFields: z.array(z.string()).optional(),
    
    // For identity sharing requests  
    sharedProofId: z.string().optional(),
    
    // For login requests
    sessionId: z.string().optional(),
    redirectUrl: z.string().url().optional()
  }),
  
  // Cryptographic signature to prevent tampering
  signature: z.string().min(64, 'Signature must be at least 64 characters'),
  
  // Optional metadata
  metadata: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    timestamp: z.number().int().positive()
  }).optional()
});

export type SecureQRPayload = z.infer<typeof SecureQRPayloadSchema>;

// QR Token Schema for deep-link URLs (/verify/:token)
export const QRTokenSchema = z.object({
  // Base64-encoded, encrypted SecureQRPayload
  token: z.string().min(100, 'Token must be properly encoded'),
  
  // Quick validation checksum
  checksum: z.string().length(8, 'Checksum must be exactly 8 characters')
});

export type QRToken = z.infer<typeof QRTokenSchema>;

// QR Generation Request Schema
export const QRGenerationRequestSchema = z.object({
  type: z.enum(['proof_verification', 'identity_share', 'login_request']),
  
  // Expiry in minutes from now (default: 15 minutes)
  expiryMinutes: z.number().int().min(1).max(1440).default(15),
  
  // Request-specific data
  payload: z.object({
    proofTypes: z.array(z.string()).optional(),
    requiredFields: z.array(z.string()).optional(),
    sharedProofId: z.string().optional(),
    sessionId: z.string().optional(),
    redirectUrl: z.string().url().optional()
  }),
  
  // Optional issuer override (uses org data by default)
  issuer: z.object({
    name: z.string().min(1),
    domain: z.string().url().optional()
  }).optional()
});

export type QRGenerationRequest = z.infer<typeof QRGenerationRequestSchema>;

// QR Verification Result Schema
export const QRVerificationResultSchema = z.object({
  success: z.boolean(),
  
  // If successful
  payload: SecureQRPayloadSchema.optional(),
  
  // If failed
  error: z.object({
    code: z.enum([
      'INVALID_FORMAT',
      'EXPIRED',
      'INVALID_SIGNATURE', 
      'REPLAY_ATTACK',
      'UNSUPPORTED_VERSION'
    ]),
    message: z.string(),
    details: z.any().optional()
  }).optional(),
  
  // Verification metadata
  metadata: z.object({
    verifiedAt: z.number().int().positive(),
    timeToExpiry: z.number().int(), // Seconds until expiry (negative if expired)
    issuerVerified: z.boolean(),
    nonceChecked: z.boolean()
  })
});

export type QRVerificationResult = z.infer<typeof QRVerificationResultSchema>;

// Constants for QR security
export const QR_SECURITY_CONFIG = {
  // Minimum and maximum expiry times
  MIN_EXPIRY_MINUTES: 1,
  MAX_EXPIRY_MINUTES: 1440, // 24 hours
  DEFAULT_EXPIRY_MINUTES: 15,
  
  // Nonce requirements
  NONCE_LENGTH: 32,
  
  // Signature requirements
  MIN_SIGNATURE_LENGTH: 64,
  
  // Rate limiting
  MAX_QR_GENERATION_PER_HOUR: 100,
  MAX_QR_VERIFICATION_PER_HOUR: 1000,
  
  // Deep link configuration
  DEEP_LINK_BASE: '/verify',
  QR_CODE_SIZE: 256, // pixels
  
  // Version for compatibility
  CURRENT_VERSION: '1.0' as const
};

// Error messages for consistent UX
export const QR_ERROR_MESSAGES = {
  INVALID_FORMAT: 'This QR code is not a valid Veridity verification request.',
  EXPIRED: 'This QR code has expired. Please request a new one.',
  INVALID_SIGNATURE: 'This QR code appears to have been tampered with.',
  REPLAY_ATTACK: 'This QR code has already been used.',
  UNSUPPORTED_VERSION: 'This QR code uses an unsupported format version.',
  NETWORK_ERROR: 'Unable to verify QR code. Please check your connection.',
  PERMISSION_DENIED: 'You do not have permission to verify this QR code.',
  SERVER_ERROR: 'Server error occurred during verification. Please try again.'
} as const;