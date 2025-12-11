// backend/scripts/diagnoseContract.js
// Diagnostic script to check contract deployment and functions

const { ethers } = require("ethers");
require("dotenv").config();

const RewardHubTokenABI = require("../blockchain/RewardHubTokenABI.json");

async function diagnoseContract() {
  console.log("🔍 RewardHub Contract Diagnostic Tool\n");
  console.log("=" .repeat(60));

  try {
    // 1. Check environment variables
    console.log("1. Environment Variables:");
    console.log("-".repeat(60));
    console.log(`   CONTRACT_ADDRESS: ${process.env.CONTRACT_ADDRESS || "❌ NOT SET"}`);
    console.log(`   SEPOLIA_RPC_URL:  ${process.env.SEPOLIA_RPC_URL || "❌ NOT SET"}`);
    console.log(`   PRIVATE_KEY:      ${process.env.PRIVATE_KEY ? "✅ Set" : "❌ NOT SET"}`);
    
    if (!process.env.CONTRACT_ADDRESS) {
      console.log("\n❌ CONTRACT_ADDRESS not set in .env file!");
      console.log("   Run: npx hardhat run scripts/deploy.js --network localhost");
      process.exit(1);
    }

    // 2. Check provider connection
    console.log("\n2. Provider Connection:");
    console.log("-".repeat(60));
    const provider = new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545"
    );
    
    try {
      const network = await provider.getNetwork();
      console.log(`   ✅ Connected to network: ${network.name} (chainId: ${network.chainId})`);
      
      const blockNumber = await provider.getBlockNumber();
      console.log(`   ✅ Current block number: ${blockNumber}`);
    } catch (err) {
      console.log(`   ❌ Failed to connect to provider: ${err.message}`);
      console.log("   Make sure Ganache is running on port 8545");
      process.exit(1);
    }

    // 3. Check wallet
    console.log("\n3. Wallet:");
    console.log("-".repeat(60));
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`   Address: ${wallet.address}`);
    
    const balance = await provider.getBalance(wallet.address);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance === 0n) {
      console.log("   ⚠️  WARNING: Wallet has no ETH!");
    } else {
      console.log("   ✅ Wallet has sufficient ETH");
    }

    // 4. Check if contract exists
    console.log("\n4. Contract Deployment:");
    console.log("-".repeat(60));
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const code = await provider.getCode(contractAddress);
    
    if (code === "0x") {
      console.log(`   ❌ No contract found at address: ${contractAddress}`);
      console.log("   The contract may not be deployed or wrong address in .env");
      console.log("   Redeploy with: npx hardhat run scripts/deploy.js --network localhost");
      process.exit(1);
    } else {
      console.log(`   ✅ Contract exists at: ${contractAddress}`);
      console.log(`   Code size: ${(code.length - 2) / 2} bytes`);
    }

    // 5. Create contract instance
    console.log("\n5. Contract Instance:");
    console.log("-".repeat(60));
    const contract = new ethers.Contract(contractAddress, RewardHubTokenABI, wallet);
    console.log(`   ✅ Contract instance created`);

    // 6. Check contract owner
    console.log("\n6. Contract Ownership:");
    console.log("-".repeat(60));
    try {
      const owner = await contract.owner();
      console.log(`   Contract owner: ${owner}`);
      console.log(`   Wallet address: ${wallet.address}`);
      
      if (owner.toLowerCase() === wallet.address.toLowerCase()) {
        console.log(`   ✅ Wallet IS the contract owner`);
      } else {
        console.log(`   ❌ Wallet IS NOT the contract owner!`);
        console.log(`   This will cause "Ownable: caller is not the owner" errors`);
      }
    } catch (err) {
      console.log(`   ❌ Failed to get owner: ${err.message}`);
    }

    // 7. Check basic contract functions
    console.log("\n7. Contract Functions:");
    console.log("-".repeat(60));
    
    try {
      const name = await contract.name();
      console.log(`   Token name: ${name}`);
    } catch (err) {
      console.log(`   ❌ name(): ${err.message}`);
    }

    try {
      const symbol = await contract.symbol();
      console.log(`   Token symbol: ${symbol}`);
    } catch (err) {
      console.log(`   ❌ symbol(): ${err.message}`);
    }

    try {
      const decimals = await contract.decimals();
      console.log(`   Token decimals: ${decimals}`);
    } catch (err) {
      console.log(`   ❌ decimals(): ${err.message}`);
    }

    try {
      const totalSupply = await contract.totalSupply();
      console.log(`   Total supply: ${ethers.formatEther(totalSupply)} tokens`);
    } catch (err) {
      console.log(`   ❌ totalSupply(): ${err.message}`);
    }

    // 8. Test addAchievement function (dry run)
    console.log("\n8. Testing addAchievement (DRY RUN):");
    console.log("-".repeat(60));
    
    const testTitle = "Test Diagnostic Achievement";
    const testReward = 100;
    
    try {
      // Check if achievement already exists
      const existingAchievement = await contract.achievements(testTitle);
      if (existingAchievement.rewardAmount > 0) {
        console.log(`   ℹ️  Achievement "${testTitle}" already exists`);
        console.log(`      Reward: ${existingAchievement.rewardAmount}`);
        console.log(`      Active: ${existingAchievement.isActive}`);
      } else {
        console.log(`   ✅ Achievement "${testTitle}" does not exist yet`);
      }

      // Estimate gas for addAchievement
      console.log(`\n   Estimating gas for addAchievement("${testTitle}", ${testReward})...`);
      const gasEstimate = await contract.addAchievement.estimateGas(testTitle, testReward);
      console.log(`   ✅ Gas estimate: ${gasEstimate.toString()}`);
      console.log(`   This means addAchievement should work!`);

    } catch (err) {
      console.log(`   ❌ addAchievement gas estimation failed:`);
      console.log(`      Error: ${err.message}`);
      
      if (err.message.includes("Ownable")) {
        console.log(`\n   🔴 PROBLEM: Wallet is not the contract owner!`);
        console.log(`      Solution: Use the same private key that deployed the contract`);
      } else if (err.message.includes("revert data")) {
        console.log(`\n   🔴 PROBLEM: Transaction would revert`);
        console.log(`      Possible causes:`);
        console.log(`      - Not contract owner`);
        console.log(`      - Contract function signature mismatch`);
        console.log(`      - Contract has different implementation`);
      }
    }

    // 9. List available contract functions
    console.log("\n9. Available Contract Functions:");
    console.log("-".repeat(60));
    const functionNames = RewardHubTokenABI
      .filter(item => item.type === "function")
      .map(item => item.name);
    
    console.log(`   Found ${functionNames.length} functions:`);
    functionNames.forEach(name => {
      console.log(`   - ${name}`);
    });

    // 10. Summary
    console.log("\n" + "=".repeat(60));
    console.log("DIAGNOSTIC SUMMARY:");
    console.log("=".repeat(60));

    const owner = await contract.owner();
    const isOwner = owner.toLowerCase() === wallet.address.toLowerCase();

    if (!isOwner) {
      console.log("❌ CRITICAL ISSUE: Wallet is not contract owner!");
      console.log("\n🔧 SOLUTION:");
      console.log("   1. Check which private key deployed the contract");
      console.log("   2. Update PRIVATE_KEY in .env to match deployer's key");
      console.log("   3. OR redeploy contract with current private key:");
      console.log("      npx hardhat run scripts/deploy.js --network localhost");
      console.log("\n   Contract owner:  " + owner);
      console.log("   Current wallet:  " + wallet.address);
    } else {
      console.log("✅ All checks passed! Contract should work correctly.");
      console.log("\nYou can now:");
      console.log("   - Create achievements with blockchain sync");
      console.log("   - Create perks with blockchain sync");
      console.log("   - Award achievements to students");
    }

  } catch (err) {
    console.error("\n❌ Diagnostic failed:", err);
    process.exit(1);
  }
}

// Run diagnostic
if (require.main === module) {
  diagnoseContract()
    .then(() => {
      console.log("\n✅ Diagnostic complete\n");
      process.exit(0);
    })
    .catch(err => {
      console.error("\n❌ Fatal error:", err);
      process.exit(1);
    });
}

module.exports = diagnoseContract;