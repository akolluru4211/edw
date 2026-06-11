import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import AIMentor from '../views/AIMentor.vue'
import Profile from '../views/Profile.vue'
import Courses from '../views/Courses.vue'
import Jobs from '../views/Jobs.vue'

// Lazy-loaded new views
const Network = () => import('../views/Network.vue')
const InterviewPrep = () => import('../views/InterviewPrep.vue')
const Admissions = () => import('../views/Admissions.vue')
const Community = () => import('../views/Community.vue')
const Settings = () => import('../views/Settings.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DashboardLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Student Hub | EdWorld Co' }
      },
      {
        path: 'mentor',
        name: 'AIMentor',
        component: AIMentor,
        meta: { title: 'AI Mentor | EdWorld Co' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: 'My Portfolio & Profile | EdWorld Co' }
      },
      {
        path: 'courses',
        name: 'Courses',
        component: Courses,
        meta: { title: 'Skills & Courses | EdWorld Co' }
      },
      {
        path: 'jobs',
        name: 'Jobs',
        component: Jobs,
        meta: { title: 'Opportunities Board | EdWorld Co' }
      },
      {
        path: 'network',
        name: 'Network',
        component: Network,
        meta: { title: 'Network Hub | EdWorld Co' }
      },
      {
        path: 'interview-prep',
        name: 'InterviewPrep',
        component: InterviewPrep,
        meta: { title: 'Interview Practice | EdWorld Co' }
      },
      {
        path: 'admissions',
        name: 'Admissions',
        component: Admissions,
        meta: { title: 'Admissions & Scholarships | EdWorld Co' }
      },
      {
        path: 'community',
        name: 'Community',
        component: Community,
        meta: { title: 'Peer Community | EdWorld Co' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: { title: 'Account Settings | EdWorld Co' }
      }
    ]
  },
  // Catch-all redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Set document title dynamically based on routes
router.beforeEach((to, _from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title as string
  } else {
    document.title = 'EdWorld Co'
  }
  next()
})

export default router
