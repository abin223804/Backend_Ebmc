import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    fileName: String,
    fileUrl: String,
    fileType: String,
    publicId: String,
});

const additionalDocumentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        profileId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'profileType', // Dynamic reference based on profileType
            index: true
        },
        profileType: {
            type: String,
            required: true,
            enum: ["IndividualProfile", "CorporateProfile"] // Mongoose model names
        },
        customerName: {
            type: String,
            trim: true
        },
        transactionNumber: {
            type: String,
            trim: true
        },
        uploadDocumentType: {
            type: String, // e.g., "Profile based"
            trim: true
        },
        documentType: {
            type: String,
            enum: [
                "Passport copy",
                "Nationality ID copy",
                "Bank statement",
                "Withdrawal slip",
                "Invoice",
                "Others"
            ],
            required: true
        },
        file: fileSchema,
        remarks: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["Uploaded", "Verified", "Rejected"],
            default: "Uploaded"
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("AdditionalDocument", additionalDocumentSchema);
