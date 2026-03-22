const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "fixer.car.service.center@gmail.com",
      pass: process.env.Send_Email_pass,
    },
  });
  await transporter.sendMail({
    from: '"Car Service Center" <fixer.car.service.center@gmail.com>',
    to: email,
    subject,
    text: message,
    html,
  });
};

// ── Shared layout ──────────────────────────────────────────
const emailLayout = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body, h1, p { margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background-color: #f0f2f5; color: #1c1e21; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .header { padding: 20px; text-align: center; background: #fff; }
    .header img { max-width: 160px; }
    .body { padding: 24px 28px; }
    h1 { color: #f68b1e; margin-bottom: 16px; text-align: center; font-size: 22px; }
    p { margin-bottom: 14px; line-height: 1.6; }
    .box { background-color: #f68b1e; padding: 12px 20px; border-radius: 6px; text-align: center;
           font-size: 20px; font-weight: bold; color: #fff; letter-spacing: 4px; margin-bottom: 14px; }
    .btn { display: block; width: fit-content; margin: 0 auto 14px; padding: 12px 32px;
           background-color: #f68b1e; color: #fff; text-align: center; border-radius: 6px;
           text-decoration: none; font-size: 16px; font-weight: bold; }
    .footer { background-color: #f0f2f5; text-align: center; padding: 12px;
              border-top: 1px solid #ddd; font-size: 13px; color: #666; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="https://raw.githubusercontent.com/joeshwoa/fixer_system/main/assets/images/51.png" alt="Fixer Logo">
    </div>
    <div class="body">
      ${bodyContent}
    </div>
    <div class="footer">&copy; 2026 Car Service Center. All rights reserved.</div>
  </div>
</body>
</html>`;

// ── 1. Registration credentials ────────────────────────────
exports.sendCarCredentials = async ({
  email,
  ownerName,
  generatedCode,
  generatedPassword,
}) => {
  await sendEmail({
    email,
    subject: "Your Registration Credentials",
    html: emailLayout(`
      <h1>Welcome to Fixer!</h1>
      <p>Dear ${ownerName},</p>
      <p>Here are your credentials:</p>
      <div style="display:flex; gap:10px; margin-bottom:14px;">
      <div class="box" style="flex:1; margin:0;">Car Code: ${generatedCode} <br/> Password: ${generatedPassword}</div>
      </div>
      <p style="margin-top:14px;">If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>The Car Service Center Team</p>
    `),
  });
};

// ── 2. Forgot password ─────────────────────────────────────
exports.sendTemporaryPassword = async ({
  email,
  ownerName,
  carCode,
  password,
}) => {
  await sendEmail({
    email,
    subject: "Remember your Password",
    html: emailLayout(`
      <h1>Forgot the Password?</h1>
      <p>Dear ${ownerName},</p>
      <p>Here are your credentials:</p>
      <div style="display:flex; gap:10px; margin-bottom:14px;">
      <div class="box" style="flex:1; margin:0;">Car Code: ${carCode} <br/> Password: ${password}</div>
      </div>
      <p style="margin-top:14px;">If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>The Car Service Center Team</p>
    `),
  });
};

// ── 3. Login verification link ─────────────────────────────
exports.sendLoginVerificationLink = async ({ email, userName, link }) => {
  await sendEmail({
    email,
    subject: "Login Verification",
    html: emailLayout(`
      <h1>Login Verification</h1>
      <p>Hello ${userName},</p>
      <p>Click the button below to verify your login. This link expires in <strong>1 hour</strong>.</p>
      <a href="${link}" class="btn">Verify & Login</a>
      <p style="margin-top:14px;">If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>The Car Service Center Team</p>
    `),
  });
};

// ── 4. OTP ─────────────────────────────────────────────────
exports.sendOtp = async ({ email, userName, otp }) => {
  await sendEmail({
    email,
    subject: "Reset Password OTP",
    html: emailLayout(`
      <h1>Reset Password OTP</h1>
      <p>Dear ${userName},</p>
      <p>Here is your OTP for resetting the password:</p>
      <div class="box">${otp}</div>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>The Car Service Center Team</p>
    `),
  });
};

// ── 5. Repair completion ───────────────────────────────────
exports.sendRepairCompletionEmail = async ({ email, ownerName }) => {
  await sendEmail({
    email,
    subject: "Your Car Repair is Complete",
    html: emailLayout(`
      <h1>Repair Complete!</h1>
      <p>Dear ${ownerName},</p>
      <p>We're pleased to inform you that the repair for your car has been completed successfully.</p>
      <p>Thank you for choosing our service.</p>
      <p>Best regards,<br>The Car Service Center Team</p>
    `),
  });
};
