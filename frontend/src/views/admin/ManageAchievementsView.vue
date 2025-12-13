<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-content">
      <AppSidebar />
      <main class="main-content">
        <div class="page-header">
          <h1>Manage Achievements</h1>
          <button @click="showCreateModal = true" class="btn btn-primary">
            Add Achievement
          </button>
        </div>

        <LoadingSpinner v-if="loading" />

        <div v-else class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Token Reward</th>
                <th>On-Chain Status</th>
                <th>Blockchain Info</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="achievement in achievements" :key="achievement._id">
                <td>{{ achievement.title }}</td>
                <td>{{ achievement.tokenReward }} tokens</td>
                <td>
                  <span
                    v-if="achievement.onChainCreated"
                    class="badge badge-success"
                    >Yes</span
                  >
                  <span v-else class="badge badge-secondary">No</span>
                </td>
                <td>
                  <div
                    v-if="achievement.onChainCreated"
                    class="blockchain-info"
                  >
                    <div class="tx-info">
                      <small class="text-secondary">Created:</small>
                      <a
                        v-if="achievement.onChainTx"
                        :href="`https://etherscan.io/tx/${achievement.onChainTx}`"
                        target="_blank"
                        class="tx-link"
                        :title="achievement.onChainTx"
                      >
                        {{ achievement.onChainTx.substring(0, 10) }}...
                      </a>
                    </div>
                    <div v-if="achievement.onChainUpdateTx" class="tx-info">
                      <small class="text-secondary">Updated:</small>
                      <a
                        :href="`https://etherscan.io/tx/${achievement.onChainUpdateTx}`"
                        target="_blank"
                        class="tx-link"
                        :title="achievement.onChainUpdateTx"
                      >
                        {{ achievement.onChainUpdateTx.substring(0, 10) }}...
                      </a>
                      <small class="text-muted">
                        {{ formatDate(achievement.onChainUpdatedAt) }}
                      </small>
                    </div>
                  </div>
                  <span v-else class="text-secondary">-</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="openEditModal(achievement)"
                      class="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      @click="deleteAchievement(achievement._id)"
                      class="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <BaseModal v-model="showCreateModal" title="Create Achievement">
          <form @submit.prevent="handleCreate">
            <div class="form-group">
              <label class="form-label">Title</label>
              <input v-model="form.title" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="form.description"
                class="form-textarea"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Token Reward</label>
              <input
                v-model.number="form.tokenReward"
                type="number"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <input v-model="form.syncToBlockchain" type="checkbox" />
                Sync to Blockchain
              </label>
            </div>
          </form>
          <template #footer>
            <button
              type="button"
              @click="showCreateModal = false"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button @click="handleCreate" class="btn btn-primary">
              Create
            </button>
          </template>
        </BaseModal>

        <!-- Edit Modal -->
        <BaseModal v-model="showEditModal" title="Edit Achievement">
          <form @submit.prevent="handleUpdate">
            <div class="form-group">
              <label class="form-label">Title</label>
              <input v-model="editForm.title" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="editForm.description"
                class="form-textarea"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Token Reward</label>
              <input
                v-model.number="editForm.tokenReward"
                type="number"
                class="form-input"
                required
              />
            </div>
            <div v-if="editForm.onChainCreated" class="form-group">
              <div class="alert alert-info">
                <small>
                  This achievement is on the blockchain. Changing the title or
                  reward will create a new version.
                </small>
              </div>
            </div>
          </form>
          <template #footer>
            <button
              type="button"
              @click="showEditModal = false"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button @click="handleUpdate" class="btn btn-primary">
              Update
            </button>
          </template>
        </BaseModal>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import AppSidebar from "@/components/common/AppSidebar.vue";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import { useAchievementsStore } from "@/stores/achievements";

const achievementsStore = useAchievementsStore();
const achievements = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const form = ref({
  title: "",
  description: "",
  tokenReward: 0,
  syncToBlockchain: false,
});
const editForm = ref({
  _id: "",
  title: "",
  description: "",
  tokenReward: 0,
  onChainCreated: false,
});

async function loadAchievements() {
  loading.value = true;
  try {
    await achievementsStore.fetchAchievements();
    achievements.value = achievementsStore.achievements;
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  try {
    await achievementsStore.createAchievement(form.value);
    showCreateModal.value = false;
    form.value = {
      title: "",
      description: "",
      tokenReward: 0,
      syncToBlockchain: false,
    };
    await loadAchievements();
  } catch (error) {
    console.error("Error creating achievement:", error);
  }
}

function openEditModal(achievement) {
  editForm.value = {
    _id: achievement._id,
    title: achievement.title,
    description: achievement.description,
    tokenReward: achievement.tokenReward,
    onChainCreated: achievement.onChainCreated,
  };
  showEditModal.value = true;
}

async function handleUpdate() {
  try {
    await achievementsStore.updateAchievement(editForm.value._id, {
      title: editForm.value.title,
      description: editForm.value.description,
      tokenReward: editForm.value.tokenReward,
    });
    showEditModal.value = false;
    await loadAchievements();
  } catch (error) {
    console.error("Error updating achievement:", error);
  }
}

async function deleteAchievement(id) {
  if (
    confirm(
      "Delete this achievement? If on blockchain, it will be deactivated."
    )
  ) {
    try {
      await achievementsStore.deleteAchievement(id);
      await loadAchievements();
    } catch (error) {
      console.error("Error deleting achievement:", error);
    }
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

onMounted(() => {
  loadAchievements();
});
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.dashboard-content {
  display: flex;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.blockchain-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.tx-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tx-link {
  color: var(--primary-color);
  text-decoration: none;
  font-family: monospace;
}

.tx-link:hover {
  text-decoration: underline;
}

.text-muted {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.alert {
  padding: 0.75rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
}

.alert-info {
  background: #e3f2fd;
  border: 1px solid #90caf9;
  color: #1976d2;
}
</style>
