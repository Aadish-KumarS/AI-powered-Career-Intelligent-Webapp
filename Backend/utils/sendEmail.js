import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (to, subject, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .email-header {
              text-align: center;
              background-color: #ff7e5f;
              color: white;
              padding: 10px;
              border-radius: 6px;
            }
            .email-body {
              padding: 20px;
              color: #333;
              line-height: 1.5;
            }
            .otp {
              font-size: 24px;
              font-weight: bold;
              color: #ff7e5f;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>Welcome to AI-Powered Career Guidance</h2>
            </div>
            <div class="email-body">
              <h3>Your OTP for Email Verification</h3>
              <p>Thank you for using our service! We're excited to help you with your career journey. Below is your OTP:</p>
              <p class="otp">${otp}</p>
              <p>This OTP will expire in 10 minutes. Please enter it to verify your email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      otp,
      html: htmlContent,
    });

    console.log(`📧 OTP sent to ${to}`);
  } catch (error) {
    console.error('❌ Email Sending Failed:', error);
  }
};

export default sendEmail
