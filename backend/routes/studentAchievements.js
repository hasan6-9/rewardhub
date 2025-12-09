const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const {
  logAchievement,
  getAchievementsByStudent,
} = require("../controllers/studentAchievementController");

// Faculty/Admin logs an achievement (requires authentication and faculty/admin role)
router.post("/", verifyToken, requireRole("faculty", "admin"), logAchievement);

// Get all achievements for a student (public or protected - keeping as is for now)
router.get("/:studentId", getAchievementsByStudent);

module.exports = router;
