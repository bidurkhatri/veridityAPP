pragma circom 2.0.0;

// Age verification circuit - proves age >= threshold without revealing actual age
template AgeVerification() {
    // Private inputs
    signal private input age;
    signal private input salt; // For privacy
    
    // Public inputs  
    signal input ageThreshold; // 18 or 21
    signal input nonce; // Replay protection
    
    // Public outputs
    signal output isValid;
    signal output commitmentHash; // Hash of age + salt for privacy
    
    // Age must be >= threshold
    component gte = GreaterEqThan(8); // 8 bits = max age 255
    gte.in[0] <== age;
    gte.in[1] <== ageThreshold;
    
    // Output validity
    isValid <== gte.out;
    
    // Create commitment hash (age + salt)
    component hasher = Poseidon(3);
    hasher.inputs[0] <== age;
    hasher.inputs[1] <== salt;
    hasher.inputs[2] <== nonce;
    
    commitmentHash <== hasher.out;
    
    // Ensure age is reasonable (0-150)
    component ageRange = LessThan(8);
    ageRange.in[0] <== age;
    ageRange.in[1] <== 151;
    ageRange.out === 1;
}

component main = AgeVerification();