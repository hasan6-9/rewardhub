const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { requireWallet } = require("../middleware/requireWallet");
const {
  redeemReward,
  getRedemptionsByStudent,
  getAllRedemptions,
} = require("../controllers/redemptionController");

// Student redeems a reward (requires authentication and wallet connection)
router.post("/", verifyToken, requireWallet, redeemReward);

// Student views their redemptions
router.get("/student/:studentId", getRedemptionsByStudent);

// Admin views all redemptions
router.get("/", getAllRedemptions);

module.exports = router;
