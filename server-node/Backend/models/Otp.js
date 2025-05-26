import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: Number, required: true },
  expiration: { type: Date, required: true },
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
