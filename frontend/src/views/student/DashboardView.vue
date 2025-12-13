<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-content">
      <AppSidebar />
      <main class="main-content">
        <div class="page-header">
          <h1>Student Dashboard</h1>
          <p class="text-secondary">Welcome back!</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card card">
            <h3>Token Balance</h3>
            <p class="stat-value">{{ walletStore.balance || 0 }}</p>
            <p class="text-secondary">Reward tokens</p>
          </div>

          <div class="stat-card card">
            <h3>Wallet Status</h3>
            <p v-if="walletStore.isConnected" class="text-success">Connected</p>
            <p v-else class="text-secondary">Not Connected</p>
            <button
              v-if="!walletStore.isConnected"
              @click="connectWallet"
              class="btn btn-primary btn-sm mt-2"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import AppSidebar from "@/components/common/AppSidebar.vue";
import { useWalletStore } from "@/stores/wallet";

const walletStore = useWalletStore();

async function connectWallet() {
  try {
    await walletStore.connect();
    window.$toast?.("Wallet connected successfully!", "success");
    // Fetch balance after connecting
    await walletStore.fetchBalance();
  } catch (error) {
    window.$toast?.("Error connecting wallet: " + error.message, "error");
  }
}

onMounted(async () => {
  await walletStore.checkStatus();
  // Fetch balance if wallet is already connected
  if (walletStore.isConnected && walletStore.address) {
    await walletStore.fetchBalance();
  }
  walletStore.setupListeners();
});
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card h3 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.stat-value {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}
</style>
