/**
 * Edge Computing for Regional Processing
 * Distributed verification processing for faster, localized services
 */

export interface EdgeNode {
  id: string;
  region: 'asia_pacific' | 'north_america' | 'europe' | 'south_america' | 'africa' | 'middle_east';
  country: string;
  city: string;
  status: 'active' | 'maintenance' | 'overloaded' | 'offline';
  capabilities: EdgeCapability[];
  resources: EdgeResources;
  latency: number; // ms
  load: number; // 0-100%
  lastHealthCheck: Date;
}

export interface EdgeCapability {
  type: 'zkp_generation' | 'document_verification' | 'biometric_processing' | 'fraud_detection' | 'encryption';
  enabled: boolean;
  performance: number; // operations per second
  accuracy: number; // 0-1
}

export interface EdgeResources {
  cpu: { cores: number; usage: number }; // usage 0-100%
  memory: { total: number; used: number }; // GB
  storage: { total: number; used: number }; // GB
  bandwidth: { download: number; upload: number }; // Mbps
  gpuAcceleration: boolean;
}

export interface ProcessingRequest {
  id: string;
  type: 'proof_generation' | 'document_analysis' | 'biometric_verification' | 'fraud_analysis';
  userId: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  requiredCapabilities: string[];
  maxLatency: number; // ms
  regionPreference?: string;
  timestamp: Date;
}

export interface ProcessingResult {
  requestId: string;
  nodeId: string;
  result: any;
  processingTime: number; // ms
  accuracy: number;
  timestamp: Date;
  cached: boolean;
}

class EdgeComputingService {
  private nodes: Map<string, EdgeNode> = new Map();
  private processingQueue: ProcessingRequest[] = [];
  private results: Map<string, ProcessingResult> = new Map();
  private loadBalancer: LoadBalancer;

  constructor() {
    this.loadBalancer = new LoadBalancer();
    this.initializeEdgeNodes();
    this.startHealthMonitoring();
  }

