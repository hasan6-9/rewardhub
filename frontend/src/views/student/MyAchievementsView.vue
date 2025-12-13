<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-content">
      <AppSidebar />
      <main class="main-content">
        <div class="page-header">
          <h1>My Achievements</h1>
        </div>

        <LoadingSpinner v-if="loading" />

        <div v-else-if="achievements.length === 0" class="empty-state">
          <p>No achievements yet. Keep working hard!</p>
        </div>

        <div v-else class="achievements-grid">
          <div
            v-for="achievement in achievements"
            :key="achievement._id"
            class="achievement-card card"
          >
            <h3>{{ achievement.achievementId?.title || "Achievement" }}</h3>
            <p>{{ achievement.achievementId?.description }}</p>
            <div class="achievement-meta">
              <span class="badge badge-primary"
                >{{ achievement.achievementId?.tokenReward }} tokens</span
              >
              <span :class="['badge', getStatusClass(achievement.status)]">
                {{ achievement.status }}
              </span>
            </div>
            <p
              class="text-secondary"
              style="font-size: 0.75rem; margin-top: 0.5rem"
            >
              Awarded: {{ formatDate(achievement.dateAwarded) }}
            </p>
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
import { getMyAchievements } from "@/services/studentAchievement.service";
import { formatDate } from "@/utils/helpers";

const achievements = ref([]);
const loading = ref(false);

function getStatusClass(status) {
  if (status === "confirmed") return "badge-success";
  if (status === "failed") return "badge-danger";
  return "badge-warning";
}

async function loadAchievements() {
  loading.value = true;
  try {
    const data = await getMyAchievements();
    // Only show confirmed achievements to students
    achievements.value = data.achievements.filter(
      (a) => a.status === "confirmed"
    );
  } catch (error) {
    console.error("Error loading achievements:", error);
    window.$toast?.("Error loading achievements: " + error.message, "error");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadAchievements();
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

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.achievement-card h3 {
  margin-bottom: 0.5rem;
}

.achievement-meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
