import User from "../models/User.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";
import OTP from "../models/Otp.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";


//FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) return res.status(400).json({ message: 'Email is required' });
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified == false) return res.status(404).json({ message: 'User not verified' });

    const otp = crypto.randomInt(100000, 1000000);
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
    
    const existingOtp = await OTP.findOne({email})
    if(existingOtp){
      existingOtp.otp = otp;
      existingOtp.expiration = otpExpiration;
      await existingOtp.save();
    }else{
      const otpEntry = new OTP({ email, otp, expiration: otpExpiration });
      await otpEntry.save();
    }
    
    await sendEmail(user.email, 'Password Reset Code', `Your reset code is: ${otp}`);

    res.cookie('email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
      path: '/'
    });

    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error, try again later' });
  }
};

//RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const resetToken = req.cookies.passwordResetToken;

  if (!password || password.length < 8 || !resetToken) {
    return res.status(400).json({ message: 'A verified reset token and an 8-character password are required' });
  }

  try {
    const { email, purpose } = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (purpose !== 'password-reset') return res.status(403).json({ message: 'Invalid reset token' });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.clearCookie('passwordResetToken', { path: '/api/auth/reset-password' });
    res.clearCookie('email');
    return res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error(error); 
    return res.status(500).json({ message: 'Server error, try again later' });
  }
};
