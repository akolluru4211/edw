import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Job {
  id: string
  companyName: string
  companyLogo: string
  title: string
  description: string
  opportunityType: 'Internship' | 'Full-time' | 'Fellowship'
  location: string
  remote: boolean
  salaryRange: string
  requirements: string[]
  status: 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'None'
  appliedAt: string | null
}

export const useJobsStore = defineStore('jobs', () => {
  const jobs = ref<Job[]>([
    {
      id: 'j1',
      title: 'Frontend Engineering Intern (Vue.js)',
      companyName: 'TechVibe Systems',
      companyLogo: '⚡',
      description: 'Join our customer success team to build sleek interfaces using Vue 3, Pinia, and Tailwind. Collaborative environment with dedicated mentorship.',
      opportunityType: 'Internship',
      location: 'Austin, TX',
      remote: true,
      salaryRange: '$35 - $45 / hr',
      requirements: ['Vue.js', 'JavaScript', 'Tailwind CSS', 'TypeScript'],
      status: 'Saved',
      appliedAt: null
    },
    {
      id: 'j2',
      title: 'Junior Software Engineer',
      companyName: 'CloudScale Inc.',
      companyLogo: '☁️',
      description: 'Looking for a fresh graduate to join our backend infrastructure team. Work on Python APIs, microservices, and database optimizations.',
      opportunityType: 'Full-time',
      location: 'San Francisco, CA',
      remote: false,
      salaryRange: '$95,000 - $115,000 / yr',
      requirements: ['Python', 'SQL', 'Docker', 'System Design'],
      status: 'None',
      appliedAt: null
    },
    {
      id: 'j3',
      title: 'AI/ML Engineering Fellowship',
      companyName: 'FutureMind Lab',
      companyLogo: '🤖',
      description: 'A 6-month hands-on fellowship program working with large language models, retrieval-augmented generation (RAG), and data pipelines.',
      opportunityType: 'Fellowship',
      location: 'Boston, MA',
      remote: true,
      salaryRange: '$5,000 / mo stipend',
      requirements: ['Python', 'Machine Learning', 'AI Models'],
      status: 'Applied',
      appliedAt: 'June 2, 2026'
    },
    {
      id: 'j4',
      title: 'Software Development Intern (Full-Stack)',
      companyName: 'CoreFlow Technologies',
      companyLogo: '⛓️',
      description: 'Collaborate across front-end and back-end services. Build, deploy, and maintain customer-facing platforms. Solid mentorship path.',
      opportunityType: 'Internship',
      location: 'New York, NY',
      remote: false,
      salaryRange: '$30 - $40 / hr',
      requirements: ['JavaScript', 'HTML/CSS', 'Python', 'SQL'],
      status: 'Interview',
      appliedAt: 'May 28, 2026'
    }
  ])

  const appliedJobs = computed(() => jobs.value.filter(j => j.status !== 'None' && j.status !== 'Saved'))
  const savedJobs = computed(() => jobs.value.filter(j => j.status === 'Saved'))

  const saveJob = (id: string) => {
    const job = jobs.value.find(j => j.id === id)
    if (job && job.status === 'None') {
      job.status = 'Saved'
    }
  }

  const applyJob = (id: string) => {
    const job = jobs.value.find(j => j.id === id)
    if (job) {
      job.status = 'Applied'
      job.appliedAt = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const updateStatus = (id: string, status: Job['status']) => {
    const job = jobs.value.find(j => j.id === id)
    if (job) {
      job.status = status
      if (status === 'None') {
        job.appliedAt = null
      } else if (!job.appliedAt && status !== 'Saved') {
        job.appliedAt = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    }
  }

  return {
    jobs,
    appliedJobs,
    savedJobs,
    saveJob,
    applyJob,
    updateStatus
  }
})
