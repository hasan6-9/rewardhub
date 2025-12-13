<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-content">
      <AppSidebar />
      <main class="main-content">
        <div class="page-header">
          <h1>Manage Perks</h1>
          <button @click="showCreateModal = true" class="btn btn-primary">
            Add Perk
          </button>
        </div>

        <LoadingSpinner v-if="loading" />

        <div v-else class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Token Cost</th>
                <th>On-Chain Status</th>
                <th>Blockchain Info</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perk in perks" :key="perk._id">
                <td>{{ perk.title }}</td>
                <td>{{ perk.tokenCost }} tokens</td>
                <td>
                  <span v-if="perk.onChainCreated" class="badge badge-success"
                    >Yes</span
                  >
                  <span v-else class="badge badge-secondary">No</span>
                </td>
                <td>
                  <div v-if="perk.onChainCreated" class="blockchain-info">
                    <div class="tx-info">
                      <small class="text-secondary">Created:</small>
                      <a
                        v-if="perk.onChainTx"
                        :href="`https://etherscan.io/tx/${perk.onChainTx}`"
                        target="_blank"
                        class="tx-link"
                        :title="perk.onChainTx"
                      >
                        {{ perk.onChainTx.substring(0, 10) }}...
                      </a>
                    </div>
                    <div v-if="perk.onChainUpdateTx" class="tx-info">
                      <small class="text-secondary">Updated:</small>
                      <a
                        :href="`https://etherscan.io/tx/${perk.onChainUpdateTx}`"
                        target="_blank"
                        class="tx-link"
                        :title="perk.onChainUpdateTx"
                      >
                        {{ perk.onChainUpdateTx.substring(0, 10) }}...
                      </a>
                      <small class="text-muted">
                        {{ formatDate(perk.onChainUpdatedAt) }}
                      </small>
                    </div>
                  </div>
                  <span v-else class="text-secondary">-</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="openEditModal(perk)"
                      class="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      @click="deletePerk(perk._id)"
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

        <BaseModal v-model="showCreateModal" title="Create Perk">
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
              <label class="form-label">Token Cost</label>
              <input
                v-model.number="form.tokenCost"
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
        <BaseModal v-model="showEditModal" title="Edit Perk">
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
              <label class="form-label">Token Cost</label>
              <input
                v-model.number="editForm.tokenCost"
                type="number"
                class="form-input"
                required
              />
            </div>
            <div v-if="editForm.onChainCreated" class="form-group">
              <div class="alert alert-info">
                <small>
                  This perk is on the blockchain. Changing the title or cost
                  will create a new version.
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
import { usePerksStore } from "@/stores/perks";

const perksStore = usePerksStore();
const perks = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const form = ref({
  title: "",
  description: "",
  tokenCost: 0,
  syncToBlockchain: false,
});
const editForm = ref({
  _id: "",
  title: "",
  description: "",
  tokenCost: 0,
  onChainCreated: false,
});

async function loadPerks() {
  loading.value = true;
  try {
    await perksStore.fetchPerks();
    perks.value = perksStore.perks;
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  try {
    await perksStore.createPerk(form.value);
    showCreateModal.value = false;
    form.value = {
      title: "",
      description: "",
      tokenCost: 0,
      syncToBlockchain: false,
    };
    await loadPerks();
  } catch (error) {
    console.error("Error creating perk:", error);
  }
}

function openEditModal(perk) {
  editForm.value = {
    _id: perk._id,
    title: perk.title,
    description: perk.description,
    tokenCost: perk.tokenCost,
    onChainCreated: perk.onChainCreated,
  };
  showEditModal.value = true;
}

async function handleUpdate() {
  try {
    await perksStore.updatePerk(editForm.value._id, {
      title: editForm.value.title,
      description: editForm.value.description,
      tokenCost: editForm.value.tokenCost,
    });
    showEditModal.value = false;
    await loadPerks();
  } catch (error) {
    console.error("Error updating perk:", error);
  }
}

async function deletePerk(id) {
  if (confirm("Delete this perk? If on blockchain, it will be deactivated.")) {
    try {
      await perksStore.deletePerk(id);
      await loadPerks();
    } catch (error) {
      console.error("Error deleting perk:", error);
    }
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

onMounted(() => {
  loadPerks();
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
