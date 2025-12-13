const Reward = require("../models/Reward");

// Create new reward
exports.createReward = async (req, res) => {
  try {
    const { title, description, tokenCost } = req.body;
    const reward = await Reward.create({ title, description, tokenCost });
    res.status(201).json(reward);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all rewards
exports.getAllRewards = async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.json({ rewards }); // Return as object with rewards property
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
