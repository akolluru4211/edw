import { Router } from 'express'
import { register, login, getMe, requestPasswordReset, verifyAndResetPassword, saveKeys } from '../controllers/auth'
import { authenticateToken } from '../middlewares/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', requestPasswordReset)
router.post('/reset-password', verifyAndResetPassword)
router.post('/save-keys', authenticateToken, saveKeys)
router.get('/me', authenticateToken, getMe)

export default router

