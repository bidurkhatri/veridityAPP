pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/gates.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

// Age verification circuit
// Proves that user's age is >= minimum age without revealing exact age
template AgeVerification() {
    // Private inputs (secret)
    signal input birthYear;
    signal input birthMonth;
    signal input birthDay;
    signal input currentYear;
    signal input currentMonth;
    signal input currentDay;
    
    // Public inputs
    signal input minAge;
    signal input salt;
    
    // Output
    signal output isValid;

    // Calculate age in years
    signal yearDiff;
    yearDiff <== currentYear - birthYear;
    
    // Check if birthday has passed this year
    signal monthDiff;
    monthDiff <== currentMonth - birthMonth;
    
    signal dayDiff;
    dayDiff <== currentDay - birthDay;
    
    // If birth month hasn't occurred yet, or same month but day hasn't occurred
    signal monthNotPassed;
    component monthLess = LessThan(4);  // Assuming months are 1-12
    monthLess.in[0] <== currentMonth;
    monthLess.in[1] <== birthMonth;
    monthNotPassed <== monthLess.out;
    
    signal dayNotPassed;
    component dayLess = LessThan(6);    // Assuming days are 1-31  
    dayLess.in[0] <== currentDay;
    dayLess.in[1] <== birthDay;
    dayNotPassed <== dayLess.out;
    
    signal sameMonth;
    component monthEqual = IsEqual();
    monthEqual.in[0] <== currentMonth;
    monthEqual.in[1] <== birthMonth;
    sameMonth <== monthEqual.out;
    
    signal birthdayNotPassed;
    component and1 = AND();
    and1.a <== sameMonth;
    and1.b <== dayNotPassed;
    birthdayNotPassed <== and1.out;
    
    component or1 = OR();
    or1.a <== monthNotPassed;
    or1.b <== birthdayNotPassed;
    
    // Actual age calculation
    signal actualAge;
    actualAge <== yearDiff - or1.out;
    
    // Check if actual age >= minimum age
    component ageCheck = GreaterEqThan(8);  // Support ages up to 255
    ageCheck.in[0] <== actualAge;
    ageCheck.in[1] <== minAge;
    
    isValid <== ageCheck.out;
    
    // Constraint: birthYear should be reasonable (between 1900 and current year)
    component yearRangeCheck = GreaterEqThan(12);
    yearRangeCheck.in[0] <== birthYear;
    yearRangeCheck.in[1] <== 1900;
    yearRangeCheck.out === 1;
    
    component yearUpperCheck = GreaterEqThan(12);
    yearUpperCheck.in[0] <== currentYear;
    yearUpperCheck.in[1] <== birthYear;
    yearUpperCheck.out === 1;
    
    // Constraint: months should be 1-12
    component monthRange1 = GreaterEqThan(4);
    monthRange1.in[0] <== birthMonth;
    monthRange1.in[1] <== 1;
    monthRange1.out === 1;
    
    component monthRange2 = GreaterEqThan(4);
    monthRange2.in[0] <== 13;
    monthRange2.in[1] <== birthMonth;
    monthRange2.out === 1;
    
    // Constraint: days should be 1-31
    component dayRange1 = GreaterEqThan(5);
    dayRange1.in[0] <== birthDay;
    dayRange1.in[1] <== 1;
    dayRange1.out === 1;
    
    component dayRange2 = GreaterEqThan(5);
    dayRange2.in[0] <== 32;
    dayRange2.in[1] <== birthDay;
    dayRange2.out === 1;
}

component main = AgeVerification();