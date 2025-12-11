<template>
  <div
    v-if="modelValue"
    class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start mb-4"
    role="alert"
  >
    <svg class="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>
    <div class="flex-1">
      <p class="font-medium">{{ title }}</p>
      <p v-if="message" class="text-sm mt-1">{{ message }}</p>
    </div>
    <button
      v-if="dismissible"
      @click="$emit('update:modelValue', false)"
      class="ml-3 text-green-600 hover:text-green-800"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Success',
  },
  message: {
    type: String,
    default: '',
  },
  dismissible: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['update:modelValue'])
</script>
