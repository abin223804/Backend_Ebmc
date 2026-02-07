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

// Cancel a transaction
export const cancelTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.status === 'Cancelled') {
            return res.status(400).json({ message: "Transaction is already cancelled" });
        }

        transaction.status = 'Cancelled';
        await transaction.save();

        res.status(200).json({
            message: "Transaction cancelled successfully",
            transaction
        });

    } catch (error) {
        console.error("Error cancelling transaction:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get transactions with filtering and pagination
export const getTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            search,
            displayType // 'all', 'today', 'month', 'year' - optional handy filter
        } = req.query;

        const query = {};

        // Filter by Status
        if (status) {
            query.status = status;
        }

        // Search by Invoice or Receipt Number
        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: "i" } },
                { receiptNumber: { $regex: search, $options: "i" } },
                // Note: Searching by customer name would require aggregation or post-processing due to dynamic ref
            ];
        }

        const skip = (page - 1) * limit;

        const transactions = await Transaction.find(query)
            .populate('customerId', 'fullName name profileImage mobile email coreCustId') // Populate basic customer info
            .sort({ transactionDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            data: transactions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
