import express from "express";
import {
  userLogin,
  refreshUserToken,
  logoutUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/login-user", userLogin);
router.post("/refresh-user", refreshUserToken);
router.post("/logout", logoutUser);

export default router;