  private initializeEdgeNodes() {
    const nodes: EdgeNode[] = [
      // Asia Pacific Nodes
      {
        id: 'ap-singapore-01',
        region: 'asia_pacific',
        country: 'Singapore',
        city: 'Singapore',
        status: 'active',
        capabilities: [
          { type: 'zkp_generation', enabled: true, performance: 500, accuracy: 0.99 },
          { type: 'document_verification', enabled: true, performance: 200, accuracy: 0.95 },
          { type: 'biometric_processing', enabled: true, performance: 100, accuracy: 0.97 },
          { type: 'fraud_detection', enabled: true, performance: 300, accuracy: 0.92 }
        ],
        resources: {
          cpu: { cores: 16, usage: 45 },
          memory: { total: 64, used: 28 },
          storage: { total: 2000, used: 800 },
          bandwidth: { download: 1000, upload: 1000 },
          gpuAcceleration: true
        },
        latency: 25,
        load: 45,
        lastHealthCheck: new Date()
      },
      {
        id: 'ap-tokyo-01',
        region: 'asia_pacific',
        country: 'Japan',
        city: 'Tokyo',
        status: 'active',
        capabilities: [
          { type: 'zkp_generation', enabled: true, performance: 600, accuracy: 0.995 },
          { type: 'document_verification', enabled: true, performance: 250, accuracy: 0.96 },
          { type: 'encryption', enabled: true, performance: 800, accuracy: 1.0 }
        ],
        resources: {
          cpu: { cores: 20, usage: 35 },
          memory: { total: 128, used: 45 },
          storage: { total: 4000, used: 1200 },
          bandwidth: { download: 1500, upload: 1500 },
          gpuAcceleration: true
        },
        latency: 15,
        load: 35,
        lastHealthCheck: new Date()
      },
      {
        id: 'ap-mumbai-01',
        region: 'asia_pacific',
        country: 'India',
        city: 'Mumbai',
        status: 'active',
        capabilities: [
          { type: 'document_verification', enabled: true, performance: 180, accuracy: 0.94 },
          { type: 'biometric_processing', enabled: true, performance: 120, accuracy: 0.96 },
          { type: 'fraud_detection', enabled: true, performance: 250, accuracy: 0.91 }
        ],
        resources: {
          cpu: { cores: 12, usage: 55 },
          memory: { total: 32, used: 18 },
          storage: { total: 1000, used: 400 },
          bandwidth: { download: 500, upload: 500 },
          gpuAcceleration: false
        },
        latency: 35,
        load: 55,
        lastHealthCheck: new Date()
      },
      // North America Nodes
      {
        id: 'na-virginia-01',
        region: 'north_america',
        country: 'United States',
        city: 'Virginia',
        status: 'active',
        capabilities: [
          { type: 'zkp_generation', enabled: true, performance: 550, accuracy: 0.99 },
          { type: 'document_verification', enabled: true, performance: 220, accuracy: 0.95 },
          { type: 'biometric_processing', enabled: true, performance: 110, accuracy: 0.97 },
          { type: 'fraud_detection', enabled: true, performance: 320, accuracy: 0.93 },
          { type: 'encryption', enabled: true, performance: 700, accuracy: 1.0 }
        ],
        resources: {
          cpu: { cores: 24, usage: 40 },
          memory: { total: 256, used: 90 },
          storage: { total: 8000, used: 2400 },
          bandwidth: { download: 2000, upload: 2000 },
          gpuAcceleration: true
        },
        latency: 20,
        load: 40,
        lastHealthCheck: new Date()
      },
      // Europe Nodes
      {
        id: 'eu-frankfurt-01',
        region: 'europe',
        country: 'Germany',
        city: 'Frankfurt',
        status: 'active',
        capabilities: [
          { type: 'zkp_generation', enabled: true, performance: 480, accuracy: 0.99 },
          { type: 'document_verification', enabled: true, performance: 200, accuracy: 0.96 },
          { type: 'encryption', enabled: true, performance: 650, accuracy: 1.0 }
        ],
        resources: {
          cpu: { cores: 18, usage: 50 },
          memory: { total: 96, used: 48 },
          storage: { total: 3000, used: 1500 },
          bandwidth: { download: 1200, upload: 1200 },
          gpuAcceleration: true
        },
        latency: 30,
        load: 50,
        lastHealthCheck: new Date()
      }
    ];

    nodes.forEach(node => this.nodes.set(node.id, node));
    console.log(`🌐 Initialized ${nodes.length} edge computing nodes`);
  }

  // Request Processing
  async submitProcessingRequest(request: Omit<ProcessingRequest, 'id' | 'timestamp'>): Promise<string> {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullRequest: ProcessingRequest = {
      ...request,
      id: requestId,
      timestamp: new Date()
    };

    this.processingQueue.push(fullRequest);
    
    // Process request asynchronously
    setTimeout(() => {
      this.processRequest(fullRequest);
    }, 100);

    console.log(`📤 Submitted processing request: ${requestId}`);
    return requestId;
  }

  private async processRequest(request: ProcessingRequest): Promise<void> {
    // Find optimal edge node
    const optimalNode = await this.loadBalancer.findOptimalNode(
      this.nodes,
      request.requiredCapabilities,
      request.maxLatency,
      request.regionPreference
    );

    if (!optimalNode) {
      console.error(`❌ No suitable edge node found for request: ${request.id}`);
      return;
    }

    const startTime = Date.now();
    
    // Simulate processing
    const result = await this.simulateProcessing(request, optimalNode);
    
    const processingTime = Date.now() - startTime;

    const processingResult: ProcessingResult = {
      requestId: request.id,
      nodeId: optimalNode.id,
      result,
      processingTime,
      accuracy: this.calculateAccuracy(request.type, optimalNode),
      timestamp: new Date(),
      cached: false
    };

    this.results.set(request.id, processingResult);
    
    // Update node load
    this.updateNodeLoad(optimalNode.id, request);

    console.log(`✅ Processed request ${request.id} on node ${optimalNode.id} in ${processingTime}ms`);
  }

