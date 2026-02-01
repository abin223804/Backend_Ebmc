import express from "express";
import { getSidetabPermissions } from "../controllers/rbacController.js";
import { verifyUser } from "../middleware/userMiddleware.js";

const router = express.Router();

/**
 * @route GET /api/rbac/sidetab-permissions
 * @desc Get sidebar permissions for the authenticated user
 * @access Private
 */
router.get("/sidetab-permissions", verifyUser, getSidetabPermissions);

export default router;
