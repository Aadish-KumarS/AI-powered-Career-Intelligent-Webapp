import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
