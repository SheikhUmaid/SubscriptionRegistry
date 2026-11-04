import mongoose from "mongoose";

// A venue's "I've paid, please switch/renew my plan" request, sent from the
// TurfOS admin panel. Zinth Labs verifies the payment and approves or rejects.
const planRequestSchema = new mongoose.Schema(
    {
        deploymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Deployment",
            required: true,
            immutable: true,
        },

        subscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            default: null,
        },

        currentPlanCode: {
            type: String,
            default: null,
        },

        requestedPlanCode: {
            type: String,
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
        },

        // UPI transaction ID / UTR the venue entered after paying.
        paymentReference: {
            type: String,
            trim: true,
            default: "",
            maxlength: 100,
        },

        note: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            required: true,
        },

        resolvedAt: {
            type: Date,
            default: null,
        },

        resolutionNote: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

planRequestSchema.index({ deploymentId: 1, status: 1 });

const PlanRequest = mongoose.model("PlanRequest", planRequestSchema);

export default PlanRequest;
