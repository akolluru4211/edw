import os
import re
import httpx

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")

def send_email(to: str, subject: str, html: str):
    if not RESEND_API_KEY:
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("[MOCK EMAIL SENT]")
        print(f"To: {to}")
        print(f"Subject: {subject}")
        print(f"Body (HTML length): {len(html)} characters")
        
        # Extract href links using regex
        links = re.findall(r'href="([^"]+)"', html)
        if links:
            print("Extracted Links:")
            for link in links:
                print(f"  - {link}")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        return {"id": f"mock-email-id-python"}

    try:
        # Send using Resend API via HTTP POST
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "from": "Edworld Co. <onboarding@resend.dev>",
            "to": [to],
            "subject": subject,
            "html": html
        }
        res = httpx.post("https://api.resend.com/emails", json=payload, headers=headers)
        res.raise_for_status()
        return res.json()
    except Exception as error:
        print("Failed to send email via Resend:", error)
        # Fallback to mock
        return {"id": "fallback-mock-email-id"}

def get_email_template(title: str, body_html: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }}
        .container {{
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }}
        .header {{
          background-color: #0284c7;
          background-image: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
          padding: 30px;
          text-align: center;
          color: #ffffff;
        }}
        .logo-text {{
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin: 0;
        }}
        .logo-sub {{
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #bae6fd;
          margin-top: 4px;
          font-weight: 700;
        }}
        .content {{
          padding: 40px 30px;
          color: #334155;
          font-size: 15px;
          line-height: 1.6;
        }}
        .footer {{
          background-color: #f8fafc;
          padding: 20px 30px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
        }}
        .btn {{
          display: inline-block;
          padding: 12px 24px;
          background-color: #0284c7;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          margin-top: 20px;
        }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">EDWORLD CO.</div>
          <div class="logo-sub">AI-Powered Career Engine</div>
        </div>
        <div class="content">
          <h2 style="margin-top: 0; color: #1e293b; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">{title}</h2>
          {body_html}
        </div>
        <div class="footer">
          &copy; 2026 Edworld Co. All rights reserved.<br>
          This email was sent to notify you of important updates in your career workspace.
        </div>
      </div>
    </body>
    </html>
    """
