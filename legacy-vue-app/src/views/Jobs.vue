<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJobsStore } from '../stores/jobs'
import type { Job } from '../stores/jobs'
import { useAuthStore } from '../stores/auth'
import { 
  Briefcase, 
  Search, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Trash2
} from 'lucide-vue-next'

const jobsStore = useJobsStore()
const authStore = useAuthStore()

const searchInput = ref('')
const selectedType = ref<string>('All')
const selectedTab = ref<'all' | 'saved' | 'applied'>('all')

const jobTypes = ['All', 'Internship', 'Full-time', 'Fellowship']

// Filter opportunities
const filteredJobs = computed(() => {
  return jobsStore.jobs.filter(job => {
    // Search query matches
    const matchesSearch = 
      job.title.toLowerCase().includes(searchInput.value.toLowerCase()) || 
      job.companyName.toLowerCase().includes(searchInput.value.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchInput.value.toLowerCase()))

    // Type matches
    const matchesType = 
      selectedType.value === 'All' || 
      job.opportunityType === selectedType.value

    // Tabs matches
    if (selectedTab.value === 'saved') {
      return matchesSearch && matchesType && job.status === 'Saved'
    } else if (selectedTab.value === 'applied') {
      return matchesSearch && matchesType && job.status !== 'None' && job.status !== 'Saved'
    }
    
    return matchesSearch && matchesType
  })
})

// Calculate simulated match percentage based on matching skills
const getMatchScore = (jobRequirements: string[]) => {
  const userSkills = authStore.profile.skills
  const matches = jobRequirements.filter(skill => userSkills.includes(skill))
  const score = Math.round((matches.length / jobRequirements.length) * 100)
  return isNaN(score) ? 50 : Math.max(30, score) // Ensure a baseline score
}

const getMatchColor = (score: number) => {
  if (score >= 80) return 'text-brand-success bg-emerald-50'
  if (score >= 50) return 'text-brand-warning bg-amber-50'
  return 'text-brand-textSecondary bg-slate-100'
}

const handleBookmarkToggle = (job: Job) => {
  if (job.status === 'Saved') {
    jobsStore.updateStatus(job.id, 'None')
  } else if (job.status === 'None') {
    jobsStore.saveJob(job.id)
  }
}

