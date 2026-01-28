import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        query: {
            type: String,
            required: true,
            trim: true
        },
        searchType: {
            type: String,
            enum: ["Individual", "Corporate"],
            required: true
        },
        profileId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        fullQuery: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        apiResult: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("SearchHistory", searchHistorySchema);
