// Multi-region compliance framework
export class ComplianceEngine {
  private static instance: ComplianceEngine;
  private regulations: Map<string, RegulationFramework> = new Map();
  private complianceChecks: Map<string, ComplianceCheck> = new Map();
  private auditLogs: ComplianceAuditLog[] = [];

  static getInstance(): ComplianceEngine {
    if (!ComplianceEngine.instance) {
      ComplianceEngine.instance = new ComplianceEngine();
    }
    return ComplianceEngine.instance;
  }

  // Initialize compliance frameworks for different regions
  initializeRegulations(): void {
    // European Union - GDPR
    this.regulations.set('EU-GDPR', {
      id: 'EU-GDPR',
      name: 'General Data Protection Regulation',
      region: 'European Union',
      version: '2018.1',
      requirements: [
        'lawful_basis_processing',
        'data_minimization',
        'purpose_limitation',
        'consent_management',
        'right_to_erasure',
        'data_portability',
        'privacy_by_design',
        'breach_notification'
      ],
      dataRetentionLimits: {
        personalData: 365 * 2, // 2 years
        consentRecords: 365 * 7, // 7 years
        auditLogs: 365 * 6 // 6 years
      },
      fines: { max: 20000000, percentage: 4 }, // €20M or 4% of revenue
      lastUpdated: new Date('2023-01-01')
    });

    // United States - CCPA
    this.regulations.set('US-CCPA', {
      id: 'US-CCPA',
      name: 'California Consumer Privacy Act',
      region: 'California, United States',
      version: '2020.1',
      requirements: [
        'consumer_right_to_know',
        'consumer_right_to_delete',
        'consumer_right_to_opt_out',
        'non_discrimination',
        'verifiable_consumer_request',
        'privacy_policy_disclosure'
      ],
      dataRetentionLimits: {
        personalData: 365 * 1, // 1 year unless business need
        consentRecords: 365 * 5, // 5 years
        auditLogs: 365 * 3 // 3 years
      },
      fines: { max: 7500, percentage: 0 }, // $7,500 per violation
      lastUpdated: new Date('2023-01-01')
    });

    // China - PIPL
    this.regulations.set('CN-PIPL', {
      id: 'CN-PIPL',
      name: 'Personal Information Protection Law',
      region: 'China',
      version: '2021.1',
      requirements: [
        'consent_before_processing',
        'data_localization',
        'cross_border_transfer_approval',
        'personal_information_impact_assessment',
        'data_protection_officer',
        'incident_reporting'
      ],
      dataRetentionLimits: {
        personalData: 365 * 1, // 1 year minimum
        consentRecords: 365 * 10, // 10 years
        auditLogs: 365 * 5 // 5 years
      },
      fines: { max: 50000000, percentage: 5 }, // ¥50M or 5% of revenue
      lastUpdated: new Date('2023-01-01')
    });

    // United Kingdom - UK GDPR
    this.regulations.set('UK-GDPR', {
      id: 'UK-GDPR',
      name: 'UK General Data Protection Regulation',
      region: 'United Kingdom',
      version: '2021.1',
      requirements: [
        'lawful_basis_processing',
        'data_minimization',
        'purpose_limitation',
        'consent_management',
        'right_to_erasure',
        'data_portability',
        'adequacy_decisions'
      ],
      dataRetentionLimits: {
        personalData: 365 * 2, // 2 years
        consentRecords: 365 * 7, // 7 years
        auditLogs: 365 * 6 // 6 years
      },
      fines: { max: 17500000, percentage: 4 }, // £17.5M or 4% of revenue
      lastUpdated: new Date('2023-01-01')
    });

    console.log('⚖️ Compliance frameworks initialized for multiple regions');
  }

  // Check compliance for data processing activity
  async checkCompliance(activity: DataProcessingActivity): Promise<ComplianceResult> {
    const applicableRegulations = this.getApplicableRegulations(activity.userLocation, activity.dataLocation);
    const results: ComplianceCheckResult[] = [];

    for (const regulation of applicableRegulations) {
      const checkResult = await this.performComplianceCheck(activity, regulation);
      results.push(checkResult);
    }

    const overallCompliance: ComplianceResult = {
      activityId: activity.id,
      isCompliant: results.every(r => r.isCompliant),
      regulationResults: results,
      requiredActions: this.aggregateRequiredActions(results),
      riskLevel: this.calculateRiskLevel(results),
      timestamp: new Date()
    };

    // Log compliance check
    this.logComplianceCheck(activity, overallCompliance);

    return overallCompliance;
  }

