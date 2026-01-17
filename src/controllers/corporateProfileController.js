import CorporateProfile from "../models/corporateProfileModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import axios from 'axios';

// Helper to prepare Business AML check payload
const prepareBusinessCheckPayload = (profile) => {
    const incorporationDate = profile.incorporationDate
        ? new Date(profile.incorporationDate).toISOString().split('T')[0]
        : "";

    return {
        reference: "",
        country: profile.country || "",
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
            filters: [
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

        const response = await axios.post(apiUrl, payload, {
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error calling Shufti Pro API:", error.response?.data || error.message);
        return {
            error: "Failed to check Shufti Pro API",
            details: error.response?.data || error.message
        };
    }
};

// @desc    Create a new corporate profile and check against external API
// @route   POST /api/corporate-profile/create
// @access  Private
export const createCorporateProfile = asyncHandler(async (req, res) => {
    let profileData = req.body;

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

    // 1. Create the profile in DB
    const newProfile = await CorporateProfile.create(profileData);

    // 2. Prepare data for External API (Business AML Check)
    const apiPayload = prepareBusinessCheckPayload(newProfile);

    // 3. Call External API
    const apiResult = await checkCorporateExternalApi(apiPayload);

    // 4. Update profile with API result
    newProfile.apiResult = apiResult;
    await newProfile.save();

    res.status(201).json({
        success: true,
        message: "Corporate Profile created and checked successfully",
        data: newProfile,
    });
});

// @desc    Get all corporate profiles
// @route   GET /api/corporate-profile
export const getAllCorporateProfiles = asyncHandler(async (req, res) => {
    const profiles = await CorporateProfile.find().sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: profiles,
    });
});

// @desc    Get single corporate profile
// @route   GET /api/corporate-profile/:id
export const getCorporateProfileById = asyncHandler(async (req, res) => {
    const profile = await CorporateProfile.findById(req.params.id);
    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }
    res.status(200).json({
        success: true,
        data: profile,
    });
});
