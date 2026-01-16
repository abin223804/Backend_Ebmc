import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "ebmc_uploads", // Folder name in Cloudinary
        allowed_formats: ["jpg", "png", "jpeg", "pdf"],
        resource_type: "auto", // Detects image/raw (pdf is raw mostly, but auto handles it)
    },
});

const upload = multer({ storage: storage });

export default upload;
