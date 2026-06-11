import { Resend } from 'resend'

const resendKey = process.env.RESEND_API_KEY
const resend = resendKey ? new Resend(resendKey) : null

if (!resend) {
  console.warn('⚠️ RESEND_API_KEY environment variable is not defined. Email service will run in Mock Mode.')
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  if (!resend) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`[MOCK EMAIL SENT]`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body (HTML length): ${html.length} characters`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return { id: 'mock-email-id-' + Math.random().toString(36).substring(2, 9) }
  }

  try {
    const data = await resend.emails.send({
      from: 'Edworld Co. <onboarding@resend.dev>',
      to,
      subject,
      html
    })
    return data
  } catch (error) {
    console.error('Failed to send email via Resend:', error)
    throw error
  }
}

// Helper to generate the standard Edworld Co. Email Wrapper (Premium layout with Logo & Header)
export const getEmailTemplate = (title: string, bodyHtml: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #0284c7;
          background-image: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
          padding: 30px;
          text-align: center;
          color: #ffffff;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .logo-sub {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #bae6fd;
          margin-top: 4px;
          font-weight: 700;
        }
        .content {
          padding: 40px 30px;
          color: #334155;
          font-size: 15px;
          line-height: 1.6;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px 30px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: #0284c7;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">EDWORLD CO.</div>
          <div class="logo-sub">AI-Powered Career Engine</div>
        </div>
        <div class="content">
          <h2 style="margin-top: 0; color: #1e293b; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">${title}</h2>
          ${bodyHtml}
        </div>
        <div class="footer">
          &copy; 2026 Edworld Co. All rights reserved.<br>
          This email was sent to notify you of important updates in your career workspace.
        </div>
      </div>
    </body>
    </html>
  `
}
