import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import blockchainService from '@/services/blockchain'
import api from '@/services/api'

export const useWalletStore = defineStore('wallet', () => {
  // State
  const address = ref(null)
  const isConnected = ref(false)
  const tokenBalance = ref('0')
  const loading = ref(false)
  const error = ref(null)
  const chainId = ref(null)

  // Getters
  const shortAddress = computed(() => {
    if (!address.value) return ''
    return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
  })

  // Actions
  async function connectWallet() {
    loading.value = true
    error.value = null
    
    try {
      // Request accounts from MetaMask
      const accounts = await blockchainService.requestAccounts()
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      address.value = accounts[0]
      isConnected.value = true

      // Get network info
      const network = await blockchainService.getNetwork()
      chainId.value = network.chainId.toString()

      // Fetch token balance
      await fetchTokenBalance()

      // Setup listeners
      setupListeners()

      return address.value
    } catch (err) {
      error.value = err.message || 'Failed to connect wallet'
      isConnected.value = false
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTokenBalance() {
    if (!address.value) return
    
    try {
      const balance = await blockchainService.getTokenBalance(address.value)
      tokenBalance.value = balance
      return balance
    } catch (err) {
      console.error('Error fetching token balance:', err)
      error.value = 'Failed to fetch token balance'
    }
  }

  async function verifyWalletSignature() {
    if (!address.value) {
      throw new Error('Wallet not connected')
    }

    loading.value = true
    error.value = null

    try {
      // Get nonce from backend (Authenticated POST)
      const nonceResponse = await api.getNonce()
      const nonce = nonceResponse.nonce

      // Sign message with MetaMask
      const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address.value],
      })

      // Verify signature with backend
      const verifyResponse = await api.verifySignature({
        address: address.value, 
        signature,
      })

      return verifyResponse
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to verify signature'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setupListeners() {
    // Listen for account changes
    blockchainService.onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        address.value = accounts[0]
        fetchTokenBalance()
      }
    })

    // Listen for chain changes
    blockchainService.onChainChanged(() => {
      window.location.reload()
    })
  }

  function disconnectWallet() {
    address.value = null
    isConnected.value = false
    tokenBalance.value = '0'
    chainId.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    address,
    isConnected,
    tokenBalance,
    loading,
    error,
    chainId,
    // Getters
    shortAddress,
    // Actions
    connectWallet,
    fetchTokenBalance,
    verifyWalletSignature,
    disconnectWallet,
    clearError,
  }
})
