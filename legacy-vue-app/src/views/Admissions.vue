<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  GraduationCap, 
  DollarSign, 
  ArrowRight,
  BookOpen,
  Calculator,
  Sliders,
  Check
} from 'lucide-vue-next'

const selectedTab = ref<'scholarships' | 'finance' | 'guidance'>('scholarships')

interface Scholarship {
  id: string
  name: string
  provider: string
  amount: number
  category: 'Merit-based' | 'Category Quota (SC/ST/OBC)' | 'Sports/Arts Quota' | 'Financial Need'
  deadline: string
  eligibility: string
  link: string
  matched: boolean
}

// Mock Scholarships
const scholarships = ref<Scholarship[]>([
  {
    id: 's1',
    name: 'National Merit STEM Scholarship',
    provider: 'EdWorld Foundation',
    amount: 12000,
    category: 'Merit-based',
    deadline: 'July 10, 2026',
    eligibility: 'CGPA > 8.5/10.0, CS or engineering major.',
    link: '#',
    matched: true
  },
  {
    id: 's2',
    name: 'SC/ST/OBC Technology Fellowship',
    provider: 'Ministry of Education Support',
    amount: 8000,
    category: 'Category Quota (SC/ST/OBC)',
    deadline: 'June 30, 2026',
    eligibility: 'Valid category certification, annual family income < 6L.',
    link: '#',
    matched: false
  },
  {
    id: 's3',
    name: 'Varsity Athletics & Excellence Quota Grant',
    provider: 'SUT Sports Association',
    amount: 6000,
    category: 'Sports/Arts Quota',
    deadline: 'August 1, 2026',
    eligibility: 'State-level participation in sports/athletics.',
    link: '#',
    matched: false
  },
  {
    id: 's4',
    name: 'First-Generation College Student Aid',
    provider: 'Alumni Network Fund',
    amount: 10000,
    category: 'Financial Need',
    deadline: 'June 25, 2026',
    eligibility: 'First in family to attend college, income statements required.',
    link: '#',
    matched: true
  }
])

const filterCategory = ref('All')
const documentChecklist = ref([
  { id: 'doc1', name: 'Academic Transcripts (Sem 1-4)', uploaded: true },
  { id: 'doc2', name: 'Family Income Statements', uploaded: false },
  { id: 'doc3', name: 'Identity Proof / Quota Credentials', uploaded: false }
])

const filteredScholarships = computed(() => {
  return scholarships.value.filter(s => {
    return filterCategory.value === 'All' || s.category === filterCategory.value
  })
})

// Finance ROI Calculator Reactive Values
const tuitionFee = ref(25000)
const livingExpense = ref(12000)
const postGradSalary = ref(85000)
const degreeDuration = ref(4)

const totalDegreeCost = computed(() => {
  return (tuitionFee.value + livingExpense.value) * degreeDuration.value
})

const paybackPeriod = computed(() => {
  // Assume 30% savings potential of target gross salary goes to paying back
  const annualSavings = postGradSalary.value * 0.3
  const years = totalDegreeCost.value / annualSavings
  return isNaN(years) || !isFinite(years) ? 0 : Math.round(years * 10) / 10
})

