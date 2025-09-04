/**
 * Backup and restore procedures for user data
 */

export interface BackupData {
  version: string;
  timestamp: Date;
  user: any;
  proofs: any[];
  settings: Record<string, any>;
  organizations: any[];
}

export interface RestoreResult {
  success: boolean;
  message: string;
  warnings: string[];
  restoredItems: {
    proofs: number;
    settings: number;
    organizations: number;
  };
}

class BackupManager {
  private readonly BACKUP_VERSION = '1.0.0';

  async createBackup(): Promise<string> {
    try {
      // Gather user data
      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date(),
        user: await this.getCurrentUser(),
        proofs: await this.getUserProofs(),
        settings: this.getUserSettings(),
        organizations: await this.getUserOrganizations()
      };

      // Convert to JSON
      const backupJson = JSON.stringify(backupData, null, 2);
      
      // Create downloadable file
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `veridity-backup-${timestamp}.json`;
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      return filename;
      
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  async restoreFromFile(file: File): Promise<RestoreResult> {
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      
      // Validate backup format
      if (!this.isValidBackup(backupData)) {
        return {
          success: false,
          message: 'Invalid backup file format',
          warnings: [],
          restoredItems: { proofs: 0, settings: 0, organizations: 0 }
        };
      }

      // Check version compatibility
      if (backupData.version !== this.BACKUP_VERSION) {
        return {
          success: false,
          message: `Incompatible backup version: ${backupData.version} (current: ${this.BACKUP_VERSION})`,
          warnings: [],
          restoredItems: { proofs: 0, settings: 0, organizations: 0 }
        };
      }

      const warnings: string[] = [];
      const restoredItems = { proofs: 0, settings: 0, organizations: 0 };

      // Restore settings
      try {
        this.restoreSettings(backupData.settings);
        restoredItems.settings = Object.keys(backupData.settings).length;
      } catch (error) {
        warnings.push('Failed to restore some settings');
      }

      // Restore proofs (this would typically involve API calls)
      try {
        for (const proof of backupData.proofs) {
          await this.restoreProof(proof);
          restoredItems.proofs++;
        }
      } catch (error) {
        warnings.push('Failed to restore some proofs');
      }

      // Restore organizations
      try {
        for (const org of backupData.organizations) {
          await this.restoreOrganization(org);
          restoredItems.organizations++;
        }
      } catch (error) {
        warnings.push('Failed to restore some organizations');
      }

      return {
        success: true,
        message: 'Backup restored successfully',
        warnings,
        restoredItems
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Restore failed',
        warnings: [],
        restoredItems: { proofs: 0, settings: 0, organizations: 0 }
      };
    }
  }

  private isValidBackup(data: any): data is BackupData {
    return !!(
      data &&
      typeof data === 'object' &&
      data.version &&
      data.timestamp &&
      data.user &&
      Array.isArray(data.proofs) &&
      data.settings &&
      Array.isArray(data.organizations)
    );
  }

  private async getCurrentUser(): Promise<any> {
    try {
      const response = await fetch('/api/auth/user');
      return await response.json();
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  private async getUserProofs(): Promise<any[]> {
    try {
      const response = await fetch('/api/proofs');
      return await response.json();
    } catch (error) {
      console.error('Failed to get user proofs:', error);
      return [];
    }
  }

  private getUserSettings(): Record<string, any> {
    const settings: Record<string, any> = {};
    
    // Gather all Veridity-related localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('veridity-')) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            settings[key] = JSON.parse(value);
          } catch {
            settings[key] = value;
          }
        }
      }
    }
    
    return settings;
  }

  private async getUserOrganizations(): Promise<any[]> {
    try {
      const response = await fetch('/api/organizations');
      return await response.json();
    } catch (error) {
      console.error('Failed to get user organizations:', error);
      return [];
    }
  }

  private restoreSettings(settings: Record<string, any>) {
    for (const [key, value] of Object.entries(settings)) {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to restore setting ${key}:`, error);
      }
    }
  }

  private async restoreProof(proof: any): Promise<void> {
    try {
      await fetch('/api/proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proof)
      });
    } catch (error) {
      console.error('Failed to restore proof:', error);
      throw error;
    }
  }

  private async restoreOrganization(org: any): Promise<void> {
    try {
      await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(org)
      });
    } catch (error) {
      console.error('Failed to restore organization:', error);
      throw error;
    }
  }
}

// Global backup manager
export const backupManager = new BackupManager();

// React hook for backup/restore
export function useBackupRestore() {
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const createBackup = async () => {
    setIsCreating(true);
    try {
      const filename = await backupManager.createBackup();
      return filename;
    } finally {
      setIsCreating(false);
    }
  };

  const restoreBackup = async (file: File) => {
    setIsRestoring(true);
    try {
      const result = await backupManager.restoreFromFile(file);
      return result;
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    isCreating,
    isRestoring,
    createBackup,
    restoreBackup
  };
}