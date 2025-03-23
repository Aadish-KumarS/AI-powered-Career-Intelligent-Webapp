import express from "express";
import { getUserProfile, updateUserProfile, deleteUserAccount } from "../controllers/userControllers.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", authenticateUser, getUserProfile);
router.put("/create-profile", authenticateUser, updateUserProfile);
router.delete("/profile", authenticateUser, deleteUserAccount);

export default router;
