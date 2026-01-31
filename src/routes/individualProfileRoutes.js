import express from "express";
import {
    createIndividualProfile,
    processExternalVerification,
    getAllProfiles,
    getProfileById,
    updateIndividualProfile,
    deleteIndividualProfile,
    downloadIndividualProfile,
} from "../controllers/individualProfileController.js";
import { verifyUser } from "../middleware/userMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Assuming these should be protected routes
router.post("/create", verifyUser, upload.any(), createIndividualProfile, processExternalVerification);
router.get("/", verifyUser, getAllProfiles);
router.get("/:id", verifyUser, getProfileById);
router.put("/:id", verifyUser, upload.any(), updateIndividualProfile);
router.delete("/:id", verifyUser, deleteIndividualProfile);
router.get("/download/:id", verifyUser, downloadIndividualProfile);

export default router;
