import express from "express";
import { uploadDocument, getDocuments, updateDocument, deleteDocument } from "../controllers/additionalDocumentController.js";
import upload from "../middleware/uploadMiddleware.js";
import { verifyUser } from "../middleware/userMiddleware.js"; // Assuming this exists or similar

const router = express.Router();

router.post("/upload", verifyUser, upload.single("file"), uploadDocument);
router.get("/", verifyUser, getDocuments);
router.put("/:id", verifyUser, upload.single("file"), updateDocument);
router.delete("/:id", verifyUser, deleteDocument);

export default router;
