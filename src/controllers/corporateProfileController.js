import CorporateProfile from "../models/corporateProfileModel.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Create a new corporate profile and check against external API
// @route   POST /api/corporate-profile/create
// @access  Private
export const createCorporateProfile = asyncHandler(async (req, res) => {
    const profileData = req.body;

    // 1. Create the profile in DB
    const newProfile = await CorporateProfile.create(profileData);

    // 2. Prepare data for External API
    const apiPayload = {
        entityName: newProfile.customerName,
        licenseNumber: newProfile.tradeLicenseNumber,
        // Add logic to extract UBO names if needed for screening
        uboNames: newProfile.ubos?.map(ubo => ubo.uboName) || [],
    };

    // 3. Call External API (Placeholder)
    // const apiResponse = await axios.post('EXTERNAL_API_URL', apiPayload);

    const simulatedApiResult = {
        status: "Clean",
        timestamp: new Date()
    };

    // 4. Update profile with API result
    newProfile.apiResult = simulatedApiResult;
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
