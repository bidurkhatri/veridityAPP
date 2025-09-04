/**
 * IoT Device Integration for Smart Home Verification
 * Enables identity verification through connected devices
 */

export interface IoTDevice {
  id: string;
  name: string;
  type: 'smart_speaker' | 'smart_doorbell' | 'security_camera' | 'smart_lock' | 'wearable' | 'smart_tv' | 'router';
  manufacturer: string;
  model: string;
  firmware: string;
  status: 'online' | 'offline' | 'error';
  capabilities: IoTCapability[];
  location: string;
  lastSeen: Date;
  trustLevel: number; // 1-10
  verificationMethods: string[];
}

export interface IoTCapability {
  type: 'biometric' | 'location' | 'presence' | 'voice' | 'visual' | 'network' | 'sensor';
  description: string;
  accuracy: number; // 0-1
  latency: number; // ms
}

export interface IoTVerificationRequest {
  deviceId: string;
  verificationType: 'presence' | 'biometric' | 'location' | 'behavioral';
  userId: string;
  timeout: number;
  requirements: Record<string, any>;
}

export interface IoTVerificationResult {
  requestId: string;
  deviceId: string;
  success: boolean;
  confidence: number;
  data: Record<string, any>;
  timestamp: Date;
  method: string;
}

class IoTDeviceIntegration {
  private devices: Map<string, IoTDevice> = new Map();
  private verificationRequests: Map<string, IoTVerificationRequest> = new Map();
  private verificationResults: Map<string, IoTVerificationResult> = new Map();

  constructor() {
    this.initializeDefaultDevices();
  }

  private initializeDefaultDevices() {
    // Smart Home Devices
    const smartSpeaker: IoTDevice = {
      id: 'alexa-001',
      name: 'Living Room Alexa',
      type: 'smart_speaker',
      manufacturer: 'Amazon',
      model: 'Echo Dot 5th Gen',
      firmware: '1.2.3',
      status: 'online',
      capabilities: [
        {
          type: 'voice',
          description: 'Voice recognition and command processing',
          accuracy: 0.95,
          latency: 200
        },
        {
          type: 'presence',
          description: 'Presence detection through wake word',
          accuracy: 0.85,
          latency: 100
        }
      ],
      location: 'Living Room',
      lastSeen: new Date(),
      trustLevel: 8,
      verificationMethods: ['voice_recognition', 'presence_detection']
    };

    const smartDoorbell: IoTDevice = {
      id: 'doorbell-001',
      name: 'Front Door Camera',
      type: 'smart_doorbell',
      manufacturer: 'Ring',
      model: 'Video Doorbell Pro 2',
      firmware: '2.1.0',
      status: 'online',
      capabilities: [
        {
          type: 'visual',
          description: 'Facial recognition and person detection',
          accuracy: 0.92,
          latency: 500
        },
        {
          type: 'presence',
          description: 'Motion detection and presence verification',
          accuracy: 0.98,
          latency: 150
        }
      ],
      location: 'Front Door',
      lastSeen: new Date(),
      trustLevel: 9,
      verificationMethods: ['facial_recognition', 'motion_detection']
    };

    const smartLock: IoTDevice = {
      id: 'lock-001',
      name: 'Smart Front Door Lock',
      type: 'smart_lock',
      manufacturer: 'August',
      model: 'Smart Lock Pro',
      firmware: '3.0.1',
      status: 'online',
      capabilities: [
        {
          type: 'biometric',
          description: 'Fingerprint scanning',
          accuracy: 0.99,
          latency: 300
        },
        {
          type: 'location',
          description: 'Proximity detection via Bluetooth',
          accuracy: 0.87,
          latency: 250
        }
      ],
      location: 'Front Door',
      lastSeen: new Date(),
      trustLevel: 10,
      verificationMethods: ['fingerprint_scan', 'proximity_detection']
    };

    const wearableDevice: IoTDevice = {
      id: 'watch-001',
      name: 'Apple Watch Series 9',
      type: 'wearable',
      manufacturer: 'Apple',
      model: 'Series 9',
      firmware: 'watchOS 10.1',
      status: 'online',
      capabilities: [
        {
          type: 'biometric',
          description: 'Heart rate and blood oxygen monitoring',
          accuracy: 0.94,
          latency: 100
        },
        {
          type: 'location',
          description: 'GPS and location tracking',
          accuracy: 0.96,
          latency: 200
        },
        {
          type: 'sensor',
          description: 'Motion and activity detection',
          accuracy: 0.91,
          latency: 50
        }
      ],
      location: 'On Person',
      lastSeen: new Date(),
      trustLevel: 9,
      verificationMethods: ['biometric_monitoring', 'location_tracking', 'activity_patterns']
    };

    this.devices.set(smartSpeaker.id, smartSpeaker);
    this.devices.set(smartDoorbell.id, smartDoorbell);
    this.devices.set(smartLock.id, smartLock);
    this.devices.set(wearableDevice.id, wearableDevice);
  }

