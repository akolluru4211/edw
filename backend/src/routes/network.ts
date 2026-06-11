import { Router } from 'express'
import { 
  getSuggestions, 
  connectUser, 
  getMessages, 
  sendMessage,
  acceptConnection
} from '../controllers/network'
import { authenticateToken } from '../middlewares/auth'

const router = Router()

router.get('/suggestions', authenticateToken, getSuggestions)
router.post('/connect/:targetId', authenticateToken, connectUser)
router.post('/accept/:senderId', authenticateToken, acceptConnection)
router.get('/messages/:targetId', authenticateToken, getMessages)
router.post('/messages', authenticateToken, sendMessage)

export default router
