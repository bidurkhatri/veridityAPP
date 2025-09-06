/**
 * Multi-signature proof verification service
 */

export interface MultiSigRequirement {
  id: string;
  proofTypeId: string;
  requiredSignatures: number;
  authorizedEntities: AuthorizedEntity[];
  threshold: number;
  createdAt: Date;
}

export interface AuthorizedEntity {
  id: string;
  name: string;
  type: 'government' | 'institution' | 'organization' | 'individual';
  publicKey: string;
  trustLevel: number; // 1-10
  active: boolean;
}

export interface MultiSigProof {
  id: string;
  proofId: string;
  signatures: ProofSignature[];
  status: 'pending' | 'partial' | 'complete' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
}

export interface ProofSignature {
  entityId: string;
  signature: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

class MultiSignatureService {
  private requirements: Map<string, MultiSigRequirement> = new Map();
  private proofs: Map<string, MultiSigProof> = new Map();

  // Initialize with default multi-sig requirements
  constructor() {
    this.initializeDefaultRequirements();
  }

  private initializeDefaultRequirements() {
    // High-value proofs require government + institution signatures
    const citizenshipRequirement: MultiSigRequirement = {
      id: 'citizenship-multisig',
      proofTypeId: 'citizenship',
      requiredSignatures: 2,
      threshold: 2,
      authorizedEntities: [
        {
          id: 'nepal-gov',
          name: 'Government of Nepal',
          type: 'government',
          publicKey: 'gov-public-key-placeholder',
          trustLevel: 10,
          active: true
        },
        {
          id: 'dept-immigration',
          name: 'Department of Immigration',
          type: 'institution',
          publicKey: 'immigration-public-key-placeholder',
          trustLevel: 9,
          active: true
        }
      ],
      createdAt: new Date()
    };

    // Educational credentials require institution + regulatory body
    const educationRequirement: MultiSigRequirement = {
      id: 'education-multisig',
      proofTypeId: 'education',
      requiredSignatures: 2,
      threshold: 2,
      authorizedEntities: [
        {
          id: 'tribhuvan-university',
          name: 'Tribhuvan University',
          type: 'institution',
          publicKey: 'tu-public-key-placeholder',
          trustLevel: 8,
          active: true
        },
        {
          id: 'ugc-nepal',
          name: 'University Grants Commission Nepal',
          type: 'government',
          publicKey: 'ugc-public-key-placeholder',
          trustLevel: 9,
          active: true
        }
      ],
      createdAt: new Date()
    };

    this.requirements.set(citizenshipRequirement.id, citizenshipRequirement);
    this.requirements.set(educationRequirement.id, educationRequirement);
  }

  async createMultiSigRequirement(requirement: Omit<MultiSigRequirement, 'id' | 'createdAt'>): Promise<string> {
    const id = `multisig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullRequirement: MultiSigRequirement = {
      ...requirement,
      id,
      createdAt: new Date()
    };

    this.requirements.set(id, fullRequirement);
    return id;
  }

  async getRequirementForProofType(proofTypeId: string): Promise<MultiSigRequirement | null> {
    const requirements = Array.from(this.requirements.values());
    return requirements.find(requirement => requirement.proofTypeId === proofTypeId) || null;
  }

  async initiateMultiSigProof(proofId: string): Promise<string> {
    const multiSigProofId = `msig-proof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const multiSigProof: MultiSigProof = {
      id: multiSigProofId,
      proofId,
      signatures: [],
      status: 'pending',
      createdAt: new Date()
    };

    this.proofs.set(multiSigProofId, multiSigProof);
    return multiSigProofId;
  }

