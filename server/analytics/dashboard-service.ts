/**
 * Advanced Analytics and Reporting Dashboard Service for Veridity
 * 
 * Provides comprehensive insights for enterprise customers and administrators
 * while maintaining privacy-first principles.
 */

import { db } from '../db';
import { proofs, verifications, organizations, auditLogs } from '../../shared/schema';
import { eq, gte, lte, count, desc, sql } from 'drizzle-orm';

export interface AnalyticsMetrics {
  totalVerifications: number;
  successRate: number;
  averageVerificationTime: number;
  popularProofTypes: Array<{ type: string; count: number }>;
  geographicDistribution: Array<{ region: string; count: number }>;
  timeSeriesData: Array<{ date: string; verifications: number; success: number }>;
}

export interface OrganizationMetrics {
  organizationId: string;
  organizationName: string;
  totalRequests: number;
  successfulVerifications: number;
  failedVerifications: number;
  averageResponseTime: number;
  costAnalysis: {
    totalCost: number;
    costPerVerification: number;
    projectedMonthlyCost: number;
  };
  complianceScore: number;
}

export interface TrendAnalysis {
  verificationTrends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  proofTypePopularity: Array<{
    type: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercent: number;
  }>;
  performanceMetrics: {
    averageLatency: number;
    p95Latency: number;
    errorRate: number;
    uptimePercentage: number;
  };
}

