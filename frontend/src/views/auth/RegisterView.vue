<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Register</h2>

    <ErrorAlert
      v-model="showError"
      title="Registration Failed"
      :message="authStore.error || ''"
    />

    <SuccessAlert
      v-model="showSuccess"
      title="Success"
      message="Registration successful! Redirecting..."
    />

    <form @submit.prevent="handleRegister" class="space-y-4">
      <BaseInput
        id="name"
        v-model="formData.name"
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        required
      />

      <BaseInput
        id="email"
        v-model="formData.email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        required
      />

      <BaseInput
        id="password"
        v-model="formData.password"
        label="Password"
        type="password"
        placeholder="Create a password"
        required
        hint="Minimum 6 characters"
      />

      <BaseInput
        id="confirmPassword"
        v-model="formData.confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        required
        :error="passwordError"
      />

      <BaseButton
        type="submit"
        :loading="authStore.loading"
        :disabled="!!passwordError"
        full-width
      >
        Register
      </BaseButton>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Already have an account?
        <router-link to="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
          Login here
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import SuccessAlert from '@/components/common/SuccessAlert.vue'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const showError = ref(false)
const showSuccess = ref(false)

const passwordError = computed(() => {
  if (formData.value.confirmPassword && formData.value.password !== formData.value.confirmPassword) {
    return 'Passwords do not match'
  }
  return ''
})

const handleRegister = async () => {
  if (passwordError.value) return

  showError.value = false
  showSuccess.value = false
  authStore.clearError()

  try {
    await authStore.register({
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
    })
    
    showSuccess.value = true
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (error) {
    showError.value = true
  }
}

watch(() => authStore.error, (newError) => {
  if (newError) {
    showError.value = true
  }
})
</script>
