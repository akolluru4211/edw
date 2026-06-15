import { Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'
import { getMessaging } from 'firebase-admin/messaging'

// ── Types ──────────────────────────────────────────────────────────────────

interface PushSubscriptionRecord {
  userId: string
  token: string          // FCM registration token
  endpoint?: string      // Web Push endpoint (VAPID fallback)
  p256dh?: string
  auth?: string
  platform?: string      // 'web' | 'ios' | 'android'
  userAgent?: string
  createdAt: string
  updatedAt: string
}

// ── Subscribe: save FCM token ─────────────────────────────────────────────

export const subscribePushToken = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  const { token, endpoint, p256dh, auth, platform, userAgent } = req.body

  if (!token && !endpoint) {
    return res.status(400).json({ error: 'Either FCM token or Web Push endpoint is required' })
  }

  try {
    const db = (prisma as any)._db
    const id = token || endpoint!

    // Upsert: use token/endpoint as document ID
    await db.collection('push_subscriptions').doc(`${req.user.id}_${Buffer.from(id).toString('base64').slice(0, 40)}`).set({
      userId: req.user.id,
      token: token || null,
      endpoint: endpoint || null,
      p256dh: p256dh || null,
      auth: auth || null,
      platform: platform || 'web',
      userAgent: userAgent || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true })

    res.json({ success: true, message: 'Push subscription saved' })
  } catch (error) {
    console.error('Subscribe push token error:', error)
    res.status(500).json({ error: 'Failed to save push subscription' })
  }
}

// ── Unsubscribe: remove FCM token ─────────────────────────────────────────

export const unsubscribePushToken = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token is required' })

  try {
    const db = (prisma as any)._db
    const snap = await db.collection('push_subscriptions')
      .where('userId', '==', req.user.id)
      .where('token', '==', token)
      .get()

    const batch = db.batch()
    snap.docs.forEach((d: any) => batch.delete(d.ref))
    await batch.commit()

    res.json({ success: true, message: 'Unsubscribed successfully' })
  } catch (error) {
    console.error('Unsubscribe push token error:', error)
    res.status(500).json({ error: 'Failed to unsubscribe' })
  }
}

// ── Core: send FCM notification to a user ────────────────────────────────

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data: Record<string, string> = {},
  imageUrl?: string
): Promise<void> {
  try {
    const db = (prisma as any)._db

    // Log notification to history first, so it is always available in-app!
    await db.collection('notification_history').add({
      userId,
      title,
      body,
      data,
      sentAt: new Date().toISOString(),
      read: false
    })

    const snap = await db.collection('push_subscriptions')
      .where('userId', '==', userId)
      .get()

    if (snap.empty) return

    const fcmTokens: string[] = []
    snap.docs.forEach((d: any) => {
      const sub = d.data() as PushSubscriptionRecord
      if (sub.token) fcmTokens.push(sub.token)
    })

    if (fcmTokens.length === 0) return

    const messaging = getMessaging()

    // Send in batches of 500 (FCM limit)
    const chunkSize = 500
    for (let i = 0; i < fcmTokens.length; i += chunkSize) {
      const chunk = fcmTokens.slice(i, i + chunkSize)
      const message = {
        notification: {
          title,
          body,
          ...(imageUrl ? { imageUrl } : {})
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        webpush: {
          notification: {
            title,
            body,
            icon: '/icon-192.png',
            badge: '/badge-96.png',
            ...(imageUrl ? { image: imageUrl } : {})
          },
          fcmOptions: {
            link: data.url || '/'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              badge: 1,
              sound: 'default'
            }
          },
          fcmOptions: {
            imageUrl: imageUrl || undefined
          }
        },
        tokens: chunk
      }

      const response = await messaging.sendEachForMulticast(message as any)

      // Clean up invalid tokens
      const toDelete: string[] = []
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success) {
          const errCode = resp.error?.code
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            toDelete.push(chunk[idx])
          }
        }
      })

      if (toDelete.length > 0) {
        const invalids = await db.collection('push_subscriptions')
          .where('userId', '==', userId)
          .get()
        const delBatch = db.batch()
        invalids.docs.forEach((d: any) => {
          if (toDelete.includes(d.data().token)) delBatch.delete(d.ref)
        })
        await delBatch.commit()
      }
    }
  } catch (error) {
    console.error('sendPushToUser error:', error)
  }
}

// ── Batch send to multiple users ──────────────────────────────────────────

export async function sendPushToUsers(
  userIds: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<void> {
  await Promise.allSettled(
    userIds.map(uid => sendPushToUser(uid, title, body, data))
  )
}

// ── Test notification (self) ──────────────────────────────────────────────

export const sendTestNotification = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    await sendPushToUser(
      req.user.id,
      '🚀 Push Notifications Active!',
      'Edworld Co. push notifications are working correctly on this device.',
      { type: 'test', url: '/notifications' }
    )
    res.json({ success: true, message: 'Test notification sent' })
  } catch (error) {
    console.error('Test notification error:', error)
    res.status(500).json({ error: 'Failed to send test notification' })
  }
}

// ── Notification history ──────────────────────────────────────────────────

export const getNotificationHistory = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const db = (prisma as any)._db
    const snap = await db.collection('notification_history')
      .where('userId', '==', req.user.id)
      .orderBy('sentAt', 'desc')
      .limit(50)
      .get()

    const notifications = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
    res.json(notifications)
  } catch (error) {
    console.error('Get notification history error:', error)
    res.status(500).json({ error: 'Failed to fetch notification history' })
  }
}

// ── Mark notification as read ─────────────────────────────────────────────

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params

  try {
    const db = (prisma as any)._db
    await db.collection('notification_history').doc(id).update({ read: true })
    res.json({ success: true })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
}

// ── Get subscription status ───────────────────────────────────────────────

export const getSubscriptionStatus = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const db = (prisma as any)._db
    const snap = await db.collection('push_subscriptions')
      .where('userId', '==', req.user.id)
      .get()

    res.json({
      subscribed: !snap.empty,
      deviceCount: snap.docs.length,
      devices: snap.docs.map((d: any) => ({
        platform: d.data().platform,
        userAgent: d.data().userAgent?.slice(0, 60),
        createdAt: d.data().createdAt
      }))
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subscription status' })
  }
}
