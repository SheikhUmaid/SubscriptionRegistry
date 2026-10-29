
import mongoose from "mongoose";

const renewalRecordSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            immutable: true,
        },

        deploymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Deployment",
            required: true,
            immutable: true,
        },

        subscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            required: true,
            immutable: true,
        },

        type: {
            type: String,
            enum: ["initial", "renewal"],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "confirmed", "failed", "refunded"],
            default: "pending",
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["upi", "cash", "bank-transfer", "razorpay", "other"],
            default: "upi",
        },

        paymentReference: {
            type: String,
            trim: true,
            default: null,
        },

        periodStartsAt: {
            type: Date,
            required: true,
        },

        periodEndsAt: {
            type: Date,
            required: true,
        },

        recordedBy: {
            type: String,
            required: true,
            trim: true,
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

renewalRecordSchema.index({
    deploymentId: 1,
    createdAt: -1,
});

renewalRecordSchema.index(
    { paymentReference: 1 },
    {
        unique: true,
        partialFilterExpression: {
            paymentReference: { $type: "string" },
        },
    }
);

const RenewalRecord = mongoose.model(
    "RenewalRecord",
    renewalRecordSchema
);

export default RenewalRecord;
