<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCoursesStore } from '../stores/courses'
import { useAuthStore } from '../stores/auth'
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Award,
  ArrowRight,
  Clock,
  Calendar,
  CheckSquare,
  Square,
  TrendingUp,
  Lock,
  Compass
} from 'lucide-vue-next'

const coursesStore = useCoursesStore()
const authStore = useAuthStore()

// Navigation Tabs
const selectedTab = ref<'library' | 'planner' | 'roadmap'>('library')

// Library tab states
const searchInput = ref('')
const selectedCategory = ref<string>('All')
const categories = ['All', 'Programming', 'Data Science & AI', 'System Design', 'Cloud & DevOps', 'Soft Skills']

// Study Planner states
const studyTimeGoal = ref(15) // 15 hours goal
const studyLogs = ref([
  { id: 'l1', courseId: 'c5', courseTitle: 'Docker & Kubernetes for Modern Developers', duration: 2.0, topic: 'Container networking, port configurations, and Docker Compose testing', date: 'Yesterday' },
  { id: 'l2', courseId: 'c2', courseTitle: 'Data Structures & Algorithms in Python', duration: 1.5, topic: 'Solved 3 BFS/DFS binary tree path challenges', date: '2 days ago' }
])

const weeklyGoals = ref([
  { id: 'g1', text: 'Enrolled Vue course: complete Chapter 2 (Pinia)', completed: false },
  { id: 'g2', text: 'Solve 5 Dynamic Programming exercises on arrays', completed: true },
  { id: 'g3', text: 'Docker & K8s: deploy simple containerized mock backend', completed: true }
])

const selectedCourseLog = ref('c1')
const sessionDuration = ref(1)
const sessionTopic = ref('')
const newGoalText = ref('')
const showLogToast = ref(false)

// Skill Roadmap states
const selectedRoadmap = ref<'frontend' | 'backend' | 'datascience'>('frontend')
const activeNodeIndex = ref(1) // Default to Framework node

interface RoadmapNode {
  title: string
  status: 'Completed' | 'In Progress' | 'Locked'
  skills: string[]
  courses: { id: string; title: string }[]
  outcome: string
  description: string
}

