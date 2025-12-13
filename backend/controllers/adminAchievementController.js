const Achievement = require("../models/Achievement");
const blockchain = require("../blockchain/contract");

/**
 * Create a new achievement
 * POST /api/admin/achievements
 * Body: { title, description, tokenReward, syncOnChain (optional) }
 */
exports.createAchievement = async (req, res) => {
  try {
    const { title, description, tokenReward, syncOnChain } = req.body;

    // Validate required fields
    if (!title || tokenReward === undefined) {
      return res.status(400).json({
        msg: "Missing required fields: title, tokenReward",
      });
    }

    // Check if achievement with same title exists
    const existing = await Achievement.findOne({ title });
    if (existing) {
      return res
        .status(400)
        .json({ msg: "Achievement with this title already exists" });
    }

    // Create achievement in database
    const achievement = new Achievement({
      title,
      description,
      tokenReward,
      createdBy: req.userDoc._id,
      onChainCreated: false,
      onChainTx: null,
    });

    // Optionally sync to blockchain
    let onChainWarning = null;
    if (syncOnChain === true) {
      try {
        // Call blockchain contract to add achievement
        const txHash = await blockchain.addAchievement(title, tokenReward);
        achievement.onChainCreated = true;
        achievement.onChainTx = txHash;
      } catch (blockchainErr) {
        console.error("Blockchain sync error:", blockchainErr);
        onChainWarning = `Achievement created in database but blockchain sync failed: ${blockchainErr.message}`;
      }
    }

    await achievement.save();

    const response = {
      msg: "Achievement created successfully",
      achievement,
    };

    if (onChainWarning) {
      response.warning = onChainWarning;
    }

    res.status(201).json(response);
  } catch (err) {
    console.error("Error creating achievement:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * List all achievements
 * GET /api/admin/achievements
 */
exports.listAchievements = async (req, res) => {
  try {
    const { page = 1, limit = 50, onChainCreated } = req.query;

    const filter = {};
    if (onChainCreated !== undefined) {
      filter.onChainCreated = onChainCreated === "true";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const achievements = await Achievement.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Achievement.countDocuments(filter);

    res.json({
      achievements,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error listing achievements:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * Get single achievement
 * GET /api/admin/achievements/:id
 */
exports.getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!achievement) {
      return res.status(404).json({ msg: "Achievement not found" });
    }

    res.json({ achievement });
  } catch (err) {
    console.error("Error getting achievement:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * Update achievement
 * PUT /api/admin/achievements/:id
 * Body: { title, description, tokenReward, syncOnChain (optional) }
 */
exports.updateAchievement = async (req, res) => {
  try {
    const { title, description, tokenReward, syncOnChain } = req.body;

    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ msg: "Achievement not found" });
    }

    const oldTitle = achievement.title;
    let onChainWarning = null;

    // If already on-chain and critical fields changed, update on blockchain
    if (achievement.onChainCreated && syncOnChain !== false) {
      const titleChanged = title && title !== oldTitle;
      const rewardChanged =
        tokenReward && tokenReward !== achievement.tokenReward;

      if (titleChanged || rewardChanged) {
        try {
          const txHash = await blockchain.updateAchievement(
            oldTitle,
            title || oldTitle,
            tokenReward || achievement.tokenReward
          );

          achievement.onChainUpdateTx = txHash;
          achievement.onChainUpdatedAt = new Date();

          console.log(`✅ Achievement updated on blockchain: ${txHash}`);
        } catch (blockchainErr) {
          console.error("Blockchain update error:", blockchainErr);
          onChainWarning = `Achievement updated in database but blockchain update failed: ${blockchainErr.message}`;
        }
      }
    }

    // Optionally sync to blockchain if not already synced
    if (syncOnChain === true && !achievement.onChainCreated) {
      try {
        const txHash = await blockchain.addAchievement(
          title || achievement.title,
          tokenReward || achievement.tokenReward
        );
        achievement.onChainCreated = true;
        achievement.onChainTx = txHash;
      } catch (blockchainErr) {
        console.error("Blockchain sync error:", blockchainErr);
        onChainWarning = `Achievement updated in database but blockchain sync failed: ${blockchainErr.message}`;
      }
    }

    // Update database fields
    if (title !== undefined) achievement.title = title;
    if (description !== undefined) achievement.description = description;
    if (tokenReward !== undefined) achievement.tokenReward = tokenReward;

    await achievement.save();

    const response = {
      msg: "Achievement updated successfully",
      achievement,
    };

    if (onChainWarning) {
      response.warning = onChainWarning;
    }

    res.json(response);
  } catch (err) {
    console.error("Error updating achievement:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * Delete achievement
 * DELETE /api/admin/achievements/:id
 */
exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ msg: "Achievement not found" });
    }

    let onChainWarning = null;

    // If on-chain, deactivate instead of delete
    if (achievement.onChainCreated) {
      try {
        const txHash = await blockchain.deactivateAchievement(
          achievement.title
        );
        console.log(`✅ Achievement deactivated on blockchain: ${txHash}`);
      } catch (blockchainErr) {
        console.error("Blockchain deactivation error:", blockchainErr);
        onChainWarning = `Achievement deleted from database but blockchain deactivation failed: ${blockchainErr.message}`;
      }
    }

    // Delete from database
    await Achievement.findByIdAndDelete(req.params.id);

    const response = {
      msg: "Achievement deleted successfully",
    };

    if (onChainWarning) {
      response.warning = onChainWarning;
    }

    res.json(response);
  } catch (err) {
    console.error("Error deleting achievement:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
