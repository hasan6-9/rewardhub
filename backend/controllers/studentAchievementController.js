// backend/controllers/studentAchievementController.js (UPDATED with fix)
const StudentAchievement = require("../models/StudentAchievement");
const Achievement = require("../models/Achievement");
const User = require("../models/User");
const blockchain = require("../blockchain/contract");

/**
 * @route   POST /api/student-achievements
 * @desc    Faculty awards achievement to student (mints tokens)
 * @access  Faculty, Admin
 */
exports.logAchievement = async (req, res) => {
  const { studentId, achievementId } = req.body;

  try {
    // Validate achievement exists
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ msg: "Achievement not found" });
    }

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // Check if student is actually a student
    if (student.role !== "student") {
      return res.status(400).json({ 
        msg: "User is not a student. Only students can receive achievements." 
      });
    }

    // CRITICAL: Check if student has connected wallet
    if (!student.walletConnected || !student.walletAddress) {
      return res.status(400).json({
        msg: "Student has not connected their wallet. Achievement cannot be awarded.",
        studentEmail: student.email,
        studentName: student.name,
        action: "student_must_connect_wallet",
        instructions:
          "Ask the student to log in and connect their MetaMask wallet before awarding achievements.",
      });
    }

    // Check if achievement was already awarded to this student
    const existingAward = await StudentAchievement.findOne({
      studentId,
      achievementId,
      status: { $in: ["pending_onchain", "confirmed"] },
    });

    if (existingAward) {
      return res.status(400).json({
        msg: "This achievement has already been awarded to this student",
        existingAward,
      });
    }

    // Create achievement record with pending status
    const newLog = await StudentAchievement.create({
      studentId,
      achievementId,
      status: "pending_onchain",
      awardedBy: req.userDoc?._id || null,
      txHash: null,
    });

    // FIXED: Check if achievement exists on blockchain first
    const existsOnChain = await blockchain.achievementExists(achievement.title);
    
    if (!existsOnChain) {
      // Achievement not on blockchain yet, try to add it
      try {
        console.log(`Achievement "${achievement.title}" not on blockchain, adding it first...`);
        await blockchain.addAchievement(achievement.title, achievement.tokenReward);
        console.log(`Achievement "${achievement.title}" added to blockchain`);
      } catch (addErr) {
        console.error("Failed to add achievement to blockchain:", addErr);
        newLog.status = "failed";
        await newLog.save();
        
        return res.status(500).json({
          msg: "Failed to add achievement to blockchain. Please ensure the achievement is added on-chain first.",
          error: addErr.message,
          achievement: newLog,
        });
      }
    }

    // FIXED: Attempt to grant achievement (mints tokens) using grantAchievement
    try {
      console.log(`Granting achievement "${achievement.title}" to ${student.walletAddress}`);
      
      const txHash = await blockchain.grantAchievement(
        student.walletAddress,
        achievement.title
      );

      // Update record with success
      newLog.txHash = txHash;
      newLog.status = "confirmed";
      await newLog.save();

      // Populate fields for response
      const populatedLog = await StudentAchievement.findById(newLog._id)
        .populate("studentId", "name email walletAddress")
        .populate("achievementId", "title description tokenReward")
        .populate("awardedBy", "name email role");

      res.status(201).json({
        msg: "Achievement awarded successfully and tokens minted on blockchain",
        achievement: populatedLog,
        txHash,
        tokensAwarded: achievement.tokenReward,
        studentWallet: student.walletAddress,
      });
    } catch (blockchainErr) {
      console.error("Blockchain granting error:", blockchainErr);

      // Update record with failure
      newLog.status = "failed";
      await newLog.save();

      return res.status(500).json({
        msg: "Achievement logged in database but blockchain transaction failed",
        error: blockchainErr.message,
        achievement: newLog,
        possibleReasons: [
          "Achievement not added to blockchain (use syncOnChain when creating)",
          "Insufficient gas or network issues",
          "Student wallet address invalid",
          "Contract owner permissions not set correctly"
        ]
      });
    }
  } catch (err) {
    console.error("Error in logAchievement:", err);
    res.status(500).json({ 
      msg: "Server error while awarding achievement",
      error: err.message 
    });
  }
};

/**
 * @route   GET /api/student-achievements
 * @desc    Get all achievements (with optional filters)
 * @access  Faculty, Admin, Student (filtered by studentId)
 */
exports.getAllAchievements = async (req, res) => {
  try {
    const { studentId, achievementId, status } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (achievementId) filter.achievementId = achievementId;
    if (status) filter.status = status;

    // If user is a student, only show their own achievements
    if (req.userDoc?.role === "student") {
      filter.studentId = req.userDoc._id;
    }

    const achievements = await StudentAchievement.find(filter)
      .populate("studentId", "name email walletAddress")
      .populate("achievementId", "title description tokenReward")
      .populate("awardedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      count: achievements.length,
      achievements,
    });
  } catch (err) {
    console.error("Error fetching achievements:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @route   GET /api/student-achievements/:id
 * @desc    Get single achievement by ID
 * @access  Faculty, Admin, Student (own only)
 */
exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await StudentAchievement.findById(req.params.id)
      .populate("studentId", "name email walletAddress")
      .populate("achievementId", "title description tokenReward")
      .populate("awardedBy", "name email role");

    if (!achievement) {
      return res.status(404).json({ msg: "Achievement not found" });
    }

    // If user is a student, only allow viewing their own achievements
    if (req.userDoc?.role === "student") {
      if (achievement.studentId._id.toString() !== req.userDoc._id.toString()) {
        return res.status(403).json({ 
          msg: "Access denied. You can only view your own achievements." 
        });
      }
    }

    res.json(achievement);
  } catch (err) {
    console.error("Error fetching achievement:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @route   GET /api/student-achievements/student/:studentId
 * @desc    Get all achievements for a specific student
 * @access  Faculty, Admin, Student (own only)
 */
exports.getStudentAchievements = async (req, res) => {
  try {
    const { studentId } = req.params;

    // If user is a student, only allow viewing their own achievements
    if (req.userDoc?.role === "student") {
      if (studentId !== req.userDoc._id.toString()) {
        return res.status(403).json({ 
          msg: "Access denied. You can only view your own achievements." 
        });
      }
    }

    const achievements = await StudentAchievement.find({ studentId })
      .populate("achievementId", "title description tokenReward")
      .populate("awardedBy", "name email role")
      .sort({ createdAt: -1 });

    // Calculate total tokens earned
    const totalTokens = achievements
      .filter(a => a.status === "confirmed")
      .reduce((sum, a) => sum + (a.achievementId?.tokenReward || 0), 0);

    res.json({
      count: achievements.length,
      totalTokensEarned: totalTokens,
      achievements,
    });
  } catch (err) {
    console.error("Error fetching student achievements:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @route   DELETE /api/student-achievements/:id
 * @desc    Delete achievement award (admin only, use with caution)
 * @access  Admin only
 */
exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await StudentAchievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ msg: "Achievement not found" });
    }

    // Warning: This doesn't reverse blockchain transaction
    if (achievement.status === "confirmed") {
      console.warn(`⚠️  Deleting confirmed achievement ${req.params.id} - tokens already minted on blockchain`);
    }

    await StudentAchievement.findByIdAndDelete(req.params.id);

    res.json({ 
      msg: "Achievement award deleted from database",
      warning: achievement.status === "confirmed" 
        ? "Note: Tokens were already minted on blockchain and cannot be reversed through this action"
        : null
    });
  } catch (err) {
    console.error("Error deleting achievement:", err);
    res.status(500).json({ error: err.message });
  }
};
