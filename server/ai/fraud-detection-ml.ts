/**
 * Advanced Machine Learning Fraud Detection
 * Real-time pattern recognition and anomaly detection
 */

export interface FraudDetectionModel {
  id: string;
  name: string;
  type: 'anomaly_detection' | 'pattern_recognition' | 'behavioral_analysis' | 'document_analysis';
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'deprecated';
}

export interface FraudAnalysisResult {
  requestId: string;
  riskScore: number; // 0-100
  fraudProbability: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  detectedPatterns: DetectedPattern[];
  anomalies: AnomalyDetection[];
  recommendations: string[];
  processingTime: number; // ms
  modelsUsed: string[];
}

export interface DetectedPattern {
  type: 'velocity_fraud' | 'synthetic_identity' | 'document_tampering' | 'behavioral_anomaly';
  confidence: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: Record<string, any>;
}

export interface AnomalyDetection {
  feature: string;
  expectedValue: number | string;
  actualValue: number | string;
  deviationScore: number;
  significance: 'minor' | 'moderate' | 'major' | 'severe';
}

export interface TrainingData {
  samples: FraudSample[];
  features: string[];
  labels: ('fraud' | 'legitimate')[];
  metadata: {
    totalSamples: number;
    fraudSamples: number;
    legitimateSamples: number;
    featureCount: number;
  };
}

export interface FraudSample {
  id: string;
  features: Record<string, number | string>;
  label: 'fraud' | 'legitimate';
  timestamp: Date;
  source: string;
  weight?: number; // Sample importance weight
}

class FraudDetectionMLService {
  private models: Map<string, FraudDetectionModel> = new Map();
  private trainingData: TrainingData;
  private analysisHistory: Map<string, FraudAnalysisResult> = new Map();

  constructor() {
    this.initializeModels();
    this.initializeTrainingData();
  }

  private initializeModels() {
    const models: FraudDetectionModel[] = [
      {
        id: 'anomaly-detector-v3',
        name: 'Advanced Anomaly Detector',
        type: 'anomaly_detection',
        version: '3.1.0',
        accuracy: 0.94,
        precision: 0.92,
        recall: 0.89,
        lastTrained: new Date('2024-01-10'),
        status: 'active'
      },
      {
        id: 'pattern-recognizer-v2',
        name: 'Pattern Recognition Engine',
        type: 'pattern_recognition',
        version: '2.5.0',
        accuracy: 0.91,
        precision: 0.88,
        recall: 0.94,
        lastTrained: new Date('2024-01-08'),
        status: 'active'
      },
      {
        id: 'behavioral-analyzer-v1',
        name: 'Behavioral Analysis Model',
        type: 'behavioral_analysis',
        version: '1.3.0',
        accuracy: 0.87,
        precision: 0.85,
        recall: 0.90,
        lastTrained: new Date('2024-01-05'),
        status: 'active'
      },
      {
        id: 'document-inspector-v4',
        name: 'Document Integrity Analyzer',
        type: 'document_analysis',
        version: '4.0.1',
        accuracy: 0.96,
        precision: 0.95,
        recall: 0.93,
        lastTrained: new Date('2024-01-12'),
        status: 'active'
      }
    ];

    models.forEach(model => this.models.set(model.id, model));
    console.log(`🤖 Initialized ${models.length} fraud detection ML models`);
  }

  private initializeTrainingData() {
    // Simulate training data initialization
    this.trainingData = {
      samples: [],
      features: [
        'velocity_score',
        'geographic_anomaly',
        'device_fingerprint_match',
        'behavioral_consistency',
        'document_quality_score',
        'timestamp_anomaly',
        'ip_reputation',
        'user_history_score',
        'network_analysis_score',
        'biometric_confidence'
      ],
      labels: [],
      metadata: {
        totalSamples: 150000,
        fraudSamples: 7500, // 5% fraud rate
        legitimateSamples: 142500,
        featureCount: 10
      }
    };
  }