  // Register new IoT device
  async registerDevice(device: Omit<IoTDevice, 'id' | 'lastSeen'>): Promise<string> {
    const deviceId = `iot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullDevice: IoTDevice = {
      ...device,
      id: deviceId,
      lastSeen: new Date()
    };

    this.devices.set(deviceId, fullDevice);
    
    console.log(`📱 Registered IoT device: ${device.name} (${deviceId})`);
    return deviceId;
  }

  // Get all registered devices
  getAllDevices(): IoTDevice[] {
    return Array.from(this.devices.values());
  }

  // Get devices by type
  getDevicesByType(type: IoTDevice['type']): IoTDevice[] {
    return Array.from(this.devices.values()).filter(device => device.type === type);
  }

  // Get devices by capability
  getDevicesByCapability(capabilityType: IoTCapability['type']): IoTDevice[] {
    return Array.from(this.devices.values()).filter(device =>
      device.capabilities.some(cap => cap.type === capabilityType)
    );
  }

  // Update device status
  async updateDeviceStatus(deviceId: string, status: IoTDevice['status']): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    device.status = status;
    device.lastSeen = new Date();
    
    return true;
  }

  // Request verification from IoT device
  async requestVerification(request: IoTVerificationRequest): Promise<string> {
    const requestId = `verify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const device = this.devices.get(request.deviceId);
    if (!device) {
      throw new Error(`Device not found: ${request.deviceId}`);
    }

    if (device.status !== 'online') {
      throw new Error(`Device is not online: ${device.status}`);
    }

    this.verificationRequests.set(requestId, {
      ...request,
    });

    // Simulate async verification process
    setTimeout(() => {
      this.processVerificationRequest(requestId);
    }, 1000);

    console.log(`🔍 Initiated IoT verification: ${requestId} on device ${device.name}`);
    return requestId;
  }

  private async processVerificationRequest(requestId: string): Promise<void> {
    const request = this.verificationRequests.get(requestId);
    if (!request) return;

    const device = this.devices.get(request.deviceId);
    if (!device) return;

    // Simulate verification based on device type and capability
    const result = this.simulateVerification(request, device);

    this.verificationResults.set(requestId, result);
    console.log(`✅ IoT verification completed: ${requestId} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
  }

  private simulateVerification(request: IoTVerificationRequest, device: IoTDevice): IoTVerificationResult {
    let success = false;
    let confidence = 0;
    let method = '';
    const data: Record<string, any> = {};

    switch (request.verificationType) {
      case 'presence':
        method = 'presence_detection';
        success = Math.random() > 0.1; // 90% success rate
        confidence = success ? 0.85 + Math.random() * 0.1 : 0.3 + Math.random() * 0.3;
        data.detection_method = device.type;
        data.location = device.location;
        break;

      case 'biometric':
        method = 'biometric_verification';
        success = Math.random() > 0.05; // 95% success rate
        confidence = success ? 0.92 + Math.random() * 0.07 : 0.2 + Math.random() * 0.4;
        data.biometric_type = device.type === 'smart_lock' ? 'fingerprint' : 'face';
        data.quality_score = confidence;
        break;

      case 'location':
        method = 'location_verification';
        success = Math.random() > 0.15; // 85% success rate
        confidence = success ? 0.80 + Math.random() * 0.15 : 0.4 + Math.random() * 0.3;
        data.coordinates = { lat: 27.7172, lng: 85.3240 }; // Kathmandu
        data.accuracy_meters = Math.floor(5 + Math.random() * 15);
        break;

      case 'behavioral':
        method = 'behavioral_analysis';
        success = Math.random() > 0.2; // 80% success rate
        confidence = success ? 0.75 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4;
        data.patterns_matched = Math.floor(3 + Math.random() * 5);
        data.anomaly_score = 1 - confidence;
        break;
    }

    return {
      requestId: `verify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deviceId: device.id,
      success,
      confidence,
      data,
      timestamp: new Date(),
      method
    };
  }

  // Get verification result
  async getVerificationResult(requestId: string): Promise<IoTVerificationResult | null> {
    return this.verificationResults.get(requestId) || null;
  }

