<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Award Achievements</h1>
    </div>

    <ErrorAlert
      v-model="showError"
      title="Error"
      :message="errorMessage"
    />

    <SuccessAlert
      v-model="showSuccess"
      title="Success"
      message="Achievement awarded successfully!"
    />

    <!-- Award Form -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Award Form</h2>

      <form @submit.prevent="handleAward" class="space-y-6">
        <!-- Student Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
          <select
            v-model="awardForm.studentId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">-- Select a student --</option>
            <option v-for="student in students" :key="student._id" :value="student._id">
              {{ student.name }} ({{ student.email }})
              {{ student.walletAddress ? '✓ Wallet Connected' : '⚠ No Wallet' }}
            </option>
          </select>
          <p class="mt-1 text-sm text-gray-500">Only students with connected wallets can receive blockchain-verified awards</p>
        </div>

        <!-- Achievement Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Achievement</label>
          <select
            v-model="awardForm.achievementId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">-- Select an achievement --</option>
            <option v-for="achievement in achievements" :key="achievement._id" :value="achievement._id">
              {{ achievement.title }} ({{ achievement.tokens }} tokens)
            </option>
          </select>
        </div>

        <!-- Achievement Preview -->
        <div v-if="selectedAchievement" class="p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-900 mb-2">{{ selectedAchievement.title }}</h3>
          <p class="text-sm text-gray-600 mb-2">{{ selectedAchievement.description }}</p>
          <p class="text-lg font-bold text-primary-600">Reward: {{ selectedAchievement.tokens }} tokens</p>
        </div>

        <!-- Blockchain Sync Option -->
        <div class="flex items-center">
          <input
            id="sync-blockchain"
            v-model="awardForm.syncToBlockchain"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            :disabled="!selectedStudentHasWallet"
          />
          <label for="sync-blockchain" class="ml-2 text-sm text-gray-700">
            Sync to blockchain
            <span v-if="!selectedStudentHasWallet" class="text-red-600">(Student must have wallet connected)</span>
          </label>
        </div>

        <!-- Submit Button -->
        <BaseButton
          type="submit"
          :loading="awarding"
          :disabled="!awardForm.studentId || !awardForm.achievementId"
          full-width
        >
          Award Achievement
        </BaseButton>
      </form>
    </div>

    <!-- Students List -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Students</h2>

      <LoadingSpinner v-if="loadingStudents" text="Loading students..." />

      <div v-else-if="students.length === 0" class="text-center py-8 text-gray-500">
        No students found
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in students" :key="student._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ student.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="student.walletAddress" class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Connected
                </span>
                <span v-else class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Not Connected
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="selectStudent(student)"
                  class="text-primary-600 hover:text-primary-900 text-sm font-medium"
                >
                  Select
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/achievement'
import api from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import SuccessAlert from '@/components/common/SuccessAlert.vue'

const achievementStore = useAchievementStore()

const loadingStudents = ref(true)
const awarding = ref(false)
const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const students = ref([])

const awardForm = ref({
  studentId: '',
  achievementId: '',
  syncToBlockchain: false,
})

const achievements = computed(() => achievementStore.achievements)

const selectedAchievement = computed(() => {
  return achievements.value.find(a => a._id === awardForm.value.achievementId)
})

const selectedStudent = computed(() => {
  return students.value.find(s => s._id === awardForm.value.studentId)
})

const selectedStudentHasWallet = computed(() => {
  return selectedStudent.value?.walletAddress ? true : false
})

const selectStudent = (student) => {
  awardForm.value.studentId = student._id
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleAward = async () => {
  awarding.value = true
  showError.value = false
  showSuccess.value = false

  try {
    await achievementStore.awardAchievement({
      studentId: awardForm.value.studentId,
      achievementId: awardForm.value.achievementId,
      syncToBlockchain: awardForm.value.syncToBlockchain,
    })

    showSuccess.value = true
    
    // Reset form
    awardForm.value = {
      studentId: '',
      achievementId: '',
      syncToBlockchain: false,
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to award achievement'
    showError.value = true
  } finally {
    awarding.value = false
  }
}

onMounted(async () => {
  loadingStudents.value = true
  try {
    // Fetch achievements and students in parallel
    const [, studentsResponse] = await Promise.all([
      achievementStore.fetchAllAchievements(),
      api.getAllStudents(),
    ])
    students.value = studentsResponse.students || studentsResponse
  } catch (error) {
    errorMessage.value = 'Failed to load data'
    showError.value = true
  } finally {
    loadingStudents.value = false
  }
})
</script>
