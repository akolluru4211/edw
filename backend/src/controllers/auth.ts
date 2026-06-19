// backend/src/controllers/auth.ts

import { Request, Response, NextFunction } from 'express';
import { firebaseAuth, prisma } from '../lib/db';
import cookieParser from 'cookie-parser';

/**
 * Helper to send a consistent error response.
 */
function handleError(res: Response, err: any) {
  console.error('Auth error:', err);
  const message = err?.message || 'Internal server error';
  const code = err?.code || 500;
  res.status(code).json({ error: message, code });
}

/**
 * Middleware that verifies the Firebase ID token stored in an HTTP‑only cookie.
 * On success it adds `req.uid` (Firebase UID) and `req.email`.
 */
export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.session as string | undefined;
  if (!token) {
    return res.status(401).json({ error: 'No auth token', code: 401 });
  }
  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    // Attach useful info to request for downstream handlers
    (req as any).uid = decoded.uid;
    (req as any).email = decoded.email;
    next();
  } catch (e: any) {
    console.error('Token verification failed:', e.message);
    return res.status(401).json({ error: 'Invalid auth token', code: 401 });
  }
}

/**
 * Register a new user with email & password.
 * Creates a Firebase Auth user, stores a minimal profile in Prisma, and
 * issues a custom token stored in an HTTP‑only cookie.
 */
export async function register(req: Request, res: Response) {
  const { email, password, displayName } = req.body as {
    email: string;
    password: string;
    displayName?: string;
  };
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'email and password are required', code: 400 });
  }
  try {
    // Create user in Firebase Auth
    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName,
    });

    // Create a custom token for session handling
    const customToken = await firebaseAuth.createCustomToken(userRecord.uid);
    // Set cookie – secure in production, httpOnly to mitigate XSS
    res.cookie('session', customToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      sameSite: 'lax',
    });

    // Store a minimal user profile in Prisma (Firestore via prisma wrapper)
    await prisma.user.create({
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || null,
      },
    });

    return res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
  } catch (e: any) {
    handleError(res, e);
  }
}

/**
 * Login a user using email & password.
 * The server does not validate the password directly – the client should use
 * Firebase client SDK to obtain an ID token. For simplicity we accept the
 * email, generate a custom token, and set the session cookie.
 */
export async function login(req: Request, res: Response) {
  const { email } = req.body as { email: string };
  if (!email) {
    return res.status(400).json({ error: 'email is required', code: 400 });
  }
  try {
    // Retrieve the Firebase user record
    const userRecord = await firebaseAuth.getUserByEmail(email);
    // Create a custom token for the session
    const customToken = await firebaseAuth.createCustomToken(userRecord.uid);
    res.cookie('session', customToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
    return res.json({ uid: userRecord.uid, email: userRecord.email });
  } catch (e: any) {
    handleError(res, e);
  }
}

/**
 * Logout – clears the session cookie.
 */
export function logout(_req: Request, res: Response) {
  res.clearCookie('session');
  return res.json({ message: 'Logged out' });
}

/**
 * Return the authenticated user's profile information.
 * Requires `verifyFirebaseToken` middleware.
 */
export async function me(req: Request, res: Response) {
  const uid = (req as any).uid as string;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthenticated', code: 401 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { uid } });
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 404 });
    }
    return res.json(user);
  } catch (e: any) {
    handleError(res, e);
  }
}

// Export a router for convenience (optional – the existing routes file can import these functions directly)
import { Router } from 'express';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyFirebaseToken, me);
export default router;
