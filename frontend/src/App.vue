<template>
  <div id="app">
    <ErrorBoundary>
      <router-view />
    </ErrorBoundary>
    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import ToastNotification from "@/components/common/ToastNotification.vue";
import ErrorBoundary from "@/components/common/ErrorBoundary.vue";

const authStore = useAuthStore();
const toastRef = ref(null);

onMounted(() => {
  // Initialize auth from localStorage
  authStore.init();

  // Make toast globally available
  if (toastRef.value) {
    window.$toast = toastRef.value.addToast;
  }
});
</script>

<style>
@import "@/assets/styles/main.css";
</style>
