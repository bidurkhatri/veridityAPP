/**
 * IoT Device Management & Edge Computing Platform
 * Manages connected devices, edge processing, and distributed verification
 */

import { z } from 'zod';

// Core IoT Types
export const IoTDeviceSchema = z.object({
  deviceId: z.string(),
  name: z.string(),
  type: z.enum(['biometric_scanner', 'document_reader', 'mobile_app', 'kiosk', 'camera', 'sensor', 'gateway']),
  category: z.enum(['verification_terminal', 'biometric_device', 'document_scanner', 'mobile_client', 'edge_processor']),
  manufacturer: z.string(),
  model: z.string(),
  firmwareVersion: z.string(),
  hardwareVersion: z.string(),
  serialNumber: z.string(),
  macAddress: z.string(),
  ipAddress: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
    region: z.string(),
    country: z.string()
  }),
  status: z.enum(['online', 'offline', 'maintenance', 'error', 'updating']),
  capabilities: z.array(z.string()),
  specifications: z.record(z.any()),
  security: z.object({
    encryptionEnabled: z.boolean(),
    certificateStatus: z.enum(['valid', 'expired', 'revoked', 'pending']),
    lastSecurityScan: z.date(),
    vulnerabilities: z.array(z.string()),
    trustLevel: z.enum(['high', 'medium', 'low', 'untrusted'])
  }),
  connectivity: z.object({
    connectionType: z.enum(['wifi', 'ethernet', 'cellular', 'bluetooth', 'satellite']),
    signalStrength: z.number(),
    bandwidth: z.number(),
    latency: z.number(),
    lastSeen: z.date()
  }),
  registeredAt: z.date(),
  lastUpdate: z.date()
});

export const EdgeNodeSchema = z.object({
  nodeId: z.string(),
  name: z.string(),
  type: z.enum(['gateway', 'processing_unit', 'storage_node', 'verification_node']),
  region: z.string(),
  zone: z.string(),
  resources: z.object({
    cpu: z.object({
      cores: z.number(),
      usage: z.number(),
      frequency: z.number()
    }),
    memory: z.object({
      total: z.number(),
      used: z.number(),
      available: z.number()
    }),
    storage: z.object({
      total: z.number(),
      used: z.number(),
      available: z.number()
    }),
    network: z.object({
      uploadSpeed: z.number(),
      downloadSpeed: z.number(),
      latency: z.number()
    })
  }),
  services: z.array(z.object({
    serviceId: z.string(),
    name: z.string(),
    status: z.enum(['running', 'stopped', 'error', 'starting']),
    port: z.number(),
    healthCheck: z.object({
      endpoint: z.string(),
      interval: z.number(),
      timeout: z.number(),
      lastCheck: z.date(),
      status: z.enum(['healthy', 'unhealthy', 'unknown'])
    })
  })),
  connectedDevices: z.array(z.string()),
  status: z.enum(['active', 'inactive', 'maintenance', 'overloaded']),
  lastHeartbeat: z.date()
});

export const DeviceCommandSchema = z.object({
  commandId: z.string(),
  deviceId: z.string(),
  type: z.enum(['scan_document', 'capture_biometric', 'verify_proof', 'update_firmware', 'restart', 'configure']),
  command: z.string(),
  parameters: z.record(z.any()),
  priority: z.enum(['low', 'normal', 'high', 'critical']),
  timeout: z.number(),
  retryCount: z.number(),
  status: z.enum(['pending', 'executing', 'completed', 'failed', 'timeout']),
  createdAt: z.date(),
  executedAt: z.date().optional(),
  completedAt: z.date().optional(),
  result: z.record(z.any()).optional(),
  error: z.string().optional()
});

export const EdgeProcessingJobSchema = z.object({
  jobId: z.string(),
  nodeId: z.string(),
  type: z.enum(['document_analysis', 'biometric_processing', 'proof_verification', 'data_encryption', 'ml_inference']),
  priority: z.enum(['low', 'normal', 'high', 'critical']),
  data: z.record(z.any()),
  processingRequirements: z.object({
    cpuCores: z.number(),
    memoryMB: z.number(),
    estimatedTime: z.number(),
    gpuRequired: z.boolean()
  }),
  status: z.enum(['queued', 'processing', 'completed', 'failed', 'cancelled']),
  progress: z.number(),
  createdAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  result: z.record(z.any()).optional(),
  error: z.string().optional()
});

