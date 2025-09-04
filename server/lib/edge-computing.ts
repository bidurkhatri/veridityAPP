// Edge computing system for global performance
export class EdgeComputingSystem {
  private static instance: EdgeComputingSystem;
  private edgeNodes: Map<string, EdgeNode> = new Map();
  private contentDistribution: Map<string, CDNResource> = new Map();
  private edgeCache: Map<string, EdgeCache> = new Map();
  private regionalConfigs: Map<string, RegionalConfig> = new Map();

  static getInstance(): EdgeComputingSystem {
    if (!EdgeComputingSystem.instance) {
      EdgeComputingSystem.instance = new EdgeComputingSystem();
    }
    return EdgeComputingSystem.instance;
  }

  async initializeEdgeComputing(): Promise<void> {
    await this.setupEdgeNodes();
    this.configureRegionalSettings();
    this.initializeContentDistribution();
    this.setupEdgeCaching();
    this.startHealthMonitoring();
    console.log('🌐 Edge computing system initialized');
  }

  // Deploy function to edge nodes
  async deployEdgeFunction(functionConfig: EdgeFunctionConfig): Promise<EdgeDeploymentResult> {
    const deployment: EdgeDeploymentResult = {
      functionId: functionConfig.id,
      deploymentId: `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'deploying',
      targetRegions: functionConfig.regions,
      deployedNodes: [],
      failedNodes: [],
      startTime: new Date(),
      endTime: null
    };

    try {
      const targetNodes = this.getNodesForRegions(functionConfig.regions);
      
      for (const node of targetNodes) {
        try {
          await this.deployToNode(node, functionConfig);
          deployment.deployedNodes.push(node.id);
          console.log(`✅ Function ${functionConfig.id} deployed to node ${node.id}`);
        } catch (error) {
          deployment.failedNodes.push({
            nodeId: node.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          console.error(`❌ Failed to deploy to node ${node.id}:`, error);
        }
      }

      deployment.status = deployment.failedNodes.length === 0 ? 'completed' : 'partial';
      deployment.endTime = new Date();

      return deployment;

    } catch (error) {
      deployment.status = 'failed';
      deployment.endTime = new Date();
      throw error;
    }
  }

  // Route request to optimal edge node
  async routeToEdge(request: EdgeRequest): Promise<EdgeRoutingDecision> {
    const clientLocation = await this.getClientLocation(request.clientIP);
    const optimalNode = this.findOptimalNode(clientLocation, request.functionId);

    if (!optimalNode) {
      return {
        action: 'route_to_origin',
        reason: 'No suitable edge node available',
        fallbackTo: 'origin'
      };
    }

    // Check node health and capacity
    const nodeHealth = await this.checkNodeHealth(optimalNode);
    if (!nodeHealth.healthy || nodeHealth.load > 90) {
      const fallbackNode = this.findFallbackNode(clientLocation, request.functionId, optimalNode.id);
      
      if (fallbackNode) {
        return {
          action: 'route_to_edge',
          nodeId: fallbackNode.id,
          region: fallbackNode.region,
          estimatedLatency: this.calculateLatency(clientLocation, fallbackNode.location),
          fallbackUsed: true
        };
      } else {
        return {
          action: 'route_to_origin',
          reason: 'No healthy edge nodes available',
          fallbackTo: 'origin'
        };
      }
    }

    return {
      action: 'route_to_edge',
      nodeId: optimalNode.id,
      region: optimalNode.region,
      estimatedLatency: this.calculateLatency(clientLocation, optimalNode.location),
      fallbackUsed: false
    };
  }

  // Execute function at edge
  async executeAtEdge(nodeId: string, functionId: string, input: any): Promise<EdgeExecutionResult> {
    const node = this.edgeNodes.get(nodeId);
    if (!node) {
      throw new Error(`Edge node not found: ${nodeId}`);
    }

    const execution: EdgeExecutionResult = {
      nodeId,
      functionId,
      executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'running',
      startTime: new Date(),
      endTime: null,
      executionTime: 0,
      result: null,
      error: null,
      cacheHit: false
    };

    try {
      // Check edge cache first
      const cacheKey = this.generateCacheKey(functionId, input);
      const cachedResult = await this.getFromEdgeCache(nodeId, cacheKey);
      
      if (cachedResult) {
        execution.result = cachedResult;
        execution.cacheHit = true;
        execution.status = 'completed';
        execution.endTime = new Date();
        execution.executionTime = 5; // Cache hit is very fast
        return execution;
      }

      // Execute function on edge node
      const result = await this.runFunctionOnNode(node, functionId, input);
      
      execution.result = result;
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.executionTime = execution.endTime.getTime() - execution.startTime.getTime();

      // Cache result if cacheable
      if (this.isCacheable(functionId, result)) {
        await this.cacheAtEdge(nodeId, cacheKey, result);
      }

      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.executionTime = execution.endTime.getTime() - execution.startTime.getTime();
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  // Smart content distribution
  async distributeContent(contentConfig: ContentDistributionConfig): Promise<DistributionResult> {
    const distribution: DistributionResult = {
      contentId: contentConfig.id,
      distributionId: `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'distributing',
      targetRegions: contentConfig.regions,
      distributedNodes: [],
      failedNodes: [],
      totalSize: contentConfig.content.length,
      startTime: new Date(),
      endTime: null
    };

    try {
      const targetNodes = this.getNodesForRegions(contentConfig.regions);
      const distributionPromises = targetNodes.map(async (node) => {
        try {
          await this.distributeToNode(node, contentConfig);
          distribution.distributedNodes.push(node.id);
        } catch (error) {
          distribution.failedNodes.push({
            nodeId: node.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      await Promise.all(distributionPromises);

      distribution.status = distribution.failedNodes.length === 0 ? 'completed' : 'partial';
      distribution.endTime = new Date();

      return distribution;

    } catch (error) {
      distribution.status = 'failed';
      distribution.endTime = new Date();
      throw error;
    }
  }

  // Edge analytics and monitoring
  async collectEdgeMetrics(): Promise<EdgeMetrics> {
    const metrics: EdgeMetrics = {
      timestamp: new Date(),
      totalNodes: this.edgeNodes.size,
      healthyNodes: 0,
      totalRequests: 0,
      cacheHitRate: 0,
      averageLatency: 0,
      regionalStats: new Map()
    };

    for (const [nodeId, node] of this.edgeNodes) {
      const nodeMetrics = await this.getNodeMetrics(node);
      
      if (nodeMetrics.healthy) {
        metrics.healthyNodes++;
      }
      
      metrics.totalRequests += nodeMetrics.requests;
      
      // Update regional stats
      const regionKey = node.region;
      const regionStats = metrics.regionalStats.get(regionKey) || {
        nodes: 0,
        requests: 0,
        averageLatency: 0,
        cacheHitRate: 0
      };
      
      regionStats.nodes++;
      regionStats.requests += nodeMetrics.requests;
      regionStats.averageLatency = (regionStats.averageLatency + nodeMetrics.latency) / 2;
      regionStats.cacheHitRate = (regionStats.cacheHitRate + nodeMetrics.cacheHitRate) / 2;
      
      metrics.regionalStats.set(regionKey, regionStats);
    }

    // Calculate overall averages
    metrics.cacheHitRate = Array.from(metrics.regionalStats.values())
      .reduce((sum, stats) => sum + stats.cacheHitRate, 0) / metrics.regionalStats.size;
    
    metrics.averageLatency = Array.from(metrics.regionalStats.values())
      .reduce((sum, stats) => sum + stats.averageLatency, 0) / metrics.regionalStats.size;

    return metrics;
  }

  // Auto-scaling edge nodes
  async evaluateEdgeScaling(): Promise<ScalingDecision[]> {
    const decisions: ScalingDecision[] = [];

    for (const [region, config] of this.regionalConfigs) {
      const regionNodes = this.getNodesInRegion(region);
      const regionMetrics = await this.getRegionMetrics(region);

      // Scale up decision
      if (regionMetrics.averageLoad > config.scaleUpThreshold && regionNodes.length < config.maxNodes) {
        decisions.push({
          region,
          action: 'scale_up',
          currentNodes: regionNodes.length,
          targetNodes: Math.min(config.maxNodes, regionNodes.length + config.scaleStep),
          reason: `Average load ${regionMetrics.averageLoad}% exceeds threshold ${config.scaleUpThreshold}%`
        });
      }
      
      // Scale down decision
      else if (regionMetrics.averageLoad < config.scaleDownThreshold && regionNodes.length > config.minNodes) {
        decisions.push({
          region,
          action: 'scale_down',
          currentNodes: regionNodes.length,
          targetNodes: Math.max(config.minNodes, regionNodes.length - config.scaleStep),
          reason: `Average load ${regionMetrics.averageLoad}% below threshold ${config.scaleDownThreshold}%`
        });
      }
    }

    // Execute scaling decisions
    for (const decision of decisions) {
      await this.executeScalingDecision(decision);
    }

    return decisions;
  }

  // Private helper methods
  private async setupEdgeNodes(): Promise<void> {
    // North America East
    this.edgeNodes.set('us-east-1', {
      id: 'us-east-1',
      region: 'us-east-1',
      location: { lat: 39.0458, lng: -76.6413 }, // Virginia
      capacity: { cpu: 8, memory: 16, storage: 100 },
      currentLoad: { cpu: 0, memory: 0, storage: 0 },
      status: 'healthy',
      functions: new Map(),
      lastHealthCheck: new Date()
    });

    // North America West
    this.edgeNodes.set('us-west-1', {
      id: 'us-west-1',
      region: 'us-west-1',
      location: { lat: 37.4419, lng: -122.1430 }, // California
      capacity: { cpu: 8, memory: 16, storage: 100 },
      currentLoad: { cpu: 0, memory: 0, storage: 0 },
      status: 'healthy',
      functions: new Map(),
      lastHealthCheck: new Date()
    });

    // Europe
    this.edgeNodes.set('eu-west-1', {
      id: 'eu-west-1',
      region: 'eu-west-1',
      location: { lat: 53.3498, lng: -6.2603 }, // Dublin
      capacity: { cpu: 8, memory: 16, storage: 100 },
      currentLoad: { cpu: 0, memory: 0, storage: 0 },
      status: 'healthy',
      functions: new Map(),
      lastHealthCheck: new Date()
    });

    // Asia Pacific
    this.edgeNodes.set('ap-southeast-1', {
      id: 'ap-southeast-1',
      region: 'ap-southeast-1',
      location: { lat: 1.3521, lng: 103.8198 }, // Singapore
      capacity: { cpu: 8, memory: 16, storage: 100 },
      currentLoad: { cpu: 0, memory: 0, storage: 0 },
      status: 'healthy',
      functions: new Map(),
      lastHealthCheck: new Date()
    });

    // India
    this.edgeNodes.set('ap-south-1', {
      id: 'ap-south-1',
      region: 'ap-south-1',
      location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
      capacity: { cpu: 8, memory: 16, storage: 100 },
      currentLoad: { cpu: 0, memory: 0, storage: 0 },
      status: 'healthy',
      functions: new Map(),
      lastHealthCheck: new Date()
    });

    console.log(`🌍 Setup ${this.edgeNodes.size} edge nodes globally`);
  }

  private configureRegionalSettings(): void {
    // North America
    this.regionalConfigs.set('us-east-1', {
      minNodes: 1,
      maxNodes: 5,
      scaleUpThreshold: 80,
      scaleDownThreshold: 20,
      scaleStep: 1,
      cacheTTL: 3600,
      compressionEnabled: true
    });

    this.regionalConfigs.set('us-west-1', {
      minNodes: 1,
      maxNodes: 5,
      scaleUpThreshold: 80,
      scaleDownThreshold: 20,
      scaleStep: 1,
      cacheTTL: 3600,
      compressionEnabled: true
    });

    // Europe
    this.regionalConfigs.set('eu-west-1', {
      minNodes: 1,
      maxNodes: 3,
      scaleUpThreshold: 75,
      scaleDownThreshold: 25,
      scaleStep: 1,
      cacheTTL: 7200,
      compressionEnabled: true
    });

    // Asia Pacific
    this.regionalConfigs.set('ap-southeast-1', {
      minNodes: 1,
      maxNodes: 4,
      scaleUpThreshold: 70,
      scaleDownThreshold: 30,
      scaleStep: 1,
      cacheTTL: 1800,
      compressionEnabled: true
    });

    this.regionalConfigs.set('ap-south-1', {
      minNodes: 1,
      maxNodes: 3,
      scaleUpThreshold: 85,
      scaleDownThreshold: 15,
      scaleStep: 1,
      cacheTTL: 900,
      compressionEnabled: true
    });
  }

  private initializeContentDistribution(): void {
    // Common static assets
    this.contentDistribution.set('static_assets', {
      id: 'static_assets',
      type: 'static',
      priority: 'high',
      regions: ['us-east-1', 'us-west-1', 'eu-west-1', 'ap-southeast-1'],
      cacheTTL: 86400, // 24 hours
      compressionEnabled: true
    });

    // API responses
    this.contentDistribution.set('api_responses', {
      id: 'api_responses',
      type: 'dynamic',
      priority: 'medium',
      regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      cacheTTL: 300, // 5 minutes
      compressionEnabled: false
    });
  }

  private setupEdgeCaching(): void {
    for (const [nodeId, node] of this.edgeNodes) {
      this.edgeCache.set(nodeId, {
        nodeId,
        entries: new Map(),
        maxSize: 1024 * 1024 * 100, // 100MB per node
        currentSize: 0,
        hitRate: 0,
        lastCleanup: new Date()
      });
    }
  }

  private startHealthMonitoring(): void {
    setInterval(async () => {
      await this.performHealthChecks();
      await this.evaluateEdgeScaling();
    }, 60000); // Every minute
  }

  private async performHealthChecks(): Promise<void> {
    for (const [nodeId, node] of this.edgeNodes) {
      try {
        const health = await this.checkNodeHealth(node);
        node.status = health.healthy ? 'healthy' : 'unhealthy';
        node.lastHealthCheck = new Date();
        
        if (!health.healthy) {
          console.warn(`⚠️ Edge node ${nodeId} is unhealthy: ${health.reason}`);
        }
      } catch (error) {
        node.status = 'error';
        console.error(`❌ Health check failed for node ${nodeId}:`, error);
      }
    }
  }

  private getNodesForRegions(regions: string[]): EdgeNode[] {
    return regions
      .map(region => this.edgeNodes.get(region))
      .filter((node): node is EdgeNode => node !== undefined);
  }

  private async getClientLocation(clientIP: string): Promise<Location> {
    // Simplified geolocation
    return { lat: 40.7128, lng: -74.0060 }; // Default to NYC
  }

  private findOptimalNode(clientLocation: Location, functionId: string): EdgeNode | null {
    let optimalNode: EdgeNode | null = null;
    let minLatency = Infinity;

    for (const [nodeId, node] of this.edgeNodes) {
      if (node.status !== 'healthy') continue;
      if (!node.functions.has(functionId)) continue;

      const latency = this.calculateLatency(clientLocation, node.location);
      if (latency < minLatency) {
        minLatency = latency;
        optimalNode = node;
      }
    }

    return optimalNode;
  }

  private findFallbackNode(clientLocation: Location, functionId: string, excludeNodeId: string): EdgeNode | null {
    let fallbackNode: EdgeNode | null = null;
    let minLatency = Infinity;

    for (const [nodeId, node] of this.edgeNodes) {
      if (nodeId === excludeNodeId) continue;
      if (node.status !== 'healthy') continue;
      if (!node.functions.has(functionId)) continue;

      const latency = this.calculateLatency(clientLocation, node.location);
      if (latency < minLatency) {
        minLatency = latency;
        fallbackNode = node;
      }
    }

    return fallbackNode;
  }

  private calculateLatency(from: Location, to: Location): number {
    // Simplified latency calculation based on distance
    const distance = this.calculateDistance(from, to);
    return Math.round(distance / 200 + 20); // Rough latency estimate in ms
  }

  private calculateDistance(from: Location, to: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private async checkNodeHealth(node: EdgeNode): Promise<{ healthy: boolean; load: number; reason?: string }> {
    // Simplified health check
    const cpuLoad = Math.random() * 100;
    const memoryLoad = Math.random() * 100;
    
    if (cpuLoad > 95) {
      return { healthy: false, load: cpuLoad, reason: 'High CPU usage' };
    }
    
    if (memoryLoad > 95) {
      return { healthy: false, load: memoryLoad, reason: 'High memory usage' };
    }
    
    return { healthy: true, load: Math.max(cpuLoad, memoryLoad) };
  }

  private async deployToNode(node: EdgeNode, functionConfig: EdgeFunctionConfig): Promise<void> {
    // Simplified deployment
    node.functions.set(functionConfig.id, {
      id: functionConfig.id,
      code: functionConfig.code,
      runtime: functionConfig.runtime,
      memory: functionConfig.memory,
      timeout: functionConfig.timeout,
      deployedAt: new Date()
    });
    
    console.log(`📦 Deployed function ${functionConfig.id} to node ${node.id}`);
  }

  private generateCacheKey(functionId: string, input: any): string {
    return `${functionId}_${JSON.stringify(input).replace(/\s/g, '')}`;
  }

  private async getFromEdgeCache(nodeId: string, cacheKey: string): Promise<any> {
    const cache = this.edgeCache.get(nodeId);
    if (!cache) return null;
    
    const entry = cache.entries.get(cacheKey);
    if (!entry) return null;
    
    // Check if expired
    if (entry.expiresAt < new Date()) {
      cache.entries.delete(cacheKey);
      return null;
    }
    
    return entry.data;
  }

  private async runFunctionOnNode(node: EdgeNode, functionId: string, input: any): Promise<any> {
    // Simplified function execution
    const func = node.functions.get(functionId);
    if (!func) {
      throw new Error(`Function ${functionId} not found on node ${node.id}`);
    }
    
    // Simulate function execution
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    return {
      result: `Function ${functionId} executed successfully`,
      input: input,
      nodeId: node.id,
      timestamp: new Date()
    };
  }

  private isCacheable(functionId: string, result: any): boolean {
    // Simple caching logic
    return !result.error && functionId !== 'real_time_function';
  }

  private async cacheAtEdge(nodeId: string, cacheKey: string, data: any): Promise<void> {
    const cache = this.edgeCache.get(nodeId);
    if (!cache) return;
    
    const entry = {
      key: cacheKey,
      data: data,
      size: JSON.stringify(data).length,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 300000) // 5 minutes
    };
    
    // Check cache size limits
    if (cache.currentSize + entry.size > cache.maxSize) {
      await this.evictFromCache(cache);
    }
    
    cache.entries.set(cacheKey, entry);
    cache.currentSize += entry.size;
  }

  private async evictFromCache(cache: EdgeCache): Promise<void> {
    // Simple LRU eviction
    const entries = Array.from(cache.entries.entries());
    entries.sort(([,a], [,b]) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      const [key, entry] = entries[i];
      cache.entries.delete(key);
      cache.currentSize -= entry.size;
    }
  }

  private async getNodeMetrics(node: EdgeNode): Promise<any> {
    // Simplified metrics
    return {
      healthy: node.status === 'healthy',
      requests: Math.floor(Math.random() * 1000),
      latency: Math.random() * 100 + 50,
      cacheHitRate: Math.random() * 0.4 + 0.6 // 60-100%
    };
  }

  private getNodesInRegion(region: string): EdgeNode[] {
    return Array.from(this.edgeNodes.values()).filter(node => node.region === region);
  }

  private async getRegionMetrics(region: string): Promise<any> {
    const nodes = this.getNodesInRegion(region);
    const loads = await Promise.all(nodes.map(async (node) => {
      const health = await this.checkNodeHealth(node);
      return health.load;
    }));
    
    return {
      averageLoad: loads.reduce((sum, load) => sum + load, 0) / loads.length || 0
    };
  }

  private async executeScalingDecision(decision: ScalingDecision): Promise<void> {
    console.log(`🔄 Executing scaling decision: ${decision.action} in ${decision.region}`);
    
    if (decision.action === 'scale_up') {
      await this.addEdgeNodes(decision.region, decision.targetNodes - decision.currentNodes);
    } else if (decision.action === 'scale_down') {
      await this.removeEdgeNodes(decision.region, decision.currentNodes - decision.targetNodes);
    }
  }

  private async addEdgeNodes(region: string, count: number): Promise<void> {
    console.log(`➕ Adding ${count} edge nodes in ${region}`);
    // Implementation would provision new edge nodes
  }

  private async removeEdgeNodes(region: string, count: number): Promise<void> {
    console.log(`➖ Removing ${count} edge nodes in ${region}`);
    // Implementation would gracefully terminate edge nodes
  }

  private async distributeToNode(node: EdgeNode, config: ContentDistributionConfig): Promise<void> {
    console.log(`📡 Distributing content ${config.id} to node ${node.id}`);
    // Implementation would upload content to edge node
  }

  // Get edge computing statistics
  getEdgeStats(): EdgeStats {
    return {
      totalNodes: this.edgeNodes.size,
      healthyNodes: Array.from(this.edgeNodes.values()).filter(n => n.status === 'healthy').length,
      totalRegions: this.regionalConfigs.size,
      functionsDeployed: Array.from(this.edgeNodes.values()).reduce((sum, node) => sum + node.functions.size, 0),
      cacheSize: Array.from(this.edgeCache.values()).reduce((sum, cache) => sum + cache.currentSize, 0)
    };
  }
}

// Type definitions
interface EdgeNode {
  id: string;
  region: string;
  location: Location;
  capacity: {
    cpu: number;
    memory: number;
    storage: number;
  };
  currentLoad: {
    cpu: number;
    memory: number;
    storage: number;
  };
  status: 'healthy' | 'unhealthy' | 'error';
  functions: Map<string, any>;
  lastHealthCheck: Date;
}

interface Location {
  lat: number;
  lng: number;
}

interface EdgeFunctionConfig {
  id: string;
  code: string;
  runtime: 'nodejs' | 'python' | 'go' | 'rust';
  memory: number;
  timeout: number;
  regions: string[];
}

interface EdgeRequest {
  functionId: string;
  clientIP: string;
  data: any;
}

interface EdgeRoutingDecision {
  action: 'route_to_edge' | 'route_to_origin';
  nodeId?: string;
  region?: string;
  estimatedLatency?: number;
  fallbackUsed?: boolean;
  reason?: string;
  fallbackTo?: string;
}

interface EdgeExecutionResult {
  nodeId: string;
  functionId: string;
  executionId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime: Date | null;
  executionTime: number;
  result: any;
  error: string | null;
  cacheHit: boolean;
}

interface EdgeDeploymentResult {
  functionId: string;
  deploymentId: string;
  status: 'deploying' | 'completed' | 'failed' | 'partial';
  targetRegions: string[];
  deployedNodes: string[];
  failedNodes: Array<{ nodeId: string; error: string }>;
  startTime: Date;
  endTime: Date | null;
}

interface ContentDistributionConfig {
  id: string;
  content: Buffer;
  regions: string[];
  cacheTTL: number;
  compressionEnabled: boolean;
}

interface DistributionResult {
  contentId: string;
  distributionId: string;
  status: 'distributing' | 'completed' | 'failed' | 'partial';
  targetRegions: string[];
  distributedNodes: string[];
  failedNodes: Array<{ nodeId: string; error: string }>;
  totalSize: number;
  startTime: Date;
  endTime: Date | null;
}

interface CDNResource {
  id: string;
  type: 'static' | 'dynamic';
  priority: 'low' | 'medium' | 'high';
  regions: string[];
  cacheTTL: number;
  compressionEnabled: boolean;
}

interface EdgeCache {
  nodeId: string;
  entries: Map<string, any>;
  maxSize: number;
  currentSize: number;
  hitRate: number;
  lastCleanup: Date;
}

interface RegionalConfig {
  minNodes: number;
  maxNodes: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  scaleStep: number;
  cacheTTL: number;
  compressionEnabled: boolean;
}

interface EdgeMetrics {
  timestamp: Date;
  totalNodes: number;
  healthyNodes: number;
  totalRequests: number;
  cacheHitRate: number;
  averageLatency: number;
  regionalStats: Map<string, any>;
}

interface ScalingDecision {
  region: string;
  action: 'scale_up' | 'scale_down';
  currentNodes: number;
  targetNodes: number;
  reason: string;
}

interface EdgeStats {
  totalNodes: number;
  healthyNodes: number;
  totalRegions: number;
  functionsDeployed: number;
  cacheSize: number;
}

export const edgeComputing = EdgeComputingSystem.getInstance();