import IndividualProfile from "../models/individualProfileModel.js";
import CorporateProfile from "../models/corporateProfileModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { formatIndividualProfileResponse } from "./individualProfileController.js";
import { formatCorporateProfileResponse } from "./corporateProfileController.js";

// @desc    Global search across all profiles by name
// @route   POST /api/search/unified
// @access  Private
export const unifiedSearch = asyncHandler(async (req, res) => {
    const { customerName, category = "all" } = { ...req.query, ...req.body };
    const query = { isDeleted: false };

    // Filter by the logged-in user ID for security
    if (req.user && req.user.userId) {
        query.userId = req.user.userId;
    }

    if (customerName) {
        query.customerName = { $regex: customerName, $options: "i" };
    }

    let individuals = [];
    let corporates = [];

    // Category-based execution
    const searchTasks = [];

    if (category === "all" || category === "individual") {
        searchTasks.push(IndividualProfile.find(query).sort({ createdAt: -1 }));
    } else {
        searchTasks.push(Promise.resolve([]));
    }

    if (category === "all" || category === "corporate") {
        searchTasks.push(CorporateProfile.find(query).sort({ createdAt: -1 }));
    } else {
        searchTasks.push(Promise.resolve([]));
    }

    // Execute parallel searches
    [individuals, corporates] = await Promise.all(searchTasks);

    // Format results
    const results = {};
    const count = { total: 0 };

    if (category === "all" || category === "individual") {
        results.individuals = individuals.map(p => formatIndividualProfileResponse(p));
        count.individuals = individuals.length;
        count.total += individuals.length;
    }

    if (category === "all" || category === "corporate") {
        results.corporates = corporates.map(p => formatCorporateProfileResponse(p));
        count.corporates = corporates.length;
        count.total += corporates.length;
    }

    res.status(200).json({
        success: true,
        count,
        results
    });
});
