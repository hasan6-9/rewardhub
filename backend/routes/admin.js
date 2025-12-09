const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const adminUserController = require("../controllers/adminUserController");
const adminAchievementController = require("../controllers/adminAchievementController");
const adminPerkController = require("../controllers/adminPerkController");
const adminController = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(requireRole("admin"));

// ======================
// User Management
// ======================

// @route   POST /api/admin/users
// @desc    Register a new user (admin-only)
// @access  Admin
router.post("/users", adminUserController.registerUser);

// @route   GET /api/admin/users
// @desc    List all users with filters
// @access  Admin
router.get("/users", adminUserController.listUsers);

// ======================
// Dashboard Statistics
// ======================

// @route   GET /api/admin/dashboard-stats
// @desc    Get comprehensive dashboard statistics
// @access  Admin
router.get("/dashboard-stats", adminController.getDashboardStats);

// ======================
// Achievement Management
// ======================

// @route   POST /api/admin/achievements
// @desc    Create a new achievement
// @access  Admin
router.post("/achievements", adminAchievementController.createAchievement);

// @route   GET /api/admin/achievements
// @desc    List all achievements
// @access  Admin
router.get("/achievements", adminAchievementController.listAchievements);

// @route   GET /api/admin/achievements/:id
// @desc    Get single achievement
// @access  Admin
router.get("/achievements/:id", adminAchievementController.getAchievement);

// @route   PUT /api/admin/achievements/:id
// @desc    Update achievement
// @access  Admin
router.put("/achievements/:id", adminAchievementController.updateAchievement);

// @route   DELETE /api/admin/achievements/:id
// @desc    Delete achievement
// @access  Admin
router.delete("/achievements/:id", adminAchievementController.deleteAchievement);

// ======================
// Perk Management
// ======================

// @route   POST /api/admin/perks
// @desc    Create a new perk
// @access  Admin
router.post("/perks", adminPerkController.createPerk);

// @route   GET /api/admin/perks
// @desc    List all perks
// @access  Admin
router.get("/perks", adminPerkController.listPerks);

// @route   GET /api/admin/perks/:id
// @desc    Get single perk
// @access  Admin
router.get("/perks/:id", adminPerkController.getPerk);

// @route   PUT /api/admin/perks/:id
// @desc    Update perk
// @access  Admin
router.put("/perks/:id", adminPerkController.updatePerk);

// @route   DELETE /api/admin/perks/:id
// @desc    Delete perk
// @access  Admin
router.delete("/perks/:id", adminPerkController.deletePerk);

module.exports = router;
