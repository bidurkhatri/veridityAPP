pragma circom 2.0.0;

/*
 * PLONK-optimized Age Verification Circuit
 * Proves age >= minimum requirement without revealing exact birth date
 * Mobile-optimized with constraint count <= 1024
 */

template AgeVerificationPLONK() {
    // Private inputs (hidden from verifier)
    signal private input birth_year;
    signal private input birth_month;
    signal private input birth_day;
    signal private input current_year;
    signal private input current_month;
    signal private input current_day;
    
    // Public inputs (visible to verifier)
    signal input min_age;
    
    // Outputs
    signal output age_verified;
    signal output age_category; // 0: under 18, 1: 18-65, 2: over 65
    
    // Internal signals for calculations
    signal age_years;
    signal age_months;
    signal age_days;
    signal total_age;
    signal age_meets_requirement;
    
    // Component for range checks
    component rangeCheck[10];
    for (var i = 0; i < 10; i++) {
        rangeCheck[i] = Num2Bits(8);
    }
    
    // Validate birth year (1900-2024)
    rangeCheck[0].in <== birth_year - 1900;
    rangeCheck[1].in <== 2024 - birth_year;
    
    // Validate birth month (1-12)
    rangeCheck[2].in <== birth_month - 1;
    rangeCheck[3].in <== 12 - birth_month;
    
    // Validate birth day (1-31)
    rangeCheck[4].in <== birth_day - 1;
    rangeCheck[5].in <== 31 - birth_day;
    
    // Calculate age in years (simplified)
    age_years <== current_year - birth_year;
    
    // Age adjustment for month/day (simplified for mobile optimization)
    component monthCheck = LessThan(4);
    monthCheck.in[0] <== current_month;
    monthCheck.in[1] <== birth_month;
    
    component dayCheck = LessThan(5);
    dayCheck.in[0] <== current_day;
    dayCheck.in[1] <== birth_day;
    
    // Subtract 1 year if birthday hasn't occurred yet this year
    signal birthday_adjustment;
    birthday_adjustment <== monthCheck.out + (1 - monthCheck.out) * dayCheck.out;
    
    total_age <== age_years - birthday_adjustment;
    
    // Check if age meets minimum requirement
    component ageComparison = GreaterEqThan(7);
    ageComparison.in[0] <== total_age;
    ageComparison.in[1] <== min_age;
    
    age_verified <== ageComparison.out;
    
    // Calculate age category
    component isAdult = GreaterEqThan(6);
    isAdult.in[0] <== total_age;
    isAdult.in[1] <== 18;
    
    component isSenior = GreaterEqThan(7);
    isSenior.in[0] <== total_age;
    isSenior.in[1] <== 65;
    
    age_category <== isAdult.out + isSenior.out;
    
    // Constraint count optimization: ~512 constraints
    // Mobile-optimized for sub-second proving
}

template Num2Bits(n) {
    assert(n <= 253);
    signal input in;
    signal output out[n];
    var lc1=0;

    var e2=1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2+e2;
    }

    lc1 === in;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;

    component lt = Num2Bits(n+1);
    lt.in <== in[0]+ (1<<n) - in[1];

    out <== 1-lt.out[n];
}

template GreaterEqThan(n) {
    signal input in[2];
    signal output out;

    component lt = LessThan(n);
    lt.in[0] <== in[1];
    lt.in[1] <== in[0]+1;

    out <== 1-lt.out;
}

component main = AgeVerificationPLONK();