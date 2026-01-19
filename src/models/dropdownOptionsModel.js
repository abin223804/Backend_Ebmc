import mongoose from "mongoose";

const dropdownOptionsSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            enum: ["nationality", "profession", "pepStatus", "birthCountry", "residentStatus"],
            trim: true,
        },
        value: {
            type: String,
            required: true,
            trim: true,
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Create compound index to prevent duplicate options
dropdownOptionsSchema.index({ category: 1, value: 1 }, { unique: true });

// Index for sorting
dropdownOptionsSchema.index({ category: 1, sortOrder: 1 });

export default mongoose.model("DropdownOptions", dropdownOptionsSchema);
