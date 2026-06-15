import { Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'

// Send message to AI Coach
export const sendChatMessage = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { chatId, message } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message content is required' })
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: { 
        skills: true,
        user: { select: { fullName: true } }
      }
    })

    const userSkills = profile?.skills.map(s => s.name).join(', ') || 'None'
    const headline = profile?.headline || 'CS Student'
    const firstName = profile?.user?.fullName ? profile.user.fullName.split(' ')[0] : 'there'

    // Formulate a response based on keywords
    let reply = ''
    const text = message.toLowerCase()

    if (text.includes('resume') || text.includes('parse') || text.includes('ats')) {
      reply = `Hello ${firstName}. I reviewed your profile details and skills (${userSkills}). To optimize your resume for applicant tracking systems, I suggest emphasizing your experience with CI/CD pipelines and containerization tools. You can test your current score and get detailed suggestions in our Resume scanner section.`
    } else if (text.includes('interview') || text.includes('mock') || text.includes('grade')) {
      reply = `I would be happy to help you practice. I have tailored some relevant behavioral and technical interview questions based on your background. Let's start with this scenario: Describe a challenging technical issue you encountered in a recent project. What was your process for diagnosing and resolving it?`
    } else if (text.includes('roadmap') || text.includes('learn') || text.includes('path')) {
      reply = `Here is a structured study outline to help you prepare over the next few weeks: In the first week, focus on core architecture patterns and framework-specific advanced concepts. During the second week, dedicate time to database replication, schema optimization, and API design. Finally, in the third week, practice system design problems and behavioral storytelling using the STAR method.`
    } else {
      reply = `Hello! I am Alex, your career mentor. I can assist you with optimizing your resume, constructing tailored study roadmaps, or running mock interview practice. What aspect of your career development would you like to focus on today?`
    }

    const savedChat = await prisma.$transaction(async (tx) => {
      let chat
      if (chatId) {
        chat = await tx.aIChat.findUnique({ where: { id: chatId } })
        if (chat && chat.userId !== req.user!.id) {
          throw new Error('UNAUTHORIZED_CHAT')
        }
      }

      const existingMessages = chat ? JSON.parse(chat.messages) : []
      const updatedMessages = [
        ...existingMessages,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
      ]

      if (chat) {
        return tx.aIChat.update({
          where: { id: chatId },
          data: {
            messages: JSON.stringify(updatedMessages),
            updatedAt: new Date()
          }
        })
      } else {
        return tx.aIChat.create({
          data: {
            userId: req.user!.id,
            title: message.length > 25 ? message.substring(0, 25) + '...' : message,
            messages: JSON.stringify(updatedMessages)
          }
        })
      }
    })

    res.json({
      chatId: savedChat.id,
      reply,
      messages: JSON.parse(savedChat.messages)
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    if (error.message === 'UNAUTHORIZED_CHAT') {
      return res.status(403).json({ error: 'Unauthorized access to chat session' })
    }
    res.status(500).json({ error: 'Internal server error during chat completion' })
  }
}

// Fetch chat logs list
export const getChatSessions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const list = await prisma.aIChat.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    })
    
    const parsedList = list.map(c => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      messages: JSON.parse(c.messages)
    }))

    res.json(parsedList)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching chats' })
  }
}

// Clear chat logs
export const deleteChatSession = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const id = req.params.id as string

  try {
    const chat = await prisma.aIChat.findUnique({ where: { id } })
    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' })
    }
    if (chat.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: Cannot delete another user\'s chat session' })
    }

    await prisma.aIChat.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error deleting chat' })
  }
}
