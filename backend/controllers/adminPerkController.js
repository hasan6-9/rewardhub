const Reward = require("../models/Reward");
const blockchain = require("../blockchain/contract");

/**
 * Create a new perk/reward
 * POST /api/admin/perks
 * Body: { title, description, tokenCost, syncOnChain (optional) }
 */
exports.createPerk = async (req, res) => {
  try {
    const { title, description, tokenCost, syncOnChain } = req.body;

    // Validate required fields
    if (!title || tokenCost === undefined) {
      return res.status(400).json({ 
        msg: "Missing required fields: title, tokenCost" 
      });
    }

    // Check if perk with same title exists
    const existing = await Reward.findOne({ title });
    if (existing) {
      return res.status(400).json({ msg: "Perk with this title already exists" });
    }

    // Create perk in database
    const perk = new Reward({
      title,
      description,
      tokenCost,
      createdBy: req.userDoc._id,
      onChainCreated: false,
      onChainTx: null,
    });

    // Optionally sync to blockchain
    let onChainWarning = null;
    if (syncOnChain === true) {
      try {
        // Call blockchain contract to add perk
        const txHash = await blockchain.addPerk(title, tokenCost);
        perk.onChainCreated = true;
        perk.onChainTx = txHash;
      } catch (blockchainErr) {
        console.error("Blockchain sync error:", blockchainErr);
        onChainWarning = `Perk created in database but blockchain sync failed: ${blockchainErr.message}`;
      }
    }

    await perk.save();

    const response = {
      msg: "Perk created successfully",
      perk,
    };

    if (onChainWarning) {
      response.warning = onChainWarning;
    }

    res.status(201).json(response);
  } catch (err) {
    console.error("Error creating perk:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * List all perks/rewards
 * GET /api/admin/perks
 */
exports.listPerks = async (req, res) => {
  try {
    const { page = 1, limit = 50, onChainCreated } = req.query;

    const filter = {};
    if (onChainCreated !== undefined) {
      filter.onChainCreated = onChainCreated === "true";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const perks = await Reward.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reward.countDocuments(filter);

    res.json({
      perks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error listing perks:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * Get single perk/reward
 * GET /api/admin/perks/:id
 */
exports.getPerk = async (req, res) => {
  try {
    const perk = await Reward.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!perk) {
      return res.status(404).json({ msg: "Perk not found" });
    }

    res.json({ perk });
  } catch (err) {
    console.error("Error getting perk:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * Update perk/reward
 * PUT /api/admin/perks/:id
 * Body: { title, description, tokenCost, syncOnChain (optional) }
 */
exports.updatePerk = async (req, res) => {
  try {
    const { title, description, tokenCost, syncOnChain } = req.body;

    const perk = await Reward.findById(req.params.id);
    if (!perk) {
      return res.status(404).json({ msg: "Perk not found" });
    }

    // Update fields
    if (title !== undefined) perk.title = title;
    if (description !== undefined) perk.description = description;
    if (tokenCost !== undefined) perk.tokenCost = tokenCost;

    // Optionally sync to blockchain
    let onChainWarning = null;
    if (syncOnChain === true && !perk.onChainCreated) {
      try {
        const txHash = await blockchain.addPerk(perk.title, perk.tokenCost);
        perk.onChainCreated = true;
        perk.onChainTx = txHash;
      } catch (blockchainErr) {
        console.error("Blockchain sync error:", blockchainErr);
        onChainWarning = `Perk updated in database but blockchain sync failed: ${blockchainErr.message}`;
      }
    }

    await perk.save();

    const response = {
      msg: "Perk updated successfully",
      perk,
    };

    if (onChainWarning) {
      response.warning = onChainWarning;
    }

    res.json(response);
  } catch (err) {
    console.error("Error updating perk:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * Delete perk/reward
 * DELETE /api/admin/perks/:id
 */
exports.deletePerk = async (req, res) => {
  try {
    const perk = await Reward.findByIdAndDelete(req.params.id);

    if (!perk) {
      return res.status(404).json({ msg: "Perk not found" });
    }

    res.json({ 
      msg: "Perk deleted successfully",
      perk 
    });
  } catch (err) {
    console.error("Error deleting perk:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
