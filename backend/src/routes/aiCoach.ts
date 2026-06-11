import { Router } from 'express'
import { sendChatMessage, getChatSessions, deleteChatSession } from '../controllers/aiCoach'
import { authenticateToken } from '../middlewares/auth'

const router = Router()

router.post('/chat', authenticateToken, sendChatMessage)
router.get('/history', authenticateToken, getChatSessions)
router.delete('/history/:id', authenticateToken, deleteChatSession)

export default router
