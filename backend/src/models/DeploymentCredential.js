
import mongoose from "mongoose";

const deploymentCredentialSchema = new mongoose.Schema(
    {
        deploymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Deployment",
            required: true,
            unique: true,
            immutable: true,
        },

        apiKeyHash: {
            type: String,
            required: true,
            unique: true,
            select: false,
        },

        lastRotatedAt: {
            type: Date,
            default: Date.now,
        },

        lastUsedAt: {
            type: Date,
            default: null,
        },

        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const DeploymentCredential = mongoose.model(
    "DeploymentCredential",
    deploymentCredentialSchema
);

export default DeploymentCredential;
