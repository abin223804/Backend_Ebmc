import IndividualProfile from "../models/individualProfileModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import axios from 'axios'; // Added for Shufti Pro API calls
import { logSearchHistory } from "./searchHistoryController.js";

// Helper to check the profile against Shufti Pro API
const checkExternalApi = async (profileData) => {
    try {
        const apiUrl = process.env.SHUFTIPRO_API_URL || "https://api.shuftipro.com/";
        const clientId = process.env.SHUFTIPRO_CLIENT_ID;
        const clientSecret = process.env.SHUFTIPRO_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.warn("Shufti Pro credentials missing in .env");
            return { status: "Skipped", reason: "Missing credentials" };
        }

        // Basic Auth: Base64 encode User:Passport -> ClientID:Secret
        const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;

        // Prepare Name (Split if possible, or send as full name if API supports it,
        // but Shufti recommends separation for best results. We will do a simple split.)
        const nameParts = (profileData.customerName || "").trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        // Construct Payload
        const payload = {
            reference: `REF-${profileData._id}`,
            language: "en",
            callback_url: null,
            redirect_url: "",
            verification_mode: "any",
            email: profileData.email || null,
            allow_offline: "0",
            allow_online: "0",
            show_consent: "0",
            decline_on_single_step: "1",
            manual_review: "0",
            show_privacy_policy: "0",
            show_results: "0",
            show_feedback_form: "0",
            ttl: 60,
            enhanced_originality_checks: "0",

            background_checks: {
                name: {
                    first_name: firstName,
                    last_name: lastName,
                    fuzzy_match: "1"
                },
                dob: profileData.dob ? new Date(profileData.dob).toISOString().split("T")[0] : "",
                ongoing: "0",
                filters: [
                    "sanction",
                    "warning",
                    "fitness-probity",
                    "pep",
                    "pep-class-1",
                    "pep-class-2",
                    "pep-class-3",
                    "pep-class-4"
                ]
            }
        };

        console.log(`[Shufti Pro] Calling API for profile ${profileData._id}...`);

        const response = await axios.post(apiUrl, payload, {
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            timeout: 30000, // 30 seconds timeout to prevent hanging
        });

        console.log(`[Shufti Pro] API call successful for profile ${profileData._id}`);
        return { payload, data: response.data };
    } catch (error) {
        // Handle timeout specifically
        if (error.code === 'ECONNABORTED') {
            console.error(`[Shufti Pro] API timeout for profile ${profileData._id}`);
            return {
                payload: error.config ? JSON.parse(error.config.data) : null,
                data: {
                    status: "Timeout",
                    error: "External API request timed out after 30 seconds",
                    timestamp: new Date().toISOString()
                }
            };
        }

        console.error(`[Shufti Pro] API error for profile ${profileData._id}:`, error.response?.data || error.message);
        return {
            payload: error.config ? JSON.parse(error.config.data) : null,
            data: {
                status: "Error",
                error: "Failed to check Shufti Pro API",
                details: error.response?.data || error.message,
                timestamp: new Date().toISOString()
            }
        };
    }
};

// @desc    Create a new profile and check against external API
// @route   POST /api/individual-profile/create
// @access  Private (assuming protected by auth)
// Helper function to remove empty strings from nested objects/arrays
// This prevents Mongoose validation errors when empty strings are sent for embedded schemas
const cleanEmptyStrings = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(cleanEmptyStrings).filter(item => {
            // Remove empty objects from arrays
            if (typeof item === 'object' && item !== null) {
                return Object.keys(item).length > 0;
            }
            return item !== "" && item !== null && item !== undefined;
        });
    } else if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value === "" || value === null || value === undefined) {
                // Skip empty strings, null, and undefined
                continue;
            }
            if (typeof value === 'object') {
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

export const createIndividualProfile = asyncHandler(async (req, res, next) => {
    let profileData = req.body;

    // Handle File Uploads
    if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
            const fileObj = {
                fileName: file.originalname,
                filePath: file.path,
                fileType: file.mimetype,
            };

            // Assuming fieldname matches the path in the object, e.g., "idDetails[0][file]"
            // We need to set this deeply in profileData.
            // Since req.body is already hydrated by multer for text fields, we just need to place the file object.
            // However, with bracket notation "idDetails[0][file]", explicit setting is safer if body parser didn't fully handle deep nesting for files.

            // Simple robust approach for specific known fields or using a utility to set deep value.
            // For now, let's try to match exact known structure or use a helper.
            // A helper `setNestedValue` is useful here.

            const keys = file.fieldname.replace(/\]/g, "").split("[");
            let current = profileData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {}; // Should exist from body parser likely, best effort
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = fileObj;
        });
    }

    // Clean empty strings from profileData to prevent Mongoose validation errors
    profileData = cleanEmptyStrings(profileData);

    // 1. Create the profile in DB
    const newProfile = await IndividualProfile.create(profileData);

    // Attach profile to request for next middleware
    req.individualProfile = newProfile;
    next();
});

// @desc    Process external API verification
// @route   Middleware
export const processExternalVerification = asyncHandler(async (req, res) => {
    const profile = req.individualProfile;

    if (!profile) {
        res.status(500);
        throw new Error("Profile creation failed or missing in middleware chain");
    }

    // Call external API
    const { payload: apiPayload, data: apiResult } = await checkExternalApi(profile);

    // Update profile with API result
    profile.apiResult = apiResult;
    await profile.save();

    // Log search history
    if (req.user && req.user.userId) {
        await logSearchHistory(
            req.user.userId,
            profile.customerName,
            "Individual",
            profile._id,
            apiPayload,
            apiResult
        );
    }

    res.status(201).json({
        success: true,
        message: "Individual Profile created and checked successfully",
        data: profile,
    });
});

// @desc    Get all profiles
// @route   GET /api/individual-profile
export const getAllProfiles = asyncHandler(async (req, res) => {
    const profiles = await IndividualProfile.find().sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: profiles,
    });
});

// @desc    Get single profile
// @route   GET /api/individual-profile/:id
export const getProfileById = asyncHandler(async (req, res) => {
    const profile = await IndividualProfile.findById(req.params.id);
    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }
    res.status(200).json({
        success: true,
        data: profile,
    });
});
