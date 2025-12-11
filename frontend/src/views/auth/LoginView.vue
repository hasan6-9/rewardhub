<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h2>

    <ErrorAlert
      v-model="showError"
      title="Login Failed"
      :message="authStore.error || ''"
    />

    <form @submit.prevent="handleLogin" class="space-y-4">
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
        placeholder="Enter your password"
        required
      />

      <BaseButton
        type="submit"
        :loading="authStore.loading"
        full-width
      >
        Login
      </BaseButton>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Don't have an account?
        <router-link to="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
          Register here
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  email: '',
  password: '',
})

const showError = ref(false)

const handleLogin = async () => {
  showError.value = false
  authStore.clearError()

  try {
    await authStore.login(formData.value)
    
    // Redirect based on role
    if (authStore.isAdmin) {
      router.push('/dashboard/admin')
    } else if (authStore.isFaculty) {
      router.push('/dashboard/faculty')
    } else {
      router.push('/dashboard')
    }
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
