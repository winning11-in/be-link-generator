import SibApiV3Sdk from 'sib-api-v3-sdk';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

console.log('Email Service - Brevo API Key configured:', process.env.BREVO_API_KEY ? 'Yes' : 'No');
console.log('Email Service - API Key starts with:', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 10) + '...' : 'undefined');

// Check if API key is configured
if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'YOUR_BREVO_API_KEY_HERE') {
  console.warn('BREVO_API_KEY is not configured. Email sending will fail.');
}

/**
 * Get a fresh Brevo API client with current API key
 * This ensures the API key is always up-to-date and avoids authentication issues
 * @returns {SibApiV3Sdk.TransactionalEmailsApi} Fresh API client instance
 */
const getBrevoClient = () => {
  const client = SibApiV3Sdk.ApiClient.instance;
  client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
  return new SibApiV3Sdk.TransactionalEmailsApi();
};

// OTP storage (in production, use Redis or database)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Store OTP with expiration
 * @param {string} email - User's email
 * @param {string} otp - Generated OTP
 * @param {number} expiryMinutes - OTP expiry time in minutes (default: 10)
 */
const storeOTP = (email, otp, expiryMinutes = 10) => {
  const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);
  const emailKey = email.toLowerCase();

  // Get existing data or initialize
  const existingData = otpStore.get(emailKey) || { requestCount: 0 };

  otpStore.set(emailKey, {
    otp,
    expiryTime,
    attempts: 0,
    requestCount: existingData.requestCount + 1,
    lastRequestTime: Date.now()
  });
};

/**
 * Verify OTP
 * @param {string} email - User's email
 * @param {string} userOTP - OTP entered by user
 * @returns {object} { isValid: boolean, message: string }
 */
