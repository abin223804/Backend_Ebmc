import IndividualProfile from "../models/individualProfileModel.js";
import CorporateProfile from "../models/corporateProfileModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { formatIndividualProfileResponse } from "./individualProfileController.js";
import { formatCorporateProfileResponse } from "./corporateProfileController.js";

// @desc    Get all profiles (Unified View) with pagination
// @route   GET /api/profiles
// @access  Private
export const getAllProfiles = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, searchType, searchValue } = req.query;

    // Base Query: filter by userId and not deleted
    const query = {
        isDeleted: false,
        ...(req.user && req.user.userId ? { userId: req.user.userId } : {})
    };

    // Apply specific search if provided
    // Apply specific search if provided
    if (searchType && searchValue) {
        if (searchType === "Core customer number") {
            query.coreCustId = { $regex: searchValue, $options: "i" };
        } else if (searchType === "Value" || searchType === "Name") {
            query.customerName = { $regex: searchValue, $options: "i" };
        }
    } else {
        // Generic "Search..." bar support (searches Name by default)
        const { search } = req.query;
        if (search) {
            query.customerName = { $regex: search, $options: "i" };
        }
    }

    // Parallel Fetch (No total count optimization for now to keep it simple, or we can add it)
    // We will fetch ALL matching sorted by date, then manually paginate in memory 
    // (This is inefficient for huge datasets but fine for <10k records, ensuring mixed sort order)

    const [individuals, corporates] = await Promise.all([
        IndividualProfile.find(query).sort({ createdAt: -1 }).lean(),
        CorporateProfile.find(query).sort({ createdAt: -1 }).lean()
    ]);

    // Combine and Sort
    const allProfiles = [
        ...individuals.map(p => ({ ...p, _type: 'individual' })),
        ...corporates.map(p => ({ ...p, _type: 'corporate' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedResults = allProfiles.slice(startIndex, endIndex);

    // Format Results
    const formattedResults = paginatedResults.map(profile => {
        if (profile._type === 'individual') {
            return formatIndividualProfileResponse(profile);
        } else {
            return formatCorporateProfileResponse(profile);
        }
    });

    res.status(200).json({
        success: true,
        count: allProfiles.length,
        totalPages: Math.ceil(allProfiles.length / limitNum),
        currentPage: pageNum,
        results: formattedResults
    });
});

// @desc    Get single profile by ID (detects type automatically)
// @route   GET /api/profiles/:id
// @access  Private
export const getProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    // Try Individual
    let profile = await IndividualProfile.findOne({ _id: id, userId, isDeleted: false });
    let type = 'individual';

    // Try Corporate if not found
    if (!profile) {
        profile = await CorporateProfile.findOne({ _id: id, userId, isDeleted: false });
        type = 'corporate';
    }

    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }

    const formattedProfile = type === 'individual'
        ? formatIndividualProfileResponse(profile)
        : formatCorporateProfileResponse(profile);

    res.status(200).json({
        success: true,
        data: formattedProfile
    });
});

// @desc    Delete profile by ID (Soft Delete)
// @route   DELETE /api/profiles/:id
// @access  Private
export const deleteProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    // Try Individual
    let profile = await IndividualProfile.findOne({ _id: id, userId, isDeleted: false });

    if (profile) {
        profile.isDeleted = true;
        profile.deletedAt = new Date();
        await profile.save();
        return res.status(200).json({ success: true, message: "Individual Profile deleted successfully" });
    }

    // Try Corporate
    profile = await CorporateProfile.findOne({ _id: id, userId, isDeleted: false });

    if (profile) {
        profile.isDeleted = true;
        profile.deletedAt = new Date();
        await profile.save();
        return res.status(200).json({ success: true, message: "Corporate Profile deleted successfully" });
    }

    res.status(404);
    throw new Error("Profile not found");
});

// @desc    Update profile by ID (Unified)
// @route   PUT /api/profiles/:id
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    // Try Individual
    let profile = await IndividualProfile.findOne({ _id: id, userId, isDeleted: false });

    if (profile) {
        // Update Individual
        Object.assign(profile, updateData);
        const updatedProfile = await profile.save();
        return res.status(200).json({
            success: true,
            message: "Individual Profile updated successfully",
            data: formatIndividualProfileResponse(updatedProfile)
        });
    }

    // Try Corporate
    profile = await CorporateProfile.findOne({ _id: id, userId, isDeleted: false });

    if (profile) {
        // Update Corporate
        Object.assign(profile, updateData);
        const updatedProfile = await profile.save();
        return res.status(200).json({
            success: true,
            message: "Corporate Profile updated successfully",
            data: formatCorporateProfileResponse(updatedProfile)
        });
    }

    res.status(404);
    throw new Error("Profile not found");
});

// @desc    Download profile by ID (Unified)
// @route   GET /api/profiles/download/:id
// @access  Private
export const downloadProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    // Try Individual
    let profile = await IndividualProfile.findOne({ _id: id, userId, isDeleted: false });
    let type = 'Individual';

    if (!profile) {
        // Try Corporate
        profile = await CorporateProfile.findOne({ _id: id, userId, isDeleted: false });
        type = 'Corporate';
    }

    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }

    const fileName = `${type}_Profile_${profile.customerName.replace(/\s+/g, '_')}_${profile._id}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    res.status(200).send(JSON.stringify(profile, null, 2));
});
