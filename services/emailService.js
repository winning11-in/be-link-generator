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
          <title>QR Studio OTP ${titles[purpose] || titles.verification}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">QR Studio</h1>
              <p style="color: #6b7280; margin: 5px 0;">${titles[purpose] || titles.verification}</p>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px; text-align: center;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Your Verification Code</h2>

              <p style="color: #6b7280; margin: 20px 0;">
                ${messages[purpose] || messages.verification}
              </p>

              <div style="background-color: #ffffff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${otp}</span>
              </div>

              <p style="color: #6b7280; margin: 20px 0;">
                This code will expire in <strong>10 minutes</strong> for security reasons.
              </p>

              <p style="color: #6b7280; margin: 20px 0;">
                If you didn't request this code, please ignore this email.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                This is an automated message from QR Studio. Please do not reply to this email.
              </p>
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

    sendSmtpEmail.subject = "QR Studio - Password Reset Request";
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>QR Studio Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">QR  Studio</h1>
              <p style="color: #6b7280; margin: 5px 0;">Password Reset Request</p>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Reset Your Password</h2>

              ${userName ? `<p style="color: #374151; margin-bottom: 20px;">Hello ${userName},</p>` : ''}

              <p style="color: #374151; margin-bottom: 20px;">
                We received a request to reset your password for your QR Studio account. 
                Click the button below to reset your password:
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>

              <p style="color: #6b7280; margin: 20px 0; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #2563eb; word-break: break-all; font-size: 14px;">
                ${resetUrl}
              </p>

              <p style="color: #6b7280; margin: 20px 0;">
                This link will expire in <strong>30 minutes</strong> for security reasons.
              </p>

              <p style="color: #6b7280; margin: 20px 0;">
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                This is an automated message from QR Studio. Please do not reply to this email.
              </p>
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