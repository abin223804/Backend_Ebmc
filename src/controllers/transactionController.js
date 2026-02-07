import Transaction from "../models/transactionModel.js";
import IndividualProfile from "../models/individualProfileModel.js";
import CorporateProfile from "../models/corporateProfileModel.js";

// Create a new transaction
export const createTransaction = async (req, res) => {
    try {
        const {
            customerId,
            customerType,
            transactionDate,
            transactionTime,
            branch,
            invoiceNumber,
            invoiceAmount,
            receiptNumber,
            source,
            transactionType,
            product,
            remark,
            file,
            currency,
            exchangeRate,
            payments,
            totalAmount,
            status
        } = req.body;

        // Basic validation
        if (!customerId || !customerType || !branch || !transactionType || !product || !totalAmount) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate customer existence
        let customer;
        if (customerType === 'IndividualProfile') {
            // Try finding by ID first if it looks like an ObjectId
            if (customerId.match(/^[0-9a-fA-F]{24}$/)) {
                customer = await IndividualProfile.findById(customerId);
            }
            // Fallback to coreCustId if not found or not an ID
            if (!customer) {
                customer = await IndividualProfile.findOne({ coreCustId: customerId });
            }
        } else if (customerType === 'CorporateProfile') {
            if (customerId.match(/^[0-9a-fA-F]{24}$/)) {
                customer = await CorporateProfile.findById(customerId);
            }
            if (!customer) {
                customer = await CorporateProfile.findOne({ coreCustId: customerId });
            }
        } else {
            return res.status(400).json({ message: "Invalid customer type" });
        }

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Create transaction object
        const newTransaction = new Transaction({
            customerId: customer._id, // Use the MongoDB _id
            customerType,
            transactionDate,
            transactionTime,
            branch,
            invoiceNumber,
            invoiceAmount,
            receiptNumber,
            source,
            transactionType,
            product,
            remark,
            file,
            currency,
            exchangeRate,
            payments,
            totalAmount,
            status: status || 'Success'
        });

        const savedTransaction = await newTransaction.save();

        res.status(201).json({
            message: "Transaction created successfully",
            transaction: savedTransaction
        });

    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
