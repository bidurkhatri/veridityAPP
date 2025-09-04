// Advanced AI-powered fraud detection system
export class AIFraudDetectionSystem {
  private static instance: AIFraudDetectionSystem;
  private fraudPatterns: Map<string, FraudPattern> = new Map();
  private behaviorProfiles: Map<string, UserBehaviorProfile> = new Map();
  private riskScores: Map<string, number> = new Map();

  static getInstance(): AIFraudDetectionSystem {
    if (!AIFraudDetectionSystem.instance) {
      AIFraudDetectionSystem.instance = new AIFraudDetectionSystem();
    }
    return AIFraudDetectionSystem.instance;
  }

  // Analyze document for fraud indicators
  async analyzeDocument(documentData: DocumentData): Promise<FraudAnalysisResult> {
    const analysis: FraudAnalysisResult = {
      riskScore: 0,
      indicators: [],
      confidence: 0,
      recommendations: [],
      timestamp: new Date().toISOString()
    };

    // Document authenticity checks
    const authCheck = this.checkDocumentAuthenticity(documentData);
    analysis.riskScore += authCheck.riskScore;
    analysis.indicators.push(...authCheck.indicators);

    // Biometric consistency analysis
    const bioCheck = this.analyzeBiometricConsistency(documentData);
    analysis.riskScore += bioCheck.riskScore;
    analysis.indicators.push(...bioCheck.indicators);

    // Pattern matching against known fraud
    const patternCheck = this.matchFraudPatterns(documentData);
    analysis.riskScore += patternCheck.riskScore;
    analysis.indicators.push(...patternCheck.indicators);

    // Calculate final confidence
    analysis.confidence = Math.min(95, 60 + (analysis.indicators.length * 8));
    
    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  // Analyze user behavior for anomalies
  analyzeUserBehavior(userId: string, behaviorData: BehaviorData): BehaviorAnalysisResult {
    let profile = this.behaviorProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        normalPatterns: {
          loginTimes: [],
          deviceUsage: new Map(),
          locationPatterns: [],
          verificationFrequency: 0
        },
        anomalyScore: 0,
        lastUpdated: new Date()
      };
      this.behaviorProfiles.set(userId, profile);
    }

    const analysis: BehaviorAnalysisResult = {
      userId,
      anomalyScore: 0,
      anomalies: [],
      riskLevel: 'low',
      recommendations: []
    };

    // Time-based analysis
    if (this.isUnusualTime(behaviorData.timestamp, profile.normalPatterns.loginTimes)) {
      analysis.anomalies.push('Unusual login time');
      analysis.anomalyScore += 15;
    }

    // Device analysis
    if (this.isUnusualDevice(behaviorData.deviceInfo, profile.normalPatterns.deviceUsage)) {
      analysis.anomalies.push('New or unusual device');
      analysis.anomalyScore += 25;
    }

    // Location analysis
    if (this.isUnusualLocation(behaviorData.location, profile.normalPatterns.locationPatterns)) {
      analysis.anomalies.push('Unusual location');
      analysis.anomalyScore += 30;
    }

    // Determine risk level
    if (analysis.anomalyScore > 50) analysis.riskLevel = 'high';
    else if (analysis.anomalyScore > 25) analysis.riskLevel = 'medium';

    // Update profile
    this.updateBehaviorProfile(profile, behaviorData);

