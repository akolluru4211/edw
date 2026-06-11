import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import resumeRoutes from './routes/resume'
import aiCoachRoutes from './routes/aiCoach'
import opportunityRoutes from './routes/opportunities'
import networkRoutes from './routes/network'
import communityRoutes from './routes/community'
import adminRoutes from './routes/admin'
import { prisma } from './lib/db'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files (resumes, etc.) as static assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/ai-coach', aiCoachRoutes)
app.use('/api/opportunities', opportunityRoutes)
app.use('/api/network', networkRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/admin', adminRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() })
})

import { syncDailyOpportunities, seedRealUsers } from './services/ragPipeline'

// Auto-seed database for development
const autoSeed = async () => {
  try {
    // Ingest startup & enterprise opportunities
    await syncDailyOpportunities()
    // Seed real-world peer connections with E2EE keypairs
    await seedRealUsers()
  } catch (err) {
    console.error('Failed to auto-seed database:', err)
  }
}

// Start HTTP Server
const startServer = async () => {
  try {
    app.listen(PORT, async () => {
      console.log(`Server running on http://localhost:${PORT}`)
      await autoSeed()
    })
  } catch (err) {
    console.error('Failed to start server:', err)
  }
}

startServer()