  // Get all verification results for a user
  async getVerificationHistory(userId: string): Promise<IoTVerificationResult[]> {
    // In a real implementation, this would filter by userId
    return Array.from(this.verificationResults.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Multi-device verification
  async requestMultiDeviceVerification(
    userId: string,
    deviceIds: string[],
    verificationType: IoTVerificationRequest['verificationType'],
    consensusThreshold: number = 0.7
  ): Promise<{
    success: boolean;
    confidence: number;
    results: IoTVerificationResult[];
    consensus: boolean;
  }> {
    const verificationPromises = deviceIds.map(deviceId =>
      this.requestVerification({
        deviceId,
        verificationType,
        userId,
        timeout: 30000,
        requirements: {}
      })
    );

    const requestIds = await Promise.all(verificationPromises);

    // Wait for all verifications to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    const results = await Promise.all(
      requestIds.map(id => this.getVerificationResult(id))
    );

    const validResults = results.filter(r => r !== null) as IoTVerificationResult[];
    const successCount = validResults.filter(r => r.success).length;
    const averageConfidence = validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length;
    
    const consensus = (successCount / validResults.length) >= consensusThreshold;

    return {
      success: consensus && averageConfidence > 0.6,
      confidence: averageConfidence,
      results: validResults,
      consensus
    };
  }

  // Device health monitoring
  async monitorDeviceHealth(): Promise<{
    online: number;
    offline: number;
    error: number;
    lowTrust: IoTDevice[];
    recommendations: string[];
  }> {
    const devices = Array.from(this.devices.values());
    
    const online = devices.filter(d => d.status === 'online').length;
    const offline = devices.filter(d => d.status === 'offline').length;
    const error = devices.filter(d => d.status === 'error').length;
    const lowTrust = devices.filter(d => d.trustLevel < 5);

    const recommendations: string[] = [];
    
    if (offline > 0) {
      recommendations.push(`${offline} devices are offline - check connectivity`);
    }
    
    if (error > 0) {
      recommendations.push(`${error} devices have errors - requires attention`);
    }
    
    if (lowTrust.length > 0) {
      recommendations.push(`${lowTrust.length} devices have low trust scores`);
    }

    return {
      online,
      offline,
      error,
      lowTrust,
      recommendations
    };
  }

  // Get device analytics
  async getDeviceAnalytics(): Promise<{
    totalDevices: number;
    devicesByType: Record<string, number>;
    averageTrustLevel: number;
    verificationSuccessRate: number;
    popularVerificationMethods: Array<{ method: string; count: number }>;
  }> {
    const devices = Array.from(this.devices.values());
    const results = Array.from(this.verificationResults.values());

    const devicesByType = devices.reduce((acc, device) => {
      acc[device.type] = (acc[device.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageTrustLevel = devices.reduce((sum, d) => sum + d.trustLevel, 0) / devices.length;
    
    const successfulVerifications = results.filter(r => r.success).length;
    const verificationSuccessRate = results.length > 0 ? successfulVerifications / results.length : 0;

    const methodCounts = results.reduce((acc, result) => {
      acc[result.method] = (acc[result.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularVerificationMethods = Object.entries(methodCounts)
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalDevices: devices.length,
      devicesByType,
      averageTrustLevel,
      verificationSuccessRate,
      popularVerificationMethods
    };
  }

  // Create device ecosystem for user
  async createDeviceEcosystem(userId: string, homeDevices: string[]): Promise<{
    ecosystemId: string;
    devices: IoTDevice[];
    verificationStrength: number;
    recommendations: string[];
  }> {
    const ecosystemId = `ecosystem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const devices = homeDevices
      .map(id => this.devices.get(id))
      .filter(device => device !== undefined) as IoTDevice[];

    // Calculate verification strength based on device types and trust levels
    const uniqueTypes = new Set(devices.map(d => d.type)).size;
    const averageTrust = devices.reduce((sum, d) => sum + d.trustLevel, 0) / devices.length;
    const verificationStrength = Math.min(10, (uniqueTypes * 2) + (averageTrust * 0.5));

    const recommendations: string[] = [];
    
    if (uniqueTypes < 3) {
      recommendations.push('Add more device types for stronger verification');
    }
    
    if (averageTrust < 7) {
      recommendations.push('Consider upgrading to higher-trust devices');
    }
    
    if (!devices.some(d => d.capabilities.some(c => c.type === 'biometric'))) {
      recommendations.push('Add biometric-capable devices for enhanced security');
    }

    return {
      ecosystemId,
      devices,
      verificationStrength,
      recommendations
    };
  }
}

export const iotDeviceIntegration = new IoTDeviceIntegration();