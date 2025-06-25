import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"MAESTROMINDS VERIFICATION MAIL" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log('📨 Email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// 👇 Use **default export** for ES module
export default sendEmail;
