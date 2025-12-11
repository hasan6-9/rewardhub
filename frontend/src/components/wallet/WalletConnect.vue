<template>
  <div>
    <BaseButton
      v-if="!isConnected"
      @click="handleConnect"
      :loading="loading"
      variant="secondary"
      size="sm"
    >
      Connect Wallet
    </BaseButton>

    <div v-else class="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
      <div class="w-2 h-2 bg-green-500 rounded-full"></div>
      <span class="text-sm font-medium text-gray-700">{{ shortAddress }}</span>
      <span class="text-sm text-gray-600">|</span>
      <span class="text-sm font-medium text-green-600">{{ tokenBalance }} tokens</span>
    </div>

    <ErrorAlert
      v-model="showError"
      title="Wallet Error"
      :message="error || ''"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useWallet } from '@/composables/useWallet'
import BaseButton from '@/components/common/BaseButton.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'

const {
  isConnected,
  shortAddress,
  tokenBalance,
  loading,
  error,
  connect,
  checkMetaMask,
} = useWallet()

const showError = ref(false)

const handleConnect = async () => {
  if (!checkMetaMask()) {
    showError.value = true
    return
  }
  
  await connect()
}

watch(error, (newError) => {
  if (newError) {
    showError.value = true
  }
})
</script>
