/**
 * Enterprise Systems Integration
 * SAP, Salesforce, Microsoft Azure AD, Oracle, and major enterprise platforms
 */

export interface EnterpriseIntegration {
  id: string;
  name: string;
  provider: 'sap' | 'salesforce' | 'microsoft' | 'oracle' | 'workday' | 'servicenow' | 'okta' | 'slack' | 'jira';
  type: 'identity' | 'crm' | 'erp' | 'hrms' | 'collaboration' | 'ticketing' | 'analytics';
  status: 'active' | 'inactive' | 'error' | 'configuring';
  configuration: IntegrationConfig;
  authentication: AuthenticationConfig;
  dataMappings: DataMapping[];
  syncSettings: SyncSettings;
  lastSync?: Date;
  errorCount: number;
  metrics: IntegrationMetrics;
}

export interface IntegrationConfig {
  endpoint: string;
  version: string;
  environment: 'production' | 'sandbox' | 'staging';
  timeout: number; // seconds
  retryAttempts: number;
  batchSize: number;
  features: string[];
  customFields: Record<string, any>;
}

export interface AuthenticationConfig {
  type: 'oauth2' | 'saml' | 'api_key' | 'certificate' | 'basic_auth';
  credentials: AuthCredentials;
  tokenExpiry?: Date;
  refreshToken?: string;
  scopes?: string[];
}

export interface AuthCredentials {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  certificatePath?: string;
  tenantId?: string;
  domain?: string;
}

export interface DataMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: DataTransformation;
  required: boolean;
  defaultValue?: any;
}

export interface DataTransformation {
  type: 'format' | 'lookup' | 'calculation' | 'concatenation' | 'split' | 'conditional';
  configuration: Record<string, any>;
}

export interface SyncSettings {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  direction: 'inbound' | 'outbound' | 'bidirectional';
  conflictResolution: 'source_wins' | 'target_wins' | 'manual_review' | 'timestamp_based';
  filterCriteria?: Record<string, any>;
}

export interface IntegrationMetrics {
  totalRecords: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSyncDuration: number; // seconds
  averageResponseTime: number; // ms
  dataQualityScore: number; // 0-100
  uptime: number; // percentage
}

export interface SyncResult {
  id: string;
  integrationId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  direction: 'inbound' | 'outbound';
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors: SyncError[];
  summary: SyncSummary;
}

export interface SyncError {
  recordId: string;
  errorCode: string;
  errorMessage: string;
  field?: string;
  severity: 'warning' | 'error' | 'critical';
}

export interface SyncSummary {
  totalRecords: number;
  newRecords: number;
  updatedRecords: number;
  deletedRecords: number;
  skippedRecords: number;
  conflictRecords: number;
}

export interface EnterpriseUser {
  id: string;
  externalId: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  title?: string;
  manager?: string;
  status: 'active' | 'inactive' | 'suspended';
  groups: string[];
  attributes: Record<string, any>;
  lastModified: Date;
}

export interface ConnectorTemplate {
  id: string;
  name: string;
  provider: string;
  version: string;
  description: string;
  capabilities: string[];
  defaultConfig: IntegrationConfig;
  requiredCredentials: string[];
  supportedOperations: string[];
  documentation: string;
}

class EnterpriseIntegrationService {
  private integrations: Map<string, EnterpriseIntegration> = new Map();
  private connectorTemplates: Map<string, ConnectorTemplate> = new Map();
  private syncResults: Map<string, SyncResult> = new Map();
  private activeConnections: Map<string, any> = new Map();

  constructor() {
    this.initializeConnectorTemplates();
    this.startSyncScheduler();
  }

