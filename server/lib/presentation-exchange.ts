/**
 * DIF Presentation Exchange Implementation
 * Selective disclosure, transport-agnostic design, and credential presentation workflows
 * Supporting W3C Verifiable Presentations and OpenID4VP standards
 */

import crypto from 'crypto';
import { performance } from 'perf_hooks';
import winston from 'winston';
import { EnhancedZKPSystem } from './enhanced-zkp';
import { ZKWalletFoundation } from './zk-wallet-foundation';

// Presentation Exchange types following DIF PE v2.0 specification
export interface PresentationDefinition {
  id: string;
  name?: string;
  purpose?: string;
  format?: Format;
  input_descriptors: InputDescriptor[];
  submission_requirements?: SubmissionRequirement[];
  frame?: any; // JSON-LD framing for selective disclosure
}

export interface InputDescriptor {
  id: string;
  name?: string;
  purpose?: string;
  group?: string[];
  format?: Format;
  constraints: Constraints;
  schema?: Schema[];
}

export interface Constraints {
  fields?: Field[];
  limit_disclosure?: 'required' | 'preferred';
  statuses?: StatusConstraint;
  subject_is_issuer?: 'required' | 'preferred';
  is_holder?: IsHolderConstraint[];
}

export interface Field {
  path: string[];
  id?: string;
  purpose?: string;
  name?: string;
  filter?: JsonSchemaFilter;
  predicate?: 'required' | 'preferred';
  intent_to_retain?: boolean;
}

export interface JsonSchemaFilter {
  type?: string;
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  enum?: any[];
  const?: any;
  not?: JsonSchemaFilter;
  allOf?: JsonSchemaFilter[];
  oneOf?: JsonSchemaFilter[];
  anyOf?: JsonSchemaFilter[];
}

export interface StatusConstraint {
  active?: DirectiveConstraint;
  suspended?: DirectiveConstraint;
  revoked?: DirectiveConstraint;
}

export interface DirectiveConstraint {
  directive: 'required' | 'allowed' | 'disallowed';
}

export interface IsHolderConstraint {
  field_id: string[];
  directive: 'required' | 'preferred';
}

export interface Format {
  jwt?: AlgOrProofType;
  jwt_vc?: AlgOrProofType;
  jwt_vp?: AlgOrProofType;
  ldp_vc?: AlgOrProofType;
  ldp_vp?: AlgOrProofType;
  ldp?: AlgOrProofType;
  ac_vc?: AlgOrProofType;
  ac_vp?: AlgOrProofType;
  mso_mdoc?: AlgOrProofType;
}

export interface AlgOrProofType {
  alg?: string[];
  proof_type?: string[];
}

export interface Schema {
  uri: string;
  required?: boolean;
}

export interface SubmissionRequirement {
  name?: string;
  purpose?: string;
  rule: 'all' | 'pick';
  count?: number;
  min?: number;
  max?: number;
  from?: string;
  from_nested?: SubmissionRequirement[];
}

export interface PresentationSubmission {
  id: string;
  definition_id: string;
  descriptor_map: DescriptorMap[];
}

export interface DescriptorMap {
  id: string;
  format: string;
  path: string;
  path_nested?: DescriptorMap;
}

export interface VerifiablePresentation {
  '@context': string[];
  type: string[];
  id?: string;
  holder?: string;
  verifiableCredential: any[];
  proof?: any;
  presentation_submission?: PresentationSubmission;
}

export interface SelectiveDisclosureConfig {
  enabled: boolean;
  method: 'bbs+' | 'sd-jwt' | 'zcaps' | 'zk-proof';
  fields: string[];
  predicates: DisclosurePredicate[];
  privacy_level: 'minimal' | 'selective' | 'full';
}

export interface DisclosurePredicate {
  field: string;
  operation: 'reveal' | 'hide' | 'prove-range' | 'prove-membership' | 'prove-equality';
  value?: any;
  range?: { min?: number; max?: number };
}

export interface TransportConfig {
  method: 'qr' | 'deeplink' | 'redirect' | 'post' | 'websocket' | 'bluetooth';
  endpoint?: string;
  encryption: boolean;
  compression: boolean;
  chunking: boolean;
  timeout: number;
}

