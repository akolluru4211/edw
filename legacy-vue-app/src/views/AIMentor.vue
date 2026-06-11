<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useAiMentorStore } from '../stores/aiMentor'
import type { Message } from '../stores/aiMentor'
import { useAuthStore } from '../stores/auth'
import { callOpenRouterAPI } from '../services/openrouter'
import AIResponseCard from '../components/AIResponseCard.vue'
import { 
  Plus, 
  Trash2, 
  Send, 
  Settings2, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  ChevronRight,
  Info,
  Check,
  AlertCircle,
  UploadCloud
} from 'lucide-vue-next'

const mentorStore = useAiMentorStore()
const authStore = useAuthStore()

const textInput = ref('')
const showSettingsSidebar = ref(false)
const showRatingModal = ref(false)
const ratingIndex = ref<number | null>(null)
const feedbackComment = ref('')
const activeToastMessage = ref('')
const chatContainer = ref<HTMLElement | null>(null)

// Mock Drag and drop state
const dragover = ref(false)

// Prompt templates for quick action chips
const quickActions = [
  { label: '📄 Review My Resume', prompt: 'Review my resume and suggest improvements.' },
  { label: '📅 Study Plan', prompt: 'Generate a personalized study plan for Web Engineering.' },
  { label: '🤝 Mock Interview', prompt: 'Start a mock interview for a Frontend Intern role.' },
  { label: '💼 Opportunity Match', prompt: 'Suggest internships that match my profile.' }
]

// Auto scroll chat to bottom
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// Ensure at least one active conversation exists
onMounted(() => {
  if (mentorStore.conversations.length === 0) {
    mentorStore.startNewConversation()
  }
  scrollToBottom()
})

// Scroll on new messages
watch(
  () => mentorStore.activeConversation?.messages.length,
  () => {
    scrollToBottom()
  }
)

const handleSendMessage = async (customPrompt?: string) => {
  const content = customPrompt || textInput.value.trim()
  if (!content) return

  if (!customPrompt) {
    textInput.value = ''
  }

  // Add User Message
  mentorStore.addMessage({
    role: 'user',
    content
  })
  scrollToBottom()

  mentorStore.isGenerating = true

  try {
    const activeConv = mentorStore.activeConversation
    if (!activeConv) return

    // Prepare system messages and profile context
    const profile = authStore.profile
    const systemPromptText = `${mentorStore.modelSettings.systemPrompt}
USER CONTEXT:
Name: ${profile.firstName} ${profile.lastName}
Headline: ${profile.headline}
Major: ${profile.major} at ${profile.college}
Goals: ${profile.careerGoals}
Active Skills: ${profile.skills.join(', ')}
Uploaded Resume: ${profile.resumeName || 'None'}
`
    const messages = [
      { role: 'system', content: systemPromptText },
      ...activeConv.messages.map(m => ({ role: m.role, content: m.content }))
    ]

    // API Request
    const response = await callOpenRouterAPI(
      messages,
      mentorStore.modelSettings.model,
      mentorStore.modelSettings.temperature
    )

    const choice = response.choices?.[0]?.message
    if (choice) {
      // Determine widget inline rendering triggers
      let widget: Message['widget'] = null
      
      const text = choice.content.toLowerCase()
      if (text.includes('course') || text.includes('enroll') || text.includes('study plan')) {
        // Recommend Advanced Vue 3 (c1) or DSA (c2)
        widget = { type: 'course', id: 'c1' }
      } else if (text.includes('job') || text.includes('internship') || text.includes('match') || text.includes('apply')) {
        // Recommend TechVibe (j1)
        widget = { type: 'job', id: 'j1' }
      }

      // Add assistant message
      mentorStore.addMessage({
        role: 'assistant',
        content: choice.content,
        widget
      })

      // Log API billing tokens
      if (response.usage) {
        mentorStore.logTokens(
          mentorStore.modelSettings.model,
          response.usage.prompt_tokens,
          response.usage.completion_tokens
        )
      }
    }
  } catch (error) {
    console.error('Chat error:', error)
    mentorStore.addMessage({
      role: 'assistant',
      content: '❌ **System Error**: I encountered an issue connecting to the AI service. Please check your OpenRouter API key configuration in settings, or try again later.'
    })
  } finally {
    mentorStore.isGenerating = false
    scrollToBottom()
  }
}

