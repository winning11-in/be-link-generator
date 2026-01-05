/**
 * Professional Email Templates for QR Studio
 * Beautiful, responsive email templates with modern design
 */

/**
 * Get current date in readable format
 * @returns {string} Formatted date
 */
const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get user's browser and location info (mock data for now)
 * In production, you would extract this from request headers
 * @param {object} req - Request object
 * @returns {object} Browser and location info
 */
const getRequestInfo = (req = null) => {
  // This would be extracted from actual request headers in production
  return {
    browser: 'Chrome on Windows',
    location: 'United States',
    date: getCurrentDate()
  };
};

/**
 * Password Reset OTP Email Template
 * Professional template matching the provided design
 */
const passwordResetOTPTemplate = (email, otp, requestInfo = null) => {
  const info = requestInfo || getRequestInfo();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password - QR Studio</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f4f5;
      color: #18181b;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .email-header {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      padding: 40px 40px 50px;
      text-align: center;
    }
    
    .lock-icon {
      width: 64px;
      height: 64px;
      background-color: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .lock-icon svg {
      width: 32px;
      height: 32px;
      fill: #ffffff;
    }
    
    .header-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
    }
    
    .email-body {
      padding: 40px;
      background-color: #ffffff;
      margin-top: -20px;
      border-radius: 20px 20px 0 0;
      position: relative;
    }
    
    .greeting {
      font-size: 14px;
      color: #71717a;
      margin-bottom: 8px;
    }
    
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #18181b;
      margin-bottom: 16px;
    }
    
    .description {
      font-size: 15px;
      color: #52525b;
      margin-bottom: 32px;
      line-height: 1.7;
    }
    
    .otp-container {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 2px dashed #fca5a5;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      margin-bottom: 32px;
    }
    
    .otp-label {
      font-size: 12px;
      font-weight: 600;
      color: #dc2626;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    
    .otp-code {
      font-size: 42px;
      font-weight: 700;
      color: #dc2626;
      letter-spacing: 8px;
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    }
    
    .otp-expiry {
      font-size: 13px;
      color: #71717a;
      margin-top: 16px;
    }
    
    .otp-expiry strong {
      color: #dc2626;
    }
    
    .alert-box {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #dc2626;
      padding: 16px 20px;
      border-radius: 0 12px 12px 0;
      margin-bottom: 32px;
    }
    
    .alert-title {
      font-size: 14px;
      font-weight: 600;
      color: #991b1b;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .alert-text {
      font-size: 13px;
      color: #b91c1c;
      line-height: 1.5;
    }
    
    .info-box {
      background-color: #f4f4f5;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    
    .info-title {
      font-size: 13px;
      font-weight: 600;
      color: #52525b;
      margin-bottom: 12px;
    }
    
    .info-row {
      font-size: 13px;
      color: #71717a;
      margin-bottom: 6px;
      padding-left: 20px;
      position: relative;
    }
    
    .info-row:before {
      content: "•";
      position: absolute;
      left: 8px;
    }
    
    .info-row:last-child {
      margin-bottom: 0;
    }
    
    .divider {
      height: 1px;
      background-color: #e4e4e7;
      margin: 24px 0;
    }
    
    .help-text {
      font-size: 13px;
      color: #71717a;
      text-align: center;
      line-height: 1.6;
    }
    
    .help-text a {
      color: #7c3aed;
      text-decoration: none;
      font-weight: 500;
    }
    
    .email-footer {
      background-color: #fafafa;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #e4e4e7;
    }
    
    .footer-logo {
      width: 32px;
      height: 32px;
      margin-bottom: 16px;
    }
    
    .footer-brand {
      font-size: 14px;
      font-weight: 600;
      color: #18181b;
      margin-bottom: 8px;
    }
    
    .footer-tagline {
      font-size: 12px;
      color: #71717a;
      margin-bottom: 20px;
    }
    
    .footer-links {
      margin-bottom: 16px;
    }
    
    .footer-link {
      font-size: 12px;
      color: #71717a;
      text-decoration: none;
      margin: 0 12px;
    }
    
    .copyright {
      font-size: 11px;
      color: #a1a1aa;
    }
    
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        width: 100% !important;
      }
      
      .email-header, .email-body, .email-footer {
        padding: 24px !important;
      }
      
      .title {
        font-size: 20px !important;
      }
      
      .otp-code {
        font-size: 28px !important;
        letter-spacing: 4px !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-wrapper" width="600" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td class="email-header">
              <div class="lock-icon">
                <svg viewBox="0 0 24 24"><path d="M12 1C8.676 1 6 3.676 6 7v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 0 1 1 3.732V18a1 1 0 1 1-2 0v-1.268A2 2 0 0 1 12 13z"/></svg>
              </div>
              <div class="header-title">Password Reset Request</div>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td class="email-body">
              <p class="greeting">Hello,</p>
              <h1 class="title">Reset Your Password</h1>
              <p class="description">
                We received a request to reset the password for the QR Studio account associated with <strong>${email}</strong>. Use the code below to complete the password reset:
              </p>
              
              <!-- OTP Code -->
              <div class="otp-container">
                <div class="otp-label">Password Reset Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-expiry">This code expires in <strong>10 minutes</strong></div>
              </div>
              
              <!-- Security Alert -->
              <div class="alert-box">
                <div class="alert-title">
                  Important Security Notice
                </div>
                <p class="alert-text">
                  If you did not request a password reset, please ignore this email or contact support immediately. Your account may be at risk.
                </p>
              </div>
              
              <!-- Request Info -->
              <div class="info-box">
                <div class="info-title">Request Information</div>
                <div class="info-row">Requested on: ${info.date}</div>
                <div class="info-row">Browser: ${info.browser}</div>
                <div class="info-row">Location: ${info.location}</div>
              </div>
              
              <div class="divider"></div>
              
              <p class="help-text">
                If you did not make this request, your account is still secure. No changes have been made.<br><br>
                Need help? <a href="mailto:support@qrstudio.com">Contact our support team</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="email-footer">
              <img src="https://res.cloudinary.com/dj3xx136b/image/upload/v1767616557/tohynya5xavebftekbwr.png" alt="QR Studio" class="footer-logo">
              <div class="footer-brand">QR Studio</div>
              <div class="footer-tagline">Create Beautiful QR Codes</div>
              
              <div class="footer-links">
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
                <a href="#" class="footer-link">Contact Us</a>
              </div>
              
              <p class="copyright">
                © 2026 QR Studio. All rights reserved.<br>
                winning11.in@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Email Verification OTP Template
 * Clean, professional verification email
 */
const emailVerificationTemplate = (email, otp, requestInfo = null) => {
  const info = requestInfo || getRequestInfo();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Email - QR Studio</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f4f5;
      color: #18181b;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .email-header {
      background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
      padding: 40px 40px 50px;
      text-align: center;
    }
    
    .verify-icon {
      width: 64px;
      height: 64px;
      background-color: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .verify-icon svg {
      width: 32px;
      height: 32px;
      fill: #ffffff;
    }
    
    .header-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
    }
    
    .email-body {
      padding: 40px;
      background-color: #ffffff;
      margin-top: -20px;
      border-radius: 20px 20px 0 0;
      position: relative;
    }
    
    .greeting {
      font-size: 14px;
      color: #71717a;
      margin-bottom: 8px;
    }
    
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #18181b;
      margin-bottom: 16px;
    }
    
    .description {
      font-size: 15px;
      color: #52525b;
      margin-bottom: 32px;
      line-height: 1.7;
    }
    
    .otp-container {
      background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
      border: 2px dashed #5eead4;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      margin-bottom: 32px;
    }
    
    .otp-label {
      font-size: 12px;
      font-weight: 600;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    
    .otp-code {
      font-size: 42px;
      font-weight: 700;
      color: #0f766e;
      letter-spacing: 8px;
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    }
    
    .otp-expiry {
      font-size: 13px;
      color: #71717a;
      margin-top: 16px;
    }
    
    .otp-expiry strong {
      color: #0f766e;
    }
    
    .success-box {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #16a34a;
      padding: 16px 20px;
      border-radius: 0 12px 12px 0;
      margin-bottom: 32px;
    }
    
    .success-title {
      font-size: 14px;
      font-weight: 600;
      color: #15803d;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .success-text {
      font-size: 13px;
      color: #16a34a;
      line-height: 1.5;
    }
    
    .info-box {
      background-color: #f4f4f5;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    
    .info-title {
      font-size: 13px;
      font-weight: 600;
      color: #52525b;
      margin-bottom: 12px;
    }
    
    .info-row {
      font-size: 13px;
      color: #71717a;
      margin-bottom: 6px;
      padding-left: 20px;
      position: relative;
    }
    
    .info-row:before {
      content: "•";
      position: absolute;
      left: 8px;
    }
    
    .info-row:last-child {
      margin-bottom: 0;
    }
    
    .divider {
      height: 1px;
      background-color: #e4e4e7;
      margin: 24px 0;
    }
    
    .help-text {
      font-size: 13px;
      color: #71717a;
      text-align: center;
      line-height: 1.6;
    }
    
    .help-text a {
      color: #7c3aed;
      text-decoration: none;
      font-weight: 500;
    }
    
    .email-footer {
      background-color: #fafafa;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #e4e4e7;
    }
    
    .footer-logo {
      width: 32px;
      height: 32px;
      margin-bottom: 16px;
    }
    
    .footer-brand {
      font-size: 14px;
      font-weight: 600;
      color: #18181b;
      margin-bottom: 8px;
    }
    
    .footer-tagline {
      font-size: 12px;
      color: #71717a;
      margin-bottom: 20px;
    }
    
    .footer-links {
      margin-bottom: 16px;
    }
    
    .footer-link {
      font-size: 12px;
      color: #71717a;
      text-decoration: none;
      margin: 0 12px;
    }
    
    .copyright {
      font-size: 11px;
      color: #a1a1aa;
    }
    
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        width: 100% !important;
      }
      
      .email-header, .email-body, .email-footer {
        padding: 24px !important;
      }
      
      .title {
        font-size: 20px !important;
      }
      
      .otp-code {
        font-size: 28px !important;
        letter-spacing: 4px !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-wrapper" width="600" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td class="email-header">
              <div class="verify-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 15l-5-5 1.414-1.414L10 14.172l7.586-7.586L19 8l-9 9z"/></svg>
              </div>
              <div class="header-title">Email Verification</div>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td class="email-body">
              <p class="greeting">Welcome to QR Studio!</p>
              <h1 class="title">Verify Your Email Address</h1>
              <p class="description">
                Thank you for signing up with QR Studio! Please verify your email address <strong>${email}</strong> by entering the verification code below:
              </p>
              
              <!-- OTP Code -->
              <div class="otp-container">
                <div class="otp-label">Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-expiry">This code expires in <strong>10 minutes</strong></div>
              </div>
              
              <!-- Success Box -->
              <div class="success-box">
                <div class="success-title">
                  Almost There!
                </div>
                <p class="success-text">
                  Once verified, you'll have full access to all QR Studio features including creating unlimited custom QR codes.
                </p>
              </div>
              
              <!-- Request Info -->
              <div class="info-box">
                <div class="info-title">Registration Information</div>
                <div class="info-row">Signed up on: ${info.date}</div>
                <div class="info-row">Browser: ${info.browser}</div>
                <div class="info-row">Location: ${info.location}</div>
              </div>
              
              <div class="divider"></div>
              
              <p class="help-text">
                Didn't sign up for QR Studio? You can safely ignore this email.<br><br>
                Need help? <a href="mailto:support@qrstudio.com">Contact our support team</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="email-footer">
              <img src="https://res.cloudinary.com/dj3xx136b/image/upload/v1767616557/tohynya5xavebftekbwr.png" alt="QR Studio" class="footer-logo">
              <div class="footer-brand">QR Studio</div>
              <div class="footer-tagline">Create Beautiful QR Codes</div>
              
              <div class="footer-links">
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
                <a href="#" class="footer-link">Contact Us</a>
              </div>
              
              <p class="copyright">
                © 2026 QR Studio. All rights reserved.<br>
                winning11.in@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Welcome Email Template
 * Beautiful onboarding email for new users
 */
const welcomeEmailTemplate = (userName, email) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to QR Studio</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f4f5;
      color: #18181b;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .email-header {
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      padding: 40px 40px 50px;
      text-align: center;
    }
    
    .welcome-icon {
      width: 64px;
      height: 64px;
      background-color: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .welcome-icon svg {
      width: 32px;
      height: 32px;
      fill: #ffffff;
    }
    
    .header-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
    }
    
    .email-body {
      padding: 40px;
      background-color: #ffffff;
      margin-top: -20px;
      border-radius: 20px 20px 0 0;
      position: relative;
    }
    
    .greeting {
      font-size: 14px;
      color: #71717a;
      margin-bottom: 8px;
    }
    
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #18181b;
      margin-bottom: 16px;
    }
    
    .description {
      font-size: 15px;
      color: #52525b;
      margin-bottom: 32px;
      line-height: 1.7;
    }
    
    .cta-button {
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 12px;
      display: inline-block;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 24px 0;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 32px 0;
    }
    
    .feature-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    
    .feature-icon {
      font-size: 14px;
      font-weight: 600;
      color: #7c3aed;
      margin-bottom: 12px;
      background-color: #ede9fe;
      padding: 8px 12px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .feature-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }
    
    .feature-desc {
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
    }
    
    .divider {
      height: 1px;
      background-color: #e4e4e7;
      margin: 24px 0;
    }
    
    .help-text {
      font-size: 13px;
      color: #71717a;
      text-align: center;
      line-height: 1.6;
    }
    
    .help-text a {
      color: #7c3aed;
      text-decoration: none;
      font-weight: 500;
    }
    
    .email-footer {
      background-color: #fafafa;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #e4e4e7;
    }
    
    .footer-logo {
      width: 32px;
      height: 32px;
      margin-bottom: 16px;
    }
    
    .footer-brand {
      font-size: 14px;
      font-weight: 600;
      color: #18181b;
      margin-bottom: 8px;
    }
    
    .footer-tagline {
      font-size: 12px;
      color: #71717a;
      margin-bottom: 20px;
    }
    
    .footer-links {
      margin-bottom: 16px;
    }
    
    .footer-link {
      font-size: 12px;
      color: #71717a;
      text-decoration: none;
      margin: 0 12px;
    }
    
    .copyright {
      font-size: 11px;
      color: #a1a1aa;
    }
    
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        width: 100% !important;
      }
      
      .email-header, .email-body, .email-footer {
        padding: 24px !important;
      }
      
      .title {
        font-size: 20px !important;
      }
      
      .features-grid {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-wrapper" width="600" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td class="email-header">
              <div class="welcome-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 15l-5-5 1.414-1.414L10 14.172l7.586-7.586L19 8l-9 9z"/></svg>
              </div>
              <div class="header-title">Welcome to QR Studio!</div>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td class="email-body">
              <p class="greeting">Hello ${userName}!</p>
              <h1 class="title">Welcome to QR Studio</h1>
              <p class="description">
                Thank you for joining QR Studio! We're excited to help you create beautiful, custom QR codes for your business, projects, and personal use.
              </p>
              
              <center>
                <a href="#" class="cta-button">Start Creating QR Codes</a>
              </center>
              
              <!-- Features Grid -->
              <div class="features-grid">
                <div class="feature-card">
                  <div class="feature-icon">Design</div>
                  <div class="feature-title">Custom Design</div>
                  <div class="feature-desc">Create beautiful QR codes with custom colors, logos, and styles</div>
                </div>
                
                <div class="feature-card">
                  <div class="feature-icon">Analytics</div>
                  <div class="feature-title">Analytics</div>
                  <div class="feature-desc">Track scans, locations, and performance of your QR codes</div>
                </div>
                
                <div class="feature-card">
                  <div class="feature-icon">Quality</div>
                  <div class="feature-title">High Quality</div>
                  <div class="feature-desc">Download QR codes in multiple formats including PNG, SVG</div>
                </div>
                
                <div class="feature-card">
                  <div class="feature-icon">Security</div>
                  <div class="feature-title">Secure</div>
                  <div class="feature-desc">Your data is safe with enterprise-level security</div>
                </div>
              </div>
              
              <div class="divider"></div>
              
              <p class="help-text">
                Need help getting started? <a href="mailto:support@qrstudio.com">Contact our support team</a><br>
                or check out our <a href="#">getting started guide</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="email-footer">
              <img src="https://res.cloudinary.com/dj3xx136b/image/upload/v1767616557/tohynya5xavebftekbwr.png" alt="QR Studio" class="footer-logo">
              <div class="footer-brand">QR Studio</div>
              <div class="footer-tagline">Create Beautiful QR Codes</div>
              
              <div class="footer-links">
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
                <a href="#" class="footer-link">Contact Us</a>
              </div>
              
              <p class="copyright">
                © 2026 QR Studio. All rights reserved.<br>
                winning11.in@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Account Notification Template
 * Generic template for account-related notifications
 */
const accountNotificationTemplate = (userName, title, message, actionButton = null, type = 'info') => {
  const typeColors = {
    info: {
      header: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      accent: '#0ea5e9'
    },
    success: {
      header: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      accent: '#10b981'
    },
    warning: {
      header: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      accent: '#f59e0b'
    },
    danger: {
      header: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      accent: '#ef4444'
    }
  };

  const colors = typeColors[type] || typeColors.info;
  const icons = {
    info: 'Information',
    success: 'Success',
    warning: 'Warning',
    danger: 'Alert'
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title} - QR Studio</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f4f5;
      color: #18181b;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .email-header {
      background: ${colors.header};
      padding: 40px 40px 50px;
      text-align: center;
    }
    
    .notification-icon {
      width: 64px;
      height: 64px;
      background-color: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 12px;
      font-weight: 600;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .header-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
    }
    
    .email-body {
      padding: 40px;
      background-color: #ffffff;
      margin-top: -20px;
      border-radius: 20px 20px 0 0;
      position: relative;
    }
    
    .greeting {
      font-size: 14px;
      color: #71717a;
      margin-bottom: 8px;
    }
    
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #18181b;
      margin-bottom: 16px;
    }
    
    .description {
      font-size: 15px;
      color: #52525b;
      margin-bottom: 32px;
      line-height: 1.7;
    }
    
    .cta-button {
      background: ${colors.accent};
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 12px;
      display: inline-block;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 24px 0;
    }
    
    .divider {
      height: 1px;
      background-color: #e4e4e7;
      margin: 24px 0;
    }
    
    .help-text {
      font-size: 13px;
      color: #71717a;
      text-align: center;
      line-height: 1.6;
    }
    
    .help-text a {
      color: #7c3aed;
      text-decoration: none;
      font-weight: 500;
    }
    
    .email-footer {
      background-color: #fafafa;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #e4e4e7;
    }
    
    .footer-logo {
      width: 32px;
      height: 32px;
      margin-bottom: 16px;
    }
    
    .footer-brand {
      font-size: 14px;
      font-weight: 600;
      color: #18181b;
      margin-bottom: 8px;
    }
    
    .footer-tagline {
      font-size: 12px;
      color: #71717a;
      margin-bottom: 20px;
    }
    
    .footer-links {
      margin-bottom: 16px;
    }
    
    .footer-link {
      font-size: 12px;
      color: #71717a;
      text-decoration: none;
      margin: 0 12px;
    }
    
    .copyright {
      font-size: 11px;
      color: #a1a1aa;
    }
    
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        width: 100% !important;
      }
      
      .email-header, .email-body, .email-footer {
        padding: 24px !important;
      }
      
      .title {
        font-size: 20px !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-wrapper" width="600" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td class="email-header">
              <div class="notification-icon">
                ${icons[type]}
              </div>
              <div class="header-title">${title}</div>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td class="email-body">
              <p class="greeting">Hi ${userName},</p>
              <h1 class="title">${title}</h1>
              <p class="description">
                ${message}
              </p>
              
              ${actionButton ? `<center><a href="${actionButton.url}" class="cta-button">${actionButton.text}</a></center>` : ''}
              
              <div class="divider"></div>
              
              <p class="help-text">
                Need help? <a href="mailto:support@qrstudio.com">Contact our support team</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="email-footer">
              <img src="https://res.cloudinary.com/dj3xx136b/image/upload/v1767616557/tohynya5xavebftekbwr.png" alt="QR Studio" class="footer-logo">
              <div class="footer-brand">QR Studio</div>
              <div class="footer-tagline">Create Beautiful QR Codes</div>
              
              <div class="footer-links">
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
                <a href="#" class="footer-link">Contact Us</a>
              </div>
              
              <p class="copyright">
                © 2026 QR Studio. All rights reserved.<br>
                winning11.in@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export {
  passwordResetOTPTemplate,
  emailVerificationTemplate,
  welcomeEmailTemplate,
  accountNotificationTemplate,
  getCurrentDate,
  getRequestInfo
};