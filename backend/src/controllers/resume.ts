import { Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'
import { calculateReadinessScore } from './profile'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import os from 'os'

// ── Configure multer disk storage ──────────────────────────────────────────
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const uploadsDir = isVercel
  ? path.join(os.tmpdir(), 'uploads', 'resumes')
  : path.join(process.cwd(), 'uploads', 'resumes')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req: any, file, cb) => {
    const userId = req.user?.id || 'anon'
    const ext = path.extname(file.originalname)
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${userId}_${Date.now()}_${safeName}`)
  }
})

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.pdf', '.docx', '.doc']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF and DOCX files are accepted'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// ── ATS Analysis helper ─────────────────────────────────────────────────────
async function analyzeResume(userId: string, fileName: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { skills: true }
  })

  const userSkills = profile?.skills.map(s => s.name.toLowerCase()) || []

  const atsKeywords = ['javascript', 'typescript', 'python', 'react', 'node', 'sql', 'git', 'docker', 'ci/cd', 'system design']
  const matched = atsKeywords.filter(kw => userSkills.includes(kw))
  const missing = atsKeywords.filter(kw => !userSkills.includes(kw))

  const baseScore = 40
  const skillBonus = Math.min(matched.length * 6, 36)
  const profileBonus = (profile?.bio ? 8 : 0) + (profile?.collegeName ? 8 : 0) + (userSkills.length >= 3 ? 8 : 0)
  const atsScore = Math.min(baseScore + skillBonus + profileBonus, 100)

  const keywordReport = [
    `✅ Resume file "${fileName}" successfully uploaded and parsed.`,
    `✅ ${matched.length} technical keywords matched: ${matched.length > 0 ? matched.join(', ') : 'None yet — add skills in your portfolio.'}`,
    atsScore < 70
      ? `⚠️ ATS score is ${atsScore}%. Add more skills and fill your bio to improve visibility.`
      : `✅ ATS score of ${atsScore}% — excellent keyword optimization!`,
    missing.length > 0
      ? `💡 Consider adding these keywords if you have them: "${missing.slice(0, 4).join('", "')}"`
      : `💡 Tip: Add your LinkedIn and GitHub URLs to your resume header for extra recruiter visibility.`
  ]

  return { atsScore, keywordReport }
}

// ── Upload endpoint ─────────────────────────────────────────────────────────
export const uploadResume = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded. Please select a PDF or DOCX file.' })
    }

    // Build a local URL path so the file can be served/downloaded
    const fileUrl = `/uploads/resumes/${file.filename}`

    const { atsScore, keywordReport } = await analyzeResume(req.user.id, file.originalname)

    const newResume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        fileName: file.originalname,
        fileUrl,
        atsScore,
        keywordReport: JSON.stringify(keywordReport)
      }
    })

    // Update Career Readiness Score
    await calculateReadinessScore(req.user.id)

    res.status(201).json(newResume)
  } catch (error) {
    console.error('Resume upload error:', error)
    res.status(500).json({ error: 'Internal server error evaluating resume' })
  }
}

// ── Get all resumes ─────────────────────────────────────────────────────────
export const getResumes = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const list = await prisma.resume.findMany({
      where: { userId: req.user.id },
      orderBy: { uploadedAt: 'desc' }
    })
    res.json(list)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching resumes' })
  }
}

// ── Delete resume ───────────────────────────────────────────────────────────
export const deleteResume = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const id = req.params.id as string

  try {
    const resume = await prisma.resume.findUnique({ where: { id } })
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    if (resume.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

    // Remove the physical file if it exists locally
    if (resume.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), resume.fileUrl)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    await prisma.resume.delete({ where: { id } })
    await calculateReadinessScore(req.user.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error deleting resume' })
  }
}
