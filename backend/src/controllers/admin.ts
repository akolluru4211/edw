import { Request, Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'
import { sendEmail, getEmailTemplate } from '../lib/email'

const VALID_ROLES = ['STUDENT', 'ALUMNI', 'MENTOR', 'ADMIN']

export const getAdminMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [usersCount, profilesCount, resumesCount, applicationsCount, opportunitiesCount, connectionsCount, postsCount, aiChatsCount, adsCount] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count(),
      prisma.resume.count(),
      prisma.application.count(),
      prisma.opportunity.count(),
      prisma.connection.count({ where: { status: 'CONNECTED' } }),
      prisma.post.count(),
      prisma.aIChat.count(),
      prisma.ad.count().catch(() => 0)
    ])

    res.json({
      metrics: { users: usersCount, profiles: profilesCount, resumes: resumesCount, applications: applicationsCount, opportunities: opportunitiesCount, connections: connectionsCount, posts: postsCount, chats: aiChatsCount, ads: adsCount }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to load metrics.' })
  }
}

export const getAdminUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    })
    const sanitized = list.map(u => ({
      id: u.id, email: u.email, fullName: u.fullName, phoneNumber: u.phoneNumber,
      role: u.role, createdAt: u.createdAt, memberId: u.memberId, profile: u.profile, edPoints: u.edPoints || 0
    }))
    res.json(sanitized)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load users.' })
  }
}

export const updateAdminUserRole = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  const { role } = req.body
  if (!role) return res.status(400).json({ error: 'Role is required.' })
  if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` })

  try {
    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'User not found.' })

    const updated = await prisma.user.update({ where: { id }, data: { role } })
    res.json({ id: updated.id, email: updated.email, fullName: updated.fullName, role: updated.role })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role.' })
  }
}

export const deleteAdminUser = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  try {
    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'User not found.' })
    if (existing.role === 'ADMIN') return res.status(400).json({ error: 'Cannot delete admin accounts.' })

    await prisma.user.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user.' })
  }
}

export const sendBulkCustomMessage = async (req: AuthenticatedRequest, res: Response) => {
  const { title, text } = req.body
  if (!title || !text) return res.status(400).json({ error: 'Title and message are required.' })

  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, fullName: true } })
    if (users.length === 0) return res.status(400).json({ error: 'No registered users found.' })

    await prisma.notification.createMany({
      data: users.map(u => ({ userId: u.id, title, text, read: false }))
    })

    const emailTemplate = getEmailTemplate(title, `<p>${text.replace(/\n/g, '<br>')}</p>`)
    Promise.all(users.map(u => sendEmail({ to: u.email, subject: title, html: emailTemplate }).catch(() => {})))

    await prisma.dataLog.create({
      data: { type: 'BULK_ANNOUNCEMENT', email: req.user?.email || 'admin', ipAddress: req.ip || null, details: `Sent "${title}" to ${users.length} users.` }
    }).catch(() => {})

    res.json({ success: true, count: users.length })
  } catch (error) {
    res.status(500).json({ error: 'Failed to send announcement.' })
  }
}

export const updateAdminUserPoints = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  const { points } = req.body
  if (points === undefined || typeof points !== 'number') return res.status(400).json({ error: 'Points must be a number.' })

  try {
    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'User not found.' })

    const delta = points - (existing.edPoints || 0)
    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({ where: { id }, data: { edPoints: points } })
      await tx.pointTransaction.create({
        data: { userId: id, points: delta, description: `Admin adjusted points to ${points} (delta: ${delta >= 0 ? '+' : ''}${delta})` }
      })
      return u
    })
    res.json({ id: updated.id, email: updated.email, fullName: updated.fullName, edPoints: updated.edPoints })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update points.' })
  }
}

export const getAdminActivityLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.dataLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    res.json(logs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load logs.' })
  }
}

export const clearAdminActivityLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.dataLog.create({
      data: { type: 'LOGS_CLEARED', email: req.user?.email || 'admin', ipAddress: req.ip || null, details: 'Admin cleared all activity logs.' }
    }).catch(() => {})
    await prisma.dataLog.deleteMany({})
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear logs.' })
  }
}

export const getAdminPointTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const txs = await prisma.pointTransaction.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    const userIds = [...new Set(txs.map(t => t.userId))]
    const usersList = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, fullName: true, email: true } })
    const userMap = new Map(usersList.map(u => [u.id, u]))

    const mapped = txs.map(tx => ({
      id: tx.id, points: tx.points, description: tx.description, createdAt: tx.createdAt,
      user: userMap.get(tx.userId) || { fullName: 'Unknown', email: 'N/A' }
    }))
    res.json(mapped)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load transactions.' })
  }
}

// === ADS MANAGEMENT ===

export const getAds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ads = await prisma.ad.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(ads)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load ads.' })
  }
}

export const createAd = async (req: AuthenticatedRequest, res: Response) => {
  const { businessName, contactEmail, contactPhone, title, description, imageUrl, videoUrl, linkUrl, costPerDay, costPer100Views, totalBudget } = req.body
  if (!businessName || !contactEmail || !title || !description) {
    return res.status(400).json({ error: 'Business name, contact email, title, and description are required.' })
  }

  try {
    const ad = await prisma.ad.create({
      data: {
        businessName, contactEmail, contactPhone, title, description,
        imageUrl, videoUrl, linkUrl,
        costPerDay: costPerDay || 100,
        costPer100Views: costPer100Views || 100,
        totalBudget: totalBudget || 1000
      }
    })
    res.status(201).json(ad)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ad.' })
  }
}

export const updateAdStatus = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  const { status } = req.body
  const validStatuses = ['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED']
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
  }

  try {
    const existing = await prisma.ad.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Ad not found.' })

    const updateData: any = { status }
    if (status === 'ACTIVE' && !existing.startDate) updateData.startDate = new Date()

    const ad = await prisma.ad.update({ where: { id }, data: updateData })
    res.json(ad)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ad status.' })
  }
}

export const deleteAd = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  try {
    const existing = await prisma.ad.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Ad not found.' })
    await prisma.ad.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ad.' })
  }
}

// Public endpoint: get active ads for display
export const getActiveAds = async (req: Request, res: Response) => {
  try {
    const ads = await prisma.ad.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, title: true, description: true, imageUrl: true, videoUrl: true, linkUrl: true, businessName: true }
    })
    res.json(ads)
  } catch (error) {
    res.json([])
  }
}

export const trackAdView = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    await prisma.ad.update({ where: { id }, data: { views: { increment: 1 } } })
    res.json({ success: true })
  } catch (error) {
    res.json({ success: false })
  }
}

export const trackAdClick = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    await prisma.ad.update({ where: { id }, data: { clicks: { increment: 1 } } })
    res.json({ success: true })
  } catch (error) {
    res.json({ success: false })
  }
}
