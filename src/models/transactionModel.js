import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'customerType'
        },
        customerType: {
            type: String,
            required: true,
            enum: ['IndividualProfile', 'CorporateProfile']
        },
        transactionDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        transactionTime: {
            type: String, // Storing as string "HH:mm" for simplicity based on UI
        },
        branch: {
            type: String,
            required: true
        },
        invoiceNumber: {
            type: String,
            required: true,
            trim: true
        },
        invoiceAmount: {
            type: Number,
            default: 0
        },
        receiptNumber: {
            type: String,
            trim: true
        },
        source: {
            type: String,
            enum: ['Online', 'Offline', 'Select'], // Added 'Select' as basic default if needed, or remove strict enum if dynamic
            default: 'Select'
        },
        transactionType: {
            type: String,
            required: true,
            enum: ['Deposit', 'Withdrawal']
        },
        product: {
            type: String,
            required: true
        },
        remark: {
            type: String,
            trim: true
        },
        file: {
            type: String, // URL to uploaded file
        },
        currency: {
            type: String,
            default: 'AED'
        },
        exchangeRate: {
            type: Number,
            default: 1
        },
        payments: [{
            mode: {
                type: String,
                required: true,
                enum: ['Cash', 'Card', 'Bank Transfer', 'Select']
            },
            amount: {
                type: Number,
                required: true,
                min: 0
            }
        }],
        totalAmount: {
            type: Number,
            required: true,
            default: 0
        },
        status: {
            type: String,
            required: true,
            enum: ['Success', 'Pending', 'Failed', 'Cancelled'],
            default: 'Success'
        }
    },
    { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
