<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  UserCircle, 
  BookOpen, 
  Sparkles, 
  Trash2, 
  Plus, 
  UploadCloud, 
  Check, 
  Link as LinkIcon, 
  Github, 
  Linkedin,
  FileText
} from 'lucide-vue-next'

const authStore = useAuthStore()

const profile = ref({ ...authStore.profile })
const newSkill = ref('')
const showSaveToast = ref(false)
const isOptimizingResume = ref(false)
const optimizationScore = ref<number | null>(null)
const optimizationReport = ref<string[]>([])
const dragover = ref(false)

const recommendedSkills = ['TypeScript', 'Vue.js', 'Pinia', 'Docker', 'Python', 'SQL', 'Git', 'Machine Learning']

const missingRecommendedSkills = computed(() => {
  return recommendedSkills.filter(s => !profile.value.skills.includes(s))
})

const handleSaveProfile = () => {
  authStore.updateProfile(profile.value)
  showSaveToast.value = true
  setTimeout(() => {
    showSaveToast.value = false
  }, 3000)
}

const handleAddSkill = () => {
  const trimmed = newSkill.value.trim()
  if (trimmed && !profile.value.skills.includes(trimmed)) {
    profile.value.skills.push(trimmed)
    newSkill.value = ''
    authStore.updateProfile(profile.value)
  }
}

const addSuggestedSkill = (skill: string) => {
  if (!profile.value.skills.includes(skill)) {
    profile.value.skills.push(skill)
    authStore.updateProfile(profile.value)
  }
}

const handleRemoveSkill = (index: number) => {
  profile.value.skills.splice(index, 1)
  authStore.updateProfile(profile.value)
}

// Drag & Drop resume upload handlers
const onFileDrop = (e: DragEvent) => {
  dragover.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0]
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      authStore.uploadResume(file.name)
      profile.value.resumeName = file.name
      profile.value.resumeUploadedAt = new Date().toLocaleDateString()
      triggerResumeReview()
    } else {
      alert('Only PDF documents are supported for resume optimization.')
    }
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    authStore.uploadResume(file.name)
    profile.value.resumeName = file.name
    profile.value.resumeUploadedAt = new Date().toLocaleDateString()
    triggerResumeReview()
  }
}

const handleDeleteResume = () => {
  authStore.deleteResume()
  profile.value.resumeName = ''
  profile.value.resumeUploadedAt = null
  optimizationScore.value = null
  optimizationReport.value = []
}