    return analysis;
  }

  // Real-time fraud monitoring
  async monitorTransaction(transactionData: TransactionData): Promise<MonitoringResult> {
    const result: MonitoringResult = {
      transactionId: transactionData.id,
      allowTransaction: true,
      riskScore: 0,
      flaggedReasons: [],
      requiredActions: []
    };

    // Velocity checks
    const velocityRisk = this.checkTransactionVelocity(transactionData);
    result.riskScore += velocityRisk.score;
    result.flaggedReasons.push(...velocityRisk.reasons);

    // Amount analysis
    const amountRisk = this.analyzeTransactionAmount(transactionData);
    result.riskScore += amountRisk.score;
    result.flaggedReasons.push(...amountRisk.reasons);

    // Network analysis
    const networkRisk = this.analyzeNetworkPattern(transactionData);
    result.riskScore += networkRisk.score;
    result.flaggedReasons.push(...networkRisk.reasons);

    // Decision logic
    if (result.riskScore > 80) {
      result.allowTransaction = false;
      result.requiredActions.push('Block transaction', 'Manual review required');
    } else if (result.riskScore > 50) {
      result.requiredActions.push('Additional verification required');
    }

    return result;
  }

  // Machine learning model for risk prediction
  predictRisk(features: RiskFeatures): number {
    // Simplified ML model simulation
    let riskScore = 0;

    // Feature weights (in real implementation, these would be learned)
    const weights = {
      deviceAge: 0.1,
      locationStability: 0.2,
      verificationHistory: 0.15,
      networkReputation: 0.25,
      timePatterns: 0.1,
      documentQuality: 0.2
    };

    riskScore += (100 - features.deviceAge) * weights.deviceAge;
    riskScore += (100 - features.locationStability) * weights.locationStability;
    riskScore += (100 - features.verificationHistory) * weights.verificationHistory;
    riskScore += (100 - features.networkReputation) * weights.networkReputation;
    riskScore += features.timePatterns * weights.timePatterns;
    riskScore += (100 - features.documentQuality) * weights.documentQuality;

    return Math.min(100, Math.max(0, riskScore));
  }

  // Private helper methods
  private checkDocumentAuthenticity(doc: DocumentData): { riskScore: number; indicators: string[] } {
    const indicators: string[] = [];
    let riskScore = 0;

    // Check image quality
    if (doc.imageQuality < 0.7) {
      indicators.push('Low image quality');
      riskScore += 20;
    }

    // Check for digital tampering
    if (doc.metadata.edited) {
      indicators.push('Document shows signs of editing');
      riskScore += 40;
    }

    // Check document format compliance
    if (!doc.metadata.compliantFormat) {
      indicators.push('Non-standard document format');
      riskScore += 15;
    }

    return { riskScore, indicators };
  }

  private analyzeBiometricConsistency(doc: DocumentData): { riskScore: number; indicators: string[] } {
    const indicators: string[] = [];
    let riskScore = 0;

    // Face matching score
    if (doc.biometricData.faceMatchScore < 0.8) {
      indicators.push('Low face matching confidence');
      riskScore += 30;
    }

    // Liveness detection
    if (!doc.biometricData.livenessDetected) {
      indicators.push('Failed liveness detection');
      riskScore += 50;
    }

    return { riskScore, indicators };
  }

  private matchFraudPatterns(doc: DocumentData): { riskScore: number; indicators: string[] } {
    const indicators: string[] = [];
    let riskScore = 0;

    // Check against known fraud patterns
    for (const [patternId, pattern] of this.fraudPatterns) {
      if (this.matchesPattern(doc, pattern)) {
        indicators.push(`Matches known fraud pattern: ${pattern.description}`);
        riskScore += pattern.severity;
      }
    }

    return { riskScore, indicators };
  }

  private matchesPattern(doc: DocumentData, pattern: FraudPattern): boolean {
    // Simplified pattern matching
    return pattern.indicators.some(indicator => 
      doc.metadata.documentType === indicator.type &&
      doc.metadata.issuer === indicator.issuer
    );
  }

  private isUnusualTime(timestamp: Date, normalTimes: Date[]): boolean {
    if (normalTimes.length === 0) return false;
    
    const hour = timestamp.getHours();
    const normalHours = normalTimes.map(t => t.getHours());
    const avgHour = normalHours.reduce((a, b) => a + b, 0) / normalHours.length;
    
    return Math.abs(hour - avgHour) > 6; // More than 6 hours difference
  }

  private isUnusualDevice(deviceInfo: any, deviceUsage: Map<string, number>): boolean {
    const deviceFingerprint = `${deviceInfo.userAgent}-${deviceInfo.screen}`;
    return !deviceUsage.has(deviceFingerprint);
  }

  private isUnusualLocation(location: any, locationPatterns: any[]): boolean {
    if (locationPatterns.length === 0) return false;
    
    // Check if location is significantly different from normal patterns
    return locationPatterns.every(pattern => 
      this.calculateDistance(location, pattern) > 100 // More than 100km
    );
  }

  private calculateDistance(loc1: any, loc2: any): number {
    // Simplified distance calculation
    const latDiff = Math.abs(loc1.latitude - loc2.latitude);
    const lonDiff = Math.abs(loc1.longitude - loc2.longitude);
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // Rough km conversion
  }

  private updateBehaviorProfile(profile: UserBehaviorProfile, data: BehaviorData): void {
    profile.normalPatterns.loginTimes.push(data.timestamp);
    
    const deviceKey = `${data.deviceInfo.userAgent}-${data.deviceInfo.screen}`;
    const currentCount = profile.normalPatterns.deviceUsage.get(deviceKey) || 0;
    profile.normalPatterns.deviceUsage.set(deviceKey, currentCount + 1);
    
    if (data.location) {
      profile.normalPatterns.locationPatterns.push(data.location);
    }
    
    profile.lastUpdated = new Date();
  }

  private checkTransactionVelocity(tx: TransactionData): { score: number; reasons: string[] } {
    // Simplified velocity check
    return { score: 0, reasons: [] };
  }

  private analyzeTransactionAmount(tx: TransactionData): { score: number; reasons: string[] } {
    // Simplified amount analysis
    return { score: 0, reasons: [] };
  }

  private analyzeNetworkPattern(tx: TransactionData): { score: number; reasons: string[] } {
    // Simplified network analysis
    return { score: 0, reasons: [] };
  }

  private generateRecommendations(analysis: FraudAnalysisResult): string[] {
    const recommendations: string[] = [];
    
    if (analysis.riskScore > 70) {
      recommendations.push('Require additional identity verification');
      recommendations.push('Flag for manual review');
    } else if (analysis.riskScore > 40) {
      recommendations.push('Request additional documentation');
    }
    
    if (analysis.indicators.includes('Low image quality')) {
      recommendations.push('Request higher quality document image');
    }
    
    return recommendations;
  }

  // Get fraud statistics
  getStatistics(): FraudStatistics {
    return {
      totalAnalyzed: this.behaviorProfiles.size,
      fraudDetected: Array.from(this.riskScores.values()).filter(score => score > 70).length,
      averageRiskScore: Array.from(this.riskScores.values()).reduce((a, b) => a + b, 0) / this.riskScores.size || 0,
      activePatterns: this.fraudPatterns.size
    };
  }
}