export interface PresentationExchangeSession {
  sessionId: string;
  definition: PresentationDefinition;
  holder: string;
  verifier: string;
  status: 'initiated' | 'credentials-selected' | 'presentation-created' | 'submitted' | 'verified' | 'rejected';
  transport: TransportConfig;
  selective_disclosure: SelectiveDisclosureConfig;
  created: Date;
  expires: Date;
  metadata: {
    request_uri?: string;
    response_uri?: string;
    client_id?: string;
    nonce?: string;
    state?: string;
  };
}

export interface CredentialMatch {
  credential: any;
  input_descriptor_id: string;
  match_score: number;
  missing_fields: string[];
  warnings: string[];
  selective_disclosure: DisclosureCapability;
}

export interface DisclosureCapability {
  supported: boolean;
  method: string;
  selective_fields: string[];
  predicates_supported: string[];
}

export interface PresentationResult {
  success: boolean;
  presentation?: VerifiablePresentation;
  errors: string[];
  warnings: string[];
  metadata: {
    processing_time: number;
    credentials_used: number;
    selective_disclosure_applied: boolean;
    transport_method: string;
    privacy_level: string;
  };
}

// Presentation Exchange logger
const peLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/presentation-exchange.log' }),
    new winston.transports.Console()
  ]
});

export class PresentationExchangeManager {
  private static instance: PresentationExchangeManager;
  private zkpSystem: EnhancedZKPSystem;
  private walletFoundation: ZKWalletFoundation;
  private activeSessions: Map<string, PresentationExchangeSession> = new Map();
  private definitionRegistry: Map<string, PresentationDefinition> = new Map();
  private credentialMatchers: Map<string, CredentialMatcher> = new Map();
  private transportHandlers: Map<string, TransportHandler> = new Map();
  private readonly VERSION = '8.0.0-presentation-exchange';

  constructor() {
    this.zkpSystem = EnhancedZKPSystem.getInstance();
    this.walletFoundation = ZKWalletFoundation.getInstance();
    this.initializePresentationExchange();
  }

  static getInstance(): PresentationExchangeManager {
    if (!PresentationExchangeManager.instance) {
      PresentationExchangeManager.instance = new PresentationExchangeManager();
    }
    return PresentationExchangeManager.instance;
  }

  private async initializePresentationExchange(): Promise<void> {
    peLogger.info('Initializing DIF Presentation Exchange Manager', { 
      version: this.VERSION 
    });

    // Initialize credential matchers
    await this.setupCredentialMatchers();

    // Setup transport handlers
    await this.setupTransportHandlers();

    // Create default presentation definitions
    await this.createDefaultPresentationDefinitions();

    peLogger.info('DIF Presentation Exchange Manager initialized successfully');
  }

  // Main Presentation Exchange Flow
  async createPresentationRequest(
    definition: PresentationDefinition,
    verifier: string,
    transport: TransportConfig,
    selectiveDisclosure?: SelectiveDisclosureConfig
  ): Promise<{
    sessionId: string;
    requestUri: string;
    qrCode?: string;
    deepLink?: string;
  }> {
    const sessionId = this.generateSessionId();
    
    peLogger.info('Creating presentation request', {
      sessionId,
      definitionId: definition.id,
      verifier,
      transport: transport.method
    });

    // Create session
    const session: PresentationExchangeSession = {
      sessionId,
      definition,
      holder: '', // Will be set when holder responds
      verifier,
      status: 'initiated',
      transport,
      selective_disclosure: selectiveDisclosure || {
        enabled: false,
        method: 'bbs+',
        fields: [],
        predicates: [],
        privacy_level: 'full'
      },
      created: new Date(),
      expires: new Date(Date.now() + transport.timeout),
      metadata: {
        nonce: crypto.randomBytes(16).toString('hex'),
        state: crypto.randomBytes(16).toString('hex')
      }
    };

    this.activeSessions.set(sessionId, session);

    // Generate request URI
    const requestUri = await this.generateRequestUri(session);
    session.metadata.request_uri = requestUri;

    // Generate transport-specific formats
    let qrCode: string | undefined;
    let deepLink: string | undefined;

    if (transport.method === 'qr') {
      qrCode = await this.generateQRCode(requestUri);
    }

    if (transport.method === 'deeplink') {
      deepLink = await this.generateDeepLink(requestUri);
    }

    peLogger.info('Presentation request created', {
      sessionId,
      requestUri,
      hasQR: !!qrCode,
      hasDeepLink: !!deepLink
    });

    return { sessionId, requestUri, qrCode, deepLink };
  }

