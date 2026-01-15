import express from "express";
import {
    createIndividualProfile,
    getAllProfiles,
    getProfileById,
} from "../controllers/individualProfileController.js";
import { verifyUser } from "../middleware/userMiddleware.js"; // Assessing verifyUser is appropriate middleware

const router = express.Router();

// Assuming these should be protected routes
router.post("/create", verifyUser, createIndividualProfile);
router.get("/", verifyUser, getAllProfiles);
router.get("/:id", verifyUser, getProfileById);

export default router;
