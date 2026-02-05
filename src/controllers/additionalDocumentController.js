import AdditionalDocument from "../models/additionalDocumentModel.js";
import IndividualProfile from "../models/individualProfileModel.js";
import CorporateProfile from "../models/corporateProfileModel.js";
import cloudinary from "../utils/cloudinary.js";

// Upload a document
export const uploadDocument = async (req, res) => {
    try {
        const {
            profileId,
            profileType,
            uploadDocumentType,
            documentType,
            remarks,
            transactionNumber,
            customerName
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // 1. Verify Profile Exists & Map Type
        let modelName;
        if (profileType === "Individual" || profileType === "IndividualProfile") {
            modelName = "IndividualProfile";
            profile = await IndividualProfile.findById(profileId);
        } else if (profileType === "Corporate" || profileType === "CorporateProfile") {
            modelName = "CorporateProfile";
            profile = await CorporateProfile.findById(profileId);
        } else {
            return res.status(400).json({ message: "Invalid profile type" });
        }

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // 2. Create Document Record
        const newDocument = new AdditionalDocument({
            userId: req.user.userId, // From authMiddleware
            profileId,
            profileType: modelName,
            customerName, // Snapshot
            transactionNumber,
            uploadDocumentType,
            documentType,
            file: {
                fileName: req.file.originalname,
                fileUrl: req.file.path,
                fileType: req.file.mimetype,
                publicId: req.file.filename // Multer-storage-cloudinary provides this
            },
            remarks,
            status: "Uploaded"
        });

        await newDocument.save();

        res.status(201).json({
            message: "Document uploaded successfully",
            data: newDocument
        });

    } catch (error) {
        console.error("Error uploading document:", error);
        // Clean up cloudinary if DB save fails (optional but good practice)
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get documents (filtered by profileId or getAll)
export const getDocuments = async (req, res) => {
    try {
        const { profileId, page = 1, limit = 10 } = req.query;

        const query = { isDeleted: false };
        if (profileId) {
            query.profileId = profileId;
        }

        const skip = (page - 1) * limit;

        const documents = await AdditionalDocument.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AdditionalDocument.countDocuments(query);

        res.status(200).json({
            data: documents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update document
export const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            uploadDocumentType,
            documentType,
            remarks,
            transactionNumber,
            customerName,
            status
        } = req.body;

        const document = await AdditionalDocument.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        if (document.isDeleted) {
            return res.status(400).json({ message: "Cannot update deleted document" });
        }

        // Update text fields
        if (uploadDocumentType) document.uploadDocumentType = uploadDocumentType;
        if (documentType) document.documentType = documentType;
        if (remarks !== undefined) document.remarks = remarks;
        if (transactionNumber) document.transactionNumber = transactionNumber;
        if (customerName) document.customerName = customerName;
        if (status) document.status = status;

        // If new file is uploaded, replace the old one
        if (req.file) {
            // Delete old file from Cloudinary
            if (document.file && document.file.publicId) {
                await cloudinary.uploader.destroy(document.file.publicId);
            }

            // Update with new file
            document.file = {
                fileName: req.file.originalname,
                fileUrl: req.file.path,
                fileType: req.file.mimetype,
                publicId: req.file.filename
            };
        }

        await document.save();

        res.status(200).json({
            message: "Document updated successfully",
            data: document
        });

    } catch (error) {
        console.error("Error updating document:", error);
        // Clean up cloudinary if new file was uploaded but DB update fails
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Soft delete document
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await AdditionalDocument.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        document.isDeleted = true;
        document.deletedAt = new Date();
        await document.save();

        res.status(200).json({ message: "Document deleted successfully" });

    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
