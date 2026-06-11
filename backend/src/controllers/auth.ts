import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import crypto from 'crypto'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'
import { sendEmail, getEmailTemplate } from '../lib/email'

export const register = async (req: Request, res: Response) => {
  const {
    email,
    password,
    fullName,
    phoneNumber,
    collegeName,
    degree,
    branch,
    graduationYear,
    interests,
    goals,
    dob,
    publicKey,
    encryptedPrivateKey,
    keySalt,
    keyIv
  } = req.body

  if (!email || !password || !fullName || !collegeName || !degree || !branch || !graduationYear) {
    return res.status(400).json({ error: 'Missing required registration parameters' })
  }

  const gradYearNum = Number(graduationYear)
  if (isNaN(gradYearNum) || !Number.isInteger(gradYearNum)) {
    return res.status(400).json({ error: 'Graduation year must be a valid integer' })
  }

  // Strict password strength validation: min 8 characters, mixed case, number, symbol
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^-])[A-Za-z\d@$!%*?&_#^-]{8,}$/
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    })
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    
    // Sign up user in Supabase Auth first
    const supabaseUrl = 'https://zfmprakiunbqsisqsiet.supabase.co'
    const supabaseKey = 'sb_publishable_7AxFqBP4O2Otz6y1jFcn4A_6WOrXTBH'
    let supabaseUserId: string | null = null
    try {
      const sbRes = await axios.post(`${supabaseUrl}/auth/v1/signup`, {
        email,
        password
      }, {
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      })
      supabaseUserId = sbRes.data?.id || sbRes.data?.user?.id
    } catch (err: any) {
      console.error('Failed to register user in Supabase Auth:', err.response?.data || err.message)
      const errorMsg = err.response?.data?.msg || err.response?.data?.error_description || err.message
      if (!errorMsg.toLowerCase().includes('already') && !errorMsg.toLowerCase().includes('exists')) {
        return res.status(400).json({ error: `Supabase Auth signup failed: ${errorMsg}` })
      }
    }

    // All signups default to STUDENT
    const role = 'STUDENT'

    // Generate unique memberId (e.g., EDW-SARA-2024 style, using name + random year/digits)
    const nameClean = fullName.toUpperCase().replace(/[^A-Z]/g, '')
    const namePart = (nameClean + 'USER').slice(0, 4)
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const memberId = `EDW-${namePart}-${randomDigits}`

    let dobDate: Date | null = null
    if (dob) {
      const parsed = new Date(dob)
      if (!isNaN(parsed.getTime())) {
        dobDate = parsed
      }
    }

    // Create user and profile in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: supabaseUserId || undefined,
          email,
          passwordHash,
          fullName,
          phoneNumber,
          role,
          memberId,
          publicKey,
          encryptedPrivateKey,
          keySalt,
          keyIv
        }
      })

      // Generate public portfolio URL suffix (e.g. u/john-doe)
      const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)

      await tx.profile.create({
        data: {
          userId: user.id,
          collegeName,
          degree,
          branch,
          graduationYear: gradYearNum,
          interests: JSON.stringify(interests || []),
          goals: JSON.stringify(goals || []),
          portfolioUrl: slug,
          readinessScore: 20, // Default base score for registering
          dob: dobDate
        }
      })

      await tx.pointTransaction.create({
        data: {
          userId: user.id,
          points: 50,
          description: "Welcome Signup Reward"
        }
      })

      return user
    })

    // Log signup event
    await prisma.dataLog.create({
      data: {
        type: 'SIGNUP',
        email,
        ipAddress: req.ip || null,
        details: `User registered successfully. Role: ${role}, MemberId: ${memberId}`
      }
    }).catch(err => console.error('Failed to write signup log:', err))

    // Dispatch welcome email asynchronously using Resend API
    const welcomeHtml = getEmailTemplate(
      'Welcome to Edworld Co.!',
      `
        <p>Dear ${newUser.fullName},</p>
        <p>Thank you for registering at <strong>Edworld Co.</strong>, your premier AI-powered career enhancement workspace.</p>
        <p>Your unique <strong>Member ID</strong> is: <strong>${memberId}</strong></p>
        <p>Here are your next steps to succeed:</p>
        <ul>
          <li>Complete your profile setup to unlock your digital career card.</li>
          <li>Upload your resume for real-time ATS scoring and feedback.</li>
          <li>Schedule simulated coding and behavioral interviews with our AI coach.</li>
        </ul>
        <p>We are thrilled to support you on your professional journey.</p>
        <br>
        <p>Best regards,<br>The Edworld Co. Team</p>
      `
    )
    sendEmail({
      to: newUser.email,
      subject: 'Welcome to Edworld Co.!',
      html: welcomeHtml
    }).catch(err => console.error('Failed to send welcome email:', err))

    const tokenSecret = process.env.JWT_SECRET || 'fallback_secret'
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, tokenSecret, { expiresIn: '7d' })

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        memberId: newUser.memberId
      }
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error during registration' })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      // Log login failure
      await prisma.dataLog.create({
        data: {
          type: 'LOGIN_FAILURE',
          email,
          ipAddress: req.ip || null,
          details: !user ? 'User does not exist' : 'Incorrect password'
        }
      }).catch(err => console.error('Failed to write login failure log:', err))

      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Try to login/sync user in Supabase Auth so they appear in Supabase Authentication Dashboard
    const supabaseUrl = 'https://zfmprakiunbqsisqsiet.supabase.co'
    const supabaseKey = 'sb_publishable_7AxFqBP4O2Otz6y1jFcn4A_6WOrXTBH'
    try {
      await axios.post(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        email,
        password
      }, {
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      })
      console.log(`Supabase Auth login synced successfully for ${email}`)
    } catch (err: any) {
      console.error(`Supabase Auth sync login failed for ${email}:`, err.response?.data || err.message)
      // If user is not in Supabase Auth, let's auto-register them
      try {
        await axios.post(`${supabaseUrl}/auth/v1/signup`, {
          email,
          password
        }, {
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          }
        })
        console.log(`Auto-registered ${email} in Supabase Auth on login.`)
      } catch (signupErr: any) {
        console.error(`Auto-registration in Supabase Auth failed for ${email}:`, signupErr.response?.data || signupErr.message)
      }
    }

    // Check if the user has already received a daily login reward today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const existingTx = await prisma.pointTransaction.findFirst({
      where: {
        userId: user.id,
        description: "Daily Login Reward",
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    })

    if (!existingTx) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { edPoints: { increment: 10 } }
        })
        await tx.pointTransaction.create({
          data: {
            userId: user.id,
            points: 10,
            description: "Daily Login Reward"
          }
        })
      })
    }

    // Log login success
    await prisma.dataLog.create({
      data: {
        type: 'LOGIN_SUCCESS',
        email,
        ipAddress: req.ip || null,
        details: `User logged in. Role: ${user.role}`
      }
    }).catch(err => console.error('Failed to write login success log:', err))

    const tokenSecret = process.env.JWT_SECRET || 'fallback_secret'
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, tokenSecret, { expiresIn: '7d' })

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true }
    })

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found after login updates' })
    }

    res.json({
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        memberId: updatedUser.memberId,
        publicKey: updatedUser.publicKey,
        encryptedPrivateKey: updatedUser.encryptedPrivateKey,
        keySalt: updatedUser.keySalt,
        keyIv: updatedUser.keyIv,
        edPoints: updatedUser.edPoints,
        profile: updatedUser.profile
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error during login' })
  }
}

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: {
          include: {
            projects: true,
            experience: true,
            certifications: true,
            skills: true
          }
        },
        resumes: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      memberId: user.memberId,
      publicKey: user.publicKey,
      encryptedPrivateKey: user.encryptedPrivateKey,
      keySalt: user.keySalt,
      keyIv: user.keyIv,
      edPoints: user.edPoints,
      profile: user.profile,
      resumes: user.resumes
    })
  } catch (error) {
    console.error('getMe error:', error)
    res.status(500).json({ error: 'Internal server error fetching user session' })
  }
}

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' })
    }

    // Generate secure reset token
    const token = crypto.randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes validity

    await prisma.passwordResetOTP.upsert({
      where: { email },
      update: { code: token, expiresAt },
      create: { email, code: token, expiresAt }
    })

    // Construct secure reset link matching request origin
    const origin = req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:3001'
    const resetLink = `${origin}/reset-password?email=${encodeURIComponent(email)}&code=${token}`

    // Send reset link email
    const resetHtml = getEmailTemplate(
      'Reset Your Password',
      `
        <p>Dear ${user.fullName},</p>
        <p>You requested to reset your password for your <strong>Edworld Co.</strong> workspace.</p>
        <p>Please click the button below to recover your account and choose a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background-color: #0284c7; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">Reset Password</a>
        </div>
        <p>If the button above does not work, you can copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #64748b; font-size: 13px; font-family: monospace; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;">${resetLink}</p>
        <p>This link is valid for 15 minutes. If you did not make this request, you can safely ignore this email.</p>
        <br>
        <p>Best regards,<br>The Edworld Co. Team</p>
      `
    )

    await sendEmail({
      to: email,
      subject: 'Edworld Co. - Reset Your Password',
      html: resetHtml
    })

    res.json({ success: true, message: 'Password reset link has been sent to your email.' })
  } catch (error) {
    console.error('Request password reset error:', error)
    res.status(500).json({ error: 'Internal server error requesting password reset' })
  }
}

