import Transaction from "../models/transactionModel.js";
import IndividualProfile from "../models/individualProfileModel.js";
import CorporateProfile from "../models/corporateProfileModel.js";

// Create a new transaction
// export const createTransaction = async (req, res) => {
//     try {
//         let {
//             customerId,
//             customerType,
//             transactionDate,
//             transactionTime,
//             branch,
//             invoiceNumber,
//             invoiceAmount,
//             receiptNumber,
//             source,
//             transactionType,
//             product,
//             remark,
//             currency,
//             exchangeRate,
//             payments,
//             totalAmount,
//             status
//         } = req.body;

//         // Handle file upload (priority to uploaded file, fallback to body url if any)
//         const file = req.file ? req.file.path : req.body.file;

//         // Parse payments if it's a string (common in multipart/form-data)
//         if (typeof payments === 'string') {
//             try {
//                 payments = JSON.parse(payments);
//             } catch (error) {
//                 return res.status(400).json({ message: "Invalid payments format. Expected JSON string." });
//             }
//         }

//         // Basic validation
//         if (!customerId || !customerType || !branch || !transactionType || !product || !totalAmount) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         console.log("customerId", customerId);


//         // Validate customer existence
//         let customer;
//         if (customerType === 'IndividualProfile') {
//             // Try finding by ID first if it looks like an ObjectId
//             if (customerId.match(/^[0-9a-fA-F]{24}$/)) {
//                 customer = await IndividualProfile.findById(customerId);
//             }
//             // Fallback to coreCustId if not found or not an ID
//             if (!customer) {
//                 customer = await IndividualProfile.findOne({ coreCustId: customerId });
//             }
//         } else if (customerType === 'CorporateProfile') {
//             if (customerId.match(/^[0-9a-fA-F]{24}$/)) {
//                 customer = await CorporateProfile.findById(customerId);
//             }
//             if (!customer) {
//                 customer = await CorporateProfile.findOne({ coreCustId: customerId });
//             }
//         } else {
//             return res.status(400).json({ message: "Invalid customer type" });
//         }

//         if (!customer) {
//             return res.status(404).json({ message: "Customer not found" });
//         }

//         console.log("customer", customer);


//         // Create transaction object
//         const newTransaction = new Transaction({
//             customerId: customer._id, // Use the MongoDB _id
//             customerType,
//             transactionDate,
//             transactionTime,
//             branch,
//             invoiceNumber,
//             invoiceAmount,
//             receiptNumber,
//             source,
//             transactionType,
//             product,
//             remark,
//             file,
//             currency,
//             exchangeRate,
//             payments,
//             totalAmount,
//             status: status || 'Success'
//         });

//         const savedTransaction = await newTransaction.save();

//         res.status(201).json({
//             message: "Transaction created successfully",
//             transaction: savedTransaction
//         });

//     } catch (error) {
//         console.error("Error creating transaction:", error);
//         res.status(500).json({ message: "Internal server error", error: error.message });
//     }
// };

