import { Router } from 'express'
import { uploadResume, getResumes, deleteResume, upload } from '../controllers/resume'
import { authenticateToken } from '../middlewares/auth'

const router = Router()

// POST /resume/upload  — real multipart file upload via multer
router.post('/upload', authenticateToken, upload.single('file'), uploadResume)
router.get('/', authenticateToken, getResumes)
router.delete('/:id', authenticateToken, deleteResume)

export default router
