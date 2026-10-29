
import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema(
    {
        deploymentCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            immutable: true,
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            unique: true,
            immutable: true,
        },

        product: {
            type: String,
            required: true,
            default: "turf-booking",
            trim: true,
        },

        frontendUrl: {
            type: String,
            trim: true,
            default: null,
        },

        backendUrl: {
            type: String,
            required: true,
            trim: true,
        },

        hostingType: {
            type: String,
            enum: ["shared-vps", "dedicated-vps", "managed-platform"],
            required: true,
            default: "shared-vps",
        },

        hostingReference: {
            type: String,
            trim: true,
            default: null,
        },

        deploymentStatus: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Deployment = mongoose.model("Deployment", deploymentSchema);

export default Deployment;
