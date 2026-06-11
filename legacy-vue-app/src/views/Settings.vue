<script setup lang="ts">
import { ref } from 'vue'
import { 
  Settings, 
  Bell, 
  ShieldCheck, 
  Sliders, 
  Monitor, 
  Mail, 
  Smartphone, 
  Check,
  ToggleLeft,
  ToggleRight,
  Key
} from 'lucide-vue-next'

const selectedTab = ref<'notifications' | 'career' | 'security'>('notifications')

// Notification states
const notifyMatches = ref(true)
const notifyMessages = ref(true)
const notifyDeadlines = ref(true)
const channelEmail = ref(true)
const channelSMS = ref(false)
const channelInApp = ref(true)

// Career states
const salaryExpectation = ref(45) // $45 / hr
const remoteAllowed = ref(true)
const hybridAllowed = ref(true)
const onsiteAllowed = ref(false)

// Security states
const twoFactor = ref(false)
const showSaveToast = ref(false)

const handleSaveSettings = () => {
  showSaveToast.value = true
  setTimeout(() => {
    showSaveToast.value = false
  }, 2500)
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-12">
    
    <!-- Page Header -->
    <div class="bg-gradient-to-r from-slate-50 to-slate-50 border border-brand-border rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-premium-sm">
      <div class="space-y-1">
        <h2 class="text-xl font-extrabold text-brand-textPrimary flex items-center gap-2">
          <Settings class="w-6 h-6 text-brand-textSecondary" /> Account Configurations & Settings
        </h2>
        <p class="text-brand-textSecondary text-xs font-semibold">
          Configure workspace theme modes, notification preferences, quiet hours, and 2FA authentication parameters.
        </p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-brand-border">
      <button 
        @click="selectedTab = 'notifications'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'notifications' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Notification Channels
      </button>
      <button 
        @click="selectedTab = 'career'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'career' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Workspace & Career
      </button>
      <button 
        @click="selectedTab = 'security'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'security' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Account Security
      </button>
    </div>

    <!-- Tab 1: Notifications -->
    <div v-if="selectedTab === 'notifications'" class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-6">
      
      <!-- Channels checklist -->
      <div class="space-y-4">
        <h3 class="text-xs font-extrabold text-brand-textPrimary border-b border-brand-border pb-3 flex items-center gap-2">
          <Bell class="w-4.5 h-4.5 text-brand-accent" /> Active Notification Mediums
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- In-App -->
          <label class="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 hover:border-brand-accent cursor-pointer">
            <span class="text-xs font-semibold text-brand-textPrimary flex items-center gap-1.5"><Monitor class="w-4 h-4 text-brand-textSecondary" /> In-App Alert</span>
            <input type="checkbox" v-model="channelInApp" class="rounded text-brand-accent focus:ring-brand-accent" />
          </label>
          <!-- Email -->
          <label class="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 hover:border-brand-accent cursor-pointer">
            <span class="text-xs font-semibold text-brand-textPrimary flex items-center gap-1.5"><Mail class="w-4 h-4 text-brand-textSecondary" /> Email Digest</span>
            <input type="checkbox" v-model="channelEmail" class="rounded text-brand-accent focus:ring-brand-accent" />
          </label>
          <!-- SMS -->
          <label class="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 hover:border-brand-accent cursor-pointer">
            <span class="text-xs font-semibold text-brand-textPrimary flex items-center gap-1.5"><Smartphone class="w-4 h-4 text-brand-textSecondary" /> Critical SMS</span>
            <input type="checkbox" v-model="channelSMS" class="rounded text-brand-accent focus:ring-brand-accent" />
          </label>
        </div>
      </div>

      <!-- Trigger Rules -->
      <div class="space-y-4">
        <h3 class="text-xs font-extrabold text-brand-textPrimary border-b border-brand-border pb-3">Trigger Rules</h3>
        
        <div class="space-y-3">
          <label class="flex items-center justify-between text-xs p-3 border rounded-xl hover:border-brand-accent cursor-pointer">
            <div>
              <span class="font-bold text-brand-textPrimary block">Opportunity Matches</span>
              <p class="text-[10px] text-brand-textSecondary mt-0.5">Alert me when a job matching my skills is posted.</p>
            </div>
            <input type="checkbox" v-model="notifyMatches" class="rounded text-brand-accent" />
          </label>

          <label class="flex items-center justify-between text-xs p-3 border rounded-xl hover:border-brand-accent cursor-pointer">
            <div>
              <span class="font-bold text-brand-textPrimary block">Direct Messages & Requests</span>
              <p class="text-[10px] text-brand-textSecondary mt-0.5">Send alerts for chats and connection requests.</p>
            </div>
            <input type="checkbox" v-model="notifyMessages" class="rounded text-brand-accent" />
          </label>

          <label class="flex items-center justify-between text-xs p-3 border rounded-xl hover:border-brand-accent cursor-pointer">
            <div>
              <span class="font-bold text-brand-textPrimary block">Milestones & Deadlines</span>
              <p class="text-[10px] text-brand-textSecondary mt-0.5">Warn me about academic schedules and exam times.</p>
            </div>
            <input type="checkbox" v-model="notifyDeadlines" class="rounded text-brand-accent" />
          </label>
        </div>
      </div>

      <div class="pt-2">
        <button 
          @click="handleSaveSettings"
          class="px-5 py-2.5 bg-brand-accent hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-premium transition-colors"
        >
          Save Notification Changes
        </button>
      </div>

    </div>

    <!-- Tab 2: Workspace & Career Settings -->
    <div v-if="selectedTab === 'career'" class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-6">
      
      <!-- Theme Selection -->
      <div class="space-y-2">
        <h3 class="text-xs font-extrabold text-brand-textPrimary border-b border-brand-border pb-3 flex items-center gap-2">
          <Monitor class="w-4.5 h-4.5 text-brand-accent" /> Workspace Themes
        </h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 border-2 border-brand-accent bg-white rounded-2xl text-center space-y-2">
            <span class="w-3.5 h-3.5 rounded-full bg-slate-200 border inline-block"></span>
            <span class="text-xs font-bold text-brand-textPrimary block">Light Mode (Active)</span>
          </div>

          <div class="p-4 border border-brand-border bg-slate-900 rounded-2xl text-center space-y-2 cursor-pointer hover:border-brand-accent">
            <span class="w-3.5 h-3.5 rounded-full bg-slate-800 border-slate-700 border inline-block"></span>
            <span class="text-xs font-bold text-slate-400 block">Dark Mode</span>
          </div>
        </div>
      </div>

      <!-- Salary sliders & checkboxes -->
      <div class="space-y-4">
        <h3 class="text-xs font-extrabold text-brand-textPrimary border-b border-brand-border pb-3 flex items-center gap-2">
          <Sliders class="w-4.5 h-4.5 text-brand-accent" /> Career Parameters
        </h3>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-brand-textSecondary">Minimum Hourly Rate Expectations</label>
            <span class="text-xs font-black text-brand-accent">${{ salaryExpectation }} / Hour</span>
          </div>
          <input 
            type="range" 
            min="20" 
            max="120" 
            step="5"
            v-model.number="salaryExpectation"
            class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
        </div>

        <div class="space-y-2">
          <span class="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">Office Locations Preference</span>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label class="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 cursor-pointer">
              <span class="text-xs font-semibold text-brand-textPrimary">Remote</span>
              <input type="checkbox" v-model="remoteAllowed" class="rounded text-brand-accent" />
            </label>
            <label class="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 cursor-pointer">
              <span class="text-xs font-semibold text-brand-textPrimary">Hybrid</span>
              <input type="checkbox" v-model="hybridAllowed" class="rounded text-brand-accent" />
            </label>
            <label class="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 cursor-pointer">
              <span class="text-xs font-semibold text-brand-textPrimary">On-site</span>
              <input type="checkbox" v-model="onsiteAllowed" class="rounded text-brand-accent" />
            </label>
          </div>
        </div>
      </div>

      <div class="pt-2">
        <button 
          @click="handleSaveSettings"
          class="px-5 py-2.5 bg-brand-accent hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-premium transition-colors"
        >
          Save Workspace Changes
        </button>
      </div>

    </div>

    <!-- Tab 3: Security -->
    <div v-if="selectedTab === 'security'" class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-6">
      
      <!-- 2FA toggle -->
      <div class="space-y-4">
        <h3 class="text-xs font-extrabold text-brand-textPrimary border-b border-brand-border pb-3 flex items-center gap-2">
          <ShieldCheck class="w-4.5 h-4.5 text-brand-accent" /> Authenticator Settings
        </h3>

        <div class="flex items-center justify-between p-4 border rounded-xl">
          <div class="space-y-0.5">
            <span class="text-xs font-bold text-brand-textPrimary block">Two-Factor Authentication (2FA)</span>
            <p class="text-[10px] text-brand-textSecondary">Secure login attempts with code alerts via SMS / email.</p>
          </div>
          
          <button 
            @click="twoFactor = !twoFactor"
            class="text-brand-textSecondary hover:text-brand-textPrimary focus:outline-none transition-colors"
            title="Toggle Two-factor"
          >
            <ToggleRight v-if="twoFactor" class="w-10 h-10 text-brand-success" />
            <ToggleLeft v-else class="w-10 h-10 text-slate-300" />
          </button>
        </div>
      </div>

      <!-- Active Sessions -->
      <div class="space-y-4">
        <h3 class="text-xs font-extrabold text-brand-textPrimary border-b border-brand-border pb-3 flex items-center gap-2">
          <Key class="w-4.5 h-4.5 text-brand-accent" /> Active Sessions Logs
        </h3>

        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 rounded-xl border border-dashed text-xs">
            <div class="space-y-0.5">
              <span class="font-bold text-brand-textPrimary block">Windows Laptop • Active Browser</span>
              <p class="text-[9px] text-brand-textSecondary">Austin, USA • IP: 192.168.1.48</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-50 text-brand-success uppercase border">Current Device</span>
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl border border-dashed text-xs">
            <div class="space-y-0.5">
              <span class="font-bold text-brand-textPrimary block">iPhone 14 Pro Max • App Client</span>
              <p class="text-[9px] text-brand-textSecondary">Austin, USA • IP: 192.168.1.92</p>
            </div>
            <button class="text-[9px] font-bold text-brand-danger hover:underline">Revoke Session</button>
          </div>
        </div>
      </div>

    </div>

    <!-- Notification Toast -->
    <div 
      v-if="showSaveToast" 
      class="fixed bottom-6 right-6 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-premium z-50 flex items-center gap-2 animate-fade"
    >
      <Check class="w-4 h-4" /> Account configurations saved!
    </div>

  </div>
</template>
