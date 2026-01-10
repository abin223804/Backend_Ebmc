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
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/login-Admin", adminLogin);
router.post("/refresh-Admin", refreshAdminToken);
router.post("/logout-Admin", adminLogout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/create-user", verifyAdmin, createUser);

router.get("/get-users", verifyAdmin, getUsers);

router.get("/get-user/:id", verifyAdmin, getUserById);

router.put("/update-user/:id", verifyAdmin, updateUser);

router.patch("/block-user/:id", verifyAdmin, toggleBlockUser);

router.delete("/delete-user/:id", verifyAdmin, deleteUser);

export default router;
