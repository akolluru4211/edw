import { Router } from 'express'
import { applyAmbassador, getAdminAmbassadors, updateAdminAmbassadorStatus } from '../controllers/ambassador'
import { authenticateToken, requireAdmin } from '../middlewares/auth'

const router = Router()

router.post('/apply', authenticateToken, applyAmbassador)
router.get('/admin', authenticateToken, requireAdmin, getAdminAmbassadors)
router.put('/admin/:id/status', authenticateToken, requireAdmin, updateAdminAmbassadorStatus)

export default router
