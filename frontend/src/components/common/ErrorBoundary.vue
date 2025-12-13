<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h1>Something Went Wrong</h1>
      <p class="error-message">
        We're sorry, but something unexpected happened. Please try reloading the
        page.
      </p>
      <div class="error-actions">
        <button @click="reload" class="btn btn-primary">Reload Page</button>
        <button @click="goHome" class="btn btn-secondary">Go to Home</button>
      </div>
      <details v-if="errorDetails" class="error-details">
        <summary>Technical Details</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const hasError = ref(false);
const errorDetails = ref(null);

onErrorCaptured((err, instance, info) => {
  hasError.value = true;

  // Format error details
  errorDetails.value = `Error: ${err.message}\n\nComponent: ${
    instance?.$options?.name || "Unknown"
  }\n\nInfo: ${info}\n\nStack: ${err.stack}`;

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error("Error caught by boundary:", err);
    console.error("Component:", instance);
    console.error("Info:", info);
  }

  // In production, you would send this to an error tracking service
  // Example: Sentry.captureException(err);

  // Prevent error from propagating
  return false;
});

function reload() {
  window.location.reload();
}

function goHome() {
  hasError.value = false;
  errorDetails.value = null;
  router.push("/");
}
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: 2rem;
}

.error-container {
  max-width: 600px;
  text-align: center;
  background: var(--bg-primary);
  padding: 3rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-container h1 {
  font-size: var(--font-size-3xl);
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.error-message {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.error-details {
  text-align: left;
  margin-top: 2rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.error-details pre {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: "Courier New", monospace;
}
</style>
