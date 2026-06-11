import { Request, Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'
import { calculateReadinessScore } from './profile'
import { getRecommendationsForUser } from '../services/ragPipeline'

// Fetch and filter opportunities with RAG scoring and custom matching explanations
export const getOpportunities = async (req: AuthenticatedRequest, res: Response) => {
  const { search, location, remote, type, companyType } = req.query

  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    // Retrieve and rank all opportunities using RAG
    const list = await getRecommendationsForUser(req.user.id)

    // Map filters
    const filtered = list.filter(op => {
      const matchesSearch = !search || 
        op.title.toLowerCase().includes(String(search).toLowerCase()) ||
        op.companyName.toLowerCase().includes(String(search).toLowerCase()) ||
        op.skillsRequired.some((s: string) => s.toLowerCase().includes(String(search).toLowerCase()))

      const matchesLocation = !location || op.location.toLowerCase().includes(String(location).toLowerCase())

      const matchesRemote = !remote || op.remote === (String(remote) === 'true')

      const matchesType = !type || op.type === String(type)

      const matchesCompanyType = !companyType || op.companyType === String(companyType)

      return matchesSearch && matchesLocation && matchesRemote && matchesType && matchesCompanyType
    })

    res.json(filtered)
  } catch (error) {
    console.error('Fetch opportunities error:', error)
    res.status(500).json({ error: 'Internal server error fetching opportunities' })
  }
}

// Apply for opportunity
export const applyOpportunity = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const id = req.params.id as string

  try {
    const op = await prisma.opportunity.findUnique({ where: { id } })
    if (!op) return res.status(404).json({ error: 'Opportunity not found' })

    const existing = await prisma.application.findFirst({
      where: { userId: req.user.id, opportunityId: id }
    })

    if (existing) {
      return res.status(400).json({ error: 'Already applied for this opportunity' })
    }

    const application = await prisma.application.create({
      data: {
        userId: req.user.id,
        opportunityId: id,
        status: 'APPLIED'
      }
    })

    // Recalculate Career Readiness Score
    await calculateReadinessScore(req.user.id)

    res.status(201).json(application)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error applying' })
  }
}

// Fetch user applications
export const getMyApplications = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const list = await prisma.application.findMany({
      where: { userId: req.user.id },
      include: { opportunity: true },
      orderBy: { appliedAt: 'desc' }
    })
    
    // Parse skillsRequired inside each application's opportunity
    const parsed = list.map(app => ({
      ...app,
      opportunity: {
        ...app.opportunity,
        skillsRequired: JSON.parse(app.opportunity.skillsRequired)
      }
    }))

    res.json(parsed)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching applications' })
  }
}

// Advance application status
export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const appId = req.params.appId as string
  const { status } = req.body // APPLIED, SHORTLISTED, INTERVIEW, OFFER, REJECTED

  if (!status) return res.status(400).json({ error: 'Status is required' })

  const validStatuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid application status value' })
  }

  try {
    const app = await prisma.application.findUnique({
      where: { id: appId }
    })

    if (!app) {
      return res.status(404).json({ error: 'Application not found' })
    }

    if (app.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: Cannot update another user\'s application status' })
    }

    const updated = await prisma.application.update({
      where: { id: appId },
      data: { status }
    })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error updating application status' })
  }
}

// Seed mock opportunities
export const seedOpportunities = async (req: Request, res: Response) => {
  try {
    const count = await prisma.opportunity.count()
    if (count > 0) return res.json({ message: 'Opportunities database already seeded' })

    const seeded = await prisma.opportunity.createMany({
      data: [
        {
          title: 'Frontend Developer Intern',
          companyName: 'TechVibe Systems',
          location: 'Austin, TX',
          salary: '$35 - $45 / hr',
          remote: true,
          type: 'INTERNSHIP',
          skillsRequired: JSON.stringify(['Vue.js', 'TypeScript', 'Tailwind CSS', 'JavaScript']),
          description: 'Join our team to build high-fidelity reactive dashboards. Requires proficiency in Vue 3 composition API, TS compiler configurations, and tailwind variables.'
        },
        {
          title: 'Full Stack Engineer',
          companyName: 'Linear Technologies',
          location: 'San Francisco, CA',
          salary: '$110,000 - $130,000 / yr',
          remote: false,
          type: 'JOB',
          skillsRequired: JSON.stringify(['React', 'Next.js', 'Node.js', 'SQL', 'TypeScript']),
          description: 'Looking for a product-focused full stack developer to take ownership of project milestones. Experience with Prisma and Next.js App routers is highly preferred.'
        },
        {
          title: 'SC/ST/OBC Technology Fellowship Grant',
          companyName: 'Ministry of Education Funding',
          location: 'National Support',
          salary: '$8,000 / yr',
          remote: true,
          type: 'SCHOLARSHIP',
          skillsRequired: JSON.stringify(['Academic Excellence', 'Valid Category Certificate']),
          description: 'Fellowship grant for engineering students. Requires valid category validation transcripts and an annual family income statement < 6L.'
        }
      ]
    })
    res.json({ success: true, seeded })
  } catch (error) {
    console.error('Opportunity seeding error:', error)
    res.status(500).json({ error: 'Internal server error seeding database' })
  }
}
