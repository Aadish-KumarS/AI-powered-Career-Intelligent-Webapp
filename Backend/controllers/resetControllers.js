import User from "../models/User.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";
import OTP from "../models/Otp.js";


//FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified == false) return res.status(404).json({ message: 'User not verified' });

    const otp = Math.floor(100000 + Math.random() * 900000);
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

    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error, try again later' });
  }
};

//RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error, try again later' });
  }
};