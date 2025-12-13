<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-content">
      <AppSidebar />
      <main class="main-content">
        <div class="page-header">
          <h1>Available Perks</h1>
          <p class="text-secondary">Redeem your tokens for rewards</p>
        </div>

        <LoadingSpinner v-if="loading" />
        <div v-else>
          <div class="perks-grid">
            <div v-for="perk in perks" :key="perk._id" class="perk-card card">
              <h3>{{ perk.title }}</h3>
              <p>{{ perk.description }}</p>
              <div class="perk-footer">
                <span class="badge badge-primary"
                  >{{ perk.tokenCost }} tokens</span
                >
                <button
                  @click="redeemPerk(perk._id)"
                  class="btn btn-sm btn-success"
                  :disabled="!walletStore.isConnected"
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>

          <!-- Redemption History Section -->
          <div class="redemption-history mt-4">
            <h2>Redemption History</h2>
            <LoadingSpinner v-if="loadingRedemptions" />
            <div v-else-if="redemptions.length === 0" class="empty-state">
              <p>No redemptions yet. Redeem your first perk above!</p>
            </div>
            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Perk</th>
                    <th>Token Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="redemption in redemptions" :key="redemption._id">
                    <td>{{ formatDate(redemption.createdAt) }}</td>
                    <td>{{ redemption.reward?.title || "N/A" }}</td>
                    <td>{{ redemption.tokenCost }} tokens</td>
                    <td>
                      <span class="badge badge-success">Redeemed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import AppSidebar from "@/components/common/AppSidebar.vue";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import { useWalletStore } from "@/stores/wallet";
import { useAuthStore } from "@/stores/auth";
import { getRewards } from "@/services/perk.service";
import {
  redeemPerk as redeemPerkService,
  getStudentRedemptions,
} from "@/services/redemption.service";

const walletStore = useWalletStore();
const authStore = useAuthStore();
const perks = ref([]);
const redemptions = ref([]);
const loading = ref(false);
const loadingRedemptions = ref(false);

async function loadPerks() {
  loading.value = true;
  try {
    const data = await getRewards();
    perks.value = data.rewards;
  } catch (error) {
    window.$toast?.("Error loading perks: " + error.message, "error");
  } finally {
    loading.value = false;
  }
}

async function redeemPerk(rewardId) {
  if (!walletStore.isConnected) {
    window.$toast?.("Please connect your wallet first!", "warning");
    return;
  }

  try {
    await redeemPerkService(rewardId);
    window.$toast?.("Perk redeemed successfully!", "success");
    await walletStore.fetchBalance();
    await loadRedemptions(); // Refresh redemption history
  } catch (error) {
    window.$toast?.("Error redeeming perk: " + error.message, "error");
  }
}

async function loadRedemptions() {
  loadingRedemptions.value = true;
  try {
    const userId = authStore.user?._id;
    if (userId) {
      const data = await getStudentRedemptions(userId);
      redemptions.value = data.redemptions || [];
    }
  } catch (error) {
    window.$toast?.("Error loading redemptions: " + error.message, "error");
  } finally {
    loadingRedemptions.value = false;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(() => {
  loadPerks();
  loadRedemptions();
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

.perks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.perk-card h3 {
  margin-bottom: 0.5rem;
}

.perk-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}
</style>
