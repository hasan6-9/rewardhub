<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-content">
      <AppSidebar />
      <main class="main-content">
        <div class="page-header">
          <h1>Admin Dashboard</h1>
          <p class="text-secondary">Overview of system statistics</p>
        </div>

        <LoadingSpinner v-if="loading" message="Loading dashboard..." />

        <div v-else class="stats-grid">
          <!-- User Stats -->
          <div class="stat-card card">
            <h3>Total Users</h3>
            <p class="stat-value">{{ stats.totalUsers || 0 }}</p>
            <div class="stat-breakdown">
              <span>Students: {{ stats.totalStudents || 0 }}</span>
              <span>Faculty: {{ stats.totalFaculty || 0 }}</span>
              <span>Admins: {{ stats.totalAdmins || 0 }}</span>
            </div>
          </div>

          <!-- Wallet Stats -->
          <div class="stat-card card">
            <h3>Wallets Connected</h3>
            <p class="stat-value">{{ stats.walletsConnected || 0 }}</p>
            <p class="text-secondary">Active wallet connections</p>
          </div>

          <!-- Achievement Stats -->
          <div class="stat-card card">
            <h3>Achievements</h3>
            <p class="stat-value">{{ stats.totalAchievements || 0 }}</p>
            <div class="stat-breakdown">
              <span>Awarded: {{ stats.totalAchievementsAwarded || 0 }}</span>
              <span>On-chain: {{ stats.onChainAchievements || 0 }}</span>
            </div>
          </div>

          <!-- Perk Stats -->
          <div class="stat-card card">
            <h3>Perks</h3>
            <p class="stat-value">{{ stats.totalPerks || 0 }}</p>
            <div class="stat-breakdown">
              <span>Redemptions: {{ stats.totalRedemptions || 0 }}</span>
              <span>On-chain: {{ stats.onChainPerks || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div
          v-if="stats.recentActivity && stats.recentActivity.length > 0"
          class="card mt-4"
        >
          <h3 class="mb-3">Recent Activity</h3>
          <div class="activity-list">
            <div
              v-for="activity in stats.recentActivity"
              :key="activity._id"
              class="activity-item"
            >
              <div class="activity-info">
                <p class="activity-text">{{ activity.description }}</p>
                <p class="activity-date text-secondary">
                  {{ formatDate(activity.date) }}
                </p>
              </div>
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
import { getDashboardStats } from "@/services/admin.service";
import { formatDate } from "@/utils/helpers";

const stats = ref({});
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await getDashboardStats();
    stats.value = data;
  } catch (error) {
    window.$toast?.("Error loading dashboard: " + error.message, "error");
  } finally {
    loading.value = false;
  }
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

.page-header h1 {
  margin-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
}

.stat-card h3 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.stat-value {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.activity-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-text {
  margin-bottom: 0.25rem;
  font-size: var(--font-size-sm);
}

.activity-date {
  font-size: var(--font-size-xs);
  margin: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
