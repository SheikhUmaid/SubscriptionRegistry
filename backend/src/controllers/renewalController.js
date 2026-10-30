
import RenewalRecord from "../models/RenewalRecord.js";

export async function getRenewals(req, res) {
    try {
        const { deploymentId, customerId } = req.query;

        const filter = {};

        if (deploymentId) filter.deploymentId = deploymentId;
        if (customerId) filter.customerId = customerId;

        const renewals = await RenewalRecord.find(filter)
            .populate("customerId", "customerCode businessName")
            .populate("deploymentId", "deploymentCode")
            .populate("subscriptionId", "planCode")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: renewals.length,
            data: renewals
        });

    } catch (error) {
        console.error("Get renewals error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

export async function deleteRenewal(req, res) {
    try {
        const { id } = req.params;

        const renewal = await RenewalRecord.findByIdAndDelete(id);

        if (!renewal) {
            return res.status(404).json({
                success: false,
                message: "Renewal record not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Renewal record deleted successfully.",
            data: renewal
        });

    } catch (error) {
        console.error("Delete renewal error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}
