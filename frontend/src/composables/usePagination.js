import { ref, computed } from "vue";

/**
 * Pagination composable for managing paginated data
 * Provides state and methods for pagination controls
 */
export function usePagination(options = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 25, 50, 100],
  } = options;

  const currentPage = ref(initialPage);
  const pageSize = ref(initialPageSize);
  const totalItems = ref(0);

  // Computed properties
  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / pageSize.value);
  });

  const startIndex = computed(() => {
    return (currentPage.value - 1) * pageSize.value;
  });

  const endIndex = computed(() => {
    return Math.min(startIndex.value + pageSize.value, totalItems.value);
  });

  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value;
  });

  const hasPreviousPage = computed(() => {
    return currentPage.value > 1;
  });

  const pageNumbers = computed(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages.value, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  // Methods
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++;
    }
  };

  const previousPage = () => {
    if (hasPreviousPage.value) {
      currentPage.value--;
    }
  };

  const setPageSize = (size) => {
    pageSize.value = size;
    currentPage.value = 1; // Reset to first page when changing page size
  };

  const setTotalItems = (total) => {
    totalItems.value = total;
  };

  const reset = () => {
    currentPage.value = initialPage;
    pageSize.value = initialPageSize;
    totalItems.value = 0;
  };

  // Paginate array
  const paginateArray = (array) => {
    return array.slice(startIndex.value, endIndex.value);
  };

  return {
    // State
    currentPage,
    pageSize,
    totalItems,
    pageSizeOptions,

    // Computed
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    pageNumbers,

    // Methods
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    setTotalItems,
    reset,
    paginateArray,
  };
}
