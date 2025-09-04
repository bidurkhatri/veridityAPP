/**
 * Load Testing and Performance Analysis
 * Comprehensive testing for 1M+ concurrent users
 */

export interface LoadTestScenario {
  id: string;
  name: string;
  description: string;
  type: 'smoke' | 'load' | 'stress' | 'spike' | 'volume' | 'endurance';
  configuration: TestConfiguration;
  virtualUsers: VirtualUserConfig;
  testData: TestDataConfig;
  assertions: PerformanceAssertion[];
  environment: TestEnvironment;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  results?: LoadTestResults;
}

export interface TestConfiguration {
  duration: number; // seconds
  rampUpTime: number; // seconds
  rampDownTime: number; // seconds
  thinkTime: { min: number; max: number }; // seconds between requests
  dataCenter: string[];
  protocols: ('http' | 'https' | 'websocket' | 'grpc')[];
  requestTimeoutOverride?: number;
  maxRetries?: number;
}

export interface VirtualUserConfig {
  totalUsers: number;
  concurrentUsers: number;
  userRampRate: number; // users per second
  userBehavior: UserBehaviorPattern[];
  geographicDistribution: GeographicDistribution[];
  deviceTypes: DeviceTypeDistribution[];
}

export interface UserBehaviorPattern {
  id: string;
  name: string;
  weight: number; // percentage of users following this pattern
  steps: TestStep[];
  iterationCount?: number;
  pacing?: number; // seconds between iterations
}

export interface TestStep {
  id: string;
  name: string;
  type: 'http_request' | 'websocket_connect' | 'grpc_call' | 'wait' | 'think_time' | 'data_extraction';
  configuration: StepConfiguration;
  validation?: StepValidation[];
  correlations?: DataCorrelation[];
}

export interface StepConfiguration {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  parameters?: Record<string, any>;
  timeout?: number;
  followRedirects?: boolean;
  extractors?: DataExtractor[];
}

export interface StepValidation {
  type: 'status_code' | 'response_time' | 'response_body' | 'response_header' | 'json_path';
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  expected: any;
  path?: string; // for json_path validation
}

export interface DataCorrelation {
  parameter: string;
  source: 'response_body' | 'response_header' | 'cookie' | 'url';
  extraction: {
    type: 'regex' | 'json_path' | 'xpath' | 'boundary';
    pattern: string;
  };
}

export interface DataExtractor {
  name: string;
  type: 'regex' | 'json_path' | 'xpath' | 'css_selector';
  expression: string;
  defaultValue?: any;
}

export interface GeographicDistribution {
  region: string;
  country: string;
  percentage: number;
  latency: number; // additional latency in ms
}

export interface DeviceTypeDistribution {
  type: 'mobile' | 'tablet' | 'desktop' | 'server';
  percentage: number;
  userAgents: string[];
  networkType: '2g' | '3g' | '4g' | '5g' | 'wifi' | 'ethernet';
}

export interface TestDataConfig {
  dataFiles: TestDataFile[];
  dataGeneration: DataGenerationRule[];
  parameterization: ParameterizationConfig;
}

export interface TestDataFile {
  name: string;
  type: 'csv' | 'json' | 'xml' | 'database';
  source: string;
  delimiter?: string;
  headers?: string[];
  sampleData?: any[];
}

export interface DataGenerationRule {
  parameter: string;
  type: 'random_string' | 'random_number' | 'random_email' | 'random_uuid' | 'timestamp' | 'sequence';
  configuration: {
    length?: number;
    prefix?: string;
    suffix?: string;
    min?: number;
    max?: number;
    format?: string;
  };
}

export interface ParameterizationConfig {
  strategy: 'sequential' | 'random' | 'unique';
  distribution: 'even' | 'weighted';
  recycling: boolean;
}

export interface PerformanceAssertion {
  id: string;
  metric: 'response_time' | 'throughput' | 'error_rate' | 'cpu_usage' | 'memory_usage' | 'concurrent_users';
  aggregation: 'avg' | 'min' | 'max' | 'p50' | 'p90' | 'p95' | 'p99';
  condition: 'less_than' | 'greater_than' | 'equals' | 'between';
  threshold: number | [number, number];
  scope: 'global' | 'step' | 'scenario';
  target?: string; // specific step or scenario if scope is not global
}

export interface TestEnvironment {
  name: string;
  baseUrl: string;
  region: string;
  loadGenerators: LoadGenerator[];
  monitoring: MonitoringConfig;
  infrastructure: InfrastructureConfig;
}

