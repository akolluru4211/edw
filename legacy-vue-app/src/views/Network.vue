<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Search, 
  MapPin, 
  MessageSquare, 
  UserPlus, 
  Send, 
  CheckCircle2, 
  X
} from 'lucide-vue-next'

interface Connection {
  id: string
  name: string
  avatar: string
  role: 'Student' | 'Alumni' | 'Mentor'
  headline: string
  distance: number
  skills: string[]
  college: string
  x: number // Map coordinate percentage
  y: number // Map coordinate percentage
  connected: boolean
  pending: boolean
  verified: boolean
}

// Mock connections nearby
const connections = ref<Connection[]>([
  {
    id: 'c_user1',
    name: 'Sneha Reddy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    role: 'Student',
    headline: 'Junior CS Major | Mobile App Developer',
    distance: 1.8,
    skills: ['JavaScript', 'Python', 'React Native'],
    college: 'State University of Technology',
    x: 35,
    y: 45,
    connected: false,
    pending: false,
    verified: false
  },
  {
    id: 'c_user2',
    name: 'Karan Sharma',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    role: 'Alumni',
    headline: 'Software Engineer @ Google | DSA Mentor',
    distance: 4.2,
    skills: ['Python', 'DSA', 'Go', 'System Design'],
    college: 'State University of Technology',
    x: 65,
    y: 30,
    connected: true,
    pending: false,
    verified: true
  },
  {
    id: 'c_user3',
    name: 'Dr. Anita Desai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    role: 'Mentor',
    headline: 'Professor of AI/ML | Researcher',
    distance: 12.5,
    skills: ['Python', 'Machine Learning', 'Data Science'],
    college: 'State University of Technology',
    x: 50,
    y: 65,
    connected: false,
    pending: false,
    verified: true
  },
  {
    id: 'c_user4',
    name: 'Rahul Varma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'Student',
    headline: 'Sophomore CS Student | Vue.js Enthusiast',
    distance: 0.8,
    skills: ['Vue.js', 'TypeScript', 'Tailwind CSS'],
    college: 'State University of Technology',
    x: 48,
    y: 38,
    connected: false,
    pending: true,
    verified: false
  },
  {
    id: 'c_user5',
    name: 'Meera Sen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'Alumni',
    headline: 'UI/UX Designer @ Vercel',
    distance: 24.1,
    skills: ['Tailwind CSS', 'Figma', 'React', 'HTML/CSS'],
    college: 'EdWorld College of Design',
    x: 80,
    y: 55,
    connected: true,
    pending: false,
    verified: true
  }
])

const searchInput = ref('')
const maxRadius = ref(25) // Search radius slider
const selectedConnection = ref<Connection | null>(connections.value[0])
const isChatOpen = ref(false)
const messageText = ref('')
const chatLogs = ref<Array<{ sender: 'me' | 'them'; text: string; time: string }>>([
  { sender: 'them', text: 'Hey Arjun! Saw your portfolio project on GitHub. Great work with the state management structure.', time: '10:04 AM' },
  { sender: 'me', text: 'Thanks Karan! I appreciate the review. I actually followed some guidelines from your system design posts.', time: '10:06 AM' }
])

const isReplying = ref(false)

// Filtered connection lists
const filteredConnections = computed(() => {
  return connections.value.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchInput.value.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(searchInput.value.toLowerCase()))

    const matchesRadius = c.distance <= maxRadius.value
    
    return matchesSearch && matchesRadius
  })
})

const handleConnect = (conn: Connection) => {
  conn.pending = true
  // Simulate request completion
  setTimeout(() => {
    // Optionally trigger toast
  }, 1000)
}

const openChat = (conn: Connection) => {
  selectedConnection.value = conn
  isChatOpen.value = true
}