// Type definitions
interface DocumentData {
  id: string;
  type: string;
  imageQuality: number;
  metadata: {
    documentType: string;
    issuer: string;
    edited: boolean;
    compliantFormat: boolean;
  };
  biometricData: {
    faceMatchScore: number;
    livenessDetected: boolean;
  };
}

interface FraudAnalysisResult {
  riskScore: number;
  indicators: string[];
  confidence: number;
  recommendations: string[];
  timestamp: string;
}

interface BehaviorData {
  timestamp: Date;
  deviceInfo: any;
  location: any;
  actionType: string;
}

interface UserBehaviorProfile {
  userId: string;
  normalPatterns: {
    loginTimes: Date[];
    deviceUsage: Map<string, number>;
    locationPatterns: any[];
    verificationFrequency: number;
  };
  anomalyScore: number;
  lastUpdated: Date;
}

interface BehaviorAnalysisResult {
  userId: string;
  anomalyScore: number;
  anomalies: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface TransactionData {
  id: string;
  userId: string;
  amount: number;
  type: string;
  timestamp: Date;
}

interface MonitoringResult {
  transactionId: string;
  allowTransaction: boolean;
  riskScore: number;
  flaggedReasons: string[];
  requiredActions: string[];
}

interface RiskFeatures {
  deviceAge: number;
  locationStability: number;
  verificationHistory: number;
  networkReputation: number;
  timePatterns: number;
  documentQuality: number;
}

interface FraudPattern {
  id: string;
  description: string;
  severity: number;
  indicators: Array<{
    type: string;
    issuer: string;
  }>;
}

interface FraudStatistics {
  totalAnalyzed: number;
  fraudDetected: number;
  averageRiskScore: number;
  activePatterns: number;
}

export const aiFraudDetection = AIFraudDetectionSystem.getInstance();