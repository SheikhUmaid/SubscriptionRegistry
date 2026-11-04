import PlanRequest from "../models/PlanRequest.js";
import Subscription from "../models/Subscription.js";
import Deployment from "../models/Deployment.js";
import { PLANS, PLAN_CODES, isValidPlanCode } from "../config/plans.js";
import { applyRenewal } from "./subscriptionController.js";

// Where venues send plan payments. Set in the registry's .env.
function paymentDetails() {
    const upiId = process.env.PAYMENT_UPI_ID?.trim();
    if (!upiId) return null;
    return {
        upiId,
        payeeName: process.env.PAYMENT_PAYEE_NAME?.trim() || "Zinth Labs"
    };
}

const publicPlan = (plan) => ({
    code: plan.code,
    name: plan.name,
    label: plan.label,
    tagline: plan.tagline,
    price: plan.price,
    currency: plan.currency,
    interval: plan.interval,
    highlights: plan.highlights,
    includes: plan.includes || null,
    limits: plan.limits,
    features: plan.features
});

const publicRequest = (r) =>
    r && {
        id: r._id,
        requestedPlanCode: r.requestedPlanCode,
        requestedPlanName: PLANS[r.requestedPlanCode]?.name || r.requestedPlanCode,
        amount: r.amount,
        currency: r.currency,
        paymentReference: r.paymentReference,
        status: r.status,
        resolutionNote: r.resolutionNote,
        createdAt: r.createdAt,
        resolvedAt: r.resolvedAt
    };

// ---------------------------------------------------------------------------
// Deployment-facing (API key auth)
// ---------------------------------------------------------------------------

/** GET /api/registry/plans — plan options, payment details and the latest request. */
export async function getPlanOptions(req, res) {
    try {
        const [subscription, latestRequest] = await Promise.all([
            Subscription.findOne({ deploymentId: req.deployment._id }),
            PlanRequest.findOne({ deploymentId: req.deployment._id }).sort({ createdAt: -1 })
        ]);

        return res.status(200).json({
            success: true,
            currentPlanCode: subscription?.planCode ?? null,
            plans: PLAN_CODES.map((code) => publicPlan(PLANS[code])),
            payment: paymentDetails(),
            latestRequest: publicRequest(latestRequest)
        });
    } catch (error) {
        console.error("Get plan options error:", error);
        return res.status(500).json({ success: false, message: "Unable to load plans." });
    }
}

/** POST /api/registry/plan-requests — venue has paid and asks for a plan switch/renewal. */
export async function createPlanRequest(req, res) {
    try {
        const { planCode, paymentReference = "", note = "" } = req.body;

        if (!isValidPlanCode(planCode)) {
            return res.status(400).json({
                success: false,
                message: `Invalid plan. Choose one of: ${PLAN_CODES.join(", ")}.`
            });
        }

        const subscription = await Subscription.findOne({ deploymentId: req.deployment._id });
        const plan = PLANS[planCode];

        // One open request per venue: a new one replaces the pending one.
        const request = await PlanRequest.findOneAndUpdate(
            { deploymentId: req.deployment._id, status: "pending" },
            {
                deploymentId: req.deployment._id,
                subscriptionId: subscription?._id ?? null,
                currentPlanCode: subscription?.planCode ?? null,
                requestedPlanCode: planCode,
                amount: plan.price,
                currency: plan.currency,
                paymentReference: String(paymentReference).trim().slice(0, 100),
                note: String(note).trim().slice(0, 500),
                status: "pending"
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        return res.status(201).json({
            success: true,
            message: "Zinth Labs has been notified.",
            request: publicRequest(request)
        });
    } catch (error) {
        console.error("Create plan request error:", error);
        return res.status(500).json({ success: false, message: "Unable to send the request." });
    }
}

// ---------------------------------------------------------------------------
// Zinth Labs admin dashboard
// ---------------------------------------------------------------------------

/** GET /api/plan-requests?status=pending */
export async function getPlanRequests(req, res) {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const requests = await PlanRequest.find(filter)
            .populate({
                path: "deploymentId",
                select: "deploymentCode customerId",
                populate: { path: "customerId", select: "businessName" }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        console.error("Get plan requests error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

/**
 * PATCH /api/plan-requests/:id/approve
 * Payment verified: switch the plan and add 30 days, recording the payment.
 * Body (optional): { amount, paymentMethod, note }
 */
export async function approvePlanRequest(req, res) {
    try {
        const request = await PlanRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }
        if (request.status !== "pending") {
            return res.status(409).json({ success: false, message: `Request is already ${request.status}.` });
        }

        const [subscription, deployment] = await Promise.all([
            Subscription.findOne({ deploymentId: request.deploymentId }),
            Deployment.findById(request.deploymentId)
        ]);

        if (!deployment) {
            return res.status(404).json({ success: false, message: "Deployment not found." });
        }
        if (!subscription) {
            return res.status(409).json({
                success: false,
                message: "This deployment has no subscription yet. Create one first."
            });
        }
        if (subscription.status === "suspended") {
            return res.status(403).json({
                success: false,
                message: "Subscription is suspended. Lift the suspension before approving."
            });
        }

        const plan = PLANS[request.requestedPlanCode];
        const amount = req.body.amount ?? request.amount;
        const note = req.body.note?.trim() || "";

        subscription.planCode = plan.code;
        subscription.price = plan.price;

        const renewalRecord = await applyRenewal(subscription, deployment, {
            amount,
            paymentMethod: req.body.paymentMethod || "upi",
            paymentReference: request.paymentReference,
            notes: `Plan request: ${request.currentPlanCode || "none"} → ${plan.code}${note ? `. ${note}` : ""}`,
            recordedBy: String(req.user?._id || req.user?.id || "admin")
        });

        request.status = "approved";
        request.resolvedAt = new Date();
        request.resolutionNote = note;
        await request.save();

        return res.status(200).json({
            success: true,
            message: `Approved. ${deployment.deploymentCode} is now on ${plan.name} until ${subscription.expiresAt.toDateString()}.`,
            data: { request, subscription, renewalRecord }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This payment reference has already been recorded."
            });
        }
        console.error("Approve plan request error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

/** PATCH /api/plan-requests/:id/reject  Body: { note } — shown to the venue. */
export async function rejectPlanRequest(req, res) {
    try {
        const request = await PlanRequest.findOneAndUpdate(
            { _id: req.params.id, status: "pending" },
            {
                status: "rejected",
                resolvedAt: new Date(),
                resolutionNote: req.body.note?.trim() || ""
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ success: false, message: "Pending request not found." });
        }

        return res.status(200).json({ success: true, message: "Request rejected.", data: request });
    } catch (error) {
        console.error("Reject plan request error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}