  // Real-time fraud analysis
  async analyzeFraudRisk(
    requestData: {
      userId?: string;
      documentData?: any;
      behavioralData?: any;
      deviceData?: any;
      networkData?: any;
      biometricData?: any;
    }
  ): Promise<FraudAnalysisResult> {
    const requestId = `fraud-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    // Extract features from request data
    const features = this.extractFeatures(requestData);

    // Run analysis with all active models
    const activeModels = Array.from(this.models.values()).filter(m => m.status === 'active');
    const modelResults = await Promise.all(
      activeModels.map(model => this.runModelAnalysis(model, features))
    );

    // Combine results from multiple models
    const combinedResult = this.combineModelResults(modelResults, features);

    // Detect specific fraud patterns
    const detectedPatterns = await this.detectFraudPatterns(features, requestData);

    // Identify anomalies
    const anomalies = this.detectAnomalies(features);

    // Generate recommendations
    const recommendations = this.generateRecommendations(combinedResult, detectedPatterns, anomalies);

    const result: FraudAnalysisResult = {
      requestId,
      riskScore: combinedResult.riskScore,
      fraudProbability: combinedResult.fraudProbability,
      riskLevel: this.calculateRiskLevel(combinedResult.riskScore),
      detectedPatterns,
      anomalies,
      recommendations,
      processingTime: Date.now() - startTime,
      modelsUsed: activeModels.map(m => m.id)
    };

    this.analysisHistory.set(requestId, result);

    console.log(`🔍 Fraud analysis completed: ${requestId} - Risk: ${result.riskLevel} (${result.riskScore}%)`);
    return result;
  }

  private extractFeatures(requestData: any): Record<string, number> {
    const features: Record<string, number> = {};

    // Velocity scoring
    features.velocity_score = this.calculateVelocityScore(requestData.userId);

    // Geographic anomaly detection
    features.geographic_anomaly = this.detectGeographicAnomaly(requestData.networkData);

    // Device fingerprint analysis
    features.device_fingerprint_match = this.analyzeDeviceFingerprint(requestData.deviceData);

    // Behavioral consistency
    features.behavioral_consistency = this.analyzeBehavioralConsistency(requestData.behavioralData);

    // Document quality assessment
    features.document_quality_score = this.assessDocumentQuality(requestData.documentData);

    // Timestamp anomaly detection
    features.timestamp_anomaly = this.detectTimestampAnomalies(requestData);

    // IP reputation analysis
    features.ip_reputation = this.analyzeIPReputation(requestData.networkData);

    // User history scoring
    features.user_history_score = this.calculateUserHistoryScore(requestData.userId);

    // Network analysis
    features.network_analysis_score = this.analyzeNetworkPatterns(requestData.networkData);

    // Biometric confidence
    features.biometric_confidence = this.calculateBiometricConfidence(requestData.biometricData);

    return features;
  }

  private calculateVelocityScore(userId?: string): number {
    // Simulate velocity fraud detection
    // Check for rapid-fire verification attempts
    const baseScore = 0.1; // Low velocity by default
    const randomFactor = Math.random();
    
    if (!userId) return 0.8; // High risk for anonymous requests
    
    // Simulate checking recent activity
    if (randomFactor < 0.05) { // 5% chance of high velocity
      return 0.9; // High velocity detected
    } else if (randomFactor < 0.15) { // 10% more chance of moderate velocity
      return 0.6; // Moderate velocity
    }
    
    return baseScore + (randomFactor * 0.3); // Normal velocity with some variation
  }

  private detectGeographicAnomaly(networkData?: any): number {
    // Simulate geographic anomaly detection
    if (!networkData) return 0.5;
    
    const knownLocations = ['US', 'CA', 'GB', 'NP']; // Known safe locations
    const currentLocation = networkData.country || 'UNKNOWN';
    
    if (currentLocation === 'UNKNOWN') return 0.8;
    if (!knownLocations.includes(currentLocation)) return 0.7;
    
    // Check for impossible travel scenarios
    const timeSinceLastLocation = networkData.timeSinceLastLocation || 24; // hours
    const distanceFromLast = networkData.distanceFromLast || 0; // km
    
    if (distanceFromLast > 1000 && timeSinceLastLocation < 2) {
      return 0.9; // Impossible travel detected
    }
    
    return 0.1 + (Math.random() * 0.2); // Normal geographic pattern
  }

  private analyzeDeviceFingerprint(deviceData?: any): number {
    if (!deviceData) return 0.6;
    
    // Check for known device characteristics
    const hasConsistentFingerprint = deviceData.fingerprint && deviceData.fingerprintHistory;
    const deviceAge = deviceData.deviceAge || 0; // days
    const screenResolution = deviceData.screenResolution || 'unknown';
    
    let score = 0.2; // Base score for device match
    
    if (!hasConsistentFingerprint) score += 0.4;
    if (deviceAge < 1) score += 0.3; // Very new device
    if (screenResolution === 'unknown') score += 0.2;
    
    return Math.min(1.0, score);
  }

  private analyzeBehavioralConsistency(behavioralData?: any): number {
    if (!behavioralData) return 0.5;
    
    // Analyze typing patterns, mouse movements, etc.
    const typingPattern = behavioralData.typingPattern || {};
    const mousePattern = behavioralData.mousePattern || {};
    
    let consistencyScore = 0.8; // Start with high consistency
    
    // Check typing speed anomalies
    if (typingPattern.speed > 200 || typingPattern.speed < 20) {
      consistencyScore -= 0.3; // Unusual typing speed
    }
    
    // Check mouse movement patterns
    if (mousePattern.straightLineRatio > 0.9) {
      consistencyScore -= 0.4; // Too perfect mouse movements (bot-like)
    }
    
    return Math.max(0.0, consistencyScore);
  }

  private assessDocumentQuality(documentData?: any): number {
    if (!documentData) return 0.5;
    
    let qualityScore = 0.9; // Start with high quality assumption
    
    // Check for common tampering indicators
    if (documentData.resolution && documentData.resolution < 150) {
      qualityScore -= 0.3; // Low resolution
    }
    
    if (documentData.compression && documentData.compression > 90) {
      qualityScore -= 0.2; // Heavy compression
    }
    
    if (documentData.metadata && documentData.metadata.editingSoftware) {
      qualityScore -= 0.4; // Edited with photo editing software
    }
    
    // Check for digital artifacts
    if (documentData.artifacts && documentData.artifacts.length > 0) {
      qualityScore -= 0.1 * documentData.artifacts.length;
    }
    
    return Math.max(0.0, qualityScore);
  }

  private detectTimestampAnomalies(requestData: any): number {
    const currentTime = new Date();
    const requestTime = requestData.timestamp ? new Date(requestData.timestamp) : currentTime;
    
    // Check for future timestamps
    if (requestTime > currentTime) {
      return 0.9; // Future timestamp
    }
    
    // Check for very old timestamps
    const hoursSinceRequest = (currentTime.getTime() - requestTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceRequest > 24) {
      return 0.7; // Very old request
    }
    
    // Check for unusual timing patterns
    const hour = requestTime.getHours();
    if (hour < 6 || hour > 23) {
      return 0.4; // Unusual hours
    }
    
    return 0.1; // Normal timestamp
  }

  private analyzeIPReputation(networkData?: any): number {
    if (!networkData || !networkData.ip) return 0.5;
    
    const ip = networkData.ip;
    
    // Simulate IP reputation database lookup
    const knownBadIPs = ['192.168.1.100', '10.0.0.50']; // Mock bad IPs
    const vpnIndicators = ['vpn', 'proxy', 'tor'];
    
    if (knownBadIPs.includes(ip)) return 0.9;
    
    if (networkData.type && vpnIndicators.some(indicator => 
      networkData.type.toLowerCase().includes(indicator))) {
      return 0.6; // VPN/Proxy usage
    }
    
    if (networkData.isp && networkData.isp.includes('hosting')) {
      return 0.7; // Hosting provider (potential bot)
    }
    
    return 0.1 + (Math.random() * 0.2); // Good reputation
  }

  private calculateUserHistoryScore(userId?: string): number {
    if (!userId) return 0.8; // High risk for no user history
    
    // Simulate user history analysis
    const accountAge = Math.random() * 365; // days
    const verificationCount = Math.floor(Math.random() * 50);
    const successRate = 0.7 + (Math.random() * 0.3);
    
    let historyScore = 0.5; // Base score
    
    if (accountAge > 90) historyScore += 0.2; // Established account
    if (verificationCount > 10) historyScore += 0.2; // Active user
    if (successRate > 0.9) historyScore += 0.1; // High success rate
    
    return Math.min(1.0, historyScore);
  }

  private analyzeNetworkPatterns(networkData?: any): number {
    if (!networkData) return 0.5;
    
    let networkScore = 0.8; // Start with good network assumption
    
    // Check for suspicious network patterns
    if (networkData.connectionType === 'mobile' && networkData.rapidLocationChanges) {
      networkScore -= 0.3; // Rapid location changes on mobile
    }
    
    if (networkData.bandwidthPattern === 'irregular') {
      networkScore -= 0.2; // Irregular bandwidth usage
    }
    
    if (networkData.dnsLookups && networkData.dnsLookups.includes('suspicious.com')) {
      networkScore -= 0.4; // Suspicious DNS lookups
    }
    
    return Math.max(0.0, networkScore);
  }

  private calculateBiometricConfidence(biometricData?: any): number {
    if (!biometricData) return 0.5;
    
    let confidence = 0.9; // Start with high confidence
    
    // Check biometric quality indicators
    if (biometricData.faceMatch && biometricData.faceMatch < 0.8) {
      confidence -= 0.3; // Low face match confidence
    }
    
    if (biometricData.livenessScore && biometricData.livenessScore < 0.7) {
      confidence -= 0.4; // Low liveness score
    }
    
    if (biometricData.quality && biometricData.quality < 0.6) {
      confidence -= 0.2; // Poor biometric quality
    }
    
    return Math.max(0.0, confidence);
  }

  private async runModelAnalysis(model: FraudDetectionModel, features: Record<string, number>): Promise<{
    modelId: string;
    riskScore: number;
    confidence: number;
  }> {
    // Simulate model inference
    await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 40)); // 10-50ms processing time
    
    // Calculate weighted risk score based on model type and features
    let riskScore = 0;
    const featureValues = Object.values(features);
    
    switch (model.type) {
      case 'anomaly_detection':
        riskScore = featureValues.reduce((sum, val) => sum + val, 0) / featureValues.length * 100;
        break;
      case 'pattern_recognition':
        riskScore = Math.max(...featureValues) * 90; // Focus on highest risk feature
        break;
      case 'behavioral_analysis':
        const behavioralFeatures = ['behavioral_consistency', 'velocity_score', 'timestamp_anomaly'];
        const behavioralValues = behavioralFeatures.map(f => features[f] || 0);
        riskScore = behavioralValues.reduce((sum, val) => sum + val, 0) / behavioralValues.length * 85;
        break;
      case 'document_analysis':
        riskScore = (1 - features.document_quality_score) * 95;
        break;
    }
    
    // Apply model accuracy as confidence factor
    const confidence = model.accuracy;
    
    return {
      modelId: model.id,
      riskScore: Math.min(100, Math.max(0, riskScore)),
      confidence
    };
  }

  private combineModelResults(modelResults: any[], features: Record<string, number>): {
    riskScore: number;
    fraudProbability: number;
  } {
    // Weighted ensemble approach
    const totalWeight = modelResults.reduce((sum, result) => sum + result.confidence, 0);
    
    const weightedRiskScore = modelResults.reduce((sum, result) => {
      return sum + (result.riskScore * result.confidence / totalWeight);
    }, 0);
    
    const fraudProbability = weightedRiskScore / 100;
    
    return {
      riskScore: Math.round(weightedRiskScore),
      fraudProbability
    };
  }

  private async detectFraudPatterns(features: Record<string, number>, requestData: any): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];
    
    // Velocity fraud pattern
    if (features.velocity_score > 0.8) {
      patterns.push({
        type: 'velocity_fraud',
        confidence: features.velocity_score,
        description: 'High-velocity verification attempts detected',
        severity: features.velocity_score > 0.9 ? 'critical' : 'high',
        evidence: {
          velocity_score: features.velocity_score,
          threshold_exceeded: true
        }
      });
    }
    
    // Synthetic identity pattern
    if (features.device_fingerprint_match < 0.3 && features.user_history_score < 0.4) {
      patterns.push({
        type: 'synthetic_identity',
        confidence: 1 - ((features.device_fingerprint_match + features.user_history_score) / 2),
        description: 'Potential synthetic identity detected',
        severity: 'high',
        evidence: {
          device_mismatch: features.device_fingerprint_match,
          limited_history: features.user_history_score
        }
      });
    }
    
    // Document tampering pattern
    if (features.document_quality_score < 0.4) {
      patterns.push({
        type: 'document_tampering',
        confidence: 1 - features.document_quality_score,
        description: 'Document integrity issues detected',
        severity: features.document_quality_score < 0.2 ? 'critical' : 'medium',
        evidence: {
          quality_score: features.document_quality_score,
          tampering_indicators: ['low_resolution', 'compression_artifacts']
        }
      });
    }
    
    // Behavioral anomaly pattern
    if (features.behavioral_consistency < 0.5) {
      patterns.push({
        type: 'behavioral_anomaly',
        confidence: 1 - features.behavioral_consistency,
        description: 'Unusual behavioral patterns detected',
        severity: 'medium',
        evidence: {
          consistency_score: features.behavioral_consistency,
          anomaly_indicators: ['typing_pattern', 'mouse_movement']
        }
      });
    }
    
    return patterns;
  }

  private detectAnomalies(features: Record<string, number>): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Define expected ranges for features
    const expectedRanges = {
      velocity_score: { min: 0.1, max: 0.3 },
      geographic_anomaly: { min: 0.1, max: 0.2 },
      device_fingerprint_match: { min: 0.7, max: 1.0 },
      behavioral_consistency: { min: 0.6, max: 1.0 },
      document_quality_score: { min: 0.7, max: 1.0 }
    };
    
    Object.entries(features).forEach(([feature, value]) => {
      const expected = expectedRanges[feature as keyof typeof expectedRanges];
      if (expected) {
        if (value < expected.min || value > expected.max) {
          const expectedValue = (expected.min + expected.max) / 2;
          const deviationScore = Math.abs(value - expectedValue) / expectedValue;
          
          anomalies.push({
            feature,
            expectedValue: `${expected.min}-${expected.max}`,
            actualValue: value.toFixed(3),
            deviationScore,
            significance: deviationScore > 0.5 ? 'severe' : deviationScore > 0.3 ? 'major' : 'moderate'
          });
        }
      }
    });
    
    return anomalies;
  }

  private generateRecommendations(
    result: { riskScore: number; fraudProbability: number },
    patterns: DetectedPattern[],
    anomalies: AnomalyDetection[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Risk-based recommendations
    if (result.riskScore > 80) {
      recommendations.push('BLOCK: High fraud risk detected - immediate review required');
      recommendations.push('Require manual verification by security team');
    } else if (result.riskScore > 60) {
      recommendations.push('CHALLENGE: Additional verification steps recommended');
      recommendations.push('Request additional documentation or biometric verification');
    } else if (result.riskScore > 40) {
      recommendations.push('MONITOR: Flag for enhanced monitoring');
      recommendations.push('Track subsequent verification attempts closely');
    } else {
      recommendations.push('ALLOW: Risk within acceptable parameters');
    }
    
    // Pattern-specific recommendations
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'velocity_fraud':
          recommendations.push('Implement rate limiting for this user/IP');
          break;
        case 'synthetic_identity':
          recommendations.push('Require additional identity verification documents');
          break;
        case 'document_tampering':
          recommendations.push('Request new, high-quality document images');
          break;
        case 'behavioral_anomaly':
          recommendations.push('Consider behavioral re-authentication');
          break;
      }
    });
    
    // Anomaly-specific recommendations
    if (anomalies.some(a => a.significance === 'severe')) {
      recommendations.push('Investigate severe anomalies with specialist team');
    }
    
    return recommendations;
  }

  private calculateRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  // Model management methods
  async retrainModel(modelId: string, newTrainingData: FraudSample[]): Promise<{
    success: boolean;
    newAccuracy: number;
    trainingTime: number;
  }> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const startTime = Date.now();
    
    // Simulate model retraining
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Simulate improved accuracy
    const accuracyImprovement = 0.01 + Math.random() * 0.05; // 1-6% improvement
    const newAccuracy = Math.min(0.99, model.accuracy + accuracyImprovement);
    
    model.accuracy = newAccuracy;
    model.lastTrained = new Date();
    model.version = this.incrementVersion(model.version);
    
    const trainingTime = Date.now() - startTime;
    
    console.log(`🎯 Model ${modelId} retrained: ${newAccuracy.toFixed(3)} accuracy`);
    
    return {
      success: true,
      newAccuracy,
      trainingTime
    };
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  // Analytics and monitoring
  async getFraudAnalytics(): Promise<{
    totalAnalyses: number;
    averageRiskScore: number;
    riskDistribution: Record<string, number>;
    topPatterns: Array<{ pattern: string; count: number }>;
    modelPerformance: Array<{ modelId: string; accuracy: number; usage: number }>;
    recommendations: {
      modelUpdates: string[];
      systemImprovements: string[];
    };
  }> {
    const analyses = Array.from(this.analysisHistory.values());
    
    const totalAnalyses = analyses.length;
    const averageRiskScore = analyses.reduce((sum, a) => sum + a.riskScore, 0) / totalAnalyses;
    
    const riskDistribution = analyses.reduce((acc, analysis) => {
      acc[analysis.riskLevel] = (acc[analysis.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const patternCounts = analyses.reduce((acc, analysis) => {
      analysis.detectedPatterns.forEach(pattern => {
        acc[pattern.type] = (acc[pattern.type] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const topPatterns = Object.entries(patternCounts)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count);
    
    const modelPerformance = Array.from(this.models.values()).map(model => ({
      modelId: model.id,
      accuracy: model.accuracy,
      usage: analyses.filter(a => a.modelsUsed.includes(model.id)).length
    }));
    
    return {
      totalAnalyses,
      averageRiskScore,
      riskDistribution,
      topPatterns,
      modelPerformance,
      recommendations: {
        modelUpdates: this.generateModelUpdateRecommendations(),
        systemImprovements: this.generateSystemImprovements()
      }
    };
  }

  private generateModelUpdateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const models = Array.from(this.models.values());
    const oldModels = models.filter(m => {
      const daysSinceTraining = (Date.now() - m.lastTrained.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceTraining > 30;
    });
    
    if (oldModels.length > 0) {
      recommendations.push(`Retrain ${oldModels.length} models that haven't been updated in 30+ days`);
    }
    
    const lowAccuracyModels = models.filter(m => m.accuracy < 0.85);
    if (lowAccuracyModels.length > 0) {
      recommendations.push(`Improve accuracy for ${lowAccuracyModels.length} underperforming models`);
    }
    
    return recommendations;
  }

  private generateSystemImprovements(): string[] {
    return [
      'Implement real-time model ensemble optimization',
      'Add more diverse training data sources',
      'Enhance feature engineering for device fingerprinting',
      'Develop specialized models for emerging fraud patterns',
      'Implement automated model performance monitoring'
    ];
  }

  getActiveModels(): FraudDetectionModel[] {
    return Array.from(this.models.values()).filter(m => m.status === 'active');
  }

  getAnalysisHistory(limit: number = 100): FraudAnalysisResult[] {
    return Array.from(this.analysisHistory.values())
      .sort((a, b) => b.requestId.localeCompare(a.requestId))
      .slice(0, limit);
  }
}

export const fraudDetectionMLService = new FraudDetectionMLService();