const handleStatusAdvance = (jobId: string, currentStatus: Job['status']) => {
  let nextStatus: Job['status'] = 'Applied'
  if (currentStatus === 'Applied') nextStatus = 'Interview'
  else if (currentStatus === 'Interview') nextStatus = 'Offer'
  else if (currentStatus === 'Offer') nextStatus = 'None'

  jobsStore.updateStatus(jobId, nextStatus)
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Page Header Banner -->
    <div class="bg-gradient-to-r from-sky-50 to-slate-50 border border-brand-border rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-premium-sm">
      <div class="space-y-1">
        <h2 class="text-xl font-extrabold text-brand-textPrimary flex items-center gap-2">
          <Briefcase class="w-6 h-6 text-brand-accent" /> Opportunities Board
        </h2>
        <p class="text-brand-textSecondary text-xs font-semibold">
          Discover jobs, internships, and research fellowships. Tailor your resume to fit high-probability match recommendations.
        </p>
      </div>

      <div class="flex items-center gap-3 bg-white px-4 py-2 border border-brand-border rounded-xl shadow-premium-sm">
        <CheckCircle2 class="w-5 h-5 text-brand-success" />
        <div class="text-left">
          <span class="text-[9px] font-bold text-brand-textSecondary uppercase block">Applications</span>
          <span class="text-xs font-black text-brand-textPrimary">{{ jobsStore.appliedJobs.length }} Tracked</span>
        </div>
      </div>
    </div>

    <!-- Opportunities Hub Navigation Tabs -->
    <div class="flex border-b border-brand-border">
      <button 
        @click="selectedTab = 'all'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'all' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        All Opportunities
      </button>
      <button 
        @click="selectedTab = 'saved'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'saved' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Bookmarked ({{ jobsStore.savedJobs.length }})
      </button>
      <button 
        @click="selectedTab = 'applied'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'applied' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Applied Tracking ({{ jobsStore.appliedJobs.length }})
      </button>
    </div>

    <!-- Search Controls Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative w-full md:w-80">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="w-4 h-4 text-brand-textSecondary" />
        </span>
        <input 
          type="text" 
          v-model="searchInput"
          placeholder="Search company, title, keywords..."
          class="w-full pl-9 pr-4 py-2 text-xs border border-brand-border rounded-xl bg-white text-brand-textPrimary placeholder-brand-textSecondary focus:outline-none focus:border-brand-accent shadow-premium-sm"
        />
      </div>

      <!-- Type filter pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
        <button 
          v-for="t in jobTypes" 
          :key="t"
          @click="selectedType = t"
          class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border border-brand-border"
          :class="[
            selectedType === t 
              ? 'bg-brand-textPrimary text-white border-brand-textPrimary shadow-premium-sm' 
              : 'bg-white hover:bg-slate-50 text-brand-textSecondary'
          ]"
        >
          {{ t }}
        </button>
      </div>
    </div>

    <!-- Active List -->
    <div class="space-y-4">
      <div 
        v-for="job in filteredJobs" 
        :key="job.id"
        class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-premium-hover hover:border-brand-accent transition-all duration-300"
      >
        
        <!-- Job Meta Details -->
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-slate-50 border border-brand-border rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {{ job.companyLogo }}
          </div>
          
          <div class="space-y-1.5 overflow-hidden">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm font-extrabold text-brand-textPrimary truncate leading-snug">
                {{ job.title }}
              </h3>
              
              <!-- Job type badge -->
              <span class="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-brand-textSecondary uppercase border">
                {{ job.opportunityType }}
              </span>

              <!-- Matching score indicator -->
              <span 
                class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5"
                :class="getMatchColor(getMatchScore(job.requirements))"
              >
                <Sparkles class="w-2.5 h-2.5" /> {{ getMatchScore(job.requirements) }}% Match
              </span>
            </div>
            
            <p class="text-xs text-brand-textSecondary font-semibold">
              {{ job.companyName }}
            </p>

            <div class="flex items-center gap-4 text-[10px] text-brand-textSecondary font-medium flex-wrap pt-0.5">
              <span class="flex items-center gap-1">
                <MapPin class="w-3.5 h-3.5" /> {{ job.location }} {{ job.remote ? '(Remote)' : '' }}
              </span>
              <span class="flex items-center gap-1">
                <DollarSign class="w-3.5 h-3.5" /> {{ job.salaryRange }}
              </span>
              <span v-if="job.appliedAt" class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" /> Applied on: {{ job.appliedAt }}
              </span>
            </div>
          </div>
        </div>

        <!-- Requirements Tag list -->
        <div class="hidden xl:flex flex-wrap gap-1 max-w-xs">
          <span 
            v-for="req in job.requirements" 
            :key="req"
            class="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-50 text-brand-textSecondary border"
          >
            {{ req }}
          </span>
        </div>

        <!-- Right Side: Pipeline Stepper OR Application action triggers -->
        <div class="flex items-center justify-between sm:justify-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-dashed border-brand-border">
          
          <!-- Stepper view if applied -->
          <div 
            v-if="job.status !== 'None' && job.status !== 'Saved'"
            class="flex items-center gap-2"
          >
            <!-- Stepper indicators -->
            <button 
              @click="handleStatusAdvance(job.id, job.status)"
              class="px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-1"
              :class="[
                job.status === 'Applied' ? 'bg-sky-50 text-brand-accent border-sky-100' :
                job.status === 'Interview' ? 'bg-amber-50 text-brand-warning border-amber-100' :
                job.status === 'Offer' ? 'bg-emerald-50 text-brand-success border-emerald-100' : 
                'bg-red-50 text-brand-danger border-red-100'
              ]"
            >
              Stage: {{ job.status }} <ArrowRight class="w-3 h-3" />
            </button>
          </div>

          <!-- Application control buttons -->
          <div class="flex items-center gap-2">
            <!-- Bookmark -->
            <button 
              v-if="job.status === 'None' || job.status === 'Saved'"
              @click="handleBookmarkToggle(job)"
              class="p-2.5 rounded-xl border border-brand-border hover:border-brand-accent hover:text-brand-accent text-brand-textSecondary transition-colors"
              title="Bookmark Opportunity"
            >
              <BookmarkCheck v-if="job.status === 'Saved'" class="w-4 h-4 text-brand-accent" />
              <Bookmark v-else class="w-4 h-4" />
            </button>

            <!-- Apply -->
            <button 
              v-if="job.status === 'None' || job.status === 'Saved'"
              @click="jobsStore.applyJob(job.id)"
              class="px-4 py-2 bg-brand-accent text-white font-bold text-xs rounded-xl shadow-premium hover:bg-sky-700 transition-colors flex items-center gap-1"
            >
              Apply <ArrowRight class="w-3.5 h-3.5" />
            </button>
            
            <!-- Delete application tracker -->
            <button 
              v-else 
              @click="jobsStore.updateStatus(job.id, 'None')"
              class="p-2 rounded-xl text-brand-textSecondary hover:text-brand-danger hover:bg-red-50 transition-colors"
              title="Withdraw application tracking"
            >
              <Trash2 class="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

      </div>
    </div>

    <!-- Empty search list state -->
    <div 
      v-if="filteredJobs.length === 0" 
      class="text-center py-20 bg-brand-cardBg border border-brand-border border-dashed rounded-3xl"
    >
      <Briefcase class="w-10 h-10 text-brand-textSecondary mx-auto opacity-40" />
      <h3 class="font-bold text-sm text-brand-textPrimary mt-3">No opportunities match</h3>
      <p class="text-xs text-brand-textSecondary mt-1">Try adapting your filters or searching another keyword.</p>
    </div>

  </div>
</template>
