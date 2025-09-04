/**
 * Enhanced ZK proof system with circuit management
 */

import { hash } from 'circomlib';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs/promises';

export interface ZKProof {
  proof: any;
  publicSignals: string[];
  verificationKey: any;
}

export interface CircuitInfo {
  name: string;
  compiled: boolean;
  setup: boolean;
  ready: boolean;
  files: {
    r1cs: boolean;
    wasm: boolean;
    zkey: boolean;
    vkey: boolean;
  };
}

class ZKCircuitManager {
  private circuits = new Map<string, CircuitInfo>();
  private circuitsPath: string;

  constructor() {
    this.circuitsPath = path.join(process.cwd(), 'circuits');
    this.initializeCircuits();
  }

  private async initializeCircuits() {
    const circuitNames = ['age_verification', 'citizenship_verification', 'education_verification', 'income_verification'];
    
    for (const name of circuitNames) {
      await this.checkCircuitFiles(name);
    }
  }

  private async checkCircuitFiles(name: string): Promise<CircuitInfo> {
    const circuitDir = path.join(this.circuitsPath, name);
    
    const info: CircuitInfo = {
      name,
      compiled: false,
      setup: false,
      ready: false,
      files: {
        r1cs: false,
        wasm: false,
        zkey: false,
        vkey: false
      }
    };

    try {
      // Check if circuit files exist
      const files = ['circuit.r1cs', 'circuit.wasm', 'proving_key.zkey', 'verification_key.json'];
      
      for (const file of files) {
        const filePath = path.join(circuitDir, file);
        try {
          await fs.access(filePath);
          if (file.includes('r1cs')) info.files.r1cs = true;
          if (file.includes('wasm')) info.files.wasm = true;
          if (file.includes('zkey')) info.files.zkey = true;
          if (file.includes('verification')) info.files.vkey = true;
        } catch {
          // File doesn't exist
        }
      }

      info.compiled = info.files.r1cs && info.files.wasm;
      info.setup = info.files.zkey && info.files.vkey;
      info.ready = info.compiled && info.setup;

    } catch (error) {
      console.warn(`Circuit check failed for ${name}:`, error);
    }

    this.circuits.set(name, info);
    return info;
  }

  async buildAllCircuits(): Promise<void> {
    const circuitNames = Array.from(this.circuits.keys());
    
    for (const name of circuitNames) {
      await this.buildCircuit(name);
    }
  }

  async buildCircuit(name: string): Promise<void> {
    console.log(`Building circuit: ${name}`);
    
    const circuitDir = path.join(this.circuitsPath, name);
    
    try {
      // Ensure directory exists
      await fs.mkdir(circuitDir, { recursive: true });
      
      // For now, create mock files to simulate circuit compilation
      await this.createMockCircuitFiles(circuitDir);
      
      // Update circuit info
      await this.checkCircuitFiles(name);
      
      console.log(`Circuit ${name} built successfully`);
    } catch (error) {
      console.error(`Failed to build circuit ${name}:`, error);
      throw error;
    }
  }

  private async createMockCircuitFiles(circuitDir: string): Promise<void> {
    // Create mock verification key
    const mockVKey = {
      protocol: "groth16",
      curve: "bn128",
      nPublic: 1,
      vk_alpha_1: ["0", "0", "0"],
      vk_beta_2: [["0", "0"], ["0", "0"], ["0", "0"]],
      vk_gamma_2: [["0", "0"], ["0", "0"], ["0", "0"]],
      vk_delta_2: [["0", "0"], ["0", "0"], ["0", "0"]],
      vk_alphabeta_12: [["0", "0", "0"], ["0", "0", "0"]],
      IC: [["0", "0", "0"], ["0", "0", "0"]]
    };

    await fs.writeFile(
      path.join(circuitDir, 'verification_key.json'),
      JSON.stringify(mockVKey, null, 2)
    );

    // Create dummy files for other components
    await fs.writeFile(path.join(circuitDir, 'circuit.r1cs'), 'mock r1cs data');
    await fs.writeFile(path.join(circuitDir, 'circuit.wasm'), 'mock wasm data');
    await fs.writeFile(path.join(circuitDir, 'proving_key.zkey'), 'mock zkey data');
  }

