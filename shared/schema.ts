import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  preferredLanguage: varchar("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Proof types available in the system
export const proofTypes = pgTable("proof_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameNepali: varchar("name_nepali"),
  description: text("description"),
  descriptionNepali: text("description_nepali"),
  circuitId: varchar("circuit_id").notNull(), // Mock circuit identifier
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated proofs by users
export const proofs = pgTable("proofs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  proofTypeId: varchar("proof_type_id").notNull().references(() => proofTypes.id),
  proofData: jsonb("proof_data").notNull(), // Encrypted proof data
  publicSignals: jsonb("public_signals"), // Public outputs of the proof
  status: varchar("status").notNull().default("pending"), // pending, verified, failed
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Verification requests from organizations
export const verifications = pgTable("verification_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proofId: varchar("proof_id").notNull().references(() => proofs.id),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  status: varchar("status").notNull().default("pending"), // pending, verified, failed
  result: jsonb("result"), // Verification result details
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner organizations that can verify proofs
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameNepali: varchar("name_nepali"),
  type: varchar("type").notNull(), // government, university, bank, enterprise
  apiKey: varchar("api_key").unique(),
  isActive: boolean("is_active").default(true),
  allowedProofTypes: jsonb("allowed_proof_types").default([]), // Array of proof type IDs
  ipAllowlist: jsonb("ip_allowlist").default([]), // Array of CIDR blocks
  webhookUrl: varchar("webhook_url"),
  webhookSecret: varchar("webhook_secret"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Status lists for credential revocation
export const statusLists = pgTable("status_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listType: varchar("list_type").notNull(), // 'vc_statuslist', 'crl'
  bitstring: text("bitstring").notNull(), // compressed bitstring as base64
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Verifiable Credentials with status tracking
export const credentials = pgTable("credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  claimType: varchar("claim_type").notNull(),
  vcJwt: text("vc_jwt"), // SD-JWT or JWS
  status: varchar("status").notNull().default("active"), // active|revoked|expired
  statusListId: varchar("status_list_id").references(() => statusLists.id),
  statusIndex: integer("status_index"),
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

// Nonce tracking for replay protection
export const nonces = pgTable("nonces", {
  id: varchar("id").primaryKey(),
  partnerId: varchar("partner_id").notNull().references(() => organizations.id),
  nonce: varchar("nonce").notNull(),
  usedAt: timestamp("used_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => [
  index("idx_nonce_partner").on(table.partnerId, table.nonce),
  index("idx_nonce_expires").on(table.expiresAt),
]);

// Rate limiting tracking
export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  identifier: varchar("identifier").notNull(), // partner_id or IP
  window: timestamp("window").notNull(),
  count: integer("count").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_rate_limit_window").on(table.identifier, table.window),
]);

// Audit logs for compliance and monitoring
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id"),
  userId: varchar("user_id").references(() => users.id),
  organizationId: varchar("organization_id").references(() => organizations.id),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Signed audit digests for tamper-proof logs
export const auditDigests = pgTable("audit_digests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromTs: timestamp("from_ts").notNull(),
  toTs: timestamp("to_ts").notNull(),
  merkleRoot: varchar("merkle_root").notNull(),
  signature: text("signature").notNull(), // GPG/ed25519
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProofTypeSchema = createInsertSchema(proofTypes).omit({
  id: true,
  createdAt: true,
});

export const insertProofSchema = createInsertSchema(proofs).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationSchema = createInsertSchema(verifications).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertCredentialSchema = createInsertSchema(credentials).omit({
  id: true,
  createdAt: true,
  revokedAt: true,
});

 export const insertStatusListSchema = createInsertSchema(statusLists).omit({
  id: true,
  updatedAt: true,
});

export const insertNonceSchema = createInsertSchema(nonces).omit({
  id: true,
  usedAt: true,
});

export const insertRateLimitSchema = createInsertSchema(rateLimits).omit({
  id: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAuditDigestSchema = createInsertSchema(auditDigests).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Biometric credentials table for WebAuthn support
export const biometricCredentials = pgTable("biometric_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceId: varchar("device_id").notNull(),
  credentialId: varchar("credential_id").notNull().unique(),
  publicKey: varchar("public_key").notNull(),
  deviceName: varchar("device_name").notNull(),
  platform: varchar("platform", { enum: ['android', 'ios', 'windows', 'macos', 'linux'] }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
});

export type BiometricCredential = typeof biometricCredentials.$inferSelect;
export type InsertBiometricCredential = typeof biometricCredentials.$inferInsert;
export type InsertProofType = z.infer<typeof insertProofTypeSchema>;
export type ProofType = typeof proofTypes.$inferSelect;
export type InsertProof = z.infer<typeof insertProofSchema>;
export type Proof = typeof proofs.$inferSelect;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type Verification = typeof verifications.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type Credential = typeof credentials.$inferSelect;
export type InsertStatusList = z.infer<typeof insertStatusListSchema>;
export type StatusList = typeof statusLists.$inferSelect;
export type InsertNonce = z.infer<typeof insertNonceSchema>;
export type Nonce = typeof nonces.$inferSelect;
export type InsertRateLimit = z.infer<typeof insertRateLimitSchema>;
export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditDigest = z.infer<typeof insertAuditDigestSchema>;
export type AuditDigest = typeof auditDigests.$inferSelect;