  private initializeConnectorTemplates() {
    const templates: ConnectorTemplate[] = [
      {
        id: 'sap-successfactors',
        name: 'SAP SuccessFactors',
        provider: 'sap',
        version: '2.0',
        description: 'Integration with SAP SuccessFactors HCM platform',
        capabilities: ['user_sync', 'organizational_data', 'employee_verification', 'role_management'],
        defaultConfig: {
          endpoint: 'https://api.successfactors.com',
          version: 'v1',
          environment: 'production',
          timeout: 30,
          retryAttempts: 3,
          batchSize: 100,
          features: ['employee_central', 'organizational_management'],
          customFields: {}
        },
        requiredCredentials: ['clientId', 'clientSecret', 'username', 'password', 'tenantId'],
        supportedOperations: ['read_users', 'update_users', 'read_organizations', 'verify_employment'],
        documentation: 'https://docs.veridity.com/integrations/sap-successfactors'
      },
      {
        id: 'salesforce-crm',
        name: 'Salesforce CRM',
        provider: 'salesforce',
        version: '58.0',
        description: 'Integration with Salesforce CRM for customer identity verification',
        capabilities: ['customer_sync', 'lead_verification', 'contact_management', 'opportunity_tracking'],
        defaultConfig: {
          endpoint: 'https://login.salesforce.com',
          version: 'v58.0',
          environment: 'production',
          timeout: 45,
          retryAttempts: 3,
          batchSize: 200,
          features: ['contacts', 'leads', 'accounts', 'opportunities'],
          customFields: {}
        },
        requiredCredentials: ['clientId', 'clientSecret', 'username', 'password'],
        supportedOperations: ['read_contacts', 'update_contacts', 'create_leads', 'verify_customers'],
        documentation: 'https://docs.veridity.com/integrations/salesforce'
      },
      {
        id: 'azure-ad',
        name: 'Microsoft Azure Active Directory',
        provider: 'microsoft',
        version: '1.0',
        description: 'Integration with Azure AD for identity and access management',
        capabilities: ['user_provisioning', 'sso', 'group_management', 'conditional_access'],
        defaultConfig: {
          endpoint: 'https://graph.microsoft.com',
          version: 'v1.0',
          environment: 'production',
          timeout: 30,
          retryAttempts: 3,
          batchSize: 100,
          features: ['users', 'groups', 'applications', 'conditional_access'],
          customFields: {}
        },
        requiredCredentials: ['clientId', 'clientSecret', 'tenantId'],
        supportedOperations: ['read_users', 'create_users', 'update_users', 'manage_groups', 'sso_verification'],
        documentation: 'https://docs.veridity.com/integrations/azure-ad'
      },
      {
        id: 'oracle-hcm',
        name: 'Oracle HCM Cloud',
        provider: 'oracle',
        version: '21D',
        description: 'Integration with Oracle Human Capital Management Cloud',
        capabilities: ['workforce_sync', 'talent_management', 'payroll_verification', 'benefits_management'],
        defaultConfig: {
          endpoint: 'https://server.fa.em2.oraclecloud.com',
          version: '21D',
          environment: 'production',
          timeout: 60,
          retryAttempts: 3,
          batchSize: 50,
          features: ['workforce_management', 'talent_acquisition', 'payroll'],
          customFields: {}
        },
        requiredCredentials: ['username', 'password', 'tenantId'],
        supportedOperations: ['read_employees', 'verify_employment', 'read_positions', 'payroll_verification'],
        documentation: 'https://docs.veridity.com/integrations/oracle-hcm'
      },
      {
        id: 'workday-hcm',
        name: 'Workday HCM',
        provider: 'workday',
        version: '35.0',
        description: 'Integration with Workday Human Capital Management',
        capabilities: ['employee_sync', 'organizational_hierarchy', 'background_checks', 'compliance_reporting'],
        defaultConfig: {
          endpoint: 'https://services1.myworkday.com',
          version: 'v35.0',
          environment: 'production',
          timeout: 45,
          retryAttempts: 3,
          batchSize: 100,
          features: ['human_resources', 'payroll', 'time_tracking'],
          customFields: {}
        },
        requiredCredentials: ['username', 'password', 'tenantId'],
        supportedOperations: ['read_workers', 'verify_employment', 'background_check', 'compliance_export'],
        documentation: 'https://docs.veridity.com/integrations/workday'
      },
      {
        id: 'servicenow-itsm',
        name: 'ServiceNow ITSM',
        provider: 'servicenow',
        version: 'Vancouver',
        description: 'Integration with ServiceNow IT Service Management',
        capabilities: ['incident_management', 'user_verification', 'change_management', 'asset_tracking'],
        defaultConfig: {
          endpoint: 'https://instance.service-now.com',
          version: 'vancouver',
          environment: 'production',
          timeout: 30,
          retryAttempts: 3,
          batchSize: 100,
          features: ['incident', 'change', 'problem', 'asset'],
          customFields: {}
        },
        requiredCredentials: ['username', 'password'],
        supportedOperations: ['create_incident', 'verify_user', 'track_assets', 'manage_changes'],
        documentation: 'https://docs.veridity.com/integrations/servicenow'
      },
      {
        id: 'okta-identity',
        name: 'Okta Identity Cloud',
        provider: 'okta',
        version: '2022.01.0',
        description: 'Integration with Okta Identity and Access Management',
        capabilities: ['identity_verification', 'mfa_integration', 'lifecycle_management', 'api_access_management'],
        defaultConfig: {
          endpoint: 'https://company.okta.com',
          version: 'v1',
          environment: 'production',
          timeout: 30,
          retryAttempts: 3,
          batchSize: 100,
          features: ['users', 'groups', 'applications', 'policies'],
          customFields: {}
        },
        requiredCredentials: ['apiKey', 'domain'],
        supportedOperations: ['verify_identity', 'manage_users', 'enforce_policies', 'audit_access'],
        documentation: 'https://docs.veridity.com/integrations/okta'
      }
    ];

    templates.forEach(template => this.connectorTemplates.set(template.id, template));
    console.log(`🔗 Initialized ${templates.length} enterprise connector templates`);
  }