export const verifyAndResetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, code, and new password are required' })
  }

  // Validate password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^-])[A-Za-z\d@$!%*?&_#^-]{8,}$/
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' })
    }

    const record = await prisma.passwordResetOTP.findUnique({ where: { email } })
    if (!record || record.code !== code || record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired password reset link' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    })

    // Delete verification record
    await prisma.passwordResetOTP.delete({ where: { email } }).catch(() => {})

    // Log password reset event
    await prisma.dataLog.create({
      data: {
        type: 'PASSWORD_RESET',
        email,
        ipAddress: req.ip || null,
        details: 'User reset their password successfully using OTP verification.'
      }
    }).catch(err => console.error('Failed to write password reset log:', err))

    res.json({ success: true, message: 'Password has been reset successfully.' })
  } catch (error) {
    console.error('Verify and reset password error:', error)
    res.status(500).json({ error: 'Internal server error during password reset' })
  }
}

export const saveKeys = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  const { publicKey, encryptedPrivateKey, keySalt, keyIv } = req.body
  if (!publicKey || !encryptedPrivateKey || !keySalt || !keyIv) {
    return res.status(400).json({ error: 'Missing key parameters' })
  }
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        publicKey,
        encryptedPrivateKey,
        keySalt,
        keyIv
      }
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Save keys error:', error)
    res.status(500).json({ error: 'Internal server error saving keys' })
  }
}
