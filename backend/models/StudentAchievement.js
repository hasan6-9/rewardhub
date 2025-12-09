const mongoose = require("mongoose");

const studentAchievementSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Achievement",
    required: true,
  },
  dateAwarded: { type: Date, default: Date.now },
  txHash: { type: String }, // Will hold blockchain transaction hash
  status: {
    type: String,
    enum: ["pending_onchain", "confirmed", "failed"],
    default: "pending_onchain",
  },
  awardedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

module.exports = mongoose.model("StudentAchievement", studentAchievementSchema);
