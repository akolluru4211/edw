import { Router } from 'express'
import {
  getAdminMetrics,
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
  sendBulkCustomMessage,
  updateAdminUserPoints,
  getAdminActivityLogs,
  clearAdminActivityLogs,
  getAdminPointTransactions
} from '../controllers/admin'
import { authenticateToken, requireAdmin } from '../middlewares/auth'

const router = Router()

router.get('/metrics', authenticateToken, requireAdmin, getAdminMetrics)
router.get('/users', authenticateToken, requireAdmin, getAdminUsers)
router.put('/users/:id/role', authenticateToken, requireAdmin, updateAdminUserRole)
router.put('/users/:id/points', authenticateToken, requireAdmin, updateAdminUserPoints)
router.delete('/users/:id', authenticateToken, requireAdmin, deleteAdminUser)
router.post('/notifications/bulk', authenticateToken, requireAdmin, sendBulkCustomMessage)
router.get('/logs', authenticateToken, requireAdmin, getAdminActivityLogs)
router.delete('/logs', authenticateToken, requireAdmin, clearAdminActivityLogs)
router.get('/transactions', authenticateToken, requireAdmin, getAdminPointTransactions)

export default router

