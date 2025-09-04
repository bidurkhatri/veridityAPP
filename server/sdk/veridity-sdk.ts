/**
 * Veridity SDK for third-party integrations
 */

export interface VeridityConfig {
  apiUrl: string;
  apiKey: string;
  version: string;
  timeout: number;
}

export interface SDKProofRequest {
  type: string;
  requiredFields: string[];
  organizationId: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface SDKProofResponse {
  proofId: string;
  status: 'pending' | 'completed' | 'rejected';
  verificationUrl: string;
  qrCode?: string;
  expiresAt: Date;
}

export interface SDKVerificationResult {
  proofId: string;
  verified: boolean;
  claims: Record<string, any>;
  confidence: number;
  timestamp: Date;
  organizationId: string;
}

class VeriditySDK {
  private config: VeridityConfig;

  constructor(config: VeridityConfig) {
    this.config = {
      version: '1.0.0',
      timeout: 30000,
      ...config
    };
  }

  // Request a proof from a user
  async requestProof(request: SDKProofRequest): Promise<SDKProofResponse> {
    const response = await this.makeRequest('POST', '/api/sdk/proof/request', {
      ...request,
      organizationId: this.config.apiKey // Use API key as org identifier
    });

    return {
      proofId: response.proofId,
      status: response.status,
      verificationUrl: `${this.config.apiUrl}/verify/${response.proofId}`,
      qrCode: response.qrCode,
      expiresAt: new Date(response.expiresAt)
    };
  }

  // Verify a submitted proof
  async verifyProof(proofId: string): Promise<SDKVerificationResult> {
    const response = await this.makeRequest('GET', `/api/sdk/proof/verify/${proofId}`);
    
    return {
      proofId: response.proofId,
      verified: response.verified,
      claims: response.claims,
      confidence: response.confidence,
      timestamp: new Date(response.timestamp),
      organizationId: response.organizationId
    };
  }

  // Get proof status
  async getProofStatus(proofId: string): Promise<{ status: string; details: any }> {
    const response = await this.makeRequest('GET', `/api/sdk/proof/status/${proofId}`);
    return response;
  }

  // List available proof types
  async getAvailableProofTypes(): Promise<Array<{ id: string; name: string; description: string }>> {
    const response = await this.makeRequest('GET', '/api/sdk/proof/types');
    return response.proofTypes;
  }

  // Webhook endpoints for real-time updates
  setupWebhook(callbackUrl: string, events: string[] = ['proof.completed', 'proof.rejected']): Promise<{ webhookId: string }> {
    return this.makeRequest('POST', '/api/sdk/webhooks', {
      callbackUrl,
      events
    });
  }

  // Analytics and reporting
  async getAnalytics(startDate: Date, endDate: Date): Promise<{
    totalRequests: number;
    completedProofs: number;
    rejectedProofs: number;
    averageCompletionTime: number;
  }> {
    const response = await this.makeRequest('GET', '/api/sdk/analytics', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    return response;
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.config.apiUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'User-Agent': `Veridity-SDK/${this.config.version}`,
        'X-SDK-Version': this.config.version
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    } else if (data && method === 'GET') {
      const params = new URLSearchParams(data);
      url += `?${params.toString()}`;
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new VeriditySDKError(
          `HTTP ${response.status}: ${errorData.message || 'Request failed'}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof VeriditySDKError) {
        throw error;
      }
      
      throw new VeriditySDKError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        { originalError: error }
      );
    }
  }
}

export class VeriditySDKError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'VeriditySDKError';
  }
}

// Factory function for easy SDK creation
export function createVeriditySDK(apiUrl: string, apiKey: string, options?: Partial<VeridityConfig>): VeriditySDK {
  return new VeriditySDK({
    apiUrl,
    apiKey,
    ...options
  } as VeridityConfig);
}

// Example usage documentation
export const USAGE_EXAMPLES = {
  basicSetup: `
    import { createVeriditySDK } from '@veridity/sdk';
    
    const sdk = createVeriditySDK(
      'https://api.veridity.app',
      'your-api-key-here'
    );
  `,
  
  requestProof: `
    const proofRequest = await sdk.requestProof({
      type: 'age_verification',
      requiredFields: ['age_over_18'],
      organizationId: 'your-org-id',
      callbackUrl: 'https://yourapp.com/webhook'
    });
    
    console.log('Send user to:', proofRequest.verificationUrl);
  `,
  
  verifyProof: `
    const verification = await sdk.verifyProof(proofId);
    
    if (verification.verified) {
      console.log('Proof verified:', verification.claims);
    } else {
      console.log('Proof verification failed');
    }
  `,
  
  webhookSetup: `
    await sdk.setupWebhook(
      'https://yourapp.com/veridity-webhook',
      ['proof.completed', 'proof.rejected']
    );
  `
};

export { VeriditySDK };