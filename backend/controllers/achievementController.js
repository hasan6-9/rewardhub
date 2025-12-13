const Achievement = require("../models/Achievement");

// Create new achievement
exports.createAchievement = async (req, res) => {
  try {
    const { title, description, tokenReward } = req.body;
    const newAchievement = await Achievement.create({
      title,
      description,
      tokenReward,
    });
    res.status(201).json(newAchievement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all achievements
exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find();
    res.json({ achievements }); // Return as object with achievements property
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
