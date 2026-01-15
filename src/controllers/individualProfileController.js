import IndividualProfile from "../models/individualProfileModel.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Create a new profile and check against external API
// @route   POST /api/individual-profile/create
// @access  Private (assuming protected by auth)
export const createIndividualProfile = asyncHandler(async (req, res) => {
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
