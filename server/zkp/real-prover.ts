import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as snarkjs from 'snarkjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ProofInput {
  circuitId: string;
  privateInputs: Record<string, any>;
  publicInputs: Record<string, any>;
}

export interface GeneratedProof {
  proof: any;
  publicSignals: string[];
  nullifierHash?: string;
}

export class RealZKProver {
  private circuitsPath: string;
  private keysPath: string;

  constructor() {
    this.circuitsPath = join(__dirname, 'circuits');
    this.keysPath = join(__dirname, 'keys');
  }

  async generateProof(input: ProofInput): Promise<GeneratedProof> {
    const { circuitId, privateInputs, publicInputs } = input;
    
    try {
      // Check if circuit files exist
      const wasmPath = join(this.circuitsPath, `${circuitId}.wasm`);
      const zkeyPath = join(this.keysPath, `${circuitId}_final.zkey`);
      
      if (!existsSync(wasmPath) || !existsSync(zkeyPath)) {
        throw new Error(`Circuit files not found for ${circuitId}. Run setup first.`);
      }

      // Prepare circuit inputs
      const circuitInputs = this.prepareInputs(circuitId, privateInputs, publicInputs);
      
      // Generate witness
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInputs,
        wasmPath,
        zkeyPath
      );

      // Extract nullifier hash if present
      const nullifierHash = publicSignals.length > 1 ? publicSignals[1] : undefined;

      return {
        proof,
        publicSignals,
        nullifierHash
      };
    } catch (error) {
      console.error('Proof generation failed:', error);
      throw new Error(`Failed to generate proof: ${error.message}`);
    }
  }

  private prepareInputs(circuitId: string, privateInputs: any, publicInputs: any): any {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    switch (circuitId) {
      case 'age_verification':
        return {
          // Public inputs
          ageThreshold: publicInputs.ageThreshold || 18,
          currentTimestamp,
          
          // Private inputs
          birthTimestamp: this.dateToTimestamp(privateInputs.dateOfBirth),
          salt: this.generateSalt()
        };
        
      case 'citizenship_verification':
        return {
          // Public inputs
          merkleRoot: publicInputs.merkleRoot,
          districtFilter: publicInputs.districtFilter || 0,
          
          // Private inputs
          citizenshipNumber: this.hashCitizenshipNumber(privateInputs.citizenshipNumber),
          district: privateInputs.district || 0,
          merkleProof: privateInputs.merkleProof || [],
          merkleIndices: privateInputs.merkleIndices || [],
          salt: this.generateSalt()
        };
        
      default:
        throw new Error(`Unknown circuit: ${circuitId}`);
    }
  }

  private dateToTimestamp(dateString: string): number {
    return Math.floor(new Date(dateString).getTime() / 1000);
  }

  private generateSalt(): string {
    // Generate cryptographically secure random salt
    const { randomBytes } = require('crypto');
    return randomBytes(32).toString('hex');
  }

  private hashCitizenshipNumber(citizenshipNumber: string): string {
    const { createHash } = require('crypto');
    return createHash('sha256').update(citizenshipNumber).digest('hex');
  }

  // Check if real ZK setup is available
  isRealZKAvailable(): boolean {
    const circuits = ['age_verification', 'citizenship_verification'];
    
    return circuits.every(circuit => {
      const wasmPath = join(this.circuitsPath, `${circuit}.wasm`);
      const zkeyPath = join(this.keysPath, `${circuit}_final.zkey`);
      return existsSync(wasmPath) && existsSync(zkeyPath);
    });
  }

  // Get setup status for debugging
  getSetupStatus(): Record<string, any> {
    const circuits = ['age_verification', 'citizenship_verification'];
    const status: Record<string, any> = {};
    
    circuits.forEach(circuit => {
      const wasmPath = join(this.circuitsPath, `${circuit}.wasm`);
      const zkeyPath = join(this.keysPath, `${circuit}_final.zkey`);
      const vkeyPath = join(this.keysPath, `${circuit}_vkey.json`);
      
      status[circuit] = {
        wasm: existsSync(wasmPath),
        zkey: existsSync(zkeyPath),
        vkey: existsSync(vkeyPath),
        wasmPath,
        zkeyPath,
        vkeyPath
      };
    });
    
    return status;
  }
}

export const realProver = new RealZKProver();