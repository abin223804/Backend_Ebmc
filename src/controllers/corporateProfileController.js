import CorporateProfile from "../models/corporateProfileModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import axios from 'axios';
import { logSearchHistory } from "./searchHistoryController.js";
import mongoose from "mongoose";

// Country name to ISO 3166-1 alpha-2 code mapping
const COUNTRY_CODE_MAP = {
    "United Arab Emirates": "AE",
    "Saudi Arabia": "SA",
    "Kuwait": "KW",
    "Qatar": "QA",
    "Bahrain": "BH",
    "Oman": "OM",
    "United States": "US",
    "United Kingdom": "GB",
    "India": "IN",
    "Pakistan": "PK",
    "Bangladesh": "BD",
    "Egypt": "EG",
    "Jordan": "JO",
    "Lebanon": "LB",
    // Add more countries as needed
};

// Helper to convert country name to ISO code
const getCountryCode = (countryName) => {
    if (!countryName) return "";

    // Check if it's already a 2-character code
    if (countryName.length === 2) return countryName.toUpperCase();

    // Look up in mapping
    const code = COUNTRY_CODE_MAP[countryName];
    if (code) return code;

    // If not found, log warning and return empty string
    console.warn(`Country code not found for: ${countryName}. Please add to COUNTRY_CODE_MAP.`);
    return "";
};

// Helper to prepare Business AML check payload
const prepareBusinessCheckPayload = (profile) => {
    const incorporationDate = profile.incorporationDate
        ? new Date(profile.incorporationDate).toISOString().split('T')[0]
        : "";

    // Generate a unique reference string using profile ID and timestamp
    const reference = `CORP_${profile._id}_${Date.now()}`;

    return {
        reference: reference,
        country: getCountryCode(profile.country),
        language: "en",
        callback_url: null,
        redirect_url: "",
        verification_mode: "any",
        email: null,
        show_consent: "1",
        decline_on_single_step: "1",
        manual_review: "0",
        show_privacy_policy: "0",
        show_results: "0",
        show_feedback_form: "0",
        allow_na_ocr_inputs: "0",
        ttl: 60,
        enhanced_originality_checks: "0",

        aml_for_businesses: {
            business_name: profile.customerName,
            business_incorporation_date: incorporationDate,
            ongoing: "1",
            filters: (profile.searchCategories && profile.searchCategories.length > 0)
                ? profile.searchCategories
                : [
                    "sanction",
                    "fitness-probity",
                    "warning",
                    "pep"
                ]
        }
    };
};

