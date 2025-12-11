<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Redeem Perks</h1>
      <div class="text-right">
        <p class="text-sm text-gray-600">Your Balance</p>
        <p class="text-2xl font-bold text-primary-600">{{ tokenBalance }} tokens</p>
      </div>
    </div>

    <ErrorAlert
      v-model="showError"
      title="Error"
      :message="errorMessage"
    />

    <SuccessAlert
      v-model="showSuccess"
      title="Success"
      message="Perk redeemed successfully!"
    />

    <LoadingSpinner v-if="loading" text="Loading perks..." />

    <div v-else-if="perks.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">No Perks Available</h2>
      <p class="text-gray-600">Check back later for new perks!</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="perk in perks"
        :key="perk._id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
      >
        <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ perk.title }}</h3>
        <p class="text-gray-600 mb-4">{{ perk.description }}</p>

        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">Cost</span>
            <span class="text-2xl font-bold text-primary-600">{{ perk.tokensRequired }} tokens</span>
          </div>
          <div v-if="perk.quantity !== undefined" class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Available</span>
            <span class="text-sm font-medium text-gray-900">{{ perk.quantity }} remaining</span>
          </div>
        </div>

        <BaseButton
          @click="handleRedeem(perk)"
          :disabled="!canRedeem(perk) || redeeming === perk._id"
          :loading="redeeming === perk._id"
          full-width
          :variant="canRedeem(perk) ? 'primary' : 'secondary'"
        >
          {{ getButtonText(perk) }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRewardStore } from '@/stores/reward'
import { useWalletStore } from '@/stores/wallet'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import SuccessAlert from '@/components/common/SuccessAlert.vue'

const rewardStore = useRewardStore()
const walletStore = useWalletStore()

const loading = ref(true)
const redeeming = ref(null)
const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

const perks = computed(() => rewardStore.perks)
const tokenBalance = computed(() => parseInt(walletStore.tokenBalance) || 0)

const canRedeem = (perk) => {
  const hasEnoughTokens = tokenBalance.value >= perk.tokensRequired
  const isAvailable = perk.quantity === undefined || perk.quantity > 0
  return hasEnoughTokens && isAvailable
}

const getButtonText = (perk) => {
  if (perk.quantity !== undefined && perk.quantity === 0) {
    return 'Out of Stock'
  }
  if (tokenBalance.value < perk.tokensRequired) {
    return 'Insufficient Tokens'
  }
  return 'Redeem Now'
}

const handleRedeem = async (perk) => {
  if (!canRedeem(perk)) return

  redeeming.value = perk._id
  showError.value = false
  showSuccess.value = false

  try {
    await rewardStore.redeemPerk(perk._id)
    showSuccess.value = true
    
    // Refresh token balance
    await walletStore.fetchTokenBalance()
    
    // Refresh perks list
    await rewardStore.fetchAllPerks()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to redeem perk'
    showError.value = true
  } finally {
    redeeming.value = null
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await rewardStore.fetchAllPerks()
  } catch (error) {
    errorMessage.value = 'Failed to load perks'
    showError.value = true
  } finally {
    loading.value = false
  }
})

watch(() => rewardStore.error, (newError) => {
  if (newError) {
    errorMessage.value = newError
    showError.value = true
  }
})
</script>
