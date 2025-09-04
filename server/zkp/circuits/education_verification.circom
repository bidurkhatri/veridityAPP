pragma circom 2.0.0;

/*
 * Education Verification Circuit for Nepal
 * 
 * This circuit proves educational qualifications without revealing
 * specific grades or institutional details.
 * 
 * Public Inputs:
 * - educationLevel: required education level (1=SLC, 2=+2, 3=Bachelor, 4=Master, 5=PhD)
 * - institutionTier: required institution tier (1=basic, 2=standard, 3=premium)
 * - merkleRoot: Merkle root of recognized institutions
 * 
 * Private Inputs:
 * - actualLevel: user's actual education level
 * - actualGrade: user's grade/percentage
 * - institutionId: institution identifier
 * - certificateHash: hash of actual certificate
 * - merkleProof: merkle proof for institution validity
 * - salt: random salt
 * 
 * Output:
 * - isValid: 1 if qualifications meet requirements
 */

include "circomlib/circuits/merkletree.circom";
include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template EducationVerification(levels) {
    // Public inputs
    signal input educationLevel;     // Required education level
    signal input institutionTier;    // Required institution tier
    signal input merkleRoot;         // Root of recognized institutions
    
    // Private inputs  
    signal input actualLevel;        // User's actual education level
    signal input actualGrade;        // User's grade (0-100)
    signal input institutionId;      // Institution identifier
    signal input institutionTierActual; // Actual institution tier
    signal input certificateHash;    // Hash of certificate
    signal input merkleProof[levels]; // Merkle proof path
    signal input merkleIndices[levels]; // Merkle proof indices
    signal input salt;               // Random salt
    
    // Outputs
    signal output isValid;           // 1 if qualifications are valid
    signal output nullifierHash;    // Unique identifier
    signal output qualificationTier; // 0=basic, 1=standard, 2=premium
    
    // Check education level meets requirement
    component levelCheck = GreaterEqThan(8);
    levelCheck.in[0] <== actualLevel;
    levelCheck.in[1] <== educationLevel;
    
    // Check institution tier meets requirement
    component tierCheck = GreaterEqThan(8);
    tierCheck.in[0] <== institutionTierActual;
    tierCheck.in[1] <== institutionTier;
    
    // Verify institution is recognized (merkle proof)
    component institutionHash = Poseidon(1);
    institutionHash.inputs[0] <== institutionId;
    
    component merkleVerifier = MerkleTreeChecker(levels);
    merkleVerifier.leaf <== institutionHash.out;
    merkleVerifier.root <== merkleRoot;
    
    for (var i = 0; i < levels; i++) {
        merkleVerifier.pathElements[i] <== merkleProof[i];
        merkleVerifier.pathIndices[i] <== merkleIndices[i];
    }
    
    // Calculate qualification tier based on grade and institution
    component gradeCheck1 = GreaterEqThan(8);
    gradeCheck1.in[0] <== actualGrade;
    gradeCheck1.in[1] <== 80; // 80% = premium qualification
    
    component gradeCheck2 = GreaterEqThan(8);
    gradeCheck2.in[0] <== actualGrade;
    gradeCheck2.in[1] <== 60; // 60% = standard qualification
    
    // Determine qualification tier
    component tier1 = Mux1();
    tier1.c[0] <== 0; // Basic
    tier1.c[1] <== 1; // Standard  
    tier1.s <== gradeCheck2.out;
    
    component tier2 = Mux1();
    tier2.c[0] <== tier1.out;
    tier2.c[1] <== 2; // Premium
    tier2.s <== gradeCheck1.out;
    
    // Boost tier if from premium institution
    component premiumInstitution = IsEqual();
    premiumInstitution.in[0] <== institutionTierActual;
    premiumInstitution.in[1] <== 3;
    
    component finalTier = Mux1();
    finalTier.c[0] <== tier2.out;
    finalTier.c[1] <== 2; // Premium tier if premium institution
    finalTier.s <== premiumInstitution.out;
    
    qualificationTier <== finalTier.out;
    
    // Final validation: all checks must pass
    component validation1 = AND();
    validation1.a <== levelCheck.out;
    validation1.b <== tierCheck.out;
    
    component validation2 = AND();
    validation2.a <== validation1.out;
    validation2.b <== merkleVerifier.out;
    
    isValid <== validation2.out;
    
    // Generate nullifier hash
    component nullifier = Poseidon(3);
    nullifier.inputs[0] <== certificateHash;
    nullifier.inputs[1] <== institutionId;
    nullifier.inputs[2] <== salt;
    nullifierHash <== nullifier.out;
    
    // Constraints: education level must be valid (1-5)
    component levelValid1 = GreaterThan(8);
    levelValid1.in[0] <== actualLevel;
    levelValid1.in[1] <== 0;
    levelValid1.out === 1;
    
    component levelValid2 = LessThan(8);
    levelValid2.in[0] <== actualLevel;
    levelValid2.in[1] <== 6;
    levelValid2.out === 1;
    
    // Grade must be valid (0-100)
    component gradeValid = LessThan(8);
    gradeValid.in[0] <== actualGrade;
    gradeValid.in[1] <== 101;
    gradeValid.out === 1;
    
    // Institution tier must be valid (1-3)
    component tierValid1 = GreaterThan(8);
    tierValid1.in[0] <== institutionTierActual;
    tierValid1.in[1] <== 0;
    tierValid1.out === 1;
    
    component tierValid2 = LessThan(8);
    tierValid2.in[0] <== institutionTierActual;
    tierValid2.in[1] <== 4;
    tierValid2.out === 1;
}

component main = EducationVerification(20); // Support up to 2^20 institutions