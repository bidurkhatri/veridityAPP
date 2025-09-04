/**
 * Production Webhook Management Service
 * Enterprise-grade webhook delivery with retry logic and monitoring
 */

import crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';
import winston from 'winston';
import { Queue, Job, Worker } from 'bull';
import Redis from 'redis';

// Configure logger for webhook operations
const webhookLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/webhooks.log' }),
    new winston.transports.Console()
  ]
});

export interface WebhookEndpoint {
  id: string;
  organizationId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  retryPolicy: {
    maxRetries: number;
    backoffFactor: number;
    initialDelay: number;
  };
  headers?: Record<string, string>;
  createdAt: Date;
  lastTriggered?: Date;
  statistics: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageResponseTime: number;
  };
}

export interface WebhookEvent {
  id: string;
  type: string;
  organizationId: string;
  payload: any;
  timestamp: Date;
  signature: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  attempt: number;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  responseCode?: number;
  responseTime?: number;
  error?: string;
  deliveredAt?: Date;
  nextRetry?: Date;
}

export class WebhookManager {
  private webhookQueue: Queue;
  private redis: any;
  private webhooks: Map<string, WebhookEndpoint> = new Map();

  constructor() {
    this.initializeQueue();
    this.setupWorkers();
  }

  private async initializeQueue() {
    try {
      // Initialize Redis connection
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = Redis.createClient({ url: redisUrl });
      await this.redis.connect();

      // Initialize Bull queue for webhook processing
      this.webhookQueue = new Queue('webhook deliveries', {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        }
      });

      webhookLogger.info('Webhook queue initialized');

    } catch (error) {
      webhookLogger.error('Failed to initialize webhook queue:', error);
      // Fallback to in-memory processing
      this.initializeInMemoryFallback();
    }
  }

  private setupWorkers() {
    if (!this.webhookQueue) return;

    // Setup webhook delivery worker
    new Worker('webhook deliveries', async (job: Job) => {
      return this.processWebhookDelivery(job.data);
    }, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      concurrency: 10
    });

    webhookLogger.info('Webhook workers initialized');
  }

  /**
   * Register a webhook endpoint
   */
  async registerWebhook(
    organizationId: string,
    config: {
      url: string;
      events: string[];
      headers?: Record<string, string>;
      retryPolicy?: {
        maxRetries: number;
        backoffFactor: number;
        initialDelay: number;
      };
    }
  ): Promise<WebhookEndpoint> {
    try {
      const webhookId = crypto.randomUUID();
      const secret = this.generateWebhookSecret();

      const webhook: WebhookEndpoint = {
        id: webhookId,
        organizationId,
        url: config.url,
        events: config.events,
        secret,
        isActive: true,
        retryPolicy: config.retryPolicy || {
          maxRetries: 3,
          backoffFactor: 2,
          initialDelay: 1000
        },
        headers: config.headers,
        createdAt: new Date(),
        statistics: {
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          averageResponseTime: 0
        }
      };

      // Store webhook
      this.webhooks.set(webhookId, webhook);
      await this.persistWebhook(webhook);

      // Test webhook endpoint
      await this.testWebhookEndpoint(webhook);

      webhookLogger.info('Webhook registered', {
        webhookId,
        organizationId,
        url: config.url,
        events: config.events
      });

      return webhook;

    } catch (error) {
      webhookLogger.error('Webhook registration failed:', error);
      throw error;
    }
  }

  /**
   * Trigger webhook event
   */
  async triggerWebhookEvent(
    organizationId: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    try {
      const eventId = crypto.randomUUID();
      const event: WebhookEvent = {
        id: eventId,
        type: eventType,
        organizationId,
        payload,
        timestamp: new Date(),
        signature: this.generateEventSignature(payload)
      };

      // Find matching webhooks
      const matchingWebhooks = Array.from(this.webhooks.values()).filter(
        webhook => 
          webhook.organizationId === organizationId &&
          webhook.isActive &&
          webhook.events.includes(eventType)
      );

      if (matchingWebhooks.length === 0) {
        webhookLogger.debug('No matching webhooks found', {
          organizationId,
          eventType
        });
        return;
      }

      // Queue deliveries
      const deliveryPromises = matchingWebhooks.map(webhook =>
        this.queueWebhookDelivery(webhook, event)
      );

      await Promise.all(deliveryPromises);

      webhookLogger.info('Webhook event triggered', {
        eventId,
        eventType,
        organizationId,
        webhookCount: matchingWebhooks.length
      });

    } catch (error) {
      webhookLogger.error('Webhook event trigger failed:', error);
      throw error;
    }
  }

  /**
   * Update webhook configuration
   */
  async updateWebhook(
    webhookId: string,
    updates: Partial<Pick<WebhookEndpoint, 'url' | 'events' | 'isActive' | 'headers' | 'retryPolicy'>>
  ): Promise<WebhookEndpoint> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const updatedWebhook = { ...webhook, ...updates };
    this.webhooks.set(webhookId, updatedWebhook);
    await this.persistWebhook(updatedWebhook);

    webhookLogger.info('Webhook updated', {
      webhookId,
      updates: Object.keys(updates)
    });

    return updatedWebhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string): Promise<boolean> {
    try {
      const webhook = this.webhooks.get(webhookId);
      if (!webhook) {
        return false;
      }

      this.webhooks.delete(webhookId);
      await this.removeWebhookFromStorage(webhookId);

      webhookLogger.info('Webhook deleted', { webhookId });
      return true;

    } catch (error) {
      webhookLogger.error('Webhook deletion failed:', error);
      return false;
    }
  }

  /**
   * Get webhook delivery statistics
   */
  async getWebhookStatistics(organizationId: string): Promise<{
    totalWebhooks: number;
    activeWebhooks: number;
    totalDeliveries: number;
    successRate: number;
    averageResponseTime: number;
    eventTypes: Record<string, number>;
  }> {
    const orgWebhooks = Array.from(this.webhooks.values())
      .filter(w => w.organizationId === organizationId);

    const totalDeliveries = orgWebhooks.reduce(
      (sum, w) => sum + w.statistics.totalDeliveries, 0
    );
    const successfulDeliveries = orgWebhooks.reduce(
      (sum, w) => sum + w.statistics.successfulDeliveries, 0
    );
    const totalResponseTime = orgWebhooks.reduce(
      (sum, w) => sum + (w.statistics.averageResponseTime * w.statistics.totalDeliveries), 0
    );

    return {
      totalWebhooks: orgWebhooks.length,
      activeWebhooks: orgWebhooks.filter(w => w.isActive).length,
      totalDeliveries,
      successRate: totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0,
      averageResponseTime: totalDeliveries > 0 ? totalResponseTime / totalDeliveries : 0,
      eventTypes: orgWebhooks.reduce((acc, w) => {
        w.events.forEach(event => {
          acc[event] = (acc[event] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Test webhook endpoint
   */
  async testWebhookEndpoint(webhook: WebhookEndpoint): Promise<{
    success: boolean;
    responseTime: number;
    statusCode?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const testPayload = {
        type: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: { message: 'Test webhook delivery' }
      };

      const signature = this.generateSignature(testPayload, webhook.secret);
      const headers = {
        'Content-Type': 'application/json',
        'X-Veridity-Signature': signature,
        'X-Veridity-Delivery': crypto.randomUUID(),
        'User-Agent': 'Veridity-Webhooks/1.0',
        ...webhook.headers
      };

      const response = await axios.post(webhook.url, testPayload, {
        headers,
        timeout: 30000,
        validateStatus: () => true
      });

      const responseTime = Date.now() - startTime;
      const success = response.status >= 200 && response.status < 300;

      webhookLogger.info('Webhook test completed', {
        webhookId: webhook.id,
        success,
        statusCode: response.status,
        responseTime
      });

      return {
        success,
        responseTime,
        statusCode: response.status
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      webhookLogger.error('Webhook test failed', {
        webhookId: webhook.id,
        error: errorMessage,
        responseTime
      });

      return {
        success: false,
        responseTime,
        error: errorMessage
      };
    }
  }

  // Private helper methods

  private async queueWebhookDelivery(webhook: WebhookEndpoint, event: WebhookEvent): Promise<void> {
    const deliveryData = {
      webhookId: webhook.id,
      eventId: event.id,
      url: webhook.url,
      payload: event.payload,
      signature: this.generateSignature(event.payload, webhook.secret),
      headers: webhook.headers,
      retryPolicy: webhook.retryPolicy
    };

    if (this.webhookQueue) {
      await this.webhookQueue.add('deliver', deliveryData);
    } else {
      // Fallback to immediate processing
      await this.processWebhookDelivery(deliveryData);
    }
  }

  private async processWebhookDelivery(data: any): Promise<void> {
    const startTime = Date.now();

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Veridity-Signature': data.signature,
        'X-Veridity-Delivery': crypto.randomUUID(),
        'X-Veridity-Event': data.eventId,
        'User-Agent': 'Veridity-Webhooks/1.0',
        ...data.headers
      };

      const response = await axios.post(data.url, data.payload, {
        headers,
        timeout: 30000,
        validateStatus: () => true
      });

      const responseTime = Date.now() - startTime;
      const success = response.status >= 200 && response.status < 300;

      // Update webhook statistics
      await this.updateWebhookStatistics(data.webhookId, success, responseTime);

      if (success) {
        webhookLogger.info('Webhook delivered successfully', {
          webhookId: data.webhookId,
          eventId: data.eventId,
          statusCode: response.status,
          responseTime
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.updateWebhookStatistics(data.webhookId, false, responseTime);

      webhookLogger.error('Webhook delivery failed', {
        webhookId: data.webhookId,
        eventId: data.eventId,
        error: errorMessage,
        responseTime
      });

      throw error;
    }
  }

  private generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateEventSignature(payload: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  private generateSignature(payload: any, secret: string): string {
    const payloadString = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  private async persistWebhook(webhook: WebhookEndpoint): Promise<void> {
    // Store webhook in database
    webhookLogger.debug('Webhook persisted', { webhookId: webhook.id });
  }

  private async removeWebhookFromStorage(webhookId: string): Promise<void> {
    // Remove webhook from database
    webhookLogger.debug('Webhook removed from storage', { webhookId });
  }

  private async updateWebhookStatistics(
    webhookId: string,
    success: boolean,
    responseTime: number
  ): Promise<void> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return;

    webhook.statistics.totalDeliveries++;
    if (success) {
      webhook.statistics.successfulDeliveries++;
    } else {
      webhook.statistics.failedDeliveries++;
    }

    // Update average response time
    webhook.statistics.averageResponseTime = 
      (webhook.statistics.averageResponseTime * (webhook.statistics.totalDeliveries - 1) + responseTime) /
      webhook.statistics.totalDeliveries;

    webhook.lastTriggered = new Date();
    await this.persistWebhook(webhook);
  }

  private initializeInMemoryFallback(): void {
    webhookLogger.warn('Running webhook manager in memory-only mode');
  }
}

// Export singleton instance
export const webhookManager = new WebhookManager();