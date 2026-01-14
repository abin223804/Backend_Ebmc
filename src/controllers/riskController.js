import RiskAssessment from "../models/riskAssessmentModel.js";
import { calculateRisk } from "../utils/riskCalculator.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createRiskAssessment = asyncHandler(async (req, res) => {
  const {
    nationalityRisk,
    residentStatusRisk,
    birthCountryRisk,
    professionRisk,
    pepRisk
  } = req.body;

  const { overallRiskValue, riskCategory } = calculateRisk([
    nationalityRisk,
    residentStatusRisk,
    birthCountryRisk,
    professionRisk,
    pepRisk
  ]);

  const riskAssessment = await RiskAssessment.create({
    nationalityRisk,
    residentStatusRisk,
    birthCountryRisk,
    professionRisk,
    pepRisk,
    overallRiskValue,
    riskCategory
  });

  res.status(201).json({
    success: true,
    message: "Risk assessment calculated successfully",
    data: riskAssessment
  });
});
