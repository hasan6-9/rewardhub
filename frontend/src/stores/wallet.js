import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as walletService from "@/services/wallet.service";
import * as blockchainService from "@/services/blockchain.service";
import { useAuthStore } from "./auth";

export const useWalletStore = defineStore("wallet", () => {
  const connected = ref(false);
  const address = ref(null);
  const balance = ref(0);
  const loading = ref(false);
  const error = ref(null);

  const isConnected = computed(() => connected.value && !!address.value);

  // Check wallet status from backend
  async function checkStatus() {
    try {
      const data = await walletService.getWalletStatus();
      connected.value = data.walletConnected;
      address.value = data.walletAddress;

      if (connected.value && address.value) {
        await fetchBalance();
      }

      return data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  // Connect wallet with MetaMask
  async function connect() {
    try {
      loading.value = true;
      error.value = null;

      // Check if MetaMask is installed
      if (!blockchainService.isMetaMaskInstalled()) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask to continue."
        );
      }

      // Request account access
      const accounts = await blockchainService.requestAccounts();
      const walletAddress = accounts[0];

      // Get nonce from backend
      const { nonce } = await walletService.generateNonce(walletAddress);

      // Sign nonce with MetaMask
      const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
      const signature = await blockchainService.signMessage(message);

      // Verify signature with backend
      const data = await walletService.verifyWallet(walletAddress, signature);

      connected.value = true;
      address.value = walletAddress;

      // Update auth store user data
      const authStore = useAuthStore();
      authStore.updateUser(data.user);

      // Fetch balance
      await fetchBalance();

      return data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Disconnect wallet
  async function disconnect() {
    try {
      loading.value = true;
      error.value = null;

      const data = await walletService.disconnectWallet();

      connected.value = false;
      address.value = null;
      balance.value = 0;

      // Update auth store
      const authStore = useAuthStore();
      authStore.updateUser(data.user);

      return data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Fetch token balance
  async function fetchBalance() {
    if (!address.value) return;

    try {
      const data = await blockchainService.getTokenBalance(address.value);
      balance.value = data.balance || 0;
      return data;
    } catch (err) {
      // Silent fail - balance fetch is non-critical
      balance.value = 0;
    }
  }

  // Setup MetaMask listeners
  function setupListeners() {
    blockchainService.onAccountsChanged(async (accounts) => {
      if (accounts.length === 0) {
        // User disconnected wallet in MetaMask
        await disconnect();
      } else if (accounts[0] !== address.value) {
        // User switched accounts
        address.value = accounts[0];
        await fetchBalance();
      }
    });

    blockchainService.onChainChanged(() => {
      // Reload page on chain change
      window.location.reload();
    });
  }

  return {
    connected,
    address,
    balance,
    loading,
    error,
    isConnected,
    checkStatus,
    connect,
    disconnect,
    fetchBalance,
    setupListeners,
  };
});