  async addSignature(
    multiSigProofId: string,
    entityId: string,
    signature: string,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; status: string; message: string }> {
    const multiSigProof = this.proofs.get(multiSigProofId);
    if (!multiSigProof) {
      return { success: false, status: 'error', message: 'Multi-sig proof not found' };
    }

    // Check if entity already signed
    const existingSignature = multiSigProof.signatures.find(sig => sig.entityId === entityId);
    if (existingSignature) {
      return { success: false, status: 'error', message: 'Entity has already signed this proof' };
    }

    // Add signature
    const proofSignature: ProofSignature = {
      entityId,
      signature,
      timestamp: new Date(),
      metadata
    };

    multiSigProof.signatures.push(proofSignature);

    // Check if we have enough signatures
    const requirement = await this.getRequirementByMultiSigProof(multiSigProofId);
    if (requirement) {
      const validSignatures = this.validateSignatures(multiSigProof, requirement);
      
      if (validSignatures >= requirement.threshold) {
        multiSigProof.status = 'complete';
        multiSigProof.completedAt = new Date();
        return { success: true, status: 'complete', message: 'Multi-signature verification complete' };
      } else {
        multiSigProof.status = 'partial';
        return { 
          success: true, 
          status: 'partial', 
          message: `${validSignatures}/${requirement.threshold} signatures collected` 
        };
      }
    }

    return { success: false, status: 'error', message: 'Invalid multi-sig requirement' };
  }

  private async getRequirementByMultiSigProof(multiSigProofId: string): Promise<MultiSigRequirement | null> {
    // In a real implementation, this would lookup the proof and its type
    // For now, return the first requirement as a demo
    return Array.from(this.requirements.values())[0] || null;
  }

  private validateSignatures(multiSigProof: MultiSigProof, requirement: MultiSigRequirement): number {
    let validCount = 0;

    for (const signature of multiSigProof.signatures) {
      const entity = requirement.authorizedEntities.find(e => e.id === signature.entityId);
      if (entity && entity.active) {
        // In a real implementation, verify the cryptographic signature
        if (this.verifySignature(signature.signature, entity.publicKey)) {
          validCount++;
        }
      }
    }

    return validCount;
  }

  private verifySignature(signature: string, publicKey: string): boolean {
    // Mock signature verification - in real implementation use cryptographic verification
    return signature.length > 10 && publicKey.length > 10;
  }

  async getMultiSigProofStatus(multiSigProofId: string): Promise<MultiSigProof | null> {
    return this.proofs.get(multiSigProofId) || null;
  }

  async getAllRequirements(): Promise<MultiSigRequirement[]> {
    return Array.from(this.requirements.values());
  }

  async getActiveEntities(): Promise<AuthorizedEntity[]> {
    const allEntities: AuthorizedEntity[] = [];
    
    const requirements = Array.from(this.requirements.values());
    for (const requirement of requirements) {
      allEntities.push(...requirement.authorizedEntities.filter((e: AuthorizedEntity) => e.active));
    }

    // Remove duplicates by ID
    const uniqueEntities = allEntities.filter((entity, index, arr) => 
      arr.findIndex(e => e.id === entity.id) === index
    );

    return uniqueEntities;
  }

  // Administrative functions
  async addAuthorizedEntity(requirementId: string, entity: AuthorizedEntity): Promise<boolean> {
    const requirement = this.requirements.get(requirementId);
    if (!requirement) return false;

    requirement.authorizedEntities.push(entity);
    return true;
  }

  async deactivateEntity(entityId: string): Promise<boolean> {
    let updated = false;
    
    const requirements = Array.from(this.requirements.values());
    for (const requirement of requirements) {
      const entity = requirement.authorizedEntities.find((e: AuthorizedEntity) => e.id === entityId);
      if (entity) {
        entity.active = false;
        updated = true;
      }
    }

    return updated;
  }
}

export const multiSigService = new MultiSignatureService();

// Initialize with additional demo requirements for better UX
setTimeout(() => {
  // Add some demo multi-sig proofs to show the system in action
  const demoProofId1 = multiSigService.initiateMultiSigProof('proof-12345');
  const demoProofId2 = multiSigService.initiateMultiSigProof('proof-67890');
  
  // Add partial signatures to demonstrate the workflow
  setTimeout(() => {
    multiSigService.addSignature(
      demoProofId1.toString(), 
      'nepal-gov', 
      'demo-signature-1', 
      { validatedBy: 'system', timestamp: Date.now() }
    );
  }, 1000);

  console.log('✅ Multi-signature verification system initialized with demo proofs');
}, 1500);