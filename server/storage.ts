import {
  users,
  proofs,
  proofTypes,
  verifications,
  organizations,
  auditLogs,
  type User,
  type UpsertUser,
  type Proof,
  type InsertProof,
  type ProofType,
  type InsertProofType,
  type Verification,
  type InsertVerification,
  type Organization,
  type InsertOrganization,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<void>;
  
  // Proof operations
  createProof(proof: InsertProof): Promise<Proof>;
  getProof(id: string): Promise<Proof | undefined>;
  getUserProofs(userId: string, limit?: number): Promise<Proof[]>;
  updateProofStatus(id: string, status: string): Promise<void>;
  getProofHistory(userId: string): Promise<Array<{
    id: string;
    type: string;
    organization: string;
    status: 'verified' | 'failed' | 'pending';
    createdAt: string;
    verifiedAt?: string;
    referenceId: string;
  }>>;
  
  // Proof type operations
  getProofTypes(): Promise<ProofType[]>;
  createProofType(proofType: InsertProofType): Promise<ProofType>;
  
  // Verification operations
  createVerification(verification: InsertVerification): Promise<Verification>;
  getVerification(id: string): Promise<Verification | undefined>;
  updateVerificationResult(id: string, result: any): Promise<void>;
  
  // Organization operations
  getOrganizations(): Promise<Organization[]>;
  getOrganizationByApiKey(apiKey: string): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  
  // Analytics and stats
  getUserStats(userId: string): Promise<{
    totalProofs: number;
    verifiedProofs: number;
    recentProofs: Proof[];
  }>;
  
  getOrganizationStats(organizationId: string): Promise<{
    todayVerifications: number;
    monthlyVerifications: number;
    successRate: number;
  }>;
  
  // Admin operations
  getAdminOrganizationStats(): Promise<{
    todayVerifications: number;
    monthlyVerifications: number;
    successRate: number;
    avgTime: number;
  }>;
  
  getRecentVerifications(limit: number): Promise<Array<{
    id: string;
    type: string;
    timestamp: string;
    status: string;
  }>>;
  
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  
  getAuditLogs(limit?: number, offset?: number, filter?: {
    userId?: string;
    entityType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    logs: AuditLog[];
    total: number;
  }>;
  
  getUserRoleStats(): Promise<{
    total: number;
    admins: number;
    clients: number;
    customers: number;
  }>;
  
  getSystemStats(): Promise<{
    totalUsers: number;
    totalProofs: number;
    totalVerifications: number;
    totalOrganizations: number;
    dailyActiveUsers: number;
  }>;
  
  // Audit operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async createProof(proof: InsertProof): Promise<Proof> {
    const [newProof] = await db.insert(proofs).values(proof).returning();
    return newProof;
  }

  async getProof(id: string): Promise<Proof | undefined> {
    const [proof] = await db.select().from(proofs).where(eq(proofs.id, id));
    return proof;
  }

  async getUserProofs(userId: string, limit = 10): Promise<Proof[]> {
    return await db
      .select()
      .from(proofs)
      .where(eq(proofs.userId, userId))
      .orderBy(desc(proofs.createdAt))
      .limit(limit);
  }

  async updateProofStatus(id: string, status: string): Promise<void> {
    await db.update(proofs).set({ status }).where(eq(proofs.id, id));
  }

  async getProofTypes(): Promise<ProofType[]> {
    return await db
      .select()
      .from(proofTypes)
      .where(eq(proofTypes.isActive, true))
      .orderBy(proofTypes.name);
  }

  async createProofType(proofType: InsertProofType): Promise<ProofType> {
    const [newProofType] = await db.insert(proofTypes).values(proofType).returning();
    return newProofType;
  }

  async createVerification(verification: InsertVerification): Promise<Verification> {
    const [newVerification] = await db.insert(verifications).values(verification).returning();
    return newVerification;
  }

  async getVerification(id: string): Promise<Verification | undefined> {
    const [verification] = await db.select().from(verifications).where(eq(verifications.id, id));
    return verification;
  }

  async updateVerificationResult(id: string, result: any): Promise<void> {
    await db
      .update(verifications)
      .set({ 
        result, 
        status: 'verified',
        verifiedAt: new Date() 
      })
      .where(eq(verifications.id, id));
  }

  async getOrganizations(): Promise<Organization[]> {
    return await db
      .select()
      .from(organizations)
      .where(eq(organizations.isActive, true))
      .orderBy(organizations.name);
  }

  async getOrganizationByApiKey(apiKey: string): Promise<Organization | undefined> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(and(eq(organizations.apiKey, apiKey), eq(organizations.isActive, true)));
    return organization;
  }

  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [newOrganization] = await db.insert(organizations).values(organization).returning();
    return newOrganization;
  }

  async getUserStats(userId: string): Promise<{
    totalProofs: number;
    verifiedProofs: number;
    recentProofs: Proof[];
  }> {
    const [totalProofsResult] = await db
      .select({ count: count() })
      .from(proofs)
      .where(eq(proofs.userId, userId));

    const [verifiedProofsResult] = await db
      .select({ count: count() })
      .from(proofs)
      .where(and(eq(proofs.userId, userId), eq(proofs.status, 'verified')));

    const recentProofs = await this.getUserProofs(userId, 5);

    return {
      totalProofs: totalProofsResult.count,
      verifiedProofs: verifiedProofsResult.count,
      recentProofs,
    };
  }

  async getOrganizationStats(organizationId: string): Promise<{
    todayVerifications: number;
    monthlyVerifications: number;
    successRate: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [todayResult] = await db
      .select({ count: count() })
      .from(verifications)
      .where(
        and(
          eq(verifications.organizationId, organizationId),
          sql`${verifications.createdAt} >= ${today}`
        )
      );

    const [monthlyResult] = await db
      .select({ count: count() })
      .from(verifications)
      .where(
        and(
          eq(verifications.organizationId, organizationId),
          sql`${verifications.createdAt} >= ${monthStart}`
        )
      );

    const [successResult] = await db
      .select({ count: count() })
      .from(verifications)
      .where(
        and(
          eq(verifications.organizationId, organizationId),
          eq(verifications.status, 'verified'),
          sql`${verifications.createdAt} >= ${monthStart}`
        )
      );

    const successRate = monthlyResult.count > 0 
      ? (successResult.count / monthlyResult.count) * 100 
      : 0;

    return {
      todayVerifications: todayResult.count,
      monthlyVerifications: monthlyResult.count,
      successRate: Math.round(successRate * 10) / 10,
    };
  }

  async getComprehensiveStats(userId: string): Promise<{
    totalVerifications: number;
    successfulVerifications: number;
    failedVerifications: number;
    uniqueUsers: number;
    topProofTypes: Array<{ type: string; count: number }>;
    recentActivity: Array<{
      id: string;
      type: string;
      result: 'success' | 'failed';
      timestamp: string;
      userHash?: string;
    }>;
  }> {
    try {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      // Get total verifications
      const [totalResult] = await db
        .select({ count: count() })
        .from(verifications)
        .where(sql`${verifications.createdAt} >= ${monthStart}`);

      // Get successful verifications
      const [successResult] = await db
        .select({ count: count() })
        .from(verifications)
        .where(
          and(
            eq(verifications.status, 'verified'),
            sql`${verifications.createdAt} >= ${monthStart}`
          )
        );

      // Get failed verifications
      const [failedResult] = await db
        .select({ count: count() })
        .from(verifications)
        .where(
          and(
            eq(verifications.status, 'failed'),
            sql`${verifications.createdAt} >= ${monthStart}`
          )
        );

      // Get unique users (join through proofs to get userId)
      const [uniqueUsersResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${proofs.userId})` })
        .from(verifications)
        .innerJoin(proofs, eq(verifications.proofId, proofs.id))
        .where(sql`${verifications.createdAt} >= ${monthStart}`);

      // Get proof type statistics
      const proofTypeStats = await db
        .select({ 
          type: proofTypes.name,
          count: count()
        })
        .from(proofs)
        .innerJoin(verifications, eq(proofs.id, verifications.proofId))
        .innerJoin(proofTypes, eq(proofs.proofTypeId, proofTypes.id))
        .where(sql`${verifications.createdAt} >= ${monthStart}`)
        .groupBy(proofTypes.name)
        .orderBy(desc(count()))
        .limit(3);

      // Get recent activity
      const recentActivity = await db
        .select({
          id: verifications.id,
          type: proofTypes.name,
          status: verifications.status,
          timestamp: verifications.createdAt,
          userId: proofs.userId
        })
        .from(verifications)
        .innerJoin(proofs, eq(verifications.proofId, proofs.id))
        .innerJoin(proofTypes, eq(proofs.proofTypeId, proofTypes.id))
        .where(sql`${verifications.createdAt} >= ${monthStart}`)
        .orderBy(desc(verifications.createdAt))
        .limit(10);

      return {
        totalVerifications: totalResult.count,
        successfulVerifications: successResult.count,
        failedVerifications: failedResult.count,
        uniqueUsers: uniqueUsersResult.count,
        topProofTypes: proofTypeStats.map(stat => ({
          type: stat.type,
          count: stat.count
        })),
        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          type: activity.type,
          result: activity.status === 'verified' ? 'success' as const : 'failed' as const,
          timestamp: activity.timestamp.toISOString(),
          userHash: activity.userId ? `${activity.userId.slice(0, 6)}...` : undefined
        }))
      };
    } catch (error) {
      console.error('Error fetching comprehensive stats:', error);
      
      // Return fallback data
      return {
        totalVerifications: 0,
        successfulVerifications: 0,
        failedVerifications: 0,
        uniqueUsers: 0,
        topProofTypes: [],
        recentActivity: []
      };
    }
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }

  async getAdminOrganizationStats(): Promise<{
    todayVerifications: number;
    monthlyVerifications: number;
    successRate: number;
    avgTime: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Get today's verifications across all organizations
    const [todayResult] = await db
      .select({ count: count() })
      .from(verifications)
      .where(sql`${verifications.createdAt} >= ${today}`);

    // Get monthly verifications across all organizations
    const [monthlyResult] = await db
      .select({ count: count() })
      .from(verifications)
      .where(sql`${verifications.createdAt} >= ${monthStart}`);

    // Get success rate
    const [successResult] = await db
      .select({ count: count() })
      .from(verifications)
      .where(
        and(
          eq(verifications.status, 'verified'),
          sql`${verifications.createdAt} >= ${monthStart}`
        )
      );

    const successRate = monthlyResult.count > 0 
      ? (successResult.count / monthlyResult.count) * 100 
      : 0;

    return {
      todayVerifications: todayResult.count,
      monthlyVerifications: monthlyResult.count,
      successRate: Math.round(successRate * 10) / 10,
      avgTime: 1.2 // Mock average time - would calculate from verification logs in production
    };
  }

  async getRecentVerifications(limit: number): Promise<Array<{
    id: string;
    type: string;
    timestamp: string;
    status: string;
  }>> {
    const results = await db
      .select({
        id: verifications.id,
        status: verifications.status,
        createdAt: verifications.createdAt,
        proofTypeId: proofs.proofTypeId
      })
      .from(verifications)
      .innerJoin(proofs, eq(verifications.proofId, proofs.id))
      .orderBy(desc(verifications.createdAt))
      .limit(limit);

    // Get proof types to map IDs to names
    const proofTypesList = await this.getProofTypes();
    const proofTypeMap = new Map(proofTypesList.map(pt => [pt.id, pt.name]));

    return results.map(v => ({
      id: v.id,
      type: proofTypeMap.get(v.proofTypeId) || 'Unknown Type',
      timestamp: v.createdAt ? new Date(v.createdAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }) : 'Unknown',
      status: v.status
    }));
  }

  async getProofHistory(userId: string): Promise<Array<{
    id: string;
    type: string;
    organization: string;
    status: 'verified' | 'failed' | 'pending';
    createdAt: string;
    verifiedAt?: string;
    referenceId: string;
  }>> {
    // Get user's proofs with their verifications
    const userProofs = await db
      .select({
        id: proofs.id,
        proofTypeId: proofs.proofTypeId,
        status: proofs.status,
        createdAt: proofs.createdAt,
        verificationId: verifications.id,
        verificationStatus: verifications.status,
        verificationCreatedAt: verifications.createdAt,
        organizationId: verifications.organizationId
      })
      .from(proofs)
      .leftJoin(verifications, eq(proofs.id, verifications.proofId))
      .where(eq(proofs.userId, userId))
      .orderBy(desc(proofs.createdAt));

    // Get proof types and organizations for mapping
    const proofTypesList = await this.getProofTypes();
    const proofTypeMap = new Map(proofTypesList.map(pt => [pt.id, pt.name]));
    
    const organizationsList = await this.getOrganizations();
    const organizationMap = new Map(organizationsList.map(org => [org.id, org.name]));

    return userProofs.map(p => ({
      id: p.id,
      type: proofTypeMap.get(p.proofTypeId) || 'Unknown Type',
      organization: p.organizationId ? (organizationMap.get(p.organizationId) || 'Unknown Organization') : 'Self-Verified',
      status: (p.verificationStatus || p.status) as 'verified' | 'failed' | 'pending',
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      verifiedAt: p.verificationCreatedAt?.toISOString(),
      referenceId: `VRF-${p.id.slice(0, 8).toUpperCase()}`
    }));
  }

  async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    // Get paginated users
    const userResults = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return userResults;
  }

  async getAuditLogs(
    limit: number = 50, 
    offset: number = 0, 
    filter?: {
      userId?: string;
      entityType?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    let query = db.select().from(auditLogs);
    
    // Apply filters
    const conditions = [];
    if (filter?.userId) {
      conditions.push(eq(auditLogs.userId, filter.userId));
    }
    if (filter?.entityType) {
      conditions.push(eq(auditLogs.entityType, filter.entityType));
    }
    if (filter?.action) {
      conditions.push(eq(auditLogs.action, filter.action));
    }
    if (filter?.startDate) {
      conditions.push(sql`${auditLogs.createdAt} >= ${filter.startDate}`);
    }
    if (filter?.endDate) {
      conditions.push(sql`${auditLogs.createdAt} <= ${filter.endDate}`);
    }

    // Get paginated results
    const logResults = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset)
      : await query.orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);

    // Get total count with same filters
    const [totalResult] = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      logs: logResults,
      total: totalResult.count
    };
  }

  async getUserRoleStats(): Promise<{
    total: number;
    admins: number;
    clients: number;
    customers: number;
  }> {
    const [totalResult] = await db
      .select({ count: count() })
      .from(users);

    const [adminResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'));

    const [clientResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'client'));

    const [customerResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'customer'));

    return {
      total: totalResult.count,
      admins: adminResult.count,
      clients: clientResult.count,
      customers: customerResult.count
    };
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    totalProofs: number;
    totalVerifications: number;
    totalOrganizations: number;
    dailyActiveUsers: number;
  }> {
    const [usersResult] = await db
      .select({ count: count() })
      .from(users);

    const [proofsResult] = await db
      .select({ count: count() })
      .from(proofs);

    const [verificationsResult] = await db
      .select({ count: count() })
      .from(verifications);

    const [organizationsResult] = await db
      .select({ count: count() })
      .from(organizations);

    // Daily active users - users who created proofs today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [dailyActiveResult] = await db
      .select({ count: count() })
      .from(proofs)
      .where(sql`${proofs.createdAt} >= ${today}`);

    return {
      totalUsers: usersResult.count,
      totalProofs: proofsResult.count,
      totalVerifications: verificationsResult.count,
      totalOrganizations: organizationsResult.count,
      dailyActiveUsers: dailyActiveResult.count
    };
  }
}

export const storage = new DatabaseStorage();