// Simulate ATS resume parsing/optimization
const triggerResumeReview = () => {
  isOptimizingResume.value = ref(true).value
  optimizationScore.value = null
  optimizationReport.value = []
  
  setTimeout(() => {
    isOptimizingResume.value = false
    optimizationScore.value = 85
    optimizationReport.value = [
      '✅ Contact details extracted correctly.',
      '✅ Profile summary has solid keywords (Frontend, Software Developer).',
      '⚠️ Missing metrics: Quantify experiences (e.g. write "improved performance by 15%").',
      '⚠️ Add core keywords: "Pinia", "State Management", "CI/CD" to pass automated ATS filters.',
      '💡 Suggestion: Link your portfolio website to the resume header.'
    ]
  }, 2500)
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-12">
    
    <!-- Profile Completion Score Header -->
    <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-4">
        <div class="relative w-16 h-16 rounded-full overflow-hidden border border-brand-border flex-shrink-0">
          <img :src="profile.avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
        </div>
        <div>
          <h3 class="font-bold text-lg text-brand-textPrimary">{{ profile.firstName }} {{ profile.lastName }}</h3>
          <p class="text-xs text-brand-textSecondary">{{ profile.headline }}</p>
          <span class="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-brand-accent uppercase">
            {{ profile.degree }} Student
          </span>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="text-right">
          <span class="text-[10px] font-bold text-brand-textSecondary uppercase block">Profile Strength</span>
          <span class="text-2xl font-black text-brand-accent">{{ authStore.profileCompletionScore }}%</span>
        </div>
        <div class="w-24 bg-slate-100 rounded-full h-2">
          <div 
            class="bg-brand-accent h-2 rounded-full transition-all duration-500" 
            :style="{ width: authStore.profileCompletionScore + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Layout Grid: Left Settings Form, Right Resume & Skills -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Column 1 & 2: Main Info Edit Forms -->
      <div class="md:col-span-2 space-y-6">
        
        <!-- Form Details -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-5">
          <h3 class="text-sm font-bold text-brand-textPrimary border-b border-brand-border pb-3 flex items-center gap-2">
            <UserCircle class="w-4 h-4 text-brand-accent" /> Profile Details
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-brand-textSecondary">First Name</label>
              <input 
                type="text" 
                v-model="profile.firstName" 
                class="w-full border border-brand-border rounded-xl p-2.5 text-sm bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-brand-textSecondary">Last Name</label>
              <input 
                type="text" 
                v-model="profile.lastName" 
                class="w-full border border-brand-border rounded-xl p-2.5 text-sm bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-brand-textSecondary">Headline</label>
            <input 
              type="text" 
              v-model="profile.headline" 
              class="w-full border border-brand-border rounded-xl p-2.5 text-sm bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-brand-textSecondary">About Me (Bio)</label>
            <textarea 
              v-model="profile.bio" 
              rows="3"
              class="w-full border border-brand-border rounded-xl p-2.5 text-sm bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white resize-none"
            ></textarea>
          </div>

          <h3 class="text-sm font-bold text-brand-textPrimary border-b border-brand-border pb-3 pt-2 flex items-center gap-2">
            <BookOpen class="w-4 h-4 text-brand-accent" /> Education & Goals
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-brand-textSecondary">College</label>
              <input 
                type="text" 
                v-model="profile.college" 
                class="w-full border border-brand-border rounded-xl p-2.5 text-sm bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-brand-textSecondary">Degree / Program</label>
              <input 
                type="text" 
                v-model="profile.degree" 
                class="w-full border border-brand-border rounded-xl p-2.5 text-sm bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-brand-textSecondary">Academic Major</label>
              <input 
                type="text" 
                v-model="profile.major" 
                class="w-full border border-brand-border rounded-xl p-2.5 text-sm bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-brand-textSecondary">Graduation Year</label>
              <input 
                type="number" 
                v-model="profile.graduationYear" 
                class="w-full border border-brand-border rounded-xl p-2.5 text-sm bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-brand-textSecondary">Career Intentions & Milestones</label>
            <textarea 
              v-model="profile.careerGoals" 
              rows="3"
              class="w-full border border-brand-border rounded-xl p-2.5 text-sm bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white resize-none"
            ></textarea>
          </div>

          <!-- Professional Links -->
          <h3 class="text-sm font-bold text-brand-textPrimary border-b border-brand-border pb-3 pt-2 flex items-center gap-2">
            <LinkIcon class="w-4 h-4 text-brand-accent" /> Portfolios & Social Accounts
          </h3>

          <div class="space-y-3">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon class="w-4 h-4 text-brand-textSecondary" />
              </span>
              <input 
                type="text" 
                v-model="profile.portfolioLink" 
                placeholder="Portfolio Link"
                class="w-full pl-9 pr-4 py-2.5 text-sm border border-brand-border rounded-xl bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
              />
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Github class="w-4 h-4 text-brand-textSecondary" />
              </span>
              <input 
                type="text" 
                v-model="profile.githubProfile" 
                placeholder="GitHub Link"
                class="w-full pl-9 pr-4 py-2.5 text-sm border border-brand-border rounded-xl bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
              />
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Linkedin class="w-4 h-4 text-brand-textSecondary" />
              </span>
              <input 
                type="text" 
                v-model="profile.linkedinProfile" 
                placeholder="LinkedIn Profile"
                class="w-full pl-9 pr-4 py-2.5 text-sm border border-brand-border rounded-xl bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
              />
            </div>
          </div>

          <div class="pt-2">
            <button 
              @click="handleSaveProfile"
              class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-sky-700 text-white font-bold text-sm shadow-premium transition-all duration-200"
            >
              Save Profile Changes
            </button>
          </div>
        </div>

      </div>

      <!-- Column 3: Resume Reviewer & Skills Checker -->
      <div class="space-y-6">
        
        <!-- Resume Upload/Optimization Block -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4">
          <h3 class="text-sm font-bold text-brand-textPrimary flex items-center gap-2">
            <FileText class="w-4.5 h-4.5 text-brand-accent" /> ATS Resume Reviewer
          </h3>
          
          <!-- Drop zone -->
          <div 
            v-if="!profile.resumeName"
            class="border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 relative group cursor-pointer"
            :class="[dragover ? 'border-brand-accent bg-sky-50/20' : 'border-brand-border hover:border-brand-accent']"
            @dragover.prevent="dragover = true"
            @dragleave.prevent="dragover = false"
            @drop.prevent="onFileDrop"
          >
            <input 
              type="file" 
              accept=".pdf" 
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              @change="handleFileSelect"
            />
            <UploadCloud class="w-10 h-10 text-brand-textSecondary mx-auto group-hover:scale-105 transition-transform" />
            <span class="text-xs font-bold text-brand-textPrimary block mt-3">Upload PDF Resume</span>
            <span class="text-[10px] text-brand-textSecondary mt-1 block">Drag and drop here, or browse</span>
          </div>

          <!-- Active PDF details -->
          <div v-else class="space-y-3">
            <div class="p-3 bg-brand-secBg rounded-xl border border-brand-border flex items-center justify-between">
              <div class="flex items-center gap-2.5 overflow-hidden">
                <div class="w-8 h-8 bg-red-50 text-brand-danger rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0">
                  PDF
                </div>
                <div class="overflow-hidden">
                  <span class="text-xs font-bold text-brand-textPrimary block truncate">{{ profile.resumeName }}</span>
                  <span class="text-[9px] text-brand-textSecondary block">Uploaded: {{ profile.resumeUploadedAt }}</span>
                </div>
              </div>
              
              <button 
                @click="handleDeleteResume" 
                class="p-1.5 rounded-lg text-brand-textSecondary hover:text-brand-danger hover:bg-red-50 transition-colors"
                title="Remove Resume"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Optimization Loader -->
            <div v-if="isOptimizingResume" class="space-y-2 py-2">
              <div class="flex items-center justify-between text-xs font-semibold text-brand-textSecondary">
                <span class="flex items-center gap-1.5"><Sparkles class="w-3.5 h-3.5 text-brand-accent animate-spin" /> Scanning keywords...</span>
              </div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div class="shimmer-loader h-full w-full"></div>
              </div>
            </div>

            <!-- Results -->
            <div v-else-if="optimizationScore !== null" class="space-y-3 pt-2">
              <div class="flex items-center justify-between border-t border-brand-border pt-3">
                <span class="text-xs font-bold text-brand-textPrimary">ATS Score:</span>
                <span class="text-sm font-black text-brand-accent">{{ optimizationScore }}/100</span>
              </div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <div 
                  v-for="(tip, idx) in optimizationReport" 
                  :key="idx" 
                  class="text-[10px] leading-relaxed text-brand-textSecondary border border-slate-100 p-1.5 rounded-lg bg-slate-50/50"
                >
                  {{ tip }}
                </div>
              </div>
            </div>
            
            <button 
              v-else 
              @click="triggerResumeReview" 
              class="w-full py-2 bg-brand-accentLight text-brand-accent hover:bg-brand-accent hover:text-white rounded-xl text-xs font-bold transition-colors"
            >
              Analyze ATS Match
            </button>
          </div>
        </div>

        <!-- Skills Checklist Widget -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4">
          <h3 class="text-sm font-bold text-brand-textPrimary">Skills Inventory</h3>
          
          <!-- Input -->
          <div class="flex gap-2">
            <input 
              type="text" 
              v-model="newSkill"
              placeholder="Add skill..."
              @keyup.enter="handleAddSkill"
              class="flex-1 px-3 py-1.5 border border-brand-border rounded-xl text-xs bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
            />
            <button 
              @click="handleAddSkill"
              class="p-2 rounded-xl bg-brand-accent hover:bg-sky-700 text-white flex items-center justify-center shadow-sm"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>

          <!-- Active Skills List -->
          <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 py-1">
            <span 
              v-for="(skill, index) in profile.skills" 
              :key="index"
              class="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-brand-textPrimary border border-brand-border"
            >
              {{ skill }}
              <button 
                @click="handleRemoveSkill(index)" 
                class="hover:text-brand-danger text-brand-textSecondary hover:bg-slate-200 rounded-full p-0.5"
              >
                <Trash2 class="w-2.5 h-2.5" />
              </button>
            </span>
          </div>

          <!-- Recommended Skills -->
          <div class="space-y-2 border-t border-brand-border pt-4">
            <span class="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">Recommended Skills</span>
            <div class="flex flex-wrap gap-1">
              <button 
                v-for="s in missingRecommendedSkills" 
                :key="s"
                @click="addSuggestedSkill(s)"
                class="px-2 py-1 rounded-lg text-[9px] font-bold bg-sky-50 text-brand-accent hover:bg-brand-accent hover:text-white border border-dashed border-sky-200 transition-colors flex items-center gap-0.5"
              >
                + {{ s }}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Notification Toast -->
    <div 
      v-if="showSaveToast" 
      class="fixed bottom-6 right-6 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-premium z-50 flex items-center gap-2 animate-fade"
    >
      <Check class="w-4 h-4" /> Profile saved successfully!
    </div>

  </div>
</template>
