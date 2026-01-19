import mongoose from "mongoose";

const riskManagementSchema = new mongoose.Schema(
    {
        variable: {
            type: String,
            required: true,
            enum: ["nationality", "profession", "pepCustomer", "birthCountry", "residentStatus"],
            trim: true,
        },
        value: {
            type: String,
            required: true,
            trim: true,
        },
        riskLevel: {
            type: String,
            required: true,
            enum: ["Very low", "Low", "Medium", "High", "Very high"],
        },
        riskScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Create compound index to prevent duplicate configurations
riskManagementSchema.index({ variable: 1, value: 1 }, { unique: true });

export default mongoose.model("RiskManagement", riskManagementSchema);
