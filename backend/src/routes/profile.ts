import { Router } from 'express'
import { 
  getProfile, 
  updateProfile, 
  addProject, 
  deleteProject, 
  addSkill, 
  deleteSkill, 
  addCertification, 
  getReadinessScore,
  getPublicPortfolio,
  addExperience,
  deleteExperience,
  uploadAvatar,
  uploadBanner,
  uploadMedia,
  avatarUpload,
  mediaUpload,
  getBirthdays,
  getPointsStatus,
  redeemPoints
} from '../controllers/profile'
import { authenticateToken } from '../middlewares/auth'

const router = Router()

router.post('/avatar', authenticateToken, avatarUpload.single('avatar'), uploadAvatar)
router.post('/banner', authenticateToken, avatarUpload.single('banner'), uploadBanner)
router.post('/media', authenticateToken, mediaUpload.single('file'), uploadMedia)

router.get('/points/status', authenticateToken, getPointsStatus)
router.post('/points/redeem', authenticateToken, redeemPoints)

router.get('/readiness', authenticateToken, getReadinessScore)
router.get('/birthdays', authenticateToken, getBirthdays)
router.get('/portfolio/:slug', getPublicPortfolio)
router.get('/:userId', authenticateToken, getProfile)
router.put('/', authenticateToken, updateProfile)

router.post('/projects', authenticateToken, addProject)
router.delete('/projects/:id', authenticateToken, deleteProject)

router.post('/skills', authenticateToken, addSkill)
router.delete('/skills/:id', authenticateToken, deleteSkill)

router.post('/certifications', authenticateToken, addCertification)

router.post('/experience', authenticateToken, addExperience)
router.delete('/experience/:id', authenticateToken, deleteExperience)

export default router

