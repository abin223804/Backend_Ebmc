import express from "express";
import { createQuickProfile } from "../controllers/quickProfileController.js";
import { verifyUser } from "../middleware/userMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Route for creating a quick profile (Individual or Corporate)
router.post("/create", verifyUser, upload.any(), createQuickProfile);

export default router;
