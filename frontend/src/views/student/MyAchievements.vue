<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">My Achievements</h1>
    </div>

    <ErrorAlert
      v-model="showError"
      title="Error"
      :message="achievementStore.error || ''"
    />

    <LoadingSpinner v-if="loading" text="Loading achievements..." />

    <div v-else-if="myAchievements.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">No Achievements Yet</h2>
      <p class="text-gray-600">Keep working hard! Your achievements will appear here.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="achievement in myAchievements"
        :key="achievement._id"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-xl font-semibold text-gray-900">
                {{ achievement.achievementId?.title || 'Achievement' }}
              </h3>
              <span
                v-if="achievement.blockchainTxHash"
                class="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium"
              >
                ✓ Verified on Blockchain
              </span>
            </div>
            
            <p class="text-gray-600 mb-3">
              {{ achievement.achievementId?.description || 'No description available' }}
            </p>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">Awarded By</p>
                <p class="font-medium text-gray-900">{{ achievement.awardedBy?.name || 'Faculty' }}</p>
              </div>
              <div>
                <p class="text-gray-500">Date Awarded</p>
                <p class="font-medium text-gray-900">{{ formatDate(achievement.awardedAt) }}</p>
              </div>
            </div>

            <div v-if="achievement.blockchainTxHash" class="mt-3 p-3 bg-gray-50 rounded">
              <p class="text-xs text-gray-500">Transaction Hash</p>
              <p class="text-xs font-mono text-gray-700 break-all">{{ achievement.blockchainTxHash }}</p>
            </div>
          </div>

          <div class="ml-6 text-right">
            <div class="inline-block px-4 py-2 bg-primary-100 rounded-lg">
              <p class="text-sm text-primary-600 font-medium">Tokens Earned</p>
              <p class="text-3xl font-bold text-primary-600">{{ achievement.achievementId?.tokens || 0 }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAchievementStore } from '@/stores/achievement'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'

const achievementStore = useAchievementStore()

const loading = ref(true)
const showError = ref(false)

const myAchievements = computed(() => achievementStore.myAchievements)

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(async () => {
  loading.value = true
  try {
    await achievementStore.fetchMyAchievements()
  } catch (error) {
    showError.value = true
  } finally {
    loading.value = false
  }
})

watch(() => achievementStore.error, (newError) => {
  if (newError) {
    showError.value = true
  }
})
</script>