  // Generate privacy impact assessment
  async generatePrivacyImpactAssessment(project: ProjectDetails): Promise<PrivacyImpactAssessment> {
    const pia: PrivacyImpactAssessment = {
      projectId: project.id,
      projectName: project.name,
      assessmentDate: new Date(),
      dataFlows: await this.analyzeDataFlows(project),
      riskAssessment: await this.assessPrivacyRisks(project),
      mitigationMeasures: await this.recommendMitigationMeasures(project),
      complianceGaps: await this.identifyComplianceGaps(project),
      conclusions: [],
      reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    };

    // Generate conclusions based on assessment
    pia.conclusions = this.generatePIAConclusions(pia);

    return pia;
  }

  // Automated consent management
  validateConsent(consentRecord: ConsentRecord): ConsentValidationResult {
    const validation: ConsentValidationResult = {
      isValid: true,
      issues: [],
      recommendations: [],
      expiryDate: consentRecord.expiryDate
    };

    // Check consent freshness
    if (consentRecord.expiryDate && consentRecord.expiryDate < new Date()) {
      validation.isValid = false;
      validation.issues.push('Consent has expired');
      validation.recommendations.push('Request fresh consent from user');
    }

    // Check consent specificity
    if (!consentRecord.purposes || consentRecord.purposes.length === 0) {
      validation.isValid = false;
      validation.issues.push('No specific purposes defined');
      validation.recommendations.push('Define specific purposes for data processing');
    }

    // Check consent withdrawal mechanism
    if (!consentRecord.withdrawalMechanism) {
      validation.issues.push('No withdrawal mechanism specified');
      validation.recommendations.push('Implement easy consent withdrawal process');
    }

    // Check legal basis
    if (!consentRecord.legalBasis) {
      validation.isValid = false;
      validation.issues.push('No legal basis specified');
      validation.recommendations.push('Specify legal basis for processing');
    }

    return validation;
  }

  // Data subject rights management
  async processDataSubjectRequest(request: DataSubjectRequest): Promise<DataSubjectRequestResult> {
    const result: DataSubjectRequestResult = {
      requestId: request.id,
      requestType: request.type,
      status: 'processing',
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      requiredVerification: this.determineVerificationRequirements(request),
      dataLocations: await this.locateUserData(request.userId),
      processingSteps: []
    };

    // Handle different types of requests
    switch (request.type) {
      case 'access':
        result.processingSteps = await this.processAccessRequest(request);
        break;
      case 'deletion':
        result.processingSteps = await this.processDeletionRequest(request);
        break;
      case 'portability':
        result.processingSteps = await this.processPortabilityRequest(request);
        break;
      case 'rectification':
        result.processingSteps = await this.processRectificationRequest(request);
        break;
    }

    // Update status based on processing
    result.status = result.processingSteps.every(step => step.completed) ? 'completed' : 'processing';

    return result;
  }

  // Cross-border transfer assessment
  assessCrossBorderTransfer(transfer: CrossBorderTransfer): TransferAssessment {
    const assessment: TransferAssessment = {
      transferId: transfer.id,
      fromRegion: transfer.sourceCountry,
      toRegion: transfer.destinationCountry,
      isPermitted: false,
      legalBasis: null,
      additionalSafeguards: [],
      restrictions: [],
      riskLevel: 'high'
    };

    // Check for adequacy decisions
    const adequacyDecision = this.checkAdequacyDecision(transfer.sourceCountry, transfer.destinationCountry);
    if (adequacyDecision) {
      assessment.isPermitted = true;
      assessment.legalBasis = 'adequacy_decision';
      assessment.riskLevel = 'low';
    } else {
      // Require additional safeguards
      assessment.additionalSafeguards = [
        'standard_contractual_clauses',
        'binding_corporate_rules',
        'specific_authorization'
      ];
      assessment.restrictions = [
        'enhanced_monitoring_required',
        'additional_consent_required',
        'regular_assessment_mandatory'
      ];
    }

    return assessment;
  }

