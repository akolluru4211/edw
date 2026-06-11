import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  rating?: 'up' | 'down' | null
  feedbackText?: string | null
  widget?: {
    type: 'course' | 'job'
    id: string
  } | null
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  modelUsed: string
}

export interface TokenLog {
  id: string
  timestamp: string
  modelUsed: string
  promptTokens: number
  completionTokens: number
  estimatedCost: number
}

export const useAiMentorStore = defineStore('aiMentor', () => {
  // Load initial state from localStorage
  const savedConversations = localStorage.getItem('edworld_mentor_conversations')
  const savedTokenLogs = localStorage.getItem('edworld_mentor_token_logs')
  const savedSettings = localStorage.getItem('edworld_mentor_settings')

  const conversations = ref<Conversation[]>(
    savedConversations ? JSON.parse(savedConversations) : []
  )
  const tokenLogs = ref<TokenLog[]>(
    savedTokenLogs ? JSON.parse(savedTokenLogs) : []
  )

  const activeConversationId = ref<string | null>(
    conversations.value.length > 0 ? conversations.value[0].id : null
  )

  const modelSettings = ref({
    model: 'claude-3.5-sonnet',
    temperature: 0.7,
    systemPrompt: 'You are "Alex", a warm, empathetic, and expert AI Career Coach and Academic Mentor for EdWorld Co. Your goal is to guide college students through career planning, resume review, mock interviews, skill gap analysis, and academic navigation. You should utilize their profile details to give hyper-personalized advice. Be encouraging, action-oriented, and structure your responses with markdown. Feel free to suggest specific courses or internships that align with their goals.'
  })

  if (savedSettings) {
    modelSettings.value = { ...modelSettings.value, ...JSON.parse(savedSettings) }
  }

  const isGenerating = ref(false)

  // Computed
  const activeConversation = computed(() => {
    return conversations.value.find(c => c.id === activeConversationId.value) || null
  })

  const totalCost = computed(() => {
    return tokenLogs.value.reduce((sum, log) => sum + log.estimatedCost, 0)
  })

  // Watchers to persist state
  watch(
    conversations,
    (newVal) => {
      localStorage.setItem('edworld_mentor_conversations', JSON.stringify(newVal))
    },
    { deep: true }
  )

  watch(
    tokenLogs,
    (newVal) => {
      localStorage.setItem('edworld_mentor_token_logs', JSON.stringify(newVal))
    },
    { deep: true }
  )

  watch(
    modelSettings,
    (newVal) => {
      localStorage.setItem('edworld_mentor_settings', JSON.stringify(newVal))
    },
    { deep: true }
  )

  // Actions
  const startNewConversation = () => {
    const id = 'conv_' + Date.now()
    const newConv: Conversation = {
      id,
      title: 'New Discussion',
      messages: [
        {
          role: 'assistant',
          content: 'Hello! I\'m **Alex**, your career development coach and academic mentor. How can I help you today? We can discuss career goals, design a personalized study plan, conduct mock interviews, or review your resume.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      modelUsed: modelSettings.value.model
    }

    conversations.value.unshift(newConv)
    activeConversationId.value = id
    return id
  }

  const deleteConversation = (id: string) => {
    const index = conversations.value.findIndex(c => c.id === id)
    if (index !== -1) {
      conversations.value.splice(index, 1)
      if (activeConversationId.value === id) {
        activeConversationId.value = conversations.value.length > 0 ? conversations.value[0].id : null
      }
    }
  }

  const selectConversation = (id: string) => {
    activeConversationId.value = id
  }

  const clearAllConversations = () => {
    conversations.value = []
    activeConversationId.value = null
  }

  const addMessage = (message: Omit<Message, 'timestamp'>) => {
    if (!activeConversation.value) {
      startNewConversation()
    }

    if (activeConversation.value) {
      const fullMessage: Message = {
        ...message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      activeConversation.value.messages.push(fullMessage)

      // Set conversation title to the first user query if it is default
      if (
        activeConversation.value.title === 'New Discussion' &&
        message.role === 'user'
      ) {
        const titleText = message.content.length > 28
          ? message.content.substring(0, 25) + '...'
          : message.content
        activeConversation.value.title = titleText
      }
    }
  }

  const rateMessage = (messageIndex: number, rating: 'up' | 'down', feedbackText: string | null = null) => {
    if (activeConversation.value && activeConversation.value.messages[messageIndex]) {
      activeConversation.value.messages[messageIndex].rating = rating
      activeConversation.value.messages[messageIndex].feedbackText = feedbackText
    }
  }

  const logTokens = (model: string, promptTokens: number, completionTokens: number) => {
    // Pricing estimations per 1k tokens
    // Claude 3.5 Sonnet: Prompt $0.003, Completion $0.015
    // Grok-2: Prompt $0.002, Completion $0.010
    // Llama 3: Prompt $0.0002, Completion $0.0006
    let rates = { prompt: 0.003, completion: 0.015 }
    if (model.includes('grok')) {
      rates = { prompt: 0.002, completion: 0.010 }
    } else if (model.includes('llama')) {
      rates = { prompt: 0.0002, completion: 0.0006 }
    }

    const estimatedCost =
      (promptTokens / 1000) * rates.prompt + (completionTokens / 1000) * rates.completion

    tokenLogs.value.unshift({
      id: 'log_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      modelUsed: model,
      promptTokens,
      completionTokens,
      estimatedCost
    })
  }

  return {
    conversations,
    tokenLogs,
    activeConversationId,
    activeConversation,
    modelSettings,
    isGenerating,
    totalCost,
    startNewConversation,
    deleteConversation,
    selectConversation,
    clearAllConversations,
    addMessage,
    rateMessage,
    logTokens
  }
})
