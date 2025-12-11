<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Manage Achievements</h1>
      <BaseButton @click="showCreateModal = true">
        Create Achievement
      </BaseButton>
    </div>

    <ErrorAlert
      v-model="showError"
      title="Error"
      :message="errorMessage"
    />

    <SuccessAlert
      v-model="showSuccess"
      title="Success"
      :message="successMessage"
    />

    <LoadingSpinner v-if="loading" text="Loading achievements..." />

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="achievement in achievements"
        :key="achievement._id"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900">{{ achievement.title }}</h3>
          <span class="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
            {{ achievement.tokens }} tokens
          </span>
        </div>

        <p class="text-gray-600 mb-4">{{ achievement.description }}</p>

        <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Created: {{ formatDate(achievement.createdAt) }}</span>
        </div>

        <div class="flex space-x-2">
          <BaseButton
            size="sm"
            variant="secondary"
            @click="handleEdit(achievement)"
            full-width
          >
            Edit
          </BaseButton>
          <BaseButton
            size="sm"
            variant="danger"
            @click="handleDelete(achievement)"
            full-width
          >
            Delete
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingAchievement" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          {{ editingAchievement ? 'Edit Achievement' : 'Create Achievement' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <BaseInput
            id="achievement-title"
            v-model="achievementForm.title"
            label="Title"
            required
          />

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="achievementForm.description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              required
            ></textarea>
          </div>

          <BaseInput
            id="achievement-tokens"
            v-model.number="achievementForm.tokens"
            label="Token Reward"
            type="number"
            required
          />

          <div class="flex items-center mb-4">
            <input
              id="sync-blockchain"
              v-model="achievementForm.syncToBlockchain"
              type="checkbox"
              class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="sync-blockchain" class="ml-2 text-sm text-gray-700">
              Sync to blockchain
            </label>
          </div>

          <div class="flex space-x-3">
            <BaseButton type="submit" :loading="submitting" full-width>
              {{ editingAchievement ? 'Update' : 'Create' }}
            </BaseButton>
            <BaseButton
              type="button"
              variant="secondary"
              @click="closeModal"
              full-width
            >
              Cancel
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/achievement'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import SuccessAlert from '@/components/common/SuccessAlert.vue'

const achievementStore = useAchievementStore()

const loading = ref(true)
const submitting = ref(false)
const showCreateModal = ref(false)
const editingAchievement = ref(null)
const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const achievementForm = ref({
  title: '',
  description: '',
  tokens: 0,
  syncToBlockchain: false,
})

const achievements = computed(() => achievementStore.achievements)

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const handleEdit = (achievement) => {
  editingAchievement.value = achievement
  achievementForm.value = {
    title: achievement.title,
    description: achievement.description,
    tokens: achievement.tokens,
    syncToBlockchain: false,
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingAchievement.value = null
  achievementForm.value = {
    title: '',
    description: '',
    tokens: 0,
    syncToBlockchain: false,
  }
}

const handleSubmit = async () => {
  submitting.value = true
  showError.value = false
  showSuccess.value = false

  try {
    if (editingAchievement.value) {
      await achievementStore.updateAchievement(editingAchievement.value._id, achievementForm.value)
      successMessage.value = 'Achievement updated successfully'
    } else {
      await achievementStore.createAchievement(achievementForm.value)
      successMessage.value = 'Achievement created successfully'
    }
    
    showSuccess.value = true
    closeModal()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Operation failed'
    showError.value = true
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (achievement) => {
  if (!confirm(`Are you sure you want to delete "${achievement.title}"?`)) return

  try {
    await achievementStore.deleteAchievement(achievement._id)
    successMessage.value = 'Achievement deleted successfully'
    showSuccess.value = true
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to delete achievement'
    showError.value = true
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await achievementStore.fetchAllAchievements()
  } catch (error) {
    errorMessage.value = 'Failed to load achievements'
    showError.value = true
  } finally {
    loading.value = false
  }
})
</script>
