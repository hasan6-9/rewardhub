const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const {
  logAchievement,
  getAllAchievements,
  getAchievementById,
  getStudentAchievements,
  deleteAchievement,
} = require("../controllers/studentAchievementController");

// Get all student achievements (with optional filters)
router.get("/", getAllAchievements);

// Faculty/Admin logs an achievement (requires authentication and faculty/admin role)
router.post("/", verifyToken, requireRole("faculty", "admin"), logAchievement);

// Get single achievement by ID
router.get("/:id", getAchievementById);

// Get all achievements for a specific student
router.get("/student/:studentId", getStudentAchievements);

// Delete achievement (admin only)
router.delete("/:id", verifyToken, requireRole("admin"), deleteAchievement);

module.exports = router;

