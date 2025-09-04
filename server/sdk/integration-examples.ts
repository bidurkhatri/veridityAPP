/**
 * SDK Integration Examples and Documentation
 * Comprehensive examples for developers integrating with Veridity
 */

export interface SDKConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  webhookSecret?: string;
}

export interface SDKResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  requestId: string;
  timestamp: Date;
}

export interface ProofGenerationRequest {
  userId: string;
  proofType: 'age_verification' | 'citizenship' | 'education' | 'income' | 'employment';
  userData: Record<string, any>;
  requirements?: {
    minimumAge?: number;
    jurisdiction?: string;
    verificationLevel?: 'basic' | 'enhanced' | 'premium';
  };
}

export interface VerificationRequest {
  proofId: string;
  proof: string;
  verificationKey: string;
  requiredAttributes?: string[];
}

export interface WebhookEvent {
  id: string;
  type: 'proof.generated' | 'proof.verified' | 'user.registered' | 'verification.failed';
  data: Record<string, any>;
  timestamp: Date;
  signature: string;
}

class VeriditySDK {
  private config: SDKConfig;
  private requestId: number = 0;

  constructor(config: SDKConfig) {
    this.config = {
      baseUrl: 'https://api.veridity.app',
      timeout: 30000,
      retryAttempts: 3,
      ...config
    };
  }

  // Authentication
  async authenticate(): Promise<SDKResponse<{ token: string; expiresAt: Date }>> {
    return this.makeRequest('/auth/api-key', {
      method: 'POST',
      body: { apiKey: this.config.apiKey }
    });
  }

  // Proof Generation
  async generateProof(request: ProofGenerationRequest): Promise<SDKResponse<{
    proofId: string;
    proof: string;
    verificationKey: string;
    metadata: Record<string, any>;
  }>> {
    return this.makeRequest('/proofs/generate', {
      method: 'POST',
      body: request
    });
  }

  // Proof Verification
  async verifyProof(request: VerificationRequest): Promise<SDKResponse<{
    valid: boolean;
    attributes: Record<string, any>;
    confidence: number;
    issuer: string;
  }>> {
    return this.makeRequest('/proofs/verify', {
      method: 'POST',
      body: request
    });
  }

  // Batch Operations
  async batchGenerateProofs(requests: ProofGenerationRequest[]): Promise<SDKResponse<Array<{
    requestId: string;
    status: 'success' | 'failed';
    proofId?: string;
    error?: string;
  }>>> {
    return this.makeRequest('/proofs/batch-generate', {
      method: 'POST',
      body: { requests }
    });
  }

  async batchVerifyProofs(requests: VerificationRequest[]): Promise<SDKResponse<Array<{
    requestId: string;
    valid: boolean;
    confidence?: number;
    error?: string;
  }>>> {
    return this.makeRequest('/proofs/batch-verify', {
      method: 'POST',
      body: { requests }
    });
  }

  // User Management
  async registerUser(userData: {
    email: string;
    name: string;
    jurisdiction?: string;
    metadata?: Record<string, any>;
  }): Promise<SDKResponse<{ userId: string; status: string }>> {
    return this.makeRequest('/users/register', {
      method: 'POST',
      body: userData
    });
  }

  async getUserProofs(userId: string): Promise<SDKResponse<Array<{
    proofId: string;
    type: string;
    status: string;
    createdAt: Date;
    expiresAt?: Date;
  }>>> {
    return this.makeRequest(`/users/${userId}/proofs`);
  }

  // Webhook Management
  async registerWebhook(webhookData: {
    url: string;
    events: string[];
    secret?: string;
  }): Promise<SDKResponse<{ webhookId: string }>> {
    return this.makeRequest('/webhooks/register', {
      method: 'POST',
      body: webhookData
    });
  }

  verifyWebhookSignature(payload: string, signature: string, secret?: string): boolean {
    const webhookSecret = secret || this.config.webhookSecret;
    if (!webhookSecret) return false;

    // Simplified signature verification
    const expectedSignature = `sha256=${Buffer.from(payload + webhookSecret).toString('hex')}`;
    return signature === expectedSignature;
  }