// Widget action callbacks
const handleWidgetAction = (toastText: string) => {
  triggerToast(toastText)
}

const triggerToast = (msg: string) => {
  activeToastMessage.value = msg
  setTimeout(() => {
    activeToastMessage.value = ''
  }, 3000)
}

// Ratings modal handling
const openRatingModal = (index: number) => {
  ratingIndex.value = index
  feedbackComment.value = ''
  showRatingModal.value = true
}

const submitNegativeRating = () => {
  if (ratingIndex.value !== null) {
    mentorStore.rateMessage(ratingIndex.value, 'down', feedbackComment.value)
    showRatingModal.value = false
    triggerToast('Feedback submitted. Thanks for helping me improve!')
  }
}

const handlePositiveRating = (index: number) => {
  mentorStore.rateMessage(index, 'up')
  triggerToast('Message marked as helpful!')
}

// Simple custom markdown formatter to render bold, bullet points and headers
const renderMarkdown = (text: string) => {
  if (!text) return ''
  let html = text
    // Replace headers
    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-brand-textPrimary mt-3 mb-1.5">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-xs font-bold text-brand-textPrimary mt-2 mb-1">$1</h4>')
    // Replace bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-extrabold text-brand-textPrimary">$1</strong>')
    // Replace italic
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    // Replace code inline
    .replace(/`(.*?)`/gim, '<code class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-brand-danger text-[10px] font-mono">$1</code>')
    // Bullet points
    .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-xs leading-relaxed text-brand-textSecondary mt-0.5">$1</li>')
    // Numbers list
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-xs leading-relaxed text-brand-textSecondary mt-0.5">$1</li>')
    // Paragraph spacing
    .split('\n').map(para => {
      if (para.trim() === '') return ''
      if (para.startsWith('<li') || para.startsWith('<h3') || para.startsWith('<h4')) return para
      return `<p class="text-xs leading-relaxed text-brand-textSecondary mb-2">${para}</p>`
    }).join('\n')

  return html
}

