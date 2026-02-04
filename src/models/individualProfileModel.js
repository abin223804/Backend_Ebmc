import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    fileName: String,
    filePath: String,
    fileType: String,
});

const idDetailsSchema = new mongoose.Schema({
    idType: {
        type: String,
        required: true,
    },
    idNumber: {
        type: String,
        required: true,
    },
    issueDate: Date,
    expiryDate: {
        type: Date,
        required: true,
    },
    issuedCountry: {
        type: String,
        required: true,
    },
    file: fileSchema, // Assuming file upload returns path/details
});

const individualProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        customerType: {
            type: String,
            enum: ["Individual", "Corporate"],
            default: "Individual",
        },
        // Basic Details
        customerName: {
            type: String,
            required: true,
            trim: true,
        },
        dob: {
            type: Date,
            required: true,
        },
        nationality: {
            type: String,
            required: true,
        },
        birthCountry: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
        },
        profession: {
            type: String,
            required: true,
        },
        landline: String,
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        pepStatus: {
            type: String,
            required: true,
        },
        eaaCount: String,
        residentStatus: {
            type: String,
            required: true,
        },
        eaaVolume: String,
        mobile: {
            type: String,
            required: true,
        },
        addressLine1: {
            type: String,
            required: true,
        },
        addressLine2: String,
        city: {
            type: String,
            required: true,
        },
        state: String,
        poBox: String,
        sponsorName: String,
        visaNumber: String,
        visaExpiryDate: Date,
        erpUin: String,
        remarks: String,

        // Configuration / Search Params
        searchBy: {
            type: String,
            required: true
        },
        searchCategories: {
            type: [String], // e.g., ["sanction", "warning", "pep"]
            default: [
                "sanction",
                "warning",
                "fitness-probity",
                "pep",
                "pep-class-1",
                "pep-class-2",
                "pep-class-3",
                "pep-class-4"
            ]
        },
        matchScore: {
            type: Number,
            default: 85
        },
        isExactMatch: {
            type: Boolean,
            default: false
        },
        includeRelatives: {
            type: Boolean,
            default: false
        },
        includeAliases: {
            type: Boolean,
            default: false
        },

        // ID Details
        idDetails: [idDetailsSchema], // Array to allow multiple IDs if needed, though UI shows one section, often good to be flexible.

        // Status
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "CHECK_REQUIRED"],
            default: "PENDING"
        },
        apiResult: {
            type: mongoose.Schema.Types.Mixed, // To store the external API result
            default: null
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

export default mongoose.model("IndividualProfile", individualProfileSchema);
