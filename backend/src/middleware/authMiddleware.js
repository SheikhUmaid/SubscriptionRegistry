
import crypto from "node:crypto";
import DeploymentCredential from "../models/DeploymentCredential.js";

export async function authenticateDeployment(req, res, next) {
    try {
        const apiKey = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : null;

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: "Deployment API key is required."
            });
        }

        const apiKeyHash = crypto
            .createHash("sha256")
            .update(apiKey)
            .digest("hex");

        const credential = await DeploymentCredential
            .findOne({ apiKeyHash })
            .select("+apiKeyHash")
            .populate("deploymentId");

        if (!credential || credential.revokedAt) {
            return res.status(401).json({
                success: false,
                message: "Invalid or revoked deployment credentials."
            });
        }

        if (!credential.deploymentId) {
            return res.status(401).json({
                success: false,
                message: "Deployment not found."
            });
        }

        if (credential.deploymentId.deploymentStatus !== "active") {
            return res.status(403).json({
                success: false,
                code: "DEPLOYMENT_SUSPENDED",
                message: "This deployment is inactive or suspended."
            });
        }

        credential.lastUsedAt = new Date();
        await credential.save();

        req.deployment = credential.deploymentId;
        req.deploymentId = credential.deploymentId._id;

        next();

    } catch (error) {
        console.error("Deployment authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Registry authentication failed."
        });
    }
}
