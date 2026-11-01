import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  otp: { type: Number, required: true },
  expiration: { type: Date, required: true, index: { expires: 0 } },
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
