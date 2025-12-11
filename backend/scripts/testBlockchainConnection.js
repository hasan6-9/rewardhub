// backend/scripts/testBlockchainConnection.js
// Diagnostic script to test blockchain connection and identify issues

const { ethers } = require("ethers");
require("dotenv").config();

async function testConnection() {
  console.log("🧪 RewardHub Blockchain Connection Diagnostic\n");
  console.log("=".repeat(60));
  
  let allTestsPassed = true;
  
  // ========================================================================
  // Test 1: Environment Variables
  // ========================================================================
  console.log("\n1. Checking environment variables...");
  console.log("-".repeat(60));
  
  const requiredEnvVars = ["PRIVATE_KEY", "CONTRACT_ADDRESS"];
  const optionalEnvVars = ["SEPOLIA_RPC_URL"];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar}: ${process.env[envVar].substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${envVar}: NOT SET`);
      allTestsPassed = false;
    }
  }
  
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar}: ${process.env[envVar]}`);
    } else {
      console.log(`   ⚠️  ${envVar}: NOT SET (using default: http://127.0.0.1:8545)`);
    }
  }
  
  if (!allTestsPassed) {
    console.log("\n❌ Missing required environment variables. Cannot continue.");
    process.exit(1);
  }
  
  // ========================================================================
  // Test 2: Provider Connection
  // ========================================================================
  console.log("\n2. Testing provider connection...");
  console.log("-".repeat(60));
  
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545";
  console.log(`   RPC URL: ${rpcUrl}`);
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  try {
    const network = await provider.getNetwork();
    console.log(`   ✅ Connected to network`);
    console.log(`      Chain ID: ${network.chainId}`);
    console.log(`      Name: ${network.name || "unknown"}`);
    
    const blockNumber = await provider.getBlockNumber();
    console.log(`      Current block: ${blockNumber}`);
  } catch (err) {
    console.log(`   ❌ Provider connection failed: ${err.message}`);
    console.log("\n   Possible causes:");
    console.log("   - Ganache is not running");
    console.log("   - Wrong RPC URL");
    console.log("   - Network connectivity issues");
    console.log("\n   Solution:");
    console.log("   - Start Ganache: ganache --deterministic --accounts 10 --wallet.defaultBalance 1000");
    allTestsPassed = false;
    process.exit(1);
  }
  
  // ========================================================================
  // Test 3: Wallet Validation
  // ========================================================================
  console.log("\n3. Testing wallet...");
  console.log("-".repeat(60));
  
  let wallet;
  try {
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`   ✅ Wallet created`);
    console.log(`      Address: ${wallet.address}`);
  } catch (err) {
    console.log(`   ❌ Wallet creation failed: ${err.message}`);
    console.log("\n   Possible causes:");
    console.log("   - Invalid PRIVATE_KEY format");
    console.log("   - PRIVATE_KEY is missing 0x prefix");
    allTestsPassed = false;
    process.exit(1);
  }
  
  try {
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`   ✅ Balance: ${balanceEth} ETH`);
    
    if (balance === 0n) {
      console.log(`   ⚠️  WARNING: Wallet has no ETH for gas!`);
      console.log("      You won't be able to send transactions.");
      allTestsPassed = false;
    }
  } catch (err) {
    console.log(`   ❌ Failed to get balance: ${err.message}`);
    allTestsPassed = false;
  }
  
  // ========================================================================
  // Test 4: Contract Connection
  // ========================================================================
  console.log("\n4. Testing contract connection...");
  console.log("-".repeat(60));
  
  const contractAddress = process.env.CONTRACT_ADDRESS;
  console.log(`   Contract address: ${contractAddress}`);
  
  let contract;
  try {
    const RewardHubTokenABI = require("../blockchain/RewardHubTokenABI.json");
    contract = new ethers.Contract(contractAddress, RewardHubTokenABI, wallet);
    console.log(`   ✅ Contract instance created`);
  } catch (err) {
    console.log(`   ❌ Contract creation failed: ${err.message}`);
    allTestsPassed = false;
    process.exit(1);
  }
  
  // Check if contract is deployed
  try {
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.log(`   ❌ No contract deployed at ${contractAddress}`);
      console.log("\n   Solution:");
      console.log("   - Deploy contract: npx hardhat run scripts/deploy.js --network localhost");
      console.log("   - Update CONTRACT_ADDRESS in .env");
      allTestsPassed = false;
      process.exit(1);
    } else {
      console.log(`   ✅ Contract code found (${code.length} bytes)`);
    }
  } catch (err) {
    console.log(`   ❌ Failed to check contract code: ${err.message}`);
    allTestsPassed = false;
  }
  
  // ========================================================================
  // Test 5: Contract Read Operations
  // ========================================================================
  console.log("\n5. Testing contract read operations...");
  console.log("-".repeat(60));
  
  try {
    const owner = await contract.owner();
    console.log(`   ✅ owner(): ${owner}`);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log(`   ⚠️  WARNING: Wallet (${wallet.address}) is NOT the contract owner!`);
      console.log("      You won't be able to call owner-only functions.");
      console.log("\n      Solution:");
      console.log("      - Run: node scripts/fixOwnership.js");
    }
  } catch (err) {
    console.log(`   ❌ owner() failed: ${err.message}`);
    allTestsPassed = false;
  }
  
  try {
    const name = await contract.name();
    console.log(`   ✅ name(): ${name}`);
  } catch (err) {
    console.log(`   ❌ name() failed: ${err.message}`);
  }
  
  try {
    const symbol = await contract.symbol();
    console.log(`   ✅ symbol(): ${symbol}`);
  } catch (err) {
    console.log(`   ❌ symbol() failed: ${err.message}`);
  }
  
  try {
    const decimals = await contract.decimals();
    console.log(`   ✅ decimals(): ${decimals}`);
  } catch (err) {
    console.log(`   ❌ decimals() failed: ${err.message}`);
  }
  
  try {
    const totalSupply = await contract.totalSupply();
    console.log(`   ✅ totalSupply(): ${totalSupply.toString()}`);
  } catch (err) {
    console.log(`   ❌ totalSupply() failed: ${err.message}`);
  }
  
  // ========================================================================
  // Test 6: Gas Estimation (Dry Run)
  // ========================================================================
  console.log("\n6. Testing addAchievement (gas estimation - DRY RUN)...");
  console.log("-".repeat(60));
  
  const testTitle = `Test Diagnostic ${Date.now()}`;
  const testReward = 100;
  
  try {
    const gasEstimate = await contract.addAchievement.estimateGas(testTitle, testReward);
    console.log(`   ✅ Gas estimate successful: ${gasEstimate.toString()}`);
    console.log("      addAchievement should work!");
  } catch (err) {
    console.log(`   ❌ Gas estimation failed: ${err.message}`);
    console.log("\n   Full error details:");
    console.log(err);
    
    console.log("\n   Possible causes:");
    console.log("   - Not contract owner");
    console.log("   - Contract function signature mismatch");
    console.log("   - Ganache state corruption");
    
    console.log("\n   Solutions:");
    console.log("   1. Check ownership: node scripts/fixOwnership.js");
    console.log("   2. Restart Ganache and redeploy contract");
    
    allTestsPassed = false;
  }
  
  // ========================================================================
  // Test 7: Connection Stability Test
  // ========================================================================
  console.log("\n7. Testing connection stability (5 rapid requests)...");
  console.log("-".repeat(60));
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < 5; i++) {
    try {
      await provider.getBlockNumber();
      successCount++;
      process.stdout.write("   ✅");
    } catch (err) {
      failCount++;
      process.stdout.write("   ❌");
    }
  }
  
  console.log(`\n   Results: ${successCount}/5 successful`);
  
  if (failCount > 0) {
    console.log(`   ⚠️  ${failCount} requests failed - connection is unstable`);
    console.log("\n   Possible causes:");
    console.log("   - Ganache CLI v6.x bug (known issue)");
    console.log("   - Network throttling");
    console.log("   - RPC provider issues");
    
    console.log("\n   Solution:");
    console.log("   - Upgrade to Ganache v7+:");
    console.log("     npm uninstall -g ganache-cli");
    console.log("     npm install -g ganache@latest");
    console.log("     ganache --deterministic --accounts 10 --wallet.defaultBalance 1000");
    
    allTestsPassed = false;
  }
  
  // ========================================================================
  // Summary
  // ========================================================================
  console.log("\n" + "=".repeat(60));
  if (allTestsPassed) {
    console.log("✅ ALL TESTS PASSED");
    console.log("=".repeat(60));
    console.log("\n   Your blockchain connection is healthy!");
    console.log("   You should be able to sync achievements to the blockchain.");
  } else {
    console.log("❌ SOME TESTS FAILED");
    console.log("=".repeat(60));
    console.log("\n   Review the errors above and follow the suggested solutions.");
  }
  
  console.log("\n");
}

// Run the diagnostic
testConnection().catch((err) => {
  console.error("\n❌ Diagnostic crashed:", err);
  process.exit(1);
});
