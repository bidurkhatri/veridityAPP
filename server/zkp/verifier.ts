import * as snarkjs from "snarkjs";
import fs from "fs";
import path from "path";

// ZK Proof verification service
export class ZKVerifier {
  private vKeys: Map<string, any> = new Map();
  
  constructor() {
    this.loadVerificationKeys();
  }
  
  private loadVerificationKeys() {
    try {
      // Load Age >= 18 verification key
      const age18VKey = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "circuits/public/age18_vkey.json"), "utf8")
      );
      this.vKeys.set("age_over_18", age18VKey);
      
      // Load Age >= 21 verification key
      const age21VKey = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "circuits/public/age21_vkey.json"), "utf8")
      );
      this.vKeys.set("age_over_21", age21VKey);
      
      console.log("✅ ZK verification keys loaded");
    } catch (error) {
      console.warn("⚠️ ZK verification keys not found - using mock verification");
    }
  }
  
  async verifyProof(
    proofType: string,
    proof: any,
    publicSignals: string[]
  ): Promise<boolean> {
    try {
      const vKey = this.vKeys.get(proofType);
      
      if (!vKey) {
        // Mock verification for development
        console.log(`🧪 Mock verification for ${proofType}`);
        return this.mockVerify(proofType, publicSignals);
      }
      
      // Real snarkjs verification
      const result = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      console.log(`🔍 ZK verification result for ${proofType}:`, result);
      
      return result;
    } catch (error) {
      console.error("❌ ZK verification error:", error);
      return false;
    }
  }
  
  private mockVerify(proofType: string, publicSignals: string[]): boolean {
    // Mock verification logic for development
    switch (proofType) {
      case "age_over_18":
      case "age_over_21":
        // Check if public signals look reasonable
        return publicSignals.length === 3 && // isValid, commitmentHash, nonce
               publicSignals[0] === "1"; // isValid should be 1
      
      default:
        return false;
    }
  }
  
  // Generate mock proof for testing
  generateMockProof(proofType: string, nonce: string) {
    return {
      proof: {
        pi_a: ["0x123", "0x456", "1"],
        pi_b: [["0x789", "0xabc"], ["0xdef", "0x012"], ["1", "0"]],
        pi_c: ["0x345", "0x678", "1"],
        protocol: "groth16",
        curve: "bn128"
      },
      publicSignals: [
        "1", // isValid
        "12345678901234567890", // commitmentHash
        nonce // nonce for replay protection
      ]
    };
  }
}

export const zkVerifier = new ZKVerifier();