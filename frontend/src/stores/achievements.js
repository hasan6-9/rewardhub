import { defineStore } from "pinia";
import { ref } from "vue";
import * as achievementService from "@/services/achievement.service";

export const useAchievementsStore = defineStore("achievements", () => {
  const achievements = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Fetch achievements (admin)
  async function fetchAchievements() {
    try {
      loading.value = true;
      error.value = null;

      const data = await achievementService.getAdminAchievements();
      achievements.value = data.achievements;

      return data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Fetch public achievements
  async function fetchPublicAchievements() {
    try {
      loading.value = true;
      error.value = null;

      const data = await achievementService.getAchievements();
      achievements.value = data.achievements;

      return data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Get achievement by ID
  async function getAchievementById(id) {
    try {
      loading.value = true;
      error.value = null;

      const data = await achievementService.getAchievementById(id);
      return data.achievement;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Create achievement
  async function createAchievement(achievementData) {
    try {
      loading.value = true;
      error.value = null;

      // Transform syncToBlockchain to syncOnChain for backend
      const payload = {
        title: achievementData.title,
        description: achievementData.description,
        tokenReward: achievementData.tokenReward,
        syncOnChain: achievementData.syncToBlockchain || false,
      };

      const data = await achievementService.createAchievement(payload);

      // Add to list
      achievements.value.push(data.achievement);

      // Show success message with warning if blockchain sync failed
      if (data.warning) {
        window.$toast?.(data.warning, "warning");
      } else {
        window.$toast?.("Achievement created successfully", "success");
      }

      return data;
    } catch (err) {
      error.value = err;
      window.$toast?.(
        "Error creating achievement: " +
          (err.response?.data?.msg || err.message),
        "error"
      );
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Update achievement
  async function updateAchievement(id, achievementData) {
    try {
      loading.value = true;
      error.value = null;

      const data = await achievementService.updateAchievement(
        id,
        achievementData
      );

      // Update in list
      const index = achievements.value.findIndex((a) => a._id === id);
      if (index !== -1) {
        achievements.value[index] = data.achievement;
      }

      // Show success message with warning if blockchain update failed
      if (data.warning) {
        window.$toast?.(data.warning, "warning");
      } else {
        window.$toast?.("Achievement updated successfully", "success");
      }

      return data;
    } catch (err) {
      error.value = err;
      window.$toast?.(
        "Error updating achievement: " +
          (err.response?.data?.msg || err.message),
        "error"
      );
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Delete achievement
  async function deleteAchievement(id) {
    try {
      loading.value = true;
      error.value = null;

      const response = await achievementService.deleteAchievement(id);

      // Remove from list
      achievements.value = achievements.value.filter((a) => a._id !== id);

      // Show success message with warning if blockchain deactivation failed
      if (response.data?.warning) {
        window.$toast?.(response.data.warning, "warning");
      } else {
        window.$toast?.("Achievement deleted successfully", "success");
      }

      return true;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    achievements,
    loading,
    error,
    fetchAchievements,
    fetchPublicAchievements,
    getAchievementById,
    createAchievement,
    updateAchievement,
    deleteAchievement,
  };
});
