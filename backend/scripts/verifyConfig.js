// Verification script to check current blockchain configuration
require('dotenv').config();
const { ethers } = require('ethers');

console.log('🔍 Blockchain Configuration Verification\n');
console.log('=' .repeat(60));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log(`   PRIVATE_KEY: ${process.env.PRIVATE_KEY}`);
console.log(`   CONTRACT_ADDRESS: ${process.env.CONTRACT_ADDRESS}`);
console.log(`   SEPOLIA_RPC_URL: ${process.env.SEPOLIA_RPC_URL || 'http://127.0.0.1:8545'}`);

// Derive wallet address from private key
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
console.log(`\n🔐 Derived Wallet Address: ${wallet.address}`);

// Check if this matches the expected Ganache account
const expectedAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
const isCorrect = wallet.address.toLowerCase() === expectedAddress.toLowerCase();

console.log(`\n✅ Expected Address: ${expectedAddress}`);
console.log(`${isCorrect ? '✅' : '❌'} Match: ${isCorrect ? 'YES' : 'NO'}`);

if (!isCorrect) {
  console.log('\n⚠️  WARNING: Wallet address mismatch detected!');
  console.log('   The private key in .env does not match the contract owner.');
  console.log('   This will cause blockchain transactions to fail.');
  console.log('\n   Expected private key for Ganache account 0:');
  console.log('   0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d');
}

console.log('\n' + '='.repeat(60));
