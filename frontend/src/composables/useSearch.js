import { ref, computed, watch } from "vue";

/**
 * Search composable with debouncing
 * Provides search functionality with configurable debounce delay
 */
export function useSearch(options = {}) {
  const { debounceMs = 300, initialQuery = "" } = options;

  const searchQuery = ref(initialQuery);
  const debouncedQuery = ref(initialQuery);
  const isSearching = ref(false);
  let debounceTimeout = null;

  // Watch for search query changes and debounce
  watch(searchQuery, (newQuery) => {
    isSearching.value = true;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
      debouncedQuery.value = newQuery;
      isSearching.value = false;
    }, debounceMs);
  });

  // Search function for arrays
  const searchArray = (array, fields) => {
    if (!debouncedQuery.value) return array;

    const query = debouncedQuery.value.toLowerCase();

    return array.filter((item) => {
      return fields.some((field) => {
        const value = getNestedValue(item, field);
        return value && value.toString().toLowerCase().includes(query);
      });
    });
  };

  // Helper to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  // Clear search
  const clearSearch = () => {
    searchQuery.value = "";
    debouncedQuery.value = "";
  };

  // Reset search
  const reset = () => {
    clearSearch();
    isSearching.value = false;
  };

  return {
    searchQuery,
    debouncedQuery,
    isSearching,
    searchArray,
    clearSearch,
    reset,
  };
}
