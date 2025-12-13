<template>
  <div class="skeleton-wrapper">
    <!-- Table Skeleton -->
    <div v-if="variant === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div
          v-for="col in columns"
          :key="col"
          class="skeleton-cell skeleton-shimmer"
        ></div>
      </div>
      <div v-for="row in rows" :key="row" class="skeleton-table-row">
        <div
          v-for="col in columns"
          :key="col"
          class="skeleton-cell skeleton-shimmer"
        ></div>
      </div>
    </div>

    <!-- Card Skeleton -->
    <div v-else-if="variant === 'card'" class="skeleton-card-grid">
      <div v-for="card in rows" :key="card" class="skeleton-card">
        <div class="skeleton-card-header skeleton-shimmer"></div>
        <div class="skeleton-card-body">
          <div class="skeleton-line skeleton-shimmer"></div>
          <div class="skeleton-line skeleton-shimmer" style="width: 80%"></div>
          <div class="skeleton-line skeleton-shimmer" style="width: 60%"></div>
        </div>
        <div class="skeleton-card-footer skeleton-shimmer"></div>
      </div>
    </div>

    <!-- Text Skeleton -->
    <div v-else class="skeleton-text">
      <div
        v-for="line in rows"
        :key="line"
        class="skeleton-line skeleton-shimmer"
        :style="{ width: line % 2 === 0 ? '100%' : '75%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: "table",
    validator: (value) => ["table", "card", "text"].includes(value),
  },
  rows: {
    type: Number,
    default: 5,
  },
  columns: {
    type: Number,
    default: 4,
  },
});
</script>

<style scoped>
.skeleton-wrapper {
  width: 100%;
}

/* Shimmer Animation */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--gray-100) 0%,
    var(--gray-200) 20%,
    var(--gray-100) 40%,
    var(--gray-100) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}

/* Table Skeleton */
.skeleton-table {
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.skeleton-table-header,
.skeleton-table-row {
  display: grid;
  grid-template-columns: repeat(var(--columns, 4), 1fr);
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.skeleton-table-header {
  background-color: var(--gray-50);
}

.skeleton-table-row:last-child {
  border-bottom: none;
}

.skeleton-cell {
  height: 20px;
  border-radius: var(--border-radius-sm);
}

/* Card Skeleton */
.skeleton-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
}

.skeleton-card-header {
  height: 24px;
  border-radius: var(--border-radius-sm);
  margin-bottom: 1rem;
}

.skeleton-card-body {
  margin-bottom: 1rem;
}

.skeleton-line {
  height: 16px;
  border-radius: var(--border-radius-sm);
  margin-bottom: 0.5rem;
}

.skeleton-card-footer {
  height: 32px;
  border-radius: var(--border-radius-sm);
}

/* Text Skeleton */
.skeleton-text .skeleton-line {
  height: 18px;
  border-radius: var(--border-radius-sm);
  margin-bottom: 0.75rem;
}
</style>
