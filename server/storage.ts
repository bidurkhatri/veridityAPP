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
        proofTypeId: verifications.proofTypeId
      })
      .from(verifications)
      .orderBy(desc(verifications.createdAt))
      .limit(limit);

    // Get proof types to map IDs to names
    const proofTypesList = await this.getProofTypes();
    const proofTypeMap = new Map(proofTypesList.map(pt => [pt.id, pt.name]));

    return results.map(v => ({
      id: v.id,
      type: proofTypeMap.get(v.proofTypeId) || 'Unknown Type',
      timestamp: new Date(v.createdAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
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
      createdAt: p.createdAt.toISOString(),
      verifiedAt: p.verificationCreatedAt?.toISOString(),
      referenceId: `VRF-${p.id.slice(0, 8).toUpperCase()}`
    }));
  }
}

export const storage = new DatabaseStorage();
