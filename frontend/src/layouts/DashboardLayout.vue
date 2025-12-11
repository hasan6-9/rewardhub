<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <Navbar />
    
    <div class="flex">
      <!-- Sidebar -->
      <Sidebar />
      
      <!-- Main Content -->
      <main class="flex-1 p-6 ml-64">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
</script>
