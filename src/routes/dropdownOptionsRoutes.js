import express from "express";
import {
    createDropdownOption,
    getDropdownOptionsByCategory,
    getAllDropdownOptions,
    updateDropdownOption,
    deleteDropdownOption,
    bulkCreateDropdownOptions,
} from "../controllers/dropdownOptionsController.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes (or add verifyUser if you want to protect them)
router.get("/", getAllDropdownOptions);
router.get("/:category", getDropdownOptionsByCategory);

// Admin-only routes
router.post("/create", verifyAdmin, createDropdownOption);
router.post("/bulk-create", verifyAdmin, bulkCreateDropdownOptions);
router.put("/:id", verifyAdmin, updateDropdownOption);
router.delete("/:id", verifyAdmin, deleteDropdownOption);

export default router;
