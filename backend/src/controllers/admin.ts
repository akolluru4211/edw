import { Request, Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'
import { sendEmail, getEmailTemplate } from '../lib/email'

// Get system analytics (Admin Panel)
export const getAdminMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const usersCount = await prisma.user.count()
    const profilesCount = await prisma.profile.count()
    const resumesCount = await prisma.resume.count()
    const applicationsCount = await prisma.application.count()
    const opportunitiesCount = await prisma.opportunity.count()
    const connectionsCount = await prisma.connection.count({ where: { status: 'CONNECTED' } })
    const postsCount = await prisma.post.count()
    const aiChatsCount = await prisma.aIChat.count()

    res.json({
      metrics: {
        users: usersCount,
        profiles: profilesCount,
        resumes: resumesCount,
        applications: applicationsCount,
        opportunities: opportunitiesCount,
        connections: connectionsCount,
        posts: postsCount,
        chats: aiChatsCount
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching admin metrics' })
  }
}

// Get all users
export const getAdminUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    })
    
    // Sanitize passwordHash out
    const sanitized = list.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phoneNumber: u.phoneNumber,
      role: u.role,
      createdAt: u.createdAt,
      memberId: u.memberId,
      profile: u.profile
    }))

    res.json(sanitized)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching admin users' })
  }
}

// Modify user role
export const updateAdminUserRole = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  const { role } = req.body // STUDENT, ALUMNI, MENTOR, ADMIN

  if (!role) return res.status(400).json({ error: 'Role is required' })

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { role }
    })
    res.json({
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error updating role' })
  }
}

// Delete user
export const deleteAdminUser = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  try {
    await prisma.user.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error deleting user' })
  }
}

// Send bulk notification & Resend email to all users
export const sendBulkCustomMessage = async (req: AuthenticatedRequest, res: Response) => {
  const { title, text } = req.body

  if (!title || !text) {
    return res.status(400).json({ error: 'Title (subject) and text message are required' })
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true }
    })

    if (users.length === 0) {
      return res.status(400).json({ error: 'No registered users found' })
    }

    // 1. Create DB Notifications in bulk
    const notificationData = users.map(u => ({
      userId: u.id,
      title,
      text,
      read: false
    }))

    await prisma.notification.createMany({
      data: notificationData
    })

    // 2. Dispatch Emails asynchronously using Resend API
    const emailTemplate = getEmailTemplate(title, `<p>${text.replace(/\n/g, '<br>')}</p>`)

    // Send emails in background
    Promise.all(
      users.map(u =>
        sendEmail({
          to: u.email,
          subject: title,
          html: emailTemplate
        }).catch(err => {
          console.error(`Failed to send bulk email to ${u.email}:`, err)
        })
      )
    )

    // Log the bulk send event
    await prisma.dataLog.create({
      data: {
        type: 'BULK_ANNOUNCEMENT',
        email: req.user?.email || 'admin',
        ipAddress: req.ip || null,
        details: `Sent bulk announcement "${title}" to ${users.length} users.`
      }
    }).catch(err => console.error('Failed to write bulk announcement log:', err))

    res.json({ success: true, count: users.length })
  } catch (error) {
    console.error('Send bulk custom message error:', error)
    res.status(500).json({ error: 'Internal server error sending bulk messages' })
  }
}
