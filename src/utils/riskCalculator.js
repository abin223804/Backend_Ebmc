export const calculateRisk = (values = []) => {
  const total = values.reduce((sum, val) => sum + val, 0);
  const average = Number((total / values.length).toFixed(2));

  let category = "Low";
  if (average > 2) category = "High";
  else if (average > 1) category = "Medium";

  return {
    overallRiskValue: average,
    riskCategory: category
  };
};
