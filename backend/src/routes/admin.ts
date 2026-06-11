import { Router } from 'express'
import { getAdminMetrics, getAdminUsers, updateAdminUserRole, deleteAdminUser, sendBulkCustomMessage } from '../controllers/admin'
import { authenticateToken, requireAdmin } from '../middlewares/auth'

const router = Router()

router.get('/metrics', authenticateToken, requireAdmin, getAdminMetrics)
router.get('/users', authenticateToken, requireAdmin, getAdminUsers)
router.put('/users/:id/role', authenticateToken, requireAdmin, updateAdminUserRole)
router.delete('/users/:id', authenticateToken, requireAdmin, deleteAdminUser)
router.post('/notifications/bulk', authenticateToken, requireAdmin, sendBulkCustomMessage)

export default router
