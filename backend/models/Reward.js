const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: String,
    tokenCost: { type: Number, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    onChainCreated: { type: Boolean, default: false },
    onChainTx: { type: String, default: null },
    onChainUpdatedAt: { type: Date, default: null },
    onChainUpdateTx: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", rewardSchema);
