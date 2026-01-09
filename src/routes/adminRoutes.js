import express from "express";
import {
  adminLogin,
  refreshAdminToken,
  forgotPassword,
  resetPassword,
  adminLogout
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/login-Admin",adminLogin);
router.post("/refresh-Admin", refreshAdminToken);
router.post("/logout-Admin",adminLogout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


export default router;