export class AnalyticsDashboardService {
  // Get comprehensive analytics for admin dashboard
  async getSystemAnalytics(timeframe: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsMetrics> {
    const startDate = this.getStartDate(timeframe);
    
    try {
      // Total verifications
      const totalVerifications = await db
        .select({ count: count() })
        .from(verifications)
        .where(gte(verifications.createdAt, startDate));

      // Success rate calculation
      const successfulVerifications = await db
        .select({ count: count() })
        .from(verifications)
        .where(
          sql`${verifications.createdAt} >= ${startDate} AND ${verifications.status} = 'verified'`
        );

      const successRate = totalVerifications[0].count > 0 
        ? (successfulVerifications[0].count / totalVerifications[0].count) * 100 
        : 0;

      // Popular proof types
      const popularProofTypes = await db
        .select({
          type: proofs.proofTypeId,
          count: count()
        })
        .from(proofs)
        .where(gte(proofs.createdAt, startDate))
        .groupBy(proofs.proofTypeId)
        .orderBy(desc(count()))
        .limit(10);

      // Time series data for charts
      const timeSeriesData = await this.getTimeSeriesData(startDate, timeframe);

      // Geographic distribution (mock data - would integrate with real location services)
      const geographicDistribution = await this.getGeographicDistribution(startDate);

      // Average verification time (mock calculation)
      const averageVerificationTime = 2.3; // Would calculate from actual timing data

      return {
        totalVerifications: totalVerifications[0].count,
        successRate: Math.round(successRate * 100) / 100,
        averageVerificationTime,
        popularProofTypes: popularProofTypes.map(pt => ({
          type: pt.type || 'unknown',
          count: pt.count
        })),
        geographicDistribution,
        timeSeriesData
      };
    } catch (error) {
      console.error('Error generating system analytics:', error);
      throw new Error('Failed to generate analytics');
    }
  }

  // Get organization-specific metrics
  async getOrganizationMetrics(organizationId: string, timeframe: 'day' | 'week' | 'month' = 'month'): Promise<OrganizationMetrics> {
    const startDate = this.getStartDate(timeframe);
    
    try {
      // Organization info
      const org = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

      if (org.length === 0) {
        throw new Error('Organization not found');
      }

      // Total requests
      const totalRequests = await db
        .select({ count: count() })
        .from(verifications)
        .where(
          sql`${verifications.organizationId} = ${organizationId} AND ${verifications.createdAt} >= ${startDate}`
        );

      // Successful verifications
      const successfulVerifications = await db
        .select({ count: count() })
        .from(verifications)
        .where(
          sql`${verifications.organizationId} = ${organizationId} AND ${verifications.createdAt} >= ${startDate} AND ${verifications.status} = 'verified'`
        );

      // Failed verifications
      const failedVerifications = await db
        .select({ count: count() })
        .from(verifications)
        .where(
          sql`${verifications.organizationId} = ${organizationId} AND ${verifications.createdAt} >= ${startDate} AND ${verifications.status} = 'failed'`
        );

      // Cost analysis (simplified pricing model)
      const costPerVerification = 0.50; // $0.50 per verification
      const totalCost = totalRequests[0].count * costPerVerification;
      const projectedMonthlyCost = this.projectMonthlyCost(totalCost, timeframe);

      // Compliance score (based on various factors)
      const complianceScore = await this.calculateComplianceScore(organizationId);

      return {
        organizationId,
        organizationName: org[0].name,
        totalRequests: totalRequests[0].count,
        successfulVerifications: successfulVerifications[0].count,
        failedVerifications: failedVerifications[0].count,
        averageResponseTime: 2.1, // Mock data - would calculate from real timing
        costAnalysis: {
          totalCost,
          costPerVerification,
          projectedMonthlyCost
        },
        complianceScore
      };
    } catch (error) {
      console.error('Error generating organization metrics:', error);
      throw new Error('Failed to generate organization metrics');
    }
  }

  // Get trend analysis
  async getTrendAnalysis(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<TrendAnalysis> {
    const startDate = this.getStartDate(timeframe);
    
    try {
      // Verification trends
      const verificationTrends = await this.getVerificationTrends(startDate, timeframe);
      
      // Proof type popularity trends
      const proofTypePopularity = await this.getProofTypePopularityTrends(startDate);
      
      // Performance metrics
      const performanceMetrics = {
        averageLatency: 1.8, // Mock data
        p95Latency: 4.2,
        errorRate: 0.5,
        uptimePercentage: 99.9
      };

      return {
        verificationTrends,
        proofTypePopularity,
        performanceMetrics
      };
    } catch (error) {
      console.error('Error generating trend analysis:', error);
      throw new Error('Failed to generate trend analysis');
    }
  }

  // Get security and fraud metrics
  async getSecurityMetrics(timeframe: 'day' | 'week' | 'month' = 'week') {
    const startDate = this.getStartDate(timeframe);
    
    try {
      // Suspicious activity detection
      const suspiciousActivities = await db
        .select({ count: count() })
        .from(auditLogs)
        .where(
          sql`${auditLogs.createdAt} >= ${startDate} AND ${auditLogs.action} LIKE '%suspicious%'`
        );

      // Fraud prevention stats
      const blockedAttempts = await db
        .select({ count: count() })
        .from(auditLogs)
        .where(
          sql`${auditLogs.createdAt} >= ${startDate} AND ${auditLogs.action} = 'verification_blocked'`
        );

      // Privacy compliance checks
      const privacyViolations = await db
        .select({ count: count() })
        .from(auditLogs)
        .where(
          sql`${auditLogs.createdAt} >= ${startDate} AND ${auditLogs.action} LIKE '%privacy_violation%'`
        );

      return {
        suspiciousActivities: suspiciousActivities[0].count,
        blockedAttempts: blockedAttempts[0].count,
        privacyViolations: privacyViolations[0].count,
        securityScore: this.calculateSecurityScore(suspiciousActivities[0].count, blockedAttempts[0].count),
        recommendations: this.generateSecurityRecommendations()
      };
    } catch (error) {
      console.error('Error generating security metrics:', error);
      return {
        suspiciousActivities: 0,
        blockedAttempts: 0,
        privacyViolations: 0,
        securityScore: 85,
        recommendations: []
      };
    }
  }

  // Generate detailed reports for compliance
  async generateComplianceReport(organizationId: string, startDate: Date, endDate: Date) {
    try {
      // Audit trail
      const auditTrail = await db
        .select()
        .from(auditLogs)
        .where(
          sql`${auditLogs.createdAt} >= ${startDate} AND ${auditLogs.createdAt} <= ${endDate}`
        )
        .orderBy(desc(auditLogs.createdAt));

      // Data processing activities
      const dataProcessingActivities = await this.getDataProcessingActivities(organizationId, startDate, endDate);
      
      // Privacy impact assessment
      const privacyImpact = await this.assessPrivacyImpact(organizationId, startDate, endDate);
      
      return {
        reportId: `compliance_${organizationId}_${Date.now()}`,
        organizationId,
        reportPeriod: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        auditTrail: auditTrail.slice(0, 1000), // Limit for performance
        dataProcessingActivities,
        privacyImpact,
        complianceScore: await this.calculateComplianceScore(organizationId),
        recommendations: await this.generateComplianceRecommendations(organizationId),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw new Error('Failed to generate compliance report');
    }
  }

  // Private helper methods
  private getStartDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private async getTimeSeriesData(startDate: Date, timeframe: string) {
    // Generate mock time series data - in production, this would query actual verification logs
    const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        verifications: Math.floor(Math.random() * 100) + 20,
        success: Math.floor(Math.random() * 90) + 15
      });
    }
    
    return data;
  }