  private async simulateProcessing(request: ProcessingRequest, node: EdgeNode): Promise<any> {
    const capability = node.capabilities.find(cap => 
      request.requiredCapabilities.includes(cap.type)
    );

    if (!capability) {
      throw new Error('Node lacks required capabilities');
    }

    // Simulate processing time based on complexity and node performance
    const baseProcessingTime = 1000; // 1 second base
    const complexityFactor = this.getComplexityFactor(request.type);
    const performanceFactor = capability.performance / 100;
    
    const processingTime = Math.max(100, baseProcessingTime * complexityFactor / performanceFactor);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Return mock result based on request type
    return this.generateMockResult(request.type, request.data);
  }

  private getComplexityFactor(type: ProcessingRequest['type']): number {
    switch (type) {
      case 'proof_generation': return 3.0;
      case 'document_analysis': return 2.0;
      case 'biometric_verification': return 2.5;
      case 'fraud_analysis': return 1.5;
      default: return 2.0;
    }
  }

  private generateMockResult(type: ProcessingRequest['type'], data: any): any {
    switch (type) {
      case 'proof_generation':
        return {
          proof: `zk-proof-${Math.random().toString(36).substr(2, 16)}`,
          verification_key: `vk-${Math.random().toString(36).substr(2, 16)}`,
          success: true
        };
      
      case 'document_analysis':
        return {
          authenticity: 0.85 + Math.random() * 0.1,
          extracted_data: {
            name: 'John Doe',
            document_number: `DOC${Math.floor(Math.random() * 1000000)}`,
            expiry_date: '2025-12-31'
          },
          anomalies: []
        };
      
      case 'biometric_verification':
        return {
          match: Math.random() > 0.1,
          confidence: 0.8 + Math.random() * 0.15,
          biometric_quality: 0.9 + Math.random() * 0.1
        };
      
      case 'fraud_analysis':
        return {
          risk_score: Math.random() * 30, // 0-30 (low risk)
          flagged_patterns: [],
          recommendation: 'approve'
        };
      
      default:
        return { success: true, processed: true };
    }
  }

  private calculateAccuracy(type: ProcessingRequest['type'], node: EdgeNode): number {
    const capability = node.capabilities.find(cap => cap.type === type);
    return capability?.accuracy || 0.8;
  }

  private updateNodeLoad(nodeId: string, request: ProcessingRequest): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const loadIncrease = this.getLoadImpact(request.type);
    node.load = Math.min(100, node.load + loadIncrease);
    
