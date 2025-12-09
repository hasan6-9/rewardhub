const axios = require("axios");
require("dotenv").config();

/**
 * Verify Dashboard Statistics Endpoint
 * 
 * This script calls the admin dashboard-stats endpoint and displays the results.
 * 
 * Usage:
 *   node scripts/verify-dashboard.js <admin-jwt-token>
 * 
 * Example:
 *   node scripts/verify-dashboard.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Or set ADMIN_TOKEN environment variable:
 *   ADMIN_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... node scripts/verify-dashboard.js
 */

async function verifyDashboard() {
  try {
    // Get token from command line or environment variable
    const token = process.argv[2] || process.env.ADMIN_TOKEN;

    if (!token) {
      console.error("❌ No admin token provided!");
      console.log("\nUsage:");
      console.log("  node scripts/verify-dashboard.js <admin-jwt-token>");
      console.log("\nOr set ADMIN_TOKEN environment variable:");
      console.log("  ADMIN_TOKEN=<token> node scripts/verify-dashboard.js");
      console.log("\nTo generate a token, run:");
      console.log("  node scripts/generateAdminToken.js");
      process.exit(1);
    }

    const baseURL = process.env.API_BASE_URL || "http://localhost:5000";
    const endpoint = `${baseURL}/api/admin/dashboard-stats`;

    console.log(`\n🔍 Fetching dashboard statistics from: ${endpoint}\n`);

    // Make API request
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const stats = response.data;

    // Display results
    console.log("✅ Dashboard Statistics Retrieved Successfully!\n");
    console.log("=" .repeat(60));
    console.log("DATABASE STATISTICS");
    console.log("=".repeat(60));
    console.log(`Total Achievements:           ${stats.totalAchievements}`);
    console.log(`Total Perks/Rewards:          ${stats.totalPerks}`);
    console.log(`Total Registered Students:    ${stats.totalRegisteredStudents}`);
    console.log(`Total Registered Faculty:     ${stats.totalRegisteredFaculty}`);
    console.log(`Students Without Wallet:      ${stats.studentsWithNoWallet}`);
    console.log(`Total Tokens Redeemed:        ${stats.totalTokensRedeemed}`);

    console.log("\n" + "=".repeat(60));
    console.log("BLOCKCHAIN STATISTICS");
    console.log("=".repeat(60));
    console.log(`Total Supply (Blockchain):    ${stats.totalTokensAvailableInBlockchain}`);
    console.log(`Tokens Distributed:           ${stats.totalTokensDistributedToStudents}`);

    console.log("\n" + "=".repeat(60));
    console.log("TOP TOKEN HOLDERS");
    console.log("=".repeat(60));

    if (stats.topHolders && stats.topHolders.length > 0) {
      stats.topHolders.forEach((holder, index) => {
        console.log(`\n${index + 1}. ${holder.name} (${holder.email})`);
        console.log(`   Wallet: ${holder.walletAddress}`);
        console.log(`   Balance: ${holder.balance} tokens`);
      });
    } else {
      console.log("No token holders found (students may not have connected wallets)");
    }

    console.log("\n" + "=".repeat(60));
    console.log(`Timestamp: ${stats.timestamp}`);
    console.log("=".repeat(60) + "\n");

  } catch (err) {
    if (err.response) {
      console.error("❌ API Error:");
      console.error(`   Status: ${err.response.status}`);
      console.error(`   Message: ${err.response.data.msg || err.response.data.error}`);
      
      if (err.response.status === 401) {
        console.log("\n💡 Tip: Your token may be invalid or expired.");
        console.log("   Generate a new token with: node scripts/generateAdminToken.js");
      }
      
      if (err.response.status === 403) {
        console.log("\n💡 Tip: You need admin privileges to access this endpoint.");
      }
    } else {
      console.error("❌ Error:", err.message);
      
      if (err.code === "ECONNREFUSED") {
        console.log("\n💡 Tip: Make sure the backend server is running on port 5000");
        console.log("   Start the server with: npm start or node server.js");
      }
    }
    process.exit(1);
  }
}

// Check if axios is installed
try {
  require.resolve("axios");
} catch (e) {
  console.error("❌ axios is not installed!");
  console.log("\nInstall it with: npm install axios");
  process.exit(1);
}

verifyDashboard();
