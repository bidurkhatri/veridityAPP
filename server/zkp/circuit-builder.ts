import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CircuitBuildConfig {
  circuitName: string;
  ptauSize: number; // Powers of tau ceremony size (12-20 typically)
  contributionName: string;
}

export class CircuitBuilder {
  private circuitsPath: string;
  private keysPath: string;
  private buildPath: string;

  constructor() {
    this.circuitsPath = join(__dirname, 'circuits');
    this.keysPath = join(__dirname, 'keys');
    this.buildPath = join(__dirname, 'build');
    
    // Ensure directories exist
    [this.keysPath, this.buildPath].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  async buildCircuit(config: CircuitBuildConfig): Promise<void> {
    const { circuitName, ptauSize, contributionName } = config;
    
    console.log(`🔧 Building circuit: ${circuitName}`);
    
    try {
      // Step 1: Compile circuit
      await this.compileCircuit(circuitName);
      
      // Step 2: Generate trusted setup
      await this.generateTrustedSetup(circuitName, ptauSize, contributionName);
      
      // Step 3: Export verification key
      await this.exportVerificationKey(circuitName);
      
      console.log(`✅ Circuit ${circuitName} built successfully`);
    } catch (error) {
      console.error(`❌ Failed to build circuit ${circuitName}:`, error);
      throw error;
    }
  }

  private async compileCircuit(circuitName: string): Promise<void> {
    const circuitFile = join(this.circuitsPath, `${circuitName}.circom`);
    const outputDir = this.buildPath;
    
    if (!existsSync(circuitFile)) {
      throw new Error(`Circuit file not found: ${circuitFile}`);
    }
    
    console.log(`  📝 Compiling ${circuitName}...`);
    
    // Check if circom is installed
    try {
      execSync('circom --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Circom not installed. Install with: npm install -g circom_runtime');
    }
    
    // Compile circuit
    const compileCmd = `circom ${circuitFile} --r1cs --wasm --sym -o ${outputDir}`;
    execSync(compileCmd, { stdio: 'inherit' });
    
    // Move WASM file to circuits directory
    const wasmSrc = join(outputDir, `${circuitName}_js`, `${circuitName}.wasm`);
    const wasmDst = join(this.circuitsPath, `${circuitName}.wasm`);
    
    if (existsSync(wasmSrc)) {
      execSync(`cp ${wasmSrc} ${wasmDst}`);
    }
  }

  private async generateTrustedSetup(
    circuitName: string, 
    ptauSize: number, 
    contributionName: string
  ): Promise<void> {
    const r1csFile = join(this.buildPath, `${circuitName}.r1cs`);
    const ptauFile = join(this.keysPath, `pot${ptauSize}_final.ptau`);
    const zkeyFile = join(this.keysPath, `${circuitName}_final.zkey`);
    
    // Check if powers of tau file exists
    if (!existsSync(ptauFile)) {
      console.log(`  🎲 Generating powers of tau (size ${ptauSize})...`);
      
      const pot0 = join(this.keysPath, `pot${ptauSize}_0000.ptau`);
      const pot1 = join(this.keysPath, `pot${ptauSize}_0001.ptau`);
      
      // Generate initial powers of tau
      execSync(`snarkjs powersoftau new bn128 ${ptauSize} ${pot0}`, { stdio: 'inherit' });
      
      // Contribute to ceremony
      execSync(`snarkjs powersoftau contribute ${pot0} ${pot1} --name="${contributionName}"`, { 
        stdio: 'inherit',
        input: '\n' // Auto-confirm with empty entropy
      });
      
      // Prepare phase 2
      execSync(`snarkjs powersoftau prepare phase2 ${pot1} ${ptauFile}`, { stdio: 'inherit' });
      
      // Cleanup intermediate files
      [pot0, pot1].forEach(file => {
        if (existsSync(file)) {
          execSync(`rm ${file}`);
        }
      });
    }
    
    console.log(`  🔐 Generating circuit-specific setup...`);
    
    const zkey0 = join(this.keysPath, `${circuitName}_0000.zkey`);
    
    // Generate initial zkey
    execSync(`snarkjs groth16 setup ${r1csFile} ${ptauFile} ${zkey0}`, { stdio: 'inherit' });
    
    // Contribute to circuit-specific ceremony
    execSync(`snarkjs zkey contribute ${zkey0} ${zkeyFile} --name="${contributionName}"`, { 
      stdio: 'inherit',
      input: '\n' // Auto-confirm with empty entropy
    });
    
    // Cleanup intermediate file
    if (existsSync(zkey0)) {
      execSync(`rm ${zkey0}`);
    }
  }

  private async exportVerificationKey(circuitName: string): Promise<void> {
    const zkeyFile = join(this.keysPath, `${circuitName}_final.zkey`);
    const vkeyFile = join(this.keysPath, `${circuitName}_vkey.json`);
    
    console.log(`  📤 Exporting verification key...`);
    
    execSync(`snarkjs zkey export verificationkey ${zkeyFile} ${vkeyFile}`, { stdio: 'inherit' });
  }

  // Build all circuits
  async buildAllCircuits(): Promise<void> {
    const circuits: CircuitBuildConfig[] = [
      {
        circuitName: 'age_verification',
        ptauSize: 12, // Supports up to 2^12 constraints
        contributionName: 'Veridity Age Verification'
      },
      {
        circuitName: 'citizenship_verification',
        ptauSize: 14, // Larger circuit needs more constraints
        contributionName: 'Veridity Citizenship Verification'
      }
    ];
    
    for (const config of circuits) {
      await this.buildCircuit(config);
    }
  }

  // Check build status
  getBuildStatus(): Record<string, any> {
    const circuits = ['age_verification', 'citizenship_verification'];
    const status: Record<string, any> = {};
    
    circuits.forEach(circuit => {
      const r1cs = existsSync(join(this.buildPath, `${circuit}.r1cs`));
      const wasm = existsSync(join(this.circuitsPath, `${circuit}.wasm`));
      const zkey = existsSync(join(this.keysPath, `${circuit}_final.zkey`));
      const vkey = existsSync(join(this.keysPath, `${circuit}_vkey.json`));
      
      status[circuit] = {
        compiled: r1cs && wasm,
        setup: zkey,
        ready: wasm && zkey && vkey,
        files: { r1cs, wasm, zkey, vkey }
      };
    });
    
    return status;
  }

  // Clean build artifacts
  cleanBuild(): void {
    console.log('🧹 Cleaning build artifacts...');
    
    if (existsSync(this.buildPath)) {
      execSync(`rm -rf ${this.buildPath}/*`);
    }
  }
}

export const circuitBuilder = new CircuitBuilder();