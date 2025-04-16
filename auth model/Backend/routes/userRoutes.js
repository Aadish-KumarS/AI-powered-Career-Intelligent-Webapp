import express from "express";
import validatePassword, { getUserProfile, updateUserProfile, deleteUserAccount, updateOnboarding } from "../controllers/userControllers.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.get("/profile", authenticateUser, getUserProfile);
router.put("/create-profile", authenticateUser, updateUserProfile);
router.put("/update-profile", authenticateUser, updateUserProfile);
router.delete("/delete-account", authenticateUser, deleteUserAccount);
router.put('/change-password', authenticateUser, validatePassword, async (req, res) => {
  try {
      const { newPassword } = req.body;
      const salt = await bcrypt.genSalt(10);
      req.user.password = await bcrypt.hash(newPassword, salt);

      await req.user.save();
      res.json({ message: 'Password updated successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});
router.put('/:id/onboarding', updateOnboarding);

export default router;
