import express from "express";
import {
    createIndividualProfile,
    getAllProfiles,
    getProfileById,
} from "../controllers/individualProfileController.js";
import { verifyUser } from "../middleware/userMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Assuming these should be protected routes
router.post("/create", verifyUser, upload.any(), createIndividualProfile);
router.get("/", verifyUser, getAllProfiles);
router.get("/:id", verifyUser, getProfileById);

export default router;
