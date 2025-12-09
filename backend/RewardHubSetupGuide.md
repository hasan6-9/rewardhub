# 🚀 RewardHub Backend Developer Setup Guide

> A complete step-by-step setup guide for new developers contributing to the RewardHub backend.

---

## 🧾 Table of Contents

- [🚀 RewardHub Backend Developer Setup Guide](#-rewardhub-backend-developer-setup-guide)
  - [🧾 Table of Contents](#-table-of-contents)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Cloning the Repository](#2-cloning-the-repository)
  - [3. Installing Dependencies](#3-installing-dependencies)
  - [4. Environment Configuration](#4-environment-configuration)
  - [5. Database Setup (MongoDB)](#5-database-setup-mongodb)
  - [6. Blockchain Integration (Ethereum)](#6-blockchain-integration-ethereum)
    - [MetaMask Setup:](#metamask-setup)
    - [Infura Setup:](#infura-setup)
  - [7. Smart Contract Deployment](#7-smart-contract-deployment)
  - [8. Running the Backend](#8-running-the-backend)
  - [9. Testing \& Validation](#9-testing--validation)
  - [10. Deployment (Optional)](#10-deployment-optional)
    - [Local (for testing):](#local-for-testing)
    - [Vercel/Heroku/Railway (Production):](#vercelherokurailway-production)
  - [11. Troubleshooting](#11-troubleshooting)
    - [❌ MongoDB Not Connecting:](#-mongodb-not-connecting)
    - [❌ Blockchain Errors:](#-blockchain-errors)
    - [❌ Authentication Fails:](#-authentication-fails)
    - [❌ Transaction Reverts:](#-transaction-reverts)
  - [📌 Security Best Practices](#-security-best-practices)

---

## 1. Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) (v16 or later)
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account
- [MetaMask](https://metamask.io/) wallet extension
- [Infura](https://infura.io/) account
- Sepolia Testnet ETH from [faucet](https://sepoliafaucet.com/)

---

## 2. Cloning the Repository

```bash
# Navigate to your projects folder
cd ~/projects

# Clone the repo
git clone https://github.com/hasan6-9/RewardHub.git
cd RewardHub
```

---

## 3. Installing Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Smart contract development
npm install --save-dev hardhat dotenv @nomicfoundation/hardhat-toolbox
```

---

## 4. Environment Configuration

Create a `.env` file in the `backend` folder:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/rewardhub
PRIVATE_KEY=0x<your_private_key>        # from MetaMask (test wallet only!)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<your_infura_project_id>
CONTRACT_ADDRESS=0xYourDeployedContractAddress
JWT_SECRET=your_super_secret
PORT=5000
```

⚠️ Never commit `.env` to GitHub!

---

## 5. Database Setup (MongoDB)

Create a free MongoDB Atlas cluster:

- Go to MongoDB Atlas dashboard
- Create a cluster & database named `rewardhub`
- Whitelist your IP & create a DB user
- Use the connection string in `.env`

Collections created automatically:

- users
- achievements
- rewards
- studentachievements
- redemptions

---

## 6. Blockchain Integration (Ethereum)

**Smart Contract:** Written in Solidity, lives in `contracts/RewardHubToken.sol`

### MetaMask Setup:

- Use the Sepolia testnet
- Copy your public address
- Export your private key (for test accounts only!)

### Infura Setup:

- Create a project on [Infura](https://infura.io)
- Choose "Ethereum" + "Sepolia"
- Copy the Sepolia RPC URL into `.env`

---

## 7. Smart Contract Deployment

Compile and deploy using Hardhat:

```bash
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract address and update `.env`:

```env
CONTRACT_ADDRESS=0x1234...
```

To generate ABI:

- Open `artifacts/contracts/RewardHubToken.sol/RewardHubToken.json`
- Copy only the `"abi": [...]` array to `backend/blockchain/RewardHubTokenABI.json`

---

## 8. Running the Backend

```bash
cd backend
node server.js
```

Visit: `http://localhost:5000`

---

## 9. Testing & Validation

Use [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) or Postman.

Test the following APIs:

- `/api/auth/register` (faculty/student)
- `/api/students/register` (blockchain+db)
- `/api/achievements` (add/view achievements)
- `/api/student-achievements` (grant tokens)
- `/api/redemptions` (redeem rewards)
- `/api/blockchain/balance/:wallet`

Verify blockchain txs on [Sepolia Etherscan](https://sepolia.etherscan.io/).

---

## 10. Deployment (Optional)

### Local (for testing):

```bash
PORT=5000
node server.js
```

### Vercel/Heroku/Railway (Production):

- Add `MONGO_URI`, `JWT_SECRET`, `PRIVATE_KEY`, `CONTRACT_ADDRESS`, `SEPOLIA_RPC_URL` as env vars
- Use build/start scripts: `"start": "node server.js"`

---

## 11. Troubleshooting

### ❌ MongoDB Not Connecting:

- Check `.env` MONGO_URI format
- Whitelist your current IP in Atlas

### ❌ Blockchain Errors:

- Make sure contract ABI is synced with deployed contract
- Check if achievement/perk exists on-chain before interacting
- Ensure PRIVATE_KEY and CONTRACT_ADDRESS are correct

### ❌ Authentication Fails:

- Ensure JWT_SECRET is set
- Token must be in Authorization header: `Bearer TOKEN`

### ❌ Transaction Reverts:

- Insufficient balance
- Achievement not added on-chain
- Student not registered on-chain

---

## 📌 Security Best Practices

- Never commit `.env` to GitHub
- Never expose real PRIVATE_KEY in production
- Use a proxy contract if upgrading in future
- Rate-limit login & sensitive endpoints

---

You’re ready to run and contribute to the RewardHub backend project. Happy coding! 🎉
