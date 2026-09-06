
const nodemailer = require("nodemailer");
require("dotenv").config();

/*
|--------------------------------------------------------------------------
| SMTP Transporter Configuration
|--------------------------------------------------------------------------
*/

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),

  // Port 587 uses STARTTLS
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


/*
|--------------------------------------------------------------------------
| Verify SMTP Connection
|--------------------------------------------------------------------------
*/

transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error.message);
  } else {
    console.log("✅ SMTP server is ready");
  }
});


/*
|--------------------------------------------------------------------------
| Common Email Styles
|--------------------------------------------------------------------------
*/

const emailStyles = {
  container: `
    max-width: 600px;
    margin: 0 auto;
    padding: 30px;
    font-family: Arial, Helvetica, sans-serif;
    background-color: #ffffff;
    color: #333333;
  `,

  header: `
    background: #2563eb;
    color: #ffffff;
    padding: 20px;
    text-align: center;
    border-radius: 10px 10px 0 0;
  `,

  body: `
    padding: 30px;
    border: 1px solid #e5e7eb;
    border-top: none;
    border-radius: 0 0 10px 10px;
  `,

  button: `
    display: inline-block;
    padding: 13px 24px;
    background-color: #2563eb;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 7px;
    font-weight: bold;
  `,

  footer: `
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 13px;
    text-align: center;
  `,
};


/*
|--------------------------------------------------------------------------
| Send Verification Email
|--------------------------------------------------------------------------
*/

