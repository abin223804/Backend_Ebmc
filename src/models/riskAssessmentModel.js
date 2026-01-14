import mongoose from "mongoose";

const riskAssessmentSchema = new mongoose.Schema(
  {
    nationalityRisk: { type: Number, required: true },
    residentStatusRisk: { type: Number, required: true },
    birthCountryRisk: { type: Number, required: true },
    professionRisk: { type: Number, required: true },
    pepRisk: { type: Number, required: true },

    overallRiskValue: Number,
    riskCategory: {
      type: String,
      enum: ["Low", "Medium", "High"]
    }
  },
  { timestamps: true }
);

export default mongoose.model("RiskAssessment", riskAssessmentSchema);
