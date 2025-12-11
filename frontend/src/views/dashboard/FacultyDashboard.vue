<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
    </div>

    <!-- Quick Action -->
    <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
      <h2 class="text-2xl font-bold mb-2">Award Achievements</h2>
      <p class="mb-4">Recognize student accomplishments and award tokens</p>
      <router-link to="/dashboard/award-achievements">
        <BaseButton variant="secondary">
          Award Achievement
        </BaseButton>
      </router-link>
    </div>

    <!-- Recent Awards -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Awards</h2>
      
      <div v-if="recentAwards.length === 0" class="text-center py-8 text-gray-500">
        No awards yet. Start recognizing student achievements!
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="award in recentAwards"
          :key="award._id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <h3 class="font-medium text-gray-900">{{ award.achievementId?.title }}</h3>
            <p class="text-sm text-gray-600">Awarded to: {{ award.studentId?.name }}</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ formatDate(award.awardedAt) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-primary-600">+{{ award.achievementId?.tokens }} tokens</p>
            <span
              v-if="award.blockchainTxHash"
              class="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded mt-1"
            >
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Achievements -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Available Achievements</h2>
      
      <div v-if="achievements.length === 0" class="text-center py-8 text-gray-500">
        No achievements available.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="achievement in achievements.slice(0, 6)"
          :key="achievement._id"
          class="p-4 border border-gray-200 rounded-lg"
        >
          <h3 class="font-medium text-gray-900">{{ achievement.title }}</h3>
          <p class="text-sm text-gray-600 mt-1">{{ achievement.description }}</p>
          <p class="text-lg font-bold text-primary-600 mt-2">{{ achievement.tokens }} tokens</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/achievement'
import BaseButton from '@/components/common/BaseButton.vue'

const achievementStore = useAchievementStore()

const recentAwards = ref([])
const achievements = computed(() => achievementStore.achievements)

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  try {
    await achievementStore.fetchAllAchievements()
    // In a real app, you'd fetch recent awards from an API endpoint
    // For now, we'll leave it empty
  } catch (error) {
    console.error('Error loading dashboard:', error)
  }
})
</script>
