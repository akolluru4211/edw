import { Request, Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'

// Fetch community posts
export const getPosts = async (req: Request, res: Response) => {
  try {
    const list = await prisma.post.findMany({
      include: {
        user: { select: { fullName: true, role: true } },
        comments: {
          include: { user: { select: { fullName: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(list)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error fetching posts' })
  }
}

// Create post
export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { title, content } = req.body

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' })
  }

  try {
    const post = await prisma.post.create({
      data: {
        userId: req.user.id,
        title,
        content
      },
      include: {
        user: { select: { fullName: true } }
      }
    })
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error creating post' })
  }
}

// Add comment
export const addComment = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { postId, content } = req.body

  if (!postId || !content) {
    return res.status(400).json({ error: 'Post ID and content are required' })
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: req.user.id,
        content
      },
      include: {
        user: { select: { fullName: true } }
      }
    })
    res.status(201).json(comment)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error adding comment' })
  }
}

// Like post
export const likePost = async (req: Request, res: Response) => {
  const id = req.params.id as string
  try {
    const post = await prisma.post.update({
      where: { id },
      data: { likesCount: { increment: 1 } }
    })
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error liking post' })
  }
}
