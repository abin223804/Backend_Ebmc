import RiskManagement from "../models/riskManagementModel.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Create a new risk configuration
// @route   POST /api/risk-management/create
// @access  Private/Admin
export const createRiskConfiguration = asyncHandler(async (req, res) => {
    const { variable, value, riskLevel, riskScore } = req.body;

    // Validate required fields
    if (!variable || !value || !riskLevel || riskScore === undefined) {
        res.status(400);
        throw new Error("Please provide all required fields: variable, value, riskLevel, riskScore");
    }

    // Check if configuration already exists
    const existingConfig = await RiskManagement.findOne({ variable, value });
    if (existingConfig) {
        res.status(400);
        throw new Error(`Risk configuration for ${variable}: ${value} already exists`);
    }

    // Create new configuration
    const riskConfig = await RiskManagement.create({
        variable,
        value,
        riskLevel,
        riskScore,
    });

    res.status(201).json({
        success: true,
        message: "Risk configuration created successfully",
        data: riskConfig,
    });
});

// @desc    Update risk configuration
// @route   PUT /api/risk-management/:id
// @access  Private/Admin
export const updateRiskConfiguration = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { variable, value, riskLevel, riskScore, isActive } = req.body;

    const riskConfig = await RiskManagement.findById(id);

    if (!riskConfig) {
        res.status(404);
        throw new Error("Risk configuration not found");
    }

    // Check for duplicate if variable or value is being changed
    if ((variable && variable !== riskConfig.variable) || (value && value !== riskConfig.value)) {
        const existingConfig = await RiskManagement.findOne({
            variable: variable || riskConfig.variable,
            value: value || riskConfig.value,
            _id: { $ne: id },
        });

        if (existingConfig) {
            res.status(400);
            throw new Error(`Risk configuration for ${variable || riskConfig.variable}: ${value || riskConfig.value} already exists`);
        }
    }

    // Update fields
    if (variable) riskConfig.variable = variable;
    if (value) riskConfig.value = value;
    if (riskLevel) riskConfig.riskLevel = riskLevel;
    if (riskScore !== undefined) riskConfig.riskScore = riskScore;
    if (isActive !== undefined) riskConfig.isActive = isActive;

    const updatedConfig = await riskConfig.save();

    res.status(200).json({
        success: true,
        message: "Risk configuration updated successfully",
        data: updatedConfig,
    });
});

// @desc    Get all risk configurations
// @route   GET /api/risk-management
// @access  Private/Admin
export const getAllRiskConfigurations = asyncHandler(async (req, res) => {
    const { variable, isActive } = req.query;

    // Build filter
    const filter = {};
    if (variable) filter.variable = variable;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const riskConfigs = await RiskManagement.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: riskConfigs.length,
        data: riskConfigs,
    });
});

// @desc    Get single risk configuration
// @route   GET /api/risk-management/:id
// @access  Private/Admin
export const getRiskConfigurationById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const riskConfig = await RiskManagement.findById(id);

    if (!riskConfig) {
        res.status(404);
        throw new Error("Risk configuration not found");
    }

    res.status(200).json({
        success: true,
        data: riskConfig,
    });
});

// @desc    Delete risk configuration
// @route   DELETE /api/risk-management/:id
// @access  Private/Admin
export const deleteRiskConfiguration = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const riskConfig = await RiskManagement.findById(id);

    if (!riskConfig) {
        res.status(404);
        throw new Error("Risk configuration not found");
    }

    await riskConfig.deleteOne();

    res.status(200).json({
        success: true,
        message: "Risk configuration deleted successfully",
    });
});
