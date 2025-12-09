const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

/**
 * Generate Admin JWT Token for Testing
 * 
 * This script helps generate a JWT token for an admin user for API testing.
 * 
 * Usage:
 *   node scripts/generateAdminToken.js <admin-email>
 * 
 * Example:
 *   node scripts/generateAdminToken.js admin@test.com
 */

async function generateAdminToken() {
  try {
    // Get email from command line args or use default
    const email = process.argv[2] || "admin@test.com";

    console.log(`\n🔍 Looking for admin user with email: ${email}\n`);

    // Connect to database
    const mongoose = require("mongoose");
    await mongoose.connect(process.env.MONGO_URI);

    // Find admin user
    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
      console.error(`❌ No admin user found with email: ${email}`);
      console.log("\nTo create an admin user, use the existing /api/auth/register endpoint:");
      console.log(`
curl -X POST http://localhost:5000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Admin User","email":"${email}","password":"admin123","role":"admin"}'
      `);
      process.exit(1);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Admin user found!");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin._id}\n`);

    console.log("🔑 Generated JWT Token (valid for 7 days):\n");
    console.log(token);
    console.log("\n");

    console.log("📋 Use this token in your API requests:");
    console.log(`   Authorization: Bearer ${token}\n`);

    console.log("Example curl command:");
    console.log(`
curl -X GET http://localhost:5000/api/admin/dashboard-stats \\
  -H "Authorization: Bearer ${token}"
    `);

    await mongoose.connection.close();
    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

generateAdminToken();
