import IndividualProfile from "../models/individualProfileModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import axios from 'axios'; // Added for Shufti Pro API calls
import { logSearchHistory } from "./searchHistoryController.js";
import mongoose from "mongoose";

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
                dob: profileData.dob ? new Date(profileData.dob).toISOString().split("T")[0] : "2021-07-11",
                ongoing: "0",
                filters: (() => {
                    // Handle searchCategories as string (comma-separated from form-data) or array
                    if (profileData.searchCategories) {
                        if (typeof profileData.searchCategories === 'string') {
                            // Split comma-separated string into array
                            const categories = profileData.searchCategories.split(',').map(cat => cat.trim()).filter(cat => cat);
                            if (categories.length > 0) return categories;
                        } else if (Array.isArray(profileData.searchCategories) && profileData.searchCategories.length > 0) {
                            return profileData.searchCategories;
                        }
                    }
                    // Default filters if none provided
                    return [
                        "sanction",
                        "warning",
                        "fitness-probity",
                        "pep",
                        "pep-class-1",
                        "pep-class-2",
                        "pep-class-3",
                        "pep-class-4"
                    ];
                })()
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
 * Helper to format individual profile response to the new structure
 */
// Helper to format response (exclude internal fields if needed)
export const formatIndividualProfileResponse = (profile) => {
    if (!profile) return null;

    return {
        id: profile._id,
        userId: profile.userId,
        coreCustId: profile.coreCustId, // New field for UI
        name: profile.customerName,
        dob: profile.dob,
        gender: profile.gender,
        nationality: profile.nationality,
        birthCountry: profile.birthCountry,
        profession: profile.profession,
        pep: profile.pepStatus === "YES",
        residentStatus: profile.residentStatus,
        contact: {
            mobile: profile.mobile,
            address: {
                line1: profile.addressLine1,
                city: profile.city,
                state: profile.state
            }
        },
        documents: (profile.idDetails || []).map(doc => ({
            type: doc.idType,
            number: doc.idNumber,
            expiryDate: doc.expiryDate,
            issuedCountry: doc.issuedCountry,
            file: doc.file
        })),
        screening: {
            status: profile.status,
            apiStatus: profile.apiStatus, // Exact Shufti Pro API event/status
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
            status: profile.apiResult?.event === "verification.accepted" ? "SUCCESS" :
                profile.apiResult?.event === "verification.declined" ? "FAILED" :
                    profile.apiResult?.status || "UNKNOWN",
            apiStatus: profile.apiStatus, // Exact status/event from Shufti Pro API
            provider: "ShuftiPro",
            error: profile.apiError ? {
                event: profile.apiError.event,
                service: profile.apiError.service,
                field: profile.apiError.field,
                message: profile.apiError.message,
                code: profile.apiError.code,
                timestamp: profile.apiError.timestamp
            } : null,
            reference: profile.apiResult?.reference || `REF-${profile._id}`,
            timestamp: profile.apiResult?.timestamp || profile.updatedAt
        },
        meta: {
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
        }
    };
};

export const createIndividualProfile = asyncHandler(async (req, res, next) => {
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

    // Comprehensive status update based on Shufti Pro API events
    // Reference: https://developers.shuftipro.com/docs/responses

    const event = apiResult?.event;
    const status = apiResult?.status;

    // Store the exact API status/event in both fields
    const exactStatus = event || status || "No API Result";
    profile.status = exactStatus;
    profile.apiStatus = exactStatus;

    // Capture and store API errors
    const errorStatuses = [
        'verification.declined',
        'request.invalid',
        'request.timeout',
        'request.unauthorized',
        'verification.cancelled',
        'Error',
        'Timeout',
        'No API Result'
    ];

    if (errorStatuses.includes(exactStatus)) {
        profile.apiError = {
            event: event || status || 'No API Result',
            service: apiResult?.error?.service || 'unknown',
            field: apiResult?.error?.key || apiResult?.error?.field || null,
            message: apiResult?.error?.message || apiResult?.error || 'Unknown error',
            code: apiResult?.error?.code || null,
            timestamp: new Date(),
            fullError: apiResult?.error || apiResult || { message: 'No API result received' }
        };

        console.log(`[Error] Profile ${profile._id} error captured:`, {
            event: profile.apiError.event,
            service: profile.apiError.service,
            field: profile.apiError.field,
            message: profile.apiError.message
        });
    } else {
        // Clear error if status is successful
        profile.apiError = null;
    }

    // Log the exact status
    console.log(`[Status] Profile ${profile._id} set to: ${exactStatus}`);

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
        profile: formatIndividualProfileResponse(profile),
    });
});

// @desc    Get all files with filtering and pagination
// @route   GET /api/individual-profile OR POST /api/individual-profile/search
export const getAllProfiles = asyncHandler(async (req, res) => {
    // Combine filters from body (POST) and query (GET)
    const filters = { ...req.query, ...req.body };
    const query = { isDeleted: false };

    // Pagination parameters
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by the logged-in user ID
    if (req.user && req.user.userId) {
        query.userId = req.user.userId;
    }

    // Apply filters from body/query
    if (filters.customerName) {
        query.customerName = { $regex: filters.customerName, $options: "i" };
    }
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.nationality) {
        query.nationality = filters.nationality;
    }
    if (filters.residentStatus) {
        query.residentStatus = filters.residentStatus;
    }
    if (filters.pepStatus) {
        query.pepStatus = filters.pepStatus;
    }

    // Date range filter for createdAt
    if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    // Execute query with pagination
    const profiles = await IndividualProfile.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Get total count for pagination metadata
    const total = await IndividualProfile.countDocuments(query);

    res.status(200).json({
        success: true,
        count: profiles.length,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        },
        profiles: profiles.map(p => formatIndividualProfileResponse(p)),
    });
});

// @desc    Get single profile
// @route   GET /api/individual-profile/:id
export const getProfileById = asyncHandler(async (req, res) => {
    const profile = await IndividualProfile.findOne({ _id: req.params.id, isDeleted: false });
    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }
    res.status(200).json({
        success: true,
        profile: formatIndividualProfileResponse(profile),
    });
});

// @desc    Update a profile
// @route   PUT /api/individual-profile/:id
// @access  Private
export const updateIndividualProfile = asyncHandler(async (req, res) => {
    let profile = await IndividualProfile.findOne({ _id: req.params.id, isDeleted: false });

    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }

    let updateData = req.body;

    // Handle File Uploads for update
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
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = fileObj;
        });
    }

    updateData = cleanEmptyStrings(updateData);

    profile = await IndividualProfile.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile: formatIndividualProfileResponse(profile),
    });
});

// @desc    Soft delete a profile
// @route   DELETE /api/individual-profile/:id
// @access  Private
export const deleteIndividualProfile = asyncHandler(async (req, res) => {
    const profile = await IndividualProfile.findOne({ _id: req.params.id, isDeleted: false });

    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }

    profile.isDeleted = true;
    profile.deletedAt = new Date();
    await profile.save();

    res.status(200).json({
        success: true,
        message: "Profile deleted successfully (soft delete)",
    });
});

// @desc    Download profile as JSON
// @route   GET /api/individual-profile/download/:id
// @access  Private
export const downloadIndividualProfile = asyncHandler(async (req, res) => {
    const profile = await IndividualProfile.findOne({ _id: req.params.id, isDeleted: false });

    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }

    const fileName = `Profile_${profile.customerName.replace(/\s+/g, '_')}_${profile._id}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    res.status(200).send(JSON.stringify(profile, null, 2));
});