// Helper to check the corporate profile against external API
const checkCorporateExternalApi = async (payload) => {
    try {
        const apiUrl = process.env.SHUFTIPRO_API_URL || "https://api.shuftipro.com/";
        const clientId = process.env.SHUFTIPRO_CLIENT_ID;
        const clientSecret = process.env.SHUFTIPRO_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.warn("Shufti Pro credentials missing in .env");
            return { status: "Skipped", reason: "Missing credentials" };
        }

        const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;

        console.log(`[Shufti Pro] Calling Business AML API for ${payload.aml_for_businesses?.business_name}...`);

        const response = await axios.post(apiUrl, payload, {
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            timeout: 30000, // 30 seconds timeout to prevent hanging
        });

        console.log(`[Shufti Pro] Business AML API call successful`);
        return response.data;
    } catch (error) {
        // Handle timeout specifically
        if (error.code === 'ECONNABORTED') {
            console.error(`[Shufti Pro] Business AML API timeout`);
            return {
                status: "Timeout",
                error: "External API request timed out after 30 seconds",
                timestamp: new Date().toISOString()
            };
        }

        console.error(`[Shufti Pro] Business AML API error:`, error.response?.data || error.message);
        return {
            status: "Error",
            error: "Failed to check Shufti Pro API",
            details: error.response?.data || error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// Helper function to remove empty strings from nested objects/arrays
// This prevents Mongoose validation errors when empty strings are sent for embedded schemas
const cleanEmptyStrings = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(cleanEmptyStrings).filter(item => {
            // Remove empty objects from arrays
            if (typeof item === 'object' && item !== null && !(item instanceof mongoose.Types.ObjectId)) {
                return Object.keys(item).length > 0;
            }
            return item !== "" && item !== null && item !== undefined;
        });
    } else if (obj !== null && typeof obj === 'object' && !(obj instanceof mongoose.Types.ObjectId)) {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value === "" || value === null || value === undefined) {
                // Skip empty strings, null, and undefined
                continue;
            }
            if (typeof value === 'object' && value !== null && !(value instanceof mongoose.Types.ObjectId)) {
                const cleanedValue = cleanEmptyStrings(value);
                // Only add if it's not an empty object or empty array
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
 * Helper to format corporate profile response to the new structure
 */
const formatCorporateProfileResponse = (profile) => {
    if (!profile) return null;

    return {
        id: profile._id,
        userId: profile.userId,
        name: profile.customerName,
        incorporationDate: profile.incorporationDate,
        entityLegalType: profile.entityLegalType,
        country: profile.country,
        address: {
            emirates: profile.address?.emirates,
            building: profile.address?.buildingName,
            area: profile.address?.areaStreet,
            poBox: profile.address?.poBox
        },
        tradeLicense: {
            number: profile.tradeLicenseNumber,
            expiryDate: profile.tradeLicenseExpiryDate,
            file: profile.tradeLicenseFile
        },
        ubos: (profile.ubos || []).map(ubo => ({
            name: ubo.uboName,
            type: ubo.uboType,
            shareholding: ubo.shareholdingPercentage,
            passport: {
                name: ubo.passportName,
                number: ubo.passportNumber,
                file: ubo.passportFile
            },
            nationality: ubo.nationality,
            pep: ubo.isPep === "YES",
            dob: ubo.dob
        })),
        documents: profile.documents,
        screening: {
            status: profile.status,
            searchBy: profile.searchBy,
            categories: profile.searchCategories,
            match: {
                score: profile.matchScore,
                exact: profile.isExactMatch
            },
            options: {
                includeRelatives: profile.includeRelatives,
                includeAliases: profile.includeAliases
            }
        },
        verification: {
            status: profile.apiResult?.status === "accepted" ? "SUCCESS" :
                profile.apiResult?.status === "declined" ? "FAILED" :
                    profile.apiResult?.status || "UNKNOWN",
            provider: "ShuftiPro",
            error: profile.apiResult?.error ? {
                field: profile.apiResult.error.field || "unknown",
                message: profile.apiResult.error.message || profile.apiResult.error
            } : null,
            reference: profile.apiResult?.reference || `CORP-${profile._id}`,
            timestamp: profile.apiResult?.timestamp || profile.updatedAt
        },
        meta: {
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
        }
    };
};

// @desc    Create a new corporate profile and check against external API
// @route   POST /api/corporate-profile/create
// @access  Private
export const createCorporateProfile = asyncHandler(async (req, res) => {
    let profileData = req.body;

    // Attach Logged-in User ID
    if (req.user && req.user.userId) {
        profileData.userId = req.user.userId;
    }

    // Handle File Uploads
    if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
            const fileObj = {
                fileName: file.originalname,
                filePath: file.path,
                fileType: file.mimetype,
            };

            // Manual deep set based on bracket notation fieldname (e.g., "documents[amlPolicy]")
            const keys = file.fieldname.replace(/\]/g, "").split("[");
            let current = profileData;
            for (let i = 0; i < keys.length - 1; i++) {
                // Ensure arrays/objects exist (Multer body parser usually handles text fields, but files might come for empty slots)
                // Note: If the array index doesn't exist yet in body (e.g. only file upload for that item), we need to create it.
                // But usually text fields come too.
                if (current[keys[i]] === undefined) {
                    // Check if next key is a number (array index)
                    current[keys[i]] = isNaN(keys[i + 1]) ? {} : [];
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = fileObj;
        });
    }

    // Clean empty strings from profileData to prevent Mongoose validation errors
    profileData = cleanEmptyStrings(profileData);

    // 1. Create the profile in DB
    const newProfile = await CorporateProfile.create(profileData);

    // 2. Prepare data for External API (Business AML Check)
    const apiPayload = prepareBusinessCheckPayload(newProfile);

    // 3. Call External API
    const apiResult = await checkCorporateExternalApi(apiPayload);

    // 4. Update profile with API result
    newProfile.apiResult = apiResult;

    // Automate status update based on verification result
    if (apiResult?.status === "accepted") {
        newProfile.status = "APPROVED";
    } else if (apiResult?.status === "declined") {
        newProfile.status = "CHECK_REQUIRED";
    }

    await newProfile.save();

    // 5. Log search history
    if (req.user && req.user.userId) {
        await logSearchHistory(
            req.user.userId,
            newProfile.customerName,
            "Corporate",
            newProfile._id,
            apiPayload,
            apiResult
        );
    }

    res.status(201).json({
        success: true,
        message: "Corporate Profile created and checked successfully",
        profile: formatCorporateProfileResponse(newProfile),
    });
});

