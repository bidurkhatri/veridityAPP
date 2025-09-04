pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template CitizenshipVerification() {
    signal input citizenshipNumber;
    signal input district;
    signal input requiredDistrict;
    signal input salt;
    signal output isValid;
    signal output hash;

    // Check if district matches requirement (0 = any district)
    component districtEq = IsEqual();
    districtEq.in[0] <== district;
    districtEq.in[1] <== requiredDistrict;
    
    component noDistrictReq = IsEqual();
    noDistrictReq.in[0] <== requiredDistrict;
    noDistrictReq.in[1] <== 0;
    
    // Valid if no requirement OR district matches
    component districtOr = OR();
    districtOr.a <== noDistrictReq.out;
    districtOr.b <== districtEq.out;
    
    isValid <== districtOr.out;

    // Generate hash for uniqueness
    component hasher = Poseidon(3);
    hasher.inputs[0] <== citizenshipNumber;
    hasher.inputs[1] <== district;
    hasher.inputs[2] <== salt;
    
    hash <== hasher.out;
}

component main = CitizenshipVerification();