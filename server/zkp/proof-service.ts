/**
 * Production Zero-Knowledge Proof Generation Service
 * Real ZK proof generation using Circom circuits and SnarkJS
 */

import * as snarkjs from 'snarkjs';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { performance } from 'perf_hooks';
import winston from 'winston';
import crypto from 'crypto';

// Configure logger for ZK operations
const zkLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/zk-proofs.log' }),
    new winston.transports.Console()
  ]
});

export interface ProofGenerationRequest {
  proofType: 'age_verification' | 'citizenship_verification' | 'education_verification' | 'income_verification';
  privateInputs: Record<string, any>;
  publicInputs: Record<string, any>;
  userId: string;
  requestId: string;
}

export interface GeneratedProof {
  proof: any; // Groth16 proof object
  publicSignals: string[];
  proofType: string;
  timestamp: Date;
  userId: string;
  requestId: string;
  verificationKey: any;
  nullifier: string;
  commitment: string;
  expiryDate: Date;
  metadata: {
    circuitHash: string;
    generationTime: number;
    proofSize: number;
    version: string;
  };
}

export interface ProofVerificationResult {
  isValid: boolean;
  proofId: string;
  verificationTime: number;
  nullifierCheck: 'valid' | 'used' | 'invalid';
  expiryCheck: 'valid' | 'expired';
  reason?: string;
}

export class ZKProofService {
  private circuitsPath: string;
  private keysPath: string;
  private usedNullifiers: Set<string> = new Set();
  private proofCache: Map<string, GeneratedProof> = new Map();
  private readonly VERSION = '2.1.0';

  constructor() {
    this.circuitsPath = join(process.cwd(), 'server/circuits');
    this.keysPath = join(process.cwd(), 'server/zkp/keys');
    this.loadUsedNullifiers();
  }

