
import Customer from "../models/Customer.js";
import Deployment from "../models/Deployment.js";
import DeploymentCredential from "../models/DeploymentCredential.js";
import Subscription from "../models/Subscription.js";
import RenewalRecord from "../models/RenewalRecord.js";

export async function createCustomer(req, res) {
    try {
        const {
            customerCode,
            businessName,
            contactName,
            email,
            phone
        } = req.body;

        if (!customerCode || !businessName || !contactName || !phone) {
            return res.status(400).json({
                success: false,
                message: "Required customer details are missing."
            });
        }

        const customer = await Customer.create({
            customerCode,
            businessName,
            contactName,
            email,
            phone
        });

        return res.status(201).json({
            success: true,
            message: "Customer created successfully.",
            data: customer
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Customer code already exists."
            });
        }

        console.error("Create customer error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}


export async function getCustomers(req, res) {
    try {
        const customers = await Customer.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });

    } catch (error) {
        console.error("Get customers error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

export async function deleteCustomer(req, res) {
    try {
        const { id } = req.params;

        const customer = await Customer.findByIdAndDelete(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        // Clean up associated deployments, credentials, subscriptions, and renewals
        const deployments = await Deployment.find({ customerId: id });
        for (const dep of deployments) {
            await DeploymentCredential.deleteMany({ deploymentId: dep._id });
            await Subscription.deleteMany({ deploymentId: dep._id });
            await RenewalRecord.deleteMany({ deploymentId: dep._id });
        }
        await Deployment.deleteMany({ customerId: id });
        await RenewalRecord.deleteMany({ customerId: id });

        return res.status(200).json({
            success: true,
            message: "Customer and associated resources deleted successfully.",
            data: customer
        });

    } catch (error) {
        console.error("Delete customer error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}
