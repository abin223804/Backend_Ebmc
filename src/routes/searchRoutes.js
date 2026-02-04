import express from "express";
import { unifiedSearch } from "../controllers/searchController.js";
import { verifyUser } from "../middleware/userMiddleware.js";

const router = express.Router();

// Search across both Individual and Corporate profiles
router.post("/unified", verifyUser, unifiedSearch);

export default router;