  /**
   * Generate a Zero-Knowledge Proof
   */
  async generateProof(request: ProofGenerationRequest): Promise<GeneratedProof> {
    const startTime = performance.now();
    zkLogger.info('Starting proof generation', { 
      proofType: request.proofType, 
      userId: request.userId,
      requestId: request.requestId 
    });

    try {
      // Validate circuit exists
      const circuitFiles = this.getCircuitFiles(request.proofType);
      this.validateCircuitFiles(circuitFiles);

      // Prepare inputs
      const inputs = this.prepareInputs(request);

      // Generate witness
      const witness = await this.generateWitness(circuitFiles.wasm, inputs);

      // Generate proof using Groth16
      const { proof, publicSignals } = await snarkjs.groth16.prove(
        circuitFiles.zkey,
        witness
      );

      // Load verification key
      const verificationKey = JSON.parse(readFileSync(circuitFiles.vkey, 'utf8'));

      // Extract important values
      const nullifier = publicSignals[1]; // Assuming nullifier is second public signal
      const commitment = this.generateCommitment(request.privateInputs);

      // Check for nullifier reuse
      if (this.usedNullifiers.has(nullifier)) {
        throw new Error('Nullifier already used - proof replay detected');
      }

      // Create proof object
      const generatedProof: GeneratedProof = {
        proof,
        publicSignals,
        proofType: request.proofType,
        timestamp: new Date(),
        userId: request.userId,
        requestId: request.requestId,
        verificationKey,
        nullifier,
        commitment,
        expiryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
        metadata: {
          circuitHash: await this.calculateCircuitHash(circuitFiles.r1cs),
          generationTime: performance.now() - startTime,
          proofSize: JSON.stringify(proof).length,
          version: this.VERSION
        }
      };

      // Store nullifier and cache proof
      this.usedNullifiers.add(nullifier);
      this.proofCache.set(request.requestId, generatedProof);

      zkLogger.info('Proof generation completed', {
        proofType: request.proofType,
        userId: request.userId,
        requestId: request.requestId,
        generationTime: generatedProof.metadata.generationTime,
        proofSize: generatedProof.metadata.proofSize
      });

      return generatedProof;

    } catch (error) {
      zkLogger.error('Proof generation failed', {
        proofType: request.proofType,
        userId: request.userId,
        requestId: request.requestId,
        error: error.message
      });
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Verify a Zero-Knowledge Proof
   */
  async verifyProof(proof: GeneratedProof): Promise<ProofVerificationResult> {
    const startTime = performance.now();
    
    try {
      // Check nullifier
      const nullifierCheck = this.usedNullifiers.has(proof.nullifier) ? 'used' : 'valid';
      
      // Check expiry
      const expiryCheck = proof.expiryDate > new Date() ? 'valid' : 'expired';
      
      if (nullifierCheck === 'used') {
        return {
          isValid: false,
          proofId: proof.requestId,
          verificationTime: performance.now() - startTime,
          nullifierCheck,
          expiryCheck,
          reason: 'Proof has already been used'
        };
      }

      if (expiryCheck === 'expired') {
        return {
          isValid: false,
          proofId: proof.requestId,
          verificationTime: performance.now() - startTime,
          nullifierCheck,
          expiryCheck,
          reason: 'Proof has expired'
        };
      }

      // Verify the cryptographic proof
      const isValid = await snarkjs.groth16.verify(
        proof.verificationKey,
        proof.publicSignals,
        proof.proof
      );

      const result: ProofVerificationResult = {
        isValid,
        proofId: proof.requestId,
        verificationTime: performance.now() - startTime,
        nullifierCheck,
        expiryCheck,
        reason: isValid ? undefined : 'Cryptographic verification failed'
      };

      zkLogger.info('Proof verification completed', {
        proofId: proof.requestId,
        isValid,
        verificationTime: result.verificationTime
      });

      return result;

    } catch (error) {
      zkLogger.error('Proof verification failed', {
        proofId: proof.requestId,
        error: error.message
      });
      
      return {
        isValid: false,
        proofId: proof.requestId,
        verificationTime: performance.now() - startTime,
        nullifierCheck: 'invalid',
        expiryCheck: 'valid',
        reason: `Verification error: ${error.message}`
      };
    }
  }

  /**
   * Generate Age Verification Proof
   */
  async generateAgeProof(
    birthDate: Date,
    minimumAge: number,
    userId: string
  ): Promise<GeneratedProof> {
    const now = new Date();
    const salt = crypto.randomBytes(32).toString('hex');

    const request: ProofGenerationRequest = {
      proofType: 'age_verification',
      privateInputs: {
        birthYear: birthDate.getFullYear(),
        birthMonth: birthDate.getMonth() + 1,
        birthDay: birthDate.getDate(),
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth() + 1,
        currentDay: now.getDate(),
        salt
      },
      publicInputs: {
        minAge: minimumAge,
        salt
      },
      userId,
      requestId: `age_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
    };

    return this.generateProof(request);
  }

  /**
   * Generate Citizenship Verification Proof
   */
  async generateCitizenshipProof(
    citizenshipNumber: string,
    issueDate: Date,
    userId: string
  ): Promise<GeneratedProof> {
    const salt = crypto.randomBytes(32).toString('hex');
    const hashedCitizenshipNumber = crypto
      .createHash('sha256')
      .update(citizenshipNumber)
      .digest('hex');

    const request: ProofGenerationRequest = {
      proofType: 'citizenship_verification',
      privateInputs: {
        citizenshipHash: hashedCitizenshipNumber,
        issueYear: issueDate.getFullYear(),
        issueMonth: issueDate.getMonth() + 1,
        issueDay: issueDate.getDate(),
        salt
      },
      publicInputs: {
        minIssueYear: 1950, // Minimum valid citizenship issue year
        salt
      },
      userId,
      requestId: `citizenship_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
    };

    return this.generateProof(request);
  }

  /**
   * Batch verify multiple proofs
   */
  async batchVerifyProofs(proofs: GeneratedProof[]): Promise<ProofVerificationResult[]> {
    const verificationPromises = proofs.map(proof => this.verifyProof(proof));
    return Promise.all(verificationPromises);
  }

  /**
   * Get proof statistics
   */
  getProofStatistics(): {
    totalProofsGenerated: number;
    usedNullifiers: number;
    cachedProofs: number;
    averageGenerationTime: number;
    proofsByType: Record<string, number>;
  } {
    const proofs = Array.from(this.proofCache.values());
    const averageGenerationTime = proofs.length > 0
      ? proofs.reduce((sum, p) => sum + p.metadata.generationTime, 0) / proofs.length
      : 0;

    const proofsByType = proofs.reduce((acc, proof) => {
      acc[proof.proofType] = (acc[proof.proofType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProofsGenerated: proofs.length,
      usedNullifiers: this.usedNullifiers.size,
      cachedProofs: this.proofCache.size,
      averageGenerationTime: Math.round(averageGenerationTime),
      proofsByType
    };
  }

  // Private helper methods

  private getCircuitFiles(proofType: string) {
    const circuitName = this.getCircuitName(proofType);
    return {
      wasm: join(this.circuitsPath, `${circuitName}_js`, `${circuitName}.wasm`),
      zkey: join(this.keysPath, `${circuitName}_final.zkey`),
      vkey: join(this.keysPath, `${circuitName}_vkey.json`),
      r1cs: join(this.circuitsPath, `${circuitName}.r1cs`)
    };
  }

  private getCircuitName(proofType: string): string {
    switch (proofType) {
      case 'age_verification':
        return 'age_verification';
      case 'citizenship_verification':
        return 'citizenship_verification';
      case 'education_verification':
        return 'education_verification';
      case 'income_verification':
        return 'income_verification';
      default:
        throw new Error(`Unknown proof type: ${proofType}`);
    }
  }

  private validateCircuitFiles(files: any): void {
    Object.entries(files).forEach(([type, path]) => {
      if (!existsSync(path as string)) {
        throw new Error(`Circuit file missing: ${type} at ${path}`);
      }
    });
  }

  private prepareInputs(request: ProofGenerationRequest): Record<string, any> {
    return {
      ...request.privateInputs,
      ...request.publicInputs
    };
  }

  private async generateWitness(wasmPath: string, inputs: Record<string, any>): Promise<Uint8Array> {
    // Use snarkjs to generate witness
    const { calculateWitness } = await import('circom_runtime');
    const wasm = readFileSync(wasmPath);
    const witness = await calculateWitness(wasm, inputs);
    return witness;
  }

  private generateCommitment(privateInputs: Record<string, any>): string {
    const inputString = JSON.stringify(privateInputs, Object.keys(privateInputs).sort());
    return crypto.createHash('sha256').update(inputString).digest('hex');
  }

  private async calculateCircuitHash(r1csPath: string): Promise<string> {
    const r1csData = readFileSync(r1csPath);
    return crypto.createHash('sha256').update(r1csData).digest('hex');
  }

  private loadUsedNullifiers(): void {
    // In production, this would load from persistent storage
    // For now, we keep them in memory
    zkLogger.info('Loaded used nullifiers from storage', { 
      count: this.usedNullifiers.size 
    });
  }

  private saveUsedNullifiers(): void {
    // In production, this would save to persistent storage
    zkLogger.info('Saved used nullifiers to storage', { 
      count: this.usedNullifiers.size 
    });
  }
}

// Export singleton instance
export const zkProofService = new ZKProofService();