import express from "express";
import { getAllProfiles, getProfileById, deleteProfile, updateProfile } from "../controllers/profileController.js";
import { verifyUser } from "../middleware/userMiddleware.js";

const router = express.Router();

// Unified Profile CRUD
router.get("/", verifyUser, getAllProfiles);       // List all
router.get("/:id", verifyUser, getProfileById);    // Get single
router.put("/:id", verifyUser, updateProfile);     // Update single
router.delete("/:id", verifyUser, deleteProfile);  // Soft delete

export default router;
