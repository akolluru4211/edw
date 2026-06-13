import { Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '../lib/db';
import type { AuthenticatedRequest } from '../middlewares/auth';

// Create Razorpay Order or Mock Order
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { plan } = req.body;

  if (plan !== 'PRO' && plan !== 'PREMIUM') {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  // PRO = ₹49 (4900 paise), PREMIUM = ₹99 (9900 paise)
  const amount = plan === 'PREMIUM' ? 9900 : 4900;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  try {
    if (!keyId || !keySecret) {
      // Fallback to local Sandbox Mock Mode
      console.log(`Razorpay credentials not configured. Generating Mock Order for plan: ${plan}`);
      const mockOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
      return res.json({
        orderId: mockOrderId,
        amount,
        currency: 'INR',
        keyId: 'rzp_test_mock_keyid_12345',
        mock: true
      });
    }

    // Initialize real Razorpay client
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${req.user.id.slice(0, 8)}_${Date.now()}`
    });

    res.json({
      orderId: order.id,
      amount,
      currency: 'INR',
      keyId,
      mock: false
    });
  } catch (error: any) {
    console.error('Create subscription order error:', error);
    res.status(500).json({ error: 'Internal server error creating payment order' });
  }
};

// Verify payment signature and upgrade account
export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan, mock } = req.body;

  if (!plan || (plan !== 'PRO' && plan !== 'PREMIUM')) {
    return res.status(400).json({ error: 'Invalid plan specification' });
  }

  try {
    if (mock) {
      console.log(`Verifying payment in Sandbox Mock Mode for User: ${req.user.email}, Plan: ${plan}`);
      if (!razorpay_order_id || !razorpay_order_id.startsWith('order_mock_')) {
        return res.status(400).json({ error: 'Invalid mock order structure' });
      }
    } else {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return res.status(500).json({ error: 'Razorpay secret key configuration is missing on server.' });
      }

      // Verify the signature
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid payment signature verification failed.' });
      }
    }

    // Upgrade subscription plan in User profile
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days plan duration
    const subscriptionExpiresAt = expiryDate.toISOString();

    // 1. Update User document with plan and expiry
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        plan,
        subscriptionExpiresAt
      } as any // cast as any since these fields are dynamically handled in firestore adapter
    });

    // 2. Award Points Bonus (PRO = +100, PREMIUM = +250)
    const pointsBonus = plan === 'PREMIUM' ? 250 : 100;
    
    await prisma.pointTransaction.create({
      data: {
        userId: req.user.id,
        points: pointsBonus,
        description: `${plan} Subscription Reward Bonus`
      }
    });

    const userDoc = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (userDoc) {
      const currentPoints = userDoc.edPoints || 0;
      await prisma.user.update({
        where: { id: req.user.id },
        data: { edPoints: currentPoints + pointsBonus }
      });
    }

    // 3. Create Notification for user
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: `Upgraded to ${plan}`,
        text: `Thank you for subscribing! Your workspace is now upgraded to ${plan} tier. We've added ${pointsBonus} Ed Points bonus to your account.`
      }
    });

    res.json({
      success: true,
      plan,
      subscriptionExpiresAt,
      pointsBonus
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Internal server error verifying subscription payment' });
  }
};
