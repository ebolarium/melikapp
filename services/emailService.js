const nodemailer = require('nodemailer');

// Initialize email transporter
let transporter = null;
let initialized = false;

/**
 * Initialize SMTP transporter with Brevo credentials
 */
const initTransporter = async () => {
  if (initialized) return;
  
  try {
    // Check if email credentials are provided
    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
      console.log('📧 Email credentials not configured - email functionality disabled');
      console.log('To enable email reports, add BREVO_SMTP_USER and BREVO_SMTP_PASS to your .env file');
      initialized = false;
      return;
    }

    transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    initialized = true;
    console.log('📧 Email service initialized successfully');
  } catch (error) {
    console.error('Error initializing SMTP transporter:', error);
    initialized = false;
    transporter = null;
  }
};

/**
 * Send email
 */
const sendEmail = async (options) => {
  try {
    if (!initialized) {
      await initTransporter();
    }
    
    if (!initialized || !transporter) {
      console.log('📧 Email service not configured - skipping email send');
      console.log(`Would have sent email to: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content: ${options.text ? options.text.substring(0, 100) + '...' : 'N/A'}`);
      return { messageId: 'test-mode' };
    }

    const mailOptions = {
      from: `"Odak Bot" <${process.env.MAIL_FROM || 'noreply@odakkimya.com.tr'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || undefined
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${options.to}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  initTransporter,
  sendEmail
}; 