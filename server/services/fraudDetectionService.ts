/**
 * Fraud detection and risk assessment service
 */

export interface FraudAlert {
  id: string;
  type: 'suspicious_pattern' | 'velocity_limit' | 'duplicate_proof' | 'blacklist_match' | 'anomaly_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  proofId?: string;
  organizationId?: string;
  metadata: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

export interface RiskScore {
  score: number; // 0-100 (100 = highest risk)
  factors: RiskFactor[];
  recommendation: 'approve' | 'review' | 'reject';
  confidence: number; // 0-1
}

export interface RiskFactor {
  type: string;
  impact: number; // contribution to risk score
  description: string;
}

export interface UserBehaviorProfile {
  userId: string;
  totalProofs: number;
  avgProofsPerDay: number;
  commonProofTypes: string[];
  commonOrganizations: string[];
  unusualPatterns: string[];
  lastActive: Date;
  riskLevel: 'low' | 'medium' | 'high';
}

class FraudDetectionService {
  private alerts: Map<string, FraudAlert> = new Map();
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  private blacklistedUsers: Set<string> = new Set();
  private blacklistedOrganizations: Set<string> = new Set();

  // Rate limiting thresholds
  private readonly DAILY_PROOF_LIMIT = 10;
  private readonly HOURLY_PROOF_LIMIT = 3;
  private readonly VELOCITY_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

  async analyzeProofGeneration(
    userId: string,
    proofTypeId: string,
    organizationId?: string
  ): Promise<RiskScore> {
    const riskFactors: RiskFactor[] = [];
    let totalScore = 0;

    // Check user blacklist
    if (this.blacklistedUsers.has(userId)) {
      riskFactors.push({
        type: 'blacklisted_user',
        impact: 95,
        description: 'User is on security blacklist'
      });
      totalScore += 95;
    }

    // Check organization blacklist
    if (organizationId && this.blacklistedOrganizations.has(organizationId)) {
      riskFactors.push({
        type: 'blacklisted_organization',
        impact: 80,
        description: 'Target organization is flagged'
      });
      totalScore += 80;
    }

    // Velocity check
    const velocityRisk = await this.checkVelocityLimits(userId);
    if (velocityRisk.score > 0) {
      riskFactors.push(velocityRisk);
      totalScore += velocityRisk.impact;
    }

    // Pattern analysis
    const patternRisk = await this.analyzeUserPatterns(userId, proofTypeId);
    if (patternRisk.score > 0) {
      riskFactors.push(patternRisk);
      totalScore += patternRisk.impact;
    }

    // Duplicate detection
    const duplicateRisk = await this.checkDuplicateProofs(userId, proofTypeId);
    if (duplicateRisk.score > 0) {
      riskFactors.push(duplicateRisk);
      totalScore += duplicateRisk.impact;
    }

    // Time-based anomalies
    const timeRisk = await this.analyzeTimingPatterns(userId);
    if (timeRisk.score > 0) {
      riskFactors.push(timeRisk);
      totalScore += timeRisk.impact;
    }

    // Cap the score at 100
    const finalScore = Math.min(totalScore, 100);

    // Determine recommendation
    let recommendation: 'approve' | 'review' | 'reject';
    if (finalScore >= 80) recommendation = 'reject';
    else if (finalScore >= 40) recommendation = 'review';
    else recommendation = 'approve';

    // Calculate confidence based on number of factors
    const confidence = Math.min(riskFactors.length * 0.2 + 0.4, 1.0);

    return {
      score: finalScore,
      factors: riskFactors,
      recommendation,
      confidence
    };
  }

  private async checkVelocityLimits(userId: string): Promise<RiskFactor & { score: number }> {
    // In a real implementation, this would query the database
    // For now, simulate with stored profile data
    const profile = this.userProfiles.get(userId);
    
    if (!profile) {
      return { type: 'velocity_check', impact: 0, description: 'No velocity data', score: 0 };
    }

    if (profile.avgProofsPerDay > this.DAILY_PROOF_LIMIT) {
      return {
        type: 'velocity_exceeded',
        impact: 60,
        description: `User exceeds daily proof limit (${profile.avgProofsPerDay}/${this.DAILY_PROOF_LIMIT})`,
        score: 60
      };
    }

    return { type: 'velocity_check', impact: 0, description: 'Velocity within limits', score: 0 };
  }

