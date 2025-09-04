/**
 * Database migration system using Drizzle
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import fs from 'fs/promises';
import path from 'path';

export class MigrationManager {
  private db: any;
  private migrationsPath: string;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
    this.migrationsPath = path.join(process.cwd(), 'drizzle');
  }

  async runMigrations(): Promise<void> {
    try {
      console.log('🗃️ Running database migrations...');
      
      await migrate(this.db, { migrationsFolder: this.migrationsPath });
      
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async getMigrationStatus(): Promise<any[]> {
    try {
      // Check which migrations have been applied
      const result = await this.db.execute(`
        SELECT * FROM drizzle.__drizzle_migrations 
        ORDER BY created_at DESC
      `);
      
      return result.rows || [];
    } catch (error) {
      console.warn('Migration status check failed:', error);
      return [];
    }
  }

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup_${timestamp}`;
    const backupDir = path.join(process.cwd(), 'backups');
    const backupFile = path.join(backupDir, `${backupName}.sql`);
    
    console.log(`📦 Creating database backup: ${backupName}`);
    
    try {
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });
      
      // Create database dump using pg_dump
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const dumpCommand = `pg_dump ${process.env.DATABASE_URL} > ${backupFile}`;
      await execAsync(dumpCommand);
      
      // Verify backup file was created
      const stats = await fs.stat(backupFile);
      if (stats.size === 0) {
        throw new Error('Backup file is empty');
      }
      
      console.log(`✅ Backup created: ${backupName} (${Math.round(stats.size / 1024)} KB)`);
      return backupName;
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    const backupDir = path.join(process.cwd(), 'backups');
    const backupFile = path.join(backupDir, `${backupId}.sql`);
    
    console.log(`🔄 Restoring database from backup: ${backupId}`);
    
    try {
      // Verify backup file exists
      await fs.access(backupFile);
      
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      // Create a restore database
      const restoreDbName = `veridity_restore_${Date.now()}`;
      const createDbCommand = `createdb ${restoreDbName}`;
      await execAsync(createDbCommand);
      
      // Restore from backup
      const restoreCommand = `psql ${restoreDbName} < ${backupFile}`;
      await execAsync(restoreCommand);
      
      console.log(`✅ Database restored from backup: ${backupId}`);
      console.log(`⚠️ Restored to new database: ${restoreDbName}`);
      console.log(`⚠️ Manual verification and cutover required`);
    } catch (error) {
      console.error('❌ Backup restore failed:', error);
      throw new Error(`Failed to restore backup: ${error.message}`);
    }
  }

  async checkDataIntegrity(): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Check for orphaned records
      const orphanedProofs = await this.db.execute(`
        SELECT COUNT(*) as count 
        FROM proofs p 
        LEFT JOIN users u ON p.user_id = u.id 
        WHERE u.id IS NULL
      `);
      
      if (orphanedProofs.rows[0]?.count > 0) {
        issues.push(`Found ${orphanedProofs.rows[0].count} orphaned proofs`);
      }

      // Check for invalid proof types
      const invalidProofTypes = await this.db.execute(`
        SELECT COUNT(*) as count 
        FROM proofs p 
        LEFT JOIN proof_types pt ON p.proof_type_id = pt.id 
        WHERE pt.id IS NULL
      `);
      
      if (invalidProofTypes.rows[0]?.count > 0) {
        issues.push(`Found ${invalidProofTypes.rows[0].count} proofs with invalid types`);
      }

      return {
        isValid: issues.length === 0,
        issues
      };
      
    } catch (error) {
      console.error('Data integrity check failed:', error);
      return {
        isValid: false,
        issues: ['Failed to perform integrity check']
      };
    }
  }
}

// Global migration manager
export const migrationManager = new MigrationManager();