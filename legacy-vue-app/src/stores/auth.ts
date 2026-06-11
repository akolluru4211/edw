import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserProfile {
  firstName: string
  lastName: string
  avatarUrl: string
  headline: string
  bio: string
  college: string
  degree: string
  major: string
  graduationYear: number
  careerGoals: string
  skills: string[]
  resumeName: string
  resumeUploadedAt: string | null
  portfolioLink: string
  githubProfile: string
  linkedinProfile: string
}

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<UserProfile>({
    firstName: 'Arjun',
    lastName: 'Kolluru',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    headline: 'Sophomore CS Student | Aspiring Software Engineer',
    bio: 'Passionate about frontend development, algorithms, and AI-driven applications. Looking for Web Engineering internships for Summer 2027.',
    college: 'State University of Technology',
    degree: 'B.Tech',
    major: 'Computer Science & Engineering',
    graduationYear: 2028,
    careerGoals: 'My primary goal is to become a high-impact Frontend/Full-Stack Software Engineer. I want to build interactive interfaces using modern frameworks, master state management, and integrate AI services into customer-facing products.',
    skills: ['JavaScript', 'HTML/CSS', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Python'],
    resumeName: '',
    resumeUploadedAt: null,
    portfolioLink: 'https://arjunkolluru.dev',
    githubProfile: 'github.com/arjunkolluru',
    linkedinProfile: 'linkedin.com/in/arjun-kolluru'
  })

  // Calculate profile completion percentage based on filled fields
  const profileCompletionScore = computed(() => {
    let score = 0
    const totalFields = 11

    if (profile.value.firstName && profile.value.lastName) score += 1
    if (profile.value.headline) score += 1
    if (profile.value.bio) score += 1
    if (profile.value.college && profile.value.major) score += 1
    if (profile.value.careerGoals) score += 1
    if (profile.value.skills.length > 0) score += 1
    if (profile.value.resumeName) score += 1
    if (profile.value.portfolioLink) score += 1
    if (profile.value.githubProfile) score += 1
    if (profile.value.linkedinProfile) score += 1
    if (profile.value.avatarUrl) score += 1

    return Math.round((score / totalFields) * 100)
  })

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    profile.value = { ...profile.value, ...updatedData }
  }

  const uploadResume = (fileName: string) => {
    profile.value.resumeName = fileName
    profile.value.resumeUploadedAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    // Add resume review skill or profile updates
    if (!profile.value.skills.includes('Resume Optimized')) {
      // profile.value.skills.push('Resume Review Completed');
    }
  }

  const deleteResume = () => {
    profile.value.resumeName = ''
    profile.value.resumeUploadedAt = null
  }

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !profile.value.skills.includes(trimmed)) {
      profile.value.skills.push(trimmed)
    }
  }

  const removeSkill = (index: number) => {
    profile.value.skills.splice(index, 1)
  }

  return {
    profile,
    profileCompletionScore,
    updateProfile,
    uploadResume,
    deleteResume,
    addSkill,
    removeSkill
  }
})