// Drag over resume listener
const handleDropResume = (e: DragEvent) => {
  dragover.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0]
    if (file.name.endsWith('.pdf')) {
      authStore.uploadResume(file.name)
      triggerToast(`Uploaded "${file.name}"! Discussing resume optimization now.`)
      handleSendMessage('Please review my uploaded resume.')
    } else {
      alert('Only PDF resumes are supported.')
    }
  }
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex border border-brand-border rounded-3xl bg-brand-bg shadow-premium overflow-hidden relative">
    
    <!-- Left Chat Sidebar: History list -->
    <div class="hidden md:flex flex-col w-64 border-r border-brand-border bg-slate-50/40 flex-shrink-0">
      
      <!-- New Discussion Button -->
      <div class="p-4 border-b border-brand-border">
        <button 
          @click="mentorStore.startNewConversation"
          class="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-brand-border hover:border-brand-accent hover:text-brand-accent rounded-xl text-xs font-bold text-brand-textPrimary shadow-premium-sm transition-all duration-200"
        >
          <Plus class="w-4 h-4" /> New Career Chat
        </button>
      </div>

      <!-- History List -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1">
        <div 
          v-for="conv in mentorStore.conversations" 
          :key="conv.id"
          class="flex items-center justify-between group p-2.5 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors"
          :class="[mentorStore.activeConversationId === conv.id ? 'bg-white border border-brand-border shadow-premium-sm' : '']"
          @click="mentorStore.selectConversation(conv.id)"
        >
          <div class="overflow-hidden flex-1 pr-2">
            <span class="text-xs font-bold text-brand-textPrimary block truncate">
              {{ conv.title }}
            </span>
            <span class="text-[9px] text-brand-textSecondary block font-semibold mt-0.5">
              {{ conv.createdAt }} • {{ conv.modelUsed.replace('anthropic/', '').replace('x-ai/', '') }}
            </span>
          </div>
          
          <button 
            @click.stop="mentorStore.deleteConversation(conv.id)"
            class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-brand-danger text-brand-textSecondary transition-all"
            title="Delete Chat"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>

        <div 
          v-if="mentorStore.conversations.length === 0" 
          class="text-center py-10 text-[10px] text-brand-textSecondary"
        >
          No discussions yet. Click "New Career Chat" to start.
        </div>
      </div>

      <!-- Sidebar Footer: Estimated Session Cost -->
      <div class="p-4 border-t border-brand-border bg-slate-100/40 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-brand-textSecondary font-semibold">AI Usage Budget</span>
          <span class="font-bold text-brand-textPrimary">${{ mentorStore.totalCost.toFixed(3) }}</span>
        </div>
        <div class="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
          <div class="bg-brand-accent h-full" :style="{ width: Math.min(100, (mentorStore.totalCost / 2) * 100) + '%' }"></div>
        </div>
        <span class="text-[9px] text-brand-textSecondary block text-right font-medium">Free Tier ($2.00 max)</span>
      </div>

    </div>

    <!-- Middle Pane: Active Chat interface -->
    <div 
      class="flex-1 flex flex-col h-full bg-white relative"
      :class="[dragover ? 'bg-sky-50/10' : '']"
      @dragover.prevent="dragover = true"
      @dragleave.prevent="dragover = false"
      @drop.prevent="handleDropResume"
    >
      
      <!-- Chat Header -->
      <div class="h-14 border-b border-brand-border px-4 lg:px-6 flex items-center justify-between flex-shrink-0 bg-white z-10 shadow-premium-sm">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-brand-accentLight text-brand-accent flex items-center justify-center font-bold text-sm">
            🤖
          </div>
          <div>
            <span class="text-xs font-bold text-brand-textPrimary block">Alex (Career Coach)</span>
            <span class="text-[9px] text-brand-textSecondary block flex items-center gap-1">
              Active Model: <span class="px-1 py-0.5 rounded bg-slate-100 text-[8px] font-black text-brand-accent uppercase tracking-wide">{{ mentorStore.modelSettings.model.replace('anthropic/', '').replace('x-ai/', '') }}</span>
            </span>
          </div>
        </div>

        <button 
          @click="showSettingsSidebar = !showSettingsSidebar"
          class="p-2 rounded-xl text-brand-textSecondary hover:text-brand-textPrimary hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold border border-brand-border shadow-premium-sm"
        >
          <Settings2 class="w-4 h-4" /> Parameters
        </button>
      </div>

      <!-- Drag & Drop overlay indicator -->
      <div 
        v-if="dragover" 
        class="absolute inset-0 bg-brand-accent/5 backdrop-blur-[2px] flex items-center justify-center z-40 border-2 border-dashed border-brand-accent m-4 rounded-2xl pointer-events-none"
      >
        <div class="text-center space-y-2">
          <UploadCloud class="w-12 h-12 text-brand-accent mx-auto animate-bounce" />
          <h3 class="font-bold text-sm text-brand-textPrimary">Drop Resume PDF here</h3>
          <p class="text-xs text-brand-textSecondary">Upload directly to discuss with Alex</p>
        </div>
      </div>

      <!-- Chat Bubble Message List -->
      <div 
        ref="chatContainer"
        class="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4"
      >
        <div 
          v-for="(msg, index) in mentorStore.activeConversation?.messages" 
          :key="index"
          class="flex items-start gap-3 max-w-2xl chat-bubble-anim"
          :class="[msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto']"
        >
          <!-- Avatar -->
          <div 
            class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs border"
            :class="[msg.role === 'user' ? 'bg-sky-50 text-brand-accent border-brand-border' : 'bg-slate-50 text-brand-textSecondary border-brand-border']"
          >
            <User v-if="msg.role === 'user'" class="w-4 h-4" />
            <span v-else>🤖</span>
          </div>

          <!-- Message box -->
          <div class="space-y-1 overflow-hidden">
            <div 
              class="px-4 py-2.5 rounded-2xl shadow-premium-sm border"
              :class="[
                msg.role === 'user' 
                  ? 'bg-brand-accent border-brand-accent text-white rounded-tr-none' 
                  : 'bg-brand-secBg border-brand-border text-brand-textPrimary rounded-tl-none'
              ]"
            >
              <!-- Content rendering -->
              <div 
                v-if="msg.role === 'assistant'" 
                v-html="renderMarkdown(msg.content)" 
                class="space-y-1.5"
              ></div>
              <p v-else class="text-xs leading-relaxed">{{ msg.content }}</p>
            </div>

            <!-- Inline Widget rendering if active -->
            <AIResponseCard 
              v-if="msg.widget" 
              :widget="msg.widget" 
              @action-completed="handleWidgetAction" 
            />

            <!-- Message rating bar for Assistant -->
            <div 
              v-if="msg.role === 'assistant' && index > 0" 
              class="flex items-center gap-2 pl-2 text-[10px] text-brand-textSecondary"
            >
              <span>Was this helpful?</span>
              <button 
                @click="handlePositiveRating(index)"
                class="p-1 rounded hover:bg-slate-100 transition-colors"
                :class="[msg.rating === 'up' ? 'text-brand-success' : '']"
              >
                <ThumbsUp class="w-3.5 h-3.5" />
              </button>
              <button 
                @click="openRatingModal(index)"
                class="p-1 rounded hover:bg-slate-100 transition-colors"
                :class="[msg.rating === 'down' ? 'text-brand-danger' : '']"
              >
                <ThumbsDown class="w-3.5 h-3.5" />
              </button>

              <span v-if="msg.rating === 'up'" class="text-brand-success font-bold flex items-center gap-0.5">
                <Check class="w-3 h-3" /> Helpful
              </span>
              <span v-else-if="msg.rating === 'down'" class="text-brand-danger font-bold flex items-center gap-0.5" :title="msg.feedbackText || ''">
                <AlertCircle class="w-3 h-3" /> Under review
              </span>
            </div>
          </div>
        </div>

        <!-- Generating Dot Bouncer Indicator -->
        <div v-if="mentorStore.isGenerating" class="flex items-start gap-3 max-w-xs mr-auto chat-bubble-anim">
          <div class="w-7 h-7 rounded-full bg-slate-50 text-brand-textSecondary border border-brand-border flex items-center justify-center text-xs">
            🤖
          </div>
          <div class="bg-brand-secBg border border-brand-border px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-premium-sm">
            <span class="w-2 h-2 rounded-full bg-brand-textSecondary animate-bounce"></span>
            <span class="w-2 h-2 rounded-full bg-brand-textSecondary animate-bounce" style="animation-delay: 0.15s"></span>
            <span class="w-2 h-2 rounded-full bg-brand-textSecondary animate-bounce" style="animation-delay: 0.3s"></span>
          </div>
        </div>
      </div>

      <!-- Bottom Chat Bar Controls -->
      <div class="p-4 border-t border-brand-border space-y-3 bg-white flex-shrink-0 z-10 shadow-premium">
        
        <!-- Suggestions Chips -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
          <button 
            v-for="action in quickActions" 
            :key="action.label"
            @click="handleSendMessage(action.prompt)"
            class="flex-shrink-0 px-3 py-1.5 bg-brand-secBg hover:bg-brand-accentLight border border-brand-border hover:border-brand-accent rounded-xl text-[10px] font-bold text-brand-textSecondary hover:text-brand-accent transition-all duration-200"
          >
            {{ action.label }}
          </button>
        </div>

        <!-- Input Box -->
        <form @submit.prevent="handleSendMessage()" class="flex items-center gap-2">
          <div class="relative flex-1">
            <input 
              type="text" 
              v-model="textInput"
              placeholder="Ask Alex for career paths, review your resume, or mock interviews..."
              class="w-full border border-brand-border rounded-xl pl-4 pr-10 py-3 text-xs bg-brand-secBg text-brand-textPrimary placeholder-brand-textSecondary focus:outline-none focus:border-brand-accent focus:bg-white transition-all shadow-premium-sm"
              :disabled="mentorStore.isGenerating"
            />
            
            <!-- Quick context notification -->
            <span class="absolute right-3 inset-y-0 flex items-center pointer-events-none text-[9px] text-brand-textSecondary font-semibold">
              Press Enter
            </span>
          </div>
          
          <button 
            type="submit" 
            class="p-3 bg-brand-accent hover:bg-sky-700 text-white rounded-xl shadow-premium transition-colors flex items-center justify-center flex-shrink-0"
            :disabled="mentorStore.isGenerating || !textInput.trim()"
          >
            <Send class="w-4.5 h-4.5" />
          </button>
        </form>
      </div>

    </div>

    <!-- Right Configuration Sidebar (collapsible drawer) -->
    <div 
      v-if="showSettingsSidebar"
      class="w-72 border-l border-brand-border bg-slate-50/50 flex flex-col h-full z-20 flex-shrink-0 animate-slide-fade"
    >
      <div class="h-14 border-b border-brand-border px-4 flex items-center justify-between bg-white shadow-premium-sm flex-shrink-0">
        <span class="text-xs font-black text-brand-textPrimary flex items-center gap-1.5">
          <Settings2 class="w-4 h-4 text-brand-accent" /> AI System Parameters
        </span>
        <button 
          @click="showSettingsSidebar = false" 
          class="p-1.5 rounded-lg hover:bg-slate-100 text-brand-textSecondary hover:text-brand-textPrimary transition-colors"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        
        <!-- Model Selection -->
        <div class="space-y-2">
          <span class="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">Routing Model</span>
          <div class="space-y-1.5">
            <label class="flex items-center justify-between p-2.5 rounded-xl border border-brand-border bg-white cursor-pointer hover:border-brand-accent">
              <div class="flex items-center gap-2">
                <input 
                  type="radio" 
                  value="anthropic/claude-3.5-sonnet" 
                  v-model="mentorStore.modelSettings.model"
                  class="text-brand-accent focus:ring-brand-accent"
                />
                <span class="text-[11px] font-bold text-brand-textPrimary">Claude 3.5 Sonnet</span>
              </div>
              <span class="text-[9px] text-brand-accent font-bold bg-sky-50 px-1 py-0.5 rounded">Primary</span>
            </label>

            <label class="flex items-center justify-between p-2.5 rounded-xl border border-brand-border bg-white cursor-pointer hover:border-brand-accent">
              <div class="flex items-center gap-2">
                <input 
                  type="radio" 
                  value="x-ai/grok-2" 
                  v-model="mentorStore.modelSettings.model"
                  class="text-brand-accent focus:ring-brand-accent"
                />
                <span class="text-[11px] font-bold text-brand-textPrimary">Grok-2</span>
              </div>
              <span class="text-[9px] text-brand-textSecondary font-bold bg-slate-100 px-1 py-0.5 rounded">Fast</span>
            </label>
            
            <label class="flex items-center justify-between p-2.5 rounded-xl border border-brand-border bg-white cursor-pointer hover:border-brand-accent">
              <div class="flex items-center gap-2">
                <input 
                  type="radio" 
                  value="meta/llama-3" 
                  v-model="mentorStore.modelSettings.model"
                  class="text-brand-accent focus:ring-brand-accent"
                />
                <span class="text-[11px] font-bold text-brand-textPrimary">Llama 3</span>
              </div>
              <span class="text-[9px] text-brand-warning font-bold bg-amber-50 px-1 py-0.5 rounded">Fallback</span>
            </label>
          </div>
        </div>

        <!-- Temperature slider -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">Temperature</span>
            <span class="text-xs font-black text-brand-accent">{{ mentorStore.modelSettings.temperature }}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1.2" 
            step="0.1" 
            v-model.number="mentorStore.modelSettings.temperature"
            class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
          <div class="flex justify-between text-[9px] text-brand-textSecondary font-semibold">
            <span>Precise (0.2)</span>
            <span>Balanced (0.7)</span>
            <span>Creative (1.0)</span>
          </div>
        </div>

        <!-- Context Injector Summary -->
        <div class="space-y-2">
          <span class="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">Profile Context Passed</span>
          <div class="p-3 bg-white rounded-xl border border-brand-border space-y-2">
            <div class="flex items-center gap-1.5 text-[10px] font-bold text-brand-textPrimary">
              <Info class="w-3.5 h-3.5 text-brand-accent" /> System Injector
            </div>
            <p class="text-[9px] leading-relaxed text-brand-textSecondary">
              Alex dynamically uses your major (<strong>{{ authStore.profile.major }}</strong>) and current skills checklist (<strong>{{ authStore.profile.skills.length }} skills</strong>) to custom-filter interview QA and courses.
            </p>
          </div>
        </div>

        <!-- Tokens log -->
        <div class="space-y-2">
          <span class="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">Transaction Logs</span>
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div 
              v-for="log in mentorStore.tokenLogs" 
              :key="log.id"
              class="p-2 border border-brand-border bg-white rounded-lg space-y-1 text-[9px]"
            >
              <div class="flex items-center justify-between font-bold text-brand-textPrimary">
                <span>{{ log.modelUsed.replace('anthropic/', '').replace('x-ai/', '') }}</span>
                <span class="text-brand-accent">${{ log.estimatedCost.toFixed(4) }}</span>
              </div>
              <div class="flex justify-between text-[8px] text-brand-textSecondary font-semibold">
                <span>Tokens: {{ log.promptTokens }}p / {{ log.completionTokens }}c</span>
                <span>{{ log.timestamp }}</span>
              </div>
            </div>
            
            <div 
              v-if="mentorStore.tokenLogs.length === 0" 
              class="text-center py-4 text-[9px] text-brand-textSecondary font-semibold"
            >
              No API logs yet.
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Rating modal dropdown overlay -->
    <div 
      v-if="showRatingModal" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="w-full max-w-sm bg-white border border-brand-border rounded-2xl p-5 shadow-premium space-y-4 animate-slide-fade">
        <div class="flex items-center gap-2 text-brand-danger">
          <AlertCircle class="w-5 h-5" />
          <h3 class="font-bold text-sm text-brand-textPrimary">Improve AI Responses</h3>
        </div>
        <p class="text-xs text-brand-textSecondary leading-relaxed">
          What was wrong with Alex's response? Your review updates the routing logs to help optimize performance.
        </p>
        
        <textarea 
          v-model="feedbackComment" 
          rows="3" 
          placeholder="E.g. Code syntax error, irrelevant course recommended..."
          class="w-full border border-brand-border rounded-xl p-2.5 text-xs bg-slate-50 focus:outline-none focus:border-brand-accent focus:bg-white resize-none"
        ></textarea>
        
        <div class="flex gap-2 justify-end">
          <button 
            @click="showRatingModal = false"
            class="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-brand-textSecondary rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="submitNegativeRating"
            class="px-4 py-2 text-xs font-bold bg-brand-accent hover:bg-sky-700 text-white rounded-xl shadow-premium transition-colors"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>

    <!-- System Feed Toast -->
    <div 
      v-if="activeToastMessage" 
      class="fixed bottom-6 right-6 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-premium z-50 flex items-center gap-2 animate-fade"
    >
      <Check class="w-4 h-4 text-brand-accent animate-pulse" /> {{ activeToastMessage }}
    </div>

  </div>
</template>