  // Breach notification management
  async processDataBreach(breach: DataBreachIncident): Promise<BreachNotificationResult> {
    const notificationResult: BreachNotificationResult = {
      breachId: breach.id,
      severity: this.assessBreachSeverity(breach),
      notificationRequired: false,
      timelineRequirements: new Map(),
      notificationRecipients: [],
      reportingSteps: []
    };

    // Determine notification requirements based on applicable regulations
    const affectedRegulations = this.getRegulationsForBreach(breach);
    
    for (const regulation of affectedRegulations) {
      const timeline = this.getBreachNotificationTimeline(regulation);
      notificationResult.timelineRequirements.set(regulation.id, timeline);
      
      if (this.requiresBreachNotification(breach, regulation)) {
        notificationResult.notificationRequired = true;
        notificationResult.notificationRecipients.push(
          ...this.getNotificationRecipients(regulation)
        );
      }
    }

    // Generate reporting steps
    notificationResult.reportingSteps = this.generateBreachReportingSteps(breach, affectedRegulations);

    return notificationResult;
  }

  // Private helper methods
  private getApplicableRegulations(userLocation: string, dataLocation: string): RegulationFramework[] {
    const applicable: RegulationFramework[] = [];
    
    // Add regulations based on user location
    if (userLocation.startsWith('EU') || ['DE', 'FR', 'IT', 'ES', 'NL'].includes(userLocation)) {
      const gdpr = this.regulations.get('EU-GDPR');
      if (gdpr) applicable.push(gdpr);
    }
    
    if (userLocation === 'US-CA') {
      const ccpa = this.regulations.get('US-CCPA');
      if (ccpa) applicable.push(ccpa);
    }
    
    if (userLocation === 'CN') {
      const pipl = this.regulations.get('CN-PIPL');
      if (pipl) applicable.push(pipl);
    }
    
    if (userLocation === 'UK') {
      const ukGdpr = this.regulations.get('UK-GDPR');
      if (ukGdpr) applicable.push(ukGdpr);
    }

    return applicable;
  }

  private async performComplianceCheck(activity: DataProcessingActivity, regulation: RegulationFramework): Promise<ComplianceCheckResult> {
    const issues: string[] = [];
    const requiredActions: string[] = [];

    // Check each requirement
    for (const requirement of regulation.requirements) {
      const checkPassed = await this.checkSpecificRequirement(activity, requirement, regulation);
      if (!checkPassed) {
        issues.push(`Failed ${requirement} requirement`);
        requiredActions.push(this.getActionForRequirement(requirement));
      }
    }

    return {
      regulationId: regulation.id,
      isCompliant: issues.length === 0,
      issues,
      requiredActions,
      lastChecked: new Date()
    };
  }

  private async checkSpecificRequirement(activity: DataProcessingActivity, requirement: string, regulation: RegulationFramework): Promise<boolean> {
    // Simplified requirement checking logic
    switch (requirement) {
      case 'consent_management':
        return activity.hasValidConsent;
      case 'data_minimization':
        return activity.dataFields.length <= 10; // Simplified check
      case 'purpose_limitation':
        return activity.purposes.length > 0;
      default:
        return true; // Default to compliant for unknown requirements
    }
  }

  private getActionForRequirement(requirement: string): string {
    const actions: { [key: string]: string } = {
      'consent_management': 'Implement proper consent collection and management',
      'data_minimization': 'Reduce data collection to necessary minimum',
      'purpose_limitation': 'Define specific purposes for data processing',
      'right_to_erasure': 'Implement data deletion mechanisms',
      'data_portability': 'Enable data export functionality'
    };
    
    return actions[requirement] || `Address ${requirement} requirement`;
  }

  private calculateRiskLevel(results: ComplianceCheckResult[]): 'low' | 'medium' | 'high' {
    const nonCompliantCount = results.filter(r => !r.isCompliant).length;
    if (nonCompliantCount === 0) return 'low';
    if (nonCompliantCount <= 2) return 'medium';
    return 'high';
  }

