#!/bin/bash

# ZK Circuit Build Script for Veridity
# Builds age verification circuits for public verification

set -e

echo "🔧 Building Veridity ZK Circuits..."

# Create output directories
mkdir -p build/age18 build/age21 public

# Download Powers of Tau (trusted setup)
if [ ! -f "ptau/pot20_final.ptau" ]; then
    echo "📥 Downloading Powers of Tau..."
    mkdir -p ptau
    wget -O ptau/pot20_final.ptau https://hermez.s3-eu-west-1.amazonaws.com/pot20_final.ptau
fi

# Build Age >= 18 circuit
echo "🔨 Building Age >= 18 circuit..."
circom age.circom --r1cs --wasm --sym -o build/age18 -c age18
cd build/age18
snarkjs groth16 setup age.r1cs ../../ptau/pot20_final.ptau age18_0000.zkey
snarkjs zkey contribute age18_0000.zkey age18_0001.zkey --name="First contribution" -v -e="random entropy"
snarkjs zkey export verificationkey age18_0001.zkey verification_key.json
cd ../..

# Build Age >= 21 circuit  
echo "🔨 Building Age >= 21 circuit..."
circom age.circom --r1cs --wasm --sym -o build/age21 -c age21
cd build/age21
snarkjs groth16 setup age.r1cs ../../ptau/pot20_final.ptau age21_0000.zkey
snarkjs zkey contribute age21_0000.zkey age21_0001.zkey --name="First contribution" -v -e="random entropy"
snarkjs zkey export verificationkey age21_0001.zkey verification_key.json
cd ../..

# Copy WASM and verification keys to public directory
echo "📋 Copying public files..."
cp build/age18/age_js/age.wasm public/age18.wasm
cp build/age18/age18_0001.zkey public/age18.zkey
cp build/age18/verification_key.json public/age18_vkey.json

cp build/age21/age_js/age.wasm public/age21.wasm
cp build/age21/age21_0001.zkey public/age21.zkey  
cp build/age21/verification_key.json public/age21_vkey.json

# Create checksums for integrity
echo "🔒 Creating checksums..."
cd public
sha256sum *.wasm *.zkey *.json > checksums.txt
cd ..

echo "✅ ZK circuits built successfully!"
echo "📁 Public files available in: ./circuits/public/"
echo "🧪 Run tests with: bun run zkp:test"