<template>
  <div class="flex items-center justify-center">
    <div class="relative">
      <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p v-if="text" class="mt-4 text-sm text-gray-600 text-center">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '',
  },
})
</script>
