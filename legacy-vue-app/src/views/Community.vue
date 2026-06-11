<script setup lang="ts">
import { ref } from 'vue'
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  Check, 
  BookOpen, 
  Video,
  UserCheck
} from 'lucide-vue-next'

const selectedTab = ref<'forum' | 'groups' | 'booker'>('forum')

interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  tags: string[]
  upvotes: number
  answers: number
  upvoted: boolean
}

// Mock Forum Posts
const forumPosts = ref<ForumPost[]>([
  {
    id: 'p1',
    title: 'Is Pinia completely replacing Vuex for all new production projects?',
    content: 'I am starting a large-scale project and noticed Vue 3 documentation defaults to Pinia. Are there any edge cases where Vuex is still preferred?',
    author: 'Rahul Varma',
    tags: ['Vue.js', 'Pinia', 'State Management'],
    upvotes: 14,
    answers: 3,
    upvoted: false
  },
  {
    id: 'p2',
    title: 'Tips for passing the Vercel Frontend Intern technical coding challenge?',
    content: 'I have my coding round coming up next week. It says it is a mix of JavaScript optimizations and UI layout alignments. Any advice on what to study?',
    author: 'Arjun Kolluru',
    tags: ['Interview Prep', 'Vercel', 'JavaScript'],
    upvotes: 28,
    answers: 5,
    upvoted: false
  }
])

interface StudyGroup {
  id: string
  name: string
  description: string
  members: number
  joined: boolean
}

// Mock Study Groups
const studyGroups = ref<StudyGroup[]>([
  {
    id: 'g1',
    name: 'LeetCode 150 Study Group',
    description: 'Daily practice of arrays, sorting, trees, and dynamic programming algorithms. Sync up every Wednesday.',
    members: 18,
    joined: false
  },
  {
    id: 'g2',
    name: 'Vue 3 & Frontend Builders',
    description: 'Working on portfolio projects, sharing component patterns, and reviewing each others code.',
    members: 24,
    joined: true
  }
])

interface Advisor {
  id: string
  name: string
  role: string
  avatar: string
  rating: number
  availability: string[]
}

// Mock Advisors
const advisors = ref<Advisor[]>([
  {
    id: 'a1',
    name: 'Karan Sharma',
    role: 'Software Engineer @ Google',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    rating: 4.9,
    availability: ['Friday, 2:00 PM', 'Friday, 3:30 PM', 'Saturday, 11:00 AM']
  },
  {
    id: 'a2',
    name: 'Dr. Anita Desai',
    role: 'Professor of AI/ML',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    rating: 4.8,
    availability: ['Thursday, 4:00 PM', 'Saturday, 2:00 PM']
  }
])

const showBookToast = ref(false)
const bookedDetails = ref('')
const newPostTitle = ref('')
const newPostContent = ref('')
const showNewPostForm = ref(false)

const handleUpvote = (post: ForumPost) => {
  if (post.upvoted) {
    post.upvotes--
    post.upvoted = false
  } else {
    post.upvotes++
    post.upvoted = true
  }
}

const handleJoinGroup = (group: StudyGroup) => {
  if (group.joined) {
    group.members--
    group.joined = false
  } else {
    group.members++
    group.joined = true
  }
}

const handleBookSession = (advisorName: string, slot: string) => {
  bookedDetails.value = `Successfully booked 1-on-1 session with ${advisorName} for ${slot}!`
  showBookToast.value = true
  setTimeout(() => {
    showBookToast.value = false
  }, 3000)
}

