import { Router } from 'express'
import {
  subscribePushToken,
  unsubscribePushToken,
  sendTestNotification,
  getNotificationHistory,
  markNotificationRead,
  getSubscriptionStatus
} from '../controllers/notifications'
import { authenticateToken } from '../middlewares/auth'

const router = Router()

// All routes require auth
router.post('/subscribe', authenticateToken, subscribePushToken)
router.delete('/unsubscribe', authenticateToken, unsubscribePushToken)
router.post('/test', authenticateToken, sendTestNotification)
router.get('/history', authenticateToken, getNotificationHistory)
router.put('/history/:id/read', authenticateToken, markNotificationRead)
router.get('/status', authenticateToken, getSubscriptionStatus)

export default router
