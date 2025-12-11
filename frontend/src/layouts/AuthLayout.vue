<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">RewardHub</h1>
        <p class="text-gray-600">Blockchain-Powered Student Rewards</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-xl p-8">
        <router-view />
      </div>
      
      <div class="text-center mt-6 text-sm text-gray-600">
        <p>&copy; 2024 RewardHub. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Clean layout for authentication pages
</script>
