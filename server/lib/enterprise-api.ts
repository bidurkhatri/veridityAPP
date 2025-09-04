// Enterprise API management system
export class EnterpriseAPIManager {
  private static instance: EnterpriseAPIManager;
  private apiKeys: Map<string, APIKey> = new Map();
  private apiUsage: Map<string, APIUsageStats> = new Map();
  private rateLimits: Map<string, RateLimit> = new Map();
  private webhooks: Map<string, WebhookConfig> = new Map();

  static getInstance(): EnterpriseAPIManager {
    if (!EnterpriseAPIManager.instance) {
      EnterpriseAPIManager.instance = new EnterpriseAPIManager();
    }
    return EnterpriseAPIManager.instance;
  }

  // API Key Management
  generateAPIKey(organizationId: string, permissions: string[]): APIKey {
    const apiKey: APIKey = {
      id: `vrd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      permissions,
      createdAt: new Date(),
      lastUsed: null,
      status: 'active',
      rateLimit: {
        requestsPerMinute: 1000,
        requestsPerHour: 10000,
        requestsPerDay: 100000
      },
      scope: permissions
    };

    this.apiKeys.set(apiKey.id, apiKey);
    this.initializeUsageStats(apiKey.id);
    
    console.log(`🔑 Generated API key for organization: ${organizationId}`);
    return apiKey;
  }

  // Validate and authenticate API requests
  validateAPIKey(keyId: string, requiredPermission?: string): ValidationResult {
    const apiKey = this.apiKeys.get(keyId);
    
    if (!apiKey) {
      return { valid: false, error: 'API key not found' };
    }

    if (apiKey.status !== 'active') {
      return { valid: false, error: 'API key is inactive' };
    }

    if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
      return { valid: false, error: 'Insufficient permissions' };
    }

    // Check rate limits
    const rateLimitCheck = this.checkRateLimit(keyId);
    if (!rateLimitCheck.allowed) {
      return { valid: false, error: 'Rate limit exceeded', retryAfter: rateLimitCheck.retryAfter };
    }

    // Update usage
    this.recordAPIUsage(keyId);
    apiKey.lastUsed = new Date();

    return { valid: true, apiKey };
  }

  // Advanced rate limiting
  private checkRateLimit(keyId: string): { allowed: boolean; retryAfter?: number } {
    const apiKey = this.apiKeys.get(keyId);
    if (!apiKey) return { allowed: false };

    let rateLimit = this.rateLimits.get(keyId);
    if (!rateLimit) {
      rateLimit = {
        minuteCount: 0,
        hourCount: 0,
        dayCount: 0,
        lastMinute: Math.floor(Date.now() / 60000),
        lastHour: Math.floor(Date.now() / 3600000),
        lastDay: Math.floor(Date.now() / 86400000)
      };
      this.rateLimits.set(keyId, rateLimit);
    }

    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);
    const currentHour = Math.floor(now / 3600000);
    const currentDay = Math.floor(now / 86400000);

    // Reset counters if time periods have passed
    if (currentMinute > rateLimit.lastMinute) {
      rateLimit.minuteCount = 0;
      rateLimit.lastMinute = currentMinute;
    }
    if (currentHour > rateLimit.lastHour) {
      rateLimit.hourCount = 0;
      rateLimit.lastHour = currentHour;
    }
    if (currentDay > rateLimit.lastDay) {
      rateLimit.dayCount = 0;
      rateLimit.lastDay = currentDay;
    }

    // Check limits
    if (rateLimit.minuteCount >= apiKey.rateLimit.requestsPerMinute) {
      return { allowed: false, retryAfter: 60 - (now % 60000) / 1000 };
    }
    if (rateLimit.hourCount >= apiKey.rateLimit.requestsPerHour) {
      return { allowed: false, retryAfter: 3600 - (now % 3600000) / 1000 };
    }
    if (rateLimit.dayCount >= apiKey.rateLimit.requestsPerDay) {
      return { allowed: false, retryAfter: 86400 - (now % 86400000) / 1000 };
    }

    // Increment counters
    rateLimit.minuteCount++;
    rateLimit.hourCount++;
    rateLimit.dayCount++;

    return { allowed: true };
  }

  // Record API usage for analytics
  private recordAPIUsage(keyId: string): void {
    let usage = this.apiUsage.get(keyId);
    if (!usage) {
      usage = this.initializeUsageStats(keyId);
    }

    usage.totalRequests++;
    usage.requestsToday++;
    usage.lastRequestTime = new Date();

    // Update hourly stats
    const currentHour = new Date().getHours();
    if (!usage.hourlyStats[currentHour]) {
      usage.hourlyStats[currentHour] = 0;
    }
    usage.hourlyStats[currentHour]++;
  }

  private initializeUsageStats(keyId: string): APIUsageStats {
    const stats: APIUsageStats = {
      apiKeyId: keyId,
      totalRequests: 0,
      requestsToday: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastRequestTime: null,
      hourlyStats: {},
      endpointStats: new Map()
    };
    this.apiUsage.set(keyId, stats);
    return stats;
  }

  // Webhook Management
  createWebhook(organizationId: string, config: Partial<WebhookConfig>): WebhookConfig {
    const webhook: WebhookConfig = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      url: config.url!,
      events: config.events || ['verification.completed'],
      secret: this.generateWebhookSecret(),
      status: 'active',
      createdAt: new Date(),
      lastTriggered: null,
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
      }
    };

    this.webhooks.set(webhook.id, webhook);
    console.log(`🪝 Created webhook for organization: ${organizationId}`);
    return webhook;
  }

  // Trigger webhook with retry logic
  async triggerWebhook(webhookId: string, event: WebhookEvent): Promise<WebhookDeliveryResult> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook || webhook.status !== 'active') {
      return { success: false, error: 'Webhook not found or inactive' };
    }

    if (!webhook.events.includes(event.type)) {
      return { success: false, error: 'Event type not subscribed' };
    }

    const payload = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: event.type,
      data: event.data,
      timestamp: new Date().toISOString()
    };

    return this.deliverWebhook(webhook, payload);
  }

  private async deliverWebhook(webhook: WebhookConfig, payload: any, attempt = 1): Promise<WebhookDeliveryResult> {
    try {
      const signature = this.generateWebhookSignature(JSON.stringify(payload), webhook.secret);
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Veridity-Signature': signature,
          'X-Veridity-Event': payload.type,
          'User-Agent': 'Veridity-Webhooks/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        webhook.lastTriggered = new Date();
        return { success: true, statusCode: response.status };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Webhook delivery failed (attempt ${attempt}):`, error);

      // Retry logic
      if (attempt < webhook.retryPolicy.maxRetries) {
        const delay = webhook.retryPolicy.retryDelay * Math.pow(webhook.retryPolicy.backoffMultiplier, attempt - 1);
        
        setTimeout(() => {
          this.deliverWebhook(webhook, payload, attempt + 1);
        }, delay);

        return { success: false, error: 'Delivery failed, retrying...', willRetry: true };
      }

      return { success: false, error: `Delivery failed after ${attempt} attempts` };
    }
  }

  private generateWebhookSecret(): string {
    return `whsec_${Math.random().toString(36).substr(2, 32)}`;
  }

  private generateWebhookSignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;
  }

  // Analytics and reporting
  getAPIAnalytics(organizationId: string, timeRange?: string): APIAnalytics {
    const orgKeys = Array.from(this.apiKeys.values())
      .filter(key => key.organizationId === organizationId);

    const analytics: APIAnalytics = {
      organizationId,
      totalKeys: orgKeys.length,
      activeKeys: orgKeys.filter(key => key.status === 'active').length,
      totalRequests: 0,
      avgResponseTime: 0,
      errorRate: 0,
      topEndpoints: [],
      requestTrends: []
    };

    // Aggregate usage statistics
    orgKeys.forEach(key => {
      const usage = this.apiUsage.get(key.id);
      if (usage) {
        analytics.totalRequests += usage.totalRequests;
        analytics.avgResponseTime += usage.averageResponseTime;
        analytics.errorRate += usage.errorRate;
      }
    });

    // Calculate averages
    if (orgKeys.length > 0) {
      analytics.avgResponseTime /= orgKeys.length;
      analytics.errorRate /= orgKeys.length;
    }

    return analytics;
  }

  // SDK generation for different languages
  generateSDK(language: 'javascript' | 'python' | 'java' | 'go', apiKey: string): SDKConfig {
    const baseConfig = {
      apiKey,
      baseUrl: 'https://api.veridity.app',
      version: '1.0.0'
    };

    switch (language) {
      case 'javascript':
        return {
          ...baseConfig,
          language: 'javascript',
          packageName: '@veridity/sdk',
          installation: 'npm install @veridity/sdk',
          example: `
const Veridity = require('@veridity/sdk');
const client = new Veridity('${apiKey}');

// Generate a proof
const proof = await client.proofs.generate({
  type: 'age_verification',
  data: { birthDate: '1990-01-01' }
});
          `
        };
      
      case 'python':
        return {
          ...baseConfig,
          language: 'python',
          packageName: 'veridity-sdk',
          installation: 'pip install veridity-sdk',
          example: `
import veridity

client = veridity.Client('${apiKey}')

# Generate a proof
proof = client.proofs.generate(
    type='age_verification',
    data={'birth_date': '1990-01-01'}
)
          `
        };

      default:
        return {
          ...baseConfig,
          language,
          packageName: `veridity-${language}-sdk`,
          installation: `# See documentation for ${language} installation`,
          example: `# See documentation for ${language} examples`
        };
    }
  }

  // Get comprehensive API statistics
  getSystemStats(): EnterpriseAPIStats {
    return {
      totalKeys: this.apiKeys.size,
      activeKeys: Array.from(this.apiKeys.values()).filter(k => k.status === 'active').length,
      totalWebhooks: this.webhooks.size,
      totalRequests: Array.from(this.apiUsage.values()).reduce((sum, usage) => sum + usage.totalRequests, 0),
      averageResponseTime: this.calculateAverageResponseTime(),
      topOrganizations: this.getTopOrganizations()
    };
  }

  private calculateAverageResponseTime(): number {
    const usageStats = Array.from(this.apiUsage.values());
    if (usageStats.length === 0) return 0;
    
    const totalResponseTime = usageStats.reduce((sum, stats) => sum + stats.averageResponseTime, 0);
    return totalResponseTime / usageStats.length;
  }

  private getTopOrganizations(): Array<{ organizationId: string; requests: number }> {
    const orgStats = new Map<string, number>();
    
    this.apiKeys.forEach(key => {
      const usage = this.apiUsage.get(key.id);
      if (usage) {
        const current = orgStats.get(key.organizationId) || 0;
        orgStats.set(key.organizationId, current + usage.totalRequests);
      }
    });

    return Array.from(orgStats.entries())
      .map(([organizationId, requests]) => ({ organizationId, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);
  }
}

// Type definitions
interface APIKey {
  id: string;
  organizationId: string;
  permissions: string[];
  createdAt: Date;
  lastUsed: Date | null;
  status: 'active' | 'inactive' | 'revoked';
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  scope: string[];
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  retryAfter?: number;
  apiKey?: APIKey;
}

interface RateLimit {
  minuteCount: number;
  hourCount: number;
  dayCount: number;
  lastMinute: number;
  lastHour: number;
  lastDay: number;
}

interface APIUsageStats {
  apiKeyId: string;
  totalRequests: number;
  requestsToday: number;
  averageResponseTime: number;
  errorRate: number;
  lastRequestTime: Date | null;
  hourlyStats: Record<number, number>;
  endpointStats: Map<string, number>;
}

interface WebhookConfig {
  id: string;
  organizationId: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  lastTriggered: Date | null;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
}

interface WebhookEvent {
  type: string;
  data: any;
}

interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  willRetry?: boolean;
}

interface APIAnalytics {
  organizationId: string;
  totalKeys: number;
  activeKeys: number;
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  topEndpoints: Array<{ endpoint: string; requests: number }>;
  requestTrends: Array<{ date: string; requests: number }>;
}

interface SDKConfig {
  apiKey: string;
  baseUrl: string;
  version: string;
  language: string;
  packageName: string;
  installation: string;
  example: string;
}

interface EnterpriseAPIStats {
  totalKeys: number;
  activeKeys: number;
  totalWebhooks: number;
  totalRequests: number;
  averageResponseTime: number;
  topOrganizations: Array<{ organizationId: string; requests: number }>;
}

export const enterpriseAPI = EnterpriseAPIManager.getInstance();