  private aggregateRequiredActions(results: ComplianceCheckResult[]): string[] {
    const actions = new Set<string>();
    results.forEach(result => {
      result.requiredActions.forEach(action => actions.add(action));
    });
    return Array.from(actions);
  }

  private logComplianceCheck(activity: DataProcessingActivity, result: ComplianceResult): void {
    this.auditLogs.push({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      activityType: 'compliance_check',
      activityId: activity.id,
      userId: activity.userId,
      result: result.isCompliant ? 'compliant' : 'non_compliant',
      details: {
        regulations: result.regulationResults.map(r => r.regulationId),
        issues: result.regulationResults.flatMap(r => r.issues),
        riskLevel: result.riskLevel
      }
    });
  }

  // Additional helper methods for comprehensive compliance management
  private async analyzeDataFlows(project: ProjectDetails): Promise<DataFlow[]> {
    // Simplified data flow analysis
    return [
      {
        id: 'flow_1',
        source: 'user_input',
        destination: 'database',
        dataTypes: project.dataTypes,
        purpose: 'identity_verification'
      }
    ];
  }

  private async assessPrivacyRisks(project: ProjectDetails): Promise<RiskAssessment[]> {
    return [
      {
        riskId: 'risk_1',
        description: 'Unauthorized access to personal data',
        likelihood: 'medium',
        impact: 'high',
        overallRisk: 'high'
      }
    ];
  }

  private async recommendMitigationMeasures(project: ProjectDetails): Promise<MitigationMeasure[]> {
    return [
      {
        measureId: 'measure_1',
        description: 'Implement end-to-end encryption',
        effectiveness: 'high',
        implementationCost: 'medium'
      }
    ];
  }

  private async identifyComplianceGaps(project: ProjectDetails): Promise<ComplianceGap[]> {
    return [
      {
        gapId: 'gap_1',
        regulation: 'EU-GDPR',
        requirement: 'privacy_by_design',
        currentState: 'partial',
        requiredState: 'full',
        priority: 'high'
      }
    ];
  }

  private generatePIAConclusions(pia: PrivacyImpactAssessment): string[] {
    const conclusions: string[] = [];
    
    if (pia.riskAssessment.some(risk => risk.overallRisk === 'high')) {
      conclusions.push('High privacy risks identified requiring immediate mitigation');
    }
    
    if (pia.complianceGaps.length > 0) {
      conclusions.push('Compliance gaps identified requiring remediation');
    }
    
    conclusions.push('Regular review and monitoring required');
    
    return conclusions;
  }

  // Get compliance statistics
  getComplianceStatistics(): ComplianceStatistics {
    return {
      totalRegulations: this.regulations.size,
      totalChecks: this.auditLogs.length,
      complianceRate: this.calculateOverallComplianceRate(),
      riskDistribution: this.calculateRiskDistribution(),
      topIssues: this.getTopComplianceIssues()
    };
  }

  private calculateOverallComplianceRate(): number {
    const compliantChecks = this.auditLogs.filter(log => log.result === 'compliant').length;
    return this.auditLogs.length > 0 ? (compliantChecks / this.auditLogs.length) * 100 : 100;
  }

  private calculateRiskDistribution(): { low: number; medium: number; high: number } {
    // Simplified risk distribution calculation
    return { low: 60, medium: 30, high: 10 };
  }

  private getTopComplianceIssues(): string[] {
    // Simplified top issues
    return [
      'Consent management gaps',
      'Data retention violations',
      'Cross-border transfer issues'
    ];
  }

  // Additional compliance-related methods would be implemented here...
  private checkAdequacyDecision(source: string, destination: string): boolean {
    // Simplified adequacy decision check
    const adequateCountries = ['US', 'UK', 'JP', 'KR', 'NZ', 'CA'];
    return adequateCountries.includes(destination);
  }

