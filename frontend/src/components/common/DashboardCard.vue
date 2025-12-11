<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <div v-if="icon" :class="iconColorClass" class="p-3 rounded-full">
        <component :is="icon" class="w-6 h-6" />
      </div>
    </div>
    
    <div class="mb-2">
      <p class="text-3xl font-bold text-gray-900">{{ value }}</p>
    </div>
    
    <p v-if="subtitle" class="text-sm text-gray-600">{{ subtitle }}</p>
    
    <div v-if="$slots.default" class="mt-4 pt-4 border-t border-gray-200">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: Object,
    default: null,
  },
  iconColor: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'red', 'yellow', 'purple'].includes(value),
  },
})

const iconColorClass = computed(() => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  }
  return colors[props.iconColor]
})
</script>
