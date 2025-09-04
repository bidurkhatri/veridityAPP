pragma circom 2.0.0;

template GreaterThan(n) {
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n);
    lt.in[0] <== in[1] + 1;
    lt.in[1] <== in[0] + 1;
    out <== lt.out;
}

template LessThan(n) {
    signal input in[2];
    signal output out;
    
    signal diff;
    diff <== in[0] - in[1];
    
    component num2Bits = Num2Bits(n);
    num2Bits.in <== diff + (1 << (n-1));
    
    out <== num2Bits.out[n-1];
}

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    
    var lc1=0;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * 2**i;
    }
    lc1 === in;
}

template AgeProof() {
    signal input age;
    signal input minAge;
    signal output valid;
    
    component gte = GreaterThan(8);
    gte.in[0] <== age;
    gte.in[1] <== minAge - 1;
    
    valid <== gte.out;
}

component main = AgeProof();