const paybackComment = computed(() => {
  const years = paybackPeriod.value
  if (years <= 2) return '🚀 Exceptional ROI! You will break even within 2 years post-graduation.'
  if (years <= 4) return '🟢 Good ROI. Typical payback period matches your degree duration.'
  return '⚠️ Long payback period. Consider looking for scholarships or part-time work to reduce tuition overhead.'
})
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    
    <!-- Page Header -->
    <div class="bg-gradient-to-r from-emerald-50 to-slate-50 border border-brand-border rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-premium-sm">
      <div class="space-y-1">
        <h2 class="text-xl font-extrabold text-brand-textPrimary flex items-center gap-2">
          <GraduationCap class="w-6 h-6 text-brand-success" /> Admissions & Academic Support
        </h2>
        <p class="text-brand-textSecondary text-xs font-semibold">
          Secure funding for your education. Filter categories, complete scholarship document checklists, or calculate your degree payback ROI.
        </p>
      </div>

      <div class="flex items-center gap-3 bg-white px-4 py-2 border border-brand-border rounded-xl shadow-premium-sm">
        <DollarSign class="w-5 h-5 text-brand-success" />
        <div class="text-left">
          <span class="text-[9px] font-bold text-brand-textSecondary uppercase block">Max Grant</span>
          <span class="text-xs font-black text-brand-textPrimary">$12,000 / yr</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-brand-border">
      <button 
        @click="selectedTab = 'scholarships'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'scholarships' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Scholarships Hub ({{ scholarships.length }})
      </button>
      <button 
        @click="selectedTab = 'finance'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'finance' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Finance Navigator (ROI Calculator)
      </button>
      <button 
        @click="selectedTab = 'guidance'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'guidance' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Admissions Cutoffs
      </button>
    </div>

    <!-- Tab 1: Scholarships Hub -->
    <div v-if="selectedTab === 'scholarships'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left 2/3: Scholarship list -->
      <div class="lg:col-span-2 space-y-4">
        
        <!-- Filter Bar -->
        <div class="flex items-center justify-between bg-white p-4 border border-brand-border rounded-2xl shadow-premium-sm">
          <span class="text-xs font-bold text-brand-textPrimary">Filter Category</span>
          <select 
            v-model="filterCategory"
            class="border border-brand-border rounded-xl px-3 py-1.5 text-xs bg-slate-50 text-brand-textPrimary focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Merit-based">Merit-based</option>
            <option value="Category Quota (SC/ST/OBC)">Category Quota</option>
            <option value="Sports/Arts Quota">Sports/Arts Quota</option>
            <option value="Financial Need">Financial Need</option>
          </select>
        </div>

        <!-- List -->
        <div class="space-y-4">
          <div 
            v-for="scholar in filteredScholarships" 
            :key="scholar.id"
            class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium flex flex-col justify-between hover:border-brand-accent transition-all duration-200"
          >
            <div class="flex justify-between items-start gap-4 flex-wrap">
              <div class="space-y-1">
                <span class="text-[9px] font-bold text-brand-accent bg-brand-accentLight px-2 py-0.5 rounded uppercase">
                  {{ scholar.category }}
                </span>
                <h4 class="text-xs font-bold text-brand-textPrimary leading-snug mt-1.5">{{ scholar.name }}</h4>
                <p class="text-[10px] text-brand-textSecondary font-semibold">Provider: {{ scholar.provider }}</p>
              </div>

              <div class="text-right">
                <span class="text-[9px] font-bold text-brand-textSecondary uppercase block">Scholarship Value</span>
                <span class="text-sm font-black text-brand-success">${{ scholar.amount }} / Year</span>
              </div>
            </div>

            <p class="text-[11px] leading-relaxed text-brand-textSecondary mt-3 border-t border-brand-border pt-3">
              <strong>Eligibility</strong>: {{ scholar.eligibility }}
            </p>

            <div class="mt-4 pt-3 flex justify-between items-center bg-slate-50/50 -m-5 p-5 rounded-b-2xl">
              <span class="text-[9px] text-brand-textSecondary font-semibold">Deadline: {{ scholar.deadline }}</span>
              <a 
                :href="scholar.link" 
                class="px-4 py-2 bg-brand-accent text-white font-bold text-[10px] rounded-xl flex items-center gap-0.5 shadow-premium-sm hover:bg-sky-700"
              >
                Apply Direct <ArrowRight class="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </div>

      <!-- Right 1/3: Document checklists -->
      <div class="space-y-6">
        
        <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4">
          <h3 class="text-sm font-bold text-brand-textPrimary flex items-center gap-2 border-b border-brand-border pb-3">
            📂 Document Checklist
          </h3>
          
          <div class="space-y-3">
            <div 
              v-for="doc in documentChecklist" 
              :key="doc.id"
              class="flex items-center justify-between p-3 rounded-xl border border-dashed text-xs"
              :class="[doc.uploaded ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/50 border-brand-border']"
            >
              <span class="font-semibold text-brand-textPrimary">{{ doc.name }}</span>
              
              <button 
                @click="doc.uploaded = !doc.uploaded"
                class="w-5 h-5 rounded-lg border flex items-center justify-center transition-colors"
                :class="[doc.uploaded ? 'bg-brand-success text-white border-brand-success' : 'border-slate-300 bg-white hover:border-brand-accent']"
              >
                <Check v-if="doc.uploaded" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Tab 2: Finance ROI Calculator -->
    <div v-else-if="selectedTab === 'finance'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Sliders Left Panel -->
      <div class="lg:col-span-2 bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-6">
        <h3 class="text-sm font-extrabold text-brand-textPrimary flex items-center gap-2 border-b border-brand-border pb-3">
          <Sliders class="w-5 h-5 text-brand-accent" /> ROI Cost Parameters
        </h3>

        <!-- Tuition Slider -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-brand-textSecondary">Annual Tuition Fee</label>
            <span class="text-xs font-black text-brand-textPrimary">${{ tuitionFee.toLocaleString() }}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="80000" 
            step="1000"
            v-model.number="tuitionFee"
            class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
        </div>

        <!-- Living Expenses Slider -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-brand-textSecondary">Annual Cost of Living</label>
            <span class="text-xs font-black text-brand-textPrimary">${{ livingExpense.toLocaleString() }}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="30000" 
            step="500"
            v-model.number="livingExpense"
            class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
        </div>

        <!-- Salary Slider -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-brand-textSecondary">Expected Post-Grad Salary</label>
            <span class="text-xs font-black text-brand-accent">${{ postGradSalary.toLocaleString() }}</span>
          </div>
          <input 
            type="range" 
            min="30000" 
            max="200000" 
            step="2000"
            v-model.number="postGradSalary"
            class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
        </div>

        <!-- Duration Slider -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-brand-textSecondary">Degree Duration (Years)</label>
            <span class="text-xs font-black text-brand-textPrimary">{{ degreeDuration }} Years</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="5" 
            step="1"
            v-model.number="degreeDuration"
            class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
        </div>

      </div>

      <!-- ROI Output Right Panel -->
      <div class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-6 flex flex-col justify-between">
        <div class="space-y-5">
          <h3 class="text-sm font-extrabold text-brand-textPrimary border-b border-brand-border pb-3 flex items-center gap-2">
            <Calculator class="w-4.5 h-4.5 text-brand-accent" /> Payback Evaluation
          </h3>

          <div class="space-y-3">
            <div class="p-3 bg-slate-50 border rounded-xl">
              <span class="text-[9px] font-bold text-brand-textSecondary uppercase block">Total Cost of Degree</span>
              <span class="text-xl font-black text-brand-textPrimary">${{ totalDegreeCost.toLocaleString() }}</span>
            </div>

            <div class="p-3 bg-slate-50 border rounded-xl">
              <span class="text-[9px] font-bold text-brand-textSecondary uppercase block">Break-even Period</span>
              <span class="text-xl font-black text-brand-accent">{{ paybackPeriod }} Years</span>
            </div>
          </div>
        </div>

        <div class="p-3.5 bg-sky-50 border border-sky-100 rounded-xl text-[10px] leading-relaxed text-brand-textSecondary mt-4">
          {{ paybackComment }}
        </div>
      </div>

    </div>

    <!-- Tab 3: Guidance & Cutoffs -->
    <div v-else-if="selectedTab === 'guidance'" class="bg-brand-cardBg border border-brand-border rounded-2xl p-6 shadow-premium space-y-6">
      <h3 class="text-sm font-extrabold text-brand-textPrimary flex items-center gap-2 border-b border-brand-border pb-3">
        <BookOpen class="w-5 h-5 text-brand-accent" /> Entrance Cutoffs & Timelines
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Cutoffs list -->
        <div class="space-y-3">
          <span class="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">Entrance Exams Cutoffs</span>
          
          <div class="p-3 rounded-xl border border-brand-border space-y-1 text-xs">
            <div class="flex justify-between font-bold text-brand-textPrimary">
              <span>GATE (CS Stream)</span>
              <span class="text-brand-accent">98.5 Percentile</span>
            </div>
            <p class="text-[10px] text-brand-textSecondary">State Tech University Direct Admission</p>
          </div>

          <div class="p-3 rounded-xl border border-brand-border space-y-1 text-xs">
            <div class="flex justify-between font-bold text-brand-textPrimary">
              <span>CAT (Business Administration)</span>
              <span class="text-brand-accent">95.0 Percentile</span>
            </div>
            <p class="text-[10px] text-brand-textSecondary">EdWorld Analytics College admissions</p>
          </div>
        </div>

        <!-- Milestones list -->
        <div class="space-y-3">
          <span class="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">Key Timelines</span>
          
          <div class="relative before:absolute before:inset-y-1 before:left-[11px] before:w-0.5 before:bg-slate-100 space-y-4">
            <div class="flex items-start gap-4 relative">
              <div class="w-6 h-6 rounded-full bg-brand-accent text-white flex items-center justify-center text-[10px] font-bold z-10 flex-shrink-0">
                1
              </div>
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-brand-textPrimary">Application Forms Close</span>
                <p class="text-[9px] text-brand-textSecondary font-semibold">June 20, 2026 • Midnight deadline</p>
              </div>
            </div>
            <div class="flex items-start gap-4 relative">
              <div class="w-6 h-6 rounded-full bg-slate-100 text-brand-textSecondary border flex items-center justify-center text-[10px] font-bold z-10 flex-shrink-0">
                2
              </div>
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-brand-textPrimary">Document Counseling</span>
                <p class="text-[9px] text-brand-textSecondary font-semibold">July 5, 2026 • Verified on-site</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>
