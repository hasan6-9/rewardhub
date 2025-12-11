<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Student Dashboard</h1>
    </div>

    <LoadingSpinner v-if="loading" text="Loading dashboard..." />

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Token Balance"
          :value="tokenBalance"
          subtitle="Available tokens"
          icon-color="blue"
        />

        <DashboardCard
          title="Total Achievements"
          :value="myAchievements.length"
          subtitle="Earned achievements"
          icon-color="green"
        />

        <DashboardCard
          title="Perks Redeemed"
          :value="myRedemptions.length"
          subtitle="Total redemptions"
          icon-color="purple"
        />
      </div>

      <!-- Recent Achievements -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Achievements</h2>
        
        <div v-if="myAchievements.length === 0" class="text-center py-8 text-gray-500">
          No achievements yet. Keep working hard!
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="achievement in recentAchievements"
            :key="achievement._id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <h3 class="font-medium text-gray-900">{{ achievement.achievementId?.title || 'Achievement' }}</h3>
              <p class="text-sm text-gray-600">{{ achievement.achievementId?.description }}</p>
              <p class="text-xs text-gray-500 mt-1">
                Awarded: {{ formatDate(achievement.awardedAt) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-primary-600">+{{ achievement.achievementId?.tokens }} tokens</p>
              <span
                v-if="achievement.blockchainTxHash"
                class="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
              >
                Verified on blockchain
              </span>
            </div>
          </div>
        </div>

        <router-link
          to="/dashboard/my-achievements"
          class="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
        >
          View all achievements →
        </router-link>
      </div>

      <!-- Available Perks -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Available Perks</h2>
        
        <div v-if="perks.length === 0" class="text-center py-8 text-gray-500">
          No perks available at the moment.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="perk in perks.slice(0, 4)"
            :key="perk._id"
            class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
          >
            <h3 class="font-medium text-gray-900">{{ perk.title }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ perk.description }}</p>
            <p class="text-lg font-bold text-primary-600 mt-2">{{ perk.tokensRequired }} tokens</p>
          </div>
        </div>

        <router-link
          to="/dashboard/redeem-perks"
          class="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
        >
          View all perks →
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/achievement'
import { useRewardStore } from '@/stores/reward'
import { useWalletStore } from '@/stores/wallet'
import DashboardCard from '@/components/common/DashboardCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const achievementStore = useAchievementStore()
const rewardStore = useRewardStore()
const walletStore = useWalletStore()

const loading = ref(true)

const myAchievements = computed(() => achievementStore.myAchievements)
const perks = computed(() => rewardStore.perks)
const myRedemptions = computed(() => rewardStore.myRedemptions)
const tokenBalance = computed(() => walletStore.tokenBalance || '0')

const recentAchievements = computed(() => {
  return myAchievements.value.slice(0, 5)
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      achievementStore.fetchMyAchievements(),
      rewardStore.fetchAllPerks(),
      rewardStore.fetchMyRedemptions(),
    ])
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    loading.value = false
  }
})
</script>
