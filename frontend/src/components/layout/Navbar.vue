<template>
  <nav class="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo and Title -->
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-primary-600">RewardHub</h1>
        </div>

        <!-- Right side: User menu and wallet -->
        <div class="flex items-center space-x-4">
          <!-- Wallet Connect -->
          <WalletConnect />

          <!-- User Menu -->
          <div class="relative" ref="menuRef">
            <button
              @click="toggleMenu"
              class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                {{ userInitials }}
              </div>
              <span class="text-sm font-medium">{{ userName }}</span>
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200"
            >
              <div class="px-4 py-2 border-b border-gray-200">
                <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                <p class="text-xs text-gray-500 capitalize">{{ userRole }}</p>
              </div>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import WalletConnect from '@/components/wallet/WalletConnect.vue'

const router = useRouter()
const authStore = useAuthStore()

const showMenu = ref(false)
const menuRef = ref(null)

const userName = computed(() => authStore.user?.name || 'User')
const userRole = computed(() => authStore.user?.role || 'student')
const userInitials = computed(() => {
  const name = authStore.user?.name || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleLogout = () => {
  authStore.logout()
  router.push('/auth/login')
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
