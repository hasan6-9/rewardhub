import { ethers } from 'ethers'
import RewardHubABI from '../../../backend/abi/RewardHub.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || '1337'

class BlockchainService {
  constructor() {
    this.provider = null
    this.signer = null
    this.contract = null
  }

  // Initialize provider and contract
  async initialize() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.signer = await this.provider.getSigner()
    
    // Initialize contract with ABI
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      RewardHubABI.abi,
      this.signer
    )
  }

  // Get token balance for an address
  async getTokenBalance(address) {
    if (!this.contract) await this.initialize()
    
    try {
      const balance = await this.contract.tokenBalance(address)
      return ethers.formatUnits(balance, 0) // Returns as string
    } catch (error) {
      console.error('Error fetching token balance:', error)
      throw error
    }
  }

  // Verify achievement on blockchain (admin only)
  async verifyAchievement(studentAddress, tokens) {
    if (!this.contract) await this.initialize()
    
    try {
      const tx = await this.contract.verifyAchievement(studentAddress, tokens)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error verifying achievement:', error)
      throw error
    }
  }

  // Redeem tokens
  async redeemTokens(amount) {
    if (!this.contract) await this.initialize()
    
    try {
      const tx = await this.contract.redeemTokens(amount)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error redeeming tokens:', error)
      throw error
    }
  }

  // Get connected wallet address
  async getConnectedAddress() {
    if (!this.signer) await this.initialize()
    return await this.signer.getAddress()
  }

  // Get network info
  async getNetwork() {
    if (!this.provider) await this.initialize()
    return await this.provider.getNetwork()
  }

  // Listen to account changes
  onAccountsChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback)
    }
  }

  // Listen to chain changes
  onChainChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback)
    }
  }

  // Request account access
  async requestAccounts() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }
    
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    })
    return accounts
  }

  // Switch to correct network
  async switchNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(CHAIN_ID).toString(16)}` }],
      })
    } catch (error) {
      console.error('Error switching network:', error)
      throw error
    }
  }
}

export default new BlockchainService()
