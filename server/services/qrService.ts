import QRCode from 'qrcode';
import crypto from 'crypto';

export interface ProofQRData {
  id: string;
  proofId: string;
  proofType: string;
  expiresAt: number;
  issuer: string;
  verificationUrl: string;
  publicSignals?: any;
}

export interface VerificationRequest {
  id: string;
  organizationId: string;
  requiredProofType: string;
  nonce: string;
  expiresAt: number;
  callbackUrl?: string;
}

export class QRCodeService {
  private static readonly QR_VERSION = '1.0';
  private static readonly BASE_URL = process.env.VERIDITY_BASE_URL || 'https://veridity.replit.app';

  // Generate QR code for sharing a proof
  static async generateProofQR(
    proofId: string,
    proofType: string,
    publicSignals: any,
    expiryMinutes: number = 15
  ): Promise<{
    qrCodeDataUrl: string;
    shareableUrl: string;
    expiresAt: Date;
  }> {
    try {
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
      
      const qrData: ProofQRData = {
        id: this.generateQRId(),
        proofId,
        proofType,
        expiresAt: Math.floor(expiresAt.getTime() / 1000),
        issuer: 'Veridity',
        verificationUrl: `${this.BASE_URL}/verify/${proofId}`,
        publicSignals
      };

      // Create compact QR payload
      const qrPayload = JSON.stringify(qrData);
      
      // Generate QR code with high error correction for mobile scanning
      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 300
      });

      return {
        qrCodeDataUrl,
        shareableUrl: qrData.verificationUrl,
        expiresAt
      };
    } catch (error: any) {
      console.error('QR generation failed:', error);
      throw new Error(`Failed to generate QR code: ${error?.message || error}`);
    }
  }

  // Generate QR code for verification requests (from organizations)
  static async generateVerificationRequestQR(
    organizationId: string,
    requiredProofType: string,
    callbackUrl?: string,
    expiryMinutes: number = 10
  ): Promise<{
    qrCodeDataUrl: string;
    requestData: VerificationRequest;
  }> {
    try {
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
      
      const requestData: VerificationRequest = {
        id: this.generateRequestId(),
        organizationId,
        requiredProofType,
        nonce: this.generateNonce(),
        expiresAt: Math.floor(expiresAt.getTime() / 1000),
        callbackUrl
      };

      // Create verification request URL
      const requestUrl = `${this.BASE_URL}/respond/${requestData.id}?type=${requiredProofType}&org=${organizationId}&nonce=${requestData.nonce}`;
      
      // Generate QR code for the request
      const qrCodeDataUrl = await QRCode.toDataURL(requestUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#1a365d', // Darker blue for verification requests
          light: '#FFFFFF'
        },
        width: 250
      });

      return {
        qrCodeDataUrl,
        requestData
      };
    } catch (error: any) {
      console.error('Verification request QR generation failed:', error);
      throw new Error(`Failed to generate verification request QR: ${error?.message || error}`);
    }
  }

  // Parse QR code data and validate
  static parseQRData(qrData: string): ProofQRData | VerificationRequest | null {
    try {
      // Try to parse as JSON first (direct QR data)
      const parsed = JSON.parse(qrData);
      
      // Validate structure
      if (this.isProofQRData(parsed)) {
        return parsed as ProofQRData;
      } else if (this.isVerificationRequest(parsed)) {
        return parsed as VerificationRequest;
      }
      
      return null;
    } catch {
      // If not JSON, try to parse as URL
      try {
        const url = new URL(qrData);
        return this.parseUrlParameters(url);
      } catch {
        return null;
      }
    }
  }

  // Validate QR code hasn't expired
  static isQRValid(qrData: ProofQRData | VerificationRequest): boolean {
    const now = Math.floor(Date.now() / 1000);
    return qrData.expiresAt > now;
  }

  // Generate secure sharing links with time limits
  static generateSecureShareLink(
    proofId: string,
    expiryMinutes: number = 15,
    accessLimits: number = 1
  ): {
    shareUrl: string;
    shareToken: string;
    expiresAt: Date;
  } {
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const shareToken = crypto.randomBytes(32).toString('hex');
    
    const shareUrl = `${this.BASE_URL}/shared/${shareToken}?proof=${proofId}&exp=${Math.floor(expiresAt.getTime() / 1000)}&max=${accessLimits}`;

    return {
      shareUrl,
      shareToken,
      expiresAt
    };
  }

  private static generateQRId(): string {
    return `qr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  }

  private static generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private static isProofQRData(data: any): boolean {
    return data && 
           typeof data.proofId === 'string' &&
           typeof data.proofType === 'string' &&
           typeof data.verificationUrl === 'string' &&
           typeof data.expiresAt === 'number';
  }

  private static isVerificationRequest(data: any): boolean {
    return data &&
           typeof data.organizationId === 'string' &&
           typeof data.requiredProofType === 'string' &&
           typeof data.nonce === 'string' &&
           typeof data.expiresAt === 'number';
  }

  private static parseUrlParameters(url: URL): VerificationRequest | null {
    const pathSegments = url.pathname.split('/');
    
    if (pathSegments[1] === 'respond' && pathSegments[2]) {
      const requestId = pathSegments[2];
      const requiredProofType = url.searchParams.get('type');
      const organizationId = url.searchParams.get('org');
      const nonce = url.searchParams.get('nonce');
      const exp = url.searchParams.get('exp');
      
      if (requiredProofType && organizationId && nonce && exp) {
        return {
          id: requestId,
          organizationId,
          requiredProofType,
          nonce,
          expiresAt: parseInt(exp),
          callbackUrl: url.searchParams.get('callback') || undefined
        };
      }
    }
    
    return null;
  }
}