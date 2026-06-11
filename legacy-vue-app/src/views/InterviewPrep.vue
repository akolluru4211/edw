<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Award, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  TrendingUp,
  SlidersHorizontal,
  BrainCircuit
} from 'lucide-vue-next'

const selectedTab = ref<'mock' | 'questions' | 'guide'>('mock')

interface Question {
  id: string
  company: string
  role: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: 'Technical' | 'Behavioral' | 'HR'
  questionText: string
  solution: string
  practiced: boolean
}

// Mock Questions DB
const questions = ref<Question[]>([
  {
    id: 'q1',
    company: 'Vercel',
    role: 'Frontend Engineer',
    difficulty: 'Medium',
    category: 'Technical',
    questionText: 'Explain how hydration works in Vue SSR (Server-Side Rendering) or Nuxt.js, and how you resolve hydration mismatches.',
    solution: 'Hydration is the process where the client-side JavaScript takes over static HTML sent by the server, attaching event listeners and setting up reactivity. Mismatches occur when client state differs from server state. Fixed by using client-only components or verifying lifecycle triggers.',
    practiced: false
  },
  {
    id: 'q2',
    company: 'Google',
    role: 'Software Engineer',
    difficulty: 'Hard',
    category: 'Technical',
    questionText: 'Given a binary tree, write an algorithm to find the maximum path sum between any two nodes in the tree.',
    solution: 'Use recursive post-order traversal. For each node, calculate the max path sum branch contribution and update a global maximum referencing left-child, right-child, and active node sum.',
    practiced: true
  },
  {
    id: 'q3',
    company: 'Stripe',
    role: 'Backend Intern',
    difficulty: 'Medium',
    category: 'Behavioral',
    questionText: 'Describe a situation where you had a significant disagreement with a teammate during a coding project. How did you resolve it?',
    solution: 'Align on objective facts rather than opinions. Gather metrics, conduct simple A/B tests if applicable, list pros/cons of both approaches, and document the resolution pathway clearly.',
    practiced: false
  },
  {
    id: 'q4',
    company: 'Vercel',
    role: 'Frontend Intern',
    difficulty: 'Easy',
    category: 'HR',
    questionText: 'Why do you want to join Vercel? How does our developer experience ecosystem resonate with your career goals?',
    solution: 'Mention focus on optimization, speed, serverless architectures, and user-centric frontend experiences.',
    practiced: false
  }
])

// Answer Evaluator Form
const activeQuestion = ref<Question>(questions.value[2]) // Default to behavioral conflict question
const answerText = ref('')
const isEvaluating = ref(false)
const evaluationResult = ref<{
  score: number
  clarity: number
  starMethod: boolean
  strengths: string[]
  improvements: string[]
} | null>(null)

// Filters
const filterCompany = ref('All')
const filterDifficulty = ref('All')
const filterCategory = ref('All')

const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    const matchesCompany = filterCompany.value === 'All' || q.company === filterCompany.value
    const matchesDifficulty = filterDifficulty.value === 'All' || q.difficulty === filterDifficulty.value
    const matchesCategory = filterCategory.value === 'All' || q.category === filterCategory.value
    return matchesCompany && matchesDifficulty && matchesCategory
  })
})

const handleSelectQuestion = (q: Question) => {
  activeQuestion.value = q
  answerText.value = ''
  evaluationResult.value = null
  selectedTab.value = 'mock'
}

