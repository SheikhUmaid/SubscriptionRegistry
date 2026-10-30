
import crypto from "node:crypto";

import Deployment from "../models/Deployment.js";
import Customer from "../models/Customer.js";
import DeploymentCredential from "../models/DeploymentCredential.js";
import Subscription from "../models/Subscription.js";
import RenewalRecord from "../models/RenewalRecord.js";

export async function createDeployment(req, res) {
    let deployment;

    try {
        const {
            deploymentCode,
            customerId,
            product,
            frontendUrl,
            backendUrl,
            hostingType,
            hostingReference
        } = req.body;

        if (!deploymentCode || !customerId || !backendUrl) {
            return res.status(400).json({
                success: false,
                message: "Required deployment details are missing."
            });
        }

        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        const existingDeployment = await Deployment.findOne({
            customerId
        });

        if (existingDeployment) {
            return res.status(409).json({
                success: false,
                message: "This customer already has a deployment."
            });
        }

        // Create deployment
        deployment = await Deployment.create({
            deploymentCode,
            customerId,
            product,
            frontendUrl,
            backendUrl,
            hostingType,
            hostingReference
        });

        // Generate unique API key
        const apiKey = `zln_live_${crypto.randomBytes(32).toString("hex")}`;

        // Hash API key before storing
        const apiKeyHash = crypto
            .createHash("sha256")
            .update(apiKey)
            .digest("hex");

        // Store credential
        await DeploymentCredential.create({
            deploymentId: deployment._id,
            apiKeyHash
        });

        return res.status(201).json({
            success: true,
            message: "Deployment registered successfully.",

            data: {
                deployment,
                apiKey
            }
        });

    } catch (error) {

        // Roll back deployment if credential creation fails
        if (deployment) {
            await Deployment.findByIdAndDelete(deployment._id)
                .catch(console.error);
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Deployment code, customer or credential already exists."
            });
        }

        console.error("Create deployment error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}


export async function getDeployments(req, res) {
    try {
        const deployments = await Deployment.find()
            .populate(
                "customerId",
                "customerCode businessName contactName email phone"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: deployments.length,
            data: deployments
        });

    } catch (error) {
        console.error("Get deployments error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

export async function deleteDeployment(req, res) {
    try {
        const { id } = req.params;

        const deployment = await Deployment.findByIdAndDelete(id);

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found."
            });
        }

        // Clean up associated credentials, subscriptions, and renewals
        await DeploymentCredential.deleteMany({ deploymentId: id });
        await Subscription.deleteMany({ deploymentId: id });
        await RenewalRecord.deleteMany({ deploymentId: id });

        return res.status(200).json({
            success: true,
            message: "Deployment and associated credentials deleted successfully.",
            data: deployment
        });

    } catch (error) {
        console.error("Delete deployment error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}
