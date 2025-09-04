import { Pool } from 'pg';

// Enhanced database connection management
export class DatabasePool {
  private static instance: DatabasePool;
  private pool: Pool;
  private stats = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    waitingClients: 0,
    totalQueries: 0,
    slowQueries: 0
  };

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of connections
      min: 5,  // Minimum number of connections
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 2000, // 2 seconds
      acquireTimeoutMillis: 60000, // 1 minute
      // Enhanced connection configuration
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      allowExitOnIdle: false
    });

    this.setupEventHandlers();
    this.startMonitoring();
  }

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  private setupEventHandlers(): void {
    this.pool.on('connect', (client) => {
      this.stats.totalConnections++;
      console.log('🔗 New database connection established');
    });

    this.pool.on('acquire', (client) => {
      this.stats.activeConnections++;
    });

    this.pool.on('release', (client) => {
      this.stats.activeConnections--;
      this.stats.idleConnections++;
    });

    this.pool.on('remove', (client) => {
      this.stats.idleConnections--;
      console.log('🔌 Database connection removed');
    });

    this.pool.on('error', (err, client) => {
      console.error('❌ Database pool error:', err);
    });
  }

  // Execute query with performance monitoring
  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      this.stats.totalQueries++;
      if (duration > 1000) { // Slow query threshold: 1 second
        this.stats.slowQueries++;
        console.warn(`🐌 Slow query detected (${duration}ms): ${text.substring(0, 100)}...`);
      }

      return result;
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
  }

  // Get a client from the pool for transactions
  async getClient() {
    return this.pool.connect();
  }

  // Get pool statistics
  getStats() {
    return {
      pool: {
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount
      },
      queries: {
        total: this.stats.totalQueries,
        slow: this.stats.slowQueries,
        slowPercentage: (this.stats.slowQueries / this.stats.totalQueries) * 100 || 0
      },
      connections: {
        total: this.stats.totalConnections,
        active: this.stats.activeConnections,
        idle: this.stats.idleConnections,
        waiting: this.stats.waitingClients
      }
    };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as healthy');
      return result.rows[0]?.healthy === 1;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  // Start monitoring
  private startMonitoring(): void {
    setInterval(() => {
      const stats = this.getStats();
      console.log('📊 DB Pool Stats:', {
        active: stats.pool.totalCount,
        idle: stats.pool.idleCount,
        waiting: stats.pool.waitingCount,
        totalQueries: stats.queries.total,
        slowQueries: stats.queries.slow
      });

      // Alert if pool is overloaded
      if (stats.pool.waitingCount > 5) {
        console.warn('⚠️ Database pool overloaded! Waiting clients:', stats.pool.waitingCount);
      }
    }, 60000); // Every minute
  }

  // Graceful shutdown
  async close(): Promise<void> {
    console.log('🔌 Closing database pool...');
    await this.pool.end();
    console.log('✅ Database pool closed');
  }
}

export const dbPool = DatabasePool.getInstance();