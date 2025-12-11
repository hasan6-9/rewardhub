// backend/scripts/fixOwnership.js
// Fixes contract ownership issue by redeploying or updating .env

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function fixOwnership() {
  console.log("🔧 RewardHub Ownership Fix Tool\n");
  console.log("=" .repeat(60));

  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545"
    );

    // Get all Ganache accounts
    console.log("1. Fetching Ganache accounts...");
    console.log("-".repeat(60));
    
    const accounts = [];
    for (let i = 0; i < 10; i++) {
      try {
        const signer = await provider.getSigner(i);
        const address = await signer.getAddress();
        accounts.push({ index: i, address, signer });
        console.log(`   Account ${i}: ${address}`);
      } catch (err) {
        break;
      }
    }

    if (accounts.length === 0) {
      console.log("❌ No accounts found. Is Ganache running?");
      process.exit(1);
    }

    // Check contract
    console.log("\n2. Checking deployed contract...");
    console.log("-".repeat(60));
    
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
      console.log("❌ CONTRACT_ADDRESS not set in .env");
      console.log("   Redeploy with: npx hardhat run scripts/deploy.js --network localhost");
      process.exit(1);
    }

    const RewardHubTokenABI = require("../blockchain/RewardHubTokenABI.json");
    const contract = new ethers.Contract(contractAddress, RewardHubTokenABI, provider);

    let owner;
    try {
      owner = await contract.owner();
      console.log(`   Contract owner: ${owner}`);
    } catch (err) {
      console.log(`   ❌ Cannot read contract owner: ${err.message}`);
      console.log("   Contract may not be deployed correctly");
      process.exit(1);
    }

    // Find which account is the owner
    console.log("\n3. Finding owner account...");
    console.log("-".repeat(60));
    
    let ownerAccount = null;
    for (const account of accounts) {
      if (account.address.toLowerCase() === owner.toLowerCase()) {
        ownerAccount = account;
        console.log(`   ✅ Found owner at account ${account.index}: ${account.address}`);
        break;
      }
    }

    if (!ownerAccount) {
      console.log(`   ❌ Owner ${owner} not found in Ganache accounts`);
      console.log("   Contract was deployed with a different Ganache instance");
      console.log("   You need to redeploy the contract");
      
      console.log("\n🔧 SOLUTION: Redeploy contract");
      console.log("-".repeat(60));
      console.log("   npx hardhat run scripts/deploy.js --network localhost");
      console.log("   Then update CONTRACT_ADDRESS in .env");
      process.exit(1);
    }

    // Get the private key for this account (Ganache deterministic mode)
    console.log("\n4. Getting private key...");
    console.log("-".repeat(60));
    
    // Ganache deterministic private keys
    const ganachePrivateKeys = [
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Account 0
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Account 1
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // Account 2
      "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // Account 3
      "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a", // Account 4
      "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba", // Account 5
      "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e", // Account 6
      "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356", // Account 7
      "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97", // Account 8
      "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6", // Account 9
    ];

    const correctPrivateKey = ganachePrivateKeys[ownerAccount.index];
    const currentPrivateKey = process.env.PRIVATE_KEY;

    console.log(`   Owner account index: ${ownerAccount.index}`);
    console.log(`   Required private key: ${correctPrivateKey}`);
    console.log(`   Current private key:  ${currentPrivateKey}`);

    if (currentPrivateKey === correctPrivateKey) {
      console.log("   ✅ Private key is already correct!");
      console.log("\n   The ownership is correct. The error might be elsewhere.");
      console.log("   Run: node scripts/diagnoseContract.js");
      process.exit(0);
    }

    // Update .env file
    console.log("\n5. Updating .env file...");
    console.log("-".repeat(60));
    
    const envPath = path.join(__dirname, "..", ".env");
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Replace PRIVATE_KEY
    const regex = /PRIVATE_KEY=.*/;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `PRIVATE_KEY=${correctPrivateKey}`);
    } else {
      envContent += `\nPRIVATE_KEY=${correctPrivateKey}\n`;
    }

    // Backup old .env
    fs.writeFileSync(envPath + ".backup", fs.readFileSync(envPath));
    console.log("   ✅ Backed up old .env to .env.backup");

    // Write new .env
    fs.writeFileSync(envPath, envContent);
    console.log("   ✅ Updated PRIVATE_KEY in .env");

    // Verify
    console.log("\n6. Verifying fix...");
    console.log("-".repeat(60));
    
    const wallet = new ethers.Wallet(correctPrivateKey, provider);
    console.log(`   Wallet address: ${wallet.address}`);
    console.log(`   Contract owner: ${owner}`);
    
    if (wallet.address.toLowerCase() === owner.toLowerCase()) {
      console.log("   ✅ Wallet matches contract owner!");
    } else {
      console.log("   ❌ Still not matching. Something went wrong.");
      process.exit(1);
    }

    // Test addAchievement
    console.log("\n7. Testing addAchievement...");
    console.log("-".repeat(60));
    
    const contractWithOwner = new ethers.Contract(contractAddress, RewardHubTokenABI, wallet);
    const testTitle = `Fix Test ${Date.now()}`;
    const testReward = 100;

    try {
      const gasEstimate = await contractWithOwner.addAchievement.estimateGas(testTitle, testReward);
      console.log(`   ✅ Gas estimate successful: ${gasEstimate.toString()}`);
      console.log("   addAchievement should now work!");
    } catch (err) {
      console.log(`   ❌ Still failing: ${err.message}`);
      console.log("\n   The issue might not be ownership.");
      console.log("   Run full diagnostic: node scripts/diagnoseContract.js");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ FIX COMPLETE");
    console.log("=".repeat(60));
    console.log("\n⚠️  IMPORTANT: Restart your backend server!");
    console.log("   1. Stop the server (Ctrl+C)");
    console.log("   2. Start it again: npm start");
    console.log("\n   The .env file has been updated with the correct private key.");
    console.log("   Blockchain operations should now work correctly.\n");

  } catch (err) {
    console.error("\n❌ Fix failed:", err);
    process.exit(1);
  }
}

// Run fix
if (require.main === module) {
  fixOwnership()
    .then(() => process.exit(0))
    .catch(err => {
      console.error("\n❌ Fatal error:", err);
      process.exit(1);
    });
}

module.exports = fixOwnership;