  private async analyzeUserPatterns(userId: string, proofTypeId: string): Promise<RiskFactor & { score: number }> {
    const profile = this.userProfiles.get(userId);
    
    if (!profile) {
      return { type: 'pattern_analysis', impact: 0, description: 'Insufficient data', score: 0 };
    }

    // Check for unusual proof type for this user
    if (!profile.commonProofTypes.includes(proofTypeId)) {
      return {
        type: 'unusual_proof_type',
        impact: 25,
        description: `Unusual proof type for user: ${proofTypeId}`,
        score: 25
      };
    }

    return { type: 'pattern_analysis', impact: 0, description: 'Normal pattern', score: 0 };
  }

  private async checkDuplicateProofs(userId: string, proofTypeId: string): Promise<RiskFactor & { score: number }> {
    // In a real implementation, check database for recent similar proofs
    // For now, simulate some logic
    const randomCheck = Math.random();
    
    if (randomCheck < 0.1) { // 10% chance of flagging potential duplicate
      return {
        type: 'potential_duplicate',
        impact: 40,
        description: `Potential duplicate proof of type ${proofTypeId}`,
        score: 40
      };
    }

    return { type: 'duplicate_check', impact: 0, description: 'No duplicates found', score: 0 };
  }

  private async analyzeTimingPatterns(userId: string): Promise<RiskFactor & { score: number }> {
    const currentHour = new Date().getHours();
    
    // Flag unusual activity hours (2 AM - 5 AM)
    if (currentHour >= 2 && currentHour <= 5) {
      return {
        type: 'unusual_timing',
        impact: 15,
        description: 'Activity during unusual hours',
        score: 15
      };
    }

    return { type: 'timing_analysis', impact: 0, description: 'Normal timing', score: 0 };
  }

  async createAlert(alert: Omit<FraudAlert, 'id' | 'timestamp' | 'resolved'>): Promise<string> {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullAlert: FraudAlert = {
      ...alert,
      id,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.set(id, fullAlert);

    // Log critical alerts
    if (alert.severity === 'critical') {
      console.error(`🚨 CRITICAL FRAUD ALERT: ${alert.description}`, alert.metadata);
    }

    return id;
  }

  async getAlerts(severity?: FraudAlert['severity']): Promise<FraudAlert[]> {
    const alerts = Array.from(this.alerts.values());
    
    if (severity) {
      return alerts.filter(alert => alert.severity === severity);
    }
    
    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    return true;
  }

  async updateUserProfile(userId: string, proofTypeId: string): Promise<void> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        totalProofs: 0,
        avgProofsPerDay: 0,
        commonProofTypes: [],
        commonOrganizations: [],
        unusualPatterns: [],
        lastActive: new Date(),
        riskLevel: 'low'
      };
    }

    profile.totalProofs++;
    profile.lastActive = new Date();

    // Update common proof types
    if (!profile.commonProofTypes.includes(proofTypeId)) {
      profile.commonProofTypes.push(proofTypeId);
    }

    // Simple daily average calculation (in real implementation, use proper time windows)
    const daysSinceFirstProof = Math.max(1, Math.floor((Date.now() - profile.lastActive.getTime()) / (24 * 60 * 60 * 1000)));
    profile.avgProofsPerDay = profile.totalProofs / daysSinceFirstProof;

    // Assess risk level
    if (profile.avgProofsPerDay > this.DAILY_PROOF_LIMIT) {
      profile.riskLevel = 'high';
    } else if (profile.avgProofsPerDay > this.DAILY_PROOF_LIMIT / 2) {
      profile.riskLevel = 'medium';
    } else {
      profile.riskLevel = 'low';
    }

    this.userProfiles.set(userId, profile);
  }

  async getUserProfile(userId: string): Promise<UserBehaviorProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  // Administrative functions
  async addToBlacklist(userId: string, reason: string): Promise<void> {
    this.blacklistedUsers.add(userId);
    
    await this.createAlert({
      type: 'blacklist_match',
      severity: 'critical',
      description: `User ${userId} added to blacklist: ${reason}`,
      userId,
      metadata: { reason, action: 'blacklisted' }
    });
  }

  async removeFromBlacklist(userId: string): Promise<void> {
    this.blacklistedUsers.delete(userId);
  }

  async getStatistics(): Promise<{
    totalAlerts: number;
    criticalAlerts: number;
    blacklistedUsers: number;
    highRiskUsers: number;
  }> {
    const alerts = Array.from(this.alerts.values());
    const profiles = Array.from(this.userProfiles.values());

    return {
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      blacklistedUsers: this.blacklistedUsers.size,
      highRiskUsers: profiles.filter(p => p.riskLevel === 'high').length
    };
  }
}

export const fraudDetectionService = new FraudDetectionService();