  // Integration management
  async createIntegration(
    templateId: string,
    name: string,
    credentials: AuthCredentials,
    customConfig?: Partial<IntegrationConfig>
  ): Promise<string> {
    const template = this.connectorTemplates.get(templateId);
    if (!template) {
      throw new Error(`Connector template not found: ${templateId}`);
    }

    const integrationId = `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const integration: EnterpriseIntegration = {
      id: integrationId,
      name,
      provider: template.provider as any,
      type: this.getIntegrationType(template.provider),
      status: 'configuring',
      configuration: { ...template.defaultConfig, ...customConfig },
      authentication: {
        type: this.getAuthenticationType(template.provider),
        credentials
      },
      dataMappings: this.createDefaultDataMappings(template.provider),
      syncSettings: {
        enabled: false,
        frequency: 'daily',
        direction: 'bidirectional',
        conflictResolution: 'timestamp_based'
      },
      errorCount: 0,
      metrics: {
        totalRecords: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        lastSyncDuration: 0,
        averageResponseTime: 0,
        dataQualityScore: 100,
        uptime: 100
      }
    };

    this.integrations.set(integrationId, integration);

    // Test connection
    try {
      await this.testConnection(integrationId);
      integration.status = 'inactive';
    } catch (error) {
      integration.status = 'error';
      integration.errorCount++;
      console.error(`Failed to create integration ${integrationId}:`, error);
    }

    console.log(`🔗 Created enterprise integration: ${name} (${template.provider})`);
    return integrationId;
  }

  private getIntegrationType(provider: string): EnterpriseIntegration['type'] {
    const typeMap = {
      'sap': 'erp',
      'salesforce': 'crm',
      'microsoft': 'identity',
      'oracle': 'erp',
      'workday': 'hrms',
      'servicenow': 'ticketing',
      'okta': 'identity',
      'slack': 'collaboration',
      'jira': 'ticketing'
    };
    return typeMap[provider] || 'identity';
  }

  private getAuthenticationType(provider: string): AuthenticationConfig['type'] {
    const authMap = {
      'sap': 'oauth2',
      'salesforce': 'oauth2',
      'microsoft': 'oauth2',
      'oracle': 'basic_auth',
      'workday': 'basic_auth',
      'servicenow': 'basic_auth',
      'okta': 'api_key'
    };
    return authMap[provider] || 'oauth2';
  }

  private createDefaultDataMappings(provider: string): DataMapping[] {
    const commonMappings: DataMapping[] = [
      {
        id: 'user-id',
        sourceField: 'id',
        targetField: 'externalId',
        required: true
      },
      {
        id: 'email',
        sourceField: 'email',
        targetField: 'email',
        required: true
      },
      {
        id: 'first-name',
        sourceField: 'firstName',
        targetField: 'firstName',
        required: true
      },
      {
        id: 'last-name',
        sourceField: 'lastName',
        targetField: 'lastName',
        required: true
      }
    ];

    // Provider-specific mappings
    const providerMappings = {
      'sap': [
        {
          id: 'employee-number',
          sourceField: 'personIdExternal',
          targetField: 'employeeNumber',
          required: true
        },
        {
          id: 'department',
          sourceField: 'department',
          targetField: 'department',
          required: false
        }
      ],
      'salesforce': [
        {
          id: 'account-id',
          sourceField: 'AccountId',
          targetField: 'accountId',
          required: false
        },
        {
          id: 'contact-status',
          sourceField: 'Status__c',
          targetField: 'status',
          required: false
        }
      ]
    };

    return [...commonMappings, ...(providerMappings[provider] || [])];
  }

  async testConnection(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    const startTime = Date.now();
    
    try {
      // Simulate connection test based on provider
      const connection = await this.establishConnection(integration);
      const testResult = await this.performConnectionTest(connection, integration);
      
      const duration = Date.now() - startTime;
      integration.metrics.averageResponseTime = duration;
      
      if (testResult.success) {
        integration.status = 'inactive';
        console.log(`✅ Connection test successful for ${integrationId}`);
        return true;
      } else {
        integration.status = 'error';
        integration.errorCount++;
        console.log(`❌ Connection test failed for ${integrationId}: ${testResult.error}`);
        return false;
      }
    } catch (error) {
      integration.status = 'error';
      integration.errorCount++;
      console.error(`❌ Connection test error for ${integrationId}:`, error);
      return false;
    }
  }

  private async establishConnection(integration: EnterpriseIntegration): Promise<any> {
    // Simulate establishing connection to external system
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const mockConnection = {
      id: `conn-${integration.id}`,
      provider: integration.provider,
      endpoint: integration.configuration.endpoint,
      authenticated: true,
      lastUsed: new Date()
    };

    this.activeConnections.set(integration.id, mockConnection);
    return mockConnection;
  }

  private async performConnectionTest(connection: any, integration: EnterpriseIntegration): Promise<{
    success: boolean;
    error?: string;
    metadata?: any;
  }> {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // 95% success rate for connection tests
    const success = Math.random() > 0.05;
    
    if (success) {
      return {
        success: true,
        metadata: {
          responseTime: Math.floor(200 + Math.random() * 300),
          serverVersion: integration.configuration.version,
          capabilities: ['read', 'write', 'delete']
        }
      };
    } else {
      const errors = [
        'Authentication failed',
        'Network timeout',
        'Invalid credentials',
        'Service unavailable',
        'API rate limit exceeded'
      ];
      return {
        success: false,
        error: errors[Math.floor(Math.random() * errors.length)]
      };
    }
  }

  // Data synchronization
  async startSync(integrationId: string, direction: 'inbound' | 'outbound' = 'inbound'): Promise<string> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    if (integration.status !== 'active') {
      throw new Error(`Integration is not active: ${integration.status}`);
    }

    const syncId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const syncResult: SyncResult = {
      id: syncId,
      integrationId,
      startTime: new Date(),
      status: 'running',
      direction,
      recordsProcessed: 0,
      recordsSuccessful: 0,
      recordsFailed: 0,
      errors: [],
      summary: {
        totalRecords: 0,
        newRecords: 0,
        updatedRecords: 0,
        deletedRecords: 0,
        skippedRecords: 0,
        conflictRecords: 0
      }
    };

    this.syncResults.set(syncId, syncResult);

    // Start async sync process
    setTimeout(() => {
      this.performSync(syncId);
    }, 1000);

    console.log(`🔄 Started sync: ${syncId} (${direction}) for ${integrationId}`);
    return syncId;
  }

  private async performSync(syncId: string): Promise<void> {
    const syncResult = this.syncResults.get(syncId);
    if (!syncResult) return;

    const integration = this.integrations.get(syncResult.integrationId);
    if (!integration) {
      syncResult.status = 'failed';
      return;
    }

    try {
      const connection = this.activeConnections.get(integration.id);
      if (!connection) {
        throw new Error('No active connection found');
      }

      // Simulate data sync
      const totalRecords = 100 + Math.floor(Math.random() * 500);
      const batchSize = integration.configuration.batchSize;
      
      for (let processed = 0; processed < totalRecords; processed += batchSize) {
        const currentBatch = Math.min(batchSize, totalRecords - processed);
        
        // Simulate batch processing
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        const batchResult = await this.processBatch(
          syncResult.direction,
          currentBatch,
          integration
        );
        
        syncResult.recordsProcessed += currentBatch;
        syncResult.recordsSuccessful += batchResult.successful;
        syncResult.recordsFailed += batchResult.failed;
        syncResult.errors.push(...batchResult.errors);
        
        // Update summary
        syncResult.summary.totalRecords = totalRecords;
        syncResult.summary.newRecords += batchResult.newRecords;
        syncResult.summary.updatedRecords += batchResult.updatedRecords;
        
        // Update progress
        console.log(`📊 Sync progress ${syncId}: ${syncResult.recordsProcessed}/${totalRecords} records`);
      }

      syncResult.status = 'completed';
      syncResult.endTime = new Date();
      
      // Update integration metrics
      integration.metrics.totalRecords += syncResult.recordsSuccessful;
      integration.metrics.successfulSyncs++;
      integration.metrics.lastSyncDuration = 
        (syncResult.endTime.getTime() - syncResult.startTime.getTime()) / 1000;
      integration.lastSync = new Date();
      
      console.log(`✅ Sync completed: ${syncId} - ${syncResult.recordsSuccessful}/${syncResult.recordsProcessed} successful`);

    } catch (error) {
      syncResult.status = 'failed';
      syncResult.endTime = new Date();
      syncResult.errors.push({
        recordId: 'sync-process',
        errorCode: 'SYNC_FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown sync error',
        severity: 'critical'
      });
      
      integration.metrics.failedSyncs++;
      integration.errorCount++;
      
      console.error(`❌ Sync failed: ${syncId}`, error);
    }
  }

  private async processBatch(
    direction: 'inbound' | 'outbound',
    batchSize: number,
    integration: EnterpriseIntegration
  ): Promise<{
    successful: number;
    failed: number;
    newRecords: number;
    updatedRecords: number;
    errors: SyncError[];
  }> {
    const errors: SyncError[] = [];
    const successful = Math.floor(batchSize * (0.9 + Math.random() * 0.09)); // 90-99% success rate
    const failed = batchSize - successful;
    const newRecords = Math.floor(successful * 0.3); // 30% new records
    const updatedRecords = successful - newRecords;

    // Generate some random errors for failed records
    for (let i = 0; i < failed; i++) {
      const errorTypes = [
        { code: 'VALIDATION_ERROR', message: 'Required field missing' },
        { code: 'DUPLICATE_RECORD', message: 'Record already exists' },
        { code: 'PERMISSION_DENIED', message: 'Insufficient permissions' },
        { code: 'RATE_LIMIT', message: 'API rate limit exceeded' }
      ];
      
      const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      errors.push({
        recordId: `record-${i}`,
        errorCode: errorType.code,
        errorMessage: errorType.message,
        severity: 'error'
      });
    }

    return {
      successful,
      failed,
      newRecords,
      updatedRecords,
      errors
    };
  }

  // User verification through enterprise systems
  async verifyEmployeeStatus(
    integrationId: string,
    employeeId: string
  ): Promise<{
    verified: boolean;
    employeeData?: EnterpriseUser;
    verificationSource: string;
    timestamp: Date;
    confidence: number;
  }> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    // Simulate employee verification
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const verified = Math.random() > 0.05; // 95% verification success rate
    
    if (verified) {
      const employeeData: EnterpriseUser = {
        id: `emp-${employeeId}`,
        externalId: employeeId,
        email: `${employeeId}@company.com`,
        firstName: 'John',
        lastName: 'Doe',
        department: 'Engineering',
        title: 'Software Engineer',
        manager: 'manager-123',
        status: 'active',
        groups: ['employees', 'engineering', 'full-time'],
        attributes: {
          startDate: '2023-01-15',
          location: 'San Francisco',
          employeeType: 'regular'
        },
        lastModified: new Date()
      };

      return {
        verified: true,
        employeeData,
        verificationSource: integration.name,
        timestamp: new Date(),
        confidence: 0.95 + Math.random() * 0.05
      };
    } else {
      return {
        verified: false,
        verificationSource: integration.name,
        timestamp: new Date(),
        confidence: 0.1 + Math.random() * 0.2
      };
    }
  }

  // SSO integration
  async configureSSOIntegration(
    integrationId: string,
    ssoConfig: {
      ssoUrl: string;
      certificateUrl: string;
      attributeMappings: Record<string, string>;
      signatureAlgorithm: string;
    }
  ): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;

    // Update integration configuration for SSO
    integration.configuration.customFields.sso = ssoConfig;
    
    // Test SSO configuration
    try {
      await this.testSSOConfiguration(integration, ssoConfig);
      console.log(`🔐 SSO configured for integration: ${integrationId}`);
      return true;
    } catch (error) {
      console.error(`❌ SSO configuration failed for ${integrationId}:`, error);
      return false;
    }
  }

  private async testSSOConfiguration(
    integration: EnterpriseIntegration,
    ssoConfig: any
  ): Promise<void> {
    // Simulate SSO test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error('SSO configuration test failed');
    }
  }

  // Monitoring and management
  private startSyncScheduler(): void {
    // Check for scheduled syncs every 5 minutes
    setInterval(() => {
      this.processSc

      this.processScheduledSyncs();
    }, 5 * 60 * 1000);

    // Update integration metrics every minute
    setInterval(() => {
      this.updateIntegrationMetrics();
    }, 60 * 1000);
  }

  private async processScheduledSyncs(): Promise<void> {
    const now = new Date();
    
    for (const integration of this.integrations.values()) {
      if (!integration.syncSettings.enabled || integration.status !== 'active') {
        continue;
      }

      const shouldSync = this.shouldRunScheduledSync(integration, now);
      if (shouldSync) {
        try {
          await this.startSync(integration.id, integration.syncSettings.direction);
        } catch (error) {
          console.error(`Failed to start scheduled sync for ${integration.id}:`, error);
          integration.errorCount++;
        }
      }
    }
  }

  private shouldRunScheduledSync(integration: EnterpriseIntegration, now: Date): boolean {
    if (!integration.lastSync) return true;

    const timeSinceLastSync = now.getTime() - integration.lastSync.getTime();
    const syncIntervals = {
      'hourly': 60 * 60 * 1000,
      'daily': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000
    };

    const interval = syncIntervals[integration.syncSettings.frequency];
    return interval && timeSinceLastSync >= interval;
  }

  private updateIntegrationMetrics(): void {
    for (const integration of this.integrations.values()) {
      // Update uptime calculation
      const totalTime = Date.now() - new Date(integration.lastSync || Date.now() - 24 * 60 * 60 * 1000).getTime();
      const downtime = integration.errorCount * 5 * 60 * 1000; // Assume 5 minutes downtime per error
      integration.metrics.uptime = Math.max(0, (totalTime - downtime) / totalTime * 100);

      // Update data quality score based on recent sync results
      const recentSyncs = Array.from(this.syncResults.values())
        .filter(sync => sync.integrationId === integration.id)
        .slice(-10); // Last 10 syncs

      if (recentSyncs.length > 0) {
        const avgSuccessRate = recentSyncs.reduce((sum, sync) => {
          return sum + (sync.recordsSuccessful / Math.max(1, sync.recordsProcessed));
        }, 0) / recentSyncs.length;
        
        integration.metrics.dataQualityScore = Math.round(avgSuccessRate * 100);
      }
    }
  }

  // Analytics and reporting
  async getIntegrationAnalytics(): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    totalSyncOperations: number;
    successRate: number;
    averageResponseTime: number;
    topProviders: Array<{ provider: string; count: number }>;
    recentErrors: SyncError[];
    uptimeByProvider: Record<string, number>;
  }> {
    const integrations = Array.from(this.integrations.values());
    const syncResults = Array.from(this.syncResults.values());
    
    const activeIntegrations = integrations.filter(i => i.status === 'active').length;
    
    const totalRecordsProcessed = syncResults.reduce((sum, sync) => sum + sync.recordsProcessed, 0);
    const totalRecordsSuccessful = syncResults.reduce((sum, sync) => sum + sync.recordsSuccessful, 0);
    const successRate = totalRecordsProcessed > 0 ? totalRecordsSuccessful / totalRecordsProcessed : 0;
    
    const totalResponseTime = integrations.reduce((sum, i) => sum + i.metrics.averageResponseTime, 0);
    const averageResponseTime = integrations.length > 0 ? totalResponseTime / integrations.length : 0;
    
    const providerCounts = integrations.reduce((acc, integration) => {
      acc[integration.provider] = (acc[integration.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topProviders = Object.entries(providerCounts)
      .map(([provider, count]) => ({ provider, count }))
      .sort((a, b) => b.count - a.count);
    
    const recentErrors = syncResults
      .flatMap(sync => sync.errors)
      .sort((a, b) => b.recordId.localeCompare(a.recordId))
      .slice(0, 10);
    
    const uptimeByProvider = integrations.reduce((acc, integration) => {
      if (!acc[integration.provider]) {
        acc[integration.provider] = [];
      }
      acc[integration.provider].push(integration.metrics.uptime);
      return acc;
    }, {} as Record<string, number[]>);
    
    // Calculate average uptime per provider
    const avgUptimeByProvider = Object.entries(uptimeByProvider).reduce((acc, [provider, uptimes]) => {
      acc[provider] = uptimes.reduce((sum, uptime) => sum + uptime, 0) / uptimes.length;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIntegrations: integrations.length,
      activeIntegrations,
      totalSyncOperations: syncResults.length,
      successRate,
      averageResponseTime,
      topProviders,
      recentErrors,
      uptimeByProvider: avgUptimeByProvider
    };
  }

  // Public API methods
  getConnectorTemplates(): ConnectorTemplate[] {
    return Array.from(this.connectorTemplates.values());
  }

  getIntegrations(): EnterpriseIntegration[] {
    return Array.from(this.integrations.values());
  }

  getIntegration(integrationId: string): EnterpriseIntegration | null {
    return this.integrations.get(integrationId) || null;
  }

  getSyncResults(integrationId?: string): SyncResult[] {
    const results = Array.from(this.syncResults.values());
    if (integrationId) {
      return results.filter(result => result.integrationId === integrationId);
    }
    return results;
  }

  async enableIntegration(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;

    const testResult = await this.testConnection(integrationId);
    if (testResult) {
      integration.status = 'active';
      return true;
    }
    return false;
  }

  async disableIntegration(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;

    integration.status = 'inactive';
    integration.syncSettings.enabled = false;
    
    // Close active connection
    this.activeConnections.delete(integrationId);
    
    return true;
  }

  async updateDataMappings(integrationId: string, mappings: DataMapping[]): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;

    integration.dataMappings = mappings;
    return true;
  }

  async updateSyncSettings(integrationId: string, settings: Partial<SyncSettings>): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;

    integration.syncSettings = { ...integration.syncSettings, ...settings };
    return true;
  }
}

export const enterpriseIntegrationService = new EnterpriseIntegrationService();