import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middlewares/auth'
import {
  getAdminMetrics, getAdminUsers, updateAdminUserRole, deleteAdminUser,
  sendBulkCustomMessage, updateAdminUserPoints, getAdminActivityLogs,
  clearAdminActivityLogs, getAdminPointTransactions,
  getAds, createAd, updateAdStatus, deleteAd,
  getActiveAds, trackAdView, trackAdClick
} from '../controllers/admin'

const router = Router()

// Admin-only routes
router.get('/metrics', authenticateToken, requireAdmin, getAdminMetrics)
router.get('/users', authenticateToken, requireAdmin, getAdminUsers)
router.put('/users/:id/role', authenticateToken, requireAdmin, updateAdminUserRole)
router.put('/users/:id/points', authenticateToken, requireAdmin, updateAdminUserPoints)
router.delete('/users/:id', authenticateToken, requireAdmin, deleteAdminUser)
router.post('/notifications/bulk', authenticateToken, requireAdmin, sendBulkCustomMessage)
router.get('/logs', authenticateToken, requireAdmin, getAdminActivityLogs)
router.delete('/logs', authenticateToken, requireAdmin, clearAdminActivityLogs)
router.get('/transactions', authenticateToken, requireAdmin, getAdminPointTransactions)

// Ad management (admin)
router.get('/ads', authenticateToken, requireAdmin, getAds)
router.post('/ads', authenticateToken, requireAdmin, createAd)
router.put('/ads/:id/status', authenticateToken, requireAdmin, updateAdStatus)
router.delete('/ads/:id', authenticateToken, requireAdmin, deleteAd)

// Public ad endpoints (no auth required)
router.get('/ads/public', getActiveAds)
router.post('/ads/:id/view', trackAdView)
router.post('/ads/:id/click', trackAdClick)

export default router
