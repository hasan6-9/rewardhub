const User = require("../models/User");
const Achievement = require("../models/Achievement");
const Reward = require("../models/Reward");
const Redemption = require("../models/Redemption");
const StudentAchievement = require("../models/StudentAchievement");
const blockchain = require("../blockchain/contract");

/**
 * Get comprehensive dashboard statistics
 * GET /api/admin/dashboard-stats
 * Admin-only endpoint
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // ======================
    // Database Statistics
    // ======================

    // Count achievements and perks
    const totalAchievements = await Achievement.countDocuments();
    const totalPerks = await Reward.countDocuments();

    // Count users by role
    const totalRegisteredStudents = await User.countDocuments({ role: "student" });
    const totalRegisteredFaculty = await User.countDocuments({ role: "faculty" });
    
    // Count students without wallet
    const studentsWithNoWallet = await User.countDocuments({ 
      role: "student", 
      walletConnected: false 
    });

    // Calculate total tokens redeemed from Redemption records
    const redemptions = await Redemption.find({ status: "approved" })
      .populate("rewardId", "tokenCost");
    
    const totalTokensRedeemed = redemptions.reduce((sum, redemption) => {
      return sum + (redemption.rewardId?.tokenCost || 0);
    }, 0);

    // ======================
    // Blockchain Statistics
    // ======================

    let totalTokensAvailableInBlockchain = 0;
    let totalTokensDistributedToStudents = 0;
    let topHolders = [];

    try {
      // Get total supply from blockchain
      totalTokensAvailableInBlockchain = await blockchain.getTotalSupply();

      // Get all students with connected wallets
      const studentsWithWallets = await User.find({ 
        role: "student", 
        walletConnected: true,
        walletAddress: { $ne: null }
      }).select("name email walletAddress");

      // Fetch balances for all students
      const balancePromises = studentsWithWallets.map(async (student) => {
        try {
          const balanceData = await blockchain.getTokenBalance(student.walletAddress);
          return {
            studentId: student._id,
            name: student.name,
            email: student.email,
            walletAddress: student.walletAddress,
            balance: balanceData.human,
          };
        } catch (err) {
          console.error(`Error fetching balance for ${student.email}:`, err);
          return {
            studentId: student._id,
            name: student.name,
            email: student.email,
            walletAddress: student.walletAddress,
            balance: 0,
          };
        }
      });

      const allBalances = await Promise.all(balancePromises);

      // Calculate total distributed (sum of all student balances)
      totalTokensDistributedToStudents = allBalances.reduce((sum, holder) => {
        return sum + holder.balance;
      }, 0);

      // Sort by balance descending and get top 10
      topHolders = allBalances
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);

    } catch (blockchainErr) {
      console.error("Error fetching blockchain statistics:", blockchainErr);
      // Continue with database stats even if blockchain fails
    }

    // ======================
    // Response
    // ======================

    res.json({
      // Database stats
      totalAchievements,
      totalPerks,
      totalRegisteredStudents,
      totalRegisteredFaculty,
      totalTokensRedeemed,
      totalAchievementsCreated: totalAchievements, // Alias for consistency
      totalRewardsCreated: totalPerks, // Alias for consistency
      studentsWithNoWallet,

      // Blockchain stats
      totalTokensAvailableInBlockchain,
      totalTokensDistributedToStudents,
      topHolders,

      // Metadata
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error("Error in getDashboardStats:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