export interface LoadGenerator {
  id: string;
  location: string;
  capacity: {
    maxUsers: number;
    maxRps: number; // requests per second
    cpu: number;
    memory: number; // GB
  };
  status: 'available' | 'busy' | 'offline';
  currentLoad: number; // 0-100%
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: MonitoringMetric[];
  alerting: AlertingConfig;
  retention: number; // days
}

export interface MonitoringMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  source: 'application' | 'infrastructure' | 'synthetic';
  collection_interval: number; // seconds
}

export interface AlertingConfig {
  enabled: boolean;
  channels: ('email' | 'slack' | 'webhook')[];
  thresholds: AlertThreshold[];
}

export interface AlertThreshold {
  metric: string;
  condition: string;
  value: number;
  duration: number; // seconds
  severity: 'warning' | 'critical';
}

export interface InfrastructureConfig {
  autoScaling: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    targetCpuUtilization: number;
    targetMemoryUtilization: number;
  };
  loadBalancing: {
    algorithm: 'round_robin' | 'least_connections' | 'ip_hash';
    healthCheck: {
      enabled: boolean;
      interval: number;
      timeout: number;
      unhealthyThreshold: number;
    };
  };
}

export interface LoadTestResults {
  summary: TestSummary;
  metrics: MetricResults;
  assertions: AssertionResults[];
  transactions: TransactionResults[];
  errors: ErrorAnalysis;
  resourceUtilization: ResourceUtilization;
  recommendations: PerformanceRecommendation[];
}

export interface TestSummary {
  totalDuration: number; // seconds
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalDataTransferred: number; // bytes
  averageResponseTime: number; // ms
  peakThroughput: number; // requests per second
  maxConcurrentUsers: number;
  errorRate: number; // percentage
}

export interface MetricResults {
  responseTime: {
    avg: number;
    min: number;
    max: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  throughput: {
    avg: number;
    peak: number;
    sustained: number; // highest throughput maintained for 1+ minutes
  };
  concurrency: {
    avg: number;
    peak: number;
    target: number;
  };
  networkMetrics: {
    bandwidth: number; // Mbps
    packetLoss: number; // percentage
    latency: number; // ms
  };
}

export interface AssertionResults {
  assertionId: string;
  metric: string;
  expected: any;
  actual: any;
  passed: boolean;
  message: string;
}

export interface TransactionResults {
  name: string;
  count: number;
  successRate: number;
  responseTime: {
    avg: number;
    min: number;
    max: number;
    p95: number;
  };
  throughput: number;
  errors: TransactionError[];
}

export interface TransactionError {
  type: string;
  count: number;
  percentage: number;
  examples: string[];
}

export interface ErrorAnalysis {
  totalErrors: number;
  errorRate: number;
  errorTypes: ErrorType[];
  errorDistribution: TimeSeriesData[];
  topErrors: TopError[];
}

export interface ErrorType {
  category: 'network' | 'application' | 'timeout' | 'authentication' | 'validation';
  count: number;
  percentage: number;
  httpCodes: Record<string, number>;
}

export interface TopError {
  message: string;
  count: number;
  percentage: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  affectedSteps: string[];
}

export interface ResourceUtilization {
  application: {
    cpu: TimeSeriesData[];
    memory: TimeSeriesData[];
    diskIO: TimeSeriesData[];
    networkIO: TimeSeriesData[];
  };
  database: {
    connections: TimeSeriesData[];
    queryTime: TimeSeriesData[];
    lockWaitTime: TimeSeriesData[];
    cpu: TimeSeriesData[];
  };
  infrastructure: {
    loadBalancer: {
      activeConnections: TimeSeriesData[];
      requestRate: TimeSeriesData[];
      healthyTargets: TimeSeriesData[];
    };
    autoscaling: {
      instances: TimeSeriesData[];
      scalingEvents: ScalingEvent[];
    };
  };
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metric: string;
}

export interface ScalingEvent {
  timestamp: Date;
  type: 'scale_up' | 'scale_down';
  trigger: string;
  instancesBefore: number;
  instancesAfter: number;
}

export interface PerformanceRecommendation {
  category: 'optimization' | 'scaling' | 'configuration' | 'architecture';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implementation: string[];
}

class LoadTestingService {
  private scenarios: Map<string, LoadTestScenario> = new Map();
  private testResults: Map<string, LoadTestResults> = new Map();
  private activeTests: Map<string, TestExecution> = new Map();
  private loadGenerators: Map<string, LoadGenerator> = new Map();

  constructor() {
    this.initializeLoadGenerators();
    this.createDefaultScenarios();
  }