export const DeviceAnalyticsSchema = z.object({
  deviceId: z.string(),
  period: z.object({
    startDate: z.date(),
    endDate: z.date()
  }),
  metrics: z.object({
    uptime: z.number(),
    totalOperations: z.number(),
    successfulOperations: z.number(),
    failedOperations: z.number(),
    averageResponseTime: z.number(),
    dataTransferred: z.number(),
    errorRate: z.number()
  }),
  performance: z.object({
    cpuUsage: z.array(z.number()),
    memoryUsage: z.array(z.number()),
    networkLatency: z.array(z.number()),
    operationsPerHour: z.array(z.number())
  }),
  incidents: z.array(z.object({
    timestamp: z.date(),
    type: z.string(),
    severity: z.enum(['info', 'warning', 'error', 'critical']),
    description: z.string(),
    resolved: z.boolean()
  }))
});

export type IoTDevice = z.infer<typeof IoTDeviceSchema>;
export type EdgeNode = z.infer<typeof EdgeNodeSchema>;
export type DeviceCommand = z.infer<typeof DeviceCommandSchema>;
export type EdgeProcessingJob = z.infer<typeof EdgeProcessingJobSchema>;
export type DeviceAnalytics = z.infer<typeof DeviceAnalyticsSchema>;

// IoT Device Management System
export class IoTDeviceManager {
  private devices = new Map<string, IoTDevice>();
  private edgeNodes = new Map<string, EdgeNode>();
  private commands = new Map<string, DeviceCommand>();
  private processingJobs = new Map<string, EdgeProcessingJob>();
  private deviceAnalytics = new Map<string, DeviceAnalytics>();
  private deviceGroups = new Map<string, string[]>();

  constructor() {
    console.log('🔌 Initializing IoT Device Management System...');
    this.initializeDevices();
    this.setupEdgeNodes();
    this.startDeviceMonitoring();
    this.initializeEdgeComputing();
  }

  // Initialize sample devices
  private initializeDevices(): void {
    const sampleDevices: IoTDevice[] = [
      {
        deviceId: 'kiosk_001_ktm',
        name: 'Kathmandu Airport Verification Kiosk',
        type: 'kiosk',
        category: 'verification_terminal',
        manufacturer: 'Veridity Systems',
        model: 'VK-2000',
        firmwareVersion: '2.1.5',
        hardwareVersion: '1.3.0',
        serialNumber: 'VK001KTM2024',
        macAddress: '00:1B:44:11:3A:B7',
        ipAddress: '192.168.1.100',
        location: {
          latitude: 27.7172,
          longitude: 85.3240,
          address: 'Tribhuvan International Airport, Kathmandu',
          region: 'Bagmati',
          country: 'Nepal'
        },
        status: 'online',
        capabilities: ['document_scan', 'biometric_capture', 'qr_scan', 'nfc_read', 'printer'],
        specifications: {
          screenSize: '21.5 inch',
          touchscreen: true,
          camera: '8MP with IR',
          scanner: 'A4 flatbed',
          printer: 'thermal receipt'
        },
        security: {
          encryptionEnabled: true,
          certificateStatus: 'valid',
          lastSecurityScan: new Date(),
          vulnerabilities: [],
          trustLevel: 'high'
        },
        connectivity: {
          connectionType: 'ethernet',
          signalStrength: 100,
          bandwidth: 1000,
          latency: 5,
          lastSeen: new Date()
        },
        registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date()
      },
      {
        deviceId: 'mobile_app_001',
        name: 'Veridity Mobile Client - Android',
        type: 'mobile_app',
        category: 'mobile_client',
        manufacturer: 'Google',
        model: 'Pixel 7',
        firmwareVersion: 'Android 13',
        hardwareVersion: 'G03Z5',
        serialNumber: 'PIXEL7001',
        macAddress: '02:00:00:00:00:00',
        ipAddress: '192.168.1.50',
        location: {
          latitude: 27.7000,
          longitude: 85.3333,
          address: 'Thamel, Kathmandu',
          region: 'Bagmati',
          country: 'Nepal'
        },
        status: 'online',
        capabilities: ['camera', 'gps', 'biometric_auth', 'nfc', 'bluetooth'],
        specifications: {
          os: 'Android 13',
          appVersion: '3.2.1',
          sdkVersion: '1.8.0',
          deviceModel: 'Pixel 7'
        },
        security: {
          encryptionEnabled: true,
          certificateStatus: 'valid',
          lastSecurityScan: new Date(),
          vulnerabilities: [],
          trustLevel: 'high'
        },
        connectivity: {
          connectionType: 'wifi',
          signalStrength: 85,
          bandwidth: 100,
          latency: 20,
          lastSeen: new Date()
        },
        registeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date()
      },
      {
        deviceId: 'scanner_bio_001',
        name: 'Biometric Scanner Terminal',
        type: 'biometric_scanner',
        category: 'biometric_device',
        manufacturer: 'SecureTech',
        model: 'BIO-3000',
        firmwareVersion: '4.2.1',
        hardwareVersion: '2.1.0',
        serialNumber: 'BIO3000001',
        macAddress: '00:1A:2B:3C:4D:5E',
        ipAddress: '192.168.1.120',
        location: {
          latitude: 27.6915,
          longitude: 85.3200,
          address: 'Government Office, Singha Durbar',
          region: 'Bagmati',
          country: 'Nepal'
        },
        status: 'online',
        capabilities: ['fingerprint_scan', 'iris_scan', 'face_recognition', 'voice_recognition'],
        specifications: {
          fingerprintSensor: 'Optical 500 DPI',
          irisScanner: 'Near-infrared LED',
          faceCamera: '5MP RGB + IR',
          processingPower: 'ARM Cortex-A72'
        },
        security: {
          encryptionEnabled: true,
          certificateStatus: 'valid',
          lastSecurityScan: new Date(),
          vulnerabilities: [],
          trustLevel: 'high'
        },
        connectivity: {
          connectionType: 'ethernet',
          signalStrength: 100,
          bandwidth: 100,
          latency: 8,
          lastSeen: new Date()
        },
        registeredAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date()
      }
    ];

    sampleDevices.forEach(device => {
      this.devices.set(device.deviceId, device);
    });

    console.log(`🔌 Initialized ${this.devices.size} IoT devices`);
  }

