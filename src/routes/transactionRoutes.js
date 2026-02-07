import express from "express";
import { createTransaction, cancelTransaction, getTransactions } from "../controllers/transactionController.js";
import { getAllProfiles, getProfileById, updateProfile, deleteProfile, downloadProfile } from "../controllers/profileController.js";
import { verifyUser } from "../middleware/userMiddleware.js";

const router = express.Router();

// Create a new transaction
router.post("/", verifyUser, createTransaction);

// Get all transactions (with filters)
router.get("/", verifyUser, getTransactions);

// Cancel a transaction
router.patch("/:id/cancel", verifyUser, cancelTransaction);

// =========================================================================
// CUSTOMER MANAGEMENT (Accessible via Transaction Route for UI Convenience)
// =========================================================================

// List Customers (Profiles) for Selection Table
router.get("/customers", verifyUser, getAllProfiles);

// Get Single Customer
router.get("/customers/:id", verifyUser, getProfileById);

// Update Customer
router.put("/customers/:id", verifyUser, updateProfile);

// Soft Delete Customer
router.delete("/customers/:id", verifyUser, deleteProfile);

// Download Customer Profile
router.get("/customers/download/:id", verifyUser, downloadProfile);


export default router;
