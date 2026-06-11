import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Course {
  id: string
  title: string
  description: string
  category: 'Programming' | 'Data Science & AI' | 'System Design' | 'Cloud & DevOps' | 'Soft Skills'
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  durationHours: number
  skills: string[]
  progress: number
  enrolled: boolean
  completed: boolean
}

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref<Course[]>([
    {
      id: 'c1',
      title: 'Advanced Vue 3 with Composition API',
      description: 'Master Pinia, Vue Router, custom composables, Teleport, Suspense, and performance optimization in Vue 3.',
      category: 'Programming',
      difficulty: 'Intermediate',
      durationHours: 18,
      skills: ['Vue.js', 'JavaScript', 'TypeScript', 'State Management'],
      progress: 0,
      enrolled: false,
      completed: false
    },
    {
      id: 'c2',
      title: 'Data Structures & Algorithms in Python',
      description: 'Ace your technical interviews. Covers Big-O, arrays, linked lists, trees, graphs, dynamic programming, and sorting.',
      category: 'Programming',
      difficulty: 'Intermediate',
      durationHours: 32,
      skills: ['Python', 'DSA', 'Problem Solving'],
      progress: 45,
      enrolled: true,
      completed: false
    },
    {
      id: 'c3',
      title: 'Introduction to Machine Learning & Neural Networks',
      description: 'Build your first models. Covers regression, classification, clustering, TensorFlow, and basic deep learning structures.',
      category: 'Data Science & AI',
      difficulty: 'Beginner',
      durationHours: 24,
      skills: ['Python', 'Machine Learning', 'Data Analysis'],
      progress: 0,
      enrolled: false,
      completed: false
    },
    {
      id: 'c4',
      title: 'System Design Fundamentals for Scalable Apps',
      description: 'Learn load balancers, caching, CDNs, databases (SQL vs NoSQL), microservices, and message queues.',
      category: 'System Design',
      difficulty: 'Advanced',
      durationHours: 15,
      skills: ['System Design', 'Software Architecture', 'Cloud Architecture'],
      progress: 0,
      enrolled: false,
      completed: false
    },
    {
      id: 'c5',
      title: 'Docker & Kubernetes for Modern Developers',
      description: 'Containerize and orchestrate your applications. Cover Dockerfiles, Docker Compose, Pods, Services, and CI/CD pipelines.',
      category: 'Cloud & DevOps',
      difficulty: 'Intermediate',
      durationHours: 20,
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'DevOps'],
      progress: 100,
      enrolled: true,
      completed: true
    },
    {
      id: 'c6',
      title: 'Technical Presentation & Communication Skills',
      description: 'Deliver impact. Learn how to explain complex systems to non-technical stakeholders and excel in behavioral interviews.',
      category: 'Soft Skills',
      difficulty: 'Beginner',
      durationHours: 8,
      skills: ['Communication', 'STAR Method', 'Public Speaking'],
      progress: 0,
      enrolled: false,
      completed: false
    }
  ])

  const enrolledCourses = computed(() => courses.value.filter(c => c.enrolled))
  const completedCourses = computed(() => courses.value.filter(c => c.completed))

  const enrollCourse = (id: string) => {
    const course = courses.value.find(c => c.id === id)
    if (course && !course.enrolled) {
      course.enrolled = true
      course.progress = 0
    }
  }

  const updateProgress = (id: string, progress: number) => {
    const course = courses.value.find(c => c.id === id)
    if (course && course.enrolled) {
      course.progress = Math.min(100, Math.max(0, progress))
      if (course.progress === 100) {
        course.completed = true
      } else {
        course.completed = false
      }
    }
  }

  const completeCourse = (id: string) => {
    const course = courses.value.find(c => c.id === id)
    if (course) {
      if (!course.enrolled) course.enrolled = true
      course.progress = 100
      course.completed = true
    }
  }

  return {
    courses,
    enrolledCourses,
    completedCourses,
    enrollCourse,
    updateProgress,
    completeCourse
  }
})
