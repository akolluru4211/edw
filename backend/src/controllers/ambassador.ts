import { Request, Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'
import { sendEmail, getEmailTemplate } from '../lib/email'

// Submit an application
export const applyAmbassador = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const {
    name,
    email,
    phone,
    whatsapp,
    linkedin,
    collegeName,
    course,
    year,
    rollNumber,
    city
  } = req.body

  if (!name || !email || !phone || !whatsapp || !linkedin || !collegeName || !course || !year || !rollNumber || !city) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    // Check if user already has an application
    const existing = await prisma.ambassadorApplication.findFirst({
      where: { userId: req.user.id }
    })

    if (existing) {
      return res.status(400).json({ error: 'You have already submitted an ambassador application.' })
    }

    const application = await prisma.ambassadorApplication.create({
      data: {
        userId: req.user.id,
        name,
        email,
        phone,
        whatsapp,
        linkedin,
        collegeName,
        course,
        year,
        rollNumber,
        city,
        status: 'PENDING'
      }
    })

    // Send email notification to edworld.eden@gmail.com
    const emailHtml = getEmailTemplate(
      'New Campus Ambassador Application',
      `
        <p>A new student has applied for the Campus Ambassador program.</p>
        <h3 style="color:#0284c7; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-top:20px;">Applicant Details</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:8px;">
          <tr>
            <td style="padding:6px 0; font-weight:bold; width:150px; color:#64748b;">Full Name:</td>
            <td style="padding:6px 0; color:#1e293b;">${name}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; font-weight:bold; color:#64748b;">Email Address:</td>
            <td style="padding:6px 0; color:#1e293b;">${email}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; font-weight:bold; color:#64748b;">Phone Number:</td>
            <td style="padding:6px 0; color:#1e293b;">${phone}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; font-weight:bold; color:#64748b;">WhatsApp Number:</td>
            <td style="padding:6px 0; color:#1e293b;">${whatsapp}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; font-weight:bold; color:#64748b;">Social Profile:</td>
            <td style="padding:6px 0;"><a href="${linkedin}" target="_blank" style="color:#0284c7; text-decoration:none; font-weight:600;">${linkedin}</a></td>
          </tr>
        </table>
        
        <h3 style="color:#0284c7; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-top:24px;">College & Academic Details</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:8px;">
          <tr>
            <td style="padding:6px 0; font-weight:bold; width:150px; color:#64748b;">College Name:</td>
            <td style="padding:6px 0; color:#1e293b;">${collegeName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; font-weight:bold; color:#64748b;">Course / Major:</td>
            <td style="padding:6px 0; color:#1e293b;">${course}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; font-weight:bold; color:#64748b;">Year of Study:</td>
            <td style="padding:6px 0; color:#1e293b;">${year} Year</td>
          </tr>
          <tr>
            <td style="padding:6px 0; font-weight:bold; color:#64748b;">Roll Number/ID:</td>
            <td style="padding:6px 0; color:#1e293b;">${rollNumber}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; font-weight:bold; color:#64748b;">City / State:</td>
            <td style="padding:6px 0; color:#1e293b;">${city}</td>
          </tr>
        </table>
        <br>
        <p style="font-size:13px; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:12px; margin-top:20px;">
          Log in to the Admin Console on Edworld Co. to review and process this application.
        </p>
      `
    )

    sendEmail({
      to: 'edworld.eden@gmail.com',
      subject: `New Ambassador Application: ${name} (${collegeName})`,
      html: emailHtml
    }).catch(err => console.error('Failed to send ambassador application notification email:', err))

    res.status(201).json(application)
  } catch (error: any) {
    console.error('Failed to submit ambassador application:', error)
    res.status(500).json({ error: 'Internal server error submitting application' })
  }
}

// Get all applications (Admin only)
export const getAdminAmbassadors = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.ambassadorApplication.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(list)
  } catch (error) {
    console.error('Failed to fetch ambassador applications:', error)
    res.status(500).json({ error: 'Internal server error fetching applications' })
  }
}

// Update status (Admin only)
export const updateAdminAmbassadorStatus = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  const { status } = req.body // APPROVED, REJECTED

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing status parameter' })
  }

  try {
    const application = await prisma.ambassadorApplication.findUnique({
      where: { id }
    })

    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const updated = await prisma.ambassadorApplication.update({
      where: { id },
      data: { status }
    })

    // Send email notification to user about status update
    const statusHtml = getEmailTemplate(
      `Campus Ambassador Application Update`,
      `
        <p>Dear ${application.name},</p>
        <p>Your application to represent Edworld Co. as a Campus Ambassador at <strong>${application.collegeName}</strong> has been reviewed.</p>
        <p>Status: <strong style="color: ${status === 'APPROVED' ? '#22c55e' : '#ef4444'};">${status}</strong></p>
        
        ${status === 'APPROVED' 
          ? `<p>Congratulations and welcome to the team! Our onboarding ambassadors will reach out to you shortly via WhatsApp (${application.whatsapp}) to share marketing collateral, ambassador reward structure details, and add you to the global network.</p>`
          : `<p>Thank you for taking the time to apply. Unfortunately, we cannot move forward with your application at this stage. We encourage you to continue developing your tech and professional portfolio on the platform and apply again in the next cohort.</p>`
        }
        <br>
        <p>Best regards,<br>The Edworld Co. Team</p>
      `
    )

    sendEmail({
      to: application.email,
      subject: `Edworld Co. Campus Ambassador Application Status: ${status}`,
      html: statusHtml
    }).catch(err => console.error('Failed to send status update email:', err))

    res.json(updated)
  } catch (error) {
    console.error('Failed to update application status:', error)
    res.status(500).json({ error: 'Internal server error updating application status' })
  }
}
