import express from "express";

import {
    getPlanRequests,
    approvePlanRequest,
    rejectPlanRequest
} from "../controllers/planRequestController.js";

const router = express.Router();

router.get("/", getPlanRequests);
router.patch("/:id/approve", approvePlanRequest);
router.patch("/:id/reject", rejectPlanRequest);

export default router;