const verifyOTP = (email, userOTP) => {
  const emailKey = email.toLowerCase();
  const storedData = otpStore.get(emailKey);

  if (!storedData) {
    return { isValid: false, message: 'OTP not found or expired' };
  }

  // Check if OTP has expired
  if (Date.now() > storedData.expiryTime) {
    otpStore.delete(emailKey);
    return { isValid: false, message: 'OTP has expired' };
  }

  // Check attempts (max 3 attempts)
  if (storedData.attempts >= 3) {
    otpStore.delete(emailKey);
    return { isValid: false, message: 'Too many failed attempts. Please request a new OTP' };
  }

  // Verify OTP
  if (storedData.otp === userOTP) {
    otpStore.delete(emailKey);
    return { isValid: true, message: 'OTP verified successfully' };
  } else {
    storedData.attempts += 1;
    return { isValid: false, message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining` };
  }
};

/**
 * Send OTP via Brevo email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP to send
 * @param {string} purpose - Purpose of OTP (verification, reset, etc.)
 * @returns {Promise<object>} Send result
 */
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  try {
    const apiInstance = getBrevoClient();
    console.log('Sending OTP email - API Key configured:', !!process.env.BREVO_API_KEY);
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Customize subject and content based on purpose
    const subjects = {
      verification: "QR  Studio - Email Verification Code",
      reset: "QR Studio - Password Reset Code",
      forgot: "QR Studio - Password Reset Code"
    };

    const titles = {
      verification: "Email Verification",
      reset: "Password Reset",
      forgot: "Password Reset"
    };

    const messages = {
      verification: "Please use this code to verify your email address.",
      reset: "Please use this code to reset your password.",
      forgot: "Please use this code to reset your password."
    };

    sendSmtpEmail.subject = subjects[purpose] || subjects.verification;
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>QR Studio - ${titles[purpose] || titles.verification}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 10px !important; }
              .content-card { padding: 25px !important; margin: 10px 0 !important; }
              .otp-code { font-size: 32px !important; letter-spacing: 4px !important; }
              .header-logo { width: 50px !important; height: 50px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f23; line-height: 1.6;">
          <div style="min-height: 100vh; background: #0f0f23; padding: 40px 20px;">
            <div class="container" style="max-width: 500px; margin: 0 auto;">
              
              <!-- Main Content Card -->
              <div class="content-card" style="background: white; border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                
                <!-- Logo -->
                <div style="margin-bottom: 30px;">
                  <img class="header-logo" src="https://res.cloudinary.com/dj3xx136b/image/upload/v1767616557/tohynya5xavebftekbwr.png" alt="QR Studio Logo" style="width: 60px; height: 60px; border-radius: 12px;" onerror="this.style.display='none'">
                </div>

                <!-- Title -->
                <h1 style="margin: 0 0 30px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                  Your Signup verification<br>Code
                </h1>

                <!-- OTP Code -->
                <div style="margin: 30px 0;">
                  <span class="otp-code" style="font-size: 48px; font-weight: 700; color: #1a1a1a; letter-spacing: 6px; font-family: 'Courier New', monospace; display: block; margin: 20px 0;">${otp}</span>
                </div>

                <!-- Warning Message -->
                <p style="color: #888; font-size: 14px; margin: 30px 0 40px 0;">
                  Don't share this code to anyone!
                </p>

                <!-- Security Notice -->
                <div style="background: #fff8e1; border: 1px solid #ffcc02; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left;">
                  <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #ff9800; font-size: 16px;">⚠️</span>
                    <div>
                      <p style="margin: 0; color: #bf5f00; font-size: 13px; font-weight: 600;">Was this request not made by you?</p>
                      <p style="margin: 5px 0 0 0; color: #bf5f00; font-size: 12px;">
                        You're getting this message because this login was using Chrome<br>
                        browser on <strong>macOS</strong> on <strong>${new Date().toLocaleDateString()}</strong>. All, If you did not initiate<br>
                        this request, you can safely <a href="#" style="color: #1976d2; text-decoration: none;">ignore this email</a>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align: center; padding: 30px 20px 20px 20px;">
                <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
                  © 2026 QR Studio. All rights reserved.
                </p>
                <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 0;">
                  Email: winning11.in@gmail.com
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME || 'QR Studio',
      email: process.env.BREVO_FROM_EMAIL || 'noreply@qrcraftstudio.com'
    };
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.replyTo = {
      name: process.env.BREVO_FROM_NAME || 'QR Studio',
      email: process.env.BREVO_FROM_EMAIL || 'noreply@qrcraftstudio.com'
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending OTP email:', error);
    console.error('Error status:', error?.status);
    console.error('Error response:', error?.response?.text || error?.text);
    console.error('API Key configured:', !!process.env.BREVO_API_KEY);

    let errorMessage = 'Failed to send OTP email';
    if (error.status === 401) {
      errorMessage = 'Email service authentication failed. Please check API key configuration.';
    } else if (error.message) {
      if (error.message.includes('api-key')) {
        errorMessage = 'Email service not configured. Please check API key.';
      } else if (error.message.includes('sender')) {
        errorMessage = 'Sender email not verified. Please verify sender email in Brevo dashboard.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Send password reset email with link
 * @param {string} email - Recipient email
 * @param {string} resetUrl - Password reset URL
 * @param {string} userName - User's name
 * @returns {Promise<object>} Send result
 */
const sendPasswordResetEmail = async (email, resetUrl, userName = '') => {
  try {
    const apiInstance = getBrevoClient();
    console.log('Sending password reset email - API Key configured:', !!process.env.BREVO_API_KEY);
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "🔐 QR Studio - Password Reset Request";
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>QR Studio - Password Reset</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 10px !important; }
              .content-card { padding: 25px !important; margin: 10px 0 !important; }
              .reset-button { padding: 14px 25px !important; font-size: 16px !important; }
              .header-logo { width: 50px !important; height: 50px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f23; line-height: 1.6;">
          <div style="min-height: 100vh; background: #0f0f23; padding: 40px 20px;">
            <div class="container" style="max-width: 500px; margin: 0 auto;">
              
              <!-- Main Content Card -->
              <div class="content-card" style="background: white; border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                
                <!-- Logo -->
                <div style="margin-bottom: 30px;">
                  <img class="header-logo" src="https://res.cloudinary.com/dj3xx136b/image/upload/v1767616557/tohynya5xavebftekbwr.png" alt="QR Studio Logo" style="width: 60px; height: 60px; border-radius: 12px;" onerror="this.style.display='none'">
                </div>

                <!-- Title -->
                <h1 style="margin: 0 0 30px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                  Password Reset<br>Request
                </h1>

                ${userName ? `<div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 15px; margin-bottom: 25px; text-align: left;"><p style="margin: 0; color: #0c4a6e; font-size: 15px;">👋 <strong>Hello ${userName},</strong></p></div>` : ''}

                <p style="color: #666; font-size: 14px; margin: 0 0 30px 0; line-height: 1.5; text-align: left;">
                  We received a request to reset your password for your QR Studio account. Click the button below to create a new secure password:
                </p>

                <!-- Reset Button -->
                <div style="margin: 30px 0;">
                  <a href="${resetUrl}" class="reset-button" 
                     style="background: #1a1a1a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; text-align: center; min-width: 200px;">
                    🔐 Reset My Password
                  </a>
                </div>

                <!-- Alternative Link Section -->
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: left;">
                  <p style="margin: 0 0 10px 0; color: #4b5563; font-size: 14px; font-weight: 600;">🔗 Button not working?</p>
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">Copy and paste this link into your browser:</p>
                  <div style="background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; margin: 10px 0; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #1976d2; font-size: 13px; text-decoration: none; font-family: 'Courier New', monospace;">${resetUrl}</a>
                  </div>
                </div>

                <!-- Warning Message -->
                <p style="color: #888; font-size: 14px; margin: 30px 0;">
                  Please use this link within 30 minutes for security.
                </p>

                <!-- Security Notice -->
                <div style="background: #fff8e1; border: 1px solid #ffcc02; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left;">
                  <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #ff9800; font-size: 16px;">⚠️</span>
                    <div>
                      <p style="margin: 0; color: #bf5f00; font-size: 13px; font-weight: 600;">Was this request not made by you?</p>
                      <p style="margin: 5px 0 0 0; color: #bf5f00; font-size: 12px;">
                        You're getting this message because this reset was requested using Chrome<br>
                        browser on <strong>macOS</strong> on <strong>${new Date().toLocaleDateString()}</strong>. If you did not initiate<br>
                        this request, you can safely <a href="#" style="color: #1976d2; text-decoration: none;">ignore this email</a>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align: center; padding: 30px 20px 20px 20px;">
                <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
                  © 2026 QR Studio. All rights reserved.
                </p>
                <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 0;">
                  Email: winning11.in@gmail.com
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME || 'QR Studio',
      email: process.env.BREVO_FROM_EMAIL || 'noreply@qrcraftstudio.com'
    };
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.replyTo = {
      name: process.env.BREVO_FROM_NAME || 'QR Studio',
      email: process.env.BREVO_FROM_EMAIL || 'noreply@qrcraftstudio.com'
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Brevo password reset API success:', result);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending password reset email:', error);

    let errorMessage = 'Failed to send password reset email';
    if (error.message) {
      if (error.message.includes('api-key')) {
        errorMessage = 'Email service not configured. Please check API key.';
      } else if (error.message.includes('sender')) {
        errorMessage = 'Sender email not verified. Please verify sender email in Brevo dashboard.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Send OTP for email verification
 * @param {string} email - User's email
 * @param {string} purpose - Purpose of OTP (verification, reset, forgot)
 * @returns {Promise<object>} Result with success status and message
 */
const sendVerificationOTP = async (email, purpose = 'verification') => {
  try {
    const emailKey = email.toLowerCase();
    const existingData = otpStore.get(emailKey);

    // Check if user has exceeded the maximum number of OTP requests (3)
    if (existingData && existingData.requestCount >= 3) {
      // Check if it's been more than 24 hours since the last request
      const timeSinceLastRequest = Date.now() - existingData.lastRequestTime;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeSinceLastRequest < twentyFourHours) {
        return {
          success: false,
          message: 'Too many OTP requests. Please try again after 24 hours.'
        };
      } else {
        // Reset the counter after 24 hours
        otpStore.delete(emailKey);
      }
    }

    const otp = generateOTP();

    // Store OTP
    storeOTP(email, otp);

    // Send email
    const emailResult = await sendOTPEmail(email, otp, purpose);

    if (emailResult.success) {
      return {
        success: true,
        message: 'OTP sent successfully to your email'
      };
    } else {
      return {
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      };
    }

  } catch (error) {
    console.error('Error in sendVerificationOTP:', error);
    return {
      success: false,
      message: 'An error occurred while sending OTP. Please try again.'
    };
  }
};

/**
 * Clean up expired OTPs (should be called periodically)
 */
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiryTime) {
      otpStore.delete(email);
    }
  }
};

// Clean up expired OTPs every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

export {
  generateOTP,
  storeOTP,
  verifyOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendVerificationOTP,
  cleanupExpiredOTPs
};