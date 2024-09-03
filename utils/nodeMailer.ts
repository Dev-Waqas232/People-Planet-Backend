import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendResetEmail = async (to: string, resetToken: string) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL,
      to: to,
      subject: 'Password Reset Request',
      html: `
          <p>You have requested to reset your password. Click the link below to reset it:</p>
          <a href="http://localhost:5173/reset-password/${resetToken}">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
