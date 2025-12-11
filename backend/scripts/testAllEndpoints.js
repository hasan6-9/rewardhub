// backend/scripts/testAllEndpoints.js
// Automated testing script for all RewardHub API endpoints

const axios = require("axios");
const colors = require("colors"); // npm install colors
require("dotenv").config();

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// Test credentials
const TEST_USERS = {
  admin: {
    email: "admin@rewardhub.com",
    password: "password123",
  },
  faculty: {
    email: "sarah.johnson@rewardhub.com",
    password: "password123",
  },
  studentWithWallet: {
    email: "alice.thompson@student.com",
    password: "password123",
  },
  studentNoWallet: {
    email: "george.miller@student.com",
    password: "password123",
  },
};

// Store tokens and IDs
const tokens = {};
const testData = {
  users: {},
  achievements: [],
  perks: [],
  studentAchievements: [],
};

// Utility functions
function success(message) {
  console.log("✅".green, message.green);
}

function error(message) {
  console.log("❌".red, message.red);
}

function info(message) {
  console.log("ℹ️ ".blue, message.blue);
}

function section(title) {
  console.log("\n" + "=".repeat(60).cyan);
  console.log(title.toUpperCase().cyan.bold);
  console.log("=".repeat(60).cyan + "\n");
}

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {},
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.headers["Content-Type"] = "application/json";
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data || err.message,
      status: err.response?.status,
    };
  }
}

async function testEndpoint(description, method, endpoint, data, token, expectedStatus = 200) {
  info(`Testing: ${description}`);
  const result = await makeRequest(method, endpoint, data, token);
  
  if (result.success && result.status === expectedStatus) {
    success(`  Status: ${result.status} - ${description}`);
    return result.data;
  } else {
    error(`  Status: ${result.status} - ${description}`);
    console.log("  Error:", JSON.stringify(result.error, null, 2).red);
    return null;
  }
}

