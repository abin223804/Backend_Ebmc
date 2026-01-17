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
        // 1. Customer Info
        customerType: {
            type: String,
            required: true
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

        // Status
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "CHECK_REQUIRED"],
            default: "PENDING"
        },
        apiResult: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("CorporateProfile", corporateProfileSchema);