const submitNewPost = () => {
  if (!newPostTitle.value.trim() || !newPostContent.value.trim()) return

  forumPosts.value.unshift({
    id: 'p_' + Date.now(),
    title: newPostTitle.value.trim(),
    content: newPostContent.value.trim(),
    author: 'Arjun Kolluru',
    tags: ['General'],
    upvotes: 0,
    answers: 0,
    upvoted: false
  })

  newPostTitle.value = ''
  newPostContent.value = ''
  showNewPostForm.value = false
}
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    
    <!-- Page Header -->
    <div class="bg-gradient-to-r from-sky-50 to-slate-50 border border-brand-border rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-premium-sm">
      <div class="space-y-1">
        <h2 class="text-xl font-extrabold text-brand-textPrimary flex items-center gap-2">
          <Users class="w-6 h-6 text-brand-accent" /> Peer Community & Support
        </h2>
        <p class="text-brand-textSecondary text-xs font-semibold">
          Connect with peers. Join study circles, upvote questions on forums, and schedule 1-on-1 advisor video sessions.
        </p>
      </div>

      <div class="flex items-center gap-3 bg-white px-4 py-2 border border-brand-border rounded-xl shadow-premium-sm">
        <MessageSquare class="w-5 h-5 text-brand-accent" />
        <div class="text-left">
          <span class="text-[9px] font-bold text-brand-textSecondary uppercase block">Forum Posts</span>
          <span class="text-xs font-black text-brand-textPrimary">428 Active</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-brand-border">
      <button 
        @click="selectedTab = 'forum'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'forum' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Q&A Forum
      </button>
      <button 
        @click="selectedTab = 'groups'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'groups' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Study Groups ({{ studyGroups.length }})
      </button>
      <button 
        @click="selectedTab = 'booker'"
        class="px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200"
        :class="[
          selectedTab === 'booker' 
            ? 'border-brand-accent text-brand-accent' 
            : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
        ]"
      >
        Book 1-on-1 Advisor
      </button>
    </div>

    <!-- Tab 1: Q&A Forum -->
    <div v-if="selectedTab === 'forum'" class="space-y-4">
      
      <!-- Ask Question Button toggle -->
      <div class="flex justify-end">
        <button 
          @click="showNewPostForm = !showNewPostForm"
          class="px-4 py-2 bg-brand-accent hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-premium"
        >
          <Plus class="w-4.5 h-4.5" /> Ask a Question
        </button>
      </div>

      <!-- New Post Form Modal/Overlay -->
      <div 
        v-if="showNewPostForm"
        class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium space-y-4 animate-slide-fade"
      >
        <h3 class="text-xs font-bold text-brand-textPrimary">Create a forum post</h3>
        <div class="space-y-3">
          <input 
            type="text" 
            v-model="newPostTitle"
            placeholder="E.g. What is the difference between shallowRef and ref in Vue 3?"
            class="w-full border border-brand-border rounded-xl p-2.5 text-xs bg-slate-50 text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white"
          />
          <textarea 
            v-model="newPostContent"
            rows="3"
            placeholder="Describe your question or active programming trade-offs in detail..."
            class="w-full border border-brand-border rounded-xl p-2.5 text-xs bg-slate-50 text-brand-textPrimary focus:outline-none focus:border-brand-accent focus:bg-white resize-none"
          ></textarea>
          
          <div class="flex gap-2 justify-end">
            <button 
              @click="showNewPostForm = false"
              class="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-brand-textSecondary rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="submitNewPost"
              class="px-4 py-2 text-xs font-bold bg-brand-accent hover:bg-sky-700 text-white rounded-xl shadow-premium transition-colors"
            >
              Submit Post
            </button>
          </div>
        </div>
      </div>

      <!-- Posts List -->
      <div class="space-y-4">
        <div 
          v-for="post in forumPosts" 
          :key="post.id"
          class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium flex flex-col md:flex-row gap-5 justify-between items-start hover:border-brand-accent transition-colors"
        >
          
          <!-- Left: Upvotes -->
          <div class="flex md:flex-col items-center gap-2 flex-shrink-0">
            <button 
              @click="handleUpvote(post)"
              class="p-2 border rounded-xl flex items-center md:flex-col gap-1 transition-colors"
              :class="[post.upvoted ? 'bg-sky-50 border-sky-100 text-brand-accent font-bold' : 'bg-slate-50 hover:bg-slate-100']"
            >
              <ThumbsUp class="w-4 h-4" />
              <span class="text-xs">{{ post.upvotes }}</span>
            </button>
          </div>

          <!-- Content -->
          <div class="space-y-1.5 flex-1">
            <h3 class="text-xs font-extrabold text-brand-textPrimary leading-snug hover:text-brand-accent cursor-pointer transition-colors">
              {{ post.title }}
            </h3>
            
            <p class="text-[11px] leading-relaxed text-brand-textSecondary max-w-2xl">
              {{ post.content }}
            </p>

            <div class="flex flex-wrap gap-1 pt-1">
              <span 
                v-for="t in post.tags" 
                :key="t"
                class="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-50 text-brand-textSecondary border"
              >
                {{ t }}
              </span>
            </div>
          </div>

          <!-- Right: Metadata & Answers count -->
          <div class="text-left md:text-right text-[10px] text-brand-textSecondary space-y-1.5 flex-shrink-0">
            <span class="block font-semibold">Author: {{ post.author }}</span>
            <span class="inline-block px-2.5 py-1 rounded bg-slate-100 font-bold">
              {{ post.answers }} Answers
            </span>
          </div>

        </div>
      </div>

    </div>

    <!-- Tab 2: Study Groups -->
    <div v-else-if="selectedTab === 'groups'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="group in studyGroups" 
        :key="group.id"
        class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium flex flex-col justify-between hover:border-brand-accent transition-all duration-200"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="w-10 h-10 rounded-xl bg-sky-50 text-brand-accent flex items-center justify-center font-bold">
              <BookOpen class="w-5 h-5" />
            </span>
            <span class="text-[10px] font-semibold text-brand-textSecondary">{{ group.members }} Active Members</span>
          </div>

          <h3 class="text-sm font-bold text-brand-textPrimary leading-snug mt-2">{{ group.name }}</h3>
          <p class="text-[11px] leading-relaxed text-brand-textSecondary">{{ group.description }}</p>
        </div>

        <button 
          @click="handleJoinGroup(group)"
          class="w-full mt-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-premium-sm"
          :class="[
            group.joined 
              ? 'bg-emerald-50 text-brand-success border border-emerald-100 hover:bg-red-50 hover:text-brand-danger hover:border-red-100' 
              : 'bg-brand-accent text-white hover:bg-sky-700'
          ]"
        >
          <Check v-if="group.joined" class="w-4 h-4" /> {{ group.joined ? 'Joined Group' : 'Join Circle' }}
        </button>
      </div>
    </div>

    <!-- Tab 3: Advisor Booker -->
    <div v-else-if="selectedTab === 'booker'" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade">
      <div 
        v-for="adv in advisors" 
        :key="adv.id"
        class="bg-brand-cardBg border border-brand-border rounded-2xl p-5 shadow-premium flex flex-col justify-between hover:border-brand-accent transition-all duration-200"
      >
        <div class="space-y-4">
          <!-- Profile header -->
          <div class="flex items-start gap-4">
            <img :src="adv.avatar" alt="Avatar" class="w-12 h-12 rounded-xl object-cover border" />
            <div class="space-y-0.5">
              <h4 class="text-xs font-extrabold text-brand-textPrimary flex items-center gap-1">
                {{ adv.name }}
                <span class="text-[9px] font-bold text-brand-warning flex items-center gap-0.5 ml-1">⭐ {{ adv.rating }}</span>
              </h4>
              <p class="text-[10px] text-brand-textSecondary font-semibold">{{ adv.role }}</p>
              <span class="inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-bold bg-sky-50 text-brand-accent uppercase">Verified Consultant</span>
            </div>
          </div>

          <!-- Availability slots -->
          <div class="space-y-2 pt-2 border-t border-brand-border">
            <span class="text-[9px] font-bold text-brand-textSecondary uppercase tracking-wider block">Available Slots (1-on-1 Zoom)</span>
            <div class="grid grid-cols-1 gap-2">
              <button 
                v-for="slot in adv.availability" 
                :key="slot"
                @click="handleBookSession(adv.name, slot)"
                class="w-full p-2 border border-dashed rounded-xl text-left text-[10px] font-semibold text-brand-textSecondary hover:border-brand-accent hover:text-brand-accent hover:bg-sky-50/20 transition-all flex items-center gap-1.5"
              >
                <Video class="w-3.5 h-3.5" /> {{ slot }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Toast -->
    <div 
      v-if="showBookToast" 
      class="fixed bottom-6 right-6 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-premium z-50 flex items-center gap-2 animate-fade"
    >
      <UserCheck class="w-4 h-4 text-brand-accent animate-pulse" /> {{ bookedDetails }}
    </div>

  </div>
</template>
