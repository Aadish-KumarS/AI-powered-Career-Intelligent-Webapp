import User from "../models/User.js";
import bcrypt from 'bcryptjs';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const allowedFields = [
      "name",
      "email",
      "profilePicture",
      "bio",
      "location",
      "latitude",
      "longitude",
      "interests",
      "education",
      "isFirstTime"
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) => 
        allowedFields.includes(key) && value !== undefined
      )
    );

    console.log(req.body.data);
    

    Object.assign(user, updates);
    const updatedUser = await user.save();

    return res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const validatePassword = async (req, res, next) => {
  try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
          return res.status(400).json({ message: 'All fields are required' });
      }

      if (newPassword !== confirmPassword) {
          return res.status(400).json({ message: 'Passwords do not match' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
          return res.status(401).json({ message: 'Incorrect current password' });
      }

      req.user = user;
      next(); 
  } catch (error) {
      console.error('Error in validatePassword middleware:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

export default validatePassword;
