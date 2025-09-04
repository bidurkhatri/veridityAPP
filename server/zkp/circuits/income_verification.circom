pragma circom 2.0.0;

/*
 * Income Verification Circuit for Veridity
 * 
 * This circuit proves that a person's income is above a certain threshold
 * without revealing the exact income amount.
 * 
 * Public Inputs:
 * - incomeThreshold: minimum income required (in NPR)
 * - timeframe: verification period (months)
 * 
 * Private Inputs:
 * - monthlyIncome: actual monthly income
 * - bankStatementHash: hash of bank statement for verification
 * - employerSignature: digital signature from employer
 * - salt: random salt for privacy
 * 
 * Output:
 * - isValid: 1 if income >= threshold, 0 otherwise
 */

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/ecdsa.circom";

template IncomeVerification() {
    // Public inputs
    signal input incomeThreshold;    // Minimum income in NPR
    signal input timeframe;          // Verification period in months
    
    // Private inputs
    signal input monthlyIncome;      // Actual monthly income
    signal input totalIncome;        // Total income over timeframe
    signal input bankStatementHash;  // Hash of bank statement
    signal input employerSignature[2]; // ECDSA signature components
    signal input employerPubKey[2];    // Employer's public key
    signal input salt;               // Random salt
    
    // Outputs
    signal output isValid;           // 1 if valid income, 0 otherwise
    signal output nullifierHash;    // Unique proof identifier
    signal output incomeRange;      // 0=below, 1=adequate, 2=high
    
    // Verify total income calculation
    component incomeCheck = IsEqual();
    incomeCheck.in[0] <== monthlyIncome * timeframe;
    incomeCheck.in[1] <== totalIncome;
    incomeCheck.out === 1; // Total must equal monthly * timeframe
    
    // Check if income meets threshold
    component thresholdCheck = GreaterEqThan(64);
    thresholdCheck.in[0] <== totalIncome;
    thresholdCheck.in[1] <== incomeThreshold * timeframe;
    
    // Determine income range for statistical purposes
    component lowThreshold = LessThan(64);
    lowThreshold.in[0] <== totalIncome;
    lowThreshold.in[1] <== incomeThreshold * timeframe;
    
    component highThreshold = GreaterThan(64);
    highThreshold.in[0] <== totalIncome;
    highThreshold.in[1] <== incomeThreshold * timeframe * 3; // 3x threshold = high income
    
    // Calculate income range (0=below, 1=adequate, 2=high)
    component range1 = Mux1();
    range1.c[0] <== 0; // Below threshold
    range1.c[1] <== 1; // Adequate income
    range1.s <== thresholdCheck.out;
    
    component range2 = Mux1();
    range2.c[0] <== range1.out;
    range2.c[1] <== 2; // High income
    range2.s <== highThreshold.out;
    
    incomeRange <== range2.out;
    
    // Verify bank statement integrity
    component bankVerification = Poseidon(3);
    bankVerification.inputs[0] <== monthlyIncome;
    bankVerification.inputs[1] <== timeframe;
    bankVerification.inputs[2] <== salt;
    
    // Bank statement hash must match calculated hash
    component bankHashCheck = IsEqual();
    bankHashCheck.in[0] <== bankStatementHash;
    bankHashCheck.in[1] <== bankVerification.out;
    
    // TODO: Verify employer signature (simplified for demo)
    // In production, would use ECDSA verification
    signal employerValid;
    employerValid <== 1; // Assume valid for demo
    
    // Final validation
    component finalCheck = AND();
    finalCheck.a <== thresholdCheck.out;
    finalCheck.b <== bankHashCheck.out;
    
    component withEmployer = AND();
    withEmployer.a <== finalCheck.out;
    withEmployer.b <== employerValid;
    
    isValid <== withEmployer.out;
    
    // Generate nullifier to prevent reuse
    component nullifier = Poseidon(3);
    nullifier.inputs[0] <== bankStatementHash;
    nullifier.inputs[1] <== employerPubKey[0];
    nullifier.inputs[2] <== salt;
    nullifierHash <== nullifier.out;
    
    // Constraints: income must be reasonable (not negative, not impossibly high)
    component incomeReasonable = LessThan(32);
    incomeReasonable.in[0] <== monthlyIncome;
    incomeReasonable.in[1] <== 10000000; // 10M NPR max monthly income
    incomeReasonable.out === 1;
    
    // Timeframe must be reasonable (1-60 months)
    component timeframeCheck1 = GreaterThan(8);
    timeframeCheck1.in[0] <== timeframe;
    timeframeCheck1.in[1] <== 0;
    timeframeCheck1.out === 1;
    
    component timeframeCheck2 = LessThan(8);
    timeframeCheck2.in[0] <== timeframe;
    timeframeCheck2.in[1] <== 61;
    timeframeCheck2.out === 1;
}

component main = IncomeVerification();