<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-content">
      <AppSidebar />
      <main class="main-content">
        <div class="page-header">
          <h1>Wallet Management</h1>
        </div>

        <div class="card">
          <div v-if="!walletStore.isConnected" class="wallet-connect">
            <h3>Connect Your Wallet</h3>
            <p class="text-secondary">
              Connect your MetaMask wallet to receive and redeem tokens
            </p>
            <button
              @click="handleConnect"
              class="btn btn-primary"
              :disabled="loading"
            >
              {{ loading ? "Connecting..." : "Connect MetaMask" }}
            </button>
          </div>

          <div v-else class="wallet-info">
            <h3>Wallet Connected</h3>
            <div class="info-row">
              <span class="label">Address:</span>
              <span class="value">{{
                truncateAddress(walletStore.address)
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">Balance:</span>
              <span class="value">{{ walletStore.balance }} tokens</span>
            </div>
            <button @click="handleDisconnect" class="btn btn-danger mt-3">
              Disconnect Wallet
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import AppSidebar from "@/components/common/AppSidebar.vue";
import { useWalletStore } from "@/stores/wallet";
import { truncateAddress } from "@/utils/helpers";

const walletStore = useWalletStore();
const loading = ref(false);

async function handleConnect() {
  loading.value = true;
  try {
    await walletStore.connect();
    window.$toast?.("Wallet connected successfully!", "success");
  } catch (error) {
    window.$toast?.("Error connecting wallet: " + error.message, "error");
  } finally {
    loading.value = false;
  }
}

async function handleDisconnect() {
  try {
    await walletStore.disconnect();
    window.$toast?.("Wallet disconnected successfully!", "success");
  } catch (error) {
    window.$toast?.("Error disconnecting wallet: " + error.message, "error");
  }
}
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.dashboard-content {
  display: flex;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 2rem;
}

.wallet-connect,
.wallet-info {
  text-align: center;
  padding: 2rem;
}

.wallet-connect h3,
.wallet-info h3 {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: var(--text-secondary);
}

.value {
  font-family: monospace;
  color: var(--text-primary);
}
</style>
