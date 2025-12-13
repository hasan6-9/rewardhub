<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      @click="previousPage"
      :disabled="!hasPreviousPage"
      class="pagination-btn"
      aria-label="Previous page"
    >
      ← Previous
    </button>

    <div class="pagination-numbers">
      <button
        v-if="pageNumbers[0] > 1"
        @click="goToPage(1)"
        class="pagination-number"
      >
        1
      </button>

      <span v-if="pageNumbers[0] > 2" class="pagination-ellipsis">...</span>

      <button
        v-for="page in pageNumbers"
        :key="page"
        @click="goToPage(page)"
        :class="['pagination-number', { active: page === currentPage }]"
        :aria-label="`Go to page ${page}`"
        :aria-current="page === currentPage ? 'page' : undefined"
      >
        {{ page }}
      </button>

      <span
        v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1"
        class="pagination-ellipsis"
        >...</span
      >

      <button
        v-if="pageNumbers[pageNumbers.length - 1] < totalPages"
        @click="goToPage(totalPages)"
        class="pagination-number"
      >
        {{ totalPages }}
      </button>
    </div>

    <button
      @click="nextPage"
      :disabled="!hasNextPage"
      class="pagination-btn"
      aria-label="Next page"
    >
      Next →
    </button>
  </div>

  <div v-if="showPageSize" class="pagination-info">
    <span class="pagination-text">
      Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} items
    </span>
    <select
      v-model="pageSize"
      @change="handlePageSizeChange"
      class="pagination-select"
      aria-label="Items per page"
    >
      <option v-for="size in pageSizeOptions" :key="size" :value="size">
        {{ size }} per page
      </option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 25, 50, 100],
  },
  hasNextPage: {
    type: Boolean,
    required: true,
  },
  hasPreviousPage: {
    type: Boolean,
    required: true,
  },
  pageNumbers: {
    type: Array,
    required: true,
  },
  startIndex: {
    type: Number,
    required: true,
  },
  endIndex: {
    type: Number,
    required: true,
  },
  showPageSize: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update:currentPage",
  "update:pageSize",
  "page-change",
  "page-size-change",
]);

function goToPage(page) {
  emit("update:currentPage", page);
  emit("page-change", page);
}

function nextPage() {
  if (props.hasNextPage) {
    const newPage = props.currentPage + 1;
    emit("update:currentPage", newPage);
    emit("page-change", newPage);
  }
}

function previousPage() {
  if (props.hasPreviousPage) {
    const newPage = props.currentPage - 1;
    emit("update:currentPage", newPage);
    emit("page-change", newPage);
  }
}

function handlePageSizeChange(event) {
  const newSize = parseInt(event.target.value);
  emit("update:pageSize", newSize);
  emit("page-size-change", newSize);
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem 0;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-number {
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.pagination-number:hover {
  background: var(--gray-50);
  border-color: var(--primary-color);
}

.pagination-number.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-ellipsis {
  padding: 0 0.5rem;
  color: var(--text-secondary);
}

.pagination-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.pagination-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.pagination-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
  }

  .pagination-info {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
