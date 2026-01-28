import express from "express";
import { getMySearchHistory, clearMySearchHistory } from "../controllers/searchHistoryController.js";
import { verifyUser } from "../middleware/userMiddleware.js";

const router = express.Router();

router.get("/", verifyUser, getMySearchHistory);
router.delete("/", verifyUser, clearMySearchHistory);

export default router;
