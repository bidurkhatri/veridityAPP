/**
 * Health monitoring and system diagnostics
 */

import { performance } from 'perf_hooks';
import os from 'os';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    load: number[];
  };
  database: {
    connected: boolean;
    responseTime?: number;
  };
  services: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded';
      responseTime?: number;
      error?: string;
    };
  };
}

export class HealthMonitor {
  private checks = new Map<string, () => Promise<boolean>>();
  private metrics = {
    requests: 0,
    errors: 0,
    responseTime: [] as number[]
  };

  // Register health checks
  registerCheck(name: string, checkFn: () => Promise<boolean>) {
    this.checks.set(name, checkFn);
  }

  // Record request metrics
  recordRequest(duration: number, isError: boolean = false) {
    this.metrics.requests++;
    if (isError) this.metrics.errors++;
    
    this.metrics.responseTime.push(duration);
    
    // Keep only last 100 response times
    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime = this.metrics.responseTime.slice(-100);
    }
  }

  // Get comprehensive health status
  async getHealth(): Promise<HealthStatus> {
    const startTime = performance.now();
    
    // Memory usage
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // CPU usage
    const cpus = os.cpus();
    const load = os.loadavg();

    // Database check
    let dbStatus: { connected: boolean; responseTime?: number } = { connected: false };
    try {
      const dbStart = performance.now();
      // Simple database ping
      await this.pingDatabase();
      dbStatus = {
        connected: true,
        responseTime: performance.now() - dbStart
      };
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Run custom health checks
    const services: HealthStatus['services'] = {};
    for (const [name, checkFn] of Array.from(this.checks.entries())) {
      const serviceStart = performance.now();
      try {
        const isHealthy = await checkFn();
        services[name] = {
          status: isHealthy ? 'up' : 'degraded',
          responseTime: performance.now() - serviceStart
        };
      } catch (error) {
        services[name] = {
          status: 'down',
          responseTime: performance.now() - serviceStart,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Determine overall status
    let status: HealthStatus['status'] = 'healthy';
    
    if (dbStatus.connected === false) {
      status = 'unhealthy';
    } else if (usedMem / totalMem > 0.9 || load[0] > cpus.length * 2) {
      status = 'degraded';
    } else if (Object.values(services).some(s => s.status === 'down')) {
      status = 'unhealthy';
    } else if (Object.values(services).some(s => s.status === 'degraded')) {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: usedMem,
        total: totalMem,
        percentage: Math.round((usedMem / totalMem) * 100)
      },
      cpu: {
        usage: load[0],
        load
      },
      database: dbStatus,
      services
    };
  }

  // Real database ping
  private async pingDatabase(): Promise<void> {
    try {
      // Try to connect to database and run a simple query
      const { Pool } = await import('@neondatabase/serverless');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      await pool.query('SELECT 1');
      await pool.end();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Database ping failed: ${errorMessage}`);
    }
  }

  // Get performance metrics
  getMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((sum, time) => sum + time, 0) / this.metrics.responseTime.length
      : 0;

    const errorRate = this.metrics.requests > 0
      ? (this.metrics.errors / this.metrics.requests) * 100
      : 0;

    return {
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      recentResponseTimes: this.metrics.responseTime.slice(-10)
    };
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: []
    };
  }
}

// Singleton instance
export const healthMonitor = new HealthMonitor();

// Register default health checks
healthMonitor.registerCheck('memory', async () => {
  const usage = process.memoryUsage();
  const total = os.totalmem();
  return (usage.heapUsed / total) < 0.8; // Healthy if less than 80% memory used
});

healthMonitor.registerCheck('cpu', async () => {
  const load = os.loadavg();
  const cpus = os.cpus();
  return load[0] < cpus.length * 1.5; // Healthy if load is reasonable
});

healthMonitor.registerCheck('uptime', async () => {
  return process.uptime() > 0; // Basic sanity check
});