const roadmaps = computed<Record<'frontend' | 'backend' | 'datascience', RoadmapNode[]>>(() => {
  const userSkills = authStore.profile.skills
  
  // Dynamic status evaluation helper
  const getStatus = (reqSkills: string[], activeCourseId?: string) => {
    const hasAll = reqSkills.every(s => userSkills.includes(s))
    if (hasAll) return 'Completed'
    if (activeCourseId) {
      const course = coursesStore.courses.find(c => c.id === activeCourseId)
      if (course && course.enrolled && !course.completed) return 'In Progress'
    }
    return 'Locked'
  }

  return {
    frontend: [
      {
        title: 'Web Fundamentals',
        status: getStatus(['JavaScript', 'HTML/CSS']),
        skills: ['HTML/CSS', 'JavaScript'],
        courses: [],
        outcome: 'Junior Frontend Developer, Web Publisher',
        description: 'Establish standard DOM layout manipulation, semantic markup structures, and responsive CSS styling capabilities.',
      },
      {
        title: 'Framework Mastery',
        status: getStatus(['Vue.js', 'TypeScript'], 'c1'),
        skills: ['Vue.js', 'TypeScript'],
        courses: [{ id: 'c1', title: 'Advanced Vue 3 with Composition API' }],
        outcome: 'Frontend Engineer, UI Developer',
        description: 'Understand reactive rendering loops, component lifecycle hooks, component reusability structures, and TypeScript bindings.',
      },
      {
        title: 'State Architecture',
        status: getStatus(['State Management']),
        skills: ['State Management'],
        courses: [{ id: 'c1', title: 'Advanced Vue 3 with Composition API' }],
        outcome: 'Senior Frontend Architect',
        description: 'Manage complex data pipelines across nested routers, handle global state synchronization, and implement local caching.',
      },
      {
        title: 'Container Deployment',
        status: getStatus(['Docker', 'CI/CD'], 'c5'),
        skills: ['Docker', 'CI/CD'],
        courses: [{ id: 'c5', title: 'Docker & Kubernetes for Modern Developers' }],
        outcome: 'Full-stack Developer, Release Engineer',
        description: 'Containerize client runtimes, configure build system pipelines, and optimize production bundle delivery.',
      }
    ],
    backend: [
      {
        title: 'Core Programming',
        status: getStatus(['Python', 'DSA'], 'c2'),
        skills: ['Python', 'DSA'],
        courses: [{ id: 'c2', title: 'Data Structures & Algorithms in Python' }],
        outcome: 'Backend Engineer, Logic Developer',
        description: 'Deep-dive into complexity constraints, algorithm configurations, and server scripts in Python or Go.',
      },
      {
        title: 'Infrastructure & Containers',
        status: getStatus(['Docker', 'Kubernetes']),
        skills: ['Docker', 'Kubernetes'],
        courses: [{ id: 'c5', title: 'Docker & Kubernetes for Modern Developers' }],
        outcome: 'DevOps Engineer, Infrastructure Architect',
        description: 'Deploy stateless microservices across clusters, setup configuration secrets, and manage pod failovers.',
      },
      {
        title: 'System Design',
        status: getStatus(['System Design', 'Software Architecture']),
        skills: ['System Design', 'Software Architecture'],
        courses: [{ id: 'c4', title: 'System Design Fundamentals for Scalable Apps' }],
        outcome: 'Systems Architect, Backend Lead',
        description: 'Establish caching directories, configure load balancers, and structure SQL/NoSQL replication models.',
      }
    ],
    datascience: [
      {
        title: 'Coding Foundations',
        status: getStatus(['Python']),
        skills: ['Python'],
        courses: [{ id: 'c2', title: 'Data Structures & Algorithms in Python' }],
        outcome: 'Data Analyst, scripting assistant',
        description: 'Basic database operations, dataset file manipulations, and logic pipelines.',
      },
      {
        title: 'Machine Learning modeler',
        status: getStatus(['Machine Learning'], 'c3'),
        skills: ['Python', 'Machine Learning'],
        courses: [{ id: 'c3', title: 'Introduction to Machine Learning & Neural Networks' }],
        outcome: 'ML Engineer, Data Scientist',
        description: 'Configure regression parameters, manage classification algorithms, and structure neural networks.',
      }
    ]
  }
})

const activeNodeDetails = computed(() => {
  const activeRoadmap = roadmaps.value[selectedRoadmap.value]
  return activeRoadmap[activeNodeIndex.value] || activeRoadmap[0]
})

