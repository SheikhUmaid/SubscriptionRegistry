
import Subscription from "../models/Subscription.js";
import Deployment from "../models/Deployment.js";
import RenewalRecord from "../models/RenewalRecord.js";

export async function createSubscription(req, res) {
    try {
        const {
            deploymentId,
            planCode = "monthly",
            startsAt = new Date(),
            expiresAt,
            price,
            currency = "INR"
        } = req.body;

        if (!deploymentId || !expiresAt || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Required subscription details are missing."
            });
        }

        const deployment = await Deployment.findById(deploymentId);

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found."
            });
        }

        const existingSubscription = await Subscription.findOne({
            deploymentId
        });

        if (existingSubscription) {
            return res.status(409).json({
                success: false,
                message: "This deployment already has a subscription."
            });
        }

        const subscription = await Subscription.create({
            deploymentId,
            planCode,
            status: new Date(expiresAt) > new Date() ? "active" : "expired",
            startsAt,
            expiresAt,
            price,
            currency
        });

        return res.status(201).json({
            success: true,
            message: "Subscription created successfully.",
            data: subscription
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Subscription already exists."
            });
        }

        console.error("Create subscription error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}


export async function getSubscriptions(req, res) {
    try {
        const subscriptions = await Subscription.find()
            .populate("deploymentId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });

    } catch (error) {
        console.error("Get subscriptions error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}


export async function extendSubscription(req, res) {
    try {
        const { id } = req.params;
        const {
            amount,
            paymentMethod = "upi",
            paymentReference,
            notes = ""
        } = req.body;

        if (amount === undefined || Number(amount) < 0) {
            return res.status(400).json({
                success: false,
                message: "A valid renewal amount is required."
            });
        }

        const subscription = await Subscription.findById(id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found."
            });
        }

        if (subscription.status === "suspended") {
            return res.status(403).json({
                success: false,
                message: "Suspended subscriptions cannot be renewed."
            });
        }

        const now = new Date();

        // Preserve remaining subscription time when renewing early.
        const periodStartsAt =
            subscription.expiresAt > now
                ? subscription.expiresAt
                : now;

        const periodEndsAt = new Date(periodStartsAt);
        periodEndsAt.setDate(periodEndsAt.getDate() + 30);

        const deployment = await Deployment.findById(
            subscription.deploymentId
        );

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Associated deployment not found."
            });
        }

        // Record the renewal after payment has been verified by admin.
        const renewalRecord = await RenewalRecord.create({
            customerId: deployment.customerId,
            deploymentId: deployment._id,
            subscriptionId: subscription._id,
            type: "renewal",
            amount: Number(amount),
            currency: subscription.currency,
            paymentStatus: "confirmed",
            paymentMethod,
            paymentReference,
            periodStartsAt,
            periodEndsAt,
            recordedBy: String(
                req.user?._id || req.user?.id || "admin"
            ),
            notes
        });

        subscription.expiresAt = periodEndsAt;
        subscription.status = "active";

        await subscription.save();

        return res.status(200).json({
            success: true,
            message: "Subscription extended successfully.",
            data: {
                subscription,
                renewalRecord
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This payment reference has already been recorded."
            });
        }

        console.error("Extend subscription error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}


export async function suspendSubscription(req, res) {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findByIdAndUpdate(
            id,
            { status: "suspended" },
            { new: true, runValidators: true }
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subscription suspended successfully.",
            data: subscription
        });

    } catch (error) {
        console.error("Suspend subscription error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

export async function deleteSubscription(req, res) {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findByIdAndDelete(id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found."
            });
        }

        await RenewalRecord.deleteMany({ subscriptionId: id });

        return res.status(200).json({
            success: true,
            message: "Subscription deleted successfully.",
            data: subscription
        });

    } catch (error) {
        console.error("Delete subscription error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}
