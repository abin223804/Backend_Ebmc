import mongoose from "mongoose";
import dotenv from "dotenv";
import IndividualProfile from "./src/models/individualProfileModel.js";
import CorporateProfile from "./src/models/corporateProfileModel.js";
import Transaction from "./src/models/transactionModel.js";

dotenv.config();

const testDashboardAggregation = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for testing...");

        // Seed some data if needed, or just run the aggregation
        const pendingCount = await IndividualProfile.countDocuments({ status: "PENDING" }) +
            await CorporateProfile.countDocuments({ status: "PENDING" });

        console.log(`Current Pending Count: ${pendingCount}`);

        // Since we can't easily call the API without a real JWT and server running,
        // we verify the model counts which the controller uses.

        const individualTotal = await IndividualProfile.countDocuments();
        const corporateTotal = await CorporateProfile.countDocuments();
        const transactionTotal = await Transaction.countDocuments();

        console.log(`Total Individuals: ${individualTotal}`);
        console.log(`Total Corporates: ${corporateTotal}`);
        console.log(`Total Transactions: ${transactionTotal}`);

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

testDashboardAggregation();
