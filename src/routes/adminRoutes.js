import express from "express";
import {
  adminLogin,
  refreshAdminToken,
  forgotPassword,
  resetPassword,
  adminLogout,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  toggleBlockUser,
  deleteUser,
} from "../controllers/adminController.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.post("/login-Admin", adminLogin);
router.post("/refresh-Admin", refreshAdminToken);
router.post("/logout-Admin", adminLogout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// Create user
router.post("/create-user", verifyAdmin, createUser);

// View all users
router.get("/get-users", verifyAdmin, getUsers);

// View single user
router.get("/get-user/:id", verifyAdmin, getUserById);

// Update user
router.put("/update-user/:id", verifyAdmin, updateUser);

// Block / Unblock user
router.patch("/block-user/:id", verifyAdmin, toggleBlockUser);

// Delete user (soft delete)
router.delete("/delete-user/:id", verifyAdmin, deleteUser);

export default router;
