import { defineStore } from "pinia";
import { ref } from "vue";
import * as perkService from "@/services/perk.service";

export const usePerksStore = defineStore("perks", () => {
  const perks = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Fetch perks (admin)
  async function fetchPerks() {
    try {
      loading.value = true;
      error.value = null;

      const data = await perkService.getAdminPerks();
      perks.value = data.perks;

      return data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Fetch public perks/rewards
  async function fetchPublicPerks() {
    try {
      loading.value = true;
      error.value = null;

      const data = await perkService.getRewards();
      perks.value = data.rewards;

      return data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Get perk by ID
  async function getPerkById(id) {
    try {
      loading.value = true;
      error.value = null;

      const data = await perkService.getPerkById(id);
      return data.perk;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Create perk
  async function createPerk(perkData) {
    try {
      loading.value = true;
      error.value = null;

      // Transform syncToBlockchain to syncOnChain for backend
      const payload = {
        ...perkData,
        syncOnChain: perkData.syncToBlockchain,
      };
      delete payload.syncToBlockchain;

      const data = await perkService.createPerk(payload);

      // Add to list
      perks.value.push(data.perk);

      // Show success message with warning if blockchain sync failed
      if (data.warning) {
        window.$toast?.(data.warning, "warning");
      } else {
        window.$toast?.("Perk created successfully", "success");
      }

      return data;
    } catch (err) {
      error.value = err;
      window.$toast?.(
        "Error creating perk: " + (err.response?.data?.msg || err.message),
        "error"
      );
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Update perk
  async function updatePerk(id, perkData) {
    try {
      loading.value = true;
      error.value = null;

      const data = await perkService.updatePerk(id, perkData);

      // Update in list
      const index = perks.value.findIndex((p) => p._id === id);
      if (index !== -1) {
        perks.value[index] = data.perk;
      }

      // Show success message with warning if blockchain update failed
      if (data.warning) {
        window.$toast?.(data.warning, "warning");
      } else {
        window.$toast?.("Perk updated successfully", "success");
      }

      return data;
    } catch (err) {
      error.value = err;
      window.$toast?.(
        "Error updating perk: " + (err.response?.data?.msg || err.message),
        "error"
      );
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Delete perk
  async function deletePerk(id) {
    try {
      loading.value = true;
      error.value = null;

      const response = await perkService.deletePerk(id);

      // Remove from list
      perks.value = perks.value.filter((p) => p._id !== id);

      // Show success message with warning if blockchain deactivation failed
      if (response.data?.warning) {
        window.$toast?.(response.data.warning, "warning");
      } else {
        window.$toast?.("Perk deleted successfully", "success");
      }

      return true;
    } catch (err) {
      error.value = err;
      window.$toast?.(
        "Error deleting perk: " + (err.response?.data?.msg || err.message),
        "error"
      );
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    perks,
    loading,
    error,
    fetchPerks,
    fetchPublicPerks,
    getPerkById,
    createPerk,
    updatePerk,
    deletePerk,
  };
});
