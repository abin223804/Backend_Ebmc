import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    fileName: String,
    filePath: String,
    fileType: String,
});

const uboSchema = new mongoose.Schema({
    uboName: String,
    uboType: String, // e.g. "Individual"
    shareholdingPercentage: Number,
    passportName: String,
    passportNumber: String,
    passportFile: fileSchema,
    nationality: String,
    emiratesIdNumber: String,
    emiratesIdExpiryDate: Date,
    emiratesIdFile: fileSchema,
    isPep: {
        type: String, // YES/NO as per UI
        default: "NO"
    },
    dob: Date
});

const shareholderSchema = new mongoose.Schema({
    name: String,
    passportNumber: String,
    passportFile: fileSchema,
    nationality: String,
    shareholdingPercentage: Number,
    isPep: {
        type: String,
        default: "NO"
    },
    dob: Date
});

const corporateProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        // 1. Customer Info
        customerType: {
            type: String,
            required: true
        },
        coreCustId: {
            type: String, // Core Customer ID from UI
            trim: true
        },
        mobile: {
            type: String, // Added to support UI table view
            trim: true
        },
        customerName: {
            type: String,
            required: true,
            trim: true
        },
        entityLegalType: {
            type: String,
            required: true
        },
        address: {
            emirates: String,
            buildingName: String,
            areaStreet: String,
            poBox: String
        },
        country: String,
        incorporationDate: Date,

        // 2. Trade License
        tradeLicenseNumber: String,
        tradeLicenseFile: fileSchema,
        tradeLicenseExpiryDate: Date,

        // 3. UBOs
        ubos: [uboSchema],

        // 4. Shareholders
        shareholders: [shareholderSchema],

        // 5. Documents
        documents: {
            accountOpeningForm: fileSchema,
            amlPolicy: fileSchema,
            sourceOfFundDeclaration: fileSchema,
            pepDeclaration: fileSchema,
            oecdComplianceDeclaration: fileSchema,
            lbmaDeclaration: fileSchema,
            supplyChainPolicy: fileSchema,
            boardResolution: fileSchema,
            moa: fileSchema,
            vatRegistrationCertificate: fileSchema,
            corporateTaxRegistrationCertificate: fileSchema,
            staffAuthorization: fileSchema,
            vatRcmDeclaration: fileSchema,
            fiuGoAmlRegistrationScreenshot: fileSchema
        },
        // Configuration / Search Params
        searchBy: {
            type: String,
            default: "Name"
        },
        searchCategories: {
            type: [String], // e.g., ["sanction", "warning", "pep"]
            default: [
                "sanction",
                "fitness-probity",
                "warning",
                "pep"
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
        countries: {
            type: [String], // Array of ISO country codes for AML search (e.g., ["gb", "cy"])
            default: []
        },

        // Status - Using exact Shufti Pro API events
        status: {
            type: String,
            enum: [
                // Success
                "verification.accepted",
                // Pending/In-Progress
                "request.pending",
                "request.received",
                "review.pending",
                // Declined/Errors
                "verification.declined",
                "request.invalid",
                "request.timeout",
                "request.unauthorized",
                "verification.cancelled",
                "verification.status.changed",
                "request.data.changed",
                // Deleted
                "request.deleted",
                // Legacy/Fallback
                "accepted",
                "declined",
                // Custom error states
                "Error",
                "Timeout",
                "No API Result"
            ],
            default: "request.pending"
        },
        apiStatus: {
            type: String, // Duplicate of status for backward compatibility
            default: null
        },
        apiResult: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        apiError: {
            type: {
                event: String,              // Error event type (e.g., "request.invalid")
                service: String,            // Service that failed (e.g., "background_checks")
                field: String,              // Field that caused error
                message: String,            // Error message
                code: String,               // Error code if available
                timestamp: Date,            // When the error occurred
                fullError: mongoose.Schema.Types.Mixed  // Complete error object
            },
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

export default mongoose.model("CorporateProfile", corporateProfileSchema);
