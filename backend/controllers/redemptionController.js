const Redemption = require("../models/Redemption");
const Reward = require("../models/Reward");
const StudentAchievement = require("../models/StudentAchievement");
const blockchain = require("../blockchain/contract");

// Get token balance from student achievements
const calculateTokenBalance = async (studentId) => {
  const logs = await StudentAchievement.find({ studentId }).populate(
    "achievementId"
  );
  return logs.reduce(
    (sum, log) => sum + (log.achievementId.tokenReward || 0),
    0
  );
};

// Redeem a reward
exports.redeemReward = async (req, res) => {
  const { rewardId, walletAddress } = req.body;
  const studentId = req.user.id; // Get ID from authenticated user token

  try {
    const reward = await Reward.findById(rewardId);
    if (!reward) return res.status(404).json({ msg: "Reward not found" });

    // Calculate current balance
    const totalAchievements = await StudentAchievement.find({
      studentId,
    }).populate("achievementId");
    const totalEarned = totalAchievements.reduce(
      (sum, a) => sum + (a.achievementId.tokenReward || 0),
      0
    );

    const redemptions = await Redemption.find({
      studentId,
      status: { $ne: "rejected" },
    }).populate("rewardId");
    const totalUsed = redemptions.reduce(
      (sum, r) => sum + (r.rewardId.tokenCost || 0),
      0
    );

    const available = totalEarned - totalUsed;
    if (available < reward.tokenCost) {
      return res.status(400).json({ msg: "Not enough tokens" });
    }

    // Call the smart contract to redeem perk
    const txHash = await blockchain.redeemPerk(reward.title); // Uses msg.sender

    // Save to DB
    const redemption = await Redemption.create({
      studentId,
      rewardId,
      txHash,
      status: "approved",
    });

    res.status(201).json(redemption);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get student's redemptions
exports.getRedemptionsByStudent = async (req, res) => {
  try {
    const redemptions = await Redemption.find({
      studentId: req.params.studentId,
    })
      .populate("rewardId")
      .sort({ date: -1 });
    res.json(redemptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all redemptions (for admin)
exports.getAllRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find()
      .populate("studentId")
      .populate("rewardId")
      .sort({ date: -1 });
    res.json(redemptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
