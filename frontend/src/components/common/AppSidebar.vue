<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <router-link
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        class="sidebar-link"
        active-class="active"
      >
        <component :is="link.icon" class="link-icon" />
        <span class="link-text">{{ link.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import DashboardIcon from "@/components/icons/DashboardIcon.vue";
import UsersIcon from "@/components/icons/UsersIcon.vue";
import TrophyIcon from "@/components/icons/TrophyIcon.vue";
import GiftIcon from "@/components/icons/GiftIcon.vue";
import WalletIcon from "@/components/icons/WalletIcon.vue";

const authStore = useAuthStore();

const navLinks = computed(() => {
  const role = authStore.userRole;

  if (role === "admin") {
    return [
      { path: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
      { path: "/admin/users", label: "Manage Users", icon: UsersIcon },
      { path: "/admin/achievements", label: "Achievements", icon: TrophyIcon },
      { path: "/admin/perks", label: "Perks", icon: GiftIcon },
    ];
  }

  if (role === "faculty") {
    return [
      { path: "/faculty/dashboard", label: "Dashboard", icon: DashboardIcon },
      { path: "/faculty/award", label: "Award Achievements", icon: TrophyIcon },
    ];
  }

  if (role === "student") {
    return [
      { path: "/student/dashboard", label: "Dashboard", icon: DashboardIcon },
      {
        path: "/student/achievements",
        label: "My Achievements",
        icon: TrophyIcon,
      },
      { path: "/student/perks", label: "Perks", icon: GiftIcon },
      { path: "/student/wallet", label: "Wallet", icon: WalletIcon },
    ];
  }

  return [];
});
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid var(--border-color);
  height: calc(100vh - 65px);
  position: sticky;
  top: 65px;
  overflow-y: auto;
}

.sidebar-nav {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  border-left: 3px solid transparent;
}

.sidebar-link:hover {
  background-color: var(--gray-50);
  color: var(--text-primary);
}

.sidebar-link.active {
  background-color: rgba(37, 99, 235, 0.05);
  color: var(--primary-color);
  border-left-color: var(--primary-color);
  font-weight: 500;
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.link-text {
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .link-text {
    display: none;
  }

  .sidebar-link {
    justify-content: center;
    padding: 0.875rem;
  }
}
</style>
