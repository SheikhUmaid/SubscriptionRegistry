import express from "express";
import { createLead, getLeads, updateLead, deleteLead } from "../controllers/leadController.js";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// Simple per-instance rate limit for the public form endpoint.
const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function limitSubmissions(req, res, next) {
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || "unknown";
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);

    if (recent.length >= MAX_PER_WINDOW) {
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later.",
        });
    }

    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    next();
}

// Public: landing page form submissions
router.post("/", limitSubmissions, createLead);

// Admin only
router.get("/", adminAuthMiddleware, getLeads);
router.patch("/:id", adminAuthMiddleware, updateLead);
router.delete("/:id", adminAuthMiddleware, deleteLead);

export default router;
