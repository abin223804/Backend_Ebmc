import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { verifyUser } from "../middleware/userMiddleware.js";

const router = express.Router();

router.get("/stats", verifyUser, getDashboardStats);

export default router;
