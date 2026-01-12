import express from "express";

import {
  userLogin,
  refreshUserToken,
  getUserSessions,
  logoutUserSession,
  logoutAllUserSessions,
} from "../controllers/userController.js";

import { verifyUser } from "../middleware/userMiddleware.js";

const router = express.Router();

router.post("/login-user", userLogin);
router.post("/refresh-user", refreshUserToken);
router.get("/my-sessions", verifyUser, getUserSessions);
router.post("/logout-session/:id", verifyUser, logoutUserSession);
router.post("/logout-all", verifyUser, logoutAllUserSessions);

export default router;
