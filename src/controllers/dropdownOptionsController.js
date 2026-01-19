import DropdownOptions from "../models/dropdownOptionsModel.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Create a new dropdown option
// @route   POST /api/dropdown-options/create
// @access  Private/Admin
export const createDropdownOption = asyncHandler(async (req, res) => {
    const { category, value, label, sortOrder } = req.body;

    if (!category || !value || !label) {
        res.status(400);
        throw new Error("Please provide category, value, and label");
    }

    // Check if option already exists
    const existingOption = await DropdownOptions.findOne({ category, value });
    if (existingOption) {
        res.status(400);
        throw new Error(`Option ${value} already exists in ${category}`);
    }

    const option = await DropdownOptions.create({
        category,
        value,
        label,
        sortOrder: sortOrder || 0,
    });

    res.status(201).json({
        success: true,
        message: "Dropdown option created successfully",
        data: option,
    });
});

// @desc    Get all dropdown options by category
// @route   GET /api/dropdown-options/:category
// @access  Public (or Private depending on your needs)
export const getDropdownOptionsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { isActive } = req.query;

    const filter = { category };
    if (isActive !== undefined) {
        filter.isActive = isActive === "true";
    }

    const options = await DropdownOptions.find(filter).sort({ sortOrder: 1, label: 1 });

    res.status(200).json({
        success: true,
        category,
        count: options.length,
        data: options,
    });
});

// @desc    Get all dropdown options (all categories)
// @route   GET /api/dropdown-options
// @access  Public (or Private)
export const getAllDropdownOptions = asyncHandler(async (req, res) => {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
        filter.isActive = isActive === "true";
    }

    const options = await DropdownOptions.find(filter).sort({ category: 1, sortOrder: 1, label: 1 });

    // Group by category
    const grouped = options.reduce((acc, option) => {
        if (!acc[option.category]) {
            acc[option.category] = [];
        }
        acc[option.category].push(option);
        return acc;
    }, {});

    res.status(200).json({
        success: true,
        data: grouped,
    });
});

// @desc    Update dropdown option
// @route   PUT /api/dropdown-options/:id
// @access  Private/Admin
export const updateDropdownOption = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { category, value, label, isActive, sortOrder } = req.body;

    const option = await DropdownOptions.findById(id);

    if (!option) {
        res.status(404);
        throw new Error("Dropdown option not found");
    }

    // Check for duplicate if category or value is being changed
    if ((category && category !== option.category) || (value && value !== option.value)) {
        const existingOption = await DropdownOptions.findOne({
            category: category || option.category,
            value: value || option.value,
            _id: { $ne: id },
        });

        if (existingOption) {
            res.status(400);
            throw new Error(`Option already exists`);
        }
    }

    if (category) option.category = category;
    if (value) option.value = value;
    if (label) option.label = label;
    if (isActive !== undefined) option.isActive = isActive;
    if (sortOrder !== undefined) option.sortOrder = sortOrder;

    const updatedOption = await option.save();

    res.status(200).json({
        success: true,
        message: "Dropdown option updated successfully",
        data: updatedOption,
    });
});

// @desc    Delete dropdown option
// @route   DELETE /api/dropdown-options/:id
// @access  Private/Admin
export const deleteDropdownOption = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const option = await DropdownOptions.findById(id);

    if (!option) {
        res.status(404);
        throw new Error("Dropdown option not found");
    }

    await option.deleteOne();

    res.status(200).json({
        success: true,
        message: "Dropdown option deleted successfully",
    });
});

// @desc    Bulk create dropdown options
// @route   POST /api/dropdown-options/bulk-create
// @access  Private/Admin
export const bulkCreateDropdownOptions = asyncHandler(async (req, res) => {
    const { category, options } = req.body;

    if (!category || !options || !Array.isArray(options)) {
        res.status(400);
        throw new Error("Please provide category and options array");
    }

    const createdOptions = [];
    const errors = [];

    for (let i = 0; i < options.length; i++) {
        const { value, label, sortOrder } = options[i];

        if (!value || !label) {
            errors.push({ index: i, error: "Missing value or label" });
            continue;
        }

        // Check if already exists
        const existing = await DropdownOptions.findOne({ category, value });
        if (existing) {
            errors.push({ index: i, value, error: "Already exists" });
            continue;
        }

        try {
            const option = await DropdownOptions.create({
                category,
                value,
                label,
                sortOrder: sortOrder || i,
            });
            createdOptions.push(option);
        } catch (error) {
            errors.push({ index: i, value, error: error.message });
        }
    }

    res.status(201).json({
        success: true,
        message: `Created ${createdOptions.length} options`,
        data: {
            created: createdOptions,
            errors: errors.length > 0 ? errors : undefined,
        },
    });
});
