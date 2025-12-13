import { ref, computed } from "vue";

/**
 * Filter composable for managing multiple filters
 * Provides state and methods for filtering data
 */
export function useFilter(initialFilters = {}) {
  const filters = ref({ ...initialFilters });
  const activeFilterCount = computed(() => {
    return Object.values(filters.value).filter((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== "" && value !== null && value !== undefined;
    }).length;
  });

  // Filter array based on current filters
  const filterArray = (array, filterConfig) => {
    return array.filter((item) => {
      return Object.entries(filters.value).every(([key, filterValue]) => {
        // Skip empty filters
        if (
          filterValue === "" ||
          filterValue === null ||
          filterValue === undefined
        ) {
          return true;
        }

        // Skip empty array filters
        if (Array.isArray(filterValue) && filterValue.length === 0) {
          return true;
        }

        const config = filterConfig[key];
        if (!config) return true;

        const itemValue = getNestedValue(item, config.field || key);

        // Handle different filter types
        switch (config.type) {
          case "exact":
            return itemValue === filterValue;

          case "contains":
            return (
              itemValue &&
              itemValue
                .toString()
                .toLowerCase()
                .includes(filterValue.toLowerCase())
            );

          case "array":
            return (
              Array.isArray(filterValue) && filterValue.includes(itemValue)
            );

          case "range":
            if (filterValue.min !== undefined && itemValue < filterValue.min)
              return false;
            if (filterValue.max !== undefined && itemValue > filterValue.max)
              return false;
            return true;

          case "boolean":
            return (
              itemValue === (filterValue === "true" || filterValue === true)
            );

          case "custom":
            return config.filterFn(itemValue, filterValue, item);

          default:
            return itemValue === filterValue;
        }
      });
    });
  };

  // Helper to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  // Set a single filter
  const setFilter = (key, value) => {
    filters.value[key] = value;
  };

  // Clear a single filter
  const clearFilter = (key) => {
    if (Array.isArray(filters.value[key])) {
      filters.value[key] = [];
    } else {
      filters.value[key] = "";
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    Object.keys(filters.value).forEach((key) => {
      clearFilter(key);
    });
  };

  // Reset to initial filters
  const reset = () => {
    filters.value = { ...initialFilters };
  };

  return {
    filters,
    activeFilterCount,
    filterArray,
    setFilter,
    clearFilter,
    clearAllFilters,
    reset,
  };
}
