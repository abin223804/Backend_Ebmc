import express from "express";
import {
    createCorporateProfile,
    getAllCorporateProfiles,
    getCorporateProfileById,
} from "../controllers/corporateProfileController.js";
import { verifyUser } from "../middleware/userMiddleware.js";

const router = express.Router();

router.post("/create", verifyUser, createCorporateProfile);
router.get("/", verifyUser, getAllCorporateProfiles);
router.get("/:id", verifyUser, getCorporateProfileById);

export default router;
