import SearchHistory from "../models/searchHistoryModel.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get search history for the logged-in user
// @route   GET /api/search-history
// @access  Private
export const getMySearchHistory = asyncHandler(async (req, res) => {
    const history = await SearchHistory.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to last 50 entries

    res.status(200).json({
        success: true,
        data: history,
    });
});

// @desc    Clear search history for the logged-in user
// @route   DELETE /api/search-history
// @access  Private
export const clearMySearchHistory = asyncHandler(async (req, res) => {
    await SearchHistory.deleteMany({ userId: req.user.userId });

    res.status(200).json({
        success: true,
        message: "Search history cleared successfully",
    });
});

// Helper to save search history (not an endpoint)
export const logSearchHistory = async (userId, query, searchType, profileId, fullQuery, apiResult) => {
    try {
        await SearchHistory.create({
            userId,
            query,
            searchType,
            profileId,
            fullQuery,
            apiResult
        });
    } catch (error) {
        console.error("Error logging search history:", error);
    }
};
