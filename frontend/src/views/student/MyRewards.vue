<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">My Rewards</h1>
    </div>

    <!-- Token Balance Card -->
    <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-8 text-white">
      <h2 class="text-lg font-medium mb-2">Total Token Balance</h2>
      <p class="text-5xl font-bold">{{ tokenBalance }}</p>
      <p class="mt-2 text-primary-100">Available for redemption</p>
    </div>

    <!-- Redemption History -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Redemption History</h2>

      <LoadingSpinner v-if="loading" text="Loading redemptions..." />

      <div v-else-if="myRedemptions.length === 0" class="text-center py-12 text-gray-500">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>No redemptions yet. Visit the Perks page to redeem your tokens!</p>
        <router-link to="/dashboard/redeem-perks" class="mt-4 inline-block">
          <BaseButton>Browse Perks</BaseButton>
        </router-link>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perk</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens Used</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="redemption in myRedemptions" :key="redemption._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ redemption.perkId?.title || 'Perk' }}</div>
                <div class="text-sm text-gray-500">{{ redemption.perkId?.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-red-600">-{{ redemption.perkId?.tokensRequired || 0 }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(redemption.redeemedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Redeemed
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRewardStore } from '@/stores/reward'
import { useWalletStore } from '@/stores/wallet'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const rewardStore = useRewardStore()
const walletStore = useWalletStore()

const loading = ref(true)

const myRedemptions = computed(() => rewardStore.myRedemptions)
const tokenBalance = computed(() => walletStore.tokenBalance || '0')

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
    await rewardStore.fetchMyRedemptions()
  } catch (error) {
    console.error('Error loading redemptions:', error)
  } finally {
    loading.value = false
  }
})
</script>
