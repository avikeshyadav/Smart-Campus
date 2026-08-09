const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(toEmail, token) {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: 'Verify your account',
    html: `<p>Apna account verify karne ke liye click karein:</p>
           <a href="${link}">${link}</a>
           <p>Yeh link 1 ghante me expire ho jayega.</p>`,
  });
}

async function sendPasswordResetEmail(toEmail, token) {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: 'Reset your password',
    html: `<p>Password reset karne ke liye click karein:</p>
           <a href="${link}">${link}</a>
           <p>Yeh link 15 minute me expire ho jayega. Agar aapne request nahi ki to ignore karein.</p>`,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
