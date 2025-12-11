const { ethers } = require("ethers");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const wallet = new ethers.Wallet(PRIVATE_KEY);

// Read nonce from CLI argument
const nonce = process.argv[2];

(async () => {
  const signature = await wallet.signMessage(nonce);
  console.log(signature);
})();
