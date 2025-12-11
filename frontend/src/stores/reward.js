import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useWalletStore } from './wallet'
import { useAuthStore } from './auth'

export const useRewardStore = defineStore('reward', () => {
  // State
  const perks = ref([])
  const myRedemptions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchAllPerks() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getAllPerks()
      perks.value = response.perks || response
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch perks'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyRedemptions() {
    loading.value = true
    error.value = null
    
    try {
      // Get current user ID from auth store
      const authStore = useAuthStore()
      const studentId = authStore.user?._id || authStore.user?.id
      if (!studentId) {
        throw new Error('User not authenticated')
      }
      const response = await api.getMyRedemptions(studentId)
      myRedemptions.value = response.redemptions || response
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch redemptions'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPerk(perkData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.createPerk(perkData)
      perks.value.push(response.perk || response)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create perk'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePerk(perkId, perkData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.updatePerk(perkId, perkData)
      const index = perks.value.findIndex(p => p._id === perkId)
      if (index !== -1) {
        perks.value[index] = response.perk || response
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update perk'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deletePerk(perkId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.deletePerk(perkId)
      perks.value = perks.value.filter(p => p._id !== perkId)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete perk'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function redeemPerk(rewardId) {
    loading.value = true
    error.value = null
    
    // Get wallet address from wallet store
    const walletStore = useWalletStore()
    if (!walletStore.address) {
      error.value = 'Wallet not connected'
      throw new Error('Wallet not connected')
    }

    try {
      const response = await api.redeemPerk({
        rewardId,
        walletAddress: walletStore.address
      })
      // Refresh redemptions
      await fetchMyRedemptions()
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to redeem perk'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    perks,
    myRedemptions,
    loading,
    error,
    // Actions
    fetchAllPerks,
    fetchMyRedemptions,
    createPerk,
    updatePerk,
    deletePerk,
    redeemPerk,
    clearError,
  }
})
