import express from "express";
import {
    createRiskConfiguration,
    updateRiskConfiguration,
    getAllRiskConfigurations,
    getRiskConfigurationById,
    deleteRiskConfiguration,
} from "../controllers/riskManagementController.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// All routes are admin-protected
router.post("/create", verifyAdmin, createRiskConfiguration);
router.put("/:id", verifyAdmin, updateRiskConfiguration);
router.get("/", verifyAdmin, getAllRiskConfigurations);
router.get("/:id", verifyAdmin, getRiskConfigurationById);
router.delete("/:id", verifyAdmin, deleteRiskConfiguration);

export default router;
