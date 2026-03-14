const nodemailer = require("nodemailer");

// ─────────────────────────────────────────────
// Core transporter (Gmail)
// ─────────────────────────────────────────────
const sendEmail = async ({ email, subject, message, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "fixer.car.service.center@gmail.com",
      pass: "ydky egoa tltu wpmv",
    },
  });

  const mailOptions = {
    from: '"Car Service Center" <fixer.car.service.center@gmail.com>',
    to: email,
    subject,
    text: message,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────────
// 1. Registration credentials
//    Called from: signup
//    Sends: carCode + plain-text password
// ─────────────────────────────────────────────
exports.sendCarCredentials = async ({
  email,
  ownerName,
  generatedCode,
  generatedPassword,
}) => {
  await sendEmail({
    email,
    subject: "Your Registration Credentials",
    message: `Dear ${ownerName},\n\nYour car has been successfully registered.\n\nCredentials:\nCar Code: ${generatedCode}\nPassword: ${generatedPassword}\n\nPlease change your password after first login.\n\nBest regards,\nThe Car Service Center Team`,
  });
};

// ─────────────────────────────────────────────
// 2. Temporary password (forgot password)
//    Called from: forgotPassword
//    Sends: new temp password
// ─────────────────────────────────────────────
exports.sendTemporaryPassword = async ({
  email,
  ownerName,
  carCode,
  tempPassword,
}) => {
  await sendEmail({
    email,
    subject: "Your Temporary Password",
    message: `Dear ${ownerName},\n\nHere is your temporary password:\nCar Code: ${carCode}\nTemporary Password: ${tempPassword}\n\nPlease change your password after login.\n\nBest regards,\nThe Car Service Center Team`,
  });
};

// ─────────────────────────────────────────────
// 3. Login verification link
//    Called from: loginByMail (unverified users)
//    Sends: clickable login link
// ─────────────────────────────────────────────
exports.sendLoginVerificationLink = async ({ email, userName, link }) => {
  await sendEmail({
    email,
    subject: "Login Verification",
    message: `Hello ${userName},\n\nClick the following link to login:\n${link}\n\nThis link expires in 1 hour.\n\nBest regards,\nThe Car Service Center Team`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Verification</title>
      <style>
        body, h1, p { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background-color: #fff68b1e; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #f68b1e; margin-bottom: 20px; text-align: center; }
        p { margin-bottom: 20px; }
        .login-button { display: block; width: 200px; margin: 0 auto; padding: 10px; background-color: #f68b1e; color: white; text-align: center; border: none; border-radius: 5px; text-decoration: none; font-size: 16px; }
        .footer { background-color: #f0f2f5; text-align: center; padding: 10px; border-top: 1px solid #ddd; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="https://raw.githubusercontent.com/joeshwoa/fixer_system/main/assets/images/51.png" alt="Logo" style="display:block;margin:0 auto;max-width:200px;margin-bottom:20px;">
        <h1>Car Fixing Center</h1>
        <p>Hello ${userName}, click the button below to login. This link expires in 1 hour.</p>
        <a href="${link}" class="login-button">Login</a>
      </div>
      <div class="footer">&copy; 2024 Car Fixing Center. All rights reserved.</div>
    </body>
    </html>`,
  });
};

// ─────────────────────────────────────────────
// 4. OTP for admin password reset
//    Called from: forgotPasswordForAdmin
//    Sends: 6-digit OTP
// ─────────────────────────────────────────────
exports.sendOtp = async ({ email, userName, otp }) => {
  await sendEmail({
    email,
    subject: "Reset Password OTP",
    message: `Dear ${userName},\n\nYour OTP for resetting the password is: ${otp}\n\nBest regards,\nThe Car Service Center Team`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password OTP</title>
      <style>
        body, h1, p { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background-color: #f0f2f5; color: #1c1e21; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        h1 { color: #f68b1e; margin-bottom: 20px; text-align: center; }
        p { margin-bottom: 20px; line-height: 1.6; }
        .otp-code { background-color: #f68b1e; padding: 10px 20px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; color: white; letter-spacing: 6px; }
        .footer { background-color: #f0f2f5; text-align: center; padding: 10px; border-top: 1px solid #ddd; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="https://raw.githubusercontent.com/joeshwoa/fixer_system/main/assets/images/51.png" alt="Logo" style="display:block;margin:0 auto;max-width:200px;margin-bottom:20px;">
        <h1>Reset Password OTP</h1>
        <p>Dear ${userName},</p>
        <p>Here is your OTP for resetting the password:</p>
        <div class="otp-code">${otp}</div>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>The Car Service Center Team</p>
      </div>
      <div class="footer">&copy; 2024 Car Service Center. All rights reserved.</div>
    </body>
    </html>`,
  });
};

// ─────────────────────────────────────────────
// 5. Repair completion notification
//    Called from: repair service (when car is done)
//    Sends: repair done notification
// ─────────────────────────────────────────────
exports.sendRepairCompletionEmail = async ({ email, ownerName }) => {
  await sendEmail({
    email,
    subject: "Your Car Repair is Complete",
    message: `Dear ${ownerName},\n\nWe're pleased to inform you that the repair for your car has been completed.\n\nThank you for choosing our service.\n\nBest regards,\nThe Car Service Center Team`,
  });
};
