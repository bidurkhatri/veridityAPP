pragma circom 2.0.0;

/*
 * Citizenship Verification Circuit for Nepal
 * 
 * This circuit proves Nepali citizenship without revealing
 * the actual citizenship number or personal details.
 * 
 * Public Inputs:
 * - merkleRoot: Merkle root of valid citizenship numbers
 * - district: district code (optional filter)
 * 
 * Private Inputs:
 * - citizenshipNumber: actual citizenship number
 * - merkleProof: merkle proof for citizenship validity
 * - salt: random salt for privacy
 * 
 * Output:
 * - isValid: 1 if valid citizen, 0 otherwise
 */

include "circomlib/circuits/merkletree.circom";
include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template CitizenshipVerification(levels) {
    // Public inputs
    signal input merkleRoot;        // Root of citizenship merkle tree
    signal input districtFilter;    // Optional district filter (0 = any)
    
    // Private inputs  
    signal input citizenshipNumber; // Full citizenship number
    signal input district;          // Citizen's district code
    signal input merkleProof[levels]; // Merkle proof path
    signal input merkleIndices[levels]; // Merkle proof indices
    signal input salt;              // Random salt
    
    // Outputs
    signal output isValid;          // 1 if valid citizenship
    signal output nullifierHash;   // Unique identifier
    
    // Hash the citizenship number for merkle tree
    component citizenHash = Poseidon(1);
    citizenHash.inputs[0] <== citizenshipNumber;
    
    // Verify merkle proof
    component merkleVerifier = MerkleTreeChecker(levels);
    merkleVerifier.leaf <== citizenHash.out;
    merkleVerifier.root <== merkleRoot;
    
    for (var i = 0; i < levels; i++) {
        merkleVerifier.pathElements[i] <== merkleProof[i];
        merkleVerifier.pathIndices[i] <== merkleIndices[i];
    }
    
    // Check district filter if specified
    component districtCheck = IsEqual();
    districtCheck.in[0] <== districtFilter;
    districtCheck.in[1] <== 0; // 0 means no filter
    
    component districtMatch = IsEqual();
    districtMatch.in[0] <== district;
    districtMatch.in[1] <== districtFilter;
    
    // Valid if: merkle proof valid AND (no district filter OR district matches)
    component validCitizen = AND();
    validCitizen.a <== merkleVerifier.out;
    
    component districtValid = OR();
    districtValid.a <== districtCheck.out;  // No filter
    districtValid.b <== districtMatch.out;  // District matches
    
    validCitizen.b <== districtValid.out;
    isValid <== validCitizen.out;
    
    // Generate nullifier to prevent reuse
    component nullifier = Poseidon(2);
    nullifier.inputs[0] <== citizenshipNumber;
    nullifier.inputs[1] <== salt;
    nullifierHash <== nullifier.out;
}

component main = CitizenshipVerification(20); // Support up to 2^20 citizens