// @desc    Get all corporate profiles with filtering
// @route   POST /api/corporate-profile/search
export const getAllCorporateProfiles = asyncHandler(async (req, res) => {
    const filters = req.body || {};
    const query = { isDeleted: false };

    // Filter by the logged-in user ID
    if (req.user && req.user.userId) {
        query.userId = req.user.userId;
    }

    // Apply filters from body
    if (filters.customerName) {
        query.customerName = { $regex: filters.customerName, $options: "i" };
    }
    if (filters.tradeLicenseNumber) {
        query.tradeLicenseNumber = { $regex: filters.tradeLicenseNumber, $options: "i" };
    }
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.country) {
        query.country = filters.country;
    }
    if (filters.entityLegalType) {
        query.entityLegalType = filters.entityLegalType;
    }

    // Date range filter for createdAt
    if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const profiles = await CorporateProfile.find(query).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        count: profiles.length,
        profiles: profiles.map(p => formatCorporateProfileResponse(p)),
    });
});

// @desc    Get single corporate profile
// @route   GET /api/corporate-profile/:id
export const getCorporateProfileById = asyncHandler(async (req, res) => {
    const profile = await CorporateProfile.findOne({ _id: req.params.id, isDeleted: false });
    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }
    res.status(200).json({
        success: true,
        profile: formatCorporateProfileResponse(profile),
    });
});

// @desc    Update a corporate profile
// @route   PUT /api/corporate-profile/:id
// @access  Private
export const updateCorporateProfile = asyncHandler(async (req, res) => {
    let profile = await CorporateProfile.findOne({ _id: req.params.id, isDeleted: false });

    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }

    let updateData = req.body;

    // Handle File Uploads
    if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
            const fileObj = {
                fileName: file.originalname,
                filePath: file.path,
                fileType: file.mimetype,
            };

            const keys = file.fieldname.replace(/\]/g, "").split("[");
            let current = updateData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined) {
                    current[keys[i]] = isNaN(keys[i + 1]) ? {} : [];
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = fileObj;
        });
    }

    updateData = cleanEmptyStrings(updateData);

    profile = await CorporateProfile.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "Corporate Profile updated successfully",
        profile: formatCorporateProfileResponse(profile),
    });
});

// @desc    Soft delete a corporate profile
// @route   DELETE /api/corporate-profile/:id
// @access  Private
export const deleteCorporateProfile = asyncHandler(async (req, res) => {
    const profile = await CorporateProfile.findOne({ _id: req.params.id, isDeleted: false });

    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }

    profile.isDeleted = true;
    profile.deletedAt = new Date();
    await profile.save();

    res.status(200).json({
        success: true,
        message: "Corporate Profile deleted successfully (soft delete)",
    });
});

// @desc    Download corporate profile as JSON
// @route   GET /api/corporate-profile/download/:id
// @access  Private
export const downloadCorporateProfile = asyncHandler(async (req, res) => {
    const profile = await CorporateProfile.findOne({ _id: req.params.id, isDeleted: false });

    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }

    const fileName = `Corporate_Profile_${profile.customerName.replace(/\s+/g, '_')}_${profile._id}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    res.status(200).send(JSON.stringify(profile, null, 2));
});
