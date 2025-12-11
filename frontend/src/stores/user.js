import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchAllUsers() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getAllUsers()
      users.value = response.users || response
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.createUser(userData)
      users.value.push(response.user || response)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(userId, userData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.updateUser(userId, userData)
      const index = users.value.findIndex(u => u._id === userId)
      if (index !== -1) {
        users.value[index] = response.user || response
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(userId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.deleteUser(userId)
      users.value = users.value.filter(u => u._id !== userId)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete user'
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
    users,
    currentUser,
    loading,
    error,
    // Actions
    fetchAllUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  }
})
