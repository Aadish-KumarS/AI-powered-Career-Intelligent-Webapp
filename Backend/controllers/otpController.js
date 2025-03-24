import sendEmail from '../utils/sendEmail.js';
import OTP from '../models/Otp.js';  // Import OTP model
import User from '../models/User.js';  // Import User model

const OTP_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const otpController = {
  requestOTP: async (req, res) => {
    const email = req.cookies.email;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otp = generateOTP();
    const expiration = Date.now() + OTP_EXPIRATION_TIME;

    try {
      let existingOtp = await OTP.findOne({ email });
      if (existingOtp) {
        existingOtp.otp = otp;
        existingOtp.expiration = expiration;
        await existingOtp.save();
      } else {
        const newOtp = new OTP({ email, otp, expiration });
        await newOtp.save();
      }

      sendEmail(email, 'Your OTP for Verification', `Your OTP is: ${otp}. It will expire in 10 minutes.`)
        .then(() => {
          res.clearCookie('email');
          res.json({ success: true, message: 'OTP sent to your email.' });
        })
        .catch((err) => {
          res.status(500).json({ success: false, message: 'Error sending email. Try again later.' });
        });
    } catch (err) {
      console.error('Error sending OTP:', err);
      res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
  },

  verifyOTP: async (req, res) => {
    const { otp } = req.body;
    const email = req.cookies.email;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    try {
      const otpData = await OTP.findOne({ email });
      
      if (!otpData) {
        return res.status(400).json({ success: false, message: 'OTP not requested for this email' });
      }

      if (Date.now() > otpData.expiration) {
        await OTP.deleteOne({ email }); 
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      }

      if (otpData.otp == otp) {
        const user = await User.findOne({ email });

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        if(user.isVerified != true){
          user.isVerified = true;
          await user.save();
          await OTP.deleteOne({ email });

          res.clearCookie('email');
          res.json({ success: true, message: 'OTP verified successfully! Your email is now verified.' });
        }else{
          await OTP.deleteOne({ email });
          res.json({ success: true, message: 'OTP verified successfully! Reset your password.' });
        }
        
      } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
  },
};

export default otpController;