export const createTransaction = async (req, res) => {
  try {
    let {
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
      currency,
      exchangeRate,
      payments,
      totalAmount,
      status
    } = req.body;

    // Handle file upload
    const file = req.file ? req.file.path : req.body.file;

    // Parse payments (multipart safety)
    if (typeof payments === "string") {
      try {
        payments = JSON.parse(payments);
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid payments format. Expected JSON string." });
      }
    }

    // Basic validation
    if (!customerId || !branch || !transactionType || !product || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(customerId);

    let customer = null;
    let resolvedCustomerType = customerType;

    const findIndividual = async () => {
      if (isObjectId) {
        return IndividualProfile.findById(customerId);
      }
      return IndividualProfile.findOne({ coreCustId: customerId });
    };

    const findCorporate = async () => {
      if (isObjectId) {
        return CorporateProfile.findById(customerId);
      }
      return CorporateProfile.findOne({ coreCustId: customerId });
    };

    // 1️⃣ Try provided customerType first (if any)
    if (customerType === "IndividualProfile") {
      customer = await findIndividual();
      if (!customer) {
        customer = await findCorporate();
        resolvedCustomerType = customer ? "CorporateProfile" : customerType;
      }
    } else if (customerType === "CorporateProfile") {
      customer = await findCorporate();
      if (!customer) {
        customer = await findIndividual();
        resolvedCustomerType = customer ? "IndividualProfile" : customerType;
      }
    } else {
      // 2️⃣ If customerType missing or invalid → auto-detect
      customer = await findIndividual();
      if (customer) {
        resolvedCustomerType = "IndividualProfile";
      } else {
        customer = await findCorporate();
        resolvedCustomerType = customer ? "CorporateProfile" : null;
      }
    }

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
        customerId,
        attemptedType: customerType
      });
    }

    // Create transaction
    const newTransaction = new Transaction({
      customerId: customer._id,
      customerType: resolvedCustomerType,
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
      status: status || "Success"
    });

    const savedTransaction = await newTransaction.save();

    res.status(201).json({
      message: "Transaction created successfully",
      customerType: resolvedCustomerType,
      transaction: savedTransaction
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};



// Cancel a transaction
// export const cancelTransaction = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const transaction = await Transaction.findById(id);

//     if (!transaction) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     if (transaction.status === 'Cancelled') {
//       return res.status(400).json({ message: "Transaction is already cancelled" });
//     }

//     transaction.status = 'Cancelled';
//     await transaction.save();

//     res.status(200).json({
//       message: "Transaction cancelled successfully",
//       transaction
//     });

//   } catch (error) {
//     console.error("Error cancelling transaction:", error);
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

export const cancelTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const transaction = await Transaction.findOne({ _id: transactionId });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Security Check: Verify ownership
    const userId = req.user.userId;
    const [individualProfiles, corporateProfiles] = await Promise.all([
      IndividualProfile.find({ userId }).select('_id'),
      CorporateProfile.find({ userId }).select('_id')
    ]);

    const userProfileIds = [
      ...individualProfiles.map(p => p._id.toString()),
      ...corporateProfiles.map(p => p._id.toString())
    ];

    if (!userProfileIds.includes(transaction.customerId.toString())) {
      // Return 404 to hide existence or 403 for forbidden. 404 matches "not found for this user" logic.
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status === "Cancelled") {
      return res.status(400).json({
        message: "Transaction is already cancelled"
      });
    }

    transaction.status = "Cancelled";
    await transaction.save();

    return res.status(200).json({
      message: "Transaction cancelled successfully",
      transaction
    });

  } catch (error) {
    console.error("Error cancelling transaction:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};


// Get transactions with filtering and pagination
// export const getTransactions = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       searchType,
//       searchValue,
//       fromDate,
//       toDate,
//       branch,
//       transactionType,
//       paymentMode,
//       status,
//     } = req.query;

//     const query = { isDeleted: false };

//     // ---------------------------------------------------------
//     // 1. FILTER BY LOGGED-IN USER
//     // ---------------------------------------------------------
//     if (!req.user || !req.user.userId) {
//       return res.status(401).json({ message: "User not authenticated" });
//     }

//     const userId = req.user.userId;

//     // Find profiles linked to this user
//     const [individualProfiles, corporateProfiles] = await Promise.all([
//       IndividualProfile.find({ userId }).select('_id'),
//       CorporateProfile.find({ userId }).select('_id')
//     ]);

//     const userProfileIds = [
//       ...individualProfiles.map(p => p._id),
//       ...corporateProfiles.map(p => p._id)
//     ];

//     // If user has no profiles, they have no transactions (or at least none we show)
//     if (userProfileIds.length === 0) {
//       return res.status(200).json({
//         data: [],
//         pagination: {
//           total: 0,
//           page: parseInt(page),
//           limit: parseInt(limit),
//           pages: 0
//         }
//       });
//     }

//     // Apply the user constraint
//     query.customerId = { $in: userProfileIds };

//     // ---------------------------------------------------------
//     // Optional: Search within User's Transactions
//     // ---------------------------------------------------------
//     if (searchValue) {
//       // Simple search logic considering we already filtered by userProfileIds
//       const buildProfileQuery = () => {
//         const profileQuery = { _id: { $in: userProfileIds } };
//         if (searchType === "Name") {
//           profileQuery.customerName = { $regex: searchValue, $options: "i" };
//         } else if (searchType === "Core customer number") {
//           profileQuery.coreCustId = { $regex: searchValue, $options: "i" };
//         } else if (searchType === "Mobile") {
//           profileQuery.mobile = { $regex: searchValue, $options: "i" };
//         }
//         return profileQuery;
//       };

//       const [indResults, corpResults] = await Promise.all([
//         IndividualProfile.find(buildProfileQuery()).select("_id"),
//         CorporateProfile.find(buildProfileQuery()).select("_id")
//       ]);

//       const searchMatchIds = [...indResults.map(p => p._id), ...corpResults.map(p => p._id)];

//       if (searchMatchIds.length === 0) {
//         query.customerId = null; // Force empty
//       } else {
//         query.customerId = { $in: searchMatchIds };
//       }
//     }

//     // 2. Other Transaction Filters

//     // Date Range
//     if (fromDate || toDate) {
//       query.transactionDate = {};
//       if (fromDate) {
//         query.transactionDate.$gte = new Date(fromDate);
//       }
//       if (toDate) {
//         const endQueryParams = new Date(toDate);
//         endQueryParams.setHours(23, 59, 59, 999);
//         query.transactionDate.$lte = endQueryParams;
//       }
//     }

//     // Branch
//     if (branch && branch !== 'Select') {
//       query.branch = branch;
//     }

//     // Transaction Type
//     if (transactionType && transactionType !== 'Select') {
//       query.transactionType = transactionType;
//     }

//     // Payment Mode
//     if (paymentMode && paymentMode !== 'Select') {
//       query["payments.mode"] = paymentMode;
//     }

//     // Status
//     if (status && status !== 'Select') {
//       query.status = status;
//     }

//     const skip = (page - 1) * limit;

//     const transactions = await Transaction.find(query)
//       .populate(
//         "customerId",
//         "customerName name fullName profileImage mobile email coreCustId"
//       )
//       .sort({ transactionDate: -1, createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     const formattedTransactions = transactions.map((t) => ({
//       ...t,
//       transactionId: t._id,
//       id: t._id,
//       // Normalize customer name if needed, though 'customerId' population should give the object
//       customerName: t.customerId?.customerName || t.customerId?.name || "Unknown",
//       coreCustId: t.customerId?.coreCustId || "N/A"
//     }));

//     const total = await Transaction.countDocuments(query);

//     res.status(200).json({
//       data: formattedTransactions,
//       pagination: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.userId;

    // Find profiles linked to this user
    const [individualProfiles, corporateProfiles] = await Promise.all([
      IndividualProfile.find({ userId }).select("_id"),
      CorporateProfile.find({ userId }).select("_id")
    ]);

    const userProfileIds = [
      ...individualProfiles.map((p) => p._id),
      ...corporateProfiles.map((p) => p._id)
    ];

    // If user has no profiles, they have no transactions
    if (userProfileIds.length === 0) {
      return res.status(200).json({
        data: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0
        }
      });
    }

    const query = {
      isDeleted: false,
      customerId: { $in: userProfileIds }
    };

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(query)
      .populate(
        "customerId",
        "customerName name fullName profileImage mobile email coreCustId"
      )
      .sort({ transactionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      transactionId: t._id,
      id: t._id,
      customerName:
        t.customerId?.customerName || t.customerId?.name || "Unknown",
      coreCustId: t.customerId?.coreCustId || "N/A"
    }));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      data: formattedTransactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Soft delete a transaction
