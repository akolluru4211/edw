<script setup lang="ts">
import { computed } from 'vue'
import { useCoursesStore } from '../stores/courses'
import { useJobsStore } from '../stores/jobs'
import { BookOpen, Briefcase, ArrowUpRight, Check } from 'lucide-vue-next'

const props = defineProps<{
  widget: {
    type: 'course' | 'job'
    id: string
  }
}>()

const emit = defineEmits(['action-completed'])

const coursesStore = useCoursesStore()
const jobsStore = useJobsStore()

const isCourse = computed(() => props.widget.type === 'course')

const courseDetails = computed(() => {
  if (!isCourse.value) return null
  return coursesStore.courses.find(c => c.id === props.widget.id) || null
})

const jobDetails = computed(() => {
  if (isCourse.value) return null
  return jobsStore.jobs.find(j => j.id === props.widget.id) || null
})

const handleAction = () => {
  if (isCourse.value && courseDetails.value) {
    coursesStore.enrollCourse(courseDetails.value.id)
    emit('action-completed', `Successfully enrolled in "${courseDetails.value.title}"!`)
  } else if (!isCourse.value && jobDetails.value) {
    jobsStore.applyJob(jobDetails.value.id)
    emit('action-completed', `Successfully applied to "${jobDetails.value.title}"!`)
  }
}
</script>

<template>
  <div class="mt-4 border border-brand-border rounded-2xl bg-white shadow-premium overflow-hidden max-w-sm chat-bubble-anim">
    
    <!-- Header visual -->
    <div class="p-4 flex items-start gap-3 border-b border-brand-border bg-slate-50/50">
      <div 
        class="w-10 h-10 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
        :class="[isCourse ? 'bg-emerald-50 text-brand-success' : 'bg-sky-50 text-brand-accent']"
      >
        <BookOpen v-if="isCourse" class="w-5 h-5" />
        <Briefcase v-else class="w-5 h-5" />
      </div>
      
      <div class="space-y-0.5 overflow-hidden">
        <span class="text-[9px] font-bold text-brand-textSecondary uppercase tracking-wider block">
          {{ isCourse ? 'Recommended Course' : 'Matching Opportunity' }}
        </span>
        <h4 class="text-xs font-bold text-brand-textPrimary truncate">
          {{ isCourse ? courseDetails?.title : jobDetails?.title }}
        </h4>
        <p class="text-[10px] text-brand-textSecondary truncate">
          {{ isCourse ? courseDetails?.category : jobDetails?.companyName }}
        </p>
      </div>
    </div>

    <!-- Info body -->
    <div class="p-4 space-y-3">
      <!-- Description -->
      <p class="text-[10px] leading-relaxed text-brand-textSecondary">
        {{ isCourse ? courseDetails?.description : jobDetails?.description }}
      </p>

      <!-- Badges -->
      <div class="flex flex-wrap gap-1">
        <span 
          v-for="skill in (isCourse ? courseDetails?.skills : jobDetails?.requirements)" 
          :key="skill"
          class="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-brand-textPrimary border border-brand-border"
        >
          {{ skill }}
        </span>
      </div>

      <!-- Footer stats -->
      <div class="flex items-center justify-between text-[10px] font-bold text-brand-textSecondary border-t border-brand-border pt-3">
        <span>
          {{ isCourse ? `${courseDetails?.durationHours} Hours` : jobDetails?.location }}
        </span>
        <span>
          {{ isCourse ? courseDetails?.difficulty : (jobDetails?.remote ? 'Remote' : 'On-site') }}
        </span>
      </div>

      <!-- Action Button -->
      <button 
        v-if="isCourse ? !courseDetails?.enrolled : jobDetails?.status === 'None' || jobDetails?.status === 'Saved'"
        @click="handleAction"
        class="w-full mt-1 py-2 bg-brand-accent text-white font-bold text-xs rounded-xl shadow-premium hover:bg-sky-700 transition-colors flex items-center justify-center gap-1"
      >
        {{ isCourse ? 'Enroll Now' : 'Quick Apply' }} <ArrowUpRight class="w-3.5 h-3.5" />
      </button>
      
      <!-- Completed Action State -->
      <div 
        v-else
        class="w-full mt-1 py-2 bg-emerald-50 border border-emerald-100 text-brand-success font-bold text-xs rounded-xl flex items-center justify-center gap-1"
      >
        <Check class="w-4 h-4" /> {{ isCourse ? 'Enrolled' : 'Applied' }}
      </div>
    </div>

  </div>
</template>
