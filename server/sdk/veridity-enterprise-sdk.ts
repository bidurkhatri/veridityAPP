/**
 * Veridity Enterprise SDK
 * 
 * Production-ready SDK for third-party integrations with Veridity's
 * Zero-Knowledge Proof identity verification platform.
 * 
 * @version 1.0.0
 * @author Veridity Team
 */

import { EventEmitter } from 'events';

// Core interfaces for the SDK
export interface VeridityConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
  webhookSecret?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface ProofRequest {
  proofType: 'age_verification' | 'citizenship_verification' | 'income_verification' | 'education_verification';
  requirements: {
    ageThreshold?: number;
    incomeThreshold?: number;
    educationLevel?: number;
    citizenshipCountry?: string;
  };
  metadata?: Record<string, any>;
  expiresIn?: number; // seconds
}

export interface ProofResult {
  id: string;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  proofType: string;
  isValid: boolean;
  verifiedAt?: string;
  expiresAt?: string;
  verificationDetails: {
    nullifierHash: string;
    publicSignals: string[];
    verificationTime: number;
  };
  metadata?: Record<string, any>;
}

export interface WebhookEvent {
  type: 'proof.completed' | 'proof.failed' | 'proof.expired';
  data: ProofResult;
  timestamp: string;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  status: 'active' | 'expired';
  createdAt: string;
  expiresAt: string;
  proofRequests: string[];
}

export interface BatchVerificationRequest {
  proofs: Array<{
    id: string;
    proofType: string;
    proof: any;
    publicSignals: string[];
  }>;
  webhookUrl?: string;
}

export interface BatchVerificationResult {
  batchId: string;
  totalProofs: number;
  verifiedProofs: number;
  failedProofs: number;
  results: ProofResult[];
}

// Main SDK class
export class VeriditySDK extends EventEmitter {
  private config: VeridityConfig;
  private wsConnection?: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: VeridityConfig) {
    super();
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      ...config
    };
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }
    if (!this.config.baseUrl) {
      throw new Error('Base URL is required');
    }
    if (!['sandbox', 'production'].includes(this.config.environment)) {
      throw new Error('Environment must be either "sandbox" or "production"');
    }
  }

  // Initialize SDK and establish connections
  async initialize(): Promise<void> {
    try {
      // Test API connectivity
      await this.healthCheck();
      
      // Establish WebSocket connection for real-time updates
      await this.connectWebSocket();
      
      this.emit('initialized');
      console.log('✅ Veridity SDK initialized successfully');
    } catch (error) {
      this.emit('error', error);
      throw new Error(`SDK initialization failed: ${error.message}`);
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await this.makeRequest('GET', '/health');
    return response.data;
  }

  // Create a new proof request
  async requestProof(request: ProofRequest): Promise<{ sessionId: string; verificationUrl: string }> {
    try {
      const response = await this.makeRequest('POST', '/api/v1/proof-requests', request);
      
      this.emit('proof.requested', {
        sessionId: response.data.sessionId,
        proofType: request.proofType,
        timestamp: new Date().toISOString()
      });

      return {
        sessionId: response.data.sessionId,
        verificationUrl: response.data.verificationUrl
      };
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // Get proof result by session ID
  async getProofResult(sessionId: string): Promise<ProofResult> {
    try {
      const response = await this.makeRequest('GET', `/api/v1/proof-results/${sessionId}`);
      return response.data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // Verify a proof directly (for advanced users)
  async verifyProof(proof: any, publicSignals: string[], proofType: string): Promise<ProofResult> {
    try {
      const response = await this.makeRequest('POST', '/api/v1/verify', {
        proof,
        publicSignals,
        proofType,
        timestamp: Date.now()
      });

      this.emit('proof.verified', response.data);
      return response.data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // Batch verification for multiple proofs
  async batchVerify(request: BatchVerificationRequest): Promise<BatchVerificationResult> {
    try {
      const response = await this.makeRequest('POST', '/api/v1/batch-verify', request);
      
      this.emit('batch.completed', response.data);
      return response.data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // Get user session information
  async getSession(sessionId: string): Promise<UserSession> {
    try {
      const response = await this.makeRequest('GET', `/api/v1/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // Real-time proof monitoring
  subscribeToProofUpdates(sessionId: string, callback: (result: ProofResult) => void): () => void {
    const handler = (event: any) => {
      if (event.sessionId === sessionId) {
        callback(event.data);
      }
    };

    this.on('proof.updated', handler);
    
    // Return unsubscribe function
    return () => {
      this.off('proof.updated', handler);
    };
  }

  // Webhook signature verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }

  // Parse webhook event
  parseWebhookEvent(payload: string): WebhookEvent {
    try {
      return JSON.parse(payload);
    } catch (error) {
      throw new Error('Invalid webhook payload');
    }
  }

  // Organization management
  async getOrganizationInfo(): Promise<any> {
    const response = await this.makeRequest('GET', '/api/v1/organization');
    return response.data;
  }

  async getUsageStats(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    const response = await this.makeRequest('GET', `/api/v1/usage?timeframe=${timeframe}`);
    return response.data;
  }

  // WebSocket connection management
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.config.baseUrl.replace('http', 'ws') + '/ws/enterprise';
        this.wsConnection = new WebSocket(wsUrl, [], {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        });

        this.wsConnection.onopen = () => {
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
          } catch (error) {
            this.emit('error', error);
          }
        };

        this.wsConnection.onclose = () => {
          this.emit('disconnected');
          this.attemptReconnect();
        };

        this.wsConnection.onerror = (error) => {
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'proof.updated':
        this.emit('proof.updated', message);
        break;
      case 'session.expired':
        this.emit('session.expired', message);
        break;
      case 'rate_limit.warning':
        this.emit('rate_limit.warning', message);
        break;
      default:
        this.emit('message', message);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        this.connectWebSocket().catch(error => {
          this.emit('error', error);
        });
      }, delay);
    } else {
      this.emit('error', new Error('Maximum reconnection attempts reached'));
    }
  }

  // HTTP request utility
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Veridity-SDK/1.0.0'
    };

    const options: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout!)
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(data);
    }

    let lastError: any;
    
    for (let attempt = 0; attempt < this.config.retryAttempts!; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
        }

        return {
          status: response.status,
          data: await response.json()
        };
      } catch (error) {
        lastError = error;
        if (attempt < this.config.retryAttempts! - 1) {
          // Exponential backoff for retries
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError;
  }

  // Cleanup resources
  async disconnect(): Promise<void> {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = undefined;
    }
    this.removeAllListeners();
    this.emit('disconnected');
  }
}

// Convenience factory function
export function createVeriditySDK(config: VeridityConfig): VeriditySDK {
  return new VeriditySDK(config);
}

// Export types for TypeScript users
export type {
  VeridityConfig,
  ProofRequest,
  ProofResult,
  WebhookEvent,
  UserSession,
  BatchVerificationRequest,
  BatchVerificationResult
};