
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        deploymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Deployment",
            required: true,
            unique: true,
            immutable: true,
        },

        planCode: {
            type: String,
            required: true,
            default: "monthly",
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "expired", "suspended"],
            required: true,
            default: "active",
        },

        startsAt: {
            type: Date,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            required: true,
            default: "INR",
            uppercase: true,
            minlength: 3,
            maxlength: 3,
        },
    },
    {
        timestamps: true,
    }
);

subscriptionSchema.pre("validate", function () {
    if (
        this.startsAt &&
        this.expiresAt &&
        this.expiresAt <= this.startsAt
    ) {
        this.invalidate(
            "expiresAt",
            "Expiry date must be after the start date."
        );
    }
});

const Subscription = mongoose.model(
    "Subscription",
    subscriptionSchema
);

export default Subscription;