  // Setup edge computing nodes
  private setupEdgeNodes(): void {
    const edgeNodes: EdgeNode[] = [
      {
        nodeId: 'edge_kathmandu_001',
        name: 'Kathmandu Processing Center',
        type: 'processing_unit',
        region: 'bagmati',
        zone: 'kathmandu_valley',
        resources: {
          cpu: {
            cores: 16,
            usage: 45,
            frequency: 3200
          },
          memory: {
            total: 32768,
            used: 14000,
            available: 18768
          },
          storage: {
            total: 2048,
            used: 800,
            available: 1248
          },
          network: {
            uploadSpeed: 1000,
            downloadSpeed: 1000,
            latency: 5
          }
        },
        services: [
          {
            serviceId: 'verification_service',
            name: 'Proof Verification Service',
            status: 'running',
            port: 8080,
            healthCheck: {
              endpoint: '/health',
              interval: 30,
              timeout: 5,
              lastCheck: new Date(),
              status: 'healthy'
            }
          },
          {
            serviceId: 'ml_inference',
            name: 'ML Inference Engine',
            status: 'running',
            port: 8081,
            healthCheck: {
              endpoint: '/health',
              interval: 30,
              timeout: 10,
              lastCheck: new Date(),
              status: 'healthy'
            }
          }
        ],
        connectedDevices: ['kiosk_001_ktm', 'scanner_bio_001'],
        status: 'active',
        lastHeartbeat: new Date()
      },
      {
        nodeId: 'edge_pokhara_001',
        name: 'Pokhara Regional Node',
        type: 'gateway',
        region: 'gandaki',
        zone: 'pokhara_metro',
        resources: {
          cpu: {
            cores: 8,
            usage: 30,
            frequency: 2800
          },
          memory: {
            total: 16384,
            used: 6000,
            available: 10384
          },
          storage: {
            total: 1024,
            used: 300,
            available: 724
          },
          network: {
            uploadSpeed: 500,
            downloadSpeed: 500,
            latency: 15
          }
        },
        services: [
          {
            serviceId: 'data_relay',
            name: 'Data Relay Service',
            status: 'running',
            port: 8090,
            healthCheck: {
              endpoint: '/ping',
              interval: 60,
              timeout: 5,
              lastCheck: new Date(),
              status: 'healthy'
            }
          }
        ],
        connectedDevices: [],
        status: 'active',
        lastHeartbeat: new Date()
      }
    ];

    edgeNodes.forEach(node => {
      this.edgeNodes.set(node.nodeId, node);
    });

    console.log(`🌐 Setup ${this.edgeNodes.size} edge computing nodes`);
  }

