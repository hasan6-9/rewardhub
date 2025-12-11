import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Auth Views
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'

// Dashboard Views
import StudentDashboard from '@/views/dashboard/StudentDashboard.vue'
import AdminDashboard from '@/views/dashboard/AdminDashboard.vue'
import FacultyDashboard from '@/views/dashboard/FacultyDashboard.vue'

// Student Views
import MyAchievements from '@/views/student/MyAchievements.vue'
import MyRewards from '@/views/student/MyRewards.vue'
import RedeemPerks from '@/views/student/RedeemPerks.vue'

// Admin Views
import ManageUsers from '@/views/admin/ManageUsers.vue'
import ManageAchievements from '@/views/admin/ManageAchievements.vue'
import ManagePerks from '@/views/admin/ManagePerks.vue'

// Faculty Views
import AwardAchievements from '@/views/faculty/AwardAchievements.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginView,
        meta: { requiresGuest: true },
      },
      {
        path: 'register',
        name: 'Register',
        component: RegisterView,
        meta: { requiresGuest: true },
      },
    ],
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: StudentDashboard,
        meta: { requiresAuth: true, roles: ['student'] },
      },
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'faculty',
        name: 'FacultyDashboard',
        component: FacultyDashboard,
        meta: { requiresAuth: true, roles: ['faculty'] },
      },
      // Student Routes
      {
        path: 'my-achievements',
        name: 'MyAchievements',
        component: MyAchievements,
        meta: { requiresAuth: true, roles: ['student'] },
      },
      {
        path: 'my-rewards',
        name: 'MyRewards',
        component: MyRewards,
        meta: { requiresAuth: true, roles: ['student'] },
      },
      {
        path: 'redeem-perks',
        name: 'RedeemPerks',
        component: RedeemPerks,
        meta: { requiresAuth: true, roles: ['student'] },
      },
      // Admin Routes
      {
        path: 'manage-users',
        name: 'ManageUsers',
        component: ManageUsers,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'manage-achievements',
        name: 'ManageAchievements',
        component: ManageAchievements,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'manage-perks',
        name: 'ManagePerks',
        component: ManagePerks,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      // Faculty Routes
      {
        path: 'award-achievements',
        name: 'AwardAchievements',
        component: AwardAchievements,
        meta: { requiresAuth: true, roles: ['faculty'] },
      },
    ],
  },
  {
    path: '/login',
    redirect: '/auth/login',
  },
  {
    path: '/register',
    redirect: '/auth/register',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Fetch user profile if authenticated but user data not loaded
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchProfile()
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      authStore.logout()
      return next('/auth/login')
    }
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/auth/login')
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (authStore.isAdmin) {
      return next('/dashboard/admin')
    } else if (authStore.isFaculty) {
      return next('/dashboard/faculty')
    } else {
      return next('/dashboard')
    }
  }

  // Check role-based access
  if (to.meta.roles && authStore.user) {
    const userRole = authStore.user.role
    if (!to.meta.roles.includes(userRole)) {
      // Redirect to appropriate dashboard
      if (authStore.isAdmin) {
        return next('/dashboard/admin')
      } else if (authStore.isFaculty) {
        return next('/dashboard/faculty')
      } else {
        return next('/dashboard')
      }
    }
  }

  next()
})

export default router
