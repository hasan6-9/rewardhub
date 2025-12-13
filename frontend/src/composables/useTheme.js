import { ref, watch, onMounted } from "vue";

/**
 * Theme composable for dark mode support
 * Manages theme state with localStorage persistence
 */
export function useTheme() {
  const STORAGE_KEY = "rewardhub-theme";
  const theme = ref("light");

  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme) {
      theme.value = savedTheme;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      theme.value = prefersDark ? "dark" : "light";
    }

    applyTheme(theme.value);
  };

  // Apply theme to document
  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Toggle theme
  const toggleTheme = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
  };

  // Set specific theme
  const setTheme = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      theme.value = newTheme;
    }
  };

  // Watch theme changes and persist
  watch(theme, (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  });

  // Listen for system theme changes
  const listenToSystemTheme = () => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        theme.value = e.matches ? "dark" : "light";
      }
    });
  };

  onMounted(() => {
    initTheme();
    listenToSystemTheme();
  });

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: () => theme.value === "dark",
    isLight: () => theme.value === "light",
  };
}
