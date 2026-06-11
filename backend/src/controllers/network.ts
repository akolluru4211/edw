import { Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'
import { encryptHybridNode } from '../services/ragPipeline'

// Suggested connections matching interests/major
export const getSuggestions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const myProfile = await prisma.profile.findUnique({
      where: { userId: req.user.id }
    })

    const allProfiles = await prisma.profile.findMany({
      where: { NOT: { userId: req.user.id } },
      include: { user: { select: { fullName: true, role: true, memberId: true, publicKey: true, email: true } } }
    })

    const myInterests: string[] = myProfile ? JSON.parse(myProfile.interests) : []
    const myMajor = myProfile?.branch || ''

    // Fetch all connections involving current user
    const myConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      }
    })

    // Rank profiles and map actual connection status
    const suggestions = allProfiles.map(p => {
      const pInterests: string[] = JSON.parse(p.interests)
      const matches = pInterests.filter(i => myInterests.includes(i))
      let score = matches.length * 15

      if (p.branch === myMajor) {
        score += 30
      }

      // Check connection status
      const conn = myConnections.find(c => 
        (c.senderId === req.user!.id && c.receiverId === p.userId) ||
        (c.senderId === p.userId && c.receiverId === req.user!.id)
      )

      let status: 'CONNECT' | 'PENDING' | 'RECEIVED' | 'CONNECTED' = 'CONNECT'
      if (conn) {
        if (conn.status === 'CONNECTED') {
          status = 'CONNECTED'
        } else if (conn.status === 'PENDING') {
          if (conn.senderId === req.user!.id) {
            status = 'PENDING'
          } else {
            status = 'RECEIVED'
          }
        }
      }

      return {
        id: p.userId,
        fullName: p.user.fullName,
        role: p.user.role,
        memberId: p.user.memberId,
        publicKey: p.user.publicKey,
        avatarUrl: p.avatarUrl,
        collegeName: p.collegeName,
        degree: p.degree,
        branch: p.branch,
        graduationYear: p.graduationYear,
        status,
        score: Math.min(95, 40 + score), // Ensure baseline suggested match %
        latitude: p.latitude,
        longitude: p.longitude
      }
    }).sort((a, b) => b.score - a.score)

    res.json(suggestions)
  } catch (error) {
    console.error('Suggestions error:', error)
    res.status(500).json({ error: 'Internal server error fetching suggestions' })
  }
}

// Connect / send request
export const connectUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const targetId = req.params.targetId as string

  try {
    // Check if request or connection already exists
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: targetId },
          { senderId: targetId, receiverId: req.user.id }
        ]
      }
    })

    if (existing) {
      if (existing.status === 'CONNECTED') {
        return res.status(400).json({ error: 'Already connected' })
      }
      return res.status(400).json({ error: 'Connection request is pending' })
    }

    const request = await prisma.connection.create({
      data: {
        senderId: req.user.id,
        receiverId: targetId,
        status: 'PENDING'
      }
    })

    // REMOVED: Mock auto-approve setTimeout loop.
    // Connections now remain strictly PENDING until approved by the recipient.

    res.status(201).json(request)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error sending connection request' })
  }
}

// Accept connection request
export const acceptConnection = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const senderId = req.params.senderId as string

  try {
    const conn = await prisma.connection.findFirst({
      where: {
        senderId,
        receiverId: req.user.id,
        status: 'PENDING'
      }
    })

    if (!conn) {
      return res.status(404).json({ error: 'Pending connection request not found' })
    }

    const updated = await prisma.connection.update({
      where: { id: conn.id },
      data: { status: 'CONNECTED' }
    })

    res.json(updated)
  } catch (error) {
    console.error('Accept connection error:', error)
    res.status(500).json({ error: 'Internal server error accepting connection' })
  }
}

// Fetch messages
export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const targetId = req.params.targetId as string

  try {
    const list = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: targetId },
          { senderId: targetId, receiverId: req.user.id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    })
    res.json(list)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching messages' })
  }
}

// Send direct message
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { receiverId, text, textForSender, textForReceiver } = req.body

  if (!receiverId || (!text && !textForSender && !textForReceiver)) {
    return res.status(400).json({ error: 'Receiver ID and content are required' })
  }

  try {
    const msg = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId,
        text: text || '[Encrypted Message]',
        textForSender,
        textForReceiver
      }
    })

    // Simulate reply from seeded peer users using E2EE encryption if public keys are present
    const receiverUser = await prisma.user.findUnique({ where: { id: receiverId } })
    const senderUser = await prisma.user.findUnique({ where: { id: req.user.id } })

    const seededBots = ['sarah.j@stanford.edu', 'm.chen@stripe.com', 'emily.rod@google.com']

    if (receiverUser && senderUser && seededBots.includes(receiverUser.email)) {
      setTimeout(async () => {
        try {
          const senderFirstName = senderUser.fullName.split(' ')[0]
          let replyPlaintext = ''

          if (receiverUser.email === 'sarah.j@stanford.edu') {
            replyPlaintext = `Hey ${senderFirstName}! Thanks for reaching out. I'm currently looking for React or UI/UX Design internships. I saw your projects list and would love to collaborate on a front-end framework project!`
          } else if (receiverUser.email === 'm.chen@stripe.com') {
            replyPlaintext = `Hi ${senderFirstName}! Nice to connect. I graduated from UC Berkeley and now work at Stripe as a backend engineer. Always happy to chat about API design, DB scaling, or interview prep!`
          } else if (receiverUser.email === 'emily.rod@google.com') {
            replyPlaintext = `Hello ${senderFirstName}! Glad to connect. I lead systems and infrastructure at Google Cloud. I can certainly help review your distributed systems architectures or discuss Google internships. What are you building?`
          }

          let responseText = replyPlaintext
          let encForReceiver: string | null = null
          let encForSender: string | null = null

          // If current user has a public key, we encrypt the response E2EE for them!
          if (senderUser.publicKey) {
            encForReceiver = encryptHybridNode(replyPlaintext, senderUser.publicKey)
            // Encrypt for bot itself using bot's public key (to complete the packet data, optional but clean)
            if (receiverUser.publicKey) {
              encForSender = encryptHybridNode(replyPlaintext, receiverUser.publicKey)
            }
            responseText = '[Encrypted Message]'
          }

          await prisma.message.create({
            data: {
              senderId: receiverId,
              receiverId: req.user!.id,
              text: responseText,
              textForReceiver: encForReceiver, // Encrypted for the logged-in user (receiver of this reply)
              textForSender: encForSender      // Encrypted for the bot sender
            }
          })
        } catch (err) {
          console.error('Failed to create E2EE simulated reply:', err)
        }
      }, 1500)
    }

    res.status(201).json(msg)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error sending message' })
  }
}
