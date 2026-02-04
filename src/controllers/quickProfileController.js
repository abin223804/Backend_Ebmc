import IndividualProfile from "../models/individualProfileModel.js";
import CorporateProfile from "../models/corporateProfileModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Helper function to remove empty strings from nested objects/arrays
const cleanEmptyStrings = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(cleanEmptyStrings).filter(item => {
            if (typeof item === 'object' && item !== null && !(item instanceof mongoose.Types.ObjectId)) {
                return Object.keys(item).length > 0;
            }
            return item !== "" && item !== null && item !== undefined;
        });
    } else if (obj !== null && typeof obj === 'object' && !(obj instanceof mongoose.Types.ObjectId)) {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value === "" || value === null || value === undefined) {
                continue;
            }
            if (typeof value === 'object' && value !== null && !(value instanceof mongoose.Types.ObjectId)) {
                const cleanedValue = cleanEmptyStrings(value);
                if (Array.isArray(cleanedValue)) {
                    if (cleanedValue.length > 0) cleaned[key] = cleanedValue;
                } else if (Object.keys(cleanedValue).length > 0) {
                    cleaned[key] = cleanedValue;
                }
            } else {
                cleaned[key] = value;
            }
        }
        return cleaned;
    }
    return obj;
};

/**
 * Helper to format response based on model type
 */
const formatQuickProfileResponse = (profile, type) => {
    if (!profile) return null;

    if (type === "Individual") {
        return {
            id: profile._id,
            userId: profile.userId,
            customerType: profile.customerType,
            name: profile.customerName,
            dob: profile.dob,
            gender: profile.gender,
            nationality: profile.nationality,
            email: profile.email,
            residentStatus: profile.residentStatus,
            contact: {
                mobile: profile.mobile,
                address: {
                    line1: profile.addressLine1,
                    line2: profile.addressLine2,
                    city: profile.city,
                    state: profile.state,
                    poBox: profile.poBox
                }
            },
            documents: (profile.idDetails || []).map(doc => ({
                type: doc.idType,
                number: doc.idNumber,
                issueDate: doc.issueDate,
                expiryDate: doc.expiryDate,
                issuedCountry: doc.issuedCountry,
                file: doc.file
            })),
            screening: {
                status: profile.status,
                searchBy: profile.searchBy,
                categories: profile.searchCategories,
                match: {
                    score: profile.matchScore,
                    exact: profile.isExactMatch
                }
            },
            meta: {
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt
            }
        };
    } else {
        // Corporate
        return {
            id: profile._id,
            userId: profile.userId,
            customerType: profile.customerType,
            name: profile.customerName,
            incorporationDate: profile.incorporationDate,
            entityLegalType: profile.entityLegalType,
            country: profile.country,
            address: profile.address,
            tradeLicense: {
                number: profile.tradeLicenseNumber,
                expiryDate: profile.tradeLicenseExpiryDate,
                file: profile.tradeLicenseFile
            },
            screening: {
                status: profile.status,
                searchBy: profile.searchBy,
                categories: profile.searchCategories,
                match: {
                    score: profile.matchScore,
                    exact: profile.isExactMatch
                }
            },
            meta: {
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt
            }
        };
    }
};

// @desc    Create a new quick profile (Individual or Corporate)
// @route   POST /api/quick-profile/create
// @access  Private
export const createQuickProfile = asyncHandler(async (req, res) => {
    let inputData = req.body;

    // Attach Logged-in User ID
    if (req.user && req.user.userId) {
        inputData.userId = req.user.userId;
    }

    // Handle File Uploads
    if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
            const fileObj = {
                fileName: file.originalname,
                filePath: file.path,
                fileType: file.mimetype,
            };

            const keys = file.fieldname.replace(/\]/g, "").split("[");
            let current = inputData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined) {
                    current[keys[i]] = isNaN(keys[i + 1]) ? {} : [];
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = fileObj;
        });
    }

    // Clean empty strings 
    inputData = cleanEmptyStrings(inputData);

    const customerType = inputData.customerType || "Individual";
    let newProfile;

    if (customerType === "Corporate") {
        // Map fields for Corporate model
        const corporateData = {
            userId: inputData.userId,
            customerType: "Corporate",
            coreCustId: inputData.coreCustId, // New field for UI
            mobile: inputData.mobile,         // New field for UI (Corporate mobile)
            customerName: inputData.customerName,
            entityLegalType: inputData.entityLegalType || "Corporate",
            incorporationDate: inputData.dob, // Mapping DOB to Incorporation Date
            country: inputData.nationality, // Mapping Nationality to Country
            address: {
                emirates: inputData.city,
                areaStreet: inputData.addressLine1,
                poBox: inputData.poBox
            },
            status: "PENDING",
            searchBy: inputData.searchBy || "Name"
        };

        // Handle Trade License / ID mapping
        if (inputData.idDetails && inputData.idDetails[0]) {
            corporateData.tradeLicenseNumber = inputData.idDetails[0].idNumber;
            corporateData.tradeLicenseExpiryDate = inputData.idDetails[0].expiryDate;
            corporateData.tradeLicenseFile = inputData.idDetails[0].file;
        }

        newProfile = await CorporateProfile.create(corporateData);
    } else {
        // Individual
        inputData.status = "PENDING";
        if (!inputData.searchBy) inputData.searchBy = "Name";
        newProfile = await IndividualProfile.create(inputData);
    }

    res.status(201).json({
        success: true,
        message: `${customerType} Quick Profile created successfully`,
        profile: formatQuickProfileResponse(newProfile, customerType),
    });
});
