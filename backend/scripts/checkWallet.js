// Quick diagnostic to check wallet configuration
require("dotenv").config();
const { ethers } = require("ethers");

console.log("\n🔍 Wallet Configuration Diagnostic\n");
console.log("=".repeat(60));

console.log("\n1. Environment Variables:");
console.log("   PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("   CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);

console.log("\n2. Wallet from Private Key:");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
console.log("   Address:", wallet.address);

console.log("\n3. Expected Ganache Account 0:");
console.log("   Address: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1");
console.log("   Private Key: 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d");

console.log("\n4. Match Check:");
if (wallet.address.toLowerCase() === "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1".toLowerCase()) {
  console.log("   ✅ Wallet matches expected Ganache account 0");
} else {
  console.log("   ❌ Wallet DOES NOT match!");
  console.log("   Expected: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1");
  console.log("   Got:      " + wallet.address);
}

console.log("\n5. Blockchain Service Check:");
const blockchain = require("../blockchain/contract");
console.log("   Blockchain wallet address:", blockchain.wallet.address);

if (blockchain.wallet.address.toLowerCase() === wallet.address.toLowerCase()) {
  console.log("   ✅ Blockchain service using correct wallet");
} else {
  console.log("   ❌ Blockchain service using WRONG wallet!");
  console.log("   Expected: " + wallet.address);
  console.log("   Got:      " + blockchain.wallet.address);
}

console.log("\n" + "=".repeat(60));
console.log("\n");