async function runTests() {
  console.log("\n🚀 Starting RewardHub API Tests...\n".bold.yellow);

  try {
    // ============================================
    // 1. AUTHENTICATION TESTS
    // ============================================
    section("1. Authentication Tests");

    // Login as admin
    info("Logging in as admin...");
    const adminLogin = await testEndpoint(
      "Admin Login",
      "POST",
      "/api/auth/login",
      TEST_USERS.admin,
      null,
      200
    );
    if (adminLogin && adminLogin.token) {
      tokens.admin = adminLogin.token;
      testData.users.admin = adminLogin.user;
      success(`  Admin token: ${tokens.admin.substring(0, 20)}...`);
    }

    // Login as faculty
    info("Logging in as faculty...");
    const facultyLogin = await testEndpoint(
      "Faculty Login",
      "POST",
      "/api/auth/login",
      TEST_USERS.faculty,
      null,
      200
    );
    if (facultyLogin && facultyLogin.token) {
      tokens.faculty = facultyLogin.token;
      testData.users.faculty = facultyLogin.user;
      success(`  Faculty token: ${tokens.faculty.substring(0, 20)}...`);
    }

    // Login as student with wallet
    info("Logging in as student (with wallet)...");
    const studentLogin = await testEndpoint(
      "Student Login (with wallet)",
      "POST",
      "/api/auth/login",
      TEST_USERS.studentWithWallet,
      null,
      200
    );
    if (studentLogin && studentLogin.token) {
      tokens.student = studentLogin.token;
      testData.users.student = studentLogin.user;
      success(`  Student token: ${tokens.student.substring(0, 20)}...`);
    }

    // Login as student without wallet
    info("Logging in as student (no wallet)...");
    const studentNoWalletLogin = await testEndpoint(
      "Student Login (no wallet)",
      "POST",
      "/api/auth/login",
      TEST_USERS.studentNoWallet,
      null,
      200
    );
    if (studentNoWalletLogin && studentNoWalletLogin.token) {
      tokens.studentNoWallet = studentNoWalletLogin.token;
      testData.users.studentNoWallet = studentNoWalletLogin.user;
      success(`  Student (no wallet) token: ${tokens.studentNoWallet.substring(0, 20)}...`);
    }

    // ============================================
    // 2. ADMIN USER MANAGEMENT TESTS
    // ============================================
    section("2. Admin User Management");

    // List all users
    const users = await testEndpoint(
      "List All Users",
      "GET",
      "/api/admin/users",
      null,
      tokens.admin,
      200
    );
    if (users) {
      success(`  Found ${users.count} users`);
    }

    // Create new student (admin only)
    const newStudent = await testEndpoint(
      "Create New Student",
      "POST",
      "/api/admin/users",
      {
        name: "Test Student",
        email: "test.student@rewardhub.com",
        password: "password123",
        role: "student",
      },
      tokens.admin,
      201
    );
    if (newStudent) {
      testData.newStudentId = newStudent.user._id;
      success(`  Created student: ${newStudent.user.email}`);
    }

    // Try to create user as faculty (should fail)
    await testEndpoint(
      "Create User as Faculty (should fail)",
      "POST",
      "/api/admin/users",
      {
        name: "Should Fail",
        email: "should.fail@test.com",
        password: "password123",
        role: "student",
      },
      tokens.faculty,
      403
    );

    // ============================================
    // 3. ACHIEVEMENT MANAGEMENT TESTS (ADMIN)
    // ============================================
    section("3. Achievement Management (Admin)");

    // Create achievements
    const achievement1 = await testEndpoint(
      "Create Achievement (without blockchain sync)",
      "POST",
      "/api/admin/achievements",
      {
        title: "Test Achievement 1",
        description: "First test achievement",
        tokenReward: 50,
        syncOnChain: false,
      },
      tokens.admin,
      201
    );
    if (achievement1) {
      testData.achievements.push(achievement1.achievement);
      success(`  Created: ${achievement1.achievement.title}`);
    }

    const achievement2 = await testEndpoint(
      "Create Achievement (with blockchain sync)",
      "POST",
      "/api/admin/achievements",
      {
        title: "Test Achievement 2",
        description: "Second test achievement with blockchain",
        tokenReward: 100,
        syncOnChain: true,
      },
      tokens.admin,
      201
    );
    if (achievement2) {
      testData.achievements.push(achievement2.achievement);
      success(`  Created: ${achievement2.achievement.title}`);
      if (achievement2.achievement.onChainCreated) {
        success(`  Blockchain sync successful: ${achievement2.achievement.onChainTx}`);
      }
    }

    // List all achievements
    const achievements = await testEndpoint(
      "List All Achievements",
      "GET",
      "/api/admin/achievements",
      null,
      tokens.admin,
      200
    );
    if (achievements) {
      success(`  Found ${achievements.count} achievements`);
    }

    // Get single achievement
    if (testData.achievements.length > 0) {
      const singleAchievement = await testEndpoint(
        "Get Single Achievement",
        "GET",
        `/api/admin/achievements/${testData.achievements[0]._id}`,
        null,
        tokens.admin,
        200
      );
      if (singleAchievement) {
        success(`  Retrieved: ${singleAchievement.title}`);
      }
    }

    // Update achievement
    if (testData.achievements.length > 0) {
      const updated = await testEndpoint(
        "Update Achievement",
        "PUT",
        `/api/admin/achievements/${testData.achievements[0]._id}`,
        {
          description: "Updated description",
          tokenReward: 75,
        },
        tokens.admin,
        200
      );
      if (updated) {
        success(`  Updated: ${updated.achievement.title}`);
      }
    }

    // ============================================
    // 4. PERK/REWARD MANAGEMENT TESTS (ADMIN)
    // ============================================
    section("4. Perk/Reward Management (Admin)");

    // Create perks
    const perk1 = await testEndpoint(
      "Create Perk (without blockchain sync)",
      "POST",
      "/api/admin/perks",
      {
        title: "Test Perk 1",
        description: "First test perk",
        tokenCost: 25,
        syncOnChain: false,
      },
      tokens.admin,
      201
    );
    if (perk1) {
      testData.perks.push(perk1.perk);
      success(`  Created: ${perk1.perk.title}`);
    }

    const perk2 = await testEndpoint(
      "Create Perk (with blockchain sync)",
      "POST",
      "/api/admin/perks",
      {
        title: "Test Perk 2",
        description: "Second test perk with blockchain",
        tokenCost: 50,
        syncOnChain: true,
      },
      tokens.admin,
      201
    );
    if (perk2) {
      testData.perks.push(perk2.perk);
      success(`  Created: ${perk2.perk.title}`);
      if (perk2.perk.onChainCreated) {
        success(`  Blockchain sync successful: ${perk2.perk.onChainTx}`);
      }
    }

    // List all perks
    const perks = await testEndpoint(
      "List All Perks",
      "GET",
      "/api/admin/perks",
      null,
      tokens.admin,
      200
    );
    if (perks) {
      success(`  Found ${perks.count} perks`);
    }

    // ============================================
    // 5. WALLET CONNECTION TESTS
    // ============================================
    section("5. Wallet Connection Tests");

    // Generate nonce for student without wallet
    const nonce = await testEndpoint(
      "Generate Nonce for Wallet Connection",
      "POST",
      "/api/users/wallet/nonce",
      null,
      tokens.studentNoWallet,
      200
    );
    if (nonce) {
      success(`  Nonce generated: ${nonce.nonce.substring(0, 30)}...`);
      info("  Note: Actual signature verification requires MetaMask");
    }

    // Get wallet status
    const walletStatus = await testEndpoint(
      "Get Wallet Status",
      "GET",
      "/api/users/wallet/status",
      null,
      tokens.student,
      200
    );
    if (walletStatus) {
      success(`  Wallet connected: ${walletStatus.walletConnected}`);
      if (walletStatus.walletAddress) {
        success(`  Wallet address: ${walletStatus.walletAddress}`);
      }
    }

    // ============================================
    // 6. FACULTY AWARD ACHIEVEMENT TESTS
    // ============================================
    section("6. Faculty Award Achievement Tests");

    // Get student ID for Alice (has wallet)
    const aliceId = testData.users.student.id;
    
    // Get achievement ID
    let achievementIdForAward = null;
    if (testData.achievements.length > 0) {
      achievementIdForAward = testData.achievements.find(a => a.onChainCreated)?._id || testData.achievements[0]._id;
    }

    if (achievementIdForAward && aliceId) {
      // Award achievement to student WITH wallet (should succeed)
      const awardSuccess = await testEndpoint(
        "Award Achievement to Student (with wallet)",
        "POST",
        "/api/student-achievements",
        {
          studentId: aliceId,
          achievementId: achievementIdForAward,
        },
        tokens.faculty,
        201
      );
      if (awardSuccess) {
        testData.studentAchievements.push(awardSuccess.achievement);
        success(`  Achievement awarded successfully`);
        success(`  Transaction: ${awardSuccess.txHash}`);
        success(`  Tokens awarded: ${awardSuccess.tokensAwarded}`);
      }

      // Try to award to student WITHOUT wallet (should fail)
      const georgeId = testData.users.studentNoWallet.id;
      await testEndpoint(
        "Award Achievement to Student (no wallet - should fail)",
        "POST",
        "/api/student-achievements",
        {
          studentId: georgeId,
          achievementId: achievementIdForAward,
        },
        tokens.faculty,
        400
      );
    }

    // Get all student achievements
    const studentAchievements = await testEndpoint(
      "Get All Student Achievements",
      "GET",
      "/api/student-achievements",
      null,
      tokens.faculty,
      200
    );
    if (studentAchievements) {
      success(`  Found ${studentAchievements.count} awarded achievements`);
    }

    // Student views their own achievements
    const myAchievements = await testEndpoint(
      "Student Views Own Achievements",
      "GET",
      `/api/student-achievements/student/${aliceId}`,
      null,
      tokens.student,
      200
    );
    if (myAchievements) {
      success(`  Student has ${myAchievements.count} achievements`);
      success(`  Total tokens earned: ${myAchievements.totalTokensEarned}`);
    }

    // ============================================
    // 7. BLOCKCHAIN INTEGRATION TESTS
    // ============================================
    section("7. Blockchain Integration Tests");

    // Get token balance for student
    if (testData.users.student.walletAddress) {
      const balance = await testEndpoint(
        "Get Token Balance",
        "GET",
        `/api/blockchain/balance/${testData.users.student.walletAddress}`,
        null,
        null,
        200
      );
      if (balance) {
        success(`  Balance for ${balance.wallet}: ${balance.human} tokens`);
        success(`  Raw balance: ${balance.raw}`);
      }
    }

    // ============================================
    // 8. ADMIN DASHBOARD STATISTICS
    // ============================================
    section("8. Admin Dashboard Statistics");

    const dashboardStats = await testEndpoint(
      "Get Dashboard Statistics",
      "GET",
      "/api/admin/dashboard-stats",
      null,
      tokens.admin,
      200
    );
    
    if (dashboardStats) {
      console.log("\n📊 DASHBOARD STATISTICS:".bold.yellow);
      console.log("─".repeat(60).gray);
      console.log(`Total Achievements:              ${dashboardStats.totalAchievements}`.cyan);
      console.log(`Total Perks:                     ${dashboardStats.totalPerks}`.cyan);
      console.log(`Total Students:                  ${dashboardStats.totalRegisteredStudents}`.cyan);
      console.log(`Total Faculty:                   ${dashboardStats.totalRegisteredFaculty}`.cyan);
      console.log(`Students Without Wallet:         ${dashboardStats.studentsWithNoWallet}`.cyan);
      console.log(`Total Tokens Redeemed:           ${dashboardStats.totalTokensRedeemed}`.cyan);
      console.log(`Blockchain Total Supply:         ${dashboardStats.totalTokensAvailableInBlockchain}`.cyan);
      console.log(`Tokens Distributed to Students:  ${dashboardStats.totalTokensDistributedToStudents}`.cyan);
      console.log("─".repeat(60).gray);
      
      if (dashboardStats.topHolders && dashboardStats.topHolders.length > 0) {
        console.log("\n🏆 TOP TOKEN HOLDERS:".bold.yellow);
        console.log("─".repeat(60).gray);
        dashboardStats.topHolders.forEach((holder, index) => {
          console.log(`${index + 1}. ${holder.name} (${holder.email})`.green);
          console.log(`   Wallet: ${holder.walletAddress}`.gray);
          console.log(`   Balance: ${holder.balance} tokens`.yellow);
        });
        console.log("─".repeat(60).gray);
      }
      
      success("\n  Dashboard statistics retrieved successfully");
    }

    // Try to access dashboard as non-admin (should fail)
    await testEndpoint(
      "Access Dashboard as Faculty (should fail)",
      "GET",
      "/api/admin/dashboard-stats",
      null,
      tokens.faculty,
      403
    );

    // ============================================
    // 9. AUTHORIZATION TESTS
    // ============================================
    section("9. Authorization Tests");

    // Student tries to create achievement (should fail)
    await testEndpoint(
      "Student Creates Achievement (should fail)",
      "POST",
      "/api/admin/achievements",
      {
        title: "Unauthorized",
        description: "This should fail",
        tokenReward: 100,
      },
      tokens.student,
      403
    );

    // Faculty tries to access admin users endpoint (should fail)
    await testEndpoint(
      "Faculty Lists Users (should fail)",
      "GET",
      "/api/admin/users",
      null,
      tokens.faculty,
      403
    );

    // Unauthenticated request (should fail)
    await testEndpoint(
      "Unauthenticated Request (should fail)",
      "GET",
      "/api/admin/achievements",
      null,
      null,
      401
    );

    // ============================================
    // 10. TEST SUMMARY
    // ============================================
    section("Test Summary");

    console.log("✅ All tests completed!".bold.green);
    console.log("\n📋 Test Data Created:".bold.yellow);
    console.log(`   - Achievements: ${testData.achievements.length}`.cyan);
    console.log(`   - Perks: ${testData.perks.length}`.cyan);
    console.log(`   - Student Achievements: ${testData.studentAchievements.length}`.cyan);
    
    console.log("\n💡 Next Steps:".bold.yellow);
    console.log("   1. Import Postman collection for manual testing".gray);
    console.log("   2. Test wallet connection with MetaMask".gray);
    console.log("   3. Test perk redemption flow".gray);
    console.log("   4. Monitor Ganache for blockchain transactions".gray);

  } catch (err) {
    error(`Fatal error during tests: ${err.message}`);
    console.error(err);
  }
}

// Run tests
if (require.main === module) {
  runTests()
    .then(() => {
      console.log("\n🎉 Testing complete!".bold.green);
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n💥 Testing failed:".bold.red, err);
      process.exit(1);
    });
}

module.exports = { runTests, testData, tokens };