async function sendVerificationEmail(toEmail, token) {
  const link =
    `${process.env.CLIENT_URL}/api/verify-email?token=${encodeURIComponent(token)}`;

  try {
    const info = await transporter.sendMail({
      // Must be a verified sender in your SMTP provider
      from: `"SmartCampus" <${process.env.SMTP_FROM}>`, 

      to: toEmail,

      subject: "Verify Your SmartCampus Account",

      // Plain-text fallback
      text: `
Hello,

Thank you for creating an account with SmartCampus.

Please verify your email address by opening the link below:

${link}

This verification link will expire in 1 hour.

If you did not create a SmartCampus account, please ignore this email.

Regards,
SmartCampus Team
      `,

      // HTML email
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your SmartCampus Account</title>
</head>

<body style="margin:0; padding:20px; background:#f3f4f6;">

  <div style="${emailStyles.container}">

    <!-- Header -->
    <div style="${emailStyles.header}">
      <h1 style="margin:0; font-size:28px;">
        SmartCampus
      </h1>

      <p style="margin:8px 0 0;">
        Smart Campus Management System
      </p>
    </div>

    <!-- Body -->
    <div style="${emailStyles.body}">

      <h2 style="margin-top:0;">
        Verify Your Email Address
      </h2>

      <p>
        Hello,
      </p>

      <p>
        Thank you for creating your account with
        <strong>SmartCampus</strong>.
      </p>

      <p>
        To complete your registration and activate your account,
        please verify your email address by clicking the button below.
      </p>

      <div style="text-align:center; margin:30px 0;">
        <a
          href="${link}"
          style="${emailStyles.button}"
        >
          Verify My Account
        </a>
      </div>

      <p>
        If the button above does not work, copy and paste the following
        link into your browser:
      </p>

      <p style="word-break:break-all; color:#2563eb;">
        ${link}
      </p>

      <p>
        <strong>Important:</strong>
        This verification link will expire in
        <strong>1 hour</strong>.
      </p>

      <p>
        If you did not create a SmartCampus account,
        you can safely ignore this email.
      </p>

      <!-- Footer -->
      <div style="${emailStyles.footer}">
        <p style="margin:0;">
          © ${new Date().getFullYear()} SmartCampus
        </p>

        <p style="margin:5px 0 0;">
          This is an automated email. Please do not reply.
        </p>
      </div>

    </div>

  </div>

</body>
</html>
      `,
    });

    console.log(
      "✅ Verification email sent successfully:",
      info.messageId
    );

    return info;

  } catch (error) {

    console.error(
      "❌ Verification email failed:",
      error.message
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Send Password Reset Email
|--------------------------------------------------------------------------
*/

async function sendPasswordResetEmail(toEmail, token) {
  const link =
    `${process.env.CLIENT_URL}/api/reset-password?token=${encodeURIComponent(token)}`;

  try {
    const info = await transporter.sendMail({
      // Must be a verified sender in your SMTP provider
      from: `"SmartCampus" <${process.env.SMTP_FROM}>`,

      to: toEmail,

      subject: "Reset Your SmartCampus Password",

      // Plain-text fallback
      text: `
Hello,

We received a request to reset the password for your SmartCampus account.

You can reset your password using the link below:

${link}

This password reset link will expire in 15 minutes.

If you did not request a password reset, please ignore this email.

Regards,
SmartCampus Team
      `,

      // HTML email
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your SmartCampus Password</title>
</head>

<body style="margin:0; padding:20px; background:#f3f4f6;">

  <div style="${emailStyles.container}">

    <!-- Header -->
    <div style="${emailStyles.header}">
      <h1 style="margin:0; font-size:28px;">
        SmartCampus
      </h1>

      <p style="margin:8px 0 0;">
        Smart Campus Management System
      </p>
    </div>

    <!-- Body -->
    <div style="${emailStyles.body}">

      <h2 style="margin-top:0;">
        Reset Your Password
      </h2>

      <p>
        Hello,
      </p>

      <p>
        We received a request to reset the password for your
        <strong>SmartCampus</strong> account.
      </p>

      <p>
        If you made this request, click the button below to create
        a new password.
      </p>

      <div style="text-align:center; margin:30px 0;">
        <a
          href="${link}"
          style="${emailStyles.button}"
        >
          Reset My Password
        </a>
      </div>

      <p>
        If the button above does not work, copy and paste the following
        link into your browser:
      </p>

      <p style="word-break:break-all; color:#2563eb;">
        ${link}
      </p>

      <p>
        <strong>Important:</strong>
        This password reset link will expire in
        <strong>15 minutes</strong>.
      </p>

      <p>
        If you did not request a password reset,
        no action is required. Your password will remain unchanged.
      </p>

      <!-- Security Notice -->
      <div style="
        margin-top:25px;
        padding:15px;
        background:#fef3c7;
        border-radius:7px;
        color:#92400e;
      ">
        <strong>Security Notice:</strong>
        Never share your password or password reset link with anyone.
      </div>

      <!-- Footer -->
      <div style="${emailStyles.footer}">
        <p style="margin:0;">
          © ${new Date().getFullYear()} SmartCampus
        </p>

        <p style="margin:5px 0 0;">
          This is an automated email. Please do not reply.
        </p>
      </div>

    </div>

  </div>

</body>
</html>
      `,
    });

    console.log(
      "✅ Password reset email sent successfully:",
      info.messageId
    );

    return info;

  } catch (error) {

    console.error(
      "❌ Password reset email failed:",
      error.message
    );

    throw error;
  }
}

// Email pdf sending
async function sendPdfEmail(toEmail, pdfPath, studentName = "Student") {
  try {
    const info = await transporter.sendMail({
      from: `"SmartCampus" <${process.env.SMTP_FROM}>`,
      to: toEmail,
      subject: "Cyber Security PDF Document ",

      text: `
Hello ${studentName},

Please find your SmartCampus PDF document attached with this email.

Regards,
SmartCampus Team
      `,

      html: `
        <div style="font-family: Arial; max-width: 600px; margin: auto;">
          <h2 style="background:#2563eb; color:white; padding:20px;">
            SmartCampus
          </h2>
          <div style="padding:25px; border:1px solid #ddd;">
            <h3>Your PDF Document</h3>

            <p>Hello <strong>${studentName}</strong>,</p>

            <p>
              Your SmartCampus document has been generated successfully.
            </p>

            <p>
              Please find the PDF attached to this email.
            </p>

            <p>
              Regards,<br>
              <strong>SmartCampus Team</strong>
            </p>
          </div>
        </div>
      `,

      // 🔥 PDF directly attached to email
      attachments: [
        {
          filename: `${studentName}.pdf`,
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("✅ PDF sent:", info.messageId);

    return info;

  } catch (error) {
    console.error("❌ PDF email failed:", error.message);
    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Export Email Functions
|--------------------------------------------------------------------------
*/

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPdfEmail
};
