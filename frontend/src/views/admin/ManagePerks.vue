<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Manage Perks</h1>
      <BaseButton @click="showCreateModal = true">
        Create Perk
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

    <LoadingSpinner v-if="loading" text="Loading perks..." />

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="perk in perks"
        :key="perk._id"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900">{{ perk.title }}</h3>
          <span class="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
            {{ perk.tokensRequired }} tokens
          </span>
        </div>

        <p class="text-gray-600 mb-4">{{ perk.description }}</p>

        <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span v-if="perk.quantity !== undefined">Stock: {{ perk.quantity }}</span>
          <span v-else>Unlimited</span>
        </div>

        <div class="flex space-x-2">
          <BaseButton
            size="sm"
            variant="secondary"
            @click="handleEdit(perk)"
            full-width
          >
            Edit
          </BaseButton>
          <BaseButton
            size="sm"
            variant="danger"
            @click="handleDelete(perk)"
            full-width
          >
            Delete
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingPerk" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          {{ editingPerk ? 'Edit Perk' : 'Create Perk' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <BaseInput
            id="perk-title"
            v-model="perkForm.title"
            label="Title"
            required
          />

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="perkForm.description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              required
            ></textarea>
          </div>

          <BaseInput
            id="perk-tokens"
            v-model.number="perkForm.tokensRequired"
            label="Tokens Required"
            type="number"
            required
          />

          <BaseInput
            id="perk-quantity"
            v-model.number="perkForm.quantity"
            label="Quantity (leave empty for unlimited)"
            type="number"
          />

          <div class="flex space-x-3">
            <BaseButton type="submit" :loading="submitting" full-width>
              {{ editingPerk ? 'Update' : 'Create' }}
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
import { useRewardStore } from '@/stores/reward'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import SuccessAlert from '@/components/common/SuccessAlert.vue'

const rewardStore = useRewardStore()

const loading = ref(true)
const submitting = ref(false)
const showCreateModal = ref(false)
const editingPerk = ref(null)
const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const perkForm = ref({
  title: '',
  description: '',
  tokensRequired: 0,
  quantity: null,
})

const perks = computed(() => rewardStore.perks)

const handleEdit = (perk) => {
  editingPerk.value = perk
  perkForm.value = {
    title: perk.title,
    description: perk.description,
    tokensRequired: perk.tokensRequired,
    quantity: perk.quantity || null,
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingPerk.value = null
  perkForm.value = {
    title: '',
    description: '',
    tokensRequired: 0,
    quantity: null,
  }
}

const handleSubmit = async () => {
  submitting.value = true
  showError.value = false
  showSuccess.value = false

  try {
    const data = { ...perkForm.value }
    if (!data.quantity) delete data.quantity

    if (editingPerk.value) {
      await rewardStore.updatePerk(editingPerk.value._id, data)
      successMessage.value = 'Perk updated successfully'
    } else {
      await rewardStore.createPerk(data)
      successMessage.value = 'Perk created successfully'
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

const handleDelete = async (perk) => {
  if (!confirm(`Are you sure you want to delete "${perk.title}"?`)) return

  try {
    await rewardStore.deletePerk(perk._id)
    successMessage.value = 'Perk deleted successfully'
    showSuccess.value = true
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to delete perk'
    showError.value = true
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await rewardStore.fetchAllPerks()
  } catch (error) {
    errorMessage.value = 'Failed to load perks'
    showError.value = true
  } finally {
    loading.value = false
  }
})
</script>
