import { Router } from 'express'
import { 
  getOpportunities, 
  applyOpportunity, 
  getMyApplications, 
  updateApplicationStatus,
  seedOpportunities
} from '../controllers/opportunities'
import { authenticateToken } from '../middlewares/auth'

const router = Router()

router.get('/', authenticateToken, getOpportunities)
router.get('/applications', authenticateToken, getMyApplications)
router.post('/apply/:id', authenticateToken, applyOpportunity)
router.put('/applications/:appId/status', authenticateToken, updateApplicationStatus)
router.post('/seed', seedOpportunities)

export default router
