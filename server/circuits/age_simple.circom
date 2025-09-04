pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template AgeVerification() {
    signal input age;
    signal input minAge;
    signal output isValid;

    component gte = GreaterEqThan(8);
    gte.in[0] <== age;
    gte.in[1] <== minAge;
    
    isValid <== gte.out;
}

component main = AgeVerification();