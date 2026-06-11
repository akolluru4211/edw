<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  UserCircle, 
  BookOpenCheck, 
  Briefcase, 
  Menu, 
  X, 
  Search, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Sparkles,
  Users,
  Award,
  GraduationCap,
  MessageSquare,
  Settings
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)
const showNotifications = ref(false)

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Mentor', path: '/mentor', icon: MessageSquareCode, badge: 'AI' },
  { name: 'Profile & Resume', path: '/profile', icon: UserCircle },
  { name: 'Skills & Courses', path: '/courses', icon: BookOpenCheck },
  { name: 'Opportunities', path: '/jobs', icon: Briefcase },
  { name: 'Network Hub', path: '/network', icon: Users },
  { name: 'Interview Prep', path: '/interview-prep', icon: Award },
  { name: 'Admissions & Quotas', path: '/admissions', icon: GraduationCap },
  { name: 'Community Hub', path: '/community', icon: MessageSquare },
  { name: 'Settings & Config', path: '/settings', icon: Settings }
]

const currentRouteName = computed(() => {
  return (route.name as string) || 'Dashboard'
})

const profileCompletionColor = computed(() => {
  const score = authStore.profileCompletionScore
  if (score < 50) return 'text-brand-danger bg-red-50'
  if (score < 80) return 'text-brand-warning bg-amber-50'
  return 'text-brand-success bg-emerald-50'
})

const profileCompletionBorder = computed(() => {
  const score = authStore.profileCompletionScore
  if (score < 50) return 'border-brand-danger'
  if (score < 80) return 'border-brand-warning'
  return 'border-brand-success'
})

const notifications = ref([
  { id: 1, title: 'AI Recommendation Match', text: 'New Frontend internship matches your skills.', read: false },
  { id: 2, title: 'Course Enrolled', text: 'You started "Data Structures & Algorithms".', read: true },
  { id: 3, title: 'System Notification', text: 'Welcome to EdWorld Co! Fill your profile.', read: true }
])

const unreadNotificationsCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const markAllNotificationsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const handleLogout = () => {
  // Mock logout
  alert('Logging out of EdWorld Co...')
}
</script>