  // Utility Methods
  private async makeRequest(endpoint: string, options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
  }): Promise<SDKResponse> {
    const requestId = `req-${++this.requestId}-${Date.now()}`;
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
      
      // Simulate various responses based on endpoint
      const mockResponse = this.generateMockResponse(endpoint, options);
      
      return {
        success: true,
        data: mockResponse,
        requestId,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'SDK_ERROR',
        requestId,
        timestamp: new Date()
      };
    }
  }

  private generateMockResponse(endpoint: string, options?: any): any {
    switch (endpoint) {
      case '/auth/api-key':
        return {
          token: `tk_${Math.random().toString(36).substr(2, 32)}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

      case '/proofs/generate':
        return {
          proofId: `proof_${Math.random().toString(36).substr(2, 16)}`,
          proof: `zk_proof_${Math.random().toString(36).substr(2, 64)}`,
          verificationKey: `vk_${Math.random().toString(36).substr(2, 32)}`,
          metadata: {
            proofType: options?.body?.proofType || 'age_verification',
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        };

      case '/proofs/verify':
        return {
          valid: Math.random() > 0.1, // 90% success rate
          attributes: {
            age_verified: true,
            minimum_age: 18,
            jurisdiction: 'US'
          },
          confidence: 0.95 + Math.random() * 0.05,
          issuer: 'Veridity Platform'
        };

      case '/users/register':
        return {
          userId: `user_${Math.random().toString(36).substr(2, 16)}`,
          status: 'registered'
        };

      default:
        return { message: 'Mock response' };
    }
  }
}

// Integration Examples

// Example 1: Basic Age Verification
export const basicAgeVerificationExample = `
import { VeriditySDK } from '@veridity/sdk';

const sdk = new VeriditySDK({
  apiKey: 'vk_live_abcd1234...',
  environment: 'production'
});

async function verifyUserAge(userId: string, minAge: number) {
  try {
    // Generate age verification proof
    const proofResponse = await sdk.generateProof({
      userId: userId,
      proofType: 'age_verification',
      userData: {
        dateOfBirth: '1990-01-01',
        documentNumber: 'DL123456789'
      },
      requirements: {
        minimumAge: minAge
      }
    });

    if (!proofResponse.success) {
      throw new Error(proofResponse.error);
    }

    // Verify the generated proof
    const verificationResponse = await sdk.verifyProof({
      proofId: proofResponse.data.proofId,
      proof: proofResponse.data.proof,
      verificationKey: proofResponse.data.verificationKey,
      requiredAttributes: ['age_verified', 'minimum_age']
    });

    return {
      ageVerified: verificationResponse.data.valid,
      confidence: verificationResponse.data.confidence,
      attributes: verificationResponse.data.attributes
    };
  } catch (error) {
    console.error('Age verification failed:', error);
    return { ageVerified: false, error: error.message };
  }
}

// Usage
verifyUserAge('user_123', 21).then(result => {
  if (result.ageVerified) {
    console.log('User is old enough');
  } else {
    console.log('Age verification failed');
  }
});
`;

// Example 2: React Integration
export const reactIntegrationExample = `
import React, { useState, useEffect } from 'react';
import { VeriditySDK } from '@veridity/sdk';

const sdk = new VeriditySDK({
  apiKey: process.env.REACT_APP_VERIDITY_API_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
});

function IdentityVerification({ userId }) {
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [proofData, setProofData] = useState(null);

  const handleVerification = async () => {
    setVerificationStatus('generating');
    
    try {
      const response = await sdk.generateProof({
        userId: userId,
        proofType: 'citizenship',
        userData: {
          passportNumber: 'AB1234567',
          nationality: 'NP'
        }
      });

      if (response.success) {
        setProofData(response.data);
        setVerificationStatus('completed');
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus('failed');
    }
  };

  return (
    <div className="identity-verification">
      <h2>Identity Verification</h2>
      
      {verificationStatus === 'idle' && (
        <button onClick={handleVerification}>
          Start Verification
        </button>
      )}
      
      {verificationStatus === 'generating' && (
        <div className="loading">
          Generating proof...
        </div>
      )}
      
      {verificationStatus === 'completed' && (
        <div className="success">
          <h3>Verification Complete</h3>
          <p>Proof ID: {proofData.proofId}</p>
          <p>Status: Verified</p>
        </div>
      )}
      
      {verificationStatus === 'failed' && (
        <div className="error">
          Verification failed. Please try again.
        </div>
      )}
    </div>
  );
}

export default IdentityVerification;
`;

// Example 3: Node.js Backend Integration
export const nodeBackendExample = `
const express = require('express');
const { VeriditySDK } = require('@veridity/sdk');

const app = express();
app.use(express.json());

const sdk = new VeriditySDK({
  apiKey: process.env.VERIDITY_API_KEY,
  environment: 'production',
  webhookSecret: process.env.VERIDITY_WEBHOOK_SECRET
});

// Endpoint to start verification
app.post('/api/verify-identity', async (req, res) => {
  const { userId, verificationType, userData } = req.body;

  try {
    const response = await sdk.generateProof({
      userId,
      proofType: verificationType,
      userData
    });

    if (response.success) {
      res.json({
        success: true,
        proofId: response.data.proofId,
        verificationKey: response.data.verificationKey
      });
    } else {
      res.status(400).json({
        success: false,
        error: response.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Webhook endpoint for verification events
app.post('/api/webhooks/veridity', (req, res) => {
  const signature = req.headers['x-veridity-signature'];
  const payload = JSON.stringify(req.body);

  // Verify webhook signature
  if (!sdk.verifyWebhookSignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;
  
  switch (event.type) {
    case 'proof.generated':
      console.log('Proof generated:', event.data.proofId);
      // Handle proof generation
      break;
      
    case 'proof.verified':
      console.log('Proof verified:', event.data.proofId);
      // Handle successful verification
      break;
      
    case 'verification.failed':
      console.log('Verification failed:', event.data.reason);
      // Handle verification failure
      break;
  }

  res.json({ received: true });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
`;

// Example 4: Python Integration
export const pythonIntegrationExample = `
import requests
import json
import hashlib
import hmac
from datetime import datetime

class VeriditySDK:
    def __init__(self, api_key, environment='production'):
        self.api_key = api_key
        self.base_url = 'https://api.veridity.app' if environment == 'production' else 'https://sandbox.veridity.app'
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })

    def generate_proof(self, user_id, proof_type, user_data, requirements=None):
        payload = {
            'userId': user_id,
            'proofType': proof_type,
            'userData': user_data
        }
        
        if requirements:
            payload['requirements'] = requirements
            
        response = self.session.post(f'{self.base_url}/proofs/generate', json=payload)
        return response.json()

    def verify_proof(self, proof_id, proof, verification_key, required_attributes=None):
        payload = {
            'proofId': proof_id,
            'proof': proof,
            'verificationKey': verification_key
        }
        
        if required_attributes:
            payload['requiredAttributes'] = required_attributes
            
        response = self.session.post(f'{self.base_url}/proofs/verify', json=payload)
        return response.json()

    def verify_webhook_signature(self, payload, signature, secret):
        expected_signature = 'sha256=' + hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)

# Usage example
def main():
    sdk = VeriditySDK(
        api_key='vk_live_abcd1234...',
        environment='production'
    )
    
    # Generate age verification proof
    proof_response = sdk.generate_proof(
        user_id='user_123',
        proof_type='age_verification',
        user_data={
            'dateOfBirth': '1990-01-01',
            'documentNumber': 'DL123456789'
        },
        requirements={
            'minimumAge': 18
        }
    )
    
    if proof_response['success']:
        print(f"Proof generated: {proof_response['data']['proofId']}")
        
        # Verify the proof
        verification_response = sdk.verify_proof(
            proof_id=proof_response['data']['proofId'],
            proof=proof_response['data']['proof'],
            verification_key=proof_response['data']['verificationKey']
        )
        
        if verification_response['success'] and verification_response['data']['valid']:
            print("Age verification successful!")
        else:
            print("Age verification failed")
    else:
        print(f"Error generating proof: {proof_response['error']}")

if __name__ == '__main__':
    main()
`;

// Example 5: Mobile Flutter Integration
export const flutterIntegrationExample = `
import 'dart:convert';
import 'package:http/http.dart' as http;

class VeriditySDK {
  final String apiKey;
  final String baseUrl;
  
  VeriditySDK({
    required this.apiKey,
    String environment = 'production',
  }) : baseUrl = environment == 'production' 
        ? 'https://api.veridity.app'
        : 'https://sandbox.veridity.app';

  Future<Map<String, dynamic>> generateProof({
    required String userId,
    required String proofType,
    required Map<String, dynamic> userData,
    Map<String, dynamic>? requirements,
  }) async {
    final payload = {
      'userId': userId,
      'proofType': proofType,
      'userData': userData,
      if (requirements != null) 'requirements': requirements,
    };

    final response = await http.post(
      Uri.parse('$baseUrl/proofs/generate'),
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
      body: json.encode(payload),
    );

    return json.decode(response.body);
  }

  Future<Map<String, dynamic>> verifyProof({
    required String proofId,
    required String proof,
    required String verificationKey,
    List<String>? requiredAttributes,
  }) async {
    final payload = {
      'proofId': proofId,
      'proof': proof,
      'verificationKey': verificationKey,
      if (requiredAttributes != null) 'requiredAttributes': requiredAttributes,
    };

    final response = await http.post(
      Uri.parse('$baseUrl/proofs/verify'),
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
      body: json.encode(payload),
    );

    return json.decode(response.body);
  }
}

// Flutter Widget Example
class IdentityVerificationWidget extends StatefulWidget {
  final String userId;
  
  const IdentityVerificationWidget({Key? key, required this.userId}) : super(key: key);

  @override
  _IdentityVerificationWidgetState createState() => _IdentityVerificationWidgetState();
}

class _IdentityVerificationWidgetState extends State<IdentityVerificationWidget> {
  final VeriditySDK sdk = VeriditySDK(apiKey: 'your_api_key_here');
  String verificationStatus = 'idle';
  String? proofId;

  Future<void> startVerification() async {
    setState(() {
      verificationStatus = 'generating';
    });

    try {
      final response = await sdk.generateProof(
        userId: widget.userId,
        proofType: 'age_verification',
        userData: {
          'dateOfBirth': '1990-01-01',
          'documentType': 'passport',
        },
        requirements: {
          'minimumAge': 18,
        },
      );

      if (response['success']) {
        setState(() {
          verificationStatus = 'completed';
          proofId = response['data']['proofId'];
        });
      } else {
        setState(() {
          verificationStatus = 'failed';
        });
      }
    } catch (e) {
      setState(() {
        verificationStatus = 'failed';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text(
              'Identity Verification',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            
            if (verificationStatus == 'idle')
              ElevatedButton(
                onPressed: startVerification,
                child: const Text('Start Verification'),
              ),
            
            if (verificationStatus == 'generating')
              const Column(
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 8),
                  Text('Generating proof...'),
                ],
              ),
            
            if (verificationStatus == 'completed')
              Column(
                children: [
                  const Icon(Icons.check_circle, color: Colors.green, size: 48),
                  const SizedBox(height: 8),
                  const Text('Verification Complete'),
                  Text('Proof ID: $proofId'),
                ],
              ),
            
            if (verificationStatus == 'failed')
              const Column(
                children: [
                  Icon(Icons.error, color: Colors.red, size: 48),
                  SizedBox(height: 8),
                  Text('Verification Failed'),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
`;

export const sdkExamples = {
  basicAgeVerification: basicAgeVerificationExample,
  reactIntegration: reactIntegrationExample,
  nodeBackend: nodeBackendExample,
  pythonIntegration: pythonIntegrationExample,
  flutterIntegration: flutterIntegrationExample
};

export { VeriditySDK };