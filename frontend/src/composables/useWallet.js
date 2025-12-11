import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import blockchainService from '@/services/blockchain'

export function useWallet() {
  const walletStore = useWalletStore()
  
  const isMetaMaskInstalled = ref(false)
  const error = ref(null)

  // Check if MetaMask is installed
  const checkMetaMask = () => {
    isMetaMaskInstalled.value = typeof window.ethereum !== 'undefined'
    return isMetaMaskInstalled.value
  }

  // Connect wallet
  const connect = async () => {
    error.value = null
    
    if (!checkMetaMask()) {
      error.value = 'Please install MetaMask to use this feature'
      return false
    }

    try {
      await walletStore.connectWallet()
      return true
    } catch (err) {
      error.value = err.message || 'Failed to connect wallet'
      return false
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    walletStore.disconnectWallet()
  }

  // Refresh balance
  const refreshBalance = async () => {
    if (walletStore.isConnected) {
      try {
        await walletStore.fetchTokenBalance()
      } catch (err) {
        console.error('Failed to refresh balance:', err)
      }
    }
  }

  // Verify signature
  const verifySignature = async () => {
    error.value = null
    
    try {
      const result = await walletStore.verifyWalletSignature()
      return result
    } catch (err) {
      error.value = err.message || 'Failed to verify signature'
      throw err
    }
  }

  // Handle account changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect()
    } else if (accounts[0] !== walletStore.address) {
      walletStore.address = accounts[0]
      refreshBalance()
    }
  }

  // Handle chain changes
  const handleChainChanged = () => {
    window.location.reload()
  }

  // Setup event listeners
  onMounted(() => {
    checkMetaMask()
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }
  })

  // Cleanup event listeners
  onUnmounted(() => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  })

  return {
    // State
    isMetaMaskInstalled,
    isConnected: computed(() => walletStore.isConnected),
    address: computed(() => walletStore.address),
    shortAddress: computed(() => walletStore.shortAddress),
    tokenBalance: computed(() => walletStore.tokenBalance),
    loading: computed(() => walletStore.loading),
    error,
    
    // Methods
    connect,
    disconnect,
    refreshBalance,
    verifySignature,
    checkMetaMask,
  }
}