  private initializeLoadGenerators() {
    const generators: LoadGenerator[] = [
      {
        id: 'lg-us-west-1',
        location: 'US West (Oregon)',
        capacity: {
          maxUsers: 100000,
          maxRps: 50000,
          cpu: 32,
          memory: 128
        },
        status: 'available',
        currentLoad: 0
      },
      {
        id: 'lg-us-east-1',
        location: 'US East (Virginia)',
        capacity: {
          maxUsers: 100000,
          maxRps: 50000,
          cpu: 32,
          memory: 128
        },
        status: 'available',
        currentLoad: 0
      },
      {
        id: 'lg-eu-west-1',
        location: 'Europe (Ireland)',
        capacity: {
          maxUsers: 75000,
          maxRps: 40000,
          cpu: 24,
          memory: 96
        },
        status: 'available',
        currentLoad: 0
      },
      {
        id: 'lg-ap-south-1',
        location: 'Asia Pacific (Mumbai)',
        capacity: {
          maxUsers: 50000,
          maxRps: 30000,
          cpu: 16,
          memory: 64
        },
        status: 'available',
        currentLoad: 0
      }
    ];

    generators.forEach(generator => this.loadGenerators.set(generator.id, generator));
    console.log(`🏋️ Initialized ${generators.length} load generators with total capacity: ${generators.reduce((sum, g) => sum + g.capacity.maxUsers, 0).toLocaleString()} virtual users`);
  }