  async processHolderResponse(
    sessionId: string,
    holderCredentials: any[],
    holderDid: string
  ): Promise<PresentationResult> {
    const startTime = performance.now();
    
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.expires < new Date()) {
      throw new Error(`Session expired: ${sessionId}`);
    }

    peLogger.info('Processing holder response', {
      sessionId,
      holderDid,
      credentialCount: holderCredentials.length
    });

    try {
      // Update session
      session.holder = holderDid;
      session.status = 'credentials-selected';

      // Match credentials to input descriptors
      const matches = await this.matchCredentials(
        holderCredentials,
        session.definition.input_descriptors,
        session.selective_disclosure
      );

      // Validate submission requirements
      const validSubmission = await this.validateSubmissionRequirements(
        matches,
        session.definition.submission_requirements || []
      );

      if (!validSubmission.valid) {
        throw new Error(`Submission requirements not met: ${validSubmission.reason}`);
      }

      // Create presentation
      session.status = 'presentation-created';
      const presentation = await this.createVerifiablePresentation(
        matches,
        session,
        holderDid
      );

      session.status = 'submitted';

      const processingTime = performance.now() - startTime;

      const result: PresentationResult = {
        success: true,
        presentation,
        errors: [],
        warnings: matches.flatMap(m => m.warnings),
        metadata: {
          processing_time: processingTime,
          credentials_used: matches.length,
          selective_disclosure_applied: session.selective_disclosure.enabled,
          transport_method: session.transport.method,
          privacy_level: session.selective_disclosure.privacy_level
        }
      };

      peLogger.info('Holder response processed successfully', {
        sessionId,
        processingTime: Math.round(processingTime),
        credentialsUsed: matches.length,
        selectiveDisclosure: session.selective_disclosure.enabled
      });

      return result;

    } catch (error) {
      session.status = 'rejected';
      
      peLogger.error('Failed to process holder response', {
        sessionId,
        error: error.message
      });

      return {
        success: false,
        errors: [error.message],
        warnings: [],
        metadata: {
          processing_time: performance.now() - startTime,
          credentials_used: 0,
          selective_disclosure_applied: false,
          transport_method: session.transport.method,
          privacy_level: 'none'
        }
      };
    }
  }

  async verifyPresentation(
    sessionId: string,
    presentation: VerifiablePresentation
  ): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    claims: any;
    disclosed_fields: string[];
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    peLogger.info('Verifying presentation', {
      sessionId,
      presentationId: presentation.id,
      credentialCount: presentation.verifiableCredential.length
    });

    try {
      // Verify presentation structure
      const structureValid = await this.verifyPresentationStructure(
        presentation,
        session.definition
      );

      if (!structureValid.valid) {
        throw new Error(`Invalid presentation structure: ${structureValid.errors.join(', ')}`);
      }

      // Verify credential proofs
      const proofResults = await this.verifyCredentialProofs(
        presentation.verifiableCredential
      );

      // Extract claims based on selective disclosure
      const claims = await this.extractClaims(
        presentation,
        session.selective_disclosure
      );

      // Get disclosed fields
      const disclosedFields = await this.getDisclosedFields(
        presentation,
        session.selective_disclosure
      );

      // Verify against presentation definition
      const definitionCheck = await this.verifyAgainstDefinition(
        presentation,
        session.definition
      );

      session.status = 'verified';

      const allValid = structureValid.valid && 
                      proofResults.every(r => r.valid) && 
                      definitionCheck.valid;

      const allErrors = [
        ...structureValid.errors,
        ...proofResults.flatMap(r => r.errors),
        ...definitionCheck.errors
      ];

      const allWarnings = [
        ...structureValid.warnings,
        ...proofResults.flatMap(r => r.warnings),
        ...definitionCheck.warnings
      ];

      peLogger.info('Presentation verification completed', {
        sessionId,
        valid: allValid,
        errorCount: allErrors.length,
        warningCount: allWarnings.length,
        claimCount: Object.keys(claims).length
      });

      return {
        valid: allValid,
        errors: allErrors,
        warnings: allWarnings,
        claims,
        disclosed_fields: disclosedFields
      };

    } catch (error) {
      peLogger.error('Presentation verification failed', {
        sessionId,
        error: error.message
      });

      return {
        valid: false,
        errors: [error.message],
        warnings: [],
        claims: {},
        disclosed_fields: []
      };
    }
  }

  // Credential Matching
  private async matchCredentials(
    holderCredentials: any[],
    inputDescriptors: InputDescriptor[],
    selectiveDisclosure: SelectiveDisclosureConfig
  ): Promise<CredentialMatch[]> {
    const matches: CredentialMatch[] = [];

    for (const descriptor of inputDescriptors) {
      const matcher = this.credentialMatchers.get(descriptor.format?.ldp_vc?.proof_type?.[0] || 'default');
      if (!matcher) {
        continue;
      }

      for (const credential of holderCredentials) {
        const match = await matcher.match(credential, descriptor, selectiveDisclosure);
        if (match.match_score > 0.7) { // 70% match threshold
          matches.push(match);
        }
      }
    }

    // Sort by match score and remove duplicates
    return matches
      .sort((a, b) => b.match_score - a.match_score)
      .filter((match, index, arr) => 
        arr.findIndex(m => m.input_descriptor_id === match.input_descriptor_id) === index
      );
  }

  private async validateSubmissionRequirements(
    matches: CredentialMatch[],
    requirements: SubmissionRequirement[]
  ): Promise<{ valid: boolean; reason?: string }> {
    if (requirements.length === 0) {
      return { valid: true };
    }

    for (const requirement of requirements) {
      const result = await this.validateSingleRequirement(requirement, matches);
      if (!result.valid) {
        return result;
      }
    }

    return { valid: true };
  }

  private async validateSingleRequirement(
    requirement: SubmissionRequirement,
    matches: CredentialMatch[]
  ): Promise<{ valid: boolean; reason?: string }> {
    if (requirement.rule === 'all') {
      // All descriptors must be satisfied
      return { valid: matches.length > 0 };
    }

    if (requirement.rule === 'pick') {
      const count = requirement.count || requirement.min || 1;
      const maxCount = requirement.max || matches.length;
      
      if (matches.length < count) {
        return { 
          valid: false, 
          reason: `Insufficient matches: got ${matches.length}, need ${count}` 
        };
      }

      if (matches.length > maxCount) {
        return { 
          valid: false, 
          reason: `Too many matches: got ${matches.length}, max ${maxCount}` 
        };
      }
    }

    return { valid: true };
  }

  // Verifiable Presentation Creation
  private async createVerifiablePresentation(
    matches: CredentialMatch[],
    session: PresentationExchangeSession,
    holderDid: string
  ): Promise<VerifiablePresentation> {
    const presentationId = `presentation:${session.sessionId}`;

    // Apply selective disclosure to credentials
    const disclosedCredentials = await this.applySelectiveDisclosure(
      matches,
      session.selective_disclosure
    );

    // Create descriptor map for presentation submission
    const descriptorMap: DescriptorMap[] = matches.map((match, index) => ({
      id: match.input_descriptor_id,
      format: 'ldp_vc',
      path: `$.verifiableCredential[${index}]`
    }));

    const presentationSubmission: PresentationSubmission = {
      id: crypto.randomBytes(16).toString('hex'),
      definition_id: session.definition.id,
      descriptor_map: descriptorMap
    };

    // Create the presentation
    const presentation: VerifiablePresentation = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://identity.foundation/presentation-exchange/submission/v1'
      ],
      type: ['VerifiablePresentation', 'PresentationSubmission'],
      id: presentationId,
      holder: holderDid,
      verifiableCredential: disclosedCredentials,
      presentation_submission: presentationSubmission
    };

    // Create proof for the presentation
    if (session.selective_disclosure.method === 'zk-proof') {
      presentation.proof = await this.createZKProofForPresentation(
        presentation,
        session,
        holderDid
      );
    } else {
      presentation.proof = await this.createStandardProofForPresentation(
        presentation,
        holderDid
      );
    }

    return presentation;
  }

  private async applySelectiveDisclosure(
    matches: CredentialMatch[],
    config: SelectiveDisclosureConfig
  ): Promise<any[]> {
    if (!config.enabled) {
      return matches.map(m => m.credential);
    }

    const disclosedCredentials = [];

    for (const match of matches) {
      let credential = { ...match.credential };

      switch (config.method) {
        case 'bbs+':
          credential = await this.applyBBSSelectiveDisclosure(credential, config);
          break;
        case 'sd-jwt':
          credential = await this.applySDJWTSelectiveDisclosure(credential, config);
          break;
        case 'zk-proof':
          credential = await this.applyZKSelectiveDisclosure(credential, config);
          break;
        default:
          // Standard field filtering
          credential = this.filterCredentialFields(credential, config.fields);
      }

      disclosedCredentials.push(credential);
    }

    return disclosedCredentials;
  }

  private async applyBBSSelectiveDisclosure(credential: any, config: SelectiveDisclosureConfig): Promise<any> {
    // Implement BBS+ selective disclosure
    peLogger.debug('Applying BBS+ selective disclosure');
    
    // Simplified implementation - would integrate with actual BBS+ library
    const disclosed = { ...credential };
    
    // Remove fields not in disclosure list
    for (const key of Object.keys(disclosed.credentialSubject)) {
      if (!config.fields.includes(key)) {
        delete disclosed.credentialSubject[key];
      }
    }

    return disclosed;
  }

  private async applySDJWTSelectiveDisclosure(credential: any, config: SelectiveDisclosureConfig): Promise<any> {
    // Implement SD-JWT selective disclosure
    peLogger.debug('Applying SD-JWT selective disclosure');
    
    // Simplified implementation - would integrate with actual SD-JWT library
    return this.filterCredentialFields(credential, config.fields);
  }

  private async applyZKSelectiveDisclosure(credential: any, config: SelectiveDisclosureConfig): Promise<any> {
    // Implement zero-knowledge selective disclosure
    peLogger.debug('Applying ZK selective disclosure');
    
    const zkProof = await this.zkpSystem.generateProof({
      circuitId: 'selective_disclosure',
      inputs: {
        credential: JSON.stringify(credential),
        disclosed_fields: config.fields,
        predicates: config.predicates
      },
      proofId: `sd-${Date.now()}`,
      context: 'selective-disclosure'
    });

    return {
      type: ['VerifiableCredential', 'ZKSelectiveDisclosure'],
      zkProof: zkProof.proof,
      disclosedFields: config.fields,
      predicates: config.predicates
    };
  }

  private filterCredentialFields(credential: any, allowedFields: string[]): any {
    const filtered = { ...credential };
    
    if (filtered.credentialSubject) {
      const filteredSubject: any = {};
      for (const field of allowedFields) {
        if (filtered.credentialSubject[field] !== undefined) {
          filteredSubject[field] = filtered.credentialSubject[field];
        }
      }
      filtered.credentialSubject = filteredSubject;
    }

    return filtered;
  }

  // Proof Creation
  private async createZKProofForPresentation(
    presentation: VerifiablePresentation,
    session: PresentationExchangeSession,
    holderDid: string
  ): Promise<any> {
    const zkProof = await this.zkpSystem.generateProof({
      circuitId: 'presentation_proof',
      inputs: {
        presentation: JSON.stringify(presentation),
        definition: JSON.stringify(session.definition),
        holder: holderDid,
        nonce: session.metadata.nonce,
        timestamp: Date.now()
      },
      proofId: `presentation-${session.sessionId}`,
      context: 'presentation-exchange'
    });

    return {
      type: 'ZKProof2024',
      created: new Date().toISOString(),
      verificationMethod: `${holderDid}#keys-1`,
      proofPurpose: 'assertionMethod',
      zkProof: zkProof.proof,
      publicSignals: zkProof.publicSignals
    };
  }

  private async createStandardProofForPresentation(
    presentation: VerifiablePresentation,
    holderDid: string
  ): Promise<any> {
    // Create standard cryptographic proof
    const canonical = JSON.stringify(presentation, Object.keys(presentation).sort());
    const hash = crypto.createHash('sha256').update(canonical).digest('hex');
    
    return {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      verificationMethod: `${holderDid}#keys-1`,
      proofPurpose: 'authentication',
      proofValue: hash // Simplified - would use actual signature
    };
  }

  // Verification Methods
  private async verifyPresentationStructure(
    presentation: VerifiablePresentation,
    definition: PresentationDefinition
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!presentation['@context']) {
      errors.push('Missing @context');
    }

    if (!presentation.type || !presentation.type.includes('VerifiablePresentation')) {
      errors.push('Invalid or missing type');
    }

    if (!presentation.holder) {
      errors.push('Missing holder');
    }

    if (!presentation.verifiableCredential || presentation.verifiableCredential.length === 0) {
      errors.push('No verifiable credentials provided');
    }

    // Check presentation submission
    if (!presentation.presentation_submission) {
      errors.push('Missing presentation submission');
    } else {
      if (presentation.presentation_submission.definition_id !== definition.id) {
        errors.push('Definition ID mismatch');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async verifyCredentialProofs(credentials: any[]): Promise<Array<{ valid: boolean; errors: string[]; warnings: string[] }>> {
    const results = [];

    for (const credential of credentials) {
      if (credential.type?.includes('ZKSelectiveDisclosure')) {
        // Verify ZK proof
        const zkResult = await this.zkpSystem.verifyProof({
          proof: credential.zkProof,
          publicSignals: credential.disclosedFields,
          circuitId: 'selective_disclosure',
          context: 'selective-disclosure'
        });

        results.push({
          valid: zkResult.valid,
          errors: zkResult.errors || [],
          warnings: []
        });
      } else {
        // Verify standard credential
        results.push({
          valid: true, // Simplified verification
          errors: [],
          warnings: []
        });
      }
    }

    return results;
  }

  private async verifyAgainstDefinition(
    presentation: VerifiablePresentation,
    definition: PresentationDefinition
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verify each input descriptor is satisfied
    for (const descriptor of definition.input_descriptors) {
      const satisfied = presentation.presentation_submission?.descriptor_map.some(
        dm => dm.id === descriptor.id
      );

      if (!satisfied) {
        errors.push(`Input descriptor not satisfied: ${descriptor.id}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async extractClaims(
    presentation: VerifiablePresentation,
    config: SelectiveDisclosureConfig
  ): Promise<any> {
    const claims: any = {};

    for (const credential of presentation.verifiableCredential) {
      if (credential.credentialSubject) {
        Object.assign(claims, credential.credentialSubject);
      }
    }

    return claims;
  }

  private async getDisclosedFields(
    presentation: VerifiablePresentation,
    config: SelectiveDisclosureConfig
  ): Promise<string[]> {
    if (!config.enabled) {
      // Return all fields if selective disclosure is not enabled
      const allFields = new Set<string>();
      
      for (const credential of presentation.verifiableCredential) {
        if (credential.credentialSubject) {
          Object.keys(credential.credentialSubject).forEach(key => allFields.add(key));
        }
      }
      
      return Array.from(allFields);
    }

    return config.fields;
  }

  // Helper Methods
  private async setupCredentialMatchers(): Promise<void> {
    // Default matcher
    this.credentialMatchers.set('default', new DefaultCredentialMatcher());
    
    // BBS+ matcher
    this.credentialMatchers.set('BbsBlsSignature2020', new BBSCredentialMatcher());
    
    peLogger.info('Credential matchers initialized');
  }

  private async setupTransportHandlers(): Promise<void> {
    // QR Code transport
    this.transportHandlers.set('qr', new QRTransportHandler());
    
    // Deep link transport
    this.transportHandlers.set('deeplink', new DeepLinkTransportHandler());
    
    // WebSocket transport
    this.transportHandlers.set('websocket', new WebSocketTransportHandler());
    
    peLogger.info('Transport handlers initialized');
  }

  private async createDefaultPresentationDefinitions(): Promise<void> {
    // Age verification definition
    const ageVerification: PresentationDefinition = {
      id: 'age-verification-simple',
      name: 'Age Verification',
      purpose: 'Verify user is over 18 years old',
      input_descriptors: [
        {
          id: 'age-credential',
          name: 'Age Credential',
          purpose: 'Proof of age over 18',
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.birthDate', '$.credentialSubject.age'],
                filter: {
                  type: 'string'
                }
              }
            ]
          }
        }
      ]
    };

    this.definitionRegistry.set(ageVerification.id, ageVerification);

    // Identity verification definition
    const identityVerification: PresentationDefinition = {
      id: 'identity-verification-complete',
      name: 'Complete Identity Verification',
      purpose: 'Full identity verification for high-trust scenarios',
      input_descriptors: [
        {
          id: 'id-credential',
          name: 'Government ID',
          purpose: 'Official identity document',
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.givenName'],
                filter: { type: 'string' }
              },
              {
                path: ['$.credentialSubject.familyName'],
                filter: { type: 'string' }
              },
              {
                path: ['$.credentialSubject.birthDate'],
                filter: { type: 'string', format: 'date' }
              }
            ]
          }
        }
      ]
    };

    this.definitionRegistry.set(identityVerification.id, identityVerification);

    peLogger.info('Default presentation definitions created');
  }

  private generateSessionId(): string {
    return `pe_session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private async generateRequestUri(session: PresentationExchangeSession): Promise<string> {
    const baseUrl = process.env.BASE_URL || 'https://veridity.app';
    return `${baseUrl}/api/presentation-exchange/${session.sessionId}`;
  }

  private async generateQRCode(uri: string): Promise<string> {
    // Simplified QR code generation - would use actual QR library
    return `qr:${Buffer.from(uri).toString('base64')}`;
  }

  private async generateDeepLink(uri: string): Promise<string> {
    return `veridity://presentation-exchange?uri=${encodeURIComponent(uri)}`;
  }

  // Public API Methods
  getActiveSessions(): number {
    return this.activeSessions.size;
  }

  getPresentationDefinition(id: string): PresentationDefinition | undefined {
    return this.definitionRegistry.get(id);
  }

  listPresentationDefinitions(): PresentationDefinition[] {
    return Array.from(this.definitionRegistry.values());
  }

  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      presentationExchange: 'operational',
      activeSessions: this.activeSessions.size,
      definitionRegistry: this.definitionRegistry.size,
      credentialMatchers: this.credentialMatchers.size,
      transportHandlers: this.transportHandlers.size,
      version: this.VERSION,
      timestamp: new Date().toISOString()
    };
  }
}

// Credential Matcher Implementations
class DefaultCredentialMatcher implements CredentialMatcher {
  async match(
    credential: any,
    descriptor: InputDescriptor,
    config: SelectiveDisclosureConfig
  ): Promise<CredentialMatch> {
    let matchScore = 0;
    const missingFields: string[] = [];
    const warnings: string[] = [];

    // Check field constraints
    if (descriptor.constraints.fields) {
      for (const field of descriptor.constraints.fields) {
        const hasField = this.checkFieldPath(credential, field.path);
        if (hasField) {
          matchScore += 1 / descriptor.constraints.fields.length;
        } else {
          missingFields.push(field.path.join('.'));
        }
      }
    } else {
      matchScore = 1; // No field constraints
    }

    return {
      credential,
      input_descriptor_id: descriptor.id,
      match_score: matchScore,
      missing_fields: missingFields,
      warnings,
      selective_disclosure: {
        supported: config.enabled,
        method: config.method,
        selective_fields: config.fields,
        predicates_supported: ['reveal', 'hide']
      }
    };
  }

  private checkFieldPath(obj: any, path: string[]): boolean {
    let current = obj;
    for (const segment of path) {
      const cleanSegment = segment.replace(/^\$\./, '');
      if (current[cleanSegment] === undefined) {
        return false;
      }
      current = current[cleanSegment];
    }
    return true;
  }
}

class BBSCredentialMatcher extends DefaultCredentialMatcher implements CredentialMatcher {
  async match(
    credential: any,
    descriptor: InputDescriptor,
    config: SelectiveDisclosureConfig
  ): Promise<CredentialMatch> {
    const baseMatch = await super.match(credential, descriptor, config);
    
    // Enhanced selective disclosure capabilities for BBS+
    baseMatch.selective_disclosure = {
      supported: true,
      method: 'bbs+',
      selective_fields: Object.keys(credential.credentialSubject || {}),
      predicates_supported: ['reveal', 'hide', 'prove-range', 'prove-membership']
    };

    return baseMatch;
  }
}

// Transport Handler Implementations
class QRTransportHandler implements TransportHandler {
  async handle(session: PresentationExchangeSession): Promise<string> {
    return `qr-transport:${session.sessionId}`;
  }
}

class DeepLinkTransportHandler implements TransportHandler {
  async handle(session: PresentationExchangeSession): Promise<string> {
    return `deeplink-transport:${session.sessionId}`;
  }
}

class WebSocketTransportHandler implements TransportHandler {
  async handle(session: PresentationExchangeSession): Promise<string> {
    return `ws-transport:${session.sessionId}`;
  }
}

// Interfaces for implementations
interface CredentialMatcher {
  match(
    credential: any,
    descriptor: InputDescriptor,
    config: SelectiveDisclosureConfig
  ): Promise<CredentialMatch>;
}

interface TransportHandler {
  handle(session: PresentationExchangeSession): Promise<string>;
}

// Export singleton instance
export const presentationExchangeManager = PresentationExchangeManager.getInstance();