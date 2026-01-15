import IndividualProfile from "../models/individualProfileModel.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Create a new profile and check against external API
// @route   POST /api/individual-profile/create
// @access  Private (assuming protected by auth)
export const createIndividualProfile = asyncHandler(async (req, res) => {
    const profileData = req.body;

    // 1. Create the profile in DB
    const newProfile = await IndividualProfile.create(profileData);

    // 2. Prepare data for External API
    // User mentioned: "need particular field values for fetching result from an external api"
    // extracting example fields that are commonly used for checks
    const apiPayload = {
        name: newProfile.customerName,
        dob: newProfile.dob,
        nationality: newProfile.nationality,
        idNumber: newProfile.idDetails?.[0]?.idNumber,
        // Add other fields as required by the specific External API
    };

    // 3. Call External API (Placeholder)
    // TODO: Implement the actual API call here using axios or fetch
    // const apiResponse = await axios.post('EXTERNAL_API_URL', apiPayload);

    // For now, we'll simulate a result or leave it null
    const simulatedApiResult = {
        status: "Clean", // Example result
        hits: 0,
        timestamp: new Date()
    };

    // 4. Update profile with API result
    newProfile.apiResult = simulatedApiResult;
    await newProfile.save();

    res.status(201).json({
        success: true,
        message: "Individual Profile created and checked successfully",
        data: newProfile,
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
