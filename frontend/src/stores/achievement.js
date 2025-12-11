import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useAchievementStore = defineStore('achievement', () => {
  // State
  const achievements = ref([])
  const myAchievements = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchAllAchievements() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getAllAchievements()
      achievements.value = response.achievements || response
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch achievements'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyAchievements() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getMyAchievements()
      myAchievements.value = response.achievements || response
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch my achievements'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createAchievement(achievementData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.createAchievement(achievementData)
      achievements.value.push(response.achievement || response)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create achievement'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAchievement(achievementId, achievementData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.updateAchievement(achievementId, achievementData)
      const index = achievements.value.findIndex(a => a._id === achievementId)
      if (index !== -1) {
        achievements.value[index] = response.achievement || response
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update achievement'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAchievement(achievementId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.deleteAchievement(achievementId)
      achievements.value = achievements.value.filter(a => a._id !== achievementId)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete achievement'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function awardAchievement(awardData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.awardAchievement(awardData)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to award achievement'
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
    achievements,
    myAchievements,
    loading,
    error,
    // Actions
    fetchAllAchievements,
    fetchMyAchievements,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    awardAchievement,
    clearError,
  }
})
