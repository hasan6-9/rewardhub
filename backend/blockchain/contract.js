const { ethers } = require("ethers");
require("dotenv").config();

// Load contract ABI and address
const abi = require("./RewardHubTokenABI.json");
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Connect to blockchain using Sepolia RPC
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

// ======================
// Blockchain Functions
// ======================

const registerStudent = async (studentWalletAddress) => {
  const address = ethers.getAddress(studentWalletAddress);
  const tx = await contract.registerStudent(address);
  await tx.wait();
  return tx.hash;
};

const grantAchievement = async (studentAddress, achievementName) => {
  const tx = await contract.grantAchievement(studentAddress, achievementName);
  await tx.wait();
  return tx.hash;
};

const redeemPerk = async (perkName) => {
  const tx = await contract.redeemPerk(perkName);
  await tx.wait();
  return tx.hash;
};

/**
 * Get token balance for a wallet address
 * Returns both raw BigNumber string and human-readable number
 */
const getTokenBalance = async (walletAddress) => {
  const balance = await contract.balanceOf(walletAddress);
  const decimals = await getDecimals();
  const human = parseFloat(ethers.formatUnits(balance, decimals));
  
  return {
    raw: balance.toString(),
    human: human,
  };
};

/**
 * Get token decimals from contract
 * Fallback to 18 if contract doesn't have decimals function
 */
const getDecimals = async () => {
  try {
    const decimals = await contract.decimals();
    return Number(decimals);
  } catch (err) {
    console.warn("Contract doesn't have decimals function, using default 18");
    return 18;
  }
};

/**
 * Get total supply of tokens
 * Returns human-readable number
 */
const getTotalSupply = async () => {
  try {
    const totalSupply = await contract.totalSupply();
    const decimals = await getDecimals();
    return parseFloat(ethers.formatUnits(totalSupply, decimals));
  } catch (err) {
    console.error("Error getting total supply:", err);
    throw err;
  }
};

/**
 * Add achievement to blockchain
 * Note: This assumes the contract has an addAchievement function
 * If not available, this will throw an error
 */
const addAchievement = async (title, tokenReward) => {
  try {
    const tx = await contract.addAchievement(title, tokenReward);
    await tx.wait();
    return tx.hash;
  } catch (err) {
    console.error("Error adding achievement to blockchain:", err);
    throw new Error(`Blockchain addAchievement failed: ${err.message}`);
  }
};

/**
 * Add perk to blockchain
 * Note: This assumes the contract has an addPerk function
 * If not available, this will throw an error
 */
const addPerk = async (title, tokenCost) => {
  try {
    const tx = await contract.addPerk(title, tokenCost);
    await tx.wait();
    return tx.hash;
  } catch (err) {
    console.error("Error adding perk to blockchain:", err);
    throw new Error(`Blockchain addPerk failed: ${err.message}`);
  }
};

/**
 * Mint tokens to a student address
 * Note: This assumes the contract has a mint function
 * If not available, this will throw an error
 */
const mint = async (studentAddress, amount) => {
  try {
    const tx = await contract.mint(studentAddress, amount);
    await tx.wait();
    return tx.hash;
  } catch (err) {
    console.error("Error minting tokens:", err);
    throw new Error(`Blockchain mint failed: ${err.message}`);
  }
};

module.exports = {
  registerStudent,
  grantAchievement,
  redeemPerk,
  getTokenBalance,
  getDecimals,
  getTotalSupply,
  addAchievement,
  addPerk,
  mint,
  contract, // Export contract instance for advanced usage
  provider,
};
