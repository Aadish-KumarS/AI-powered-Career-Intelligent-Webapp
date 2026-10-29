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

export const updateOnboarding = async (req, res) => {
  const userId = req.user.id;
  const allowedFields = ['name', 'personalInfo', 'education', 'skills', 'careerInfo', 'experience', 'insights', 'preferences', 'interests', 'onboardingProgress', 'isFirstTime'];
  const onboardingData = Object.fromEntries(
    Object.entries(req.body).filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
  );

  try {
    // Enforce the same minimum profile that the AI services need. Optional
    // fields stay optional and the persisted document structure is unchanged.
    if (onboardingData.isFirstTime === false || onboardingData.onboardingProgress === 100) {
      const errors = {};
      if (!onboardingData.name?.trim()) errors.name = 'Full name is required.';
      if (!onboardingData.education?.highestLevel) errors['education.highestLevel'] = 'Education level is required.';
      if (!onboardingData.education?.fieldOfStudy?.trim()) errors['education.fieldOfStudy'] = 'Field of study is required.';
      if (!Array.isArray(onboardingData.skills?.selectedSkills) || onboardingData.skills.selectedSkills.length === 0) {
        errors.skills = 'Add at least one technical or soft skill.';
      }
      if (!onboardingData.careerInfo?.careerStage) errors['careerInfo.careerStage'] = 'Career stage is required.';
      if (!Array.isArray(onboardingData.careerInfo?.desiredRoles) || onboardingData.careerInfo.desiredRoles.length === 0) {
        errors['careerInfo.desiredRoles'] = 'Select at least one desired role.';
      }
      if (Object.keys(errors).length) {
        return res.status(422).json({ message: 'Complete the required onboarding fields.', errors });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: onboardingData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating onboarding:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
