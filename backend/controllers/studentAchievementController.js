const StudentAchievement = require("../models/StudentAchievement");
const Achievement = require("../models/Achievement");
const User = require("../models/User");
const blockchain = require("../blockchain/contract");

// POST /api/student-achievements
// Award an achievement to a student (Faculty/Admin only)
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
      return res.status(400).json({ msg: "User is not a student" });
    }

    // CRITICAL: Check if student has connected wallet
    if (!student.walletConnected || !student.walletAddress) {
      return res.status(400).json({ 
        msg: "Student has not connected their wallet. Achievement cannot be awarded.",
        studentEmail: student.email,
        action: "student_must_connect_wallet"
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

    // Attempt to mint tokens on blockchain
    try {
      // Use mint function to award tokens directly
      const txHash = await blockchain.mint(
        student.walletAddress,
        achievement.tokenReward
      );

      // Update record with success
      newLog.txHash = txHash;
      newLog.status = "confirmed";
      await newLog.save();

      res.status(201).json({
        msg: "Achievement awarded successfully",
        achievement: newLog,
        txHash,
        tokensAwarded: achievement.tokenReward,
      });

    } catch (blockchainErr) {
      console.error("Blockchain minting error:", blockchainErr);
      
      // Update record with failure
      newLog.status = "failed";
      await newLog.save();

      return res.status(500).json({
        msg: "Achievement logged in database but blockchain transaction failed",
        error: blockchainErr.message,
        achievement: newLog,
      });
    }

  } catch (err) {
    console.error("Error in logAchievement:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/student-achievements/:studentId
exports.getAchievementsByStudent = async (req, res) => {
  try {
    const achievements = await StudentAchievement.find({
      studentId: req.params.studentId,
    })
      .populate("achievementId")
      .populate("awardedBy", "name email")
      .sort({ dateAwarded: -1 });

    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
