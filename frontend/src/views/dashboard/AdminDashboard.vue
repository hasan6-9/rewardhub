<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
    </div>

    <LoadingSpinner v-if="loading" text="Loading dashboard..." />

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Users"
          :value="stats.totalUsers || 0"
          subtitle="Registered users"
          icon-color="blue"
        />

        <DashboardCard
          title="Total Achievements"
          :value="stats.totalAchievements || 0"
          subtitle="Created achievements"
          icon-color="green"
        />

        <DashboardCard
          title="Total Perks"
          :value="stats.totalPerks || 0"
          subtitle="Available perks"
          icon-color="purple"
        />

        <DashboardCard
          title="Blockchain Synced"
          :value="stats.blockchainSynced || 0"
          subtitle="On-chain records"
          icon-color="yellow"
        />
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <router-link
          to="/dashboard/manage-users"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Manage Users</h3>
              <p class="text-sm text-gray-600">Create and manage user accounts</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/dashboard/manage-achievements"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Manage Achievements</h3>
              <p class="text-sm text-gray-600">Create and edit achievements</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/dashboard/manage-perks"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Manage Perks</h3>
              <p class="text-sm text-gray-600">Create and edit perks</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">Students</p>
              <p class="text-sm text-gray-600">Active student accounts</p>
            </div>
            <p class="text-2xl font-bold text-primary-600">{{ stats.studentCount || 0 }}</p>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">Faculty</p>
              <p class="text-sm text-gray-600">Active faculty accounts</p>
            </div>
            <p class="text-2xl font-bold text-primary-600">{{ stats.facultyCount || 0 }}</p>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">Total Tokens Distributed</p>
              <p class="text-sm text-gray-600">Across all achievements</p>
            </div>
            <p class="text-2xl font-bold text-primary-600">{{ stats.totalTokensDistributed || 0 }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import DashboardCard from '@/components/common/DashboardCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const loading = ref(true)
const stats = ref({
  totalUsers: 0,
  totalAchievements: 0,
  totalPerks: 0,
  blockchainSynced: 0,
  studentCount: 0,
  facultyCount: 0,
  totalTokensDistributed: 0,
})

onMounted(async () => {
  loading.value = true
  try {
    const response = await api.getDashboardStats()
    stats.value = response.stats || response
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
  } finally {
    loading.value = false
  }
})
</script>
