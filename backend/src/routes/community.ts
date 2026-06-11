import { Router } from 'express'
import { getPosts, createPost, addComment, likePost } from '../controllers/community'
import { authenticateToken } from '../middlewares/auth'

const router = Router()

router.get('/posts', getPosts)
router.post('/posts', authenticateToken, createPost)
router.post('/comments', authenticateToken, addComment)
router.post('/posts/:id/like', authenticateToken, likePost)

export default router
