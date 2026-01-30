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
        amount: {
            type: Number,
            required: true,
            default: 0
        },
        type: {
            type: String,
            required: true,
            enum: ['Onboard', 'Transaction'],
            default: 'Transaction'
        },
        status: {
            type: String,
            required: true,
            enum: ['Success', 'Pending', 'Failed'],
            default: 'Success'
        },
        transactionDate: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
