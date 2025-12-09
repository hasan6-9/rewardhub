# 🎓 RewardHub - Complete Backend Setup Guide

> A blockchain-based student rewards system built with Node.js, Express, MongoDB, and Ethereum Smart Contracts

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Prerequisites](#prerequisites)
4. [Installation Guide](#installation-guide)
5. [Running with Ganache (Local Blockchain)](#running-with-ganache-local-blockchain)
6. [Running with Sepolia Testnet](#running-with-sepolia-testnet)
7. [API Endpoints](#api-endpoints)
8. [Testing the System](#testing-the-system)
9. [Critical Issues & Fixes](#critical-issues--fixes)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**RewardHub** is a decentralized student achievement tracking system that:

- Awards blockchain tokens (RHT - RewardHubToken) for academic achievements
- Allows students to redeem tokens for rewards/perks
- Uses Ethereum smart contracts for transparency and immutability
- Stores user data and relationships in MongoDB

### **Architecture:**

```
Frontend (Not included)
    ↓
Express Backend (API Layer)
    ↓
MongoDB (User data, achievements, redemptions)
    ↓
Ethereum Smart Contract (Token minting, burning, on-chain records)
```

---

## 📁 Directory Structure

```
backend/
├── artifacts/                    # Compiled smart contracts
│   ├── @openzeppelin/           # OpenZeppelin dependencies
│   ├── build-info/              # Build metadata
│   └── contracts/               # Compiled RewardHubToken
│
├── blockchain/                   # Blockchain integration
│   ├── contract.js              # Web3 interaction functions
│   └── RewardHubTokenABI.json   # Contract ABI (interface)
│
├── cache/                        # Hardhat compilation cache
│
├── config/
│   └── db.js                    # MongoDB connection
│
├── contracts/
│   └── RewardHubToken.sol       # Smart contract (Solidity)
│
├── controllers/                  # Business logic
│   ├── achievementController.js
│   ├── authController.js
│   ├── redemptionController.js
│   ├── rewardController.js
│   ├── studentAchievementController.js
│   └── studentController.js
│
├── models/                       # MongoDB schemas
│   ├── Achievement.js
│   ├── Redemption.js
│   ├── Reward.js
│   ├── StudentAchievement.js
│   └── User.js
│
├── routes/                       # API endpoints
│   ├── achievements.js
│   ├── auth.js
│   ├── blockchain.js
│   ├── redemptions.js
│   ├── rewards.js
│   ├── studentAchievements.js
│   └── students.js
│
├── scripts/
│   ├── addAchievement.js        # Utility to add achievements on-chain
│   └── deploy.js                # Smart contract deployment
│
├── .env                          # Environment variables
├── .gitignore
├── hardhat.config.js            # Hardhat configuration
├── package.json
└── server.js                    # Main entry point
```

---

## ✅ Prerequisites

Install these before proceeding:

### **Required Software:**

1. **Node.js** (v16 or later) - [Download](https://nodejs.org/)
2. **Git** - [Download](https://git-scm.com/)
3. **MongoDB Atlas Account** - [Sign Up](https://www.mongodb.com/cloud/atlas/register)
4. **Ganache** (for local testing) - [Download](https://trufflesuite.com/ganache/)
5. **MetaMask** browser extension - [Install](https://metamask.io/)

### **For Sepolia Testnet (Optional):**

6. **Infura Account** - [Sign Up](https://infura.io/)
7. **Sepolia Test ETH** - [Faucet](https://sepoliafaucet.com/)

---

## 🚀 Installation Guide

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/hasan6-9/RewardHub.git
cd RewardHub/backend
```

### **Step 2: Install Dependencies**

```bash
npm install
```

This installs:

- Express (API server)
- Mongoose (MongoDB ODM)
- Ethers.js (Blockchain interaction)
- Hardhat (Smart contract development)
- bcryptjs, jsonwebtoken (Authentication)

### **Step 3: Setup MongoDB**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user with password
4. Whitelist your IP address (or use `0.0.0.0/0` for testing)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rewardhub
   ```

### **Step 4: Configure Environment Variables**

**🔴 CRITICAL: Remove your current `.env` file (it contains exposed private keys!)**

Create a new `.env` file:

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rewardhub

# JWT Secret (change this!)
JWT_SECRET=your_random_secret_key_here_make_it_long_and_secure

# Server Port
PORT=5000

# Blockchain (will be filled after deployment)
PRIVATE_KEY=
SEPOLIA_RPC_URL=
CONTRACT_ADDRESS=
```

---

## 🏠 Running with Ganache (Local Blockchain)

Ganache provides a local Ethereum blockchain for development and testing.

### **Step 1: Install & Start Ganache**

**Option A: Ganache GUI**

1. Download from [trufflesuite.com/ganache](https://trufflesuite.com/ganache/)
2. Install and open
3. Click "Quickstart" to create a workspace
4. Note the RPC Server URL (usually `http://127.0.0.1:7545`)

**Option B: Ganache CLI**

```bash
npm install -g ganache
ganache
```

### **Step 2: Update `.env` for Ganache**

```env
MONGO_URI=mongodb+srv://<your_mongodb_uri>
JWT_SECRET=your_secret_key
PORT=5000

# Ganache Configuration
PRIVATE_KEY=<copy_private_key_from_ganache_account_1>
SEPOLIA_RPC_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=
```

**To get Private Key from Ganache:**

- GUI: Click the key icon next to any account
- CLI: Displayed in the terminal when you start Ganache

### **Step 3: Update Hardhat Config**

Edit `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [process.env.PRIVATE_KEY],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

### **Step 4: Deploy Smart Contract to Ganache**

```bash
# Compile the contract
npx hardhat compile

# Deploy to Ganache
npx hardhat run scripts/deploy.js --network ganache
```

**Expected Output:**

```
✅ Contract deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
👤 Contract owner (initialOwner): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### **Step 5: Update CONTRACT_ADDRESS in `.env`**

```env
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### **Step 6: Generate ABI File**

After compilation, copy the ABI:

```bash
# The ABI is in artifacts/contracts/RewardHubToken.sol/RewardHubToken.json
# Copy the "abi" array to blockchain/RewardHubTokenABI.json
```

**Manual steps:**

1. Open `artifacts/contracts/RewardHubToken.sol/RewardHubToken.json`
2. Find the `"abi": [...]` array
3. Copy it to `blockchain/RewardHubTokenABI.json`

**Or create the file directly:**

```json
[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  ...
]
```

### **Step 7: Start the Backend Server**

```bash
node server.js
```

**Expected Output:**

```
✅ MongoDB Connected
🚀 Server running on port 5000
```

### **Step 8: Add Test Data**

**Add an achievement to the blockchain:**

```bash
node scripts/addAchievement.js
```

**Or use the API:**

```bash
curl -X POST http://localhost:5000/api/achievements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Perfect Attendance",
    "description": "Attended all classes this month",
    "tokenReward": 100
  }'
```

---

## 🌐 Running with Sepolia Testnet

For production-like testing on a real Ethereum testnet:

### **Step 1: Setup Infura**

1. Go to [infura.io](https://infura.io/) and create an account
2. Create a new project (select "Web3 API")
3. Copy the Sepolia RPC URL:
   ```
   https://sepolia.infura.io/v3/<YOUR_PROJECT_ID>
   ```

### **Step 2: Setup MetaMask**

1. Install MetaMask extension
2. Create a wallet (ONLY FOR TESTING!)
3. Switch to Sepolia Test Network
4. Get test ETH from [sepoliafaucet.com](https://sepoliafaucet.com/)
5. Export your private key:
   - Click account → Account details → Export Private Key
   - ⚠️ **NEVER use this wallet for real funds!**

### **Step 3: Update `.env`**

```env
MONGO_URI=mongodb+srv://<your_mongodb_uri>
JWT_SECRET=your_secret_key
PORT=5000

# Sepolia Configuration
PRIVATE_KEY=<your_metamask_private_key>
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<YOUR_PROJECT_ID>
CONTRACT_ADDRESS=
```

### **Step 4: Deploy to Sepolia**

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Wait ~30 seconds for deployment. Copy the contract address to `.env`.

### **Step 5: Verify on Etherscan**

Visit `https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>` to see your deployed contract.

### **Step 6: Start Server**

```bash
node server.js
```

---

## 🔌 API Endpoints

### **Authentication**

```http
POST /api/auth/register
POST /api/auth/login
```

### **Students**

```http
POST /api/students/register
```

### **Achievements**

```http
POST /api/achievements
GET  /api/achievements
```

### **Student Achievements (Award Tokens)**

```http
POST /api/student-achievements
GET  /api/student-achievements/:studentId
```

### **Rewards**

```http
POST /api/rewards
GET  /api/rewards
```

### **Redemptions**

```http
POST /api/redemptions
GET  /api/redemptions/student/:studentId
GET  /api/redemptions
```

### **Blockchain**

```http
GET /api/blockchain/balance/:walletAddress
```

---

## 🧪 Testing the System

### **1. Register Faculty**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "email": "smith@university.edu",
    "password": "password123",
    "role": "faculty"
  }'
```

### **2. Register Student (Blockchain + Database)**

```bash
curl -X POST http://localhost:5000/api/students/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@student.edu",
    "password": "password123",
    "walletAddress": "0xYourGanacheAccountAddress"
  }'
```

### **3. Create Achievement (Database)**

```bash
curl -X POST http://localhost:5000/api/achievements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Perfect Attendance",
    "description": "100% attendance",
    "tokenReward": 50
  }'
```

### **4. Add Achievement to Blockchain**

Edit `scripts/addAchievement.js` with your achievement title and reward:

```bash
node scripts/addAchievement.js
```

### **5. Award Achievement to Student**

```bash
curl -X POST http://localhost:5000/api/student-achievements \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "<mongodb_student_id>",
    "achievementId": "<mongodb_achievement_id>",
    "walletAddress": "0xStudentWalletAddress"
  }'
```

### **6. Check Token Balance**

```bash
curl http://localhost:5000/api/blockchain/balance/0xStudentWalletAddress
```

### **7. Create Reward/Perk**

```bash
curl -X POST http://localhost:5000/api/rewards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Free Textbook",
    "description": "Choose any textbook",
    "tokenCost": 30
  }'
```

---

## ⚠️ Critical Issues & Fixes

### **Issue 1: Token Decimals Mismatch**

**Problem:** Smart contract uses 18 decimals, but database stores whole numbers.

**Fix:** Remove `* 1e18` from smart contract line 66:

```solidity
// Before
_mint(student, reward * 1e18);

// After
_mint(student, reward);
```

Then redeploy the contract.

### **Issue 2: Redemption Uses Wrong Wallet**

**Problem:** Backend wallet redeems instead of student wallet.

**Fix:** Redemptions should be called from frontend with student's wallet signature. For now, comment out redemption functionality or refactor to accept signed transactions.

### **Issue 3: No Authentication Middleware**

**Problem:** Anyone can call any endpoint.

**Fix:** Create `middleware/auth.js`:

```javascript
const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

exports.isFaculty = (req, res, next) => {
  if (!["faculty", "admin"].includes(req.user.role)) {
    return res.status(403).json({ msg: "Access denied" });
  }
  next();
};
```

Then protect routes:

```javascript
const { verifyToken, isFaculty } = require("../middleware/auth");
router.post("/", verifyToken, isFaculty, createAchievement);
```

### **Issue 4: Password Not Hashed in studentController**

**Fix:** In `studentController.js`:

```javascript
const bcrypt = require("bcryptjs");

const hashedPassword = await bcrypt.hash(password, 10);
const newUser = await User.create({
  name,
  email,
  password: hashedPassword, // Fixed
  role: "student",
  walletAddress,
});
```

### **Issue 5: Missing Blockchain Functions**

Add to `blockchain/contract.js`:

```javascript
const addAchievement = async (title, rewardAmount) => {
  const tx = await contract.addAchievement(title, rewardAmount);
  await tx.wait();
  return tx.hash;
};

const addPerk = async (title, cost) => {
  const tx = await contract.addPerk(title, cost);
  await tx.wait();
  return tx.hash;
};

module.exports = {
  registerStudent,
  grantAchievement,
  redeemPerk,
  getTokenBalance,
  addAchievement, // Add this
  addPerk, // Add this
};
```

---

## 🔧 Troubleshooting

### **MongoDB Connection Failed**

```
❌ MongoDB Connection Failed: MongoServerError
```

**Fix:**

- Check `MONGO_URI` format
- Whitelist your IP in MongoDB Atlas
- Verify username/password

### **Contract Deployment Failed**

```
Error: insufficient funds for intrinsic transaction cost
```

**Fix:**

- Ganache: Make sure it's running
- Sepolia: Get test ETH from faucet

### **Achievement Not Found**

```
Achievement not found or inactive
```

**Fix:**

- Run `node scripts/addAchievement.js` first
- Make sure achievement title matches exactly (case-sensitive)

### **Server Won't Start**

```
Error: Cannot find module './blockchain/RewardHubTokenABI.json'
```

**Fix:**

- Make sure you copied the ABI from compiled artifacts
- Create the file if missing

### **Ganache Resets After Restart**

**Problem:** Contract address changes when Ganache restarts.

**Fix:**

- Use persistent Ganache workspace
- Or redeploy contract each time and update `CONTRACT_ADDRESS`

---

## 🎉 You're Ready!

Your RewardHub backend is now running!

**Next Steps:**

1. Build a frontend (React/Vue/Angular)
2. Connect frontend to MetaMask
3. Implement proper authentication
4. Add input validation
5. Deploy to production (AWS/Heroku/Vercel)

**Quick Test:**

```bash
# Check if everything is working
curl http://localhost:5000/api/achievements
```

Happy coding! 🚀

---

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [MongoDB Atlas Guide](https://www.mongodb.com/docs/atlas/)
- [Express.js Guide](https://expressjs.com/)
