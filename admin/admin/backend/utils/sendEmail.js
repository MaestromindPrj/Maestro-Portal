// sendemail.js
import nodemailer from 'nodemailer';

export const sendOTPEmail = async (toEmail, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // ✅ Make sure this is set correctly in .env
      pass: process.env.EMAIL_PASS, // ✅ App password if 2FA is enabled
    },
  });

  const mailOptions = {
    from: `"Maestrominds" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Your OTP Code for Maestrominds Login',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 10px;">
        <h2>Login OTP</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent to', toEmail);
  } catch (err) {
    console.error('❌ Error sending email:', err);
    throw err;
  }
};