    // Simulate load decrease over time
    setTimeout(() => {
      if (node.load > loadIncrease) {
        node.load -= loadIncrease;
      }
    }, 30000); // 30 seconds
  }

  private getLoadImpact(type: ProcessingRequest['type']): number {
    switch (type) {
      case 'proof_generation': return 15;
      case 'document_analysis': return 10;
      case 'biometric_verification': return 12;
      case 'fraud_analysis': return 8;
      default: return 10;
    }
  }

  // Results and Monitoring
  async getProcessingResult(requestId: string): Promise<ProcessingResult | null> {
    return this.results.get(requestId) || null;
  }

  async getEdgeNodeStatus(): Promise<{
    totalNodes: number;
    activeNodes: number;
    averageLatency: number;
    averageLoad: number;
    regionDistribution: Record<string, number>;
    totalCapacity: Record<string, number>;
  }> {
    const nodes = Array.from(this.nodes.values());
    const activeNodes = nodes.filter(n => n.status === 'active');

    const averageLatency = activeNodes.reduce((sum, n) => sum + n.latency, 0) / activeNodes.length;
    const averageLoad = activeNodes.reduce((sum, n) => sum + n.load, 0) / activeNodes.length;

    const regionDistribution = nodes.reduce((acc, node) => {
      acc[node.region] = (acc[node.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCapacity = activeNodes.reduce((acc, node) => {
      node.capabilities.forEach(cap => {
        acc[cap.type] = (acc[cap.type] || 0) + cap.performance;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      totalNodes: nodes.length,
      activeNodes: activeNodes.length,
      averageLatency,
      averageLoad,
      regionDistribution,
      totalCapacity
    };
  }

  // Health Monitoring
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Every minute
  }

  private async performHealthChecks(): Promise<void> {
    for (const [nodeId, node] of this.nodes.entries()) {
      const health = await this.checkNodeHealth(node);
      
      if (!health.healthy && node.status === 'active') {
        node.status = 'offline';
        console.warn(`🔴 Node ${nodeId} marked as offline due to health check failure`);
      } else if (health.healthy && node.status === 'offline') {
        node.status = 'active';
        console.log(`🟢 Node ${nodeId} back online`);
      }

      node.lastHealthCheck = new Date();
    }
  }

  private async checkNodeHealth(node: EdgeNode): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check resource usage
    if (node.resources.cpu.usage > 90) {
      issues.push('High CPU usage');
    }

    if (node.resources.memory.used / node.resources.memory.total > 0.9) {
      issues.push('High memory usage');
    }

    if (node.load > 95) {
      issues.push('Node overloaded');
    }

    if (node.latency > 100) {
      issues.push('High latency');
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  // Administration
  async addEdgeNode(node: Omit<EdgeNode, 'id' | 'lastHealthCheck'>): Promise<string> {
    const nodeId = `${node.region}-${node.city.toLowerCase()}-${Date.now().toString(36)}`;
    
    const fullNode: EdgeNode = {
      ...node,
      id: nodeId,
      lastHealthCheck: new Date()
    };

    this.nodes.set(nodeId, fullNode);
    
    console.log(`➕ Added edge node: ${nodeId} in ${node.city}, ${node.country}`);
    return nodeId;
  }

  async removeEdgeNode(nodeId: string): Promise<boolean> {
    const removed = this.nodes.delete(nodeId);
    if (removed) {
      console.log(`➖ Removed edge node: ${nodeId}`);
    }
    return removed;
  }
}

class LoadBalancer {
  async findOptimalNode(
    nodes: Map<string, EdgeNode>,
    requiredCapabilities: string[],
    maxLatency: number,
    regionPreference?: string
  ): Promise<EdgeNode | null> {
    const activeNodes = Array.from(nodes.values()).filter(node => 
      node.status === 'active' &&
      node.latency <= maxLatency &&
      this.hasRequiredCapabilities(node, requiredCapabilities)
    );

    if (activeNodes.length === 0) return null;

    // Prefer nodes in the requested region
    let candidateNodes = activeNodes;
    if (regionPreference) {
      const regionalNodes = activeNodes.filter(node => node.region === regionPreference);
      if (regionalNodes.length > 0) {
        candidateNodes = regionalNodes;
      }
    }

    // Score nodes based on multiple factors
    const scoredNodes = candidateNodes.map(node => ({
      node,
      score: this.calculateNodeScore(node, requiredCapabilities)
    }));

    // Sort by score (higher is better)
    scoredNodes.sort((a, b) => b.score - a.score);

    return scoredNodes[0].node;
  }

  private hasRequiredCapabilities(node: EdgeNode, requiredCapabilities: string[]): boolean {
    return requiredCapabilities.every(required =>
      node.capabilities.some(cap => cap.type === required && cap.enabled)
    );
  }

  private calculateNodeScore(node: EdgeNode, requiredCapabilities: string[]): number {
    let score = 100; // Base score

    // Penalize high load
    score -= node.load * 0.5;

    // Penalize high latency
    score -= node.latency * 0.1;

    // Reward better performance for required capabilities
    const relevantCapabilities = node.capabilities.filter(cap => 
      requiredCapabilities.includes(cap.type)
    );

    const avgPerformance = relevantCapabilities.reduce((sum, cap) => sum + cap.performance, 0) / relevantCapabilities.length;
    score += avgPerformance * 0.01;

    // Reward GPU acceleration
    if (node.resources.gpuAcceleration) {
      score += 10;
    }

    return Math.max(0, score);
  }
}

export const edgeComputingService = new EdgeComputingService();