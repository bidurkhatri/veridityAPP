// Real-time monitoring and metrics system
export class RealTimeMonitor {
  private static instance: RealTimeMonitor;
  private metrics: SystemMetrics = {
    uptime: 0,
    memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
    cpuUsage: 0,
    requestCount: 0,
    errorCount: 0,
    responseTime: { min: 0, max: 0, avg: 0 },
    activeConnections: 0,
    dbConnections: { active: 0, idle: 0, total: 0 },
    cacheStats: { hits: 0, misses: 0, hitRate: 0 }
  };

  private requestTimes: number[] = [];
  private startTime = Date.now();
  private subscribers: Set<(metrics: SystemMetrics) => void> = new Set();

  static getInstance(): RealTimeMonitor {
    if (!RealTimeMonitor.instance) {
      RealTimeMonitor.instance = new RealTimeMonitor();
    }
    return RealTimeMonitor.instance;
  }

  // Start monitoring
  startMonitoring(): void {
    this.collectMetrics();
    setInterval(() => this.collectMetrics(), 5000); // Every 5 seconds
    setInterval(() => this.broadcastMetrics(), 1000); // Broadcast every second
    console.log('📊 Real-time monitoring started');
  }

  // Collect system metrics
  private collectMetrics(): void {
    const memUsage = process.memoryUsage();
    
    this.metrics.uptime = Date.now() - this.startTime;
    this.metrics.memoryUsage = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    // Calculate average response time
    if (this.requestTimes.length > 0) {
      const times = this.requestTimes.slice(-100); // Last 100 requests
      this.metrics.responseTime = {
        min: Math.min(...times),
        max: Math.max(...times),
        avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      };
    }

    // CPU usage (simplified calculation)
    this.metrics.cpuUsage = Math.round(Math.random() * 100); // TODO: Implement real CPU monitoring
  }

  // Track request
  trackRequest(duration: number): void {
    this.metrics.requestCount++;
    this.requestTimes.push(duration);
    
    // Keep only last 1000 request times
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(-1000);
    }
  }

  // Track error
  trackError(): void {
    this.metrics.errorCount++;
  }

  // Update active connections
  updateActiveConnections(count: number): void {
    this.metrics.activeConnections = count;
  }

  // Update database connections
  updateDbConnections(stats: { active: number; idle: number; total: number }): void {
    this.metrics.dbConnections = stats;
  }

  // Update cache stats
  updateCacheStats(stats: { hits: number; misses: number; hitRate: number }): void {
    this.metrics.cacheStats = stats;
  }

  // Subscribe to metrics updates
  subscribe(callback: (metrics: SystemMetrics) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Broadcast metrics to subscribers
  private broadcastMetrics(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error('❌ Error broadcasting metrics:', error);
      }
    });
  }

  // Get current metrics
  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  // Get health status
  getHealthStatus(): HealthStatus {
    const memoryPressure = this.metrics.memoryUsage.heapUsed / this.metrics.memoryUsage.heapTotal;
    const errorRate = this.metrics.errorCount / Math.max(this.metrics.requestCount, 1);
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const issues: string[] = [];

    if (memoryPressure > 0.9) {
      status = 'unhealthy';
      issues.push('High memory usage');
    } else if (memoryPressure > 0.8) {
      status = 'degraded';
      issues.push('Elevated memory usage');
    }

    if (errorRate > 0.1) {
      status = 'unhealthy';
      issues.push('High error rate');
    } else if (errorRate > 0.05) {
      status = 'degraded';
      issues.push('Elevated error rate');
    }

    if (this.metrics.responseTime.avg > 2000) {
      status = 'unhealthy';
      issues.push('Slow response times');
    } else if (this.metrics.responseTime.avg > 1000) {
      status = 'degraded';
      issues.push('Elevated response times');
    }

    return {
      status,
      issues,
      uptime: this.metrics.uptime,
      timestamp: new Date().toISOString()
    };
  }

  // Generate alerts
  checkAlerts(): Alert[] {
    const alerts: Alert[] = [];
    const health = this.getHealthStatus();

    if (health.status === 'unhealthy') {
      alerts.push({
        level: 'critical',
        message: 'System health is critical',
        details: health.issues,
        timestamp: new Date().toISOString()
      });
    } else if (health.status === 'degraded') {
      alerts.push({
        level: 'warning',
        message: 'System performance is degraded',
        details: health.issues,
        timestamp: new Date().toISOString()
      });
    }

    // Memory alerts
    const memoryPressure = this.metrics.memoryUsage.heapUsed / this.metrics.memoryUsage.heapTotal;
    if (memoryPressure > 0.9) {
      alerts.push({
        level: 'critical',
        message: 'Memory usage critically high',
        details: [`${Math.round(memoryPressure * 100)}% memory used`],
        timestamp: new Date().toISOString()
      });
    }

    // Database connection alerts
    if (this.metrics.dbConnections.active > 15) {
      alerts.push({
        level: 'warning',
        message: 'High database connection usage',
        details: [`${this.metrics.dbConnections.active} active connections`],
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }
}

// Middleware to track request metrics
export function metricsMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      realTimeMonitor.trackRequest(duration);
      
      if (res.statusCode >= 400) {
        realTimeMonitor.trackError();
      }
    });

    next();
  };
}

interface SystemMetrics {
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpuUsage: number;
  requestCount: number;
  errorCount: number;
  responseTime: {
    min: number;
    max: number;
    avg: number;
  };
  activeConnections: number;
  dbConnections: {
    active: number;
    idle: number;
    total: number;
  };
  cacheStats: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: string[];
  uptime: number;
  timestamp: string;
}

interface Alert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  details: string[];
  timestamp: string;
}

export const realTimeMonitor = RealTimeMonitor.getInstance();