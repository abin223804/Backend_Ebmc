import express from "express";
import {
    createCorporateProfile,
    getAllCorporateProfiles,
    getCorporateProfileById,
    updateCorporateProfile,
    deleteCorporateProfile,
    downloadCorporateProfile,
} from "../controllers/corporateProfileController.js";
import { verifyUser } from "../middleware/userMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/create", verifyUser, upload.any(), createCorporateProfile);
router.get("/", verifyUser, getAllCorporateProfiles);
router.get("/:id", verifyUser, getCorporateProfileById);
router.put("/:id", verifyUser, upload.any(), updateCorporateProfile);
router.delete("/:id", verifyUser, deleteCorporateProfile);
router.get("/download/:id", verifyUser, downloadCorporateProfile);

export default router;