// Filter courses
const filteredCourses = computed(() => {
  return coursesStore.courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchInput.value.toLowerCase()) || 
      course.description.toLowerCase().includes(searchInput.value.toLowerCase())
    
    const matchesCategory = 
      selectedCategory.value === 'All' || 
      course.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

// Simulated progress incremental booster
const handleStudyIncrement = (courseId: string) => {
  const course = coursesStore.courses.find(c => c.id === courseId)
  if (course && course.enrolled && !course.completed) {
    const nextProgress = course.progress + 15
    coursesStore.updateProgress(courseId, nextProgress)
    
    // Proactively add skills to authStore if completed
    if (nextProgress >= 100) {
      course.skills.forEach(skill => {
        authStore.addSkill(skill)
      })
    }
  }
}

// Log study hours action
const handleAddStudyLog = () => {
  const course = coursesStore.courses.find(c => c.id === selectedCourseLog.value)
  if (!course || sessionDuration.value <= 0) return

  studyLogs.value.unshift({
    id: 'l_' + Date.now(),
    courseId: course.id,
    courseTitle: course.title,
    duration: Number(sessionDuration.value),
    topic: sessionTopic.value.trim() || 'Reviewed core concepts and completed practical coding labs',
    date: 'Today'
  })

  // Increment course progress as well
  if (course.enrolled && !course.completed) {
    const progressAdd = Math.round((sessionDuration.value / course.durationHours) * 100)
    const nextProgress = Math.min(100, course.progress + Math.max(10, progressAdd))
    coursesStore.updateProgress(course.id, nextProgress)
    
    if (nextProgress >= 100) {
      course.skills.forEach(skill => {
        authStore.addSkill(skill)
      })
    }
  }

  sessionTopic.value = ''
  sessionDuration.value = 1
  showLogToast.value = true
  setTimeout(() => {
    showLogToast.value = false
  }, 2000)
}

// Goals managers
const handleToggleGoal = (goalId: string) => {
  const goal = weeklyGoals.value.find(g => g.id === goalId)
  if (goal) goal.completed = !goal.completed
}

const handleAddGoal = () => {
  if (!newGoalText.value.trim()) return
  weeklyGoals.value.push({
    id: 'g_' + Date.now(),
    text: newGoalText.value.trim(),
    completed: false
  })
  newGoalText.value = ''
}

const totalLoggedHours = computed(() => {
  return studyLogs.value.reduce((sum, log) => sum + log.duration, 0)
})

const studyGoalProgress = computed(() => {
  return Math.min(100, Math.round((totalLoggedHours.value / studyTimeGoal.value) * 100))
})
</script>

<template>
  <div class="space-y-6">
    
    <!-- Page Header Banner -->
    <div class="bg-gradient-to-r from-emerald-50 to-slate-50 border border-brand-border rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-premium-sm">
      <div class="space-y-1">
        <h2 class="text-xl font-extrabold text-brand-textPrimary flex items-center gap-2">
          <BookOpen class="w-6 h-6 text-brand-success" /> Skills & Course Library
        </h2>
        <p class="text-brand-textSecondary text-xs font-semibold">
          Expand your engineering skillset, plan study routines, and track career roadmap tracks to direct internship qualifications.
        </p>
      </div>

      <div class="flex items-center gap-3 bg-white px-4 py-2 border border-brand-border rounded-xl shadow-premium-sm">
        <Award class="w-5 h-5 text-brand-warning animate-bounce" />
        <div class="text-left">
          <span class="text-[9px] font-bold text-brand-textSecondary uppercase block">Certifications</span>
          <span class="text-xs font-black text-brand-textPrimary">{{ coursesStore.completedCourses.length }} Earned</span>
        </div>
      </div>
    </div>

    <!-- Sub Navigation Tabs -->
    <div class="flex border-b border-brand-border mb-6">
      <button 
        @click="selectedTab = 'library'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'library' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Course Library
      </button>
      <button 
        @click="selectedTab = 'planner'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'planner' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Study Planner & Log
      </button>
      <button 
        @click="selectedTab = 'roadmap'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'roadmap' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Career Skill Roadmap
      </button>
    </div>

    <!-- TAB 1: COURSE LIBRARY -->
    <div v-if="selectedTab === 'library'" class="space-y-6">
      <!-- AI Suggestion Callout -->
      <div class="bg-white border border-brand-border rounded-2xl p-5 shadow-premium flex items-start gap-4 hover:border-brand-accent transition-colors">
        <div class="w-10 h-10 rounded-xl bg-sky-50 text-brand-accent flex items-center justify-center flex-shrink-0 animate-pulse">
          <Sparkles class="w-5 h-5" />
        </div>
        <div class="space-y-1 flex-1">
          <h4 class="text-xs font-bold text-brand-textPrimary flex items-center gap-1.5">
            AI Learning Path recommendation
          </h4>
          <p class="text-[11px] leading-relaxed text-brand-textSecondary max-w-2xl">
            Based on your career goals, you have a gap in <strong>TypeScript</strong> and <strong>State Management</strong>. I highly recommend enrolling in **Advanced Vue 3 with Composition API** to increase your matching percentage for Frontend roles by <strong>18%</strong>.
          </p>
        </div>
        <button 
          @click="coursesStore.enrollCourse('c1')"
          class="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-brand-accentLight text-brand-accent hover:bg-brand-accent hover:text-white rounded-xl text-xs font-bold transition-all flex-shrink-0"
        >
          Quick Enroll <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Controls Bar: Search & Category pills -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="relative w-full md:w-80">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="w-4 h-4 text-brand-textSecondary" />
          </span>
          <input 
            type="text" 
            v-model="searchInput"
            placeholder="Search by title, skills, category..."
            class="w-full pl-9 pr-4 py-2 text-xs border border-brand-border rounded-xl bg-white text-brand-textPrimary placeholder-brand-textSecondary focus:outline-none focus:border-brand-accent focus:bg-white shadow-premium-sm"
          />
        </div>

        <!-- Categories Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border border-brand-border"
            :class="[
              selectedCategory === cat 
                ? 'bg-brand-textPrimary text-white border-brand-textPrimary shadow-premium-sm' 
                : 'bg-white hover:bg-slate-50 text-brand-textSecondary'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Grid Courses List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="course in filteredCourses" 
          :key="course.id"
          class="bg-brand-cardBg border border-brand-border rounded-2xl shadow-premium overflow-hidden flex flex-col justify-between group hover:border-brand-accent hover:shadow-premium-hover transition-all duration-300"
        >
          <!-- Header category -->
          <div class="p-5 pb-0">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-bold text-brand-accent bg-brand-accentLight px-2 py-0.5 rounded uppercase tracking-wider">
                {{ course.category }}
              </span>
              <span class="text-[9px] font-bold text-brand-textSecondary">
                {{ course.difficulty }}
              </span>
            </div>
            
            <h3 class="text-sm font-bold text-brand-textPrimary mt-3 leading-snug group-hover:text-brand-accent transition-colors">
              {{ course.title }}
            </h3>
            <p class="text-[11px] leading-relaxed text-brand-textSecondary mt-2">
              {{ course.description }}
            </p>
          </div>

          <!-- Skills tagged -->
          <div class="px-5 pt-3 flex flex-wrap gap-1">
            <span 
              v-for="skill in course.skills" 
              :key="skill"
              class="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-brand-textSecondary border border-brand-border"
            >
              {{ skill }}
            </span>
          </div>

          <!-- Progress bar if enrolled -->
          <div v-if="course.enrolled" class="px-5 pt-4 space-y-1">
            <div class="flex justify-between text-[9px] font-bold">
              <span class="text-brand-textSecondary">Course Progress</span>
              <span class="text-brand-textPrimary">{{ course.progress }}%</span>
            </div>
            <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-300"
                :class="[course.completed ? 'bg-brand-success' : 'bg-brand-accent']"
                :style="{ width: course.progress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Footer actions -->
          <div class="p-5 pt-4 border-t border-brand-border mt-4 flex items-center justify-between bg-slate-50/40">
            <span class="text-[10px] font-bold text-brand-textSecondary">
              {{ course.durationHours }} Hours Duration
            </span>

            <!-- Enroll / Study trigger actions -->
            <div class="flex gap-2">
              <button 
                v-if="!course.enrolled"
                @click="coursesStore.enrollCourse(course.id)"
                class="px-4 py-2 bg-brand-accent text-white font-bold text-xs rounded-xl shadow-premium hover:bg-sky-700 transition-colors"
              >
                Enroll
              </button>
              <div v-else-if="course.completed" class="flex items-center gap-1 text-[10px] font-bold text-brand-success bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                <CheckCircle2 class="w-4 h-4" /> Completed
              </div>
              <button 
                v-else 
                @click="handleStudyIncrement(course.id)"
                class="px-3.5 py-1.5 bg-brand-accentLight text-brand-accent hover:bg-brand-accent hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                title="Study Module"
              >
                <Play class="w-3.5 h-3.5 fill-current" /> Study
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty search list state -->
      <div 
        v-if="filteredCourses.length === 0" 
        class="text-center py-20 bg-brand-cardBg border border-brand-border border-dashed rounded-3xl"
      >
        <BookOpen class="w-10 h-10 text-brand-textSecondary mx-auto opacity-40" />
        <h3 class="font-bold text-sm text-brand-textPrimary mt-3">No courses found</h3>
        <p class="text-xs text-brand-textSecondary mt-1">Try resetting your search query or choosing another category.</p>
      </div>
    </div>

    <!-- TAB 2: STUDY PLANNER -->
    <div v-if="selectedTab === 'planner'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      <!-- Left Column: Metrics & Logger -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Goal Progress Card -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4">
          <h3 class="text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Weekly Time Tracker</h3>
          
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-2xl font-black text-brand-textPrimary">{{ totalLoggedHours }}h</span>
              <span class="text-[10px] text-brand-textSecondary block">Logged this week</span>
            </div>
            <div class="text-right space-y-1">
              <span class="text-lg font-bold text-brand-accent">Goal: {{ studyTimeGoal }}h</span>
              <span class="text-[10px] text-brand-textSecondary block">target duration</span>
            </div>
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-bold">
              <span class="text-brand-textSecondary">Goal Accomplished</span>
              <span class="text-brand-textPrimary">{{ studyGoalProgress }}%</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                class="bg-brand-accent h-full rounded-full transition-all duration-300"
                :style="{ width: studyGoalProgress + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Log Study Session Form -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4">
          <h3 class="text-xs font-bold text-brand-textPrimary border-b pb-2 flex items-center gap-1.5"><Clock class="w-4 h-4 text-brand-accent" /> Log Study Session</h3>
          
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-brand-textSecondary uppercase">Enrolled Course</label>
              <select 
                v-model="selectedCourseLog" 
                class="w-full border border-brand-border rounded-xl p-2.5 text-xs bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent"
              >
                <option 
                  v-for="c in coursesStore.courses.filter(c => c.enrolled)" 
                  :key="c.id" 
                  :value="c.id"
                >
                  {{ c.title }}
                </option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-brand-textSecondary uppercase">Duration (Hours)</label>
              <input 
                type="number" 
                min="0.5" 
                max="8" 
                step="0.5" 
                v-model.number="sessionDuration"
                class="w-full border border-brand-border rounded-xl p-2.5 text-xs bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-brand-textSecondary uppercase">What did you study?</label>
              <textarea 
                v-model="sessionTopic"
                rows="2"
                placeholder="Examples: Solved 5 array mapping questions, configured Webpack bundlers..."
                class="w-full border border-brand-border rounded-xl p-2.5 text-xs bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent resize-none"
              ></textarea>
            </div>

            <button 
              @click="handleAddStudyLog"
              class="w-full py-2.5 bg-brand-accent hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-premium transition-colors"
            >
              Add Log Entry
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Goals Checklists & Recent Logs -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Weekly Study Checklist -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4">
          <h3 class="text-xs font-bold text-brand-textPrimary border-b pb-2 flex items-center gap-1.5"><Calendar class="w-4 h-4 text-brand-accent" /> Focus Objectives This Week</h3>
          
          <div class="space-y-2.5">
            <div 
              v-for="goal in weeklyGoals" 
              :key="goal.id"
              class="flex items-center gap-3 p-3 border rounded-xl hover:border-brand-accent cursor-pointer transition-colors"
              @click="handleToggleGoal(goal.id)"
            >
              <CheckSquare v-if="goal.completed" class="w-5 h-5 text-brand-success flex-shrink-0" />
              <Square v-else class="w-5 h-5 text-brand-textSecondary flex-shrink-0" />
              <span 
                class="text-xs font-semibold"
                :class="[goal.completed ? 'line-through text-brand-textSecondary' : 'text-brand-textPrimary']"
              >
                {{ goal.text }}
              </span>
            </div>

            <div class="flex gap-2 pt-2">
              <input 
                type="text" 
                v-model="newGoalText" 
                placeholder="Define new study objective..."
                @keyup.enter="handleAddGoal"
                class="flex-1 px-3 py-2 border border-brand-border rounded-xl text-xs bg-brand-secBg text-brand-textPrimary focus:outline-none focus:border-brand-accent"
              />
              <button 
                @click="handleAddGoal"
                class="px-4 py-2 bg-brand-accentLight hover:bg-brand-accent hover:text-white text-brand-accent font-bold text-xs rounded-xl transition-all"
              >
                Add Objective
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Logs List -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4">
          <h3 class="text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Activity History</h3>
          
          <div class="space-y-3">
            <div 
              v-for="log in studyLogs" 
              :key="log.id"
              class="p-4 border rounded-xl bg-slate-50/50 space-y-2 text-xs relative group"
            >
              <div class="flex items-start justify-between">
                <div class="space-y-0.5 max-w-[80%]">
                  <span class="font-black text-brand-textPrimary block">{{ log.courseTitle }}</span>
                  <span class="text-[10px] text-brand-textSecondary font-semibold block">{{ log.date }}</span>
                </div>
                <span class="px-2 py-0.5 bg-brand-accentLight text-brand-accent rounded text-[10px] font-bold">
                  {{ log.duration }} hrs
                </span>
              </div>
              <p class="text-[11px] text-brand-textSecondary leading-relaxed">
                {{ log.topic }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div 
        v-if="showLogToast" 
        class="fixed bottom-6 right-6 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-premium z-50 flex items-center gap-2 animate-fade"
      >
        <CheckCircle2 class="w-4 h-4" /> Study log saved & course progress updated!
      </div>
    </div>

    <!-- TAB 3: CAREER SKILL ROADMAP -->
    <div v-if="selectedTab === 'roadmap'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      <!-- Left Column: SVG Path Selector & visual map -->
      <div class="lg:col-span-2 bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <div class="space-y-1">
            <h3 class="text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Visual Core Tracks</h3>
            <p class="text-[10px] text-brand-textSecondary font-semibold">Click on nodes to analyze skill qualifications.</p>
          </div>
          
          <div class="flex gap-1.5">
            <button 
              @click="selectedRoadmap = 'frontend'; activeNodeIndex = 0"
              class="px-3 py-1.5 rounded-lg text-[10px] font-bold border"
              :class="[selectedRoadmap === 'frontend' ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-brand-textSecondary']"
            >
              Frontend
            </button>
            <button 
              @click="selectedRoadmap = 'backend'; activeNodeIndex = 0"
              class="px-3 py-1.5 rounded-lg text-[10px] font-bold border"
              :class="[selectedRoadmap === 'backend' ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-brand-textSecondary']"
            >
              Backend
            </button>
            <button 
              @click="selectedRoadmap = 'datascience'; activeNodeIndex = 0"
              class="px-3 py-1.5 rounded-lg text-[10px] font-bold border"
              :class="[selectedRoadmap === 'datascience' ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-brand-textSecondary']"
            >
              AI & Data Science
            </button>
          </div>
        </div>

        <!-- Custom Visual SVG Node Graph representation -->
        <div class="relative min-h-[300px] border border-dashed rounded-xl bg-slate-50/50 flex items-center justify-center p-6 overflow-hidden">
          <svg class="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#0284c7" stop-opacity="0.6" />
                <stop offset="100%" stop-color="#059669" stop-opacity="0.6" />
              </linearGradient>
            </defs>
            <!-- Node Connecting Lines -->
            <path 
              v-if="roadmaps[selectedRoadmap].length >= 2"
              d="M 100 150 Q 250 80 400 150 T 700 150" 
              fill="none" 
              stroke="url(#line-grad)" 
              stroke-width="3" 
              stroke-dasharray="6,4"
            />
          </svg>

          <!-- Positioned Node buttons -->
          <div class="w-full max-w-2xl flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10 py-12">
            <div 
              v-for="(node, index) in roadmaps[selectedRoadmap]" 
              :key="node.title"
              class="relative flex flex-col items-center"
            >
              <!-- Connection marker -->
              <button 
                @click="activeNodeIndex = index"
                class="w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-premium transition-all duration-300 relative"
                :class="[
                  activeNodeIndex === index ? 'ring-4 ring-sky-100 scale-110 z-20' : '',
                  node.status === 'Completed' ? 'bg-emerald-500 border-white text-white hover:bg-emerald-600' :
                  node.status === 'In Progress' ? 'bg-sky-500 border-white text-white hover:bg-sky-600' :
                  'bg-white border-slate-200 text-slate-400 hover:border-brand-accent'
                ]"
              >
                <CheckCircle2 v-if="node.status === 'Completed'" class="w-6 h-6" />
                <TrendingUp v-else-if="node.status === 'In Progress'" class="w-6 h-6" />
                <Lock v-else class="w-5 h-5" />
              </button>

              <span class="text-[10px] font-bold text-brand-textPrimary mt-2 text-center bg-white px-2 py-0.5 rounded-full border shadow-sm">
                {{ node.title }}
              </span>
              <span class="text-[8px] font-bold text-brand-textSecondary tracking-wider uppercase mt-1">
                {{ node.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Details Drawer -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Node detail card -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4">
          <div class="flex items-start justify-between border-b pb-3">
            <div class="space-y-0.5">
              <span class="text-[9px] font-bold uppercase tracking-wider text-brand-textSecondary block">Selected Node Details</span>
              <h4 class="font-extrabold text-sm text-brand-textPrimary">{{ activeNodeDetails.title }}</h4>
            </div>
            <span 
              class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
              :class="[
                activeNodeDetails.status === 'Completed' ? 'bg-emerald-50 text-brand-success' :
                activeNodeDetails.status === 'In Progress' ? 'bg-sky-50 text-brand-accent' :
                'bg-slate-100 text-slate-500'
              ]"
            >
              {{ activeNodeDetails.status }}
            </span>
          </div>

          <div class="space-y-1">
            <span class="text-[9px] font-bold text-brand-textSecondary uppercase tracking-wider block">Description</span>
            <p class="text-[11px] leading-relaxed text-brand-textSecondary">
              {{ activeNodeDetails.description }}
            </p>
          </div>

          <!-- Skills list -->
          <div class="space-y-1.5">
            <span class="text-[9px] font-bold text-brand-textSecondary uppercase tracking-wider block">Target Skills</span>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="s in activeNodeDetails.skills" 
                :key="s"
                class="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-brand-textPrimary border"
              >
                {{ s }}
              </span>
            </div>
          </div>

          <!-- Associated Courses -->
          <div v-if="activeNodeDetails.courses.length > 0" class="space-y-2">
            <span class="text-[9px] font-bold text-brand-textSecondary uppercase tracking-wider block font-sans">Matching Course</span>
            
            <div 
              v-for="c in activeNodeDetails.courses" 
              :key="c.id"
              class="p-3 border rounded-xl bg-slate-50/50 flex flex-col justify-between gap-2 text-xs"
            >
              <div>
                <span class="font-bold text-brand-textPrimary block">{{ c.title }}</span>
              </div>
              
              <button 
                v-if="!coursesStore.courses.find(course => course.id === c.id)?.enrolled"
                @click="coursesStore.enrollCourse(c.id)"
                class="w-full py-1.5 bg-brand-accent text-white hover:bg-sky-700 font-bold text-[10px] rounded-lg shadow-sm transition-colors text-center"
              >
                Enroll & Begin Track
              </button>
              <span v-else class="text-[9px] font-bold text-brand-accent bg-sky-50 px-2 py-1 rounded text-center block">
                Active in library
              </span>
            </div>
          </div>

          <!-- Career Outcome -->
          <div class="space-y-1 border-t pt-3">
            <span class="text-[9px] font-bold text-brand-textSecondary uppercase tracking-wider block">Job Outcome</span>
            <span class="text-[11px] font-bold text-brand-textPrimary block flex items-center gap-1">
              <Compass class="w-3.5 h-3.5 text-brand-accent" /> {{ activeNodeDetails.outcome }}
            </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

