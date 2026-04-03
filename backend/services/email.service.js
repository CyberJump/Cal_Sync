const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

async function initTransporter() {
  // If no SMTP settings are provided, use Ethereal for testing
  if (!process.env.SMTP_HOST) {
    console.log('No SMTP_HOST found in .env. Creating test Ethereal account...');
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });
    console.log('✅ Temporary Ethereal Mail transporter initialized.');
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('✅ Main SMTP transporter initialized.');
  }
}

// Ensure init is called on the first import, but we can also await it if needed
initTransporter().catch(console.error);

/**
 * Sends an email
 * @param {Array|String} to - Array of recipients or comma-separated string
 * @param {String} subject - Email subject
 * @param {String} html - Email body in HTML
 */
async function sendEventReminder(to, subject, html) {
  if (!transporter) {
    await initTransporter();
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"CalSync System" <no-reply@calsync.com>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      html: html,
    });

    console.log('Message sent: %s', info.messageId);
    
    // Preview URL will only be available when using Ethereal
    if (!process.env.SMTP_HOST) {
      console.log('📧 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

module.exports = {
  sendEventReminder
};