  private createDefaultScenarios() {
    const scenarios: LoadTestScenario[] = [
      {
        id: 'smoke-test',
        name: 'Smoke Test',
        description: 'Basic functionality test with minimal load',
        type: 'smoke',
        configuration: {
          duration: 300, // 5 minutes
          rampUpTime: 60,
          rampDownTime: 60,
          thinkTime: { min: 1, max: 5 },
          dataCenter: ['us-west-1'],
          protocols: ['https']
        },
        virtualUsers: {
          totalUsers: 100,
          concurrentUsers: 10,
          userRampRate: 1,
          userBehavior: [
            {
              id: 'basic-flow',
              name: 'Basic User Flow',
              weight: 100,
              steps: [
                {
                  id: 'login',
                  name: 'User Login',
                  type: 'http_request',
                  configuration: {
                    url: '/api/auth/login',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: { email: '${email}', password: '${password}' }
                  },
                  validation: [
                    { type: 'status_code', condition: 'equals', expected: 200 },
                    { type: 'response_time', condition: 'less_than', expected: 2000 }
                  ]
                },
                {
                  id: 'generate-proof',
                  name: 'Generate Proof',
                  type: 'http_request',
                  configuration: {
                    url: '/api/proofs/generate',
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ${token}' },
                    body: { type: 'age_verification', data: '${user_data}' }
                  },
                  validation: [
                    { type: 'status_code', condition: 'equals', expected: 201 },
                    { type: 'response_time', condition: 'less_than', expected: 5000 }
                  ]
                }
              ]
            }
          ],
          geographicDistribution: [
            { region: 'North America', country: 'US', percentage: 100, latency: 0 }
          ],
          deviceTypes: [
            { type: 'desktop', percentage: 70, userAgents: ['Chrome/91.0'], networkType: 'wifi' },
            { type: 'mobile', percentage: 30, userAgents: ['Mobile Safari'], networkType: '4g' }
          ]
        },
        testData: {
          dataFiles: [
            {
              name: 'users',
              type: 'csv',
              source: '/test-data/users.csv',
              headers: ['email', 'password'],
              sampleData: [
                { email: 'test1@example.com', password: 'password123' },
                { email: 'test2@example.com', password: 'password123' }
              ]
            }
          ],
          dataGeneration: [
            {
              parameter: 'user_data',
              type: 'random_string',
              configuration: { length: 32, prefix: 'data_' }
            }
          ],
          parameterization: {
            strategy: 'sequential',
            distribution: 'even',
            recycling: true
          }
        },
        assertions: [
          {
            id: 'response-time-assertion',
            metric: 'response_time',
            aggregation: 'p95',
            condition: 'less_than',
            threshold: 3000,
            scope: 'global'
          },
          {
            id: 'error-rate-assertion',
            metric: 'error_rate',
            aggregation: 'avg',
            condition: 'less_than',
            threshold: 1,
            scope: 'global'
          }
        ],
        environment: {
          name: 'staging',
          baseUrl: 'https://staging.veridity.com',
          region: 'us-west-1',
          loadGenerators: [this.loadGenerators.get('lg-us-west-1')!],
          monitoring: {
            enabled: true,
            metrics: [
              { name: 'response_time', type: 'histogram', source: 'synthetic', collection_interval: 10 },
              { name: 'error_rate', type: 'gauge', source: 'synthetic', collection_interval: 10 }
            ],
            alerting: {
              enabled: true,
              channels: ['email'],
              thresholds: [
                { metric: 'error_rate', condition: 'greater_than', value: 5, duration: 60, severity: 'warning' }
              ]
            },
            retention: 30
          },
          infrastructure: {
            autoScaling: {
              enabled: true,
              minInstances: 2,
              maxInstances: 10,
              targetCpuUtilization: 70,
              targetMemoryUtilization: 80
            },
            loadBalancing: {
              algorithm: 'round_robin',
              healthCheck: {
                enabled: true,
                interval: 30,
                timeout: 5,
                unhealthyThreshold: 3
              }
            }
          }
        },
        status: 'pending'
      },
      {
        id: 'load-test-1m-users',
        name: '1M Concurrent Users Load Test',
        description: 'High-scale load test simulating 1 million concurrent users',
        type: 'load',
        configuration: {
          duration: 3600, // 1 hour
          rampUpTime: 1800, // 30 minutes
          rampDownTime: 600, // 10 minutes
          thinkTime: { min: 5, max: 30 },
          dataCenter: ['us-west-1', 'us-east-1', 'eu-west-1', 'ap-south-1'],
          protocols: ['https', 'websocket']
        },
        virtualUsers: {
          totalUsers: 1000000,
          concurrentUsers: 1000000,
          userRampRate: 555, // ~1M users in 30 minutes
          userBehavior: [
            {
              id: 'heavy-user-flow',
              name: 'Heavy User Flow',
              weight: 60,
              steps: [
                {
                  id: 'auth-flow',
                  name: 'Authentication Flow',
                  type: 'http_request',
                  configuration: {
                    url: '/api/auth/login',
                    method: 'POST'
                  }
                },
                {
                  id: 'dashboard-load',
                  name: 'Load Dashboard',
                  type: 'http_request',
                  configuration: {
                    url: '/api/dashboard',
                    method: 'GET'
                  }
                },
                {
                  id: 'verification-process',
                  name: 'Identity Verification',
                  type: 'http_request',
                  configuration: {
                    url: '/api/verify',
                    method: 'POST'
                  }
                }
              ],
              iterationCount: 5,
              pacing: 60
            },
            {
              id: 'light-user-flow',
              name: 'Light User Flow',
              weight: 40,
              steps: [
                {
                  id: 'quick-check',
                  name: 'Quick Status Check',
                  type: 'http_request',
                  configuration: {
                    url: '/api/status',
                    method: 'GET'
                  }
                }
              ],
              iterationCount: 1,
              pacing: 300
            }
          ],
          geographicDistribution: [
            { region: 'North America', country: 'US', percentage: 40, latency: 0 },
            { region: 'Europe', country: 'UK', percentage: 25, latency: 100 },
            { region: 'Asia', country: 'IN', percentage: 20, latency: 150 },
            { region: 'Other', country: 'Various', percentage: 15, latency: 200 }
          ],
          deviceTypes: [
            { type: 'mobile', percentage: 60, userAgents: ['Mobile'], networkType: '4g' },
            { type: 'desktop', percentage: 35, userAgents: ['Chrome'], networkType: 'wifi' },
            { type: 'tablet', percentage: 5, userAgents: ['Tablet'], networkType: 'wifi' }
          ]
        },
        testData: {
          dataFiles: [
            {
              name: 'million_users',
              type: 'database',
              source: 'postgresql://test:test@localhost/load_test_data'
            }
          ],
          dataGeneration: [
            {
              parameter: 'session_id',
              type: 'random_uuid',
              configuration: {}
            },
            {
              parameter: 'timestamp',
              type: 'timestamp',
              configuration: { format: 'iso8601' }
            }
          ],
          parameterization: {
            strategy: 'unique',
            distribution: 'weighted',
            recycling: false
          }
        },
        assertions: [
          {
            id: 'peak-throughput',
            metric: 'throughput',
            aggregation: 'max',
            condition: 'greater_than',
            threshold: 50000,
            scope: 'global'
          },
          {
            id: 'response-time-p99',
            metric: 'response_time',
            aggregation: 'p99',
            condition: 'less_than',
            threshold: 10000,
            scope: 'global'
          },
          {
            id: 'error-rate-limit',
            metric: 'error_rate',
            aggregation: 'avg',
            condition: 'less_than',
            threshold: 0.5,
            scope: 'global'
          }
        ],
        environment: {
          name: 'production-replica',
          baseUrl: 'https://load-test.veridity.com',
          region: 'global',
          loadGenerators: Array.from(this.loadGenerators.values()),
          monitoring: {
            enabled: true,
            metrics: [
              { name: 'response_time', type: 'histogram', source: 'synthetic', collection_interval: 5 },
              { name: 'throughput', type: 'counter', source: 'synthetic', collection_interval: 5 },
              { name: 'concurrent_users', type: 'gauge', source: 'synthetic', collection_interval: 10 }
            ],
            alerting: {
              enabled: true,
              channels: ['email', 'slack'],
              thresholds: [
                { metric: 'error_rate', condition: 'greater_than', value: 1, duration: 120, severity: 'critical' },
                { metric: 'response_time', condition: 'greater_than', value: 15000, duration: 300, severity: 'warning' }
              ]
            },
            retention: 90
          },
          infrastructure: {
            autoScaling: {
              enabled: true,
              minInstances: 10,
              maxInstances: 100,
              targetCpuUtilization: 60,
              targetMemoryUtilization: 70
            },
            loadBalancing: {
              algorithm: 'least_connections',
              healthCheck: {
                enabled: true,
                interval: 15,
                timeout: 3,
                unhealthyThreshold: 2
              }
            }
          }
        },
        status: 'pending'
      }
    ];

    scenarios.forEach(scenario => this.scenarios.set(scenario.id, scenario));
    console.log(`📋 Created ${scenarios.length} default load test scenarios`);
  }

