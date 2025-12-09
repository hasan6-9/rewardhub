const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { ethers } = require("ethers");

/**
 * Admin-only endpoint to register new users
 * POST /api/admin/users
 * Body: { name, email, password, role, walletAddress (optional) }
 */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, walletAddress } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        msg: "Missing required fields: name, email, password, role" 
      });
    }

    // Validate role
    const validRoles = ["student", "faculty", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        msg: `Invalid role. Must be one of: ${validRoles.join(", ")}` 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }

    // Validate wallet address if provided
    if (walletAddress && !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ msg: "Invalid wallet address format" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      walletAddress: walletAddress || null,
      walletConnected: !!walletAddress,
      walletNonce: null,
    });

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
      walletConnected: user.walletConnected,
      createdAt: user.createdAt,
    };

    res.status(201).json({ 
      msg: "User registered successfully",
      user: userResponse 
    });
  } catch (err) {
    console.error("Error in admin registerUser:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * Admin endpoint to list all users
 * GET /api/admin/users
 */
exports.listUsers = async (req, res) => {
  try {
    const { role, walletConnected, page = 1, limit = 50 } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (walletConnected !== undefined) filter.walletConnected = walletConnected === "true";

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select("-password -walletNonce")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error in admin listUsers:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
