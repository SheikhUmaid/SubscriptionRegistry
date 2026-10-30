
import Subscription from "../models/Subscription.js";
import Customer from "../models/Customer.js";

export async function getRegistryStatus(req, res) {
    try {
        const deployment = req.deployment;

        const [customer, subscription] = await Promise.all([
            Customer.findById(deployment.customerId),
            Subscription.findOne({
                deploymentId: deployment._id
            })
        ]);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        if (!subscription) {
            return res.status(200).json({
                success: true,
                status: "expired",
                bookingEnabled: false,
                message: "No active subscription found."
            });
        }

        let status = subscription.status;

        if (customer.accountStatus === "suspended") {
            status = "suspended";
        } else if (subscription.status === "suspended") {
            status = "suspended";
        } else if (new Date() >= subscription.expiresAt) {
            status = "expired";
        } else if (new Date() < subscription.startsAt) {
            status = "expired";
        } else {
            status = "active";
        }

        return res.status(200).json({
            success: true,
            deploymentId: deployment.deploymentCode,
            customerName: customer.businessName,
            status,
            bookingEnabled: status === "active",
            expiresAt: subscription.expiresAt,
            message: status === "active"
                ? "Subscription is active."
                : "Booking service is unavailable."
        });

    } catch (error) {
        console.error("Registry status error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve subscription status."
        });
    }
}
