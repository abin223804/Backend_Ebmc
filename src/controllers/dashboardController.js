import IndividualProfile from "../models/individualProfileModel.js";
import CorporateProfile from "../models/corporateProfileModel.js";
import Transaction from "../models/transactionModel.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get all dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = now.getFullYear();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfYear = new Date(currentYear, 0, 1);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    // 1. Summary Cards
    // Pending Alerts (Profiles with PENDING status)
    const pendingIndividual = await IndividualProfile.countDocuments({ status: "PENDING" });
    const pendingCorporate = await CorporateProfile.countDocuments({ status: "PENDING" });

    // Screening Matches
    const individualMatchesTrue = await IndividualProfile.countDocuments({ "apiResult.event": "verification.accepted" });
    const corporateMatchesTrue = await CorporateProfile.countDocuments({ "apiResult.status": "accepted" });

    const individualMatchesFalse = await IndividualProfile.countDocuments({ "apiResult.event": "verification.declined" });
    const corporateMatchesFalse = await CorporateProfile.countDocuments({ "apiResult.status": "declined" });

    // ID Expiry (Including Corporate Trade License)
    const individualExpired = await IndividualProfile.countDocuments({
        "idDetails.expiryDate": { $lt: now }
    });
    const individualExpiringSoon = await IndividualProfile.countDocuments({
        "idDetails.expiryDate": { $gte: now, $lte: thirtyDaysFromNow }
    });

    const corporateExpired = await CorporateProfile.countDocuments({
        $or: [
            { "tradeLicenseExpiryDate": { $lt: now } },
            { "ubos.emiratesIdExpiryDate": { $lt: now } }
        ]
    });
    const corporateExpiringSoon = await CorporateProfile.countDocuments({
        $or: [
            { "tradeLicenseExpiryDate": { $gte: now, $lte: thirtyDaysFromNow } },
            { "ubos.emiratesIdExpiryDate": { $gte: now, $lte: thirtyDaysFromNow } }
        ]
    });

    // 2. Monitoring Table
    const screenedToday = await IndividualProfile.countDocuments({ createdAt: { $gte: startOfToday } }) +
        await CorporateProfile.countDocuments({ createdAt: { $gte: startOfToday } });
    const individualTotal = await IndividualProfile.countDocuments();
    const corporateTotal = await CorporateProfile.countDocuments();
    const screenedTotal = individualTotal + corporateTotal;

    // 3. Risk Analytics
    // Customers Risk (Individuals)
    const customerRisk = {
        low: await IndividualProfile.countDocuments({ matchScore: { $lt: 40 } }),
        medium: await IndividualProfile.countDocuments({ matchScore: { $gte: 40, $lt: 80 } }),
        high: await IndividualProfile.countDocuments({ matchScore: { $gte: 80 } })
    };

    // Suppliers Risk (Corporate)
    const supplierRisk = {
        low: await CorporateProfile.countDocuments({ "apiResult.status": { $ne: "declined" }, status: "APPROVED" }),
        medium: await CorporateProfile.countDocuments({ status: { $in: ["PENDING", "CHECK_REQUIRED"] } }),
        high: await CorporateProfile.countDocuments({ "apiResult.status": "declined" })
    };

    // Helper for monthly aggregation
    const aggregateMonthly = async (Model, dateField, extraMatch = {}) => {
        return await Model.aggregate([
            {
                $match: {
                    [dateField]: {
                        $gte: new Date(currentYear, 0, 1),
                        $lte: new Date(currentYear, 11, 31)
                    },
                    ...extraMatch
                }
            },
            {
                $group: {
                    _id: { $month: `$${dateField}` },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
    };

    // 4. Ongoing Screening (Matches Table logic)
    const yesterday = new Date(startOfToday);
    yesterday.setDate(yesterday.getDate() - 1);

    const matchesToday = await IndividualProfile.countDocuments({
        createdAt: { $gte: startOfToday },
        matchScore: { $gte: 80 }
    }) + await CorporateProfile.countDocuments({
        createdAt: { $gte: startOfToday },
        "apiResult.status": "declined"
    });

    // 5. PEP Customers Count
    const pepIndividuals = await IndividualProfile.countDocuments({ pepStatus: "YES" });
    const pepCorporates = await CorporateProfile.countDocuments({
        $or: [
            { "ubos.isPep": "YES" },
            { "shareholders.isPep": "YES" }
        ]
    });

    // 6. Total Customers Breakdown (Donut chart)
    const totalIndividuals = await IndividualProfile.countDocuments();
    const totalCorporates = await CorporateProfile.countDocuments();
    const totalCustomers = totalIndividuals + totalCorporates;

    const customerTypeBreakdown = {
        individuals: totalIndividuals,
        corporates: totalCorporates,
        individualPercentage: totalCustomers > 0 ? Math.round((totalIndividuals / totalCustomers) * 100) : 0,
        corporatePercentage: totalCustomers > 0 ? Math.round((totalCorporates / totalCustomers) * 100) : 0
    };

    // Helper to map monthly counts to a full 12-month array
    const mapToMonths = (data) => {
        const result = new Array(12).fill(0);
        data.forEach(item => {
            result[item._id - 1] = item.count;
        });
        return result;
    };

    // 7. Risk Distribution (Overall - for specific donut chart)
    const totalHighRisk = await IndividualProfile.countDocuments({ matchScore: { $gte: 80 } }) +
        await CorporateProfile.countDocuments({ "apiResult.status": "declined" });
    const totalLowRisk = screenedTotal - totalHighRisk;

    const riskDistribution = {
        low: totalLowRisk,
        high: totalHighRisk,
        lowPercentage: screenedTotal > 0 ? Math.round((totalLowRisk / screenedTotal) * 100) : 0,
        highPercentage: screenedTotal > 0 ? Math.round((totalHighRisk / screenedTotal) * 100) : 0
    };

    // 8. DPMSR Status
    const dpmsrPending = await CorporateProfile.countDocuments({ customerType: 'DPMSR', status: 'PENDING' });
    const dpmsrFinished = await CorporateProfile.countDocuments({
        customerType: 'DPMSR',
        status: 'APPROVED',
        updatedAt: { $gte: startOfYear }
    });

    // 9. Suppliers residency Summary
    const totalSuppliers = await CorporateProfile.countDocuments({ customerType: 'Supplier' });
    const residentSuppliers = await CorporateProfile.countDocuments({ customerType: 'Supplier', country: 'United Arab Emirates' });
    const overseasSuppliers = totalSuppliers - residentSuppliers;

    // 10. Inactive Customers (Profiles with no transactions in 6 months)
    const activeCustomerIds = await Transaction.distinct('customerId', { transactionDate: { $gte: sixMonthsAgo } });
    const inactiveCustomers = await IndividualProfile.countDocuments({ _id: { $nin: activeCustomerIds } }) +
        await CorporateProfile.countDocuments({ _id: { $nin: activeCustomerIds } });

    // 11. Monthly charts (already mostly handled, refining names)
    const individualOnboard = await aggregateMonthly(IndividualProfile, "createdAt");
    const corporateOnboard = await aggregateMonthly(CorporateProfile, "createdAt");
    const customerTransactions = await aggregateMonthly(Transaction, "transactionDate", { customerType: 'IndividualProfile' });
    const supplierTransactions = await aggregateMonthly(Transaction, "transactionDate", { customerType: 'CorporateProfile' });

    // 8. Build Response
    res.status(200).json({
        success: true,
        data: {
            summary: {
                pendingAlerts: pendingIndividual + pendingCorporate,
                screeningMatchesTrue: individualMatchesTrue + corporateMatchesTrue,
                screeningMatchesFalse: individualMatchesFalse + corporateMatchesFalse,
                idExpiry: {
                    alreadyExpired: individualExpired + corporateExpired,
                    within30Days: individualExpiringSoon + corporateExpiringSoon
                }
            },
            ongoingScreening: {
                totalCustomers: screenedTotal,
                nameScreened: {
                    today: screenedToday,
                    total: screenedTotal
                },
                matches: {
                    today: matchesToday,
                    total: individualMatchesTrue + corporateMatchesTrue
                },
                pendingToRelease: {
                    today: 0, // Placeholder if no daily tracking
                    total: pendingIndividual + pendingCorporate
                }
            },
            riskAnalytics: {
                customers: customerRisk,
                suppliers: supplierRisk
            },
            totalCustomersDonut: customerTypeBreakdown,
            riskDistributionDonut: riskDistribution,
            dpmsrStatus: {
                pending: dpmsrPending,
                finishedThisYear: dpmsrFinished
            },
            pepCustomers: pepIndividuals + pepCorporates,
            suppliersSummary: {
                total: totalSuppliers,
                overseas: overseasSuppliers,
                resident: residentSuppliers
            },
            inactiveCustomers,
            charts: {
                labels: months,
                datasets: {
                    customerOnboard: mapToMonths(individualOnboard),
                    supplierOnboard: mapToMonths(corporateOnboard),
                    customerTransaction: mapToMonths(customerTransactions),
                    supplierTransaction: mapToMonths(supplierTransactions)
                }
            },
            totalCustomersCount: totalCustomers
        }
    });
});
