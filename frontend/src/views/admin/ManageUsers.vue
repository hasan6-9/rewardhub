<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Manage Users</h1>
      <BaseButton @click="showCreateModal = true">
        <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create User
      </BaseButton>
    </div>

    <LoadingSpinner v-if="loading" text="Loading users..." />

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

    <template v-if="!loading">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ users.length }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Students</p>
              <p class="text-2xl font-bold text-green-600">{{ usersByRole.student }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Faculty</p>
              <p class="text-2xl font-bold text-blue-600">{{ usersByRole.faculty }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Wallets Connected</p>
              <p class="text-2xl font-bold text-purple-600">{{ walletsConnected }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select
                    v-model="user.role"
                    @change="handleRoleChange(user)"
                    :class="getRoleBadgeClass(user.role)"
                    class="px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="user.walletAddress" class="flex items-center space-x-2">
                    <span class="flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span class="text-xs font-mono text-gray-600">
                      {{ user.walletAddress.slice(0, 6) }}...{{ user.walletAddress.slice(-4) }}
                    </span>
                  </div>
                  <div v-else class="flex items-center space-x-2">
                    <span class="flex h-2 w-2 rounded-full bg-gray-300"></span>
                    <span class="text-xs text-gray-400">Not connected</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    @click="handleEdit(user)"
                    class="text-primary-600 hover:text-primary-900 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleDelete(user)"
                    class="text-red-600 hover:text-red-900 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Create New User</h2>

        <form @submit.prevent="handleCreate" class="space-y-4">
          <BaseInput
            id="create-name"
            v-model="createForm.name"
            label="Full Name"
            required
          />

          <BaseInput
            id="create-email"
            v-model="createForm.email"
            label="Email"
            type="email"
            required
          />

          <BaseInput
            id="create-password"
            v-model="createForm.password"
            label="Password"
            type="password"
            required
          />

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              v-model="createForm.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
              required
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="flex space-x-3">
            <BaseButton type="submit" :loading="creating" full-width>
              Create User
            </BaseButton>
            <BaseButton
              type="button"
              variant="secondary"
              @click="showCreateModal = false"
              full-width
            >
              Cancel
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Edit User</h2>

        <form @submit.prevent="handleUpdate" class="space-y-4">
          <BaseInput
            id="edit-name"
            v-model="editForm.name"
            label="Full Name"
            required
          />

          <BaseInput
            id="edit-email"
            v-model="editForm.email"
            label="Email"
            type="email"
            required
          />

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              v-model="editForm.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
              required
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="flex space-x-3">
            <BaseButton type="submit" :loading="updating" full-width>
              Update User
            </BaseButton>
            <BaseButton
              type="button"
              variant="secondary"
              @click="showEditModal = false"
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
import { useUserStore } from '@/stores/user'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import SuccessAlert from '@/components/common/SuccessAlert.vue'

const userStore = useUserStore()

const loading = ref(true)
const creating = ref(false)
const updating = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const createForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'student',
})

const editForm = ref({
  id: '',
  name: '',
  email: '',
  role: '',
})

const users = computed(() => userStore.users)

const usersByRole = computed(() => {
  return {
    student: users.value.filter(u => u.role === 'student').length,
    faculty: users.value.filter(u => u.role === 'faculty').length,
    admin: users.value.filter(u => u.role === 'admin').length,
  }
})

const walletsConnected = computed(() => {
  return users.value.filter(u => u.walletAddress).length
})

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-red-100 text-red-800',
    faculty: 'bg-blue-100 text-blue-800',
    student: 'bg-green-100 text-green-800',
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const handleCreate = async () => {
  creating.value = true
  showError.value = false
  showSuccess.value = false

  try {
    await userStore.createUser(createForm.value)
    successMessage.value = 'User created successfully'
    showSuccess.value = true
    showCreateModal.value = false
    
    // Reset form
    createForm.value = {
      name: '',
      email: '',
      password: '',
      role: 'student',
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.response?.data?.msg || 'Failed to create user'
    showError.value = true
  } finally {
    creating.value = false
  }
}

const handleEdit = (user) => {
  editForm.value = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
  showEditModal.value = true
}

const handleUpdate = async () => {
  updating.value = true
  showError.value = false
  showSuccess.value = false

  try {
    await userStore.updateUser(editForm.value.id, {
      name: editForm.value.name,
      email: editForm.value.email,
      role: editForm.value.role,
    })
    successMessage.value = 'User updated successfully'
    showSuccess.value = true
    showEditModal.value = false
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.response?.data?.msg || 'Failed to update user'
    showError.value = true
  } finally {
    updating.value = false
  }
}

const handleRoleChange = async (user) => {
  try {
    await userStore.updateUser(user._id, { role: user.role })
    successMessage.value = `Role updated to ${user.role}`
    showSuccess.value = true
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.response?.data?.msg || 'Failed to update role'
    showError.value = true
    // Reload users to revert the change
    await userStore.fetchAllUsers()
  }
}

const handleDelete = async (user) => {
  if (!confirm(`Are you sure you want to delete ${user.name}?`)) return

  try {
    await userStore.deleteUser(user._id)
    successMessage.value = 'User deleted successfully'
    showSuccess.value = true
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.response?.data?.msg || 'Failed to delete user'
    showError.value = true
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await userStore.fetchAllUsers()
  } catch (error) {
    errorMessage.value = 'Failed to load users'
    showError.value = true
  } finally {
    loading.value = false
  }
})
</script>
