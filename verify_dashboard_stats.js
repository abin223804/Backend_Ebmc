import mongoose from 'mongoose';
import dotenv from 'dotenv';
import IndividualProfile from './src/models/individualProfileModel.js';
import CorporateProfile from './src/models/corporateProfileModel.js';
import Transaction from './src/models/transactionModel.js';
import { getDashboardStats } from './src/controllers/dashboardController.js';

dotenv.config();

const runVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const req = {};
        const res = {
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.data = data;
                return this;
            }
        };

        await getDashboardStats(req, res);

        console.log("Dashboard Stats Response Status:", res.statusCode);
        const stats = res.data.data;

        console.log("\n--- Verification Results ---");

        // 1. Risk Distribution Donut
        console.log("Risk Distribution Donut:", JSON.stringify(stats.riskDistributionDonut));
        if (stats.riskDistributionDonut.lowPercentage + stats.riskDistributionDonut.highPercentage === 100 || (stats.riskDistributionDonut.lowPercentage === 0 && stats.riskDistributionDonut.highPercentage === 0)) {
            console.log("✅ Risk distribution percentages sum to 100%.");
        }

        // 2. Ongoing Screening
        console.log("Ongoing Screening:", JSON.stringify(stats.ongoingScreening));
        if (stats.ongoingScreening && stats.ongoingScreening.nameScreened) {
            console.log("✅ Ongoing screening data is present.");
        }

        // 3. PEP Customers
        console.log("PEP Customers Count:", stats.pepCustomers);
        if (typeof stats.pepCustomers === 'number') {
            console.log("✅ PEP customers count is a number.");
        }

        // 4. DPMSR Status
        console.log("DPMSR Status:", JSON.stringify(stats.dpmsrStatus));
        if (stats.dpmsrStatus.hasOwnProperty('pending') && stats.dpmsrStatus.hasOwnProperty('finishedThisYear')) {
            console.log("✅ DPMSR status counts are present.");
        }

        // 3. Suppliers Summary
        console.log("Suppliers Summary:", JSON.stringify(stats.suppliersSummary));
        if (stats.suppliersSummary.total === (stats.suppliersSummary.overseas + stats.suppliersSummary.resident)) {
            console.log("✅ Suppliers summary counts are consistent.");
        }

        // 4. Inactive Customers
        console.log("Inactive Customers Count:", stats.inactiveCustomers);
        if (typeof stats.inactiveCustomers === 'number') {
            console.log("✅ Inactive customers count is a number.");
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
};

runVerification();
