import { WebSocket } from 'ws';
import { zkVerifier } from '../zkp/verifier';
import { EventEmitter } from 'events';

export interface VerificationRequest {
  id: string;
  proofType: string;
  proof: any;
  publicSignals: string[];
  timestamp: string;
  clientId: string;
}

export interface VerificationResponse {
  id: string;
  isValid: boolean;
  timestamp: string;
  verificationTime: number;
  errors?: string[];
}

export class RealTimeVerificationHandler extends EventEmitter {
  private activeConnections: Map<string, WebSocket> = new Map();
  private verificationQueue: VerificationRequest[] = [];
  private processingQueue: boolean = false;

  constructor() {
    super();
    this.startQueueProcessor();
  }

  // Handle new WebSocket connection
  handleConnection(ws: WebSocket, clientId: string) {
    this.activeConnections.set(clientId, ws);
    console.log(`📱 Real-time verification client connected: ${clientId}`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection_established',
      clientId,
      timestamp: new Date().toISOString(),
      capabilities: {
        realTimeVerification: true,
        batchVerification: true,
        proofTypes: ['age_over_18', 'age_over_21', 'citizenship_verification']
      }
    });

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleClientMessage(clientId, message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
        this.sendError(clientId, 'Invalid message format');
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      this.activeConnections.delete(clientId);
      console.log(`📱 Client disconnected: ${clientId}`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.activeConnections.delete(clientId);
    });
  }

  private async handleClientMessage(clientId: string, message: any) {
    switch (message.type) {
      case 'verify_proof':
        await this.handleVerificationRequest(clientId, message);
        break;
        
      case 'batch_verify':
        await this.handleBatchVerification(clientId, message);
        break;
        
      case 'get_status':
        this.handleStatusRequest(clientId);
        break;
        
      default:
        this.sendError(clientId, `Unknown message type: ${message.type}`);
    }
  }

  private async handleVerificationRequest(clientId: string, message: any) {
    const request: VerificationRequest = {
      id: message.id || this.generateRequestId(),
      proofType: message.proofType,
      proof: message.proof,
      publicSignals: message.publicSignals,
      timestamp: new Date().toISOString(),
      clientId
    };

    // Add to queue for processing
    this.verificationQueue.push(request);
    
    // Send acknowledgment
    this.sendToClient(clientId, {
      type: 'verification_queued',
      requestId: request.id,
      queuePosition: this.verificationQueue.length,
      estimatedTime: this.estimateProcessingTime()
    });

    this.emit('verification_request', request);
  }

  private async handleBatchVerification(clientId: string, message: any) {
    const requests = message.proofs.map((proof: any, index: number) => ({
      id: `${message.batchId}_${index}`,
      proofType: proof.proofType,
      proof: proof.proof,
      publicSignals: proof.publicSignals,
      timestamp: new Date().toISOString(),
      clientId
    }));

    // Add all to queue
    this.verificationQueue.push(...requests);
    
    this.sendToClient(clientId, {
      type: 'batch_verification_queued',
      batchId: message.batchId,
      count: requests.length,
      estimatedTime: this.estimateProcessingTime() * requests.length
    });

    requests.forEach(request => this.emit('verification_request', request));
  }

  private handleStatusRequest(clientId: string) {
    this.sendToClient(clientId, {
      type: 'status_response',
      queueLength: this.verificationQueue.length,
      isProcessing: this.processingQueue,
      connectedClients: this.activeConnections.size,
      timestamp: new Date().toISOString()
    });
  }

  private startQueueProcessor() {
    setInterval(async () => {
      if (this.processingQueue || this.verificationQueue.length === 0) {
        return;
      }

      this.processingQueue = true;
      
      try {
        // Process up to 5 verifications at once
        const batch = this.verificationQueue.splice(0, 5);
        
        await Promise.all(batch.map(request => this.processVerification(request)));
      } catch (error) {
        console.error('Queue processing error:', error);
      } finally {
        this.processingQueue = false;
      }
    }, 1000); // Process every second
  }

  private async processVerification(request: VerificationRequest) {
    const startTime = Date.now();
    
    try {
      // Send processing notification
      this.sendToClient(request.clientId, {
        type: 'verification_processing',
        requestId: request.id,
        timestamp: new Date().toISOString()
      });

      // Perform actual verification
      const isValid = await zkVerifier.verifyProof(
        request.proofType,
        request.proof,
        request.publicSignals
      );

      const verificationTime = Date.now() - startTime;

      const response: VerificationResponse = {
        id: request.id,
        isValid,
        timestamp: new Date().toISOString(),
        verificationTime
      };

      // Send result
      this.sendToClient(request.clientId, {
        type: 'verification_result',
        ...response
      });

      this.emit('verification_complete', response);

    } catch (error) {
      const verificationTime = Date.now() - startTime;
      
      const response: VerificationResponse = {
        id: request.id,
        isValid: false,
        timestamp: new Date().toISOString(),
        verificationTime,
        errors: [error.message]
      };

      this.sendToClient(request.clientId, {
        type: 'verification_error',
        ...response
      });

      this.emit('verification_error', response);
    }
  }

  private sendToClient(clientId: string, message: any) {
    const ws = this.activeConnections.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(clientId: string, error: string) {
    this.sendToClient(clientId, {
      type: 'error',
      message: error,
      timestamp: new Date().toISOString()
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateProcessingTime(): number {
    // Estimate based on queue length and processing capability
    const baseTime = 2000; // 2 seconds base processing time
    const queueDelay = this.verificationQueue.length * 500; // 0.5s per item in queue
    return baseTime + queueDelay;
  }

  // Broadcast to all connected clients
  broadcast(message: any) {
    this.activeConnections.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          ...message,
          timestamp: new Date().toISOString()
        }));
      }
    });
  }

  // Get statistics
  getStats() {
    return {
      connectedClients: this.activeConnections.size,
      queueLength: this.verificationQueue.length,
      isProcessing: this.processingQueue,
      uptime: process.uptime()
    };
  }
}

export const verificationHandler = new RealTimeVerificationHandler();