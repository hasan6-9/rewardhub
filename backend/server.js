const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const achievementRoutes = require("./routes/achievements");
const studentAchievementRoutes = require("./routes/studentAchievements");
const rewardRoutes = require("./routes/rewards");
const redemptionRoutes = require("./routes/redemptions");
const blockchainRoutes = require("./routes/blockchain");
const adminRoutes = require("./routes/admin");
const walletRoutes = require("./routes/wallet");
require("dotenv").config();
const cors = require("cors");

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/student-achievements", studentAchievementRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/redemptions", redemptionRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users/wallet", walletRoutes);

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
