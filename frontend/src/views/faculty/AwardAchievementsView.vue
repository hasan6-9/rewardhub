<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-content">
      <AppSidebar />
      <main class="main-content">
        <div class="page-header">
          <h1>Award Achievements</h1>
        </div>

        <div class="card">
          <form @submit.prevent="handleAward" class="award-form">
            <div class="form-group">
              <label class="form-label">Select Student</label>
              <select v-model="form.studentId" class="form-select" required>
                <option value="">Choose a student...</option>
                <option
                  v-for="student in students"
                  :key="student._id"
                  :value="student._id"
                >
                  {{ student.name }} - {{ student.email }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Select Achievement</label>
              <select v-model="form.achievementId" class="form-select" required>
                <option value="">Choose an achievement...</option>
                <option
                  v-for="achievement in achievements"
                  :key="achievement._id"
                  :value="achievement._id"
                >
                  {{ achievement.title }} ({{ achievement.tokenReward }} tokens)
                </option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? "Awarding..." : "Award Achievement" }}
            </button>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import AppSidebar from "@/components/common/AppSidebar.vue";
import { getStudents } from "@/services/admin.service";
import { getAchievements } from "@/services/achievement.service";
import { awardAchievement } from "@/services/studentAchievement.service";

const students = ref([]);
const achievements = ref([]);
const loading = ref(false);
const form = ref({ studentId: "", achievementId: "" });

async function loadData() {
  try {
    const [studentsData, achievementsData] = await Promise.all([
      getStudents(),
      getAchievements(),
    ]);
    students.value = studentsData.students;
    achievements.value = achievementsData.achievements;
  } catch (error) {
    window.$toast?.("Error loading data: " + error.message, "error");
  }
}

async function handleAward() {
  loading.value = true;
  try {
    await awardAchievement(form.value);
    window.$toast?.("Achievement awarded successfully!", "success");
    form.value = { studentId: "", achievementId: "" };
  } catch (error) {
    window.$toast?.("Error awarding achievement: " + error.message, "error");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
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

.award-form {
  max-width: 600px;
}
</style>
