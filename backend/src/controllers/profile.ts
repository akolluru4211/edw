import { Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import os from 'os'

const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const avatarDir = isVercel
  ? path.join(os.tmpdir(), 'uploads', 'avatars')
  : path.join(process.cwd(), 'uploads', 'avatars')
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (req: any, file, cb) => {
    const userId = req.user?.id || 'anon'
    const ext = path.extname(file.originalname)
    cb(null, `${userId}_avatar_${Date.now()}${ext}`)
  }
})

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are accepted'))
  }
}

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})


// Fetch user profile by ID
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.userId as string
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            connections: true,
            applications: true
          }
        },
        projects: true,
        experience: true,
        certifications: true,
        skills: true
      }
    })
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }
    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching profile' })
  }
}

// Fetch public portfolio details by URL slug
export const getPublicPortfolio = async (req: AuthenticatedRequest, res: Response) => {
  const slug = req.params.slug as string
  try {
    const profile = await prisma.profile.findUnique({
      where: { portfolioUrl: slug },
      include: {
        user: { select: { fullName: true, email: true, phoneNumber: true } },
        projects: true,
        experience: true,
        certifications: true,
        skills: true
      }
    })
    if (!profile) {
      return res.status(404).json({ error: 'Portfolio slug not found' })
    }
    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching portfolio' })
  }
}

// Re-calculate Career Readiness Score
export const calculateReadinessScore = async (userId: string): Promise<number> => {
  let score = 20 // Base score for registration

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          projects: true,
          certifications: true,
          skills: true,
          experience: true
        }
      },
      resumes: true,
      applications: true,
      connections: { where: { status: 'CONNECTED' } }
    }
  })

  if (!user || !user.profile) return 0

  // 1. Resume uploaded (+15)
  if (user.resumes.length > 0) {
    score += 15
  }

  // 2. Profile completeness (+15)
  if (user.profile.bio && user.profile.collegeName && user.profile.degree) {
    score += 15
  }

  // 3. Skills count (+15 max)
  const skillsCount = user.profile.skills.length
  score += Math.min(15, skillsCount * 3)

  // 4. Certifications (+15 max)
  if (user.profile.certifications.length > 0) {
    score += 15
  }

  // 5. Projects (+15 max)
  const projectCount = user.profile.projects.length
  if (projectCount >= 2) score += 15
  else if (projectCount === 1) score += 7

  // 6. Network connections (+5 max)
  if (user.connections.length >= 3) {
    score += 5
  } else {
    score += user.connections.length * 1.5
  }

  // 7. Applications / Practices logged (+20 max)
  const practiceCount = user.applications.length
  score += Math.min(20, practiceCount * 5)

  // 8. Experience / Internships added (+10 max)
  if (user.profile.experience.length > 0) {
    score += 10
  }

  const finalScore = Math.min(100, Math.round(score))
  
  // Cache final score
  await prisma.profile.update({
    where: { userId },
    data: { readinessScore: finalScore }
  })

  return finalScore
}

// Update Profile details
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  const {
    fullName,
    headline,
    collegeName,
    degree,
    branch,
    graduationYear,
    bio,
    avatarUrl,
    portfolioUrl,
    interests,
    goals,
    dob,
    latitude,
    longitude
  } = req.body

  let gradYearNum: number | undefined = undefined
  if (graduationYear !== undefined && graduationYear !== null) {
    gradYearNum = Number(graduationYear)
    if (isNaN(gradYearNum) || !Number.isInteger(gradYearNum)) {
      return res.status(400).json({ error: 'Graduation year must be a valid integer' })
    }
  }

  let dobDate: Date | null | undefined = undefined
  if (dob !== undefined) {
    if (dob === null || dob === '') {
      dobDate = null
    } else {
      const parsed = new Date(dob)
      if (!isNaN(parsed.getTime())) {
        dobDate = parsed
      }
    }
  }

  try {
    if (fullName) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { fullName }
      })
    }

    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        headline,
        collegeName,
        degree,
        branch,
        graduationYear: gradYearNum,
        bio,
        avatarUrl,
        portfolioUrl,
        dob: dobDate,
        interests: interests ? JSON.stringify(interests) : undefined,
        goals: goals ? JSON.stringify(goals) : undefined,
        latitude: latitude !== undefined ? (latitude !== null ? Number(latitude) : null) : undefined,
        longitude: longitude !== undefined ? (longitude !== null ? Number(longitude) : null) : undefined,
      }
    })

    const newScore = await calculateReadinessScore(req.user.id)
    res.json({ profile: { ...updated, readinessScore: newScore } })
  } catch (error: any) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error updating profile' })
  }
}

// Fetch users with birthdays today
export const getBirthdays = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const today = new Date()
    const currentMonth = today.getMonth() + 1 // 1-12
    const currentDay = today.getDate() // 1-31

    const profiles = await prisma.profile.findMany({
      where: {
        dob: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            role: true
          }
        }
      }
    })

    const birthdayUsers = profiles.filter(p => {
      if (!p.dob) return false
      const dobDate = new Date(p.dob)
      return dobDate.getMonth() + 1 === currentMonth && dobDate.getDate() === currentDay
    }).map(p => ({
      userId: p.userId,
      fullName: p.user.fullName,
      email: p.user.email,
      role: p.user.role,
      avatarUrl: p.avatarUrl,
      headline: p.headline,
      dob: p.dob
    }))

    res.json(birthdayUsers)
  } catch (error) {
    console.error('getBirthdays error:', error)
    res.status(500).json({ error: 'Internal server error fetching birthdays' })
  }
}

