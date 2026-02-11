import express from "express";
import { createTransaction, cancelTransaction, getTransactions, deleteTransaction } from "../controllers/transactionController.js";
import { getAllProfiles, getProfileById, updateProfile, deleteProfile, downloadProfile } from "../controllers/profileController.js";
import { verifyUser } from "../middleware/userMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Create a new transaction
router.post("/createTransaction", verifyUser, upload.single("file"), createTransaction);

// Get all transactions (with filters)
router.get("/getTransactions", verifyUser, getTransactions);


// Cancel a transaction
// router.patch("/:id/cancel", verifyUser, cancelTransaction);
router.patch("/:transactionId/cancel", verifyUser, cancelTransaction);


// Soft Delete a transaction
// router.delete("/:id", verifyUser, deleteTransaction);

router.patch("/:transactionId/delete", verifyUser, deleteTransaction);




export default router;
