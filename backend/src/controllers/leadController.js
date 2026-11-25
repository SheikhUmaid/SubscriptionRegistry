import mongoose from "mongoose";
import Lead, { LEAD_STATUSES, PITCH_OPTIONS } from "../models/Lead.js";

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Normalise to +91XXXXXXXXXX, matching the landing page's own validation.
function normalisePhone(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

// Public: called by the landing page form. No auth.
export async function createLead(req, res) {
    try {
        const body = req.body || {};

        // Honeypot field: real visitors never fill it. Pretend success for bots.
        if (str(body.website, 200)) {
            return res.status(201).json({ success: true, message: "Request received." });
        }

        const lead = {
            name: str(body.name, 80),
            phone: normalisePhone(body.phone),
            business: str(body.business, 120),
            city: str(body.city, 80),
            pitches: str(body.pitches, 10),
            message: str(body.message, 1000),
            plan: str(body.plan, 60),
            source: str(body.source, 60) || "website",
            page: str(body.page, 500),
        };

        const errors = [];
        if (lead.name.length < 2) errors.push("name");
        if (!lead.phone) errors.push("phone");
        if (lead.business.length < 2) errors.push("business");
        if (lead.city.length < 2) errors.push("city");
        if (!PITCH_OPTIONS.includes(lead.pitches)) errors.push("pitches");

        if (errors.length) {
            return res.status(400).json({
                success: false,
                message: `Invalid or missing fields: ${errors.join(", ")}.`,
            });
        }

        const created = await Lead.create(lead);

        return res.status(201).json({
            success: true,
            message: "Request received.",
            data: { id: created._id },
        });
    } catch (error) {
        console.error("Create lead error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

// Admin: list leads, newest first. Optional ?status=new
export async function getLeads(req, res) {
    try {
        const filter = {};
        if (req.query.status && LEAD_STATUSES.includes(req.query.status)) {
            filter.status = req.query.status;
        }

        const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(1000);

        return res.status(200).json({ success: true, data: leads });
    } catch (error) {
        console.error("Get leads error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

// Admin: update status and/or internal notes.
export async function updateLead(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid lead id." });
        }

        const update = {};
        if (req.body?.status !== undefined) {
            if (!LEAD_STATUSES.includes(req.body.status)) {
                return res.status(400).json({ success: false, message: "Invalid status." });
            }
            update.status = req.body.status;
        }
        if (req.body?.notes !== undefined) {
            update.notes = str(req.body.notes, 2000);
        }

        const lead = await Lead.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!lead) {
            return res.status(404).json({ success: false, message: "Lead not found." });
        }

        return res.status(200).json({ success: true, message: "Lead updated.", data: lead });
    } catch (error) {
        console.error("Update lead error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

// Admin: permanently delete a lead.
export async function deleteLead(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid lead id." });
        }

        const lead = await Lead.findByIdAndDelete(id);
        if (!lead) {
            return res.status(404).json({ success: false, message: "Lead not found." });
        }

        return res.status(200).json({ success: true, message: "Lead deleted." });
    } catch (error) {
        console.error("Delete lead error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}
