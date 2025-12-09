/**
 * Middleware to ensure user has connected their wallet
 * Must be used after verifyToken middleware (requires req.userDoc)
 * 
 * Checks that user has both walletConnected=true and a valid walletAddress
 * Returns 400 with instructive message if wallet not connected
 */
const requireWallet = (req, res, next) => {
  // Ensure verifyToken middleware has run first
  if (!req.userDoc) {
    return res.status(500).json({ 
      msg: "Server configuration error: requireWallet must be used after verifyToken middleware" 
    });
  }

  // Check if wallet is connected
  if (!req.userDoc.walletConnected || !req.userDoc.walletAddress) {
    return res.status(400).json({ 
      msg: "Wallet not connected. Please connect your MetaMask wallet first.",
      action: "connect_wallet",
      instructions: "Use POST /api/users/wallet/nonce to get a nonce, sign it with MetaMask, then POST /api/users/wallet/verify with the signature"
    });
  }

  next();
};

module.exports = { requireWallet };