// export const deleteTransaction = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const transaction = await Transaction.findById(id);

//     if (!transaction) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     if (transaction.isDeleted) {
//       return res.status(400).json({ message: "Transaction is already deleted" });
//     }

//     transaction.isDeleted = true;
//     transaction.deletedAt = new Date();
//     await transaction.save();

//     res.status(200).json({
//       message: "Transaction deleted successfully",
//       transaction
//     });

//   } catch (error) {
//     console.error("Error deleting transaction:", error);
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

export const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const transaction = await Transaction.findOne({ _id: transactionId });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Security Check: Verify ownership
    const userId = req.user.userId;
    const [individualProfiles, corporateProfiles] = await Promise.all([
      IndividualProfile.find({ userId }).select('_id'),
      CorporateProfile.find({ userId }).select('_id')
    ]);

    const userProfileIds = [
      ...individualProfiles.map(p => p._id.toString()),
      ...corporateProfiles.map(p => p._id.toString())
    ];

    if (!userProfileIds.includes(transaction.customerId.toString())) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.isDeleted) {
      return res.status(400).json({
        message: "Transaction is already deleted"
      });
    }

    transaction.isDeleted = true;
    transaction.deletedAt = new Date();
    await transaction.save();

    return res.status(200).json({
      message: "Transaction deleted successfully",
      transaction
    });

  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
