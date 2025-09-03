pragma circom 2.0.0;

/*
 * Age Verification Circuit for Veridity
 * 
 * This circuit proves that a person is above a certain age threshold
 * without revealing their exact birth date.
 * 
 * Public Inputs:
 * - ageThreshold: minimum age required (e.g., 18, 21)
 * - currentTimestamp: current Unix timestamp
 * 
 * Private Inputs:
 * - birthTimestamp: user's birth date as Unix timestamp
 * - salt: random salt for uniqueness
 * 
 * Output:
 * - isValid: 1 if age >= threshold, 0 otherwise
 */

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";

template AgeVerification() {
    // Public inputs
    signal input ageThreshold;      // Minimum age in years
    signal input currentTimestamp;  // Current Unix timestamp
    
    // Private inputs
    signal input birthTimestamp;    // Birth date as Unix timestamp
    signal input salt;              // Random salt for privacy
    
    // Outputs
    signal output isValid;          // 1 if valid age, 0 otherwise
    signal output nullifierHash;   // Unique proof identifier
    
    // Constants
    var SECONDS_PER_YEAR = 31536000; // 365 * 24 * 60 * 60
    
    // Calculate age in seconds
    component ageInSeconds = Num2Bits(64);
    ageInSeconds.in <== currentTimestamp - birthTimestamp;
    
    // Calculate required age in seconds
    component requiredAgeSeconds = Num2Bits(64);
    requiredAgeSeconds.in <== ageThreshold * SECONDS_PER_YEAR;
    
    // Check if actual age >= required age
    component ageCheck = GreaterEqThan(64);
    ageCheck.in[0] <== currentTimestamp - birthTimestamp;
    ageCheck.in[1] <== ageThreshold * SECONDS_PER_YEAR;
    
    isValid <== ageCheck.out;
    
    // Generate nullifier hash to prevent double-spending
    component nullifier = Poseidon(2);
    nullifier.inputs[0] <== birthTimestamp;
    nullifier.inputs[1] <== salt;
    nullifierHash <== nullifier.out;
    
    // Constraint: birth timestamp must be reasonable (not in future)
    component birthCheck = LessThan(64);
    birthCheck.in[0] <== birthTimestamp;
    birthCheck.in[1] <== currentTimestamp;
    birthCheck.out === 1;
    
    // Constraint: age threshold must be reasonable (0-150 years)
    component thresholdCheck = LessThan(8);
    thresholdCheck.in[0] <== ageThreshold;
    thresholdCheck.in[1] <== 150;
    thresholdCheck.out === 1;
}

component main = AgeVerification();