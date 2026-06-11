<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCoursesStore } from '../stores/courses'
import { useJobsStore } from '../stores/jobs'
import { 
  Sparkles, 
  ArrowRight, 
  Award, 
  Briefcase, 
  Users, 
  BookOpen, 
  Calendar, 
  UploadCloud 
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const coursesStore = useCoursesStore()
const jobsStore = useJobsStore()

const profile = computed(() => authStore.profile)

// Metric computations
const completedCoursesCount = computed(() => coursesStore.completedCourses.length)
const enrolledCoursesCount = computed(() => coursesStore.enrolledCourses.length)
const appliedJobsCount = computed(() => jobsStore.appliedJobs.length)
const savedJobsCount = computed(() => jobsStore.savedJobs.length)

// Mock notifications & deadlines
const deadlines = [
  { id: 'd1', title: 'TechVibe Internship Deadline', date: 'June 15, 2026', type: 'job' },
  { id: 'd2', title: 'Software Engineering Midterm Exam', date: 'June 18, 2026', type: 'academic' },
  { id: 'd3', title: 'Resume Review Consultation', date: 'June 22, 2026', type: 'mentorship' }
]

// AI recommendations list
const aiRecommendations = computed(() => {
  const recommendations = []
  
  if (!profile.value.resumeName) {
    recommendations.push({
      id: 'rec_resume',
      title: 'Upload your resume for AI Optimization',
      description: 'Get parsed keyphrase matches and custom ATS optimization suggestions immediately.',
      actionText: 'Upload Resume',
      actionPath: '/profile'
    })
  }

  // Suggest a programming course if not enrolled in Vue
  const vueCourse = coursesStore.courses.find(c => c.id === 'c1')
  if (vueCourse && !vueCourse.enrolled) {
    recommendations.push({
      id: 'rec_vue',
      title: 'Acquire intermediate Vue.js capabilities',
      description: 'Our AI Mentor suggests enrolling in "Advanced Vue 3 with Composition API" to match active Frontend Internships.',
      actionText: 'View Course',
      actionPath: '/courses'
    })
  }

  // General networking recommendation
  recommendations.push({
    id: 'rec_interview',
    title: 'Prepare for upcoming coding interviews',
    description: 'Start a simulated mock interview with Coach Alex on Technical Data Structures and Algorithms.',
    actionText: 'Start Interview',
    actionPath: '/mentor'
  })

  return recommendations
})

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Greeting & Quick Stats Banner -->
    <div class="bg-gradient-to-r from-sky-50 to-slate-50 border border-brand-border rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-premium-sm">
      <div class="space-y-1">
        <h2 class="text-2xl lg:text-3xl font-extrabold text-brand-textPrimary tracking-tight">
          Welcome back, {{ profile.firstName }}! 👋
        </h2>
        <p class="text-brand-textSecondary text-sm lg:text-base font-medium">
          Here is an overview of your academic and career goals. Let's make progress today.
        </p>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="navigateTo('/mentor')" 
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-sky-700 text-white font-bold text-sm shadow-premium transition-all duration-200"
        >
          <Sparkles class="w-4 h-4" /> Ask AI Mentor
        </button>
        <button 
          @click="navigateTo('/profile')" 
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-brand-border text-brand-textPrimary font-bold text-sm shadow-premium-sm transition-all duration-200"
        >
          <UploadCloud class="w-4 h-4 text-brand-textSecondary" /> Upload Resume
        </button>
      </div>
    </div>

    <!-- Core Metrics Dashboard Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Metric 1: Opportunities -->
      <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium flex items-center justify-between group hover:border-brand-accent transition-all duration-200">
        <div class="space-y-1">
          <span class="text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Applied Jobs</span>
          <h3 class="text-2xl font-black text-brand-textPrimary group-hover:text-brand-accent transition-colors">
            {{ appliedJobsCount }}
          </h3>
          <span class="text-[10px] text-brand-textSecondary font-semibold">
            {{ savedJobsCount }} opportunities saved
          </span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-sky-50 text-brand-accent flex items-center justify-center">
          <Briefcase class="w-6 h-6" />
        </div>
      </div>

      <!-- Metric 2: Skills Courses -->
      <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium flex items-center justify-between group hover:border-brand-accent transition-all duration-200">
        <div class="space-y-1">
          <span class="text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Courses Active</span>
          <h3 class="text-2xl font-black text-brand-textPrimary group-hover:text-brand-accent transition-colors">
            {{ enrolledCoursesCount }}
          </h3>
          <span class="text-[10px] text-brand-textSecondary font-semibold font-sans">
            {{ completedCoursesCount }} modules completed
          </span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-brand-success flex items-center justify-center">
          <BookOpen class="w-6 h-6" />
        </div>
      </div>

      <!-- Metric 3: Skills Complete -->
      <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium flex items-center justify-between group hover:border-brand-accent transition-all duration-200">
        <div class="space-y-1">
          <span class="text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Skills Portfolio</span>
          <h3 class="text-2xl font-black text-brand-textPrimary group-hover:text-brand-accent transition-colors">
            {{ profile.skills.length }}
          </h3>
          <span class="text-[10px] text-brand-textSecondary font-semibold">
            Targeting full-stack stack
          </span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-amber-50 text-brand-warning flex items-center justify-center">
          <Award class="w-6 h-6" />
        </div>
      </div>

      <!-- Metric 4: Connection Network -->
      <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium flex items-center justify-between group hover:border-brand-accent transition-all duration-200">
        <div class="space-y-1">
          <span class="text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Connections</span>
          <h3 class="text-2xl font-black text-brand-textPrimary group-hover:text-brand-accent transition-colors">
            28
          </h3>
          <span class="text-[10px] text-brand-textSecondary font-semibold">
            Nearby tech hubs active
          </span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Users class="w-6 h-6" />
        </div>
      </div>

    </div>

    <!-- Main Two-Column Content Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left 2/3 Content: AI Recommendations & Tasks -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Profile Completion Card -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-2">
              <span class="text-[10px] font-bold tracking-wider text-brand-accent bg-brand-accentLight px-2 py-0.5 rounded uppercase">Profile Score</span>
              <h3 class="text-lg font-bold text-brand-textPrimary">Complete your professional setup</h3>
              <p class="text-brand-textSecondary text-xs max-w-md">
                Completing your goals helps Alex tailor coding challenges, jobs, and learning paths specifically for you.
              </p>
            </div>
            
            <div class="flex items-center gap-4">
              <!-- Radial score -->
              <div class="relative flex items-center justify-center">
                <svg class="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="#e2e8f0" stroke-width="6" fill="transparent"/>
                  <circle cx="40" cy="40" r="34" stroke="#0284c7" stroke-width="6" fill="transparent"
                    :stroke-dasharray="2 * Math.PI * 34"
                    :stroke-dashoffset="2 * Math.PI * 34 * (1 - authStore.profileCompletionScore / 100)"
                  />
                </svg>
                <span class="absolute text-base font-black text-brand-textPrimary">
                  {{ authStore.profileCompletionScore }}%
                </span>
              </div>
              
              <button 
                @click="navigateTo('/profile')" 
                class="p-2 rounded-full border border-brand-border hover:border-brand-accent hover:text-brand-accent transition-colors"
                title="Edit Profile"
              >
                <ArrowRight class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- AI Coach Advisor Card -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-brand-textPrimary flex items-center gap-2 font-sans">
              <Sparkles class="w-5 h-5 text-brand-accent animate-pulse" /> Personalized AI Recommendations
            </h3>
            <span class="text-xs text-brand-textSecondary font-semibold">Real-time Feed</span>
          </div>

          <div class="space-y-3">
            <div 
              v-for="rec in aiRecommendations" 
              :key="rec.id"
              class="bg-brand-cardBg border border-brand-border rounded-xl p-5 shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-premium-hover transition-all duration-200"
            >
              <div class="space-y-1">
                <h4 class="text-sm font-bold text-brand-textPrimary flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                  {{ rec.title }}
                </h4>
                <p class="text-xs text-brand-textSecondary pl-3 max-w-lg leading-relaxed">
                  {{ rec.description }}
                </p>
              </div>
              
              <button 
                @click="navigateTo(rec.actionPath)"
                class="px-4 py-2 text-xs font-bold bg-brand-accentLight text-brand-accent hover:bg-brand-accent hover:text-white rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
              >
                {{ rec.actionText }} <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Right 1/3 Content: Deadlines & Activity logs -->
      <div class="space-y-6">
        
        <!-- Deadlines Widget -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4">
          <div class="flex items-center gap-2 border-b border-brand-border pb-3">
            <Calendar class="w-5 h-5 text-brand-accent" />
            <h3 class="text-sm font-bold text-brand-textPrimary">Upcoming Deadlines</h3>
            <span class="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-brand-textSecondary">
              {{ deadlines.length }} Total
            </span>
          </div>

          <div class="space-y-3">
            <div 
              v-for="dl in deadlines" 
              :key="dl.id" 
              class="flex items-start gap-3 p-2.5 rounded-xl border border-dashed border-brand-border hover:border-brand-accent transition-colors"
            >
              <div class="w-2.5 h-2.5 rounded-full mt-1.5 bg-brand-accent flex-shrink-0" :class="[dl.type === 'academic' ? 'bg-amber-500' : dl.type === 'mentorship' ? 'bg-emerald-500' : 'bg-brand-accent']"></div>
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-brand-textPrimary leading-tight">{{ dl.title }}</span>
                <p class="text-[10px] text-brand-textSecondary font-semibold">{{ dl.date }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities list -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4">
          <div class="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 class="text-sm font-bold text-brand-textPrimary">Recent Activity</h3>
          </div>

          <div class="space-y-4 relative before:absolute before:inset-y-1 before:left-[11px] before:w-0.5 before:bg-slate-100">
            <!-- Item 1 -->
            <div class="flex items-start gap-4 relative">
              <div class="w-6 h-6 rounded-full bg-emerald-50 text-brand-success border border-brand-border flex items-center justify-center text-[10px] font-bold z-10 flex-shrink-0">
                ✓
              </div>
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-brand-textPrimary">Completed Docker Course</span>
                <p class="text-[10px] text-brand-textSecondary font-semibold">Earned Digital Certificate • 2 days ago</p>
              </div>
            </div>
            
            <!-- Item 2 -->
            <div class="flex items-start gap-4 relative">
              <div class="w-6 h-6 rounded-full bg-sky-50 text-brand-accent border border-brand-border flex items-center justify-center text-[10px] font-bold z-10 flex-shrink-0">
                💬
              </div>
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-brand-textPrimary">Chat Session with Alex</span>
                <p class="text-[10px] text-brand-textSecondary font-semibold">Discussed Front-end Interview Prep • 4 days ago</p>
              </div>
            </div>

            <!-- Item 3 -->
            <div class="flex items-start gap-4 relative">
              <div class="w-6 h-6 rounded-full bg-slate-50 text-brand-textSecondary border border-brand-border flex items-center justify-center text-[10px] font-bold z-10 flex-shrink-0">
                ➔
              </div>
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-brand-textPrimary">Applied to CoreFlow Tech</span>
                <p class="text-[10px] text-brand-textSecondary font-semibold">Resume tailored with AI review • May 28, 2026</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>
