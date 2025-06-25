const nodemailer = require('nodemailer');
const fs = require('fs');

// Initialize email transporter
let transporter = null;
let initialized = false;

/**
 * Initialize SMTP transporter with Brevo credentials
 */
const initTransporter = async () => {
  // Only initialize once
  if (initialized) return;
  
  try {
    console.log('Setting up SMTP transporter...');
    
    // Create transporter with SMTP credentials
    transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: '89e1fd001@smtp-brevo.com',
        pass: 'T6G2tOzdHbCmfS5V'
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      },
      debug: true,
      logger: true,
      headers: {
        'X-Sendinblue-Track': '0', // Disable tracking
        'X-Sendinblue-Track-Click': '0', // Disable click tracking
        'X-Sendinblue-Track-Open': '0' // Disable open tracking
      }
    });
    
    // Verify connection configuration
    console.log('Verifying SMTP connection...');
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully!');
    } catch (verifyError) {
      console.error('SMTP connection verification failed:', verifyError);
      throw verifyError;
    }
    
    console.log('SMTP transporter initialized successfully');
    initialized = true;
  } catch (error) {
    console.error('Error initializing SMTP transporter:', error);
    initialized = false;
    transporter = null;
  }
};

/**
 * Send an email with optional attachment
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body (optional)
 * @param {Array} options.attachments - Array of attachment objects (optional)
 * @returns {Promise} - Promise that resolves with message info
 */
const sendEmail = async (options) => {
  try {
    // Initialize if not already initialized
    if (!initialized) {
      console.log('Email service not initialized, attempting to initialize now...');
      await initTransporter();
    }
    
    if (!initialized || !transporter) {
      console.error('Email service initialization failed. Cannot send email.');
      throw new Error('Email service not initialized. Cannot send email.');
    }
    
    // Log email attempt
    console.log(`Attempting to send email to: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Has attachments: ${options.attachments && options.attachments.length > 0 ? 'Yes' : 'No'}`);
    
    // Set default sender
    const from = {
      name: 'Odak Kimya Destek',
      address: 'baris@odakkimya.com.tr'
    };
    
    console.log(`Sending from: ${from.address} (${from.name})`);
    
    // Format attachments for nodemailer if needed
    const attachments = [];
    if (options.attachments && options.attachments.length > 0) {
      for (const attachment of options.attachments) {
        if (attachment.path) {
          // If it has a path, add it directly
          console.log(`Including attachment from path: ${attachment.path}`);
          attachments.push({
            filename: attachment.filename,
            path: attachment.path
          });
        } else if (attachment.content) {
          // If it has content as Buffer
          console.log(`Including attachment from buffer, filename: ${attachment.filename}`);
          attachments.push({
            filename: attachment.filename,
            content: attachment.content
          });
        }
      }
    }
    
    // Prepare email options
    const mailOptions = {
      from: `"${from.name}" <${from.address}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || undefined
    };
    
    // Add attachments if any
    if (attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    // Send email with nodemailer
    console.log('Sending email via SMTP...', mailOptions);
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully to ${options.to}`, info);
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