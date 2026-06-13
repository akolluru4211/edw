import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { createOrder, verifyPayment } from '../controllers/subscription';

const router = Router();

router.post('/create-order', authenticateToken, createOrder);
router.post('/verify-payment', authenticateToken, verifyPayment);

export default router;
