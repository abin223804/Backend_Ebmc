import express from "express";
import rateLimit from "express-rate-limit";

const forgotLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5
});

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

import { verifyAdmin } from "../middlewares/adminMiddleware.js";
import validate from "../middlewares/validate.js";

import { adminLoginSchema } from "../validations/admin.schema.js";
import { createUserSchema } from "../validations/user.schema.js";

const router = express.Router();

router.post("/login-Admin", validate(adminLoginSchema), adminLogin);

router.post("/refresh-Admin", refreshAdminToken);

router.post("/logout-Admin", adminLogout);


router.post("/forgot-password", forgotLimiter, forgotPassword);

router.post("/reset-password", resetPassword);

router.post(
  "/create-user",
  verifyAdmin,
  validate(createUserSchema),
  createUser
);

router.get("/get-users", verifyAdmin, getUsers);

router.get("/get-user/:id", verifyAdmin, getUserById);

router.put("/update-user/:id", verifyAdmin, updateUser);

router.patch("/block-user/:id", verifyAdmin, toggleBlockUser);

router.delete("/delete-user/:id", verifyAdmin, deleteUser);

export default router;