<template>
  <div class="min-h-screen bg-brand-secBg flex overflow-hidden">
    
    <!-- Desktop Sidebar -->
    <aside 
      class="hidden lg:flex flex-col bg-brand-bg border-r border-brand-border h-screen sticky top-0 transition-all duration-300 z-30"
      :class="[isSidebarCollapsed ? 'w-20' : 'w-64']"
    >
      <!-- Logo Header -->
      <div class="h-16 flex items-center px-6 border-b border-brand-border justify-between">
        <div class="flex items-center gap-3 overflow-hidden" v-if="!isSidebarCollapsed">
          <div class="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center text-white font-bold text-lg shadow-premium-sm">
            E
          </div>
          <span class="font-bold text-xl tracking-tight text-brand-textPrimary font-sans">EdWorld<span class="text-brand-accent">.co</span></span>
        </div>
        <div class="w-full flex justify-center" v-else>
          <div class="w-9 h-9 rounded-lg bg-brand-accent flex items-center justify-center text-white font-bold text-xl shadow-premium-sm">
            E
          </div>
        </div>
      </div>

      <!-- Navigation links -->
      <nav class="flex-1 py-6 px-4 space-y-1">
        <router-link 
          v-for="item in navigationItems" 
          :key="item.name" 
          :to="item.path" 
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-brand-textSecondary hover:text-brand-accent hover:bg-brand-accentLight font-medium"
          active-class="bg-brand-accentLight text-brand-accent shadow-premium-sm"
        >
          <component 
            :is="item.icon" 
            class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" 
          />
          <span class="transition-opacity duration-200" :class="[isSidebarCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100']">
            {{ item.name }}
          </span>
          <span 
            v-if="item.badge && !isSidebarCollapsed" 
            class="ml-auto px-1.5 py-0.5 rounded bg-brand-accent text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 animate-pulse"
          >
            <Sparkles class="w-2.5 h-2.5" /> {{ item.badge }}
          </span>
        </router-link>
      </nav>

      <!-- Sidebar Footer / Collapsed Toggle -->
      <div class="p-4 border-t border-brand-border space-y-2">
        <button 
          @click="toggleSidebar"
          class="w-full hidden lg:flex items-center justify-center gap-2 p-2 rounded-lg text-brand-textSecondary hover:text-brand-textPrimary hover:bg-slate-100 transition-colors"
          title="Toggle Sidebar"
        >
          <ChevronLeft v-if="!isSidebarCollapsed" class="w-5 h-5" />
          <ChevronRight v-else class="w-5 h-5" />
          <span v-if="!isSidebarCollapsed" class="text-sm font-medium">Collapse Menu</span>
        </button>

        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-brand-textSecondary hover:text-brand-danger hover:bg-red-50 transition-all duration-200 group font-medium"
        >
          <LogOut class="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span v-if="!isSidebarCollapsed" class="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Navigation Drawer Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
      @click="closeMobileMenu"
    ></div>

    <!-- Mobile Drawer -->
    <aside 
      class="fixed inset-y-0 left-0 w-64 bg-brand-bg border-r border-brand-border flex flex-col h-full z-50 transform transition-transform duration-300 ease-in-out lg:hidden"
      :class="[isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full']"
    >
      <div class="h-16 flex items-center px-6 border-b border-brand-border justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center text-white font-bold text-lg shadow-sm">
            E
          </div>
          <span class="font-bold text-xl tracking-tight text-brand-textPrimary font-sans">EdWorld<span class="text-brand-accent">.co</span></span>
        </div>
        <button @click="toggleMobileMenu" class="text-brand-textSecondary hover:text-brand-textPrimary">
          <X class="w-6 h-6" />
        </button>
      </div>

      <nav class="flex-1 py-6 px-4 space-y-1">
        <router-link 
          v-for="item in navigationItems" 
          :key="item.name" 
          :to="item.path" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl text-brand-textSecondary hover:text-brand-accent hover:bg-brand-accentLight font-medium"
          active-class="bg-brand-accentLight text-brand-accent"
          @click="closeMobileMenu"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span>{{ item.name }}</span>
          <span 
            v-if="item.badge" 
            class="ml-auto px-1.5 py-0.5 rounded bg-brand-accent text-white text-[10px] font-bold uppercase tracking-wider"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-brand-border">
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-brand-textSecondary hover:text-brand-danger hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut class="w-5 h-5 flex-shrink-0" />
          <span class="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      
      <!-- Topbar Header -->
      <header class="h-16 bg-brand-bg border-b border-brand-border px-4 lg:px-8 flex items-center justify-between z-20 flex-shrink-0">
        
        <!-- Sidebar Toggle (Mobile) / Route Title -->
        <div class="flex items-center gap-4">
          <button 
            @click="toggleMobileMenu" 
            class="lg:hidden p-2 rounded-lg text-brand-textSecondary hover:text-brand-textPrimary hover:bg-slate-100 transition-colors"
          >
            <Menu class="w-6 h-6" />
          </button>
          
          <h1 class="text-lg lg:text-xl font-bold text-brand-textPrimary font-sans">
            {{ currentRouteName === 'AIMentor' ? 'AI Coach Alex' : currentRouteName }}
          </h1>
        </div>

        <!-- Right Header Items -->
        <div class="flex items-center gap-3 lg:gap-6">
          
          <!-- Search Bar (Desktop) -->
          <div class="relative hidden md:block w-64">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="w-4 h-4 text-brand-textSecondary" />
            </span>
            <input 
              type="text" 
              placeholder="Search opportunities, courses..." 
              class="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl border border-brand-border bg-brand-secBg text-brand-textPrimary placeholder-brand-textSecondary focus:outline-none focus:border-brand-accent focus:bg-brand-bg transition-all font-sans"
            />
          </div>

          <!-- Notification Bell Dropdown -->
          <div class="relative">
            <button 
              @click="showNotifications = !showNotifications"
              class="p-2 rounded-xl text-brand-textSecondary hover:text-brand-textPrimary hover:bg-slate-100 transition-colors relative"
            >
              <Bell class="w-5.5 h-5.5" />
              <span 
                v-if="unreadNotificationsCount > 0" 
                class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-accent border-2 border-brand-bg text-[8px] font-bold text-white flex items-center justify-center"
              >
                {{ unreadNotificationsCount }}
              </span>
            </button>

            <!-- Notifications Drawer -->
            <div 
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-brand-bg border border-brand-border rounded-2xl shadow-premium py-2 z-50 animate-fade"
              @mouseleave="showNotifications = false"
            >
              <div class="px-4 py-2 border-b border-brand-border flex items-center justify-between">
                <span class="font-bold text-sm text-brand-textPrimary">Notifications</span>
                <button 
                  @click="markAllNotificationsRead" 
                  class="text-xs text-brand-accent hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>
              <div class="max-h-64 overflow-y-auto divide-y divide-brand-border">
                <div 
                  v-for="notif in notifications" 
                  :key="notif.id" 
                  class="p-3 hover:bg-brand-secBg transition-colors"
                  :class="[!notif.read ? 'bg-sky-50/30' : '']"
                >
                  <div class="flex items-start justify-between">
                    <span class="text-xs font-semibold text-brand-textPrimary">{{ notif.title }}</span>
                    <span v-if="!notif.read" class="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1"></span>
                  </div>
                  <p class="text-[11px] text-brand-textSecondary mt-0.5">{{ notif.text }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="h-6 w-px bg-brand-border"></div>

          <!-- Profile Score & Avatar -->
          <router-link to="/profile" class="flex items-center gap-2 group">
            <!-- Profile Completion Tag -->
            <div 
              class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors duration-200"
              :class="[profileCompletionColor, profileCompletionBorder]"
              title="Profile Completion Score"
            >
              <span>{{ authStore.profileCompletionScore }}%</span>
              <span class="text-[9px] uppercase tracking-wider opacity-90">Profile</span>
            </div>
            
            <!-- User Profile Avatar -->
            <div class="relative">
              <img 
                :src="authStore.profile.avatarUrl" 
                alt="User Avatar" 
                class="w-9 h-9 rounded-full object-cover border-2 border-brand-border group-hover:border-brand-accent transition-colors"
              />
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-brand-bg"></span>
            </div>
          </router-link>
        </div>
      </header>

      <!-- Sub-view content wrapper -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-8">
        <router-view v-slot="{ Component }">
          <transition name="slide-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

    </div>
  </div>
</template>
