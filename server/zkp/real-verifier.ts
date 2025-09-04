import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as snarkjs from 'snarkjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface VerificationInput {
  circuitId: string;
  proof: any;
  publicSignals: string[];
  publicInputs?: Record<string, any>;
}

export interface VerificationResult {
  isValid: boolean;
  nullifierHash?: string;
  verifiedAt: string;
  circuitId: string;
}

export class RealZKVerifier {
  private keysPath: string;

  constructor() {
    this.keysPath = join(__dirname, 'keys');
  }

  async verifyProof(input: VerificationInput): Promise<VerificationResult> {
    const { circuitId, proof, publicSignals, publicInputs } = input;
    
    try {
      // Load verification key
      const vkeyPath = join(this.keysPath, `${circuitId}_vkey.json`);
      
      if (!existsSync(vkeyPath)) {
        throw new Error(`Verification key not found for ${circuitId}`);
      }

      const vKey = JSON.parse(readFileSync(vkeyPath, 'utf8'));
      
      // Verify the proof
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      
      // Extract nullifier hash if present
      const nullifierHash = publicSignals.length > 1 ? publicSignals[1] : undefined;
      
      // Additional validation based on circuit type
      const additionalValidation = this.performAdditionalValidation(
        circuitId, 
        publicSignals, 
        publicInputs
      );

      return {
        isValid: isValid && additionalValidation.isValid,
        nullifierHash,
        verifiedAt: new Date().toISOString(),
        circuitId
      };
    } catch (error) {
      console.error('Proof verification failed:', error);
      return {
        isValid: false,
        verifiedAt: new Date().toISOString(),
        circuitId
      };
    }
  }

  private performAdditionalValidation(
    circuitId: string, 
    publicSignals: string[], 
    publicInputs?: Record<string, any>
  ): { isValid: boolean; reason?: string } {
    
    switch (circuitId) {
      case 'age_verification':
        return this.validateAgeProof(publicSignals, publicInputs);
        
      case 'citizenship_verification':
        return this.validateCitizenshipProof(publicSignals, publicInputs);
        
      default:
        return { isValid: true };
    }
  }

  private validateAgeProof(
    publicSignals: string[], 
    publicInputs?: Record<string, any>
  ): { isValid: boolean; reason?: string } {
    
    // publicSignals[0] should be 1 for valid age
    const isValidAge = publicSignals[0] === '1';
    
    if (!isValidAge) {
      return { isValid: false, reason: 'Age verification failed' };
    }
    
    // Validate timestamp is recent (within last hour)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const proofTimestamp = publicInputs?.currentTimestamp;
    
    if (proofTimestamp && Math.abs(currentTimestamp - proofTimestamp) > 3600) {
      return { isValid: false, reason: 'Proof timestamp too old' };
    }
    
    return { isValid: true };
  }

  private validateCitizenshipProof(
    publicSignals: string[], 
    publicInputs?: Record<string, any>
  ): { isValid: boolean; reason?: string } {
    
    // publicSignals[0] should be 1 for valid citizenship
    const isValidCitizen = publicSignals[0] === '1';
    
    if (!isValidCitizen) {
      return { isValid: false, reason: 'Citizenship verification failed' };
    }
    
    // Validate merkle root is from trusted source
    if (publicInputs?.merkleRoot && !this.isValidMerkleRoot(publicInputs.merkleRoot)) {
      return { isValid: false, reason: 'Invalid merkle root' };
    }
    
    return { isValid: true };
  }

  private isValidMerkleRoot(merkleRoot: string): boolean {
    // In production, this should check against a list of valid merkle roots
    // from the Nepal government's citizenship database
    
    // For now, accept any non-empty merkle root
    return typeof merkleRoot === 'string' && merkleRoot.length > 0;
  }

  // Batch verification for multiple proofs
  async batchVerify(inputs: VerificationInput[]): Promise<VerificationResult[]> {
    const results = await Promise.allSettled(
      inputs.map(input => this.verifyProof(input))
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          isValid: false,
          verifiedAt: new Date().toISOString(),
          circuitId: inputs[index].circuitId
        };
      }
    });
  }

  // Get verification statistics
  getVerificationStats(): Record<string, any> {
    const circuits = ['age_verification', 'citizenship_verification'];
    const stats: Record<string, any> = {
      availableCircuits: [],
      totalVerifications: 0, // Would track this in production
      successRate: 0.95 // Would calculate from actual data
    };
    
    circuits.forEach(circuit => {
      const vkeyPath = join(this.keysPath, `${circuit}_vkey.json`);
      if (existsSync(vkeyPath)) {
        stats.availableCircuits.push(circuit);
      }
    });
    
    return stats;
  }
}

export const realVerifier = new RealZKVerifier();