  private assessBreachSeverity(breach: DataBreachIncident): 'low' | 'medium' | 'high' | 'critical' {
    if (breach.affectedRecords > 10000) return 'critical';
    if (breach.affectedRecords > 1000) return 'high';
    if (breach.affectedRecords > 100) return 'medium';
    return 'low';
  }

  private getRegulationsForBreach(breach: DataBreachIncident): RegulationFramework[] {
    // Return applicable regulations based on breach scope
    return Array.from(this.regulations.values());
  }

  private requiresBreachNotification(breach: DataBreachIncident, regulation: RegulationFramework): boolean {
    // Simplified notification requirement check
    return breach.affectedRecords > 250; // GDPR threshold
  }

  private getBreachNotificationTimeline(regulation: RegulationFramework): number {
    // Return hours within which notification is required
    const timelines: { [key: string]: number } = {
      'EU-GDPR': 72,
      'US-CCPA': 72,
      'CN-PIPL': 72,
      'UK-GDPR': 72
    };
    return timelines[regulation.id] || 72;
  }

  private getNotificationRecipients(regulation: RegulationFramework): string[] {
    const recipients: { [key: string]: string[] } = {
      'EU-GDPR': ['supervisory_authority', 'data_subjects'],
      'US-CCPA': ['attorney_general', 'affected_consumers'],
      'CN-PIPL': ['cyberspace_administration', 'affected_individuals'],
      'UK-GDPR': ['ico', 'data_subjects']
    };
    return recipients[regulation.id] || ['supervisory_authority'];
  }

  private generateBreachReportingSteps(breach: DataBreachIncident, regulations: RegulationFramework[]): ReportingStep[] {
    return [
      {
        step: 1,
        description: 'Document breach details and timeline',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        completed: false
      },
      {
        step: 2,
        description: 'Notify supervisory authorities',
        deadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
        completed: false
      },
      {
        step: 3,
        description: 'Notify affected individuals if high risk',
        deadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
        completed: false
      }
    ];
  }

  private determineVerificationRequirements(request: DataSubjectRequest): string[] {
    // Basic verification requirements
    return ['identity_verification', 'request_authenticity'];
  }

  private async locateUserData(userId: string): Promise<string[]> {
    // Simplified data location discovery
    return ['primary_database', 'backup_storage', 'analytics_warehouse'];
  }

  private async processAccessRequest(request: DataSubjectRequest): Promise<ProcessingStep[]> {
    return [
      { description: 'Locate all user data', completed: false, estimatedTime: 24 },
      { description: 'Compile data export', completed: false, estimatedTime: 48 },
      { description: 'Review for third-party data', completed: false, estimatedTime: 24 },
      { description: 'Deliver to user', completed: false, estimatedTime: 24 }
    ];
  }

  private async processDeletionRequest(request: DataSubjectRequest): Promise<ProcessingStep[]> {
    return [
      { description: 'Verify deletion eligibility', completed: false, estimatedTime: 24 },
      { description: 'Delete from primary systems', completed: false, estimatedTime: 48 },
      { description: 'Delete from backups', completed: false, estimatedTime: 72 },
      { description: 'Confirm complete deletion', completed: false, estimatedTime: 24 }
    ];
  }

  private async processPortabilityRequest(request: DataSubjectRequest): Promise<ProcessingStep[]> {
    return [
      { description: 'Extract user data in structured format', completed: false, estimatedTime: 48 },
      { description: 'Convert to machine-readable format', completed: false, estimatedTime: 24 },
      { description: 'Package for transfer', completed: false, estimatedTime: 24 }
    ];
  }

  private async processRectificationRequest(request: DataSubjectRequest): Promise<ProcessingStep[]> {
    return [
      { description: 'Verify correction requests', completed: false, estimatedTime: 24 },
      { description: 'Update primary records', completed: false, estimatedTime: 24 },
      { description: 'Propagate changes to dependent systems', completed: false, estimatedTime: 48 }
    ];
  }
}

// Type definitions for compliance system
interface RegulationFramework {
  id: string;
  name: string;
  region: string;
  version: string;
  requirements: string[];
  dataRetentionLimits: {
    personalData: number;
    consentRecords: number;
    auditLogs: number;
  };
  fines: {
    max: number;
    percentage: number;
  };
  lastUpdated: Date;
}