  // Register new device
  async registerDevice(deviceData: Omit<IoTDevice, 'registeredAt' | 'lastUpdate' | 'status'>): Promise<string> {
    const deviceId = deviceData.deviceId;
    
    const device: IoTDevice = {
      ...deviceData,
      status: 'offline', // Initially offline until first heartbeat
      registeredAt: new Date(),
      lastUpdate: new Date()
    };

    this.devices.set(deviceId, device);

    // Auto-assign to nearest edge node
    await this.assignDeviceToEdgeNode(deviceId);

    console.log(`📱 Registered new device: ${device.name} (${deviceId})`);
    return deviceId;
  }

  // Send command to device
  async sendCommand(deviceId: string, commandType: string, parameters: Record<string, any>): Promise<string> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    if (device.status === 'offline') {
      throw new Error('Device is offline');
    }

    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const command: DeviceCommand = {
      commandId,
      deviceId,
      type: commandType as any,
      command: this.generateCommandString(commandType, parameters),
      parameters,
      priority: parameters.priority || 'normal',
      timeout: parameters.timeout || 30000,
      retryCount: 0,
      status: 'pending',
      createdAt: new Date()
    };

    this.commands.set(commandId, command);

    // Simulate command execution
    this.executeCommand(commandId);

    console.log(`📤 Sent command ${commandType} to device ${deviceId}`);
    return commandId;
  }

  // Execute edge processing job
  async processOnEdge(nodeId: string, jobType: string, data: Record<string, any>): Promise<string> {
    const node = this.edgeNodes.get(nodeId);
    if (!node) {
      throw new Error('Edge node not found');
    }

    if (node.status !== 'active') {
      throw new Error('Edge node is not active');
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: EdgeProcessingJob = {
      jobId,
      nodeId,
      type: jobType as any,
      priority: data.priority || 'normal',
      data,
      processingRequirements: this.calculateProcessingRequirements(jobType, data),
      status: 'queued',
      progress: 0,
      createdAt: new Date()
    };

    this.processingJobs.set(jobId, job);

    // Start processing
    this.startEdgeProcessing(jobId);

    console.log(`⚙️ Started edge processing job: ${jobType} on ${nodeId}`);
    return jobId;
  }

  // Get device analytics
  async getDeviceAnalytics(deviceId: string, startDate: Date, endDate: Date): Promise<DeviceAnalytics> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    // Generate analytics based on device activity
    const analytics: DeviceAnalytics = {
      deviceId,
      period: { startDate, endDate },
      metrics: {
        uptime: Math.random() * 0.1 + 0.9, // 90-100% uptime
        totalOperations: Math.floor(Math.random() * 1000) + 500,
        successfulOperations: Math.floor(Math.random() * 950) + 450,
        failedOperations: Math.floor(Math.random() * 50) + 5,
        averageResponseTime: Math.random() * 500 + 100, // 100-600ms
        dataTransferred: Math.random() * 1000 + 500, // MB
        errorRate: Math.random() * 0.05 + 0.01 // 1-6% error rate
      },
      performance: {
        cpuUsage: Array.from({length: 24}, () => Math.random() * 80 + 10),
        memoryUsage: Array.from({length: 24}, () => Math.random() * 70 + 20),
        networkLatency: Array.from({length: 24}, () => Math.random() * 50 + 10),
        operationsPerHour: Array.from({length: 24}, () => Math.floor(Math.random() * 100) + 20)
      },
      incidents: this.generateIncidents(deviceId, startDate, endDate)
    };

    this.deviceAnalytics.set(`${deviceId}_${startDate.getTime()}_${endDate.getTime()}`, analytics);

    console.log(`📊 Generated analytics for device ${deviceId}`);
    return analytics;
  }

  // Update device firmware
  async updateFirmware(deviceId: string, firmwareVersion: string): Promise<string> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    const commandId = await this.sendCommand(deviceId, 'update_firmware', {
      firmwareVersion,
      priority: 'high',
      timeout: 300000 // 5 minutes
    });

    console.log(`🔄 Started firmware update for ${deviceId} to version ${firmwareVersion}`);
    return commandId;
  }

  // Monitor device health
  async checkDeviceHealth(deviceId: string): Promise<any> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    const health = {
      deviceId,
      status: device.status,
      lastSeen: device.connectivity.lastSeen,
      connectivity: {
        signalStrength: device.connectivity.signalStrength,
        latency: device.connectivity.latency,
        bandwidth: device.connectivity.bandwidth
      },
      security: {
        trustLevel: device.security.trustLevel,
        certificateStatus: device.security.certificateStatus,
        vulnerabilities: device.security.vulnerabilities.length
      },
      performance: {
        uptime: Math.random() * 0.1 + 0.9,
        responseTime: Math.random() * 200 + 50,
        errorRate: Math.random() * 0.05
      },
      alerts: this.generateHealthAlerts(device)
    };

    console.log(`🏥 Health check completed for device ${deviceId}`);
    return health;
  }

  // Private helper methods
  private async assignDeviceToEdgeNode(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) return;

    // Find nearest edge node based on location
    const nearestNode = this.findNearestEdgeNode(device.location);
    if (nearestNode) {
      nearestNode.connectedDevices.push(deviceId);
      console.log(`🔗 Assigned device ${deviceId} to edge node ${nearestNode.nodeId}`);
    }
  }

  private findNearestEdgeNode(location: any): EdgeNode | undefined {
    // Simple distance calculation (in production, use proper geolocation)
    let nearestNode: EdgeNode | undefined;
    let minDistance = Infinity;

    const nodes = Array.from(this.edgeNodes.values());
    for (const node of nodes) {
      // Simplified distance calculation
      const distance = Math.random() * 100; // Mock distance
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = node;
      }
    }

    return nearestNode;
  }

  private generateCommandString(commandType: string, parameters: Record<string, any>): string {
    const commands: Record<string, string> = {
      scan_document: 'SCAN_DOC',
      capture_biometric: 'CAPTURE_BIO',
      verify_proof: 'VERIFY_PROOF',
      update_firmware: 'UPDATE_FW',
      restart: 'RESTART',
      configure: 'CONFIG'
    };
    
    return commands[commandType] || 'UNKNOWN';
  }

  private async executeCommand(commandId: string): Promise<void> {
    const command = this.commands.get(commandId);
    if (!command) return;

    // Simulate command execution
    setTimeout(() => {
      command.status = 'executing';
      command.executedAt = new Date();

      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
          command.status = 'completed';
          command.result = {
            success: true,
            data: `Command ${command.type} executed successfully`,
            timestamp: new Date()
          };
        } else {
          command.status = 'failed';
          command.error = 'Device communication timeout';
        }
        
        command.completedAt = new Date();
        console.log(`📋 Command ${commandId} ${command.status}`);
      }, Math.random() * 5000 + 1000); // 1-6 seconds
    }, 500);
  }

  private calculateProcessingRequirements(jobType: string, data: Record<string, any>): any {
    const requirements: Record<string, any> = {
      document_analysis: { cpuCores: 2, memoryMB: 512, estimatedTime: 5000, gpuRequired: false },
      biometric_processing: { cpuCores: 4, memoryMB: 1024, estimatedTime: 3000, gpuRequired: true },
      proof_verification: { cpuCores: 1, memoryMB: 256, estimatedTime: 2000, gpuRequired: false },
      data_encryption: { cpuCores: 2, memoryMB: 512, estimatedTime: 1000, gpuRequired: false },
      ml_inference: { cpuCores: 8, memoryMB: 2048, estimatedTime: 8000, gpuRequired: true }
    };

    return requirements[jobType] || { cpuCores: 1, memoryMB: 256, estimatedTime: 1000, gpuRequired: false };
  }

  private async startEdgeProcessing(jobId: string): Promise<void> {
    const job = this.processingJobs.get(jobId);
    if (!job) return;

    job.status = 'processing';
    job.startedAt = new Date();

    // Simulate processing with progress updates
    const progressInterval = setInterval(() => {
      job.progress += Math.random() * 20;
      
      if (job.progress >= 100) {
        job.status = 'completed';
        job.progress = 100;
        job.completedAt = new Date();
        job.result = {
          success: true,
          processedData: `${job.type} processing completed`,
          metrics: {
            processingTime: job.completedAt.getTime() - job.startedAt!.getTime(),
            cpuUsage: Math.random() * 80 + 20,
            memoryUsage: Math.random() * 70 + 30
          }
        };
        
        clearInterval(progressInterval);
        console.log(`⚙️ Edge processing job ${jobId} completed`);
      }
    }, 1000);
  }

  private generateIncidents(deviceId: string, startDate: Date, endDate: Date): any[] {
    const incidents = [];
    const numIncidents = Math.floor(Math.random() * 5); // 0-4 incidents

    for (let i = 0; i < numIncidents; i++) {
      incidents.push({
        timestamp: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())),
        type: ['connectivity', 'hardware', 'software', 'security'][Math.floor(Math.random() * 4)],
        severity: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)] as any,
        description: [
          'Temporary connectivity loss',
          'High memory usage detected',
          'Certificate renewal required',
          'Firmware update available'
        ][Math.floor(Math.random() * 4)],
        resolved: Math.random() > 0.2
      });
    }

    return incidents;
  }

  private generateHealthAlerts(device: IoTDevice): string[] {
    const alerts: string[] = [];

    if (device.connectivity.signalStrength < 50) {
      alerts.push('Weak signal strength detected');
    }

    if (device.security.vulnerabilities.length > 0) {
      alerts.push(`${device.security.vulnerabilities.length} security vulnerabilities found`);
    }

    if (device.connectivity.latency > 100) {
      alerts.push('High network latency detected');
    }

    return alerts;
  }

  private startDeviceMonitoring(): void {
    // Simulate periodic device status updates
    setInterval(() => {
      const devices = Array.from(this.devices.values());
      for (const device of devices) {
        if (device.status === 'online') {
          device.connectivity.lastSeen = new Date();
          device.lastUpdate = new Date();
          
          // Simulate occasional status changes
          if (Math.random() < 0.01) { // 1% chance
            device.status = Math.random() > 0.5 ? 'maintenance' : 'error';
          }
        }
      }
    }, 30000); // Every 30 seconds

    console.log('📡 Device monitoring started');
  }

  private initializeEdgeComputing(): void {
    console.log('🌐 Edge computing platform initialized');
    console.log('⚙️ Job processing queue active');
    console.log('📊 Real-time analytics enabled');
  }

  // Public getters and methods
  getDevices(filter?: { status?: string; type?: string; region?: string }): IoTDevice[] {
    let devices = Array.from(this.devices.values());

    if (filter) {
      if (filter.status) {
        devices = devices.filter(d => d.status === filter.status);
      }
      if (filter.type) {
        devices = devices.filter(d => d.type === filter.type);
      }
      if (filter.region) {
        devices = devices.filter(d => d.location.region.toLowerCase() === filter.region!.toLowerCase());
      }
    }

    return devices;
  }

  getEdgeNodes(): EdgeNode[] {
    return Array.from(this.edgeNodes.values());
  }

  getCommand(commandId: string): DeviceCommand | undefined {
    return this.commands.get(commandId);
  }

  getProcessingJob(jobId: string): EdgeProcessingJob | undefined {
    return this.processingJobs.get(jobId);
  }

  getDeviceStats(): any {
    const devices = Array.from(this.devices.values());
    
    return {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      maintenance: devices.filter(d => d.status === 'maintenance').length,
      error: devices.filter(d => d.status === 'error').length,
      byType: this.getDevicesByType(),
      byRegion: this.getDevicesByRegion()
    };
  }

  private getDevicesByType(): Record<string, number> {
    const devices = Array.from(this.devices.values());
    const byType: Record<string, number> = {};
    
    devices.forEach(device => {
      byType[device.type] = (byType[device.type] || 0) + 1;
    });
    
    return byType;
  }

  private getDevicesByRegion(): Record<string, number> {
    const devices = Array.from(this.devices.values());
    const byRegion: Record<string, number> = {};
    
    devices.forEach(device => {
      byRegion[device.location.region] = (byRegion[device.location.region] || 0) + 1;
    });
    
    return byRegion;
  }
}

// Export singleton instance
export const iotDeviceManager = new IoTDeviceManager();