// Add Project
export const addProject = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { title, description, technologies, projectUrl, githubUrl } = req.body

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } })
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const project = await prisma.project.create({
      data: {
        profileId: profile.id,
        title,
        description,
        technologies: JSON.stringify(technologies || []),
        projectUrl,
        githubUrl
      }
    })

    await calculateReadinessScore(req.user.id)
    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error adding project' })
  }
}

// Delete Project
export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const id = req.params.id as string

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { profile: { select: { userId: true } } }
    })
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    if (project.profile.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: Cannot delete another user\'s project' })
    }

    await prisma.project.delete({ where: { id } })
    await calculateReadinessScore(req.user.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error deleting project' })
  }
}

// Add Skill
export const addSkill = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { name } = req.body

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } })
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const skill = await prisma.skill.create({
      data: {
        profileId: profile.id,
        name
      }
    })

    await calculateReadinessScore(req.user.id)
    res.status(201).json(skill)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error adding skill' })
  }
}

// Delete Skill
export const deleteSkill = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const id = req.params.id as string

  try {
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: { profile: { select: { userId: true } } }
    })
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' })
    }
    if (skill.profile.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: Cannot delete another user\'s skill' })
    }

    await prisma.skill.delete({ where: { id } })
    await calculateReadinessScore(req.user.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error deleting skill' })
  }
}

// Add Certification
export const addCertification = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { name, issuer, issueDate, expiryDate, credentialId } = req.body

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } })
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const cert = await prisma.certification.create({
      data: {
        profileId: profile.id,
        name,
        issuer,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId
      }
    })

    await calculateReadinessScore(req.user.id)
    res.status(201).json(cert)
  } catch (error) {
    console.error('Cert addition error:', error)
    res.status(500).json({ error: 'Internal server error adding certification' })
  }
}

// Trigger score retrieval
  export const getReadinessScore = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    try {
      const score = await calculateReadinessScore(req.user.id)
      res.json({ readinessScore: score })
    } catch (error) {
      res.status(500).json({ error: 'Internal server error fetching readiness' })
    }
  }

  // Add Experience
  export const addExperience = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    const { company, role, startDate, endDate, description } = req.body

    if (!company || !role || !startDate || !description) {
      return res.status(400).json({ error: 'Company, role, start date, and description are required' })
    }

    try {
      const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } })
      if (!profile) return res.status(404).json({ error: 'Profile not found' })

      const exp = await prisma.experience.create({
        data: {
          profileId: profile.id,
          company,
          role,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          description
        }
      })

      await calculateReadinessScore(req.user.id)
      res.status(201).json(exp)
    } catch (error) {
      console.error('Add experience error:', error)
      res.status(500).json({ error: 'Internal server error adding experience' })
    }
  }

  // Delete Experience
  export const deleteExperience = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    const id = req.params.id as string

    try {
      const exp = await prisma.experience.findUnique({
        where: { id },
        include: { profile: true }
      })
      if (!exp) {
        return res.status(404).json({ error: 'Experience not found' })
      }
      if (exp.profile.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized: Cannot delete another user\'s experience' })
      }

      await prisma.experience.delete({ where: { id } })
      await calculateReadinessScore(req.user.id)
      res.json({ success: true })
    } catch (error) {
      console.error('Delete experience error:', error)
      res.status(500).json({ error: 'Internal server error deleting experience' })
    }
  }

  // Upload Avatar Image
  export const uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

    try {
      const file = req.file
      if (!file) {
        return res.status(400).json({ error: 'No image file uploaded' })
      }

      const avatarUrl = `/uploads/avatars/${file.filename}`

      const profile = await prisma.profile.findUnique({
        where: { userId: req.user.id }
      })

      if (profile && profile.avatarUrl && profile.avatarUrl.startsWith('/uploads/avatars/')) {
        const oldPath = path.join(process.cwd(), profile.avatarUrl)
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath)
          } catch (err) {
            console.error('Failed to delete old avatar:', err)
          }
        }
      }

      const updated = await prisma.profile.update({
        where: { userId: req.user.id },
        data: { avatarUrl }
      })

      await calculateReadinessScore(req.user.id)

      res.json({ avatarUrl: updated.avatarUrl })
    } catch (error) {
      console.error('Avatar upload error:', error)
      res.status(500).json({ error: 'Internal server error uploading avatar' })
    }
  }

// Fetch Points Status and Logs
export const getPointsStatus = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { edPoints: true }
    })

    if (!user) return res.status(404).json({ error: 'User not found' })

    const transactions = await prisma.pointTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      edPoints: user.edPoints,
      transactions
    })
  } catch (error) {
    console.error('Points status fetch error:', error)
    res.status(500).json({ error: 'Internal server error fetching points status' })
  }
}

// Redeem Points (200 points = ₹20)
export const redeemPoints = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { edPoints: true }
    })

    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.edPoints < 200) {
      return res.status(400).json({ error: 'Insufficient points. You need at least 200 points to redeem.' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Deduct 200 points
      const updatedUser = await tx.user.update({
        where: { id: req.user!.id },
        data: { edPoints: { decrement: 200 } }
      })

      // Log the point transaction
      await tx.pointTransaction.create({
        data: {
          userId: req.user!.id,
          points: -200,
          description: "Redeemed 200 Points (Value: ₹20)"
        }
      })

      return updatedUser
    })

    res.json({
      success: true,
      newPoints: updated.edPoints,
      message: 'Successfully redeemed 200 points for ₹20!'
    })
  } catch (error) {
    console.error('Redeem points error:', error)
    res.status(500).json({ error: 'Internal server error redeeming points' })
  }
}