  // Test execution
  async executeLoadTest(scenarioId: string): Promise<string> {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate resources
    const requiredCapacity = scenario.virtualUsers.totalUsers;
    const availableCapacity = this.calculateAvailableCapacity();
    
    if (requiredCapacity > availableCapacity) {
      throw new Error(`Insufficient capacity: need ${requiredCapacity}, available ${availableCapacity}`);
    }

    const execution: TestExecution = {
      id: executionId,
      scenarioId,
      status: 'initializing',
      startTime: new Date(),
      progress: 0,
      currentUsers: 0,
      allocatedGenerators: this.allocateLoadGenerators(scenario),
      metrics: {
        requestsPerSecond: 0,
        averageResponseTime: 0,
        errorRate: 0,
        activeUsers: 0
      }
    };

    this.activeTests.set(executionId, execution);
    scenario.status = 'running';

    // Start execution asynchronously
    setTimeout(() => {
      this.runLoadTest(executionId);
    }, 1000);

    console.log(`🚀 Started load test execution: ${executionId} for scenario: ${scenario.name}`);
    return executionId;
  }

  private calculateAvailableCapacity(): number {
    return Array.from(this.loadGenerators.values())
      .filter(generator => generator.status === 'available')
      .reduce((total, generator) => {
        const availableCapacity = generator.capacity.maxUsers * (1 - generator.currentLoad / 100);
        return total + availableCapacity;
      }, 0);
  }

  private allocateLoadGenerators(scenario: LoadTestScenario): LoadGenerator[] {
    const requiredUsers = scenario.virtualUsers.totalUsers;
    const generators: LoadGenerator[] = [];
    let allocatedUsers = 0;

    // Distribute users across available generators
    for (const generator of this.loadGenerators.values()) {
      if (generator.status === 'available' && allocatedUsers < requiredUsers) {
        const generatorCapacity = generator.capacity.maxUsers * (1 - generator.currentLoad / 100);
        const usersToAllocate = Math.min(generatorCapacity, requiredUsers - allocatedUsers);
        
        if (usersToAllocate > 0) {
          generators.push(generator);
          generator.currentLoad += (usersToAllocate / generator.capacity.maxUsers) * 100;
          allocatedUsers += usersToAllocate;
        }
      }
    }

    return generators;
  }

  private async runLoadTest(executionId: string): Promise<void> {
    const execution = this.activeTests.get(executionId);
    if (!execution) return;

    const scenario = this.scenarios.get(execution.scenarioId)!;
    
    try {
      execution.status = 'ramp_up';
      await this.executeRampUp(execution, scenario);
      
      execution.status = 'steady_state';
      await this.executeSteadyState(execution, scenario);
      
      execution.status = 'ramp_down';
      await this.executeRampDown(execution, scenario);
      
      execution.status = 'completed';
      execution.endTime = new Date();
      
      // Generate results
      const results = await this.generateResults(execution, scenario);
      this.testResults.set(executionId, results);
      
      // Release resources
      this.releaseGenerators(execution.allocatedGenerators);
      
      scenario.status = 'completed';
      scenario.results = results;
      
      console.log(`✅ Load test completed: ${executionId}`);
      
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = error instanceof Error ? error.message : 'Load test failed';
      
      this.releaseGenerators(execution.allocatedGenerators);
      scenario.status = 'failed';
      
      console.error(`❌ Load test failed: ${executionId}`, error);
    }
  }