  private async getGeographicDistribution(startDate: Date) {
    // Mock geographic data - would integrate with IP geolocation or user-provided data
    const nepalProvinces = [
      'Province 1', 'Madhesh Pradesh', 'Bagmati Pradesh', 'Gandaki Pradesh',
      'Lumbini Pradesh', 'Karnali Pradesh', 'Sudurpashchim Pradesh'
    ];
    
    return nepalProvinces.map(province => ({
      region: province,
      count: Math.floor(Math.random() * 200) + 50
    }));
  }

  private async getVerificationTrends(startDate: Date, timeframe: string) {
    // Mock trend data
    return {
      daily: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 10),
      weekly: Array.from({ length: 12 }, () => Math.floor(Math.random() * 300) + 100),
      monthly: Array.from({ length: 12 }, () => Math.floor(Math.random() * 1200) + 500)
    };
  }

  private async getProofTypePopularityTrends(startDate: Date) {
    const proofTypes = ['age_verification', 'citizenship_verification', 'income_verification', 'education_verification'];
    
    return proofTypes.map(type => ({
      type,
      trend: (['increasing', 'decreasing', 'stable'] as const)[Math.floor(Math.random() * 3)],
      changePercent: (Math.random() - 0.5) * 40 // -20% to +20%
    }));
  }

  private projectMonthlyCost(currentCost: number, timeframe: string): number {
    switch (timeframe) {
      case 'day':
        return currentCost * 30;
      case 'week':
        return currentCost * 4.33;
      case 'month':
        return currentCost;
      default:
        return currentCost;
    }
  }

  private async calculateComplianceScore(organizationId: string): Promise<number> {
    // Mock compliance score calculation - would assess various compliance factors
    return Math.floor(Math.random() * 20) + 80; // 80-100%
  }

  private calculateSecurityScore(suspicious: number, blocked: number): number {
    // Simple security score calculation
    const baseScore = 100;
    const suspiciousDeduction = suspicious * 2;
    const blockedBonus = blocked * 1; // Blocking attacks is good
    
    return Math.max(0, Math.min(100, baseScore - suspiciousDeduction + blockedBonus));
  }

  private generateSecurityRecommendations(): string[] {
    const recommendations = [
      'Enable multi-factor authentication for all admin accounts',
      'Implement IP allowlisting for sensitive operations',
      'Set up automated alerts for suspicious verification patterns',
      'Regularly rotate API keys and webhook secrets',
      'Monitor for unusual geographic access patterns'
    ];
    
    // Return 2-3 random recommendations
    return recommendations.slice(0, Math.floor(Math.random() * 2) + 2);
  }

  private async getDataProcessingActivities(organizationId: string, startDate: Date, endDate: Date) {
    // Mock data processing activities
    return [
      {
        activity: 'Identity Verification',
        purpose: 'KYC Compliance',
        dataTypes: ['Personal Identifiers', 'Document Numbers'],
        processingCount: Math.floor(Math.random() * 1000) + 100,
        retentionPeriod: '5 years'
      },
      {
        activity: 'Age Verification',
        purpose: 'Service Eligibility',
        dataTypes: ['Date of Birth'],
        processingCount: Math.floor(Math.random() * 500) + 50,
        retentionPeriod: '1 year'
      }
    ];
  }

  private async assessPrivacyImpact(organizationId: string, startDate: Date, endDate: Date) {
    return {
      riskLevel: 'Medium',
      dataMinimization: 'Compliant',
      purposeLimitation: 'Compliant',
      storageMinimization: 'Compliant',
      privacyByDesign: 'Implemented',
      recommendations: [
        'Consider implementing additional data anonymization techniques',
        'Regular privacy impact assessments recommended'
      ]
    };
  }

  private async generateComplianceRecommendations(organizationId: string): Promise<string[]> {
    return [
      'Implement regular compliance audits',
      'Update privacy policies to reflect current data processing',
      'Ensure all staff are trained on data protection requirements',
      'Consider implementing additional security measures for sensitive data'
    ];
  }
}

export const analyticsService = new AnalyticsDashboardService();