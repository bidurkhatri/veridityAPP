pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// Citizenship verification circuit
// Proves valid Nepali citizenship without revealing citizenship number
template CitizenshipVerification() {
    // Private inputs (secret)
    signal private input citizenshipNumber[16];
    signal private input district;
    signal private input issueYear;
    signal private input gender;
    
    // Public inputs
    signal input salt;
    signal input requiredDistrict;
    signal input minIssueYear;
    signal input requiredGender;
    
    // Output
    signal output isValid;
    signal output citizenshipHash;

    // Validate citizenship number format
    // Nepali citizenship numbers have specific patterns
    component citizenshipDigitChecks[16];
    signal validDigits[16];
    
    for (var i = 0; i < 16; i++) {
        citizenshipDigitChecks[i] = GreaterEqThan(4);
        citizenshipDigitChecks[i].in[0] <== citizenshipNumber[i];
        citizenshipDigitChecks[i].in[1] <== 0;
        
        component upperCheck = GreaterEqThan(4);
        upperCheck.in[0] <== 10;
        upperCheck.in[1] <== citizenshipNumber[i];
        
        component and1 = AND();
        and1.a <== citizenshipDigitChecks[i].out;
        and1.b <== upperCheck.out;
        
        validDigits[i] <== and1.out;
    }
    
    // All digits must be valid (0-9)
    signal digitSum;
    digitSum <== validDigits[0] + validDigits[1] + validDigits[2] + validDigits[3] + 
                 validDigits[4] + validDigits[5] + validDigits[6] + validDigits[7] + 
                 validDigits[8] + validDigits[9] + validDigits[10] + validDigits[11] + 
                 validDigits[12] + validDigits[13] + validDigits[14] + validDigits[15];
    
    component allDigitsValid = IsEqual();
    allDigitsValid.in[0] <== digitSum;
    allDigitsValid.in[1] <== 16;
    
    // Validate district code (Nepal has 77 districts)
    component districtCheck = GreaterEqThan(7);
    districtCheck.in[0] <== district;
    districtCheck.in[1] <== 1;
    
    component districtUpperCheck = GreaterEqThan(7);
    districtUpperCheck.in[0] <== 78;
    districtUpperCheck.in[1] <== district;
    
    component validDistrict = AND();
    validDistrict.a <== districtCheck.out;
    validDistrict.b <== districtUpperCheck.out;
    
    // Validate issue year (citizenship started around 2000)
    component yearCheck = GreaterEqThan(12);
    yearCheck.in[0] <== issueYear;
    yearCheck.in[1] <== 2000;
    
    component yearUpperCheck = GreaterEqThan(12);
    yearUpperCheck.in[0] <== 2025;
    yearUpperCheck.in[1] <== issueYear;
    
    component validYear = AND();
    validYear.a <== yearCheck.out;
    validYear.b <== yearUpperCheck.out;
    
    // Validate gender
    component genderCheck1 = GreaterEqThan(2);
    genderCheck1.in[0] <== gender;
    genderCheck1.in[1] <== 1;
    
    component genderCheck2 = GreaterEqThan(2);
    genderCheck2.in[0] <== 4;
    genderCheck2.in[1] <== gender;
    
    component validGender = AND();
    validGender.a <== genderCheck1.out;
    validGender.b <== genderCheck2.out;
    
    // Check requirements if specified
    signal districtMatch;
    component districtReqCheck = IsEqual();
    districtReqCheck.in[0] <== requiredDistrict;
    districtReqCheck.in[1] <== 0;
    
    component districtMatchCheck = IsEqual();
    districtMatchCheck.in[0] <== district;
    districtMatchCheck.in[1] <== requiredDistrict;
    
    component districtOr = OR();
    districtOr.a <== districtReqCheck.out;  // No requirement
    districtOr.b <== districtMatchCheck.out;  // Matches requirement
    districtMatch <== districtOr.out;
    
    // Year requirement check
    signal yearMatch;
    component yearReqCheck = IsEqual();
    yearReqCheck.in[0] <== minIssueYear;
    yearReqCheck.in[1] <== 0;
    
    component yearMatchCheck = GreaterEqThan(12);
    yearMatchCheck.in[0] <== issueYear;
    yearMatchCheck.in[1] <== minIssueYear;
    
    component yearOr = OR();
    yearOr.a <== yearReqCheck.out;  // No requirement
    yearOr.b <== yearMatchCheck.out;  // Meets requirement
    yearMatch <== yearOr.out;
    
    // Gender requirement check
    signal genderMatch;
    component genderReqCheck = IsEqual();
    genderReqCheck.in[0] <== requiredGender;
    genderReqCheck.in[1] <== 0;
    
    component genderMatchCheck = IsEqual();
    genderMatchCheck.in[0] <== gender;
    genderMatchCheck.in[1] <== requiredGender;
    
    component genderOr = OR();
    genderOr.a <== genderReqCheck.out;  // No requirement
    genderOr.b <== genderMatchCheck.out;  // Matches requirement
    genderMatch <== genderOr.out;
    
    // Final validation: all checks must pass
    component finalAnd1 = AND();
    finalAnd1.a <== allDigitsValid.out;
    finalAnd1.b <== validDistrict.out;
    
    component finalAnd2 = AND();
    finalAnd2.a <== finalAnd1.out;
    finalAnd2.b <== validYear.out;
    
    component finalAnd3 = AND();
    finalAnd3.a <== finalAnd2.out;
    finalAnd3.b <== validGender.out;
    
    component finalAnd4 = AND();
    finalAnd4.a <== finalAnd3.out;
    finalAnd4.b <== districtMatch;
    
    component finalAnd5 = AND();
    finalAnd5.a <== finalAnd4.out;
    finalAnd5.b <== yearMatch;
    
    component finalAnd6 = AND();
    finalAnd6.a <== finalAnd5.out;
    finalAnd6.b <== genderMatch;
    
    isValid <== finalAnd6.out;
    
    // Generate citizenship hash for uniqueness (without revealing number)
    component hasher = Poseidon(17);  // 16 digits + salt
    for (var i = 0; i < 16; i++) {
        hasher.inputs[i] <== citizenshipNumber[i];
    }
    hasher.inputs[16] <== salt;
    citizenshipHash <== hasher.out;
}

component main = CitizenshipVerification();