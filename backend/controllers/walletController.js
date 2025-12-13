const User = require("../models/User");
const { ethers } = require("ethers");
const crypto = require("crypto");

/**
 * Generate a nonce for wallet signature verification
 * POST /api/users/wallet/nonce
 * Protected route - requires authentication
 */
exports.generateNonce = async (req, res) => {
  try {
    // Generate unique nonce
    const nonce = `RewardHub Login: ${crypto.randomUUID()}`;

    // Save nonce to user document
    req.userDoc.walletNonce = nonce;
    await req.userDoc.save();

    res.json({
      nonce,
      msg: "Sign this nonce with your MetaMask wallet using personal_sign",
    });
  } catch (err) {
    console.error("Error generating nonce:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * Verify wallet signature and connect wallet to user account
 * POST /api/users/wallet/verify
 * Body: { address, signature }
 * Protected route - requires authentication
 */
exports.verifyWallet = async (req, res) => {
  try {
    const { address, signature } = req.body;

    // Validate inputs
    if (!address || !signature) {
      return res
        .status(400)
        .json({ msg: "Missing required fields: address, signature" });
    }

    // Validate address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ msg: "Invalid wallet address format" });
    }

    // Check if nonce exists
    if (!req.userDoc.walletNonce) {
      return res.status(400).json({
        msg: "No nonce found. Please request a nonce first using POST /api/users/wallet/nonce",
      });
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.verifyMessage(
        req.userDoc.walletNonce,
        signature
      );

      // Check if recovered address matches provided address
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(400).json({
          msg: "Signature verification failed: address mismatch",
          details:
            "The signature was not signed by the provided wallet address",
        });
      }

      // Update user with wallet information
      req.userDoc.walletAddress = address.toLowerCase();
      req.userDoc.walletConnected = true;
      req.userDoc.walletNonce = null; // Clear nonce after successful verification
      await req.userDoc.save();

      // If user is a student, register them on the blockchain
      if (req.userDoc.role === "student") {
        try {
          const blockchain = require("../blockchain/contract");

          // Check if student is already registered on blockchain
          const isRegistered = await blockchain.isStudentRegistered(
            address.toLowerCase()
          );

          if (!isRegistered) {
            console.log(
              `Registering student ${req.userDoc.email} on blockchain...`
            );
            await blockchain.registerStudent(address.toLowerCase());
            console.log(
              `✅ Student ${req.userDoc.email} registered on blockchain`
            );
          } else {
            console.log(
              `Student ${req.userDoc.email} already registered on blockchain`
            );
          }
        } catch (blockchainErr) {
          console.error("Blockchain registration error:", blockchainErr);
          // Don't fail the wallet connection if blockchain registration fails
          // Just log the error - the wallet is still connected
        }
      }

      res.json({
        msg: "Wallet connected successfully",
        walletAddress: req.userDoc.walletAddress,
        walletConnected: true,
      });
    } catch (verifyErr) {
      console.error("Signature verification error:", verifyErr);
      return res.status(400).json({
        msg: "Signature verification failed",
        error: verifyErr.message,
      });
    }
  } catch (err) {
    console.error("Error in verifyWallet:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * Disconnect wallet from user account
 * POST /api/users/wallet/disconnect
 * Protected route - requires authentication
 */
exports.disconnectWallet = async (req, res) => {
  try {
    req.userDoc.walletAddress = null;
    req.userDoc.walletConnected = false;
    req.userDoc.walletNonce = null;
    await req.userDoc.save();

    res.json({
      msg: "Wallet disconnected successfully",
      walletConnected: false,
    });
  } catch (err) {
    console.error("Error disconnecting wallet:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * Get current wallet connection status
 * GET /api/users/wallet/status
 * Protected route - requires authentication
 */
exports.getWalletStatus = async (req, res) => {
  try {
    res.json({
      walletConnected: req.userDoc.walletConnected,
      walletAddress: req.userDoc.walletAddress,
    });
  } catch (err) {
    console.error("Error getting wallet status:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