interface DataProcessingActivity {
  id: string;
  userId: string;
  activityType: string;
  dataFields: string[];
  purposes: string[];
  userLocation: string;
  dataLocation: string;
  hasValidConsent: boolean;
  timestamp: Date;
}

interface ComplianceResult {
  activityId: string;
  isCompliant: boolean;
  regulationResults: ComplianceCheckResult[];
  requiredActions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: Date;
}

interface ComplianceCheckResult {
  regulationId: string;
  isCompliant: boolean;
  issues: string[];
  requiredActions: string[];
  lastChecked: Date;
}

interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  applicableRegulations: string[];
  checkFunction: (activity: DataProcessingActivity) => Promise<boolean>;
}

interface ComplianceAuditLog {
  id: string;
  timestamp: Date;
  activityType: string;
  activityId: string;
  userId: string;
  result: 'compliant' | 'non_compliant';
  details: any;
}

interface PrivacyImpactAssessment {
  projectId: string;
  projectName: string;
  assessmentDate: Date;
  dataFlows: DataFlow[];
  riskAssessment: RiskAssessment[];
  mitigationMeasures: MitigationMeasure[];
  complianceGaps: ComplianceGap[];
  conclusions: string[];
  reviewDate: Date;
}

interface ProjectDetails {
  id: string;
  name: string;
  dataTypes: string[];
  purposes: string[];
  userRegions: string[];
}

interface DataFlow {
  id: string;
  source: string;
  destination: string;
  dataTypes: string[];
  purpose: string;
}

interface RiskAssessment {
  riskId: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  overallRisk: 'low' | 'medium' | 'high';
}

interface MitigationMeasure {
  measureId: string;
  description: string;
  effectiveness: 'low' | 'medium' | 'high';
  implementationCost: 'low' | 'medium' | 'high';
}

interface ComplianceGap {
  gapId: string;
  regulation: string;
  requirement: string;
  currentState: string;
  requiredState: string;
  priority: 'low' | 'medium' | 'high';
}

interface ConsentRecord {
  id: string;
  userId: string;
  purposes: string[];
  legalBasis: string;
  consentDate: Date;
  expiryDate: Date | null;
  withdrawalMechanism: string | null;
  version: string;
}

interface ConsentValidationResult {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  expiryDate: Date | null;
}

interface DataSubjectRequest {
  id: string;
  userId: string;
  type: 'access' | 'deletion' | 'portability' | 'rectification';
  details: string;
  requestDate: Date;
  urgency: 'normal' | 'high';
}

interface DataSubjectRequestResult {
  requestId: string;
  requestType: string;
  status: 'received' | 'processing' | 'completed' | 'rejected';
  estimatedCompletion: Date;
  requiredVerification: string[];
  dataLocations: string[];
  processingSteps: ProcessingStep[];
}

interface ProcessingStep {
  description: string;
  completed: boolean;
  estimatedTime: number; // hours
}

interface CrossBorderTransfer {
  id: string;
  sourceCountry: string;
  destinationCountry: string;
  dataTypes: string[];
  purpose: string;
  transferDate: Date;
}

interface TransferAssessment {
  transferId: string;
  fromRegion: string;
  toRegion: string;
  isPermitted: boolean;
  legalBasis: string | null;
  additionalSafeguards: string[];
  restrictions: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface DataBreachIncident {
  id: string;
  description: string;
  breachDate: Date;
  discoveredDate: Date;
  affectedRecords: number;
  dataTypes: string[];
  cause: string;
  containmentMeasures: string[];
}

interface BreachNotificationResult {
  breachId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notificationRequired: boolean;
  timelineRequirements: Map<string, number>;
  notificationRecipients: string[];
  reportingSteps: ReportingStep[];
}

interface ReportingStep {
  step: number;
  description: string;
  deadline: Date;
  completed: boolean;
}

interface ComplianceStatistics {
  totalRegulations: number;
  totalChecks: number;
  complianceRate: number;
  riskDistribution: { low: number; medium: number; high: number };
  topIssues: string[];
}

export const complianceEngine = ComplianceEngine.getInstance();