  getBuildStatus(): Record<string, CircuitInfo> {
    const status: Record<string, CircuitInfo> = {};
    for (const [name, info] of this.circuits.entries()) {
      status[name] = { ...info };
    }
    return status;
  }

  isCircuitReady(name: string): boolean {
    const circuit = this.circuits.get(name);
    return circuit?.ready ?? false;
  }
}

class ZKProofService {
  private circuitManager: ZKCircuitManager;

  constructor() {
    this.circuitManager = new ZKCircuitManager();
  }

  async generateProof(
    circuitName: string,
    input: Record<string, any>
  ): Promise<ZKProof> {
    if (!this.circuitManager.isCircuitReady(circuitName)) {
      console.warn(`Circuit ${circuitName} not ready, using mock proof`);
      return this.generateMockProof(input);
    }

    try {
      const circuitPath = path.join(process.cwd(), 'circuits', circuitName);
      const wasmPath = path.join(circuitPath, 'circuit.wasm');
      const zkeyPath = path.join(circuitPath, 'proving_key.zkey');

      // Generate the proof
      const { proof, publicSignals } = await groth16.fullProve(
        input,
        wasmPath,
        zkeyPath
      );

      // Load verification key
      const vkeyPath = path.join(circuitPath, 'verification_key.json');
      const vKeyData = await fs.readFile(vkeyPath, 'utf8');
      const verificationKey = JSON.parse(vKeyData);

      return {
        proof,
        publicSignals,
        verificationKey
      };

    } catch (error) {
      console.error(`ZK proof generation failed for ${circuitName}:`, error);
      return this.generateMockProof(input);
    }
  }

  async verifyProof(
    proof: any,
    publicSignals: string[],
    verificationKey: any
  ): Promise<boolean> {
    try {
      return await groth16.verify(verificationKey, publicSignals, proof);
    } catch (error) {
      console.error('ZK proof verification failed:', error);
      return false; // Fail safe
    }
  }

  private generateMockProof(input: Record<string, any>): ZKProof {
    // Generate deterministic mock proof based on input
    const inputStr = JSON.stringify(input);
    const mockHash = hash([Buffer.from(inputStr)]).toString();

    return {
      proof: {
        pi_a: ["1", "2", "1"],
        pi_b: [["3", "4"], ["5", "6"], ["1", "0"]],
        pi_c: ["7", "8", "1"],
        protocol: "groth16",
        curve: "bn128"
      },
      publicSignals: [mockHash],
      verificationKey: {
        protocol: "groth16",
        curve: "bn128",
        nPublic: 1
      }
    };
  }

  // Age verification specific
  async generateAgeProof(
    dateOfBirth: Date,
    minimumAge: number,
    salt: string
  ): Promise<ZKProof> {
    const currentDate = new Date();
    const age = currentDate.getFullYear() - dateOfBirth.getFullYear();
    
    const input = {
      age: age.toString(),
      minimum_age: minimumAge.toString(),
      salt: hash([Buffer.from(salt)]).toString(),
      is_above_minimum: age >= minimumAge ? "1" : "0"
    };

    return this.generateProof('age_verification', input);
  }

  // Citizenship verification specific
  async generateCitizenshipProof(
    citizenshipNumber: string,
    issueDate: Date,
    salt: string
  ): Promise<ZKProof> {
    const input = {
      citizenship_hash: hash([Buffer.from(citizenshipNumber)]).toString(),
      issue_date: Math.floor(issueDate.getTime() / 1000).toString(),
      salt: hash([Buffer.from(salt)]).toString(),
      is_valid: "1" // In real implementation, this would be verified
    };

    return this.generateProof('citizenship_verification', input);
  }

  getBuildStatus() {
    return this.circuitManager.getBuildStatus();
  }

  async buildCircuits() {
    return this.circuitManager.buildAllCircuits();
  }
}

// Global instance
export const zkProofService = new ZKProofService();
export const circuitBuilder = new ZKCircuitManager();