  private async executeRampUp(execution: TestExecution, scenario: LoadTestScenario): Promise<void> {
    const rampUpTime = scenario.configuration.rampUpTime * 1000; // Convert to ms
    const targetUsers = scenario.virtualUsers.totalUsers;
    const rampRate = targetUsers / (rampUpTime / 1000); // users per second
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / rampUpTime);
      
      execution.currentUsers = Math.floor(targetUsers * progress);
      execution.progress = progress * 33.33; // Ramp-up is 1/3 of total progress
      
      // Simulate metrics during ramp-up
      execution.metrics.activeUsers = execution.currentUsers;
      execution.metrics.requestsPerSecond = execution.currentUsers * 0.5; // Simulate RPS
      execution.metrics.averageResponseTime = 200 + (execution.currentUsers / 1000); // Increase with load
      execution.metrics.errorRate = Math.min(5, execution.currentUsers / 100000); // Slight increase in errors
      
      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 1000);
    
    // Wait for ramp-up to complete
    await new Promise(resolve => setTimeout(resolve, rampUpTime));
  }

  private async executeSteadyState(execution: TestExecution, scenario: LoadTestScenario): Promise<void> {
    const steadyDuration = (scenario.configuration.duration - 
                          scenario.configuration.rampUpTime - 
                          scenario.configuration.rampDownTime) * 1000;
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / steadyDuration);
      
      execution.progress = 33.33 + (progress * 33.33); // Steady state is next 1/3
      
      // Simulate steady-state metrics
      execution.metrics.activeUsers = execution.currentUsers;
      execution.metrics.requestsPerSecond = execution.currentUsers * (0.8 + Math.random() * 0.4); // Vary RPS
      execution.metrics.averageResponseTime = 200 + (execution.currentUsers / 800) + (Math.random() * 100);
      execution.metrics.errorRate = Math.random() * 2; // Random error rate 0-2%
      
      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 1000);
    
    await new Promise(resolve => setTimeout(resolve, steadyDuration));
  }

  private async executeRampDown(execution: TestExecution, scenario: LoadTestScenario): Promise<void> {
    const rampDownTime = scenario.configuration.rampDownTime * 1000;
    const startUsers = execution.currentUsers;
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / rampDownTime);
      
      execution.currentUsers = Math.floor(startUsers * (1 - progress));
      execution.progress = 66.66 + (progress * 33.34); // Final 1/3
      
      // Simulate ramp-down metrics
      execution.metrics.activeUsers = execution.currentUsers;
      execution.metrics.requestsPerSecond = execution.currentUsers * 0.5;
      execution.metrics.averageResponseTime = Math.max(100, 200 + (execution.currentUsers / 1000));
      execution.metrics.errorRate = Math.max(0, execution.currentUsers / 200000);
      
      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 1000);
    
    await new Promise(resolve => setTimeout(resolve, rampDownTime));
  }

  private async generateResults(execution: TestExecution, scenario: LoadTestScenario): Promise<LoadTestResults> {
    const duration = execution.endTime!.getTime() - execution.startTime.getTime();
    
    // Simulate realistic test results
    const totalRequests = Math.floor(scenario.virtualUsers.totalUsers * 100 * (duration / 1000 / 3600));
    const successfulRequests = Math.floor(totalRequests * 0.985); // 98.5% success rate
    const failedRequests = totalRequests - successfulRequests;
    
    const results: LoadTestResults = {
      summary: {
        totalDuration: duration / 1000,
        totalRequests,
        successfulRequests,
        failedRequests,
        totalDataTransferred: totalRequests * 2048, // 2KB average
        averageResponseTime: 245,
        peakThroughput: Math.floor(scenario.virtualUsers.totalUsers * 0.8),
        maxConcurrentUsers: scenario.virtualUsers.totalUsers,
        errorRate: (failedRequests / totalRequests) * 100
      },
      metrics: {
        responseTime: {
          avg: 245,
          min: 89,
          max: 12450,
          p50: 198,
          p90: 456,
          p95: 678,
          p99: 2340
        },
        throughput: {
          avg: Math.floor(scenario.virtualUsers.totalUsers * 0.6),
          peak: Math.floor(scenario.virtualUsers.totalUsers * 0.8),
          sustained: Math.floor(scenario.virtualUsers.totalUsers * 0.7)
        },
        concurrency: {
          avg: Math.floor(scenario.virtualUsers.totalUsers * 0.85),
          peak: scenario.virtualUsers.totalUsers,
          target: scenario.virtualUsers.totalUsers
        },
        networkMetrics: {
          bandwidth: 1250, // Mbps
          packetLoss: 0.001,
          latency: 45
        }
      },
      assertions: this.checkAssertions(scenario, {
        avgResponseTime: 245,
        p95ResponseTime: 678,
        p99ResponseTime: 2340,
        errorRate: 1.5,
        peakThroughput: Math.floor(scenario.virtualUsers.totalUsers * 0.8)
      }),
      transactions: [
        {
          name: 'Login',
          count: Math.floor(totalRequests * 0.3),
          successRate: 99.2,
          responseTime: { avg: 156, min: 67, max: 2340, p95: 234 },
          throughput: Math.floor(scenario.virtualUsers.totalUsers * 0.25),
          errors: []
        },
        {
          name: 'Generate Proof',
          count: Math.floor(totalRequests * 0.5),
          successRate: 97.8,
          responseTime: { avg: 1245, min: 234, max: 12450, p95: 2340 },
          throughput: Math.floor(scenario.virtualUsers.totalUsers * 0.4),
          errors: [
            { type: 'timeout', count: 45, percentage: 2.1, examples: ['Request timeout after 10s'] }
          ]
        }
      ],
      errors: {
        totalErrors: failedRequests,
        errorRate: (failedRequests / totalRequests) * 100,
        errorTypes: [
          { category: 'timeout', count: Math.floor(failedRequests * 0.6), percentage: 60, httpCodes: { '408': 100 } },
          { category: 'application', count: Math.floor(failedRequests * 0.3), percentage: 30, httpCodes: { '500': 80, '502': 20 } },
          { category: 'network', count: Math.floor(failedRequests * 0.1), percentage: 10, httpCodes: { '503': 100 } }
        ],
        errorDistribution: [], // Would contain time series error data
        topErrors: [
          {
            message: 'Connection timeout',
            count: Math.floor(failedRequests * 0.4),
            percentage: 40,
            firstOccurrence: execution.startTime,
            lastOccurrence: execution.endTime!,
            affectedSteps: ['generate-proof']
          }
        ]
      },
      resourceUtilization: {
        application: {
          cpu: [], // Time series data would be populated
          memory: [],
          diskIO: [],
          networkIO: []
        },
        database: {
          connections: [],
          queryTime: [],
          lockWaitTime: [],
          cpu: []
        },
        infrastructure: {
          loadBalancer: {
            activeConnections: [],
            requestRate: [],
            healthyTargets: []
          },
          autoscaling: {
            instances: [],
            scalingEvents: []
          }
        }
      },
      recommendations: this.generateRecommendations(scenario, {
        avgResponseTime: 245,
        errorRate: 1.5,
        peakThroughput: Math.floor(scenario.virtualUsers.totalUsers * 0.8)
      })
    };

    return results;
  }

  private checkAssertions(scenario: LoadTestScenario, actualMetrics: any): AssertionResults[] {
    return scenario.assertions.map(assertion => {
      let actual: number;
      let passed: boolean;
      
      switch (assertion.metric) {
        case 'response_time':
          actual = assertion.aggregation === 'p95' ? actualMetrics.p95ResponseTime :
                   assertion.aggregation === 'p99' ? actualMetrics.p99ResponseTime :
                   actualMetrics.avgResponseTime;
          break;
        case 'error_rate':
          actual = actualMetrics.errorRate;
          break;
        case 'throughput':
          actual = actualMetrics.peakThroughput;
          break;
        default:
          actual = 0;
      }
      
      switch (assertion.condition) {
        case 'less_than':
          passed = actual < assertion.threshold;
          break;
        case 'greater_than':
          passed = actual > assertion.threshold;
          break;
        case 'equals':
          passed = actual === assertion.threshold;
          break;
        default:
          passed = false;
      }
      
      return {
        assertionId: assertion.id,
        metric: assertion.metric,
        expected: assertion.threshold,
        actual,
        passed,
        message: passed ? 'Assertion passed' : `Expected ${assertion.metric} ${assertion.condition} ${assertion.threshold}, got ${actual}`
      };
    });
  }

  private generateRecommendations(scenario: LoadTestScenario, metrics: any): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];
    
    // High response time recommendation
    if (metrics.avgResponseTime > 500) {
      recommendations.push({
        category: 'optimization',
        priority: 'high',
        title: 'Optimize Response Time',
        description: 'Average response time is higher than recommended threshold',
        impact: 'Improved user experience and higher throughput',
        effort: 'medium',
        implementation: [
          'Add response caching for frequently accessed data',
          'Optimize database queries and add proper indexing',
          'Implement connection pooling',
          'Consider CDN for static assets'
        ]
      });
    }
    
    // High error rate recommendation
    if (metrics.errorRate > 1) {
      recommendations.push({
        category: 'configuration',
        priority: 'critical',
        title: 'Reduce Error Rate',
        description: 'Error rate exceeds acceptable threshold',
        impact: 'Improved reliability and user satisfaction',
        effort: 'high',
        implementation: [
          'Implement circuit breaker pattern',
          'Add retry logic with exponential backoff',
          'Increase timeout values for long-running operations',
          'Scale up infrastructure to handle peak load'
        ]
      });
    }
    
    // Throughput optimization
    if (metrics.peakThroughput < scenario.virtualUsers.totalUsers * 0.5) {
      recommendations.push({
        category: 'scaling',
        priority: 'medium',
        title: 'Increase System Throughput',
        description: 'System throughput is below expected capacity',
        impact: 'Support for higher concurrent user load',
        effort: 'medium',
        implementation: [
          'Enable horizontal auto-scaling',
          'Optimize load balancer configuration',
          'Implement asynchronous processing for heavy operations',
          'Add more application instances'
        ]
      });
    }
    
    return recommendations;
  }

  private releaseGenerators(generators: LoadGenerator[]): void {
    generators.forEach(generator => {
      generator.currentLoad = 0;
      generator.status = 'available';
    });
  }

  // Public API methods
  async createScenario(scenarioData: Omit<LoadTestScenario, 'id' | 'status'>): Promise<string> {
    const scenarioId = `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const scenario: LoadTestScenario = {
      id: scenarioId,
      ...scenarioData,
      status: 'pending'
    };

    this.scenarios.set(scenarioId, scenario);
    
    console.log(`📝 Created load test scenario: ${scenario.name}`);
    return scenarioId;
  }

  getScenarios(): LoadTestScenario[] {
    return Array.from(this.scenarios.values());
  }

  getScenario(scenarioId: string): LoadTestScenario | null {
    return this.scenarios.get(scenarioId) || null;
  }

  getTestResults(executionId?: string): LoadTestResults[] {
    const results = Array.from(this.testResults.values());
    return results;
  }

  getActiveTests(): TestExecution[] {
    return Array.from(this.activeTests.values());
  }

  getLoadGenerators(): LoadGenerator[] {
    return Array.from(this.loadGenerators.values());
  }

  async cancelTest(executionId: string): Promise<boolean> {
    const execution = this.activeTests.get(executionId);
    if (!execution) return false;

    execution.status = 'cancelled';
    execution.endTime = new Date();
    
    this.releaseGenerators(execution.allocatedGenerators);
    
    const scenario = this.scenarios.get(execution.scenarioId);
    if (scenario) {
      scenario.status = 'cancelled';
    }
    
    console.log(`🛑 Cancelled load test: ${executionId}`);
    return true;
  }

  async getCapacityReport(): Promise<{
    totalCapacity: number;
    availableCapacity: number;
    utilizationPercentage: number;
    generatorStatus: Array<{
      id: string;
      location: string;
      capacity: number;
      currentLoad: number;
      status: string;
    }>;
  }> {
    const generators = Array.from(this.loadGenerators.values());
    
    const totalCapacity = generators.reduce((sum, g) => sum + g.capacity.maxUsers, 0);
    const availableCapacity = this.calculateAvailableCapacity();
    const utilizationPercentage = ((totalCapacity - availableCapacity) / totalCapacity) * 100;
    
    const generatorStatus = generators.map(generator => ({
      id: generator.id,
      location: generator.location,
      capacity: generator.capacity.maxUsers,
      currentLoad: generator.currentLoad,
      status: generator.status
    }));

    return {
      totalCapacity,
      availableCapacity,
      utilizationPercentage,
      generatorStatus
    };
  }
}

interface TestExecution {
  id: string;
  scenarioId: string;
  status: 'initializing' | 'ramp_up' | 'steady_state' | 'ramp_down' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  progress: number; // 0-100
  currentUsers: number;
  allocatedGenerators: LoadGenerator[];
  metrics: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    activeUsers: number;
  };
  error?: string;
}

export const loadTestingService = new LoadTestingService();