const handleSendMessage = () => {
  if (!messageText.value.trim()) return

  chatLogs.value.push({
    sender: 'me',
    text: messageText.value.trim(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  messageText.value = ''

  // Simulate typing indicator and response from connection
  isReplying.value = true
  setTimeout(() => {
    isReplying.value = false
    chatLogs.value.push({
      sender: 'them',
      text: `Thanks for messaging! Let's sync up this Friday. I'm glad we connected on EdWorld.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }, 2500)
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col lg:flex-row border border-brand-border rounded-3xl bg-brand-bg shadow-premium overflow-hidden">
    
    <!-- Left Panel: Controls and Connections List -->
    <div class="w-full lg:w-96 border-r border-brand-border flex flex-col bg-slate-50/40 flex-shrink-0 h-1/2 lg:h-full">
      
      <!-- Headers Search -->
      <div class="p-4 border-b border-brand-border bg-white space-y-3">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="w-4 h-4 text-brand-textSecondary" />
          </span>
          <input 
            type="text" 
            v-model="searchInput"
            placeholder="Search connections by skill or major..."
            class="w-full pl-9 pr-4 py-2 text-xs border border-brand-border rounded-xl bg-brand-secBg text-brand-textPrimary placeholder-brand-textSecondary focus:outline-none focus:border-brand-accent focus:bg-white"
          />
        </div>

        <!-- Radius Slider -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-bold text-brand-textSecondary uppercase tracking-wider">Discover Radius</span>
            <span class="text-xs font-black text-brand-accent">{{ maxRadius }} km</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="25" 
            v-model.number="maxRadius"
            class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
        </div>
      </div>

      <!-- Connections List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div 
          v-for="conn in filteredConnections" 
          :key="conn.id"
          class="p-4 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 bg-white hover:border-brand-accent hover:shadow-premium-sm"
          :class="[selectedConnection?.id === conn.id ? 'border-brand-accent bg-sky-50/10' : 'border-brand-border']"
          @click="selectedConnection = conn"
        >
          <!-- Avatar -->
          <div class="relative flex-shrink-0">
            <img :src="conn.avatar" :alt="conn.name" class="w-10 h-10 rounded-full object-cover border-2" 
              :class="[
                conn.role === 'Mentor' ? 'border-emerald-300' :
                conn.role === 'Alumni' ? 'border-indigo-300' : 'border-sky-300'
              ]"
            />
            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
              :class="[
                conn.role === 'Mentor' ? 'bg-brand-success' :
                conn.role === 'Alumni' ? 'bg-indigo-600' : 'bg-brand-accent'
              ]"
            ></span>
          </div>

          <!-- Metadata -->
          <div class="space-y-1 overflow-hidden flex-1">
            <div class="flex items-center gap-1.5 overflow-hidden">
              <span class="text-xs font-bold text-brand-textPrimary truncate">{{ conn.name }}</span>
              <CheckCircle2 v-if="conn.verified" class="w-3.5 h-3.5 text-brand-success flex-shrink-0" />
            </div>
            
            <p class="text-[10px] text-brand-textSecondary truncate font-medium">{{ conn.headline }}</p>
            
            <div class="flex items-center gap-2 text-[9px] text-brand-textSecondary font-semibold">
              <span class="flex items-center gap-0.5"><MapPin class="w-3 h-3" /> {{ conn.distance }} km</span>
              <span>•</span>
              <span class="truncate">{{ conn.college }}</span>
            </div>
          </div>
        </div>

        <div v-if="filteredConnections.length === 0" class="text-center py-10 text-xs text-brand-textSecondary font-semibold">
          No matches found in this radius.
        </div>
      </div>

    </div>

    <!-- Right Panel: Coordinate Map & Selected mini-profile -->
    <div class="flex-1 flex flex-col h-1/2 lg:h-full relative bg-brand-secBg">
      
      <!-- Interactive SVG Vector Map -->
      <div class="flex-1 relative overflow-hidden flex items-center justify-center p-6 bg-slate-50/50">
        
        <!-- Grid overlay -->
        <div class="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        <!-- Radar ripple -->
        <div class="absolute w-72 h-72 rounded-full border border-sky-100 bg-sky-50/5 animate-pulse flex items-center justify-center">
          <div class="w-48 h-48 rounded-full border border-sky-100/50 flex items-center justify-center">
            <div class="w-24 h-24 rounded-full border border-sky-100/30"></div>
          </div>
        </div>

        <!-- Core Marker (Current User) -->
        <div class="absolute z-20 text-center flex flex-col items-center">
          <div class="w-10 h-10 rounded-full border-4 border-white bg-brand-accent flex items-center justify-center text-white font-bold shadow-premium-lg">
            Me
          </div>
          <span class="text-[9px] font-bold text-brand-textSecondary bg-white border border-brand-border px-1.5 py-0.5 rounded shadow-sm mt-1">My Location</span>
        </div>

        <!-- Interactive Pins -->
        <button 
          v-for="conn in filteredConnections" 
          :key="conn.id"
          class="absolute z-10 p-1 rounded-full border-2 border-white shadow-premium hover:scale-110 active:scale-95 transition-transform duration-200 focus:outline-none"
          :class="[
            selectedConnection?.id === conn.id ? 'scale-115 ring-2 ring-brand-accent' : '',
            conn.role === 'Mentor' ? 'bg-emerald-500' :
            conn.role === 'Alumni' ? 'bg-indigo-600' : 'bg-brand-accent'
          ]"
          :style="{ left: conn.x + '%', top: conn.y + '%' }"
          @click="selectedConnection = conn"
          :title="`${conn.name} (${conn.distance} km)`"
        >
          <img :src="conn.avatar" :alt="conn.name" class="w-8 h-8 rounded-full object-cover" />
        </button>

      </div>

      <!-- Selected User Bottom Overlay -->
      <div 
        v-if="selectedConnection"
        class="bg-white border-t border-brand-border p-5 shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10"
      >
        <div class="flex items-start gap-4">
          <img :src="selectedConnection.avatar" alt="Avatar" class="w-12 h-12 rounded-xl object-cover border border-brand-border" />
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-brand-textPrimary flex items-center gap-1.5">
              {{ selectedConnection.name }}
              <span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
                :class="[
                  selectedConnection.role === 'Mentor' ? 'bg-emerald-50 text-brand-success' :
                  selectedConnection.role === 'Alumni' ? 'bg-indigo-50 text-indigo-600' : 'bg-sky-50 text-brand-accent'
                ]"
              >
                {{ selectedConnection.role }}
              </span>
            </h4>
            <p class="text-xs text-brand-textSecondary leading-snug">{{ selectedConnection.headline }}</p>
            <div class="flex flex-wrap gap-1 pt-1">
              <span 
                v-for="s in selectedConnection.skills" 
                :key="s"
                class="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-50 text-brand-textSecondary border"
              >
                {{ s }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-end">
          <button 
            v-if="!selectedConnection.connected && !selectedConnection.pending"
            @click="handleConnect(selectedConnection)"
            class="px-4 py-2 bg-brand-accentLight text-brand-accent hover:bg-brand-accent hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-premium-sm"
          >
            <UserPlus class="w-4 h-4" /> Connect
          </button>
          <span 
            v-else-if="selectedConnection.pending"
            class="px-4 py-2 bg-amber-50 text-brand-warning text-xs font-bold rounded-xl border border-amber-100 flex items-center gap-1"
          >
            Request Sent
          </span>
          <button 
            v-if="selectedConnection.connected"
            @click="openChat(selectedConnection)"
            class="px-4 py-2 bg-brand-accent text-white hover:bg-sky-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-premium"
          >
            <MessageSquare class="w-4 h-4" /> Chat
          </button>
        </div>
      </div>

    </div>

    <!-- Direct Messages Slide-over Panel -->
    <div 
      v-if="isChatOpen && selectedConnection" 
      class="fixed inset-y-0 right-0 w-80 bg-white border-l border-brand-border shadow-premium z-50 flex flex-col animate-slide-fade"
    >
      <!-- Chat Header -->
      <div class="h-16 border-b border-brand-border px-4 flex items-center justify-between bg-slate-50/50 flex-shrink-0 shadow-premium-sm">
        <div class="flex items-center gap-2 overflow-hidden">
          <img :src="selectedConnection.avatar" alt="Avatar" class="w-8 h-8 rounded-full object-cover border" />
          <div class="overflow-hidden">
            <span class="text-xs font-bold text-brand-textPrimary block truncate">{{ selectedConnection.name }}</span>
            <span class="text-[9px] text-brand-success font-semibold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-success"></span> Online
            </span>
          </div>
        </div>
        <button @click="isChatOpen = false" class="text-brand-textSecondary hover:text-brand-textPrimary">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Chat Logs -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div 
          v-for="(chat, idx) in chatLogs" 
          :key="idx" 
          class="flex flex-col max-w-[80%]"
          :class="[chat.sender === 'me' ? 'ml-auto items-end' : 'mr-auto items-start']"
        >
          <div 
            class="px-3.5 py-2 rounded-2xl border text-xs leading-relaxed"
            :class="[
              chat.sender === 'me' 
                ? 'bg-brand-accent border-brand-accent text-white rounded-tr-none' 
                : 'bg-brand-secBg border-brand-border text-brand-textPrimary rounded-tl-none'
            ]"
          >
            {{ chat.text }}
          </div>
          <span class="text-[8px] text-brand-textSecondary font-semibold mt-1">{{ chat.time }}</span>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isReplying" class="flex items-start gap-1 p-2 rounded-xl bg-slate-50 mr-auto max-w-[60%] border">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-textSecondary animate-bounce"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-brand-textSecondary animate-bounce" style="animation-delay: 0.15s"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-brand-textSecondary animate-bounce" style="animation-delay: 0.3s"></span>
        </div>
      </div>

      <!-- Chat Input -->
      <form @submit.prevent="handleSendMessage" class="p-4 border-t border-brand-border bg-slate-50/50 flex gap-2 flex-shrink-0">
        <input 
          type="text" 
          v-model="messageText"
          placeholder="Type a message..."
          class="flex-1 px-3 py-2 text-xs border border-brand-border rounded-xl bg-white text-brand-textPrimary placeholder-brand-textSecondary focus:outline-none focus:border-brand-accent"
        />
        <button 
          type="submit" 
          class="p-2 bg-brand-accent hover:bg-sky-700 text-white rounded-xl shadow-premium transition-colors"
        >
          <Send class="w-4 h-4" />
        </button>
      </form>

    </div>

  </div>
</template>
