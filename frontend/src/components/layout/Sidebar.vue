<template>
  <aside class="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
    <nav class="p-4 space-y-2">
      <!-- Student Menu -->
      <template v-if="isStudent">
        <router-link
          to="/dashboard"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          active-class="bg-primary-50 text-primary-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="font-medium">Dashboard</span>
        </router-link>

        <router-link
          to="/dashboard/my-achievements"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          active-class="bg-primary-50 text-primary-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span class="font-medium">My Achievements</span>
        </router-link>

        <router-link
          to="/dashboard/my-rewards"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          active-class="bg-primary-50 text-primary-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-medium">My Rewards</span>
        </router-link>

        <router-link
          to="/dashboard/redeem-perks"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          active-class="bg-primary-50 text-primary-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span class="font-medium">Redeem Perks</span>
        </router-link>
      </template>

      <!-- Admin Menu -->
      <template v-if="isAdmin">
        <router-link
          to="/dashboard/admin"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          active-class="bg-primary-50 text-primary-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span class="font-medium">Dashboard</span>
        </router-link>

        <router-link
          to="/dashboard/manage-users"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          active-class="bg-primary-50 text-primary-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="font-medium">Manage Users</span>
        </router-link>

        <router-link
          to="/dashboard/manage-achievements"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          active-class="bg-primary-50 text-primary-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span class="font-medium">Manage Achievements</span>
        </router-link>

        <router-link
          to="/dashboard/manage-perks"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          active-class="bg-primary-50 text-primary-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span class="font-medium">Manage Perks</span>
        </router-link>
      </template>

      <!-- Faculty Menu -->
      <template v-if="isFaculty">
        <router-link
          to="/dashboard/faculty"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          active-class="bg-primary-50 text-primary-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="font-medium">Dashboard</span>
        </router-link>

        <router-link
          to="/dashboard/award-achievements"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          active-class="bg-primary-50 text-primary-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="font-medium">Award Achievements</span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isStudent = computed(() => authStore.isStudent)
const isAdmin = computed(() => authStore.isAdmin)
const isFaculty = computed(() => authStore.isFaculty)
</script>