// Simulate AI evaluation of answers
const handleEvaluateAnswer = () => {
  if (!answerText.value.trim()) return

  isEvaluating.value = true
  evaluationResult.value = null

  setTimeout(() => {
    isEvaluating.value = false
    activeQuestion.value.practiced = true
    
    // Evaluate answer length and structure
    const hasSituation = answerText.value.toLowerCase().includes('situation') || answerText.value.length > 150
    const hasTask = answerText.value.toLowerCase().includes('task') || answerText.value.toLowerCase().includes('challenge')
    const hasAction = answerText.value.toLowerCase().includes('action') || answerText.value.toLowerCase().includes('did') || answerText.value.toLowerCase().includes('resolved')
    const hasResult = answerText.value.toLowerCase().includes('result') || answerText.value.toLowerCase().includes('impact') || answerText.value.toLowerCase().includes('outcome')

    const score = Math.min(100, Math.max(45, Math.round(
      (hasSituation ? 25 : 10) +
      (hasTask ? 25 : 10) +
      (hasAction ? 25 : 15) +
      (hasResult ? 25 : 10)
    )))

    evaluationResult.value = {
      score,
      clarity: Math.round(score * 0.95),
      starMethod: hasSituation && hasTask && hasAction && hasResult,
      strengths: [
        'Good detailing of the active problem statement.',
        'Clear action steps listed to handle the engineering trade-offs.'
      ],
      improvements: [
        !hasResult ? '⚠️ Missing Results: Quantify the outcome of your action (e.g. saved 10 hours, reduced bundle by 12%).' : '',
        answerText.value.length < 200 ? '⚠️ Expand response: Provide more context about the teammates involvement.' : ''
      ].filter(Boolean)
    }
  }, 2500)
}
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    
    <!-- Page Header -->
    <div class="bg-gradient-to-r from-amber-50 to-slate-50 border border-brand-border rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-premium-sm">
      <div class="space-y-1">
        <h2 class="text-xl font-extrabold text-brand-textPrimary flex items-center gap-2">
          <Award class="w-6 h-6 text-brand-warning" /> Interview Prep Hub
        </h2>
        <p class="text-brand-textSecondary text-xs font-semibold">
          Ace your upcoming placement rounds. Practice behavioral STAR templates or technical coding structures and get instant AI grades.
        </p>
      </div>

      <div class="flex items-center gap-3 bg-white px-4 py-2 border border-brand-border rounded-xl shadow-premium-sm">
        <TrendingUp class="w-5 h-5 text-brand-accent" />
        <div class="text-left">
          <span class="text-[9px] font-bold text-brand-textSecondary uppercase block">Practice Score</span>
          <span class="text-xs font-black text-brand-textPrimary">82/100 Avg</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-brand-border">
      <button 
        @click="selectedTab = 'mock'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'mock' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        STAR Answer Evaluator
      </button>
      <button 
        @click="selectedTab = 'questions'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'questions' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Questions Database ({{ questions.length }})
      </button>
      <button 
        @click="selectedTab = 'guide'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'guide' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Prep Roadmap
      </button>
    </div>

    <!-- Tab 1: STAR Answer Evaluator -->
    <div v-if="selectedTab === 'mock'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Answering Area -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-4">
          
          <div class="flex items-center justify-between border-b border-brand-border pb-3">
            <span class="text-[10px] font-bold text-brand-accent bg-brand-accentLight px-2 py-0.5 rounded uppercase">
              Active Question
            </span>
            <span class="text-[10px] font-bold text-brand-textSecondary">
              {{ activeQuestion.company }} • {{ activeQuestion.category }}
            </span>
          </div>

          <h3 class="text-sm font-bold text-brand-textPrimary leading-snug">
            {{ activeQuestion.questionText }}
          </h3>

          <div class="space-y-1.5 pt-2">
            <label class="text-xs font-bold text-brand-textSecondary flex items-center justify-between">
              <span>Your Response</span>
              <span class="text-[10px] text-brand-textSecondary font-semibold">Min 150 chars suggested</span>
            </label>
            <textarea 
              v-model="answerText"
              rows="6"
              placeholder="Structure your answer using the STAR Method (Situation, Task, Action, Result)..."
              class="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-secBg text-brand-textPrimary placeholder-brand-textSecondary focus:outline-none focus:border-brand-accent focus:bg-white resize-none"
              :disabled="isEvaluating"
            ></textarea>
          </div>

          <button 
            @click="handleEvaluateAnswer"
            class="px-5 py-2.5 bg-brand-accent hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-premium transition-colors flex items-center gap-1.5"
            :disabled="isEvaluating || !answerText.trim()"
          >
            <BrainCircuit class="w-4 h-4" /> Evaluate Answer
          </button>

        </div>

        <!-- Evaluation Results -->
        <div v-if="isEvaluating" class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-4">
          <div class="flex items-center gap-2 text-brand-textSecondary text-xs">
            <Sparkles class="w-4.5 h-4.5 text-brand-accent animate-spin" /> Analyzing response alignment against STAR frameworks...
          </div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div class="shimmer-loader h-full w-full"></div>
          </div>
        </div>

        <div v-else-if="evaluationResult" class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-5 chat-bubble-anim">
          <h3 class="text-sm font-extrabold text-brand-textPrimary border-b border-brand-border pb-3 flex items-center gap-2">
            <Sparkles class="w-4.5 h-4.5 text-brand-accent animate-pulse" /> AI Performance Feedback
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-slate-50 border rounded-xl text-center">
              <span class="text-[9px] font-bold text-brand-textSecondary uppercase block">Overall Score</span>
              <span class="text-xl font-black text-brand-accent">{{ evaluationResult.score }}/100</span>
            </div>
            <div class="p-3 bg-slate-50 border rounded-xl text-center">
              <span class="text-[9px] font-bold text-brand-textSecondary uppercase block">STAR Method Check</span>
              <span class="text-xs font-bold flex items-center justify-center gap-1 mt-1" 
                :class="[evaluationResult.starMethod ? 'text-brand-success' : 'text-brand-warning']"
              >
                <CheckCircle2 v-if="evaluationResult.starMethod" class="w-3.5 h-3.5" />
                {{ evaluationResult.starMethod ? 'Passed' : 'Incomplete' }}
              </span>
            </div>
          </div>

          <div class="space-y-3">
            <div class="space-y-1">
              <span class="text-[10px] font-bold text-brand-success uppercase tracking-wider block">Strengths</span>
              <div v-for="(str, i) in evaluationResult.strengths" :key="i" class="text-xs text-brand-textSecondary flex items-start gap-1.5 leading-relaxed">
                <span>✓</span> {{ str }}
              </div>
            </div>

            <div class="space-y-1 border-t border-brand-border pt-3" v-if="evaluationResult.improvements.length > 0">
              <span class="text-[10px] font-bold text-brand-warning uppercase tracking-wider block">Areas for Improvement</span>
              <div v-for="(imp, i) in evaluationResult.improvements" :key="i" class="text-xs text-brand-textSecondary flex items-start gap-1.5 leading-relaxed">
                {{ imp }}
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Right Column: Sidebar Stats and Tips -->
      <div class="space-y-6">
        
        <!-- Interview Tips -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-3.5">
          <h3 class="text-sm font-bold text-brand-textPrimary flex items-center gap-2">
            <HelpCircle class="w-4.5 h-4.5 text-brand-accent" /> STAR Structure Guide
          </h3>
          
          <div class="space-y-3 text-[11px] text-brand-textSecondary leading-relaxed">
            <p>
              Top companies grade responses based on the **STAR Method** to check for logic and result orientation.
            </p>
            <div class="space-y-2">
              <div class="pl-2 border-l-2 border-sky-300">
                <strong class="text-brand-textPrimary">S - Situation</strong>: Briefly explain the project context.
              </div>
              <div class="pl-2 border-l-2 border-emerald-300">
                <strong class="text-brand-textPrimary">T - Task</strong>: What was the goal or technical constraint?
              </div>
              <div class="pl-2 border-l-2 border-amber-300">
                <strong class="text-brand-textPrimary">A - Action</strong>: Explain the steps **you** personally executed.
              </div>
              <div class="pl-2 border-l-2 border-indigo-300">
                <strong class="text-brand-textPrimary">R - Result</strong>: Add metrics (e.g. saved time, reduced errors).
              </div>
            </div>
          </div>
        </div>

        <!-- Solutions checklist -->
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-3">
          <h3 class="text-sm font-bold text-brand-textPrimary">Practice History</h3>
          <div class="space-y-2">
            <div 
              v-for="q in questions" 
              :key="q.id"
              class="flex items-center justify-between text-xs p-2.5 border border-dashed rounded-xl"
              :class="[q.practiced ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/50']"
            >
              <span class="truncate font-semibold max-w-[150px]">{{ q.questionText }}</span>
              <span 
                class="text-[9px] font-bold px-1.5 py-0.5 rounded"
                :class="[q.practiced ? 'bg-emerald-100 text-brand-success' : 'bg-slate-200 text-brand-textSecondary']"
              >
                {{ q.practiced ? 'Completed' : 'Draft' }}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Tab 2: Questions Database -->
    <div v-else-if="selectedTab === 'questions'" class="space-y-6">
      
      <!-- Filter controls -->
      <div class="flex flex-wrap items-center gap-3 bg-white p-4 border border-brand-border rounded-2xl shadow-premium-sm">
        <div class="flex items-center gap-1.5 text-xs font-bold text-brand-textSecondary pr-2">
          <SlidersHorizontal class="w-4 h-4 text-brand-accent" /> Filters
        </div>

        <select 
          v-model="filterCompany"
          class="border border-brand-border rounded-xl px-3 py-1.5 text-xs bg-slate-50 text-brand-textPrimary focus:outline-none"
        >
          <option value="All">All Companies</option>
          <option value="Google">Google</option>
          <option value="Vercel">Vercel</option>
          <option value="Stripe">Stripe</option>
        </select>

        <select 
          v-model="filterDifficulty"
          class="border border-brand-border rounded-xl px-3 py-1.5 text-xs bg-slate-50 text-brand-textPrimary focus:outline-none"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select 
          v-model="filterCategory"
          class="border border-brand-border rounded-xl px-3 py-1.5 text-xs bg-slate-50 text-brand-textPrimary focus:outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Technical">Technical</option>
          <option value="Behavioral">Behavioral</option>
          <option value="HR">HR / General</option>
        </select>
      </div>

      <!-- Question list -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="q in filteredQuestions" 
          :key="q.id"
          class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium flex flex-col justify-between hover:border-brand-accent transition-all duration-200"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
              <span class="text-brand-accent bg-brand-accentLight px-2 py-0.5 rounded">{{ q.company }}</span>
              <span class="px-2 py-0.5 rounded"
                :class="[
                  q.difficulty === 'Easy' ? 'bg-emerald-50 text-brand-success' :
                  q.difficulty === 'Medium' ? 'bg-amber-50 text-brand-warning' : 'bg-red-50 text-brand-danger'
                ]"
              >
                {{ q.difficulty }}
              </span>
            </div>
            
            <h4 class="text-xs font-bold text-brand-textPrimary leading-snug">{{ q.questionText }}</h4>
          </div>

          <div class="mt-4 pt-3 border-t border-brand-border flex justify-between items-center bg-slate-50/50 -m-5 p-5 rounded-b-2xl">
            <span class="text-[10px] font-bold text-brand-textSecondary">{{ q.category }} Question</span>
            <button 
              @click="handleSelectQuestion(q)"
              class="px-3 py-1.5 bg-brand-accent text-white font-bold text-[10px] rounded-lg flex items-center gap-0.5 shadow-premium-sm hover:bg-sky-700"
            >
              Practice Now <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Tab 3: Weekly Prep Roadmap -->
    <div v-else-if="selectedTab === 'guide'" class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-6">
      <h3 class="text-sm font-extrabold text-brand-textPrimary flex items-center gap-2">
        <BookOpen class="w-5 h-5 text-brand-accent" /> Placement Prep Curriculum
      </h3>

      <div class="relative before:absolute before:inset-y-1 before:left-3.5 before:w-0.5 before:bg-slate-100 space-y-6">
        
        <!-- Week 1 -->
        <div class="flex items-start gap-4 relative">
          <div class="w-7 h-7 rounded-full bg-brand-accentLight text-brand-accent border border-brand-border flex items-center justify-center text-xs font-bold z-10">
            1
          </div>
          <div class="space-y-1.5 flex-1">
            <span class="text-xs font-extrabold text-brand-textPrimary">Week 1: Algorithmic Foundations</span>
            <p class="text-xs text-brand-textSecondary leading-relaxed">
              Focus on Big-O notations, array operations, sorting systems, and link list operations. Solve 2 technical questions daily.
            </p>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-brand-textSecondary border">DSA</span>
              <span class="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-brand-textSecondary border">Complexity</span>
            </div>
          </div>
        </div>

        <!-- Week 2 -->
        <div class="flex items-start gap-4 relative">
          <div class="w-7 h-7 rounded-full bg-brand-accentLight text-brand-accent border border-brand-border flex items-center justify-center text-xs font-bold z-10">
            2
          </div>
          <div class="space-y-1.5 flex-1">
            <span class="text-xs font-extrabold text-brand-textPrimary">Week 2: Advanced Data Structures & Architecture</span>
            <p class="text-xs text-brand-textSecondary leading-relaxed">
              Trees, graphs traversal algorithms, hashing, system design CDNs, and database partitioning structures.
            </p>
          </div>
        </div>

        <!-- Week 3 -->
        <div class="flex items-start gap-4 relative">
          <div class="w-7 h-7 rounded-full bg-brand-accentLight text-brand-accent border border-brand-border flex items-center justify-center text-xs font-bold z-10">
            3
          </div>
          <div class="space-y-1.5 flex-1">
            <span class="text-xs font-extrabold text-brand-textPrimary">Week 3: Behavioral STAR Alignment & Mock Rounds</span>
            <p class="text-xs text-brand-textSecondary leading-relaxed">
              Quantify experiences. Practice 5 conflict resolution structures and record mock sessions with AI Coach